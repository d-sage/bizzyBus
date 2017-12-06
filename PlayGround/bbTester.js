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
	$.ajax({url:"https://transit.land/api/v1/routes?operated_by=o-c2kx-spokanetransitauthority",
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
	
	var string = "";
	for(route of $data.routes)
	{
		
		string += "<option value=''>" + route.onestop_id + "</option>\n";
		
	}
	
	console.log(string);
	
	//var $stops = $data.features;
	
	//console.log($stops);
	/*
	$.each($stops, function($index, $item){
		console.log($item.properties.tags);
	});
	*/
}