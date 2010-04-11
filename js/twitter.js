var Twitter = {
    twitterDateDiff: function(stamp) {
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
    },
    annotateTweetLinks: function(text) {
        var matches = text.match(/https?:\/\/\S+/g);
        if (!matches) {
            return text;
        }
        while (matches.length > 0) {
            var url = matches.shift();
            text = text.replace(url, '<a target="_blank" class="tweet-link" href="' + url + '">' + url + '</a>');
        }
        return text;
    },
    annotateTweetUsernames: function(text) {
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
    },
    annotateTweetHashes: function(text) {
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
    },
    annotateTweet: function(text) {
        text = this.annotateTweetLinks(text);
        text = this.annotateTweetUsernames(text);
        text = this.annotateTweetHashes(text);
        return text;
    }
}