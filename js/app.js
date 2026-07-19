(function () {
    var urlParams = new URLSearchParams(window.location.search);
    var appId = urlParams.get('id');

    function loadAppData() {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", "https://raw.githubusercontent.com/msnsports-31000/10-Store/refs/heads/main/apps.xml", true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                var xml = xhr.responseXML;
                var apps = xml.getElementsByTagName("app");
                var targetApp = null;
                for (var i = 0; i < apps.length; i++) {
                    if (apps[i].getAttribute("id") === appId) {
                        targetApp = apps[i];
                        break;
                    }
                }
                if (targetApp) { renderApp(targetApp); }
            }
        };
        xhr.send();
    }

    function showNotification(title, body) {
        try {
            var notifications = Windows.UI.Notifications;
            var template = notifications.ToastTemplateType.toastText02;
            var toastXml = notifications.ToastNotificationManager.getTemplateContent(template);
            var textNodes = toastXml.getElementsByTagName("text");
            textNodes[0].appendChild(toastXml.createTextNode(title));
            textNodes[1].appendChild(toastXml.createTextNode(body));
            var toast = new notifications.ToastNotification(toastXml);
            notifications.ToastNotificationManager.createToastNotifier().show(toast);
        } catch (e) { console.error("Notifications only work in UWP container", e); }
    }

    function renderApp(app) {
        var name = getVal(app, "name");
        var version = getVal(app, "version"); // 1. Get the version value
        var icon = getVal(app, "icon");
        var pub = getVal(app, "publisher");
        var desc = getVal(app, "description");
        var packageUrl = getVal(app, "package");

        var html =
            '<div class="app-hero">' +
            '<img src="' + icon + '" class="app-logo-big">' +
            '<div class="app-info-right">' +
            '<div class="app-title">' + name + '</div>' +
            '<a class="app-publisher" href="apps.html?search=' + encodeURIComponent(pub) + '">' + pub + '</a>' +
            '<div class="app-version">Version ' + version + '</div>' + // 2. Add to HTML
            '<div id="dl-container">' +
            '<button class="btn-download" data-url="' + packageUrl + '">Download</button>' +
            '</div>' +
            '</div>' +
            '<div class="app-description">' + desc + '</div>' +
            '</div>' +
            '</div>';

        document.getElementById("app-content").innerHTML = html;

document.querySelector(".btn-download").addEventListener("click", function () {
    const url = this.dataset.url;

    sendDiscordNotification(name, function () {
        window.open(url, "_blank");
    });
});

    }

    function sendDiscordNotification(appName, callback) {
        var webhook = "https://discordapp.com/api/webhooks/1477692189625811186/yRXE2iba5d75XK3_K63bWu-FSZNS75-DdXAMCOFQvHi3hjF-3zSBon3RAbj56KglKyBB";
        var payload = JSON.stringify({ content: "**" + appName + "** was downloaded from webstore!" });
        var xhr = new XMLHttpRequest();
        xhr.open("POST", webhook, true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.onreadystatechange = function () { if (xhr.readyState === 4) { callback(); } };
        xhr.onerror = function () { callback(); };
        xhr.send(payload);
    }

    function getVal(parent, tag) {
        var el = parent.getElementsByTagName(tag)[0];
        return el ? el.textContent : "";
    }

    if (appId) { loadAppData(); }

})();
