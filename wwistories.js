function getParameterByName(name, inputstring) {
    var ips;
    if (inputstring.length == 0)
        ips = window.location;
    else
        ips = inputstring;
    var match = RegExp('[?&]' + name + '=([^&]*)').exec(ips);
    return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
}

$('#story').live("pageshow", function() {


/*
//laod article for selected id
$('div[data-url*="view.htm?id"]').live("pageshow", function () {

    var articleId = getParameterByName("id", $(this).data("url"));
    var tempdataurl = $(this).attr('data-url');
    if (articleId == null || tempdataurl == null) return;

    //caching for article is disabled as dom size will increase. 
    //As per beta 2 data-dom-cache="true" is NOT set for view article page.
    //if ($('[data-url*="' + tempdataurl + '"] ul[data-role=listview]').children(0).text() != "Loading..") return;

    $.ajax({
        type: "POST",
        url: "../DataProvider.asmx/GetMobileArticle",
        data: "{'articleID':" + articleId + "}",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (msg) {
            $.mobile.showPageLoadingMsg();

            var maincont = $('[data-url="' + tempdataurl + '"] [data-role=content] #maincontent');
            $(maincont).html("");


            $(maincont).append('<h4>' + msg.d.article.ArticleHeading + '</h4>\
                        <p class="ui-li-desc" ><b>By: ' + msg.d.article.ArticleAuthorName + '</b></p>\
                        <div class="label" ><div class="labeli"><span>' + msg.d.article.Technologies + '</span></div></div>\
                        <div class="dotted-line" ></div>');
            $(maincont).append('<div>' + msg.d.article.Content + '</div>');
            $(maincont).append('<br/><p class="ui-li-desc" ><em>Posted on ' + msg.d.article.ArticlePostDateInLongDate + '</em></p>');

            //set header
            $.mobile.activePage.find('.ui-title').text(msg.d.article.ArticleHeading);

            $('[data-url="' + tempdataurl + '"] ul[data-role=listview]').listview('refresh');

            //syntax highlighter
            dp.SyntaxHighlighter.ClipboardSwf = '../Script/codescript/clipboard.swf';
            dp.SyntaxHighlighter.HighlightAll('code');

            $.mobile.activePage.find('#sharelink').attr('href', '/m/share.htm?id=' + articleId + '&title=' + msg.d.article.ArticleHeading);

            $.mobile.hidePageLoadingMsg();
        }
                ,
        error: function () {
            $('[data-url="' + tempdataurl + '"] div[data-role="content"]').html("Error loading article. Please try web version.");
        }
    });

});


//attach event to all pages having "cat" parameter in data-url
$('div[data-url*="articles.htm?cat"]').live("pageshow", function () {

    var articleCategory = getParameterByName("cat", $(this).data("url"));
    var tempdataurl = $(this).attr('data-url');
    if (articleCategory == null || tempdataurl == null) return;

    if ($(this).find('input[data-type="search"]').val() != '') {
        $(this).find('input[data-type="search"]').val(''); //clear search text if dom is cached
        $(this).find('input[data-type="search"]').trigger("change"); //refresh list client side        
    }

    //1 day TTL for cache.
    var dt = new Date();
    var tdt = (dt.getMonth() + 1) + '/' + (dt.getDate()+1) + '/' + dt.getFullYear();

    //console.log($(this).attr('dom-cache-expires'));
    var edt = $(this).attr('dom-cache-expires');
    if (edt == tdt) {
        return;
    }
    $(this).attr('dom-cache-expires', tdt);

    //if ($('[data-url*="' + tempdataurl + '"] ul[data-role=listview]').children(0).text() != "Loading..") return;

    $.ajax({
        type: "POST",
        url: "/DataProvider.asmx/GetMobileArticles",
        data: "{'CategoryID':" + articleCategory + "}",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (msg) {

            $.mobile.showPageLoadingMsg();

            $('[data-url="' + tempdataurl + '"] ul[data-role=listview]').html("");

            var str = ""; // "<li data-role='list-divider'>Select</li>";

            $(msg.d).each(function (index) {
                str += "<li>\
                        <a href='view.htm?id=" + msg.d[index].ArticleId + "'><h3>" + msg.d[index].ArticleHeading + "</h3>\
                        <p>" + msg.d[index].ArticleShortDescription + "</p>\
                        <p><strong>By " + msg.d[index].ArticleAuthorName + "</strong> on " + msg.d[index].PostDate + "</p>\
                        <p>Views:" + msg.d[index].Views + "</p></a>\
                        </li>";

                //<div class='ui-li-aside'><p>Technology" + msg.d[index].TechnologyID + "</p>\
                //<p>Views:" + msg.d[index].Views + "</p></div>\
                //<span class='ui-li-count'>" + msg.d[index].Views + "</span>\
            });
            if (msg.d.length == 0) {
                str += "<li>\
                        <p>There are no items to show in this view.</p>\
                        </li>";
            }

            $('[data-url="' + tempdataurl + '"] ul[data-role=listview]').html(str);
            $('[data-url="' + tempdataurl + '"] ul[data-role=listview]').listview('refresh');

            var paramTechName = getParameterByName("t", $.mobile.path.parseUrl(window.location));

            //set header
            $.mobile.activePage.find('.ui-title').text(paramTechName);

            $.mobile.hidePageLoadingMsg();
        }
                ,
        error: function () {
            $('[data-url="' + tempdataurl + '"] div[data-role="content"]').html("Error loading articles. Please try web version.");
        }
    });

});


//laod categories
$('div[id="categories"]').live("pageshow", function () {

    if ($('div[id="categories"] ul[data-role="listview"]').children(0).text() != "Loading..") return;
    $.ajax({
        type: "POST",
        url: "/DataProvider.asmx/GetCategories",
        data: "{}",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (msg) {
            //alert($('div[id=categories] ul[data-role=listview]').text());
            $.mobile.showPageLoadingMsg();
            $('div[id="categories"] ul[data-role="listview"]').html("");

            var str = "<li data-role='list-divider'>Select</li>";

            $(msg.d).each(function (index) {
                str += "<li role='option' tabindex='-1' data-theme='c'><a href='articles.htm?cat=" + msg.d[index].TechnologyID + "&t=" + jQuery.trim(msg.d[index].TechnologyName) + "'  >" + msg.d[index].TechnologyName + "</a></li>";
                //str += "<li role='option' tabindex='-1' data-theme='c'><a data-identity='cat" + msg.d[index].TechnologyID + "' data-url='#cat" + msg.d[index].TechnologyID + "'   >" + msg.d[index].TechnologyName + "</a><span class='ui-li-count'>" + msg.d[index].ArticlesCount + "</span></li>";
            });

            $('div[id="categories"] ul[data-role="listview"]').html(str);
            $('div[id="categories"] ul[data-role="listview"]').listview('refresh');
            $.mobile.hidePageLoadingMsg();
        }
                ,
        error: function () {
            $('div[data-url="categories"] div[data-role="content"]').html("Error loading categories. Please try web version.");
        }
    });

});

$('div[id="recent"]').live("pageshow", function () {

    $.ajax({
        type: "POST",
        url: "/DataProvider.asmx/GetJsonArticles",
        data: "{'CategoryID':0}",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (msg) {
            $.mobile.showPageLoadingMsg();
            $('div[id="recent"] ul[data-role="listview"]').html("");

            var str = "<li data-role='list-divider'>Select</li>";

            $(msg.d).each(function (index) {
                str += "<li>\
                        <a href='view.htm?id=" + msg.d[index].ArticleId + "'><h3>" + msg.d[index].ArticleHeading + "</h3>\
                        <p>" + msg.d[index].ArticleShortDescription + "</p>\
                        <p><strong>By " + msg.d[index].ArticleAuthorName + "</strong> on " + msg.d[index].PostDate + " - Views:" + msg.d[index].Views + "</p>\
                        <div class='label'><div class='labeli'><span>" + msg.d[index].Technologies + "</span></div></div>\
                        </a>\
                        </li>";


                //<div class='ui-li-aside'><p>Technology" + msg.d[index].TechnologyID + "</p>\
                //<p>Views:" + msg.d[index].Views + "</p></div>\
                //<span class='ui-li-count'>" + msg.d[index].Views + "</span>\

            });

            $('div[id="recent"] ul[data-role="listview"]').html(str);
            $('div[id="recent"] ul[data-role="listview"]').listview('refresh');
            $.mobile.hidePageLoadingMsg();
        }
                ,
        error: function () {
            $('div[id="recent"] div[data-role="content"]').html("Error loading articles. Please try web version.");
        }
    });

});
*/