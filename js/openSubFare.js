	$(document).ready(function init()
		{
			$(".btn btn-default edit-button-2").click(openSubFare);
		});
		
	function openSubFare(evt)
	{
		if(this.id === "cityTicket")
		{
		window.location.replace("/subFares/cityTicket.html");
		}
		else if(this.id === "singleRideFares")
		{
		window.open("subFares/singleRideFares.html");
		}
		else if(this.id === "smartCard")
		{
		window.open("subFares/smartCard.html");
		}
		else if(this.id === "employerPass")
		{
		window.open("subFares/employerPass.html");
		}
		
	}