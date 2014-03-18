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
			value : 70,
			color : "#00CC66"
		},
	]
	
	//Get the context of the canvas element we want to select
	var ctx = document.getElementById("my-canvas").getContext("2d");
	var myNewChart = new Chart(ctx).Doughnut(data);
	
	        $('#container').highcharts({
            chart: {
                type: 'area'
            },
            title: {
                text: 'Historic and Estimated Worldwide Population Growth by Region'
            },
            subtitle: {
                text: 'Source: Wikipedia.org'
            },
            xAxis: {
                categories: ['1750', '1800', '1850', '1900', '1950', '1999', '2050'],
                tickmarkPlacement: 'on',
                title: {
                    enabled: false
                }
            },
            yAxis: {
                title: {
                    text: 'Billions'
                },
                labels: {
                    formatter: function() {
                        return this.value / 1000;
                    }
                }
            },
            tooltip: {
                shared: true,
                valueSuffix: ' millions'
            },
            plotOptions: {
                area: {
                    stacking: 'normal',
                    lineColor: '#666666',
                    lineWidth: 1,
                    marker: {
                        lineWidth: 1,
                        lineColor: '#666666'
                    }
                }
            },
            series: [{
                name: 'Asia',
                data: [502, 635, 809, 947, 1402, 3634, 5268]
            }, {
                name: 'Africa',
                data: [106, 107, 111, 133, 221, 767, 1766]
            }, {
                name: 'Europe',
                data: [163, 203, 276, 408, 547, 729, 628]
            }, {
                name: 'America',
                data: [18, 31, 54, 156, 339, 818, 1201]
            }, {
                name: 'Oceania',
                data: [2, 2, 2, 6, 13, 30, 46]
            }]
        });
});
