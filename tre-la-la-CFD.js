function drawCFD(boardId, targetElement) {
    $.when(getMetadata(boardId), getLists(boardId),getCardData(boardId))
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

    var x = {};
    for(var i = 0; i < dates.length; i++) {
        var date = dates[i];
        for(var j = 0; j < cards.length; j++) {
            var card = cards[j];
            if(card.ignored)
                continue;
            var lastAction = getLastActionOfDay(card, date);

            if(!lastAction || !lastAction.newColumn) continue;

            if(lastAction.cardClosed) {
                card.ignored = true;
                continue;
            }

            if(!x[lastAction.newColumn]) {
                x[lastAction.newColumn] = $.map(new Array(dates.length), function() { return 0; });
            }
            var columnActions = x[lastAction.newColumn];
            columnActions[i] = columnActions[i] + 1;
        }
    }

    series = sortSeries(
        $.map(x, function(points, id) {
            return { name: listMap[id], data: points };
        })
    );

    doMagicChartOfDestiny(categories, series, state.targetElement);
}

function getCardStoryUnits(card) {
    var match = card.name.match(/\[([SML])\]/);
    if (match != null) {
        switch (match[1]) {
            case 'S':
                return 1;
            case 'M':
                return 2;
            case 'L':
                return 4;
        }
    }
};

function sortSeries(series) {
    var sorted = [];
    $.each(series, function (i, item) {
        if (item.name.indexOf('Analysis Complete') != -1) {
            sorted[0] = item;
        }
        else if (item.name.indexOf('Implementation') != -1) {
            sorted[1] = item;
        }
        else if (item.name.indexOf('Verification') != -1) {
            sorted[2] = item;
        }
        else if (item.name.indexOf('Release Ready') != -1) {
            sorted[3] = item;
        }
    });
    return sorted;
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
        } else {
            continue;
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
    var chart;
    chart = new Highcharts.Chart({
        colors: [
            '#DB843D',
            '#4572A7',
            '#80699B',
            '#89A54E'
        ],
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