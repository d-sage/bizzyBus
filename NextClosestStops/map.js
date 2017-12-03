//------------------------------------------------------------------------------------
//This example is taken from google and adapted
//Original: https://developers.google.com/maps/documentation/javascript/geolocation
//------------------------------------------------------------------------------------

// Note: This example requires that you consent to location sharing when
// prompted by your browser. If you see the error "The Geolocation service
// failed.", it means you probably did not give permission for the browser to
// locate you.

$(document).ready(init);

function init()
{
	$("#infoDiv").hide();
	
	$("#closeInfo").click(function(){
		$("#infoDiv").hide();
	});
	
	//Used for resizing the map to fit the maximum of the screen
	$("#map").height($(window).height());
	$(window).resize(function(evt){
		console.log(evt);
		$("#map").height($(window).height());
	});
}

var transitlandURL = "https://transit.land/api/v1/stops.geojson";

var map, infoWindow, home;
var markers = [];
function initMap() 
{
  map = new google.maps.Map(document.getElementById('map'), 
  {
    center: {lat: -34.397, lng: 150.644},
    zoom: 6
  });

  infoWindow = new google.maps.InfoWindow;

  // Try HTML5 geolocation.
  if (navigator.geolocation) 
  {
    navigator.geolocation.getCurrentPosition(function(position) 
    {
      var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      console.log(pos);

      home = new google.maps.Marker(
      {
        map:map,
        draggable:true,
        animation: google.maps.Animation.DROP,
        position:pos,
        icon: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
        title: "Current Location"
      });


      //This is for the drag event, its not implemented yet
      google.maps.event.addListener(home, 'dragend', dragFunction);


      map.setZoom(15);
      //console.log(map.getZoom());
      map.setCenter(pos);

      getBuses(pos);

    }, function() 
    {
      handleLocationError(true, infoWindow, map.getCenter());
    });
  } 
  else 
  {
    // Browser doesn't support Geolocation
    handleLocationError(false, infoWindow, map.getCenter());
  }

}//end initMap

function handleLocationError(browserHasGeolocation, infoWindow, pos) 
{
  infoWindow.setPosition(pos);
  infoWindow.setContent(browserHasGeolocation ?
                        'Error: The Geolocation service failed.' :
                        'Error: Your browser doesn\'t support geolocation.');
  infoWindow.open(map);
}

//Makes the ajax call for the nearest bus stops
function getBuses(pos)
{

  var perPage = 1000;     //Results per query
  var radius = 1000;    //Radius around point

  var lng = pos["lng"];
  var lat = pos["lat"];

  $.ajax(
  {
    url: transitlandURL, 
    type: "GET",
    data: 
    {
      lat: lat,
      lon: lng,
      r: radius,
      per_page: perPage
    },
    success: processData,
    error: AjaxError
  }); 

}


//ProcessData creates the pins for the stops if the JSON comes back properly
//Currently it just sets the "name" attribute as a pop-up title
//It can be changed to a written out message of the name instead of the pin as well, either should be clickable

//I personally prefer the pins. The infoWindows overlap each other

function processData(data)
{
  console.log(data);

  for (var i = 0; i < data["features"].length; i ++)
  {
    var lat = data["features"][i]["geometry"]["coordinates"][1];
    var lon = data["features"][i]["geometry"]["coordinates"][0];

    var stopPos = 
    {
      lat: lat,
      lng: lon
    };

    var title = data["features"][i]["properties"]["name"];
	
	//Collect Route info
	var routeList = data.features[i].properties.routes_serving_stop;
	var routeNums = "";
	var routeIds = "";
	$.each(routeList, function(index, item){
		routeNums += item.route_name + " ";
		routeIds += item.route_onestop_id + " ";
	});
	
	var osm_way_id = data.features[i].properties.tags.osm_way_id;
	var onestop_id = data.features[i].properties.onestop_id;

//--------------- Pin- comment this out for infoWindow

	//See function for details
	placeStopMarker(stopPos, title, osm_way_id, onestop_id, routeIds, routeNums);
	
//--------------------

    //This is for the info windows, just uncomment the following and comment out the marker above
	/*
    var stop = new google.maps.InfoWindow;
    stop.setPosition(stopPos);
    stop.setContent(title);
    stop.open(map);
	*/

  }


}

//This function allows for stopPos(lat/lng) and other components
//to be used to create a busStop marker with related events to display info: click & mouseover
function placeStopMarker(stopPos, title, osm_way_id, onestop_id, routeIds, routeNums)
{
	
	//Creates the initial Marker with provided information
	var marker = new google.maps.Marker(
    {
      map:map,
      draggable:false,
      animation: google.maps.Animation.DROP,
      position:stopPos,
      title: title,
	  customInfo: "osm_way_id: " + osm_way_id + " | Route #'s: " + routeNums + " | Route Ids: " + routeIds + " | onestop_id: " + onestop_id
    });

    //This is to set up the click event for selecting a stop
    //marker.addListener('click', stopClicked);
	google.maps.event.addListener(marker, "click", function(event){
		console.log("Lat: " + this.position.lat());
		console.log("Lng: " + this.position.lng());
		console.log(this.customInfo);
		
		var infoDiv = $("#infoDiv");
		$("#lower").html("<p>" + this.customInfo + "</p>");
		$(infoDiv).show();
	});
	
	//These mouseover/mouseout events deal with displaying info pertaining to the Stop above the marker
	google.maps.event.addListener(marker, "mouseover", function(event){
		infoWindow.setContent(this.customInfo);
		infoWindow.open(map,this);
	});
	google.maps.event.addListener(marker, "mouseout", function(event){
		infoWindow.close();
	});
	
    markers.push(marker);
}

function AjaxError(data)
{
  console.log(data);
  console.log("AjaxError was hit");
}

function stopClicked(data, other)
{
  
}

function dragFunction(data)
{
	var pos = {
        lat: home.getPosition().lat(),
        lng: home.getPosition().lng()
    };
    
    for (var i = 0; i < markers.length; i++) 
    {
        markers[i].setMap(null);
    }
    markers = [];

    getBuses(pos);
}


