$(document).ready(init);

function init($evt)
{
	$("#btnGetStops").click(getStopsClick);
	$("#btnGetMisc").click(getMiscClick);
}

function getStopsClick($evt)
{
	
	var $keyValues = {};
	
	$.ajax({url:"https://transit.land/api/v1/stops.geojson?served_by=o-c2kx-spokanetransitauthority&per_page=false",
			cache: false,
			type: "GET",
			data: $keyValues,
			success: getStopsSuccess,
			dataType: "json"
	});
}

function getStopsSuccess($data)
{
	//console.log($data);
	
	var $stops = $data.features;
	
	//console.log($stops);
	
	$.each($stops, function($index, $item){
		console.log($item.properties.tags);
	});
}

function getMiscClick($evt)
{
	
	var $keyValues = {};
	
	$.ajax({url:"https://realtime.spokanetransit.com:8442/TI_FixedRoute_Line",
			cache: false,
			type: "GET",
			data: $keyValues,
			success: getMiscSuccess,
			dataType: "json"
	});
}

function getMiscSuccess($data)
{
	console.log($data);
	
	//var $stops = $data.features;
	
	//console.log($stops);
	/*
	$.each($stops, function($index, $item){
		console.log($item.properties.tags);
	});
	*/
}