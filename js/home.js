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

    function loadHomeContent() {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", "https://raw.githubusercontent.com/msnsports-31000/10-Store/refs/heads/main/apps.xml", true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                var xml = xhr.responseXML;
                var scrollContainer = document.getElementById("scroll-container");
                if (!scrollContainer) return;

                scrollContainer.innerHTML = "";

                var categories = xml.getElementsByTagName("category");
                var allApps = xml.getElementsByTagName("app");

                for (var i = 0; i < categories.length; i++) {
                    var catTitle = categories[i].getAttribute("title");
                    var catType = categories[i].getAttribute("type");

                    var grid = document.createElement("div");
                    grid.className = "app-grid";

                    if (catType === "featured") {
                        fillGrid(grid, allApps, function (app) {
                            return getVal(app, "featured").toLowerCase().trim() === "true";
                        });
                    } else if (catType === "picks") {
                        var ids = getVal(categories[i], "appIds").replace(/\s/g, "").split(",");
                        fillGrid(grid, allApps, function (app) {
                            return ids.indexOf(app.getAttribute("id")) !== -1;
                        });
                    }

                    if (grid.hasChildNodes()) {
                        var h2 = document.createElement("h2");
                        h2.className = "section-title";
                        h2.textContent = catTitle;
                        scrollContainer.appendChild(h2);
                        scrollContainer.appendChild(grid);
                    }
                }
                appendNavigation(scrollContainer);
            }
        };
        xhr.send();
    }

    function isCompatible(appNode) {
        var canPC = getVal(appNode, "pcCapable").toLowerCase().trim() === "true";
        var canMobile = getVal(appNode, "mobileCapable").toLowerCase().trim() === "true";

        // Removed architecture check as requested
        if (isMobile && !canMobile) return false;
        if (isPC && !canPC) return false;

        return true;
    }

    function fillGrid(grid, apps, categoryFilter) {
        var visibleIndex = 0;

        for (var j = 0; j < apps.length; j++) {
            var appNode = apps[j];

            if (categoryFilter(appNode) && isCompatible(appNode)) {
                var appId = appNode.getAttribute("id");
                var card = document.createElement("div");
                card.className = "app-card";
                card.style.transitionDelay = (visibleIndex * 40) + "ms";

                card.innerHTML = '<img src="' + getVal(appNode, "icon") + '">' +
                    '<div class="app-name">' + getVal(appNode, "name") + '</div>' +
                    '<div class="app-pub">' + getVal(appNode, "publisher") + '</div>';

                (function (id, currentCard) {
                    var navigate = function () { window.location.href = 'app.html?id=' + id; };
                    currentCard.addEventListener("click", navigate, false);
                    setTimeout(function () { currentCard.classList.add("visible"); }, 50);
                })(appId, card);

                grid.appendChild(card);
                visibleIndex++;
            }
        }
    }

    function appendNavigation(container) {
        var title = document.createElement("h2");
        title.className = "section-title";
        title.textContent = "Navigation";
        container.appendChild(title);

        var grid = document.createElement("div");
        grid.className = "app-grid";

        var links = [
            { name: "All apps", url: "apps.html", icon: "https://cdn-icons-png.flaticon.com/512/2387/2387661.png" },
            { name: "Upload", url: "https://drayai81isbacknotfor8storescripts.42web.io", icon: "https://cdn-icons-png.flaticon.com/512/9326/9326001.png" }
        ];

        for (var i = 0; i < links.length; i++) {
            var navCard = document.createElement("div");
            navCard.className = "app-card";
            navCard.style.transitionDelay = (i * 40) + "ms";
            navCard.innerHTML = '<img src="' + links[i].icon + '"><div class="app-name">' + links[i].name + '</div><div class="app-pub">System</div>';

            (function (dest, currentNav) {
                currentNav.onclick = function () { window.location.href = dest; };
                setTimeout(function () { currentNav.classList.add("visible"); }, 100);
            })(links[i].url, navCard);

            grid.appendChild(navCard);
        }
        container.appendChild(grid);
    }

    function getVal(parent, tag) {
        var el = parent.getElementsByTagName(tag)[0];
        return el ? el.textContent : "";
    }

    document.addEventListener("DOMContentLoaded", loadHomeContent);
})();
