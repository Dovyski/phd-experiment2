var APP = APP || {};

APP.Monitor = function(theContainerId, theApp) {
    this.mContainerId = theContainerId;
    this.mApp = theApp;
    this.mIntervalId = -1;
    this.mSession = null;
    this.mLastReceivedInfo = null;
    this.mPlayedGames = [];
    this.mCurrentMilestone = '?';
    this.mTimeAppStart = Date.now();
};

APP.Monitor.prototype.run = function() {
    this.buildLayoutStructure();

    // Load info about active sessions
    this.mApp.loadData({method: 'active'}, function(theData) {
        if(theData.success) {
            this.mSession = theData.data[theData.data.length - 1];
            this.mIntervalId = setInterval(this.update, 1000, this);
        }
    }, this);
};

APP.Monitor.prototype.stop = function() {
    clearInterval(this.mIntervalId);
};

APP.Monitor.prototype.updateActiveSessionCurrentMilestone = function(theBackendData) {
    var aStatus = '';

    for(var i = 0, aSize = theBackendData.length; i < aSize; i++) {
        var aEntry = theBackendData[i];
        var aData = JSON.parse(aEntry.d);

        if(typeof(aData) == "string") {
            aStatus = aData;
        }
    }

    if(aStatus != '') {
        this.mCurrentMilestone = aStatus;
    }
};

APP.Monitor.prototype.prettifyMilestoneString = function(theCurrentStatus) {
    var aTexts = {
        'experiment_hr_start': 'Sync\'d and waiting to start',
        'menu_start': 'Watching game title screen',
        'tutorial_start': 'Doing game tutorial',
        'game_start': 'Playing game',
        'game_end': 'Watching game over screen',
        'experiment_game_end': 'Answering game questionnaire',
        'experiment_rest_start': 'Resting',
        'experiment_final_questions_start': 'Answering final questionnaire',
        'experiment_end': '<strong style="color: red;">Completed experiment session</strong>'
    };

    if(theCurrentStatus in aTexts) {
        return aTexts[theCurrentStatus];
    } else {
        return '?';
    }
};

APP.Monitor.prototype.getGameNameById = function(theGameId) {
    var aName = '?', aNames = {
        1: 'Mushroom',
        2: 'Tetris',
        3: 'Platformer',
        4: 'Mario-A1',
        5: 'Mario-A2',
        6: 'Mario-A3',
        7: 'Mario-B1',
        8: 'Mario-B1',
        9: 'Mario-B3',
        10: 'Mario-C1'
    };

    if(theGameId in aNames) {
        aName = aNames[theGameId];
    }

    return aName;
};

APP.Monitor.prototype.getGameNamesByIds = function(theGameIds) {
    var aNames = [];

    if(theGameIds.length == 0) {
        return '';
    }

    for(var i = 0; i < theGameIds.length; i++) {
        aNames.push(this.getGameNameById(theGameIds[i]));
    }

    return aNames.join(', ');
};

APP.Monitor.prototype.updateActiveSessionInfo = function(theData) {
    if(!$('#data-table').is(':visible')) {
        $('#data-table').show();
        $('#data-waiting').hide();
    }

    $('#data-table-user').html(this.mSession.uuid);

    if(theData == null) {
        return;
    }

    if(this.mPlayedGames.length == 0 || this.mPlayedGames[this.mPlayedGames.length - 1] != theData.fk_game) {
        if(theData.fk_game > 0) {
            this.mPlayedGames.push(theData.fk_game);
        }
    }

    this.updateActiveSessionCurrentMilestone(theData.data);

    $('#data-table-status').html(this.prettifyMilestoneString(this.mCurrentMilestone));
    $('#data-table-milestone').html(this.mCurrentMilestone);

    if(this.mCurrentMilestone == 'experiment_rest_start' || theData.fk_game < 0) {
        $('#data-table-current').html('<em>none</em>');
    } else {
        $('#data-table-current').html(this.getGameNameById(theData.fk_game));
    }

    var aDurationSeconds = this.getTimeSinceBegining(theData.timestamp);

    $('#data-table-played').html(this.getGameNamesByIds(this.mPlayedGames));
    $('#data-table-time').html(this.formatSeconds(aDurationSeconds));
    $('#data-table-log').html('<code>' + JSON.stringify(theData.data) + '</code>');
}

// Source: https://stackoverflow.com/a/6313008/29827
APP.Monitor.prototype.formatSeconds = function (theAmountSeconds) {
    var aSecNum = parseInt(theAmountSeconds + '', 10); // don't forget the second param
    var aHours   = Math.floor(aSecNum / 3600);
    var aMinutes = Math.floor((aSecNum - (aHours * 3600)) / 60);
    var aSeconds = aSecNum - (aHours * 3600) - (aMinutes * 60);

    if (aHours   < 10) { aHours   = '0' + aHours;   }
    if (aMinutes < 10) { aMinutes = '0' + aMinutes; }
    if (aSeconds < 10) { aSeconds = '0' + aSeconds; }

    return aHours + ':' + aMinutes + ':' + aSeconds;
}

APP.Monitor.prototype.updateAppClock = function() {
    var aTimeDiff = Date.now() - this.mTimeAppStart;
    var aFormattedTime = this.formatSeconds(aTimeDiff / 1000);

    $('#app-clock').html(aFormattedTime);
};

APP.Monitor.prototype.update = function(theMonitor) {
    theMonitor.updateAppClock();

    if(theMonitor.mSession == null) {
        return;
    }

    var aConfig = {
        method: 'monitor',
        user: theMonitor.mSession.uuid
    };

    theMonitor.mApp.loadData(aConfig, function(theData) {
        if(theData.success) {
            if(theData.data && theData.data.length > 0) {
                this.mLastReceivedInfo = theData.data[theData.data.length - 1];
            }

            this.updateActiveSessionInfo(this.mLastReceivedInfo);
        }
    }, theMonitor);
};

APP.Monitor.prototype.getTimeSinceBegining = function(theCurrentTimestamp) {
    var aTime = theCurrentTimestamp - this.mSession.timestamp;
    return aTime;
};

APP.Monitor.prototype.buildLayoutStructure = function() {
    var aOut = '';

    aOut =
    '<div class="page-title">' +
        '<div class="title_left">' +
            '<h3 id="subject-id"></h3>' +
        '</div>' +

        '<div class="title_right"></div>' +
    '</div>' +
    '<div class="clearfix"></div>' +

    '<div class="row">' +
        '<div class="col-md-12">' +
            '<div class="x_panel">' +
                '<div class="x_title">' +
                    '<h2>Current active session</h2> <span id="app-clock">00:00:00</span><i class="fa fa-refresh fa-spin" style="margin-left: 10px; margin-top: 8px;"></i>' +
                    '<div class="clearfix"></div>' +
                '</div>' +
                '<div class="x_content">' +
                    '<div class="row">' +
                        '<div class="col-md-12" style="padding: 10px;">' +
                            '<table class="table table-bordered" id="data-table" style="display:none;">' +
                                '<tr><td class="active-status-prop">User</td><td id="data-table-user"></td></tr>' +
                                '<tr><td class="active-status-prop">Session duration</td><td id="data-table-time"></td></tr>' +
                                '<tr><td class="active-status-prop">Current game</td><td id="data-table-current"></td></tr>' +
                                '<tr><td class="active-status-prop">Played games</td><td id="data-table-played"></td></tr>' +
                                '<tr><td class="active-status-prop">Subject status</td><td id="data-table-status"></td></tr>' +
                                '<tr><td class="active-status-prop">Last milestone</td><td id="data-table-milestone"></td></tr>' +
                                '<tr><td class="active-status-prop">Log</td><td id="data-table-log"></td></tr>' +
                            '</table>' +
                            '<p id="data-waiting">Waiting for session to start. Click <a href="javascript:void(0)" class="action-link" data-action="active">here</a> to refresh.</p>' +
                        '</div>' +
                    '</div>' +
                    '<div class="row">' +
                        '<div id="legend-area" class="col-md-12"></div>' +
                    '</div>' +
                    '<div class="clearfix"></div>' +
                '</div>' +
            '</div>' +
        '</div>' +
    '</div>';

    $('#' + this.mContainerId).html(aOut);
};
