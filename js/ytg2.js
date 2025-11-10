function initDownloadLinks(e) {
    var value = document.getElementById("inputURL").value;
    console.log(value);
    var isVimeo = checkVimeo(value);
    console.log(isVimeo)
    if (isVimeo) {
        isVimeo = isVimeo[isVimeo.length - 1];
        getVimeoDetails(isVimeo);
        return 0;
    }
    var result = (extractValue(value));
    if (result === 0) {
        return 0;
    }
    appendImages(result);
    return false;
}

function downloadImage(id, quality) {
    fetch('https://app.youtube-thumbnail-grabber.com/api/downloadThumbnail?id=' + id + '&quality=' + quality)
        .then(resp => resp.blob())
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            // the filename you want
            a.download = id + "-" + quality + '.jpg';
            document.body.appendChild(a);
            a.click();
        });
}

function initFunction() {
    function getQueryStringValue(key) {
        return decodeURIComponent(window.location.search.replace(new RegExp("^(?:.*[&\\?]" + encodeURIComponent(key).replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1"));
    }

    var id = getQueryStringValue('id');
    var type = getQueryStringValue("type");
    if (type == "vimeo") {
        document.getElementById("inputURL").value = "https://vimeo.com/" + id
        var vimId = checkVimeo("https://www.vimeo.com/" + id);
        vimId = vimId[vimId.length - 1];

        getVimeoDetails(vimId);
        return 0;
    }
    if (id !== "") {
        appendImages(id);
    }
    document.getElementById("submitButton").onclick = function (e) {
        initDownloadLinks(e);
    }
    if (!(navigator.userAgent.toLowerCase().indexOf('firefox') > -1)) {
        var elem = document.getElementById("extension-container");
        if (elem) {
            elem.style.display = 'none';
        }
    }
}

function setDisplay(value) {
    var arrayOfElements = document.getElementsByClassName('download-bt');
    var lengthOfArray = arrayOfElements.length;

    for (var i = 0; i < lengthOfArray; i++) {
        arrayOfElements[i].style.display = value;
    }
}

function appendVimeoVideos(hdLink, mdLink, sdLink) {
    setDisplay("none");

    var clickElements = document.getElementsByClassName('download-btn');
    for (var i = 0; i < clickElements.length; i++) {
        clickElements[i].removeEventListener("click", clickBtnEvent);
    }


    document.getElementsByClassName('right-click-info')[0].style.display = "block";

    document.getElementById("hdrestext").textContent = "HD Image (640x480)";
    document.getElementById("sdrestext").textContent = "SD Image (200x150)";
    document.getElementById("normalrestext").textContent = "Normal Image (100x74)";
    document.getElementById("imgListing").style.display = "block";
    document.getElementById("bottomListing").style.display = "block";
    document.getElementById("topListing").style.display = "block";
    var element = document.getElementById("maxres")
    element.setAttribute("src", hdLink);
    element.style.display = "block";
    element = document.getElementById("hqres");
    element.setAttribute("src", sdLink);
    element.style.display = "block";
    element = document.getElementById("sdres");
    element.setAttribute("src", mdLink);
    document.getElementById("extraYTImg").style.display = "none";
    document.getElementById("hdreslink").style.display = "none";
    document.getElementById("sdreslink").style.display = "none";
    document.getElementById("hqreslink").style.display = "none";
}

function checkVimeo(data) {
    var res = data.match(/https?:\/\/(?:www\.|player\.)?vimeo.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|video\/|)(\d+)(?:$|\/|\?)/)
    return res;
}

function getVimeoDetails(link) {
    var xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == XMLHttpRequest.DONE) {   // XMLHttpRequest.DONE == 4
            if (xmlhttp.status == 200) {
                var data = (JSON.parse(xmlhttp.responseText));
                appendVimeoVideos(data[0].thumbnail_large, data[0].thumbnail_medium, data[0].thumbnail_small);
            } else if (xmlhttp.status == 400) {
                alert("There is no video in the vimeo link you have given");
            } else {
                alert("There is no video in the vimeo link you have given");
            }
        }
    };

    xmlhttp.open("GET", 'https://vimeo.com/api/v2/video/' + link + '.json', true);
    xmlhttp.send();

}

function isMaxResAvailable(result) {
    var img = new Image()
    img.onload = function () {
        if (this.width < 1280) {

            document.getElementById("hdreslink").style.display = "none";
            document.getElementById("hdrestext").textContent = "High resolution not available";
            isSDAvailalbe(result);
        } else {
            document.getElementById("hdrestext").textContent = "HD Image (1280x720)";
        }
    }
    img.onerror = function () {
        document.getElementById("sdrestext").textContent = "High resolution not available";
        isSDAvailalbe(result);
    }
    img.src = "https://img.youtube.com/vi/" + result + "/maxresdefault.jpg";

}

function isSDAvailalbe(result) {
    var img = new Image()
    img.onload = function () {
        if (this.width === 120 && this.height === 90) {
            document.getElementById("sdrestext").textContent = "Standard Quality not available";
            document.getElementById("sdreslink").style.display = "none";
        } else {
            document.getElementById("sdrestext").textContent = "SD Image (640x480)";
        }
    }
    img.onerror = function () {
        document.getElementById("sdrestext").textContent = "Standard Quality not available";

    }
    img.src = "https://img.youtube.com/vi/" + result + "/sddefault.jpg";

}

function clickBtnEvent() {
    downloadImage(this.getAttribute('data-id'), this.getAttribute('data-quality'))
}

function appendImages(result) {
    //document.getElementsByClassName("download-btn").style.display = "block";
    setDisplay("block");

    var clickElements = document.getElementsByClassName('download-btn');
    for (var i = 0; i < clickElements.length; i++) {
        clickElements[i].removeEventListener("click", clickBtnEvent);
        console.log(clickElements);
        clickElements[i].addEventListener('click', clickBtnEvent, false);
    }

    document.getElementsByClassName('right-click-info')[0].style.display = "none";

    document.getElementById('hdreslink').setAttribute("data-id", result);
    document.getElementById('hdreslink').setAttribute("data-quality", "HD");

    document.getElementById('sdreslink').setAttribute("data-id", result);
    document.getElementById('sdreslink').setAttribute("data-quality", "SD");


    document.getElementById('hqreslink').setAttribute("data-id", result);
    document.getElementById('hqreslink').setAttribute("data-quality", "HQ");


    document.getElementById('mqreslink').setAttribute("data-id", result);
    document.getElementById('mqreslink').setAttribute("data-quality", "MQ");

    document.getElementById('defreslink').setAttribute("data-id", result);
    document.getElementById('defreslink').setAttribute("data-quality", "def");



    document.getElementById("hdreslink").style.display = "inline";
    document.getElementById("sdreslink").style.display = "inline";
    document.getElementById("hqreslink").style.display = "inline";
    document.getElementById("inputURL").value = "https://youtube.com/watch?v=" + result;
    document.getElementById("imgListing").style.display = "block";
    document.getElementById("bottomListing").style.display = "block";
    document.getElementById("topListing").style.display = "block";
    document.getElementById("hdrestext").textContent = "HD Image (1280x720)";
    document.getElementById("sdrestext").textContent = "SD Image (640x480)";
    document.getElementById("normalrestext").textContent = "Normal Image (480x360)";
    document.getElementById("maxres").setAttribute("src", "https://img.youtube.com/vi/" + result + "/maxresdefault.jpg");//.removeClass("disabled");
    document.getElementById("sdres").setAttribute("src", "https://img.youtube.com/vi/" + result + "/sddefault.jpg");
    document.getElementById("hqres").setAttribute("src", "https://i3.ytimg.com/vi/" + result + "/hqdefault.jpg");
    document.getElementById("mqres").setAttribute("src", "https://img.youtube.com/vi/" + result + "/mqdefault.jpg");
    document.getElementById("defres").setAttribute("src", "https://img.youtube.com/vi/" + result + "/default.jpg");
    isMaxResAvailable(result);

    document.getElementById("extraYTImg").style.display = "block";
}

function extractValue(data) {
    var regex = /(?:https?:\/\/)?(?:www\.)?(?:youtu(?:be\.com\/(?:watch\?(?:v=|vi=)|v\/|vi\/)|\.be\/|be\.com\/embed\/|be\.com\/shorts\/)|youtube\.com\/\?(?:v=|vi=))([\w-]{11})/;
    var res = regex.exec(data)
    if (res && res[1]) {
        return res[1];
    }
    alert("Please check the URL you have entered");
    return 0;
}


initFunction();