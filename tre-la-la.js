// This is Tre-la-la for Trello.
// Leverage Confluence AJS.$ to access JQuery

/*
var onAuthorize = function() {
    updateLoggedIn();
    //$("#output").empty();
    
    Trello.members.get("me", function(member){
        $("#fullName").text(member.fullName);
    });

};

var updateLoggedIn = function() {
    var isLoggedIn = Trello.authorized();
    //$("#loggedout").toggle(!isLoggedIn);
    //$("#loggedin").toggle(isLoggedIn);        
};
    
var logout = function() {
    Trello.deauthorize();
    updateLoggedIn();
};
                          
Trello.authorize({
    interactive:false,
    success: onAuthorize
});
*/

function createPercentageCompleteChart(id, complete, size) {
	remainder = 100.0 - complete
	title = complete.toString() + "%"
	fontSize = size < 180 ? '16px' : '24px'
	
    var colors = [ '#BBBBBB', '#00CC66', '#F7464A'];
    $(id).highcharts({
        chart: {
            type: 'pie',
            height: size,
            width: size,
            borderRadius: 0
        },
        credits: {
            enabled: false
        },
        title: {
            text: title,
            align: 'center',
            verticalAlign: 'middle',
			style: { fontSize: fontSize }
        },
        tooltip: false,
        plotOptions: {
            pie: {
                borderWidth: 3,
                startAngle: 90,
                innerSize: '70%',
                size: '100%',
                shadow: false,
                dataLabels: false,
                stickyTracking: false,
                states: {
                    hover: {
                        enabled: false
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

function createCfdChart(id) {
	$(id).highcharts({
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
}
