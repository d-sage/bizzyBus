//------------------------------------------------------------------------------------
//This example is taken from google and adapted
//Original: https://developers.google.com/maps/documentation/javascript/geolocation
//------------------------------------------------------------------------------------

// Note: This example requires that you consent to location sharing when
// prompted by your browser. If you see the error "The Geolocation service
// failed.", it means you probably did not give permission for the browser to
// locate you.


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

  //console.log(lat + " | " + lng);

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
    var long = data["features"][i]["geometry"]["coordinates"][0];

    //console.log(lat + " | " + long);

    var stopPos = 
    {
      lat: lat,
      lng: long
    };

    var title = data["features"][i]["properties"]["name"];

//--------------- Pin- comment this out for infoWindow
    var marker = new google.maps.Marker(
    {
      map:map,
      draggable:false,
      animation: google.maps.Animation.DROP,
      position:stopPos,
      title: title
    });

    //This is to set up the click event for selecting a stop - not implemented yet
    marker.addListener(marker, 'click', stopClicked);
    markers.push(marker);
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

function AjaxError(data)
{
  console.log(data);
  console.log("AjaxError was hit");
}

function stopClicked(data)
{
  //console.log(data);
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


