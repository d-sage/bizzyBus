$(document).ready(setupPage);

function setupPage()
{
	var time = new Date();
	//uncomment to set a specific hour for testing
	time.setHours(7);
	getNextBuses(3, time, "s-c2krpgxrf8-plazazone8", null);
}

//get the next buses for a given stop, option to search for next time of given route; 
//busNum = number of buses to return, curTime = time to compare against,
//stopID = the origin_onestop_id of the stop, (optional) routeID = route_onestop_id of a given route
function getNextBuses(busNum, curTime, stopID, routeID) 
{	
	if(routeID == null)
		var apiCall = "https://transit.land/api/v1/schedule_stop_pairs?operator_onestop_id=o-c2kx-spokanetransitauthority&origin_onestop_id=" + stopID;
	else
		var apiCall = "https://transit.land/api/v1/schedule_stop_pairs?operator_onestop_id=o-c2kx-spokanetransitauthority&origin_onestop_id=" + stopID + "&route_onestop_id=" + routeID;
	
	$.get(apiCall, function(data, status)
	{
		//get stop times, create array for next buses
		var stops = JSON.parse(JSON.stringify(data)).schedule_stop_pairs;
		var nextBuses = new Array(busNum);
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
					results = results + nextBuses[i] + '<br>';
			}
			//these will need to be changed to write to the appropriate area
			document.write(results);
		}
		else
			document.write("Sorry, no buses found");
	});	
}

