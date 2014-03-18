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
	var data = {
		labels : ["January","February","March","April","May","June","July"],
		datasets : [
			{
				fillColor : "rgba(220,220,220,0.5)",
				strokeColor : "rgba(220,220,220,1)",
				data : [65,59,90,81,56,55,40]
			},
			{
				fillColor : "rgba(151,187,205,0.5)",
				strokeColor : "rgba(151,187,205,1)",
				data : [28,48,40,19,96,27,100]
			}
		]
	}
	//Get the context of the canvas element we want to select
	var ctx = document.getElementById("my-canvas").getContext("2d");
	var myNewChart = new Chart(ctx).Bar(data);
});
