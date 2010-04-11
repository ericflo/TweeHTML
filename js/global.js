$(document).ready(function() {
    $(window).bind('scroll', function() {
        var threshold = $(window).scrollTop();
        var refresh = $('#refresh');
        if(!twitter.loading && threshold < refresh.offset().top + refresh.height()) {
            twitter.fetch();
        }
    });
    twitter.fetch();
});