// This is Tre-la-la for Trello.

// Leverage Confluence AJS.$ to access JQuery
AJS.$(document).ready(function() {
	//var obj = document.getElementById('tre-la-la');
	//obj.innerHTML = "I'm here";
	
	var data = [
		{
			value: 30,
			color:"#F7464A"
		},
		{
			value : 70,
			color : "#E2EAE9"
		},
	]
	
	//Get the context of the canvas element we want to select
	var ctx = document.getElementById("my-canvas").getContext("2d");
	var myNewChart = new Chart(ctx).Doughnut(data);
});
