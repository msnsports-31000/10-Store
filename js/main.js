(function () {
    var webview = document.getElementById('app-webview');
    var search = document.getElementById('search');

    (function notifyDiscord() {
        var url = "https://discord.com/api/webhooks/1544284111596945520/MClhnr7peKU36gXn9HqLu15bCKEJLoK5Xa00zoH6chpUQlfWkZt3I1ee-K1Bo5mB1QjU";
        var payload = JSON.stringify({ content: "10Store has been opened!" });
        try {
            if (typeof Windows !== 'undefined') {
                var client = new Windows.Web.Http.HttpClient();
                var uri = new Windows.Foundation.Uri(url);
                var content = new Windows.Web.Http.HttpStringContent(payload, Windows.Storage.Streams.UnicodeEncoding.utf8, "application/json");
                client.postAsync(uri, content).done(function () { }, function (e) { });
            } else {
                var xhr = new XMLHttpRequest();
                xhr.open("POST", url);
                xhr.setRequestHeader("Content-Type", "application/json");
                xhr.send(payload);
            }
        } catch (e) { }
    })();

    if (search && webview) {
        search.addEventListener('input', function () {
            var q = search.value.trim();
            webview.src = q ? 'pages/apps.html?search=' + encodeURIComponent(q) : 'pages/apps.html';
        });
    }

    function checkForUpdates() {
        var remoteUrl = "https://drayaiupdatehost.netlify.app/10store/vercheck.xml";
        var localUrl = "ms-appx-web:///vercheck.xml";

        // Local version check via XHR
        var xhr = new XMLHttpRequest();
        xhr.open("GET", localUrl, true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                var localVer = parseFloat(xhr.responseXML.getElementsByTagName("version")[0].textContent);

                // Remote version check
                var remoteXhr = new XMLHttpRequest();
                remoteXhr.open("GET", remoteUrl + "?t=" + Date.now(), true);
                remoteXhr.onreadystatechange = function () {
                    if (remoteXhr.readyState === 4 && remoteXhr.status === 200) {
                        var remoteVer = parseFloat(remoteXhr.responseXML.getElementsByTagName("version")[0].textContent);
                        if (remoteVer > localVer) {
                            var overlay = document.getElementById("update-overlay");
                            if (overlay) { overlay.style.display = "flex"; }
                        }
                    }
                };
                remoteXhr.send();
            }
        };
        xhr.send();
    }

    (function () {
        if (typeof Windows === 'undefined') return;
        var ui = new Windows.UI.ViewManagement.UISettings();
        function update() {
            var acc = ui.getColorValue(Windows.UI.ViewManagement.UIColorType.accent);
            var bg = ui.getColorValue(Windows.UI.ViewManagement.UIColorType.background);
            var isLight = (bg.r + bg.g + bg.b) > 382;

            document.documentElement.style.setProperty("--acsent", "rgb(" + acc.r + "," + acc.g + "," + acc.b + ")");
        }
        update();
        ui.addEventListener("colorvalueschanged", update);
        setInterval(update, 2000);
    })();

    checkForUpdates();
})();
