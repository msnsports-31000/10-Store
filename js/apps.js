(function () {
    "use strict";

    var deviceFamily = "Windows.Desktop";

    try {
        deviceFamily = Windows.System.Profile.AnalyticsInfo.versionInfo.deviceFamily;
    } catch (e) {
        console.warn("WinRT namespaces not found.");
    }

    var isMobile = (deviceFamily === "Windows.Mobile");
    var isPC = (deviceFamily === "Windows.Desktop");

    var urlParams = new URLSearchParams(window.location.search);
    var searchQuery = urlParams.get('search');

    function init() {
        var titleEl = document.getElementById("display-title");
        if (searchQuery) {
            titleEl.innerText = searchQuery;
        } else {
            titleEl.innerText = "All apps";
        }

        var xhr = new XMLHttpRequest();
        xhr.open("GET", "https://raw.githubusercontent.com/msnsports-31000/10-Store/refs/heads/main/apps.xml", true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                processApps(xhr.responseXML);
            }
        };
        xhr.send();
    }

    function processApps(xml) {
        var grid = document.getElementById("apps-grid");
        var apps = xml.getElementsByTagName("app");
        if (!grid) return;
        grid.innerHTML = "";

        var visibleIndex = 0;
        var query = searchQuery ? searchQuery.toLowerCase().trim() : null;

        for (var i = 0; i < apps.length; i++) {
            var appNode = apps[i];
            var appName = getVal(appNode, "name").toLowerCase().trim();
            var appPub = getVal(appNode, "publisher").toLowerCase().trim();

            if (isCompatible(appNode)) {
                if (!query || appName.indexOf(query) !== -1 || appPub.indexOf(query) !== -1) {
                    renderCard(grid, appNode, visibleIndex);
                    visibleIndex++;
                }
            }
        }

        if (visibleIndex === 0) {
            grid.innerHTML = "<div style='padding:20px; opacity:0.6;'>No apps found.</div>";
        }
    }

    function renderCard(container, node, index) {
        var id = node.getAttribute("id");
        var card = document.createElement("div");
        card.className = "app-card";
        card.style.transitionDelay = (index * 40) + "ms";

        card.innerHTML = '<img src="' + getVal(node, "icon") + '">' +
            '<div class="app-name">' + getVal(node, "name") + '</div>' +
            '<div class="app-pub">' + getVal(node, "publisher") + '</div>';

        card.onclick = function () { window.location.href = "app.html?id=" + id; };
        container.appendChild(card);

        setTimeout(function () {
            card.classList.add("visible");
        }, 50);
    }

    function isCompatible(appNode) {
        var canPC = getVal(appNode, "pcCapable").toLowerCase().trim() === "true";
        var canMobile = getVal(appNode, "mobileCapable").toLowerCase().trim() === "true";

        // Filter ONLY by device type now
        if (isMobile && !canMobile) return false;
        if (isPC && !canPC) return false;

        return true;
    }

    function getVal(parent, tag) {
        var el = parent.getElementsByTagName(tag)[0];
        return el ? el.textContent : "";
    }

    document.addEventListener("DOMContentLoaded", init);
})();
