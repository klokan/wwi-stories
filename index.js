// Getting the parameters passed to the page

function getParameterByName(name) {
    ips = window.location.toString();
    var match = RegExp('[?&]' + name + '=([^&]*)').exec(ips);
    return match && decodeURIComponent(match[1].replace(/\+/g, ' '));

}

// #story

$('#story').live("pageshow", function() {
	$('#story-content').html( '<p style="text-align:center;">Loading...</p>' );
	var story= 'http://www.europeana.eu/portal/record/' + getParameterByName('id').replace('-', '/');
	$('#story-content').html( story );
	story = EWW1.returnData.JSON(story);
	EWW1.query(EWW1.queries.full_record(story), EWW1.callbacks.map_stories, {context: {passthrough_callback: EWW1.callbacks.render_full_story, passthrough_into: "full_story"}});
});


// #map

var map;

function map_initialize () {
	var brooklyn = new google.maps.LatLng(40.6743890, -73.9455);
	var stylez = [
	    {
	      featureType: "all",
	      elementType: "all",
	      stylers: [
	        { saturation: -100 } 
	      ]
	    }
	];
	var mapOptions = {
	    zoom: 11,
	    center: brooklyn,
	    mapTypeControl: false,
	    scaleControl: false,
	    streetViewControl: false,
	    overviewMapControl: false
	};
	map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);
	var mapType = new google.maps.StyledMapType(stylez, { name:"Grayscale" });    
	map.mapTypes.set('gray', mapType);
	map.setMapTypeId('gray');
}

$('#map').live("pageshow", function() {
	if (map == null) {
		map_initialize();
	} else {
		google.maps.event.trigger(map, 'resize');
	}
});

