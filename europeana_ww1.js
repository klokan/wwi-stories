//namespace
var EWW1={
    //the following presumes we know in advance that the limit of a europeana query is RESULT_LIMIT -- although we could be more elegant and get this from a pre-query?
    RESULT_LIMIT: 12,

    //todo: check these all give same numbers as categories on web front end
    categories: {
	"Western Front": {meta: "dc_coverage", image: "http://4.bp.blogspot.com/-c7UBIGqWYvs/T6eI0uiEyAI/AAAAAAAAAFQ/Tu_EhycGoI4/s400/Western-Front.png"},
	"Eastern Front": {meta: "dc_coverage", image: "http://3.bp.blogspot.com/-N_Dj07JXaAA/T6eBnvzDaXI/AAAAAAAAACc/38uB8W8_JfU/s400/Eastern-Front.png"},
	"Italian Front": {meta: "dc_coverage", image: "http://3.bp.blogspot.com/-bC2Vb214u9Q/T6eErG2VMnI/AAAAAAAAADY/rENihcJ-86o/s400/Italian-Front.png"},
	"Home Front": {meta: "dc_coverage", image: "http://3.bp.blogspot.com/-_M0atLcPEsE/T6eEKNu5OJI/AAAAAAAAADA/mTDXWZ4D0l4/s400/Home-Front.png"},
	"Trench Life": {meta: "dc_subject", image: "http://2.bp.blogspot.com/-GnAQiaZRtFs/T6eA80jxX_I/AAAAAAAAACQ/szYr90F2avA/s400/Trench-Life.png"},
	"Aerial Warfare": {meta: "dc_subject", image: "http://2.bp.blogspot.com/-xj6OWxD_BGo/T6eDhhc-HDI/AAAAAAAAAC0/Feq4ZZHryfM/s400/Aerial-Warfare.png"},
	"Naval Warfare": {meta: "dc_subject", image: "http://1.bp.blogspot.com/-JZrxu8DTQNg/T6eFbsGRrRI/AAAAAAAAADw/qlsSj5HulxM/s400/Naval-Warfare.png"},
	"Prisoners of War": {meta: "dc_subject", image: "http://2.bp.blogspot.com/-qCq9O3ld0k8/T6eZJHDcL4I/AAAAAAAAAFg/V29lCFNTK80/s400/Prisoners-of-War.png"},
	"Propaganda": {meta: "dc_subject", image: "http://3.bp.blogspot.com/-tmLXikVpz3U/T6eHaOmlDNI/AAAAAAAAAEs/pmf2IIOig5A/s400/Propaganda.png"},
	"Remembrance": {meta: "dc_subject", image: "http://4.bp.blogspot.com/-USCw8Rv7dBI/T6eH89x3J4I/AAAAAAAAAE4/OPd1A1RYY6o/s400/Remembrance.png"},
	"Women": {meta: "dc_subject", image: "http://1.bp.blogspot.com/-2oktvtwOH5U/T6eIX6mkK8I/AAAAAAAAAFE/IXihuifiwQE/s400/Women.png"},
	"Official Documents": {meta: "dc_subject", image: "http://1.bp.blogspot.com/-vUwXf9SG61k/T6eF9fv6e6I/AAAAAAAAAD8/o98TGxOmzkg/s400/Official-Documents.png"},
	"Photograph": {meta: "dc_subject", image: "http://2.bp.blogspot.com/-0wfJBIv7BP0/T6eGWG-Y56I/AAAAAAAAAEI/hHUE9IWrR0A/s400/Photographs.png"},
	"Postcards": {meta: "dc_subject", image: "http://4.bp.blogspot.com/-ROdrZTxsIY0/T6eGnh_QGEI/AAAAAAAAAEU/Ph9mxtCckzs/s400/Postcards.png"},
	"Diaries": {meta: "dc_subject", image: "http://2.bp.blogspot.com/-XrtopQBYg4Y/T6eCPPccSDI/AAAAAAAAACo/frimwbe_p7s/s400/Diaries.png"},
	"Letters": {meta: "dc_type", image: "http://4.bp.blogspot.com/-tvrk_OjtN2M/T6eFINNSKMI/AAAAAAAAADk/AMTnZnkWMjY/s400/Letters.png"},
    },

    list_categories: function(){
	var html = "<ul>";
	for (var cat in this.categories){
	    html+= "<li><a href='#categories'><img src='" + this.categories[cat].image + "'/><br/>" + cat + "</a></li>";
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
	return this.categories[category].meta;
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
	    if(!record.match(/\?wskey=/)) {record = record + "?" + EWW1.query_parts.key;}
	    return record;
	},

	all_stories: function(){
	    var search = EWW1.query_parts.base + "dc_type:story+" +
	    EWW1.query_parts.ww1_collection + "&" + 
	    EWW1.query_parts.key;
	    console.log("issuing " +search);
	    return search;
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
	    var query = EWW1.query_parts.base + 
	    EWW1.category_metadata_field(category) + ":" + 
	    EWW1.format_for_query(category) + "+" +
	    stories_part +
	    EWW1.query_parts.ww1_collection + "&" + 
	    EWW1.query_parts.key;
	    return query;
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

	random_page: function(data){
	    var page = Math.floor(Math.random() * Math.ceil(data.totalResults/data.itemsPerPage) );
	    EWW1.query(EWW1.queries.page(data.link,page), EWW1.callbacks.random_result);
	},

	random_result: function(data){
	    var result = Math.floor(Math.random() * data.itemsPerPage);
	    var result_record = data.items[result].link;
	    EWW1.query(EWW1.queries.full_record(result_record), EWW1.callbacks.map_stories, {context: {passthrough_callback: EWW1.callbacks.render_full_story, passthrough_into: "full_story"}});
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
	}
    }
};