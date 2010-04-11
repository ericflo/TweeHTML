$(document).ready(function() {
    var loading = false;
    var lastUpdated = new Date();
    function getPrettyLastUpdated() {
        var pretty = '';
        pretty += lastUpdated.getMonth() + '/' + lastUpdated.getDate() + '/';
        pretty += ('' + lastUpdated.getFullYear()).substring(2) + ' ';
        var am = true;
        var hour = lastUpdated.getHours();
        if(hour > 12) {
            hour -= 12;
            am = false;
        }
        pretty += hour + ':' + lastUpdated.getMinutes() + ' ';
        pretty += (am ? 'AM' : 'PM');
        return pretty;
    }
    function scrollViewport() {
        $('#refresh').show(0, function() {
            var elt = $('#statuses')[0];
            var pos = 0;
            while(elt != null) {
                pos += elt.offsetTop;
                elt = elt.offsetParent;
            }
            $('html, body').animate({scrollTop: pos}, 200);
        });
    }
    function statusesLoaded(data) {
        loading = false;
        lastUpdated = new Date();
        $('#refresh').html('<p class="title">Pull down to refresh</p><p>Last Updated: ' + getPrettyLastUpdated() + '</p>');
        var statuses = $('#statuses');
        var statusBundle = $('<div></div>');
        for(var i = 0; i < data.length; ++i) {
            var status = data[i];
            var statusId = 'status-' + status.id;
            if($('#' + statusId).length > 0) {
                continue;
            }
            var username = status.user.screen_name;
            var dateDiff = Twitter.twitterDateDiff(status.created_at);
            var html = $('<div class="status" id="' + statusId + '">' +
                '<div class="avatar" style="background-image: url(http://img.tweetimag.es/i/' + username + '_n)">' +
                '</div><div class="content"><span class="username">' +
                username + '</span><span class="timestamp">' + dateDiff +
                '</span><div class="status-text">' + status.text + '</div></div>' + 
                '<div class="clear"></div></div>');
            html.bind('click', function() {
                /* Navigate to the single-status view */
                return false;
            });
            statusBundle.append(html);
        }
        statuses.prepend(statusBundle);
        scrollViewport();
    }
    function loadStatuses() {
        loading = true;
        $('#refresh').html('<img class="ajax-loader" src="images/ajax-loader.gif"></img><p class="title">Loading...</p><p>Last Updated: ' + getPrettyLastUpdated() + '</p>');
        $.ajax({
            'url': 'http://api.twitter.com/1/statuses/public_timeline.json',
            /*'url': 'http://api.twitter.com/1/statuses/user_timeline/ericflo.json',*/
            'success': statusesLoaded,
            'dataType': 'jsonp'
        });
    }
    $(window).bind('scroll', function() {
        var threshold = $(window).scrollTop();
        var refresh = $('#refresh');
        console.log('threshold: ' + threshold + ', refresh.offset().top: ' + refresh.offset().top + ', refresh.height(): ' + refresh.height());
        if(!loading && threshold < refresh.offset().top + refresh.height()) {
            loadStatuses();
        }
    });
    $('#refresh').hide(0, function() {
        loadStatuses();
    });
});