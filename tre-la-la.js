// This is Tre-la-la for Trello.
// Leverage Confluence AJS.$ to access JQuery
function createPercentageCompleteChart(id, complete) {
	remainder = 100.0 - complete
	title = complete.toString(2) + "%"
	
    var colors = ['#F7464A', '#00CC66'];
    var chart = new Highcharts.Chart({
        chart: {
            renderTo: id,
            type: 'pie',
            height: 250,
            width: 250,
            borderRadius: 0
        },
        credits: {
            enabled: false
        },
        title: {
            text: title,
            align: 'center',
            verticalAlign: 'middle'
        },
        tooltip: false,
        plotOptions: {
            pie: {
                borderWidth: 6,
                startAngle: 90,
                innerSize: '55%',
                size: '100%',
                shadow: false,
                dataLabels: false,
                stickyTracking: false,
                states: {
                    hover: {
                        enabled: true
                    }
                }
            }
        },

        series: [{
            data: [
                {y:remainder, color: colors[0] },
                {y:complete, color: colors[1] }
            ]
        }]
    });
}

AJS.$(document).ready(function() {
	//var obj = document.getElementById('tre-la-la');
	//obj.innerHTML = "I'm here";
	
	createPercentageCompleteChart('tre-la-la-percent-complete-highcharts', 85)
	
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
	var ctx = document.getElementById("tre-la-la-percent-complete").getContext("2d");
	var myNewChart = new Chart(ctx).Doughnut(data);
	
	        $('#tre-la-la-cfd').highcharts({
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
