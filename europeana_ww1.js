//namespace
var EWW1={
    //the following presumes we know in advance that the limit of a europeana query is RESULT_LIMIT -- although we could be more elegant and get this from a pre-query?
    RESULT_LIMIT: 12,

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

    list_categories: function(){
	var html = "<ul>";
	for (var cat in this.categories){
	    html+= "<li><a href='#categories'>" + cat + "</a></li>";
	}
	return html + "</ul>";
    },

    //UI functions
    visible_stories: {},

    display_categories: function(){
	document.getElementById("categories").style.display = "block";
	document.getElementById("stories").style.display = "none";
	document.getElementById("full_story").innerHTML = "";
    },

    display_stories: function(){
	document.getElementById("categories").style.display = "none";
	document.getElementById("stories").style.display = "block";
	document.getElementById("full_story").innerHTML = "";
	
    },

    display_full_story: function(id, element, hide){
	hide = hide || [];
	for (var i = 0; i < hide.length; i++){
	    document.getElementById(hide[i]).style.display = "none";
	}
	
	var html = "<a href='#stories' onClick='EWW1.display_stories()'>Back to stories</a>";
	var story = EWW1.visible_stories[id].story;
	var items = EWW1.visible_stories[id].story_items;
	html += "<h1>" + story["dc:title"] + "</h1>";
	html += "<h2>Contributor</h2>" + story["dc:contributor"];
	html += "<h2>Additional Information</h2>" + story["dc:description"];
	html += "<h2>Summary description of items</h2>" + story["dc:description"];
	html += "<h2>Date created</h2>" + story["dc:date"];//dc:temporal
	html += "<h2>Language</h2>" + story["dc:language"];
	html += "<h2>Keywords</h2>" + story["dc:subject"];
	html += "<h2>Theatres of War</h2>" + story["dc:coverage"];
	html += "<p>";
	for (var i = 0; i < items.length; i++){
	    if (items[i].enclosure.match(/(jpg|bmp|png)/i)){
		html += "<img src='" + EWW1.imageSize.thumb(items[i].enclosure) + "'>";
	    }
	}
	html += "</p>";
	document.getElementById(element).innerHTML = html;
    },

    //API Query utility functions

    query_parts: {
	base: "http://api.europeana.eu/api/opensearch.json?searchTerms=",
	ww1_collection: "europeana_collectionName:2020601_Ag_ErsterWeltkrieg_EU",
	key: "wskey=ZICPOGYUWT"
    },

    story_link: function(base){
	//different fields are used depending on full or short query
	return base.enclosure || base["europeana:object"];
    },

    category_metadata_field: function(category){
	return this.categories[category];
    },

    decode: function(str){
	return decodeURI(str).replace(/%3A/g, ":");
    },

    format_for_query: function(str){
	var rawstr = str.replace(/ /g, "+");
	if (arguments[1]) {return rawstr;}
	else {return "'" + rawstr + "'";}
    },

    returnData: {
	to: function(str, querytype){
	    if (str.match(/\.(html|json|rss)$/i)){
		return str.replace(/\.[^\.]*$/, querytype);
	    } else {
		return str + "." + querytype
	    }
	},
	JSON: function(str){return this.to(str, "json");},
	HTML: function(str){return this.to(str, "html");},
	RSS: function(str){return this.to(str, "rss");}
    },

    imageSize: {
	to: function(str, size){
	    return str.replace(/\.[^\.]*.(jpg|bmp|pdf)$/i, "." + size + ".$1");},
	full: function(str){return this.to(str, "full");},
	thumb: function(str){return this.to(str, "thumb");},
	original: function(str){return this.to(str, "original");},
	medium: function(str){return this.to(str, "medium");}
    },

    //API Queries

    queries: {
	full_record: function(record){
	    return record + "?" + EWW1.query_parts.key;
	},

	search: function(keyword){
	    var search = EWW1.query_parts.base + keyword + "+" +
	    EWW1.query_parts.ww1_collection + "&" + 
	    EWW1.query_parts.key;
	    console.log("issuing " +search);
	    return search;
	},

	page: function(query,page){
	    if(!query.match(/&wskey=/)) {query = query + "&" + EWW1.query_parts.key;}
	    var start = "&startPage=" + page;
	    if (query.match(/startPage=/)){return query.replace(/&startPage=[0-9]+/, start);}
	    else {return query + start;}
	},

	category_entries: function(category){
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
	var ag;
	var options = arguments[2] || {};
	options.limit = options.limit || this.RESULT_LIMIT;
	if (!options.aggregator && 
	    (options.full || options.limit > this.RESULT_LIMIT)
	    ){
	    options.aggregator = new EWW1.Aggregator(options.limit, callback, options);
	    callback = options.aggregator.callback;
	}

	var ajax_options = {dataType: "jsonp", success: callback};

	if(options.aggregator){
	    console.log("aggregating");
	    ajax_options.context = options.aggregator;
	}
	else {ajax_options.context = options.context}

	$.ajax(str, ajax_options);
    },

    //Aggregator to solve the problem of europeana only returning RESULT_LIMIT results at a time maximum

    Aggregator: function(number, callback){
	options = arguments[2] || {};
	//do several queries and store results here
	this.results = [];
	//optional store for full records
	this.full_records = [];
	this.limit = number;
	this.detail = options.full;

	//when finished, tell aggregator to call the callback from the original query
	this.complete = callback;
	this.complete_context = options.context;

	var methods = EWW1.Aggregator_methods;
	for (var method in methods){
	    this[method] = methods[method];
	}
    },

    Aggregator_methods: {
	callback: function(data){
	    data = data.items ? data : {items: [data]};
	    this.results.push(data);
	    this.itemsSoFar = this.results.length*data.itemsPerPage;
	    if (data.totalResults < this.limit){this.limit = data.totalResults;}

	    if (this.detail){this.get_detail(data);}

	    if (this.itemsSoFar < this.limit && this.limit > this.itemsSoFar){
		EWW1.query(EWW1.queries.page(EWW1.format_for_query(EWW1.decode(data.link),"strip"), this.results.length + 1), this.callback, {aggregator: this});
	    }
	    else {
		if (!this.detail){this.complete.call(this.complete_context, this.aggregate());}
	    }
	},
	
	get_detail: function(data){
	    console.log("fetch " + data.items.length + " records");
	    for (var i=0; i < data.items.length; i++){
		EWW1.query(data.items[i].link, this.full_callback, {aggregator: this});
	    }
	},

	full_callback: function(data){
	    this.full_records.push(data);

	    if (this.full_records.length == this.itemsSoFar && 
		this.itemsSoFar == this.limit)
		{
		    this.complete.call(this.complete_context, {items: this.full_records});
		}
	},

	aggregate: function(){
	    if (!this.aggregated_results){
		this.aggregated_results = jQuery.extend({},this.results[0]);
		this.aggregated_results.items = [];
		for (var i = 0; i < this.results.length; i++){
		    for (var j = 0; j<this.results[i].items.length; j++){
			this.aggregated_results.items.splice(this.aggregated_results.items.length, 0, this.results[i].items[j]);
		    }
		}
		this.aggregated_results.itemsPerPage *= (this.results.length);
	    }
	    return this.aggregated_results;
	}
    },

    //callbacks for handling results of queries

    callbacks: {
	map_stories: function(data) {
	    if (!data.items){data = {items: [data]};}
	    //	    console.log(data.items);
	    if(this.render_into){
		var stories = document.getElementById(this.render_into);
		var html = "<ul>";
		for (var i = 0; i < data.items.length; i++){
		    var story = EWW1.story_link(data.items[i]);
		    html += "<li id='" + story + "'>" + story + "</li>";
		}
		stories.innerHTML = html + "</ul>";
	    }
	    for (var i = 0; i < data.items.length; i++){
		var story = EWW1.story_link(data.items[i]);
		EWW1.query(EWW1.queries.story_entries(story), this.passthrough_callback, {full: this.full, context: data.items[i]});
	    }
	},

	render_story_summary: function(data) {
	    console.log(data);
	    //find an image
	    var match, i;
	    for (var i = 0; i < data.items.length; i++){
		var enc = data.items[i].enclosure;
		if (enc.match(/(jpg|bmp|png)/i)){
		    match = i;
		    break;
		}
	    }
	    if(match == i){
		var m = data.items[match];
		var uri = EWW1.imageSize.thumb(m.enclosure);
	    } 
	    else {uri = "http://www.europeana1914-1918.eu/images/style/icons/mimetypes/pdf.png?1325158438";}
	    //	    var full_story = "EWW1.queries.story_entries(" + this["europeana:uri"] + "), EWW1.callbacks.map_stories, {full: true, context: {passthough_callback: EWW1.callbacks.render_full_story}})";
	    var id = EWW1.story_link(this);
	    var full_story = "EWW1.display_full_story(\"" + id + "\", \"full_story\", [\"categories\", \"stories\"]);";

	    var element = document.getElementById(id);
	    element.innerHTML = "<a href='#stories' onClick='" + full_story + "'><img src='" + uri + "' alt='" + uri + "'></a><p>" + this["dc:title"] + "</p>" + "<p>" + this["dcterms:alternative"] + "</p>";
	    EWW1.visible_stories[id] = {story: this, story_items: data.items};

	},

	render_full_story: function(data) {
	    //todo: replace "full_story" with customisable id
	    EWW1.visible_stories["full_story"] = {story: this, story_items: data.items};
	    EWW1.display_full_story("full_story", "full_story");
	},

	summary_info: function(data) {
	    console.log(data);
	    var html = "<ul>";
	    for (var i = 0; i < data.items.length; i++){
		var item = data.items[i];
		var uri = EWW1.imageSize.thumb(item.enclosure);
		html += "<li><img src='" + uri + "'/><br/>" + item.title + "</li>";
	    }
	    var element = document.getElementById('stories');
	    element.innerHTML = html + "</ul>";
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
	    this.query(this.queries.page(data.link,page), this.random_result)
	},

	random_result: function(data){
	    var result = Math.floor(Math.rand(data.itemsPerPage));
	    var result_record = data.items[result].guid;
	    this.query(this.queries.full_record(result_record), this.logResults);
	}

    }

};