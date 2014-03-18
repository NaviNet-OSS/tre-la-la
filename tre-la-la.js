// This is Tre-la-la for Trello.
google.load("visualization", "1.1", {packages:["corechart"]});
google.setOnLoadCallback(drawChart);
function drawChart() {
	var data = google.visualization.arrayToDataTable([
	  ['Year', 'Sales', 'Expenses'],
	  ['2004',  1000,      400],
	  ['2005',  1170,      460],
	  ['2006',  660,       1120],
	  ['2007',  1030,      540]
	]);

	var options = {
	  title: 'Company Performance',
	  vAxis: {title: 'Year',  titleTextStyle: {color: 'red'}}
	};

	var chart = new google.visualization.BarChart(document.getElementById('tre-la-la'));
	chart.draw(data, options);
}

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
			value : 50,
			color : "#E2EAE9"
		},
		{
			value : 100,
			color : "#D4CCC5"
		},
		{
			value : 40,
			color : "#949FB1"
		},
		{
			value : 120,
			color : "#4D5360"
		}

	]
	
	//Get the context of the canvas element we want to select
	var ctx = document.getElementById("my-canvas").getContext("2d");
	var myNewChart = new Chart(ctx).Doughnut(data);
});
