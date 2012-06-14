//namespace
var EWW1={
    //todo: check these all give same numbers as categories on web front end
    categories: {
	"Western Front": "dc_coverage",
	"Eastern Front": "dc_coverage",
	"Italian Front": "dc_coverage",
	"Home Front": "dc_coverage",
	"Trench Life": "dc_subject",
	"Aerial Warfare": "dc_subject",
	"Naval Warfare": "dc_subject",
	"Prisoners of War": "dc_subject",
	"Propaganda": "dc_subject",
	"Remembrance": "dc_subject",
	"Women": "dc_subject",
	"Official Documents": "dc_subject",
	"Photograph": "dc_subject",
	"Postcards": "dc_subject",
	"Diaries": "dc_subject",
	"Letters": "dc_type"
    },

    query_parts: {
	base: "http://api.europeana.eu/api/opensearch.json?searchTerms=",
	ww1_collection: "europeana_collectionName:2020601_Ag_ErsterWeltkrieg_EU",
	key: "wskey=ZICPOGYUWT"
    },

    category_metadata_field: function(category){
	return this.categories[category];
    },

    format_for_query: function(str){
	return "'" + str.replace(/ /g, "+") + "'";
    },

    queries: {
	full_record: function(record){
	    return record + "?" + EWW1.query_parts.key;
	},

	page: function(page){
	    var page_part = page ? "startPage=" + page + "&" : "";
	    var stories_part = arguments[1] ? "dc_type:story+" : "";
	    return EWW1.query_parts.base + 
	    stories_part +
	    EWW1.query_parts.ww1_collection + "&" + 
	    page +
	    EWW1.query_parts.key;
	    
	},

	category_entries: function(category, page){
	    var stories_part = arguments[1] ? "dc_type:story+" : "";
	    return EWW1.query_parts.base + 
	    EWW1.category_metadata_field(category) + ":" + 
	    EWW1.format_for_query(category) + "+" +
	    stories_part +
	    EWW1.query_parts.ww1_collection + "&" + 
	    EWW1.query_parts.key;
	},
	
	story_entries: function(story){
	    return EWW1.query_parts.base + 
	    "dc_relation:\"" + encodeURI(story) + "\"+" +
	    EWW1.query_parts.ww1_collection + "&" + 
	    EWW1.query_parts.key;
	}
    },

    query: function(str, callback){
	$.ajax(str, {
		dataType: "jsonp",
		success: callback
	    });
    },

    logResults: function( data ) {
	if ( window.console && console.log ) {
            if ( data ) {
		console.log( data );
		if ( data.totalResults ) {
		    console.log( 'total results : ' + data.totalResults );
		}
            }
	}
    },

    random_page: function(data){
	var page = Math.floor(Math.rand(Math.ceil(data.totalResults/data.itemsPerPage)));
	this.query(this.queries.page(page), this.random_result)
    },

    random_result: function(data){
	var result = Math.floor(Math.rand(data.itemsPerPage));
	var result_record = data.items[result].guid;
	this.query(this.queries.full_record(result_record), this.logResults);
    },

    returnedData: {
	to: function(str, querytype){return str.replace(/\.[^\.]*$/, querytype);},
	JSON: function(str){return this.to(str, "json");},
	HTML: function(str){return this.to(str, "html");},
	RSS: function(str){return this.to(str, "rss");}
    },

    imageSize: {
	to: function(str, size){return str.replace(/\.[^\.]*.jpg$/i, size);},
	full: function(str){return this.to(str, "full");},
	thumb: function(str){return this.to(str, "thumb");},
	original: function(str){return this.to(str, "original");},
	medium: function(str){return this.to(str, "medium");}
    }
};