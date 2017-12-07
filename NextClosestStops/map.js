//------------------------------------------------------------------------------------
//This example is taken from google and adapted
//Original: https://developers.google.com/maps/documentation/javascript/geolocation
//------------------------------------------------------------------------------------
//Marker Clusterer files obtained from google maps v3 utility library: https://github.com/googlemaps/v3-utility-library

// Note: This example requires that you consent to location sharing when
// prompted by your browser. If you see the error "The Geolocation service
// failed.", it means you probably did not give permission for the browser to
// locate you.
$(document).ready(init);

function init()
{
	initMap();
}

/*
Unused method
Purpose: Most all code is written to be able to place Stops along a given route
*/
function stopsForRoute(data)
{
	
	var desiredRouteId = "r-c2kqh-68";
	
	var points = [];
	for(coordinate of data.stops)
	{
		var done = false;
		for(stopId of coordinate.routes_serving_stop)
		{
			if(!done)
			{
				if(stopId.route_onestop_id === desiredRouteId)
				{
					points.push(coordinate.geometry.coordinates[1] + "," + coordinate.geometry.coordinates[0]);
	
					done = true;
				}
			}
		}
	}
	
	var stringPoints = points.join("|");
	
}

/*Globals>>>*/
var transitlandURL = "https://transit.land/api/v1/stops.geojson";
var apiKey = "AIzaSyBbNcTh39hZiJLtvHEvWCHDtfi8ko19ZWw";

var map, infoWindow, home;
var markers = [];
var markerCluster = null;
var curMarker;
/*Globals<<<*/

function initMap()
{
	map = new google.maps.Map(document.getElementById('map'),
	{
		center:
		{
			lat: 47.6588,
			lng: -117.4260
		},
		zoom: 15
	});

	infoWindow = new google.maps.InfoWindow;

	home = new google.maps.Marker(
	{
		map: map,
		draggable: true,
		animation: google.maps.Animation.DROP,
		icon: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
		title: "Current Location"
	});
	google.maps.event.addListener(home, 'dragend', dragFunction);

	// Create the search box and link it to the UI element
	var input = document.getElementById('pac-input');
	var searchBox = new google.maps.places.SearchBox(input);
	map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

	// Bias the SearchBox results towards current map's viewport.
	map.addListener('bounds_changed', function()
	{
		searchBox.setBounds(map.getBounds());
	});

	// Listen for the event fired when the user selects a prediction and retrieve
	// more details for that place.
	searchBox.addListener('places_changed', function()
	{
		var places = searchBox.getPlaces();

		if (places.length == 0)
		{
			return;
		}

		// For each place, get the icon, name and location.
		var bounds = new google.maps.LatLngBounds();
		places.forEach(function(place)
		{
			if (!place.geometry)
			{
				return;
			}


			home.setPosition(place.geometry.location);
			map.setCenter(place.geometry.location);

			for (var i = 0; i < markers.length; i++)
			{
				markers[i].setMap(null);
			}

			markers = [];
			
			if(markerCluster != null)
				markerCluster.clearMarkers();

			getBuses(place.geometry.location);

		});

	});

	// Try HTML5 geolocation.
	if (navigator.geolocation)
	{
		navigator.geolocation.getCurrentPosition(locationSuccess, browserLocationFail);
	}
	else
	{
		// Browser doesn't support Geolocation
		handleLocationError(false, infoWindow, map.getCenter());
	}

	$("#infoDiv").hide();

	$("#closeInfo").click(function()
	{
		$("#infoDiv").hide();
	});

	//Used for resizing the map to fit the maximum of the screen
	$("#map").height($(window).height());
	$(window).resize(function(evt)
	{
		$("#map").height($(window).height());
	});

	$(".nextBusSelect").change(nextBusSelectChanged);

} //end initMap

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

	var perPage = 1000; //Results per query
	var radius = 1000; //Radius around point

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
function processData(data)
{
	
	for (var i = 0; i < data["features"].length; i++)
	{
		var lat = data["features"][i]["geometry"]["coordinates"][1];
		var lon = data["features"][i]["geometry"]["coordinates"][0];

		var stopPos = {
			lat: lat,
			lng: lon
		};

		var title = data.features[i].properties.tags.stop_desc;

		//Collect Route info
		var routeList = data.features[i].properties.routes_serving_stop;
		var routeNums = [];
		var routeIds = [];
		$.each(routeList, function(index, item)
		{
			routeNums.push(item.route_name);
			routeIds.push(item.route_onestop_id);
		});

		var osm_way_id = data.features[i].properties.tags.osm_way_id;
		var onestop_id = data.features[i].properties.onestop_id;

		
		//*See function for details
		placeStopMarker(stopPos, title, onestop_id, routeIds.join(","), routeNums.join(","));

	}
	
	markerCluster = new MarkerClusterer(map, markers,
	{
		imagePath: "./MarkerClusterer/images/m"
	});

}

//This function allows for stopPos(lat/lng) and other components
//to be used to create a busStop marker with related events to display info: click & mouseover
function placeStopMarker(stopPos, title, onestop_id, routeIds, routeNums)
{

	//Creates the initial Marker with provided information
	var marker = new google.maps.Marker(
	{
		map: map,
		draggable: false,
		animation: google.maps.Animation.DROP,
		position: stopPos,
		title: title,
		customInfo: routeNums + "|" + routeIds + "|" + onestop_id
	});

	//This is to set up the click event for selecting a stop
	google.maps.event.addListener(marker, "click", function(event)
	{
		curMarker = this;
		
		clearLowerInfoDiv();
		
		var splitData = this.customInfo.split("|");
		
		//Populate the routeSelect Element with the routes associated
		//with the given/clicked stop
		var routesSelect = $("#routeSelect");
		$(routesSelect).empty();
		$(routesSelect).append($('<option>', {
				value: 'null',
				text: "All Routes"
		}));
		
		var idsArray = splitData[1].split(",");
		$.each(idsArray, function(index, item){
			var splitId = item.split("-");
			var size = splitId.length;
			$(routesSelect).append($('<option>', {
				value: item,
				text: "Route " + splitId[size-1]
			}));
		});
		
		//*See function for details
		displayNewInfoData(splitData);
		
	});

	//These mouseover/mouseout events deal with displaying info pertaining to the Stop above the marker
	google.maps.event.addListener(marker, "mouseover", function(event)
	{
		infoWindow.setContent(this.title);
		infoWindow.open(map, this);
	});
	google.maps.event.addListener(marker, "mouseout", function(event)
	{
		infoWindow.close();
	});

	markers.push(marker);
}

//Entry point to re-populating the nextBuses Info when
//selecting a new option from one of the Select Elements
function nextBusSelectChanged(evt)
{
	
	clearLowerInfoDiv();
		
	var splitData = curMarker.customInfo.split("|");
		
	displayNewInfoData(splitData);
		
}

//The function that gets the neccessary data to send to
//the 'getNextBuses' function
function displayNewInfoData(splitData)
{
	var infoDiv = $("#infoDiv");
	
	var routeNumsList = splitData[0].split(",");
	for(num of routeNumsList)
	{
		$("#tblRoutesServed tbody").append("<tr class='rowRoutes'><td>" + num + "</td></tr>");
	}
	
	$(infoDiv).show();
		
	var curTime = getCurrentTime();
		
	var busNum = $("#nextBusNum").val();
	
	var stopID = splitData[2];
		
	var routeID = $("#routeSelect").val();
	if(routeID === "null")
		routeID = null;
		
	getNextBuses(busNum, curTime, stopID, routeID);
}

function getCurrentTime()
{
	var time = new Date();
	
	return time;
}

function clearLowerInfoDiv()
{
	//Clear the HTML
	$("#tblRoutesServed > tbody").empty();
	$("#tblNextBuses > tbody").empty();
}

//get the next buses for a given stop, option to search for next time of given route; 
//busNum = number of buses to return, curTime = time to compare against,
//stopID = the origin_onestop_id of the stop, (optional) routeID = route_onestop_id of a given route
function getNextBuses(busNum, curTime, stopID, routeID) 
{	
	if(routeID == null)
		var apiCall = "https://transit.land/api/v1/schedule_stop_pairs?per_page=10000&operator_onestop_id=o-c2kx-spokanetransitauthority&origin_onestop_id=" + stopID;
	else
		var apiCall = "https://transit.land/api/v1/schedule_stop_pairs?per_page=10000&operator_onestop_id=o-c2kx-spokanetransitauthority&origin_onestop_id=" + stopID + "&route_onestop_id=" + routeID;
	
	$.get(apiCall, function(data, status)
	{
		//get stop times, create array for next buses
		var stops = JSON.parse(JSON.stringify(data)).schedule_stop_pairs;
		var nextBuses = new Array();
		var busFound = false;
		var stopTime = new Date();
		var foundTime = new Date();
		var foundTimeStr = "";
		
		//check each stop time
		for(var i = 0; i < stops.length; i++)
		{
			//parse stop time 
			stopTime.setHours(parseInt(stops[i].origin_arrival_time.substr(0,2)));
			stopTime.setMinutes(parseInt(stops[i].origin_arrival_time.substr(3,5)));
			stopTime.setSeconds(parseInt(stops[i].origin_arrival_time.substr(6,7)));
			
			//check to make sure this stop time is available on given day
			if(stops[i].service_days_of_week[curTime.getDay()])
			{	//check if stopTime is in the future
				if(stopTime > curTime)
				{	//check to see if stopTime is sooner than those already found
					for(var j = 0; j < busNum; j++)
					{	
						if(nextBuses[j] != null)
						{
							foundTimeStr = nextBuses[j].substr(9, nextBuses[j].length);
							foundTime.setHours(parseInt(foundTimeStr.substr(0,2)));
							foundTime.setMinutes(parseInt(foundTimeStr.substr(3,5)));
							foundTime.setSeconds(parseInt(foundTimeStr.substr(6,7)));
							
							//if so add it to list
							if(stopTime < foundTime)
							{
								var routeNum = stops[i].route_onestop_id.split("-");
								nextBuses[j] = "Route " + routeNum[routeNum.length - 1] + " " + stops[i].origin_arrival_time;
								busFound = true;
								break;
							}
						}
						else
						{	//if so add it to list
							var routeNum = stops[i].route_onestop_id.split("-");
							nextBuses[j] = "Route " + routeNum[routeNum.length - 1] + " " + stops[i].origin_arrival_time;
							busFound = true;
							break;
						}
					}
				}
			}
		}
		
		if(busFound == true)
		{
			var results = "";
			
			for(var i = 0; i < nextBuses.length; i++)
			{
				if(nextBuses[i] != null)
					$("#tblNextBuses tbody").append("<tr class='rowNumbers'><td>" + nextBuses[i] + "</td></tr>");
			}
			
		}
		else
		{
			$("#tblNextBuses tbody").append("<tr class='rowNumbers'><td>Sorry, no buses found.</td></tr>");
		}
	});	
}

function AjaxError(data)
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
	markerCluster.clearMarkers();

	getBuses(pos);
}

function locationSuccess(position)
{
	
	if(position["location"])
	{
		var pos = {
			lat: position["location"]["lat"],
			lng: position["location"]["lng"]
		};
	}
	else
	{
		var pos = {
			lat: position.coords.latitude,
			lng: position.coords.longitude
		};
	}

	

	//console.log(pos);

	home = new google.maps.Marker(
	{
		map: map,
		draggable: true,
		animation: google.maps.Animation.DROP,
		position: pos,
		icon: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
		title: "Current Location"
	});


	//This is for the drag event, its not implemented yet
	google.maps.event.addListener(home, 'dragend', dragFunction);


	map.setZoom(15);
	//console.log(map.getZoom());
	map.setCenter(pos);


	// Create the search box and link it to the UI element
	var input = document.getElementById('pac-input');
	var searchBox = new google.maps.places.SearchBox(input);
	map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

	// Bias the SearchBox results towards current map's viewport.
	map.addListener('bounds_changed', function()
	{
		searchBox.setBounds(map.getBounds());
	});

	// Listen for the event fired when the user selects a prediction and retrieve
	// more details for that place.
	searchBox.addListener('places_changed', function()
	{
		var places = searchBox.getPlaces();

		if (places.length == 0)
		{
			return;
		}

		// For each place, get the icon, name and location.
		var bounds = new google.maps.LatLngBounds();
		places.forEach(function(place)
		{
			if (!place.geometry)
			{
				return;
			}


			home.setPosition(place.geometry.location);
			map.setCenter(place.geometry.location);

			for (var i = 0; i < markers.length; i++)
			{
				markers[i].setMap(null);
			}

			markers = [];
			markerCluster.clearMarkers();

			getBuses(place.geometry.location);

		});

	});

	getBuses(pos);
	
	
	//------------------Dont know which is most current-------------------
	/*
	if(position["location"])
	{
		var pos = {
			lat: position["location"]["lat"],
			lng: position["location"]["lng"]
		};
	}
	else
	{
		var pos = {
			lat: position.coords.latitude,
			lng: position.coords.longitude
		};
	}

	

	//console.log(pos);

	home.setPosition(pos);	


	map.setZoom(15);
	//console.log(map.getZoom());
	map.setCenter(pos);

	getBuses(pos);
	*/
}

function browserLocationFail(error)
{
	if(error.message.indexOf("Only secure origins are allowed") == 0)
	{
			$.post("https://www.googleapis.com/geolocation/v1/geolocate?key=AIzaSyBbNcTh39hZiJLtvHEvWCHDtfi8ko19ZWw", locationSuccess);

	}
	handleLocationError(true, infoWindow, map.getCenter());
}
