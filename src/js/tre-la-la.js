function createPercentageCompleteChart(id, complete, size) {
    if (typeof complete === 'string') {
        complete = parseFloat(complete)
    }
    remainder = 100.0 - complete
    title = complete.toString() + "%"
    fontSize = size < 180 ? '16px' : '24px'
    innerSize = size <= 100 ? '75%' : '70%'

    var colors = [ '#BBBBBB', '#00CC66', '#F7464A'];
    $(id).highcharts({
        chart: {
            type: 'pie',
            height: size,
            width: size,
            borderRadius: 0,
            spacing: 0
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
                innerSize: innerSize,
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
        legend: {
            enabled: false
        },
        series: [{
            data: [
                {y:remainder, color: colors[0] },
                {y:complete, color: colors[1] }
            ]
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
            || list.name.indexOf('Design') != -1
            || list.name.indexOf('Implementation') != -1
            || list.name.indexOf('Verification') != -1
            || list.name.indexOf('Release Ready') != -1);
}

function getStoryUnits(cards) {
    var storyUnits = 0;
    $.each(cards, function(i, card) {
        if (!card.name) return true;
        storyUnits += getStoryUnit(card.name);
    });
    return storyUnits;
}

function getStoryUnit(cardName)
{
        var storyUnits = 0;
        var match = cardName.match(/\[([SML])\]/i);
        if (match != null) {
            switch (match[1]) {
                case 'S':
                case 's':
                    storyUnits = 1;
                    break;
                case 'M':
                case 'm':
                    storyUnits = 2;
                    break;
                case 'L':
                case 'l':
                    storyUnits = 4;
                    break;
            }
        }
        return storyUnits;
}

function getBoardSummaryData(boardId) {
    var confidence = 'TBD';
    var kickoffDate = 'TBD';
    var analysisCompleteDate = 'TBD';
    var releaseReadyDate = 'TBD';
    var releasedOn = 'TBD';
    var plannedStoryUnits = 0;
    var currentStoryUnits = 0;
    var storyUnitsComplete = 0;
    var teamVelocity = 1;
    var blockedDays = 0;

    var deferred = $.Deferred();

    Trello
        .get('boards/' + boardId + '/lists?cards=open')
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

                        match = card.name.match(/^Team\ Velocity\ \(Points\/Day\) ?:\ (.*)$/);
                        if (match != null && match.length >= 2) {
                            teamVelocity = match[1];
                        }

                        match = card.name.match(/^Release\ Ready\ Date:\ (.*)$/);
                        if (match != null && match.length >= 2) {
                            releaseReadyDate = match[1];
                        }

                        match = card.name.match(/^Released\ On:\ (.*)$/);
                        if (match != null && match.length >= 2) {
                            releasedOn = match[1];
                        }
                    });
                }

                blockedDays += getTotalBlockedDays(list.cards);
            });

            var storyUnitsLeft = currentStoryUnits - storyUnitsComplete;
            var projectedDoneDate = addWeekdays(new Date(), storyUnitsLeft / teamVelocity);

            if (analysisCompleteDate !== 'TBD') {
                var before = moment(analysisCompleteDate).add('days', 1).toISOString();
                Trello
                    .get('boards/' + boardId + '/actions', { before: before, limit: 1000 })
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

                        percentComplete = (storyUnitsComplete / currentStoryUnits * 100).toFixed(1)
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
                            percentComplete: percentComplete,
                            percentCompleteLabel: percentComplete + '%',
                            totalBlockedDays: blockedDays
                        });
                    });
            } else {
                percentComplete = (storyUnitsComplete / currentStoryUnits * 100).toFixed(1)
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
                    percentComplete: percentComplete,
                    percentCompleteLabel: percentComplete + '%'
                });
            }
        });

    return deferred.promise();
}

function getTotalBlockedDays(cards) {
    var blockedDays = 0;
    $.each(cards, function(i, card) {
        if(!card.name) return -1;

        var match = card.name.match(/\(\s*\d+\s*(days)*\s*\)/);
        if (match && match[0]) {
            var numberMatch = match[0].match(/\d+/);
            if (numberMatch && numberMatch[0]) {
                blockedDays += parseInt(numberMatch[0]);
            }
        }

    });

    return blockedDays;
}

function getScopeChangeHistory(boardId) {
    var $scopeChange = $("<div />");
    var $tableScope = $("<table></table>").addClass('confluenceTable');

    $('<th>Change Date</th>').addClass('confluenceTh').appendTo($('<tr></tr>')).appendTo($tableScope);
    $('<th>Change Summary</th>').addClass('confluenceTh').appendTo($('<tr></tr>')).appendTo($tableScope);
    $('<th>Scope Change</th>').addClass('confluenceTh').appendTo($('<tr></tr>')).appendTo($tableScope);
    $('<th>Reason</th>').addClass('confluenceTh').appendTo($('<tr></tr>')).appendTo($tableScope);

    getMetadata(boardId).done(function(data) {
       Trello.get('boards/' + boardId + '/actions?filter=createCard,copyCard,updateCard:idList,moveCardFromBoard,moveCardToBoard,updateCard:closed', { limit: 1000 })
       .success(function (cards) {
            //get card with analyis complete date
            var analysisCompleteDate = data.meta.analysisCompleteDate;
            var teamVelocity = data.meta.teamVelocity;

            if (analysisCompleteDate !== null) {
                $.each(cards, function (ix, card) {
                    if(card.type === "createCard" || card.type === "copyCard" || card.type === "moveCardFromBoard" || card.type === "moveCardToBoard") {
                        if (isActiveCol(card.data.list)) {
                            var daysDiff = moment(moment(card.date)).diff(moment(analysisCompleteDate), 'days');
                            if (daysDiff > 0) {
                                var weight = "+";
                                if(card.type === "moveCardFromBoard") { weight = "-"; }
                                //get current state of the card
                                appendRowToTable(card.data.card.id, card.date, $tableScope, weight, teamVelocity, card.data.card.name);
                            }
                        }
                    }
                    else {
                        //TODO: Archived items
                        if(card.type === "updateCard" && card.data.card.closed) {
                            if (moment(card.date).diff(moment(analysisCompleteDate), 'days') > 0) {
                                Trello.get('cards/' + card.data.card.id + '/list', function(singlelist) {
                                    if (isActiveCol(singlelist)) {
                                        appendRowToTable(card.data.card.id, card.date,  $tableScope, "-", teamVelocity, card.data.card.name);
                                    }
                                });
                            }
                        } else if(!isActiveCol(card.data.listBefore) && isActiveCol(card.data.listAfter)
                        && (moment(card.date).diff(moment(analysisCompleteDate), 'days') > 0)) {
                            appendRowToTable(card.data.card.id, card.date,  $tableScope, "+", teamVelocity, card.data.card.name);
                        } else if(isActiveCol(card.data.listBefore) && !isActiveCol(card.data.listAfter)
                        && (moment(card.date).diff(moment(analysisCompleteDate), 'days') > 0)) {
                            appendRowToTable(card.data.card.id, card.date, $tableScope, "-", teamVelocity, card.data.card.name);
                        }
                    }
                });
            }
        });
    });

    $tableScope.appendTo($scopeChange);

    return $scopeChange;
}

function appendRowToTable(id, date, $tableScope, weight, teamVelocity, name) {

    var row = $('<tr></tr>');

    $('<td>' + moment(date).format('L') + '</td>').addClass('confluenceTd').appendTo(row);
    var $columnName = $('<td></td>');
    var $columnScopeChange = $('<td></td>');


    $columnName.addClass('confluenceTd').appendTo(row);
    //calculate card points before date
    $columnScopeChange.addClass('confluenceTd').appendTo(row);

    Trello.get('cards/' + id + '/name', function (currentName) {
        $columnName.text(currentName._value);

        if (!currentName._value) return true;
        var storyUnits = getStoryUnit(currentName._value);

        $columnScopeChange.text(weight + Math.round((storyUnits / teamVelocity) * 100) / 100 + ' day(s)');

    });

    //get reason from description
    Trello.get('cards/' + id + '/desc', function (desc) {
        $('<td>' + desc._value + '</td>').addClass('confluenceTd').appendTo(row);
    });
    row.appendTo($tableScope);
}


//************************************
// Frequency Chart functions
//************************************
function drawFrequency(boardId, targetElement) {
    $.when(getReleaseReadyActions(boardId))
        .done(function (cardDataResult) {onFCInitComplete(cardDataResult, targetElement)})
}

function onFCInitComplete(cardDataResult, targetElement) {
    var cards = {}

    cards = $.map(cardDataResult, function(card, id){
        var createDate;
        var lastMoveToReleaseReadyDate;

        $.each(card.actions, function(idx, action) {
            if (action.actionType == 'createCard'){
                createDate = action.date;
                if(action.newColumnName.indexOf('Release Ready') != -1)
                    lastMoveToReleaseReadyDate = action.date;
            }
            else if (action.actionType == 'updateCard'){
                if (!lastMoveToReleaseReadyDate || action.date.diff(lastMoveToReleaseReadyDate) > 0)
                    lastMoveToReleaseReadyDate = action.date;
            }
        })

        return {name: card.name, id: card.id, createDate: createDate, doneDate: lastMoveToReleaseReadyDate, daysToComplete: lastMoveToReleaseReadyDate.diff(createDate, 'days')};
    })

    cards.sort(compareSeriesCards);
    var cardDoneDates = getCardCompletionDates(cards);
    var series = getFrequencySeries(cards);
    drawFrequencyChart(cardDoneDates, series, targetElement);
}

function compareSeriesCards(item1, item2){
    return (item1.doneDate > item2.doneDate ? 1: -1);
}

function getReleaseReadyActions(boardId) {
    var deferred = $.Deferred();
    var releaseReadyListId = -1;
    //Find the list id for the release ready
    Trello
        .get('boards/' + boardId + '/lists?fields=name')
        .success(function(queryResult) {
            //var releaseReadyListId = -1;
            $.each(queryResult, function(idx, list) {
                if (list.name.indexOf('Release Ready') != -1)
                    releaseReadyListId = list.id;
            });

            // get all cards in the release ready list
            Trello
                .get( 'lists/' + releaseReadyListId + '/cards?actions=createCard,updateCard', function(cards){
                    var state = {};


                    state = $.map(cards, function(card, idx) {
                        var cardData = $.map(card.actions, function(cardAction, idxAction) {
                            if (cardAction.data.listBefore && (cardAction.type == 'updateCard')) { //by checking for both conditions we filter out updates that are not relatd to card moving
                                return {date: moment(cardAction.date), newColumnId: cardAction.data.listAfter.id, newColumnName: cardAction.data.listAfter.name, actionType: cardAction.type  };
                            } else if (cardAction.data.list && (cardAction.type == 'createCard')){
                                return {date: moment(cardAction.date), newColumnId: cardAction.data.list.id, newColumnName: cardAction.data.list.name, actionType: cardAction.type };
                            } else {
                                return null;
                            }

                        });

                        return {name:card.name, id: card.id, actions: cardData};
                    });

                    deferred.resolve(state);
                });

        });


    return deferred;
}

function getCardCompletionDates(cards){
    var dates = $.map(cards, function(card, id) {
        return card.doneDate.format("M/D");
    });

    return dates;
}
function getFrequencySeries(cards){
    //var series = $.map(cards, function(card, id) {
    //  return {name: card.doneDate.format("M/D"), data: [card.daysToComplete > 0 ?  card.daysToComplete : card.daysToComplete + 0.1]}; //the +0.1 is to make the bar visible
    //});

    var series = new Array(cards.length);
    for(var i = 0; i < cards.length; i++)
    {
        var card = cards[i];
        series[i] = card.daysToComplete > 0 ?  card.daysToComplete : card.daysToComplete + 0.1; //the +0.1 is to make the bar visible
    };

    //create the median series
    var median = getMedian(series.slice(0));
    var medianSeries = $.map(series, function(s, id){return median});
    medianSeries.splice(0,0, median); //add a dumy at the begining for a better display.

    return [{data: series, name: 'User Stories'}, {data: medianSeries, type :'line', name:'Median',color: ['red'], marker: {enabled: false}}];
}

function getMedian(values) {

    values.sort( function(a,b) {return a - b;} );

    var half = Math.floor(values.length/2);

    if(values.length % 2)
        return values[half];
    else
        return (values[half-1] + values[half]) / 2.0;
}

function drawFrequencyChart(cardsDoneDates, series, targetElement) {
    var chart;
    chart = new Highcharts.Chart({
        MyData: "sdfsdfsdF",
        colors: ['black'],
        chart: {
            renderTo: targetElement,
            type: 'column'
        },
        title: {
            text: 'Frequency Chart'
        },
        xAxis: {
            categories: cardsDoneDates,
            lineWidth:0,
            lineColor:'#999',
            title: {
                text: 'Date Completed On'
            }
        },
        yAxis: {
            title: {
                text: 'Days to complete story'
            }
        },
        legend: {
            enabled: true
        },
        tooltip: {
            hideDelay: 200,
            formatter: function(bola) {
                if (this.series.name == 'Median')
                    return "The Median is:" + this.y;
                else
                    return "This user story was completed on " + this.x + " in "  + (this.y == 0.1?  0:this.y) + " days";
            }
        },
        plotOptions:{
            column:{
                shadow:false,
                borderWidth:.5,
                borderColor:'#666',
                pointPadding:0,
                groupPadding:0,
                color: 'rgba(204,204,204,.85)',
                pointWidth: 25
            },

        },
        //series: [{name:"4/1", data: [3]}, {name:"4/7", data: [3]}, {name:"4/5", data: [0.1]}]
        //series: [{data:[1, 3,2]}]
        series: series
    });
}

//************************************
// CFD related functions
//************************************

function drawCFD(boardId, targetElement) {
    $.when(getMetadata(boardId), getLists(boardId), getCardData(boardId))
     .done(function(metaDataResult, listResult, cardDataResult) {
        onInitComplete($.extend(metaDataResult, listResult, cardDataResult, { targetElement: targetElement }));
     });
}

function getLists(boardId) {
    var deferred = $.Deferred();
    Trello
        .get('boards/' + boardId + '/lists')
        .success(function(queryResult) {
            var state = {};
            // get list of list names
            state.listNames = $.map(queryResult, function(list, idx) {
                if(!isActiveCol(list))
                    return null;
                return list.name;
            });

            // get map of list id => list name
            state.listMap = {};
            $.each(queryResult, function(idx, list) {
                if(!isActiveCol(list))
                    return null;
                state.listMap[list.id] = list.name;
            });

            deferred.resolve(state);
        });
    return deferred;
}

function getCardData(boardId) {
    var deferred = $.Deferred();

    var params = {
        actions: 'createCard,copyCard,updateCard:idList,moveCardFromBoard,moveCardToBoard,updateCard:closed'
    };
    Trello
        .get('boards/'+ boardId + '/cards/all', params)
        .success(function(queryResult) {
            var state = {};
            state.cards = queryResult;

            state.cardActions = $.map(queryResult, function(card, idx) {
                return $.map(card.actions, function(cardAction, idxAction) {
                    if(cardAction.type === 'updateCard' && cardAction.data.listBefore) {
                        return { name: card.name, id: card.id, date: moment(cardAction.date), newColumn: cardAction.data.listAfter.id };
                    } else if (card.type === "createCard" || card.type === "copyCard" || card.type === "moveCardFromBoard" || card.type === "moveCardToBoard") {
                        return { name: card.name, id: card.id, date: moment(cardAction.date), newColumn: cardAction.data.list.id };
                    } else {
                        return null;
                    }
                });
            });

            deferred.resolve(state);
        });
    return deferred;
}

// Functions
function onInitComplete(state) {
    var meta = state.meta;
    var cards = state.cards;
    var cardActions = state.cardActions;
    var listNames = state.listNames;
    var listMap = state.listMap;
    var categories, series, dates;

    // data points
    //categories = $.map(cardActions, function(cardAction, idx) { return cardAction.date; });
    dates = buildDateSeries(meta.kickoffDate);
    categories = $.map(dates,
                    function(date, idx) {
                        return date.format('MM/DD/YYYY');
                    });

    var columnPointsMap = {};

    // populate all the series with zeroes
    $.each(listMap, function(id, name) {
        columnPointsMap[id] = $.map(new Array(dates.length), function() { return 0; });
    });

    // fill in each series, day by day, card by card
    for(var i = 0; i < dates.length; i++) {
        var date = dates[i];
        for(var j = 0; j < cards.length; j++) {
            var card = cards[j];
            if(card.ignored)
                continue;
            var lastAction = getLastActionOfDay(card, date);

            if(!lastAction || !lastAction.newColumn || !listMap[lastAction.newColumn]) continue;

            if(lastAction.cardClosed) {
                card.ignored = true;
                continue;
            }

            var columnActions = columnPointsMap[lastAction.newColumn];
            columnActions[i] = columnActions[i] + 1;
        }
    }

    series = $.map(columnPointsMap, function(points, id) {
        return { name: listMap[id], data: points };
    }).sort(compareSeriesItems);

    doMagicChartOfDestiny(categories, series, state.targetElement);
}

function compareSeriesItems(item1, item2) {
    var getWeight = function(item) {
        if (item.name.indexOf('Analysis Complete') != -1) return 1;
        if (item.name.indexOf('Design') != -1) return 2;
        if (item.name.indexOf('Implementation') != -1) return 3;
        if (item.name.indexOf('Verification') != -1) return 4;
        if (item.name.indexOf('Release Ready') != -1) return 5;
    }

    var item1Weight = getWeight(item1);
    var item2Weight = getWeight(item2);

    if (item1Weight < item2Weight) return -1;
    if (item1Weight > item2Weight) return 1;

    return 0;
}

function isMatchingCardAction(cardAction) {
    return (cardAction.type === 'updateCard' && cardAction.data.listBefore)
        || (cardAction.type === 'createCard')
        || (cardAction.type === 'updateCard') && (cardAction.data.card && cardAction.data.card.closed) ;
}

function getLastActionOfDay(card, date) {
    var ret = null;
    var nextDay = date.clone().add(1, 'days');

    for(var i = card.actions.length - 1; i >= 0; i--) {
        var cardAction = card.actions[i];
        if(isMatchingCardAction(cardAction) && moment(cardAction.date) < nextDay) {
            ret = cardAction;
        }
    }

    if(!ret) return null;

    if(ret.type === 'updateCard' && ret.data.listAfter && isActiveCol(ret.data.listAfter)) {
        return { name: card.name, id: card.id, date: moment(ret.date), newColumn: ret.data.listAfter.id, cardClosed: (ret.data.card ? ret.data.card.closed : false) };
    } else if(ret.type === 'updateCard' && ret.data.card.closed) {
        return { name: card.name, id: card.id, date: moment(ret.date), newColumn: null, cardClosed: true };
    } else if (ret.type === 'createCard' && isActiveCol(ret.data.list)) {
        return { name: card.name, id: card.id, date: moment(ret.date), newColumn: ret.data.list.id, cardClosed: (ret.data.card ? ret.data.card.closed : false) };
    }
}

function doMagicChartOfDestiny(categories, series, targetElement) {
    var colors = [
        '#DB843D',
        '#4572A7',
        '#80699B',
        '#89A54E'
    ];

    if (series.length > 4) {
        colors.splice(1, 0, '#8895a3');
    }

    var chart;
    chart = new Highcharts.Chart({
        colors: colors,
        chart: {
            renderTo: targetElement,
            type: 'area'
        },
        title: {
            text: 'Tre-la-la CFD'
        },
        xAxis: {
            categories: categories,
            tickmarkPlacement: 'on',
            title: {
                enabled: false
            }
        },
        yAxis: {
            title: {
                text: 'Cards'
            }
        },
        tooltip: {
            formatter: function() {
                return ''+
                    this.x +': '+ this.y;
            }
        },
        plotOptions: {
            area: {
                stacking: 'normal',
                lineColor: '#666666',
                lineWidth: 0,
                marker: {
                    lineWidth: 1,
                    lineColor: '#666666'
                }
            }
        },
        series: series
    });
}

function buildDateSeries(startDate) {
    var series = [];
    var currentDate = startDate;
    var today = moment();
    while(currentDate < today) {
        series.push(currentDate);
        currentDate = currentDate.clone().add(1, 'day');
    }

    return series;
}

function getMetadata(boardId) {
    var deferred = $.Deferred();
    var kickoffDate, analysisCompleteDate, teamVelocity, releaseReadyDate, releasedOn;
    Trello
        .get('boards/' + boardId + '/lists?cards=open')
        .success(function(lists) {
            var analysisCompleteColId = null;

            $.each(lists, function(ix, list) {
                if (list.name.indexOf('Analysis Complete') != -1) {
                    analysisCompleteColId = list.id;
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

                        match = card.name.match(/^Team\ Velocity\ \(Points\/Day\) ?:\ (.*)$/);
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
            deferred.resolve({
                meta : {
                    kickoffDate: moment(kickoffDate),
                    analysisCompleteDate: moment(analysisCompleteDate),
                    teamVelocity: teamVelocity,
                    releaseReadyDate: moment(releaseReadyDate),
                    releasedOn: releasedOn
                }
            });
        });
    return deferred.promise();
}

//********************************************
// jQuery Plugins
//********************************************

$.fn.trelalaBoardSummary = function(boardId) {
    var $this = this;
    getBoardSummaryData(boardId).done(function(data) {
        completeId = $this.attr('id') + '-complete-' + boardId
        $this.html(
            '<table border=\'0\'>' +
            '<tr>' +
                '<td id=\'' + completeId + '\' rowspan=\'4\'></td> ' +
                '<td>Confidence: <b>' + data.confidence + '</b></td>' +
                '<td width=\'5px\'></td>' +
                '<td>Target date: <b>' + moment(data.projectedDoneDate).format("MM/DD/YYYY") + '</b></td> ' +
                '<td width=\'5px\'></td>' +
                '<td>Planned Story Units: <b>' + data.plannedStoryUnits + '</b></td> ' +
            '</tr>' +
            '<tr>' +
                '<td>Percent Complete (Actual): <b>' + data.percentCompleteLabel + '</b></td>' +
                '<td width=\'5px\'></td>' +
                '<td>Kickoff Date: <b>' + data.kickoffDate + '</b></td> ' +
                '<td width=\'5px\'></td>' +
                '<td>Revised Story Units: <b>' + data.currentStoryUnits + '</b></td> ' +
            '</tr>' +
            '<tr>' +
                '<td>&nbsp;</td>' +
                '<td width=\'5px\'></td>' +
                '<td>Release Ready Date: <b>' + data.releaseReadyDate + '</b></td> ' +
                '<td width=\'5px\'></td>' +
                '<td>Story Units Complete: <b>' + data.storyUnitsComplete + '</b></td> ' +
            '</tr>' +
            '<tr>' +
                '<td>&nbsp;</td>' +
                '<td width=\'5px\'></td>' +
                '<td>Released On: <b>' + data.releasedOn + '</b></td> ' +
                '<td width=\'5px\'></td>' +
                '<td>Total days in Blocked: <b><font ' + (data.totalBlockedDays > 0? 'color=red>': '>') + data.totalBlockedDays + '</font></b></td>' +
            '</tr>' +
            '</table>'
            );
        createPercentageCompleteChart('#' + completeId, data.percentComplete, 100);
    });
    return this;
};

$.fn.trelalaBoardDashboardSummary = function(boardId) {
    var $this = this;
    getBoardSummaryData(boardId).done(function(data) {
        completeId = $this.attr('id') + '-complete-' + boardId
        $this.html(
            '<table><tr>' +
            '<td id=\'' + completeId + '\'></td> ' +
            '<td>' +
            '<div>Confidence: <b>' + data.confidence + '</b></div>' +
            '<div>Target date: <b>' + moment(data.projectedDoneDate).format("MM/DD/YYYY") + '</b></div>' +
            '</td>' +
            '</tr></table>'
            );
        createPercentageCompleteChart('#' + completeId, data.percentComplete, 100);
    });
    return this;
};

$.fn.trelalaBoardScopeChangeHistory = function(boardId) {
    this.html(getScopeChangeHistory(boardId));
    return this;
};

$.fn.trelalaBoardCfd = function(boardId) {
    drawCFD(boardId, this.attr('id'));
    return this;
};

$.fn.trelalaBoardFrequencyChard = function(boardId) {
    drawFrequency(boardId, this.attr('id'));
    return this;
};