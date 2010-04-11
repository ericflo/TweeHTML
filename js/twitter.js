function TwitterUtils() {
    
}

TwitterUtils.prototype.twitterDateDiff = function(stamp) {
    var now = new Date().getTime();
    var date = new Date(Date.parse(stamp)).getTime();
    var diff = parseInt((now - date) / 1000);
    if(diff === 0) {
        return 'just now';
    }
    if(diff < 60) {
        return '' + diff + ' sec' + (diff === 1 ? '' : 's');
    }
    diff = parseInt(diff / 60);
    if(diff < 60) {
        return '' + diff + ' min' + (diff === 1 ? '' : 's');
    }
    diff = parseInt(diff / 60);
    if(diff < 24) {
        return '' + diff + ' hour' + (diff === 1 ? '' : 's');
    }
    diff = parseInt(diff / 24);
    return '' + diff + ' day' + (diff === 1 ? '' : 's');
};

TwitterUtils.prototype.annotateTweetLinks = function(text) {
    var matches = text.match(/https?:\/\/\S+/g);
    if (!matches) {
        return text;
    }
    while (matches.length > 0) {
        var url = matches.shift();
        text = text.replace(url, '<a target="_blank" class="tweet-link" href="' + url + '">' + url + '</a>');
    }
    return text;
};

TwitterUtils.prototype.annotateTweetUsernames = function(text) {
    var matches = text.match(/@[a-zA-z0-9_]+/g);
    if (!matches) {
        return text;
    }
    while (matches.length > 0) {
        var match = matches.shift();
        var username = match.substring(1);
        text = text.replace(match, '<a target="_blank" class="tweet-username" href="http://twitter.com/' + username + '">@' + username + '</a>');
    }
    return text;
};

TwitterUtils.prototype.annotateTweetHashes = function(text) {
    var matches = text.match(/#[a-zA-z0-9]{2,}/g);
    if (!matches) {
        return text;
    }
    while (matches.length > 0) {
        var match = matches.shift();
        var hash_tag = match.substring(1);
        text = text.replace(match, '<a target="_blank" class="tweet-hash" href="http://twitter.com/#search?q=' + hash_tag + '">#' + hash_tag + '</a>');
    }
    return text;
};

TwitterUtils.prototype.annotateTweet = function(text) {
    text = this.annotateTweetLinks(text);
    text = this.annotateTweetUsernames(text);
    text = this.annotateTweetHashes(text);
    return text;
};

var twitterUtils = new TwitterUtils();

function Twitter(username) {
    this.loading = false;
    this.lastUpdated = null;
    this.username = username;
    /*this.currentPanel = 'sample';*/
    this.currentPanel = 'public';
    this.statuses = {
        'all': [],
        'sample': [],
        'public': [],
        'timeline': [],
        'home': []
    };
    this.currentRenderer = 'simple';
    this.bindTweetReloader();
}

Twitter.prototype.renderSimpleStatus = function(status) {
    var username = status.user.screen_name;
    var dateDiff = twitterUtils.twitterDateDiff(status.created_at);
    var html = ('<div class="status" id="status-' + status.id + '">' +
        '<div class="avatar" style="background-image: ' +
        'url(http://img.tweetimag.es/i/' + username + '_n)">' +
        '</div><div class="content"><span class="username">' +
        username + '</span><span class="timestamp">' + dateDiff +
        '</span><div class="status-text">' + status.text + '</div></div>' + 
        '<div class="clear"></div></div>');
    return $(html);
};

Twitter.prototype.renderDetailedStatus = function(status) {
    var username = status.user.screen_name;
    var text = twitterUtils.annotateTweet(status.text);
    var html = ('<div class="user"><div class="avatar" ' +
        'style="background-image: url(http://img.tweetimag.es/i/' + username +
        '_n)"></div><span class="name">' + status.user.name +
        '</span><span class="username">' + username + '</span>' +
        '<div class="status-text">' + text + '</div></div>');
    return $(html);
};

Twitter.prototype.renderStatus = function(status) {
    var rendered = null;
    if(this.currentRenderer === 'simple') {
        rendered = this.renderSimpleStatus(status);
    }
    else if(this.currentRenderer === 'detailed') {
        rendered = this.renderDetailedStatus(status);
    }
    return this.addStatusHandlers(rendered);
};

Twitter.prototype.slideLeft = function() {
    var currentMargin = $('body').css('marginLeft');
    currentMargin = parseInt(currentMargin.replace('px', ''), 10);
    var newMargin = currentMargin - $($('.panel')[0]).width();
    $('body').animate({'marginLeft': newMargin}, 200);
};

Twitter.prototype.slideRight = function(leftPanel) {
    var currentMargin = $('body').css('marginLeft');
    currentMargin = parseInt(currentMargin.replace('px', ''), 10);
    var newMargin = currentMargin + $($('.panel')[0]).width();
    $('body').animate({'marginLeft': newMargin}, 200);
}

Twitter.prototype.setPanelHeight = function(panel) {
    panel.css('marginTop', $(window).scrollTop() + 'px');
};

Twitter.prototype.displaySingleStatus = function(statusId) {
    this.currentRenderer = 'detailed';
    var status = this.statuses.all[statusId];
    var rendered = this.renderStatus(status);
    $('#single-status').html(rendered);
    $('body').css('overflow', 'hidden');
    this.unbindTweetReloader();
    this.setPanelHeight($('#single-status'));
    this.slideLeft();
};

Twitter.prototype.buildTweetReloader = function() {
    var instance = this;
    if(this.tweetReloader) {
        return this.tweetReloader;
    }
    this.tweetReloader = function() {
        var threshold = $(window).scrollTop();
        var refresh = $('#refresh');
        if(!instance.loading && threshold < refresh.offset().top + refresh.height()) {
            instance.fetch();
        }
    };
    return this.tweetReloader;
};

Twitter.prototype.bindTweetReloader = function() {
    $(window).bind('scroll', this.buildTweetReloader());
};

Twitter.prototype.unbindTweetReloader = function() {
    $(window).unbind('scroll', this.buildTweetReloader());
};

Twitter.prototype.addStatusHandlers = function(element) {
    var instance = this;
    element.bind('click', function() {
        $('#statuses .selected').removeClass('selected');
        $(this).addClass('selected');
        var statusId = parseInt(this.id.replace('status-', ''), 10);
        instance.displaySingleStatus(statusId);
        return false;
    });
    return element;
};

Twitter.prototype.getPrettyLastUpdated = function() {
    if(!this.lastUpdated) {
        return 'Never';
    }
    var pretty = '';
    pretty += this.lastUpdated.getMonth() + '/' + this.lastUpdated.getDate();
    pretty += ('/' + this.lastUpdated.getFullYear()).substring(2) + ' ';
    var am = true;
    var hour = this.lastUpdated.getHours();
    if(hour > 12) {
        hour -= 12;
        am = false;
    }
    pretty += hour + ':' + this.lastUpdated.getMinutes() + ' ';
    pretty += (am ? 'AM' : 'PM');
    return pretty;
};

Twitter.prototype.preLoad = function() {
    this.loading = true;
    $('#refresh').html(
        '<img class="ajax-loader" src="images/ajax-loader.gif"></img>' +
        '<p class="title">Loading...</p><p>Last Updated: ' +
        this.getPrettyLastUpdated() + '</p>');
};

Twitter.prototype.postLoad = function() {
    this.loading = false;
    this.lastUpdated = new Date();
    $('#refresh').html(
        '<p class="title">Pull down to refresh</p><p>Last Updated: ' +
        this.getPrettyLastUpdated() + '</p>');
};

Twitter.prototype.postRender = function() {
    /* Scroll the viewport */
    $('#refresh').show(0, function() {
        var elt = $('#statuses')[0];
        var pos = 0;
        while(elt != null) {
            pos += elt.offsetTop;
            elt = elt.offsetParent;
        }
        $('html, body').animate({scrollTop: pos}, 200);
    });
};

Twitter.prototype.buildStatusesLoadedCallback = function() {
    var instance = this;
    var statusesLoaded = function(data) {
        instance.postLoad();
        var statusBundle = $('<div></div>');
        for(var i = 0; i < data.length; ++i) {
            var status = data[i];
            if(instance.statuses[instance.currentPanel][status.id]) {
                continue;
            }
            instance.statuses[instance.currentPanel][status.id] = status;
            instance.statuses.all[status.id] = status;
            statusBundle.append(instance.renderStatus(status));
        }
        $('#statuses').prepend(statusBundle);
        instance.postRender();
    };
    return statusesLoaded;
};

Twitter.prototype.fetch = function() {
    this.preLoad();
    var url = null;
    var dataType = 'jsonp';
    if(this.currentPanel === 'sample') {
        url = 'sample.json';
        dataType = 'json';
    }
    else if(this.currentPanel === 'public') {
        url = 'http://api.twitter.com/1/statuses/public_timeline.json';
    }
    else if(this.currentPanel === 'timeline') {
        url = 'http://api.twitter.com/1/statuses/user_timeline/' + this.username + '.json';
    }
    else if(this.currentPanel === 'home') {
        url = 'http://api.twitter.com/1/statuses/home_timeline.json';
    }
    $.ajax({
        'url': url,
        'success': this.buildStatusesLoadedCallback(),
        'error': this.postLoad,
        'dataType': dataType
    });
};

var twitter = new Twitter();