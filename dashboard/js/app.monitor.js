var APP = APP || {};

APP.Monitor = function(theContainerId, theApp) {
    this.mContainerId = theContainerId;
    this.mApp = theApp;
    this.mIntervalId = -1;
    this.mSession = null;
    this.mLastReceivedInfo = null;
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

APP.Monitor.prototype.updateActiveSessionInfo = function(theData) {
    if(!$('#data-table').is(':visible')) {
        $('#data-table').show();
        $('#data-waiting').hide();
    }

    $('#data-table-user').html(this.mSession.uuid);
    $('#data-table-game').html(this.mSession.uuid);
    $('#data-table-time').html(this.getTimeSinceBegining(theData.timestamp));
    $('#data-table-status').html(JSON.stringify(theData.data));
}

APP.Monitor.prototype.update = function(theMonitor) {
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

            if(this.mLastReceivedInfo) {
                this.updateActiveSessionInfo(this.mLastReceivedInfo);
            }
        }
    }, theMonitor);
};

APP.Monitor.prototype.getTimeSinceBegining = function(theCurrentTimestamp) {
    var aTime = theCurrentTimestamp - this.mSession.timestamp;
    var aMinutes = Math.floor(aTime / 60);
    var aSeconds = aTime - aMinutes * 60;

    return (aMinutes < 10 ? '0' + aMinutes : aMinutes) + ':' + (aSeconds < 10 ? '0' + aSeconds : aSeconds);
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
                    '<h2>Current active session</h2> <i class="fa fa-refresh fa-spin" style="margin-left: 10px; margin-top: 8px;"></i>' +
                    '<div class="clearfix"></div>' +
                '</div>' +
                '<div class="x_content">' +
                    '<div class="row">' +
                        '<div class="col-md-12" style="padding: 10px;">' +
                            '<table class="table table-bordered" id="data-table" style="display:none;">' +
                                '<tr><td class="active-status-prop">User</td><td id="data-table-user"></td></tr>' +
                                '<tr><td class="active-status-prop">Time in experiment</td><td id="data-table-time"></td></tr>' +
                                '<tr><td class="active-status-prop">Current game</td><td id="data-table-current"></td></tr>' +
                                '<tr><td class="active-status-prop">Played games</td><td id="data-table-played"></td></tr>' +
                                '<tr><td class="active-status-prop">Status</td><td id="data-table-status"></td></tr>' +
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
