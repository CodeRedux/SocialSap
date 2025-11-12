$(document).ready(function () {
initFunction();

if (window.matchMedia('(max-width: 750px)').matches) {
    var width = window.innerWidth - 50;
    width = width > 200 ? width : 200;
    $("ins").first().css("width", width + "px");
}
    function DownloadLinks(e) {
        var value = $("#inputURL").val();
        console.log(value);
        var isVimeo = checkVimeo(value);
        console.log(isVimeo);
        if (isVimeo) {
            isVimeo = isVimeo[isVimeo.length - 1];
            getVimeoDetails(isVimeo);
            return 0;
        }
        var result = extractValue(value);
        if (result === 0) {
            return 0;
        }
        appendImages(result);
        return false;
    }

    function downloadImage(id, quality) {
        console.log(id + "; " + quality);
    }

    function getQueryStringValue(key) {
        return decodeURIComponent(window.location.search.replace(
            new RegExp("^(?:.*[&\\?]" + encodeURIComponent(key).replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"
        ), "$1"));
    }

    function initFunction() {
        var id = getQueryStringValue('id');
        var type = getQueryStringValue("type");

        if (type === "vimeo") {
            $("#inputURL").val("https://vimeo.com/" + id);
            var vimId = checkVimeo("https://www.vimeo.com/" + id);
            vimId = vimId[vimId.length - 1];
            getVimeoDetails(vimId);
            return 0;
        }

        if (id !== "") {
            appendImages(id);
        }

        $("#submitButton").on('click', DownloadLinks);

        if (!(navigator.userAgent.toLowerCase().indexOf('firefox') > -1)) {
            $("#extension-container").hide();
        }
    }

    function setDisplay(value) {
        $('.download-bt').css('display', value);
    }

    function appendVimeoVideos(hdLink, mdLink, sdLink) {
        setDisplay("none");

        $('.download-btn').off('click', clickBtnEvent);
        $('.right-click-info').show();

        $("#hdrestext").text("HD Image (640x480)");
        $("#sdrestext").text("SD Image (200x150)");
        $("#normalrestext").text("Normal Image (100x74)");
        $("#imgListing, #bottomListing, #topListing").show();

        $("#maxres").attr("src", hdLink).show();
        $("#hqres").attr("src", sdLink).show();
        $("#sdres").attr("src", mdLink);

        $("#extraYTImg, #hdreslink, #sdreslink, #hqreslink").hide();
    }

    function checkVimeo(data) {
        var res = data.match(/https?:\/\/(?:www\.|player\.)?vimeo.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|video\/|)(\d+)(?:$|\/|\?)/);
        return res;
    }

    function getVimeoDetails(link) {
        $.ajax({
            url: 'https://vimeo.com/api/v2/video/' + link + '.json',
            type: 'GET',
            dataType: 'json',
            success: function (data) {
                appendVimeoVideos(data[0].thumbnail_large, data[0].thumbnail_medium, data[0].thumbnail_small);
            },
            error: function () {
                alert("There is no video in the vimeo link you have given");
            }
        });
    }

    function isMaxResAvailable(result) {
        var img = new Image();
        img.onload = function () {
            if (this.width < 1280) {
                $("#hdreslink").hide();
                $("#hdrestext").text("High resolution not available");
                isSDAvailable(result);
            } else {
                $("#hdrestext").text("HD Image (1280x720)");
            }
        };
        img.onerror = function () {
            $("#sdrestext").text("High resolution not available");
            isSDAvailable(result);
        };
        img.src = "https://img.youtube.com/vi/" + result + "/maxresdefault.jpg";
    }

    function isSDAvailable(result) {
        var img = new Image();
        img.onload = function () {
            if (this.width === 120 && this.height === 90) {
                $("#sdrestext").text("Standard Quality not available");
                $("#sdreslink").hide();
            } else {
                $("#sdrestext").text("SD Image (640x480)");
            }
        };
        img.onerror = function () {
            $("#sdrestext").text("Standard Quality not available");
        };
        img.src = "https://img.youtube.com/vi/" + result + "/sddefault.jpg";
    }

    function clickBtnEvent() {
        downloadImage($(this).data('id'), $(this).data('quality'));
    }

    function appendImages(result) {
        setDisplay("block");

        $('.download-btn').off('click', clickBtnEvent).on('click', clickBtnEvent);
        $('.right-click-info').hide();

        var links = ['hdreslink', 'sdreslink', 'hqreslink', 'mqreslink', 'defreslink'];
        var qualities = ['HD', 'SD', 'HQ', 'MQ', 'def'];

        links.forEach(function (id, i) {
            $("#" + id)
                .attr('data-id', result)
                .attr('data-quality', qualities[i])
                .show();
        });

        $("#inputURL").val("https://youtube.com/watch?v=" + result);
        $("#imgListing, #bottomListing, #topListing").show();

        $("#hdrestext").text("HD Image (1280x720)");
        $("#sdrestext").text("SD Image (640x480)");
        $("#normalrestext").text("Normal Image (480x360)");

        $("#maxres").attr("src", "https://img.youtube.com/vi/" + result + "/maxresdefault.jpg");
        $("#hdreslink").attr("onclick", "downloadThumbnail('https://img.youtube.com/vi/" + result + "/maxresdefault.jpg')");
        
        $("#sdres").attr("src", "https://img.youtube.com/vi/" + result + "/sddefault.jpg");
        $("#sdreslink").attr("onclick", "downloadThumbnail('https://img.youtube.com/vi/" + result + "/sddefault.jpg')");

        $("#hqres").attr("src", "https://i3.ytimg.com/vi/" + result + "/hqdefault.jpg");
        $("#hqreslink").attr("onclick", "downloadThumbnail('https://img.youtube.com/vi/" + result + "/hqdefault.jpg')");

        $("#mqres").attr("src", "https://img.youtube.com/vi/" + result + "/mqdefault.jpg");
        $("#mqreslink").attr("onclick", "downloadThumbnail('https://img.youtube.com/vi/" + result + "/mqdefault.jpg')");
        
        $("#defres").attr("src", "https://img.youtube.com/vi/" + result + "/default.jpg");
$("#defreslink").attr("onclick", "downloadThumbnail('https://img.youtube.com/vi/" + result + "/default.jpg')");

        isMaxResAvailable(result);
        $("#extraYTImg").show();
    }

    function extractValue(data) {
        var regex = /(?:https?:\/\/)?(?:www\.)?(?:youtu(?:be\.com\/(?:watch\?(?:v=|vi=)|v\/|vi\/)|\.be\/|be\.com\/embed\/|be\.com\/shorts\/)|youtube\.com\/\?(?:v=|vi=))([\w-]{11})/;
        var res = regex.exec(data);
        if (res && res[1]) {
            return res[1];
        }
        alert("Please check the URL you have entered");
        return 0;
    }
function downloadThumbnail(url) {
    $.ajax({
        url: url,
        method: 'GET',
        xhrFields: { responseType: 'blob' },
        success: function(blob) {
            $('<a>', {
                href: URL.createObjectURL(blob),
                download: 'youtube_thumbnail.jpg',
                css: { display: 'none' }
            })
            .appendTo('body')
            .get(0).click(); // Use .get(0) to get native element for click

            // Cleanup after a short delay
            setTimeout(function() {
                URL.revokeObjectURL(blob);
            }, 100);
        },
        error: function() {
            console.error('Download failed');
        }
    });
}

    // Initialize
    initFunction();
});