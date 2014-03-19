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

function addWeekdays(date, days) {
    date = moment(date); // use a clone
    while (days > 0) {
        date = date.add(1, 'days');
        // decrease "days" only if it's a weekday.
        if (date.isoWeekday() !== 6 && date.isoWeekday() !== 7) {
            days -= 1;
        }
    }
    return date;
}

function isActiveCol(list) {
    return list != null
        && (list.name.indexOf('Analysis Complete') != -1
            || list.name.indexOf('Implementation') != -1
            || list.name.indexOf('Verification') != -1
            || list.name.indexOf('Release Ready') != -1);
}

function getStoryUnits(cards) {
    var storyUnits = 0;
    $.each(cards, function(i, card) {
        var match = card.name.match(/\[([SML])\]/);
        if (match != null) {
            switch (match[1]) {
                case 'S':
                    storyUnits += 1;
                    break;
                case 'M':
                    storyUnits += 2;
                    break;
                case 'L':
                    storyUnits += 4;
                    break;
            }
        }
    });
    return storyUnits;
};

function getBoardSummaryData() {
    var confidence = 'TBD';
    var kickoffDate = 'TBD';
    var analysisCompleteDate = 'TBD';
    var releaseReadyDate = 'TBD';
    var releasedOn = 'TBD';
    var plannedStoryUnits = 0;
    var currentStoryUnits = 0;
    var storyUnitsComplete = 0;
    var teamVelocity = 1;

    var deferred = $.Deferred();

    Trello
        .get('boards/' + BOARD_ID + '/lists?cards=open')
        .success(function(lists) {
            var analysisCompleteColId = null;

            $.each(lists, function(ix, list) {
                if (isActiveCol(list)) {
                    currentStoryUnits += getStoryUnits(list.cards);
                }

                if (list.name.indexOf('Analysis Complete') != -1) {
                    analysisCompleteColId = list.id;
                }

                if (list.name.indexOf('Release Ready') != -1) {
                    storyUnitsComplete += getStoryUnits(list.cards);
                }

                if (list.name.indexOf('Meta') != -1) {
                    $.each(list.cards, function(ix, card) {
                        var match = card.name.match(/^Confidence:\ (.*)$/);
                        if (match != null && match.length >= 2) {
                            confidence = match[1];
                        }

                        match = card.name.match(/^Kickoff\ Date:\ (.*)$/);
                        if (match != null && match.length >= 2) {
                            kickoffDate = match[1];
                        }

                        match = card.name.match(/^Analysis\ Complete\ Date:\ (.*)$/);
                        if (match != null && match.length >= 2) {
                            analysisCompleteDate = match[1];
                        }

                        match = card.name.match(/^Team\ Velocity\ \(Points\/Day\):\ (.*)$/);
                        if (match != null && match.length >= 2) {
                            teamVelocity = match[1];
                        }

                        match = card.name.match(/^Release\ Ready\ Date:\ (.*)$/);
                        if (match != null && match.length >= 2) {
                            releaseReadyDate = match[1];
                        }

                        match = card.name.match(/^Releases\ On:\ (.*)$/);
                        if (match != null && match.length >= 2) {
                            releasedOn = match[1];
                        }
                    });
                }
            });

            var storyUnitsLeft = currentStoryUnits - storyUnitsComplete;
            var projectedDoneDate = addWeekdays(new Date(), storyUnitsLeft / teamVelocity);

            if (analysisCompleteDate !== 'TBD') {
                var before = moment(analysisCompleteDate).add('days', 1).toISOString();
                Trello
                    .get('boards/' + BOARD_ID + '/actions', { before: before, limit: 1000 })
                    .success(function(actions) {
                        var cards = [];
                        var cardIds = [];
                        $.each(actions, function(i, action) {
                            if (action.data.card != null
                                && cardIds.indexOf(action.data.card.id) == -1
                                && (action.data.list == null || isActiveCol(action.data.list))
                                && (action.data.listAfter == null || isActiveCol(action.data.listAfter))) {
                                cards.push(action.data.card);
                                cardIds.push(action.data.card.id);
                            }
                        });
                        plannedStoryUnits = getStoryUnits(cards);

                        deferred.resolve({
                            confidence: confidence,
                            projectedDoneDate: moment(projectedDoneDate).format("MM/DD/YYYY"),
                            kickoffDate: kickoffDate,
                            analysisCompleteDate: analysisCompleteDate,
                            releaseReadyDate: releaseReadyDate,
                            releasedOn: releasedOn,
                            plannedStoryUnits: plannedStoryUnits,
                            currentStoryUnits: currentStoryUnits,
                            storyUnitsComplete: storyUnitsComplete,
                            percentComplete: (storyUnitsComplete / currentStoryUnits * 100).toFixed(1) + '%'
                        });
                    });
            } else {
                deferred.resolve({
                    confidence: confidence,
                    projectedDoneDate: moment(projectedDoneDate).format("MM/DD/YYYY"),
                    kickoffDate: kickoffDate,
                    analysisCompleteDate: analysisCompleteDate,
                    releaseReadyDate: releaseReadyDate,
                    releasedOn: releasedOn,
                    plannedStoryUnits: plannedStoryUnits,
                    currentStoryUnits: currentStoryUnits,
                    storyUnitsComplete: storyUnitsComplete,
                    percentComplete: (storyUnitsComplete / currentStoryUnits * 100).toFixed(1) + '%'
                });
            }
        });

    return deferred.promise();
}

function buildBoardSummary() {
    getBoardSummaryData().done(function(data) {
        $('body').append(
            '<b>Confidence:</b> ' + data.confidence + ' ' +
            '<b>Target date:</b> ' + data.projectedDoneDate + ' ' +
            '<b>Kickoff Date:</b> ' + data.kickoffDate + ' ' +
            '<b>Analysis Complete Date:</b> ' + data.analysisCompleteDate + ' ' +
            '<b>Release Ready Date:</b> ' + data.releaseReadyDate + ' ' +
            '<b>Released On:</b> ' + data.releasedOn + ' ' +
            '<b>Planned Story Units:</b> ' + data.plannedStoryUnits + ' ' +
            '<b>Revised Story Units:</b> ' + data.currentStoryUnits + ' ' +
            '<b>Story Units Complete:</b> ' + data.storyUnitsComplete + ' ' +
            '<b>Percent Complete (Actual):</b> ' + data.percentComplete);
    });
}
