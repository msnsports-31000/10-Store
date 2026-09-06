let allApps = [];
let currentSearchQuery = "";
let fullDescriptionText = "";
let isDescExpanded = false;
let currentScreenshots = [];
let currentScreenshotIndex = 0;

function toggleTheme() {
  const body = document.body;
  const btn = document.getElementById("ThemeToggle");
  const isDark = body.getAttribute("data-theme") === "dark";
  
  if (isDark) {
    body.setAttribute("data-theme", "light");
    btn.textContent = "Dark Mode";
  } else {
    body.setAttribute("data-theme", "dark");
    btn.textContent = "Light Mode";
  }
}

function escapeHtml(str) {
  const d = document.createElement("div");
  d.textContent = str || "";
  return d.innerHTML;
}

function filterApps(query) {
  currentSearchQuery = query.toLowerCase();
  applyFilters();
}

function applyFilters() {
  let filtered = allApps;

  if (currentSearchQuery) {
    filtered = filtered.filter(a =>
      (a.name || "").toLowerCase().includes(currentSearchQuery) ||
      (a.publisher || "").toLowerCase().includes(currentSearchQuery)
    );
  }

  renderHorizontalGrid(filtered);
}

function renderHorizontalGrid(apps) {
  const wrapper = document.getElementById("HorizontalWrapper");
  if (!wrapper) return;
  wrapper.innerHTML = "";

  if (!apps.length) {
    wrapper.innerHTML = "<div id='Status'>No items found.</div>";
    return;
  }

  const column = document.createElement("div");
  column.className = "category-column";

  const title = document.createElement("div");
  title.className = "category-title";
  title.textContent = "APPS";
  column.appendChild(title);

  const grid = document.createElement("div");
  grid.className = "app-tiles-grid";

  apps.forEach(app => {
    const tile = document.createElement("div");
    tile.className = "app-tile";
    
    tile.onclick = () => openDetailsById(app.id, true);

    const initialLetter = escapeHtml((app.name || "?").charAt(0).toUpperCase());

    tile.innerHTML = `
      <div class="icon-container">
        ${app.icon 
          ? `<img src="${app.icon}" alt="Icon" onerror="this.onerror=null; this.parentNode.innerHTML='${initialLetter}';">` 
          : initialLetter
        }
      </div>
      <div class="info">
        <div class="name">${escapeHtml(app.name || "Unknown")}</div>
        <div class="publisher">${escapeHtml(app.publisher || "Unknown")}</div>
        <div class="price">Free</div>
      </div>
    `;

    grid.appendChild(tile);
  });

  column.appendChild(grid);
  wrapper.appendChild(column);
}

function renderDescriptionText() {
  const descContainer = document.getElementById("DetailDesc");
  const toggleBtn = document.getElementById("DetailDescToggleBtn");

  if (fullDescriptionText.length > 333) {
    toggleBtn.style.display = "inline-block";
    if (isDescExpanded) {
      descContainer.textContent = fullDescriptionText;
      toggleBtn.textContent = "Less";
    } else {
      descContainer.textContent = fullDescriptionText.slice(0, 333) + "...";
      toggleBtn.textContent = "More";
    }
  } else {
    descContainer.textContent = fullDescriptionText;
    toggleBtn.style.display = "none";
  }
}

function openDetailsById(appId, updateHistory) {
  if (appId === undefined || appId === null || appId === "") return;

  const app = allApps.find(a => String(a.id) === String(appId));
  if (!app) return;

  if (updateHistory && window.location.protocol !== 'file:') {
    try {
      const newUrl = window.location.pathname + '?id=' + encodeURIComponent(appId);
      history.pushState({ id: appId }, '', newUrl);
    } catch(e) {}
  }

  document.getElementById("DetailName").textContent = app.name || "Unknown";
  document.getElementById("DetailPublisher").textContent = app.publisher || "Unknown Publisher";

  fullDescriptionText = app.description || "No description provided for this application.";
  isDescExpanded = false;
  renderDescriptionText();

  const toggleBtn = document.getElementById("DetailDescToggleBtn");
  toggleBtn.onclick = () => {
    isDescExpanded = !isDescExpanded;
    renderDescriptionText();
  };

  const blurBg = document.getElementById("ModalBlurBg");
  if (app.icon) {
    blurBg.style.backgroundImage = `url('${app.icon}')`;
  } else {
    blurBg.style.backgroundImage = "none";
  }

  const initialLetter = escapeHtml((app.name || "?").charAt(0).toUpperCase());
  const iconBox = document.getElementById("DetailIcon");

  iconBox.innerHTML = app.icon 
    ? `<img src="${app.icon}" onerror="this.onerror=null; this.parentNode.innerHTML='${initialLetter}';">` 
    : initialLetter;

  const shotsContainer = document.getElementById("ScreenshotsContainer");
  shotsContainer.innerHTML = "";

  currentScreenshots = app.screenshots || [];

  if (currentScreenshots.length > 0) {
    currentScreenshots.forEach((shotUrl, index) => {
      const img = document.createElement("img");
      img.className = "screenshot-thumb";
      img.src = shotUrl;
      img.alt = "App Screenshot";
      img.onclick = () => openLightbox(index);
      shotsContainer.appendChild(img);
    });
  } else {
    shotsContainer.innerHTML = `<span class="no-screenshots">No screenshots available for this app.</span>`;
  }

  const downloadBtn = document.getElementById("DetailDownloadBtn");
  downloadBtn.href = app.package || "#";

  document.getElementById("AppDetailModal").style.display = "block";
}

function openLightbox(index) {
  if (!currentScreenshots.length) return;
  currentScreenshotIndex = index;
  updateLightbox();
  document.getElementById("ScreenshotLightbox").style.display = "flex";
}

function closeLightbox() {
  document.getElementById("ScreenshotLightbox").style.display = "none";
}

function handleLightboxClick(event) {
  const isImage = event.target.closest('#LightboxImage');
  if (!isImage) {
    closeLightbox();
  }
}

function navigateLightbox(direction, event) {
  if (event) event.stopPropagation();
  currentScreenshotIndex += direction;
  if (currentScreenshotIndex < 0) {
    currentScreenshotIndex = currentScreenshots.length - 1;
  } else if (currentScreenshotIndex >= currentScreenshots.length) {
    currentScreenshotIndex = 0;
  }
  updateLightbox();
}

function updateLightbox() {
  const imgEl = document.getElementById("LightboxImage");
  const dotsContainer = document.getElementById("LightboxDots");

  imgEl.src = currentScreenshots[currentScreenshotIndex];
  dotsContainer.innerHTML = "";

  currentScreenshots.forEach((_, idx) => {
    const dot = document.createElement("div");
    dot.className = `lightbox-dot ${idx === currentScreenshotIndex ? 'active' : ''}`;
    dot.onclick = (e) => {
      e.stopPropagation();
      currentScreenshotIndex = idx;
      updateLightbox();
    };
    dotsContainer.appendChild(dot);
  });
}

document.addEventListener("keydown", (e) => {
  const lightbox = document.getElementById("ScreenshotLightbox");
  if (lightbox && lightbox.style.display === "flex") {
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") navigateLightbox(-1);
    if (e.key === "ArrowRight") navigateLightbox(1);
  }
});

function closeDetails(updateHistory) {
  document.getElementById("AppDetailModal").style.display = "none";
  if (updateHistory && window.location.protocol !== 'file:' && window.location.search.includes('id=')) {
    try {
      history.pushState({}, '', window.location.pathname);
    } catch(e) {}
  }
}

function resetToHome() {
  closeDetails(true);
  applyFilters();
}

function checkUrlParams() {
  const urlParams = new URLSearchParams(window.location.search);
  const appId = urlParams.get('id');
  if (appId) {
    openDetailsById(appId, false);
  } else {
    closeDetails(false);
  }
}

window.onpopstate = function() {
  checkUrlParams();
};

const scrollContainer = document.getElementById("HorizontalContainer");
if (scrollContainer) {
  scrollContainer.addEventListener("wheel", (e) => {
    e.preventDefault();
    scrollContainer.scrollLeft += e.deltaY;
  });
}

function getXmlTag(node, tag) {
  const children = Array.from(node.children || []);
  const match = children.find(child => child.tagName.toLowerCase() === tag.toLowerCase());
  if (match) return match.textContent.trim();
  
  const el = node.getElementsByTagName(tag)[0] || node.getElementsByTagName(tag.toUpperCase())[0];
  return el ? el.textContent.trim() : "";
}

function getXmlScreenshots(node) {
  const screenshots = [];
  const children = Array.from(node.children || []);

  children.forEach(child => {
    if (child.tagName.toLowerCase().startsWith("screenshot")) {
      const url = child.textContent.trim();
      if (url) screenshots.push(url);
    }
  });

  return screenshots;
}

function parseXmlData(xmlText) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, "text/xml");
  const appNodes = Array.from(xmlDoc.getElementsByTagName("app"));

  allApps = appNodes.map((app, index) => {
    const attrId = app.getAttribute("id");
    const uniqueId = (attrId && attrId.trim() !== "") ? attrId.trim() : String(index + 1);

    return {
      id: uniqueId,
      name: getXmlTag(app, "name"),
      version: getXmlTag(app, "version"),
      icon: getXmlTag(app, "icon"),
      publisher: getXmlTag(app, "publisher"),
      description: getXmlTag(app, "description"),
      package: getXmlTag(app, "package"),
      screenshots: getXmlScreenshots(app)
    };
  });

  const status = document.getElementById("Status");
  if (status) status.style.display = "none";
  
  applyFilters();
  checkUrlParams();
}

async function loadApps() {
  const rawGithubUrl = "https://raw.githubusercontent.com/msnsports-31000/10-Store/refs/heads/main/apps.xml";

  if (window.location.protocol === 'file:') {
    try {
      const res = await fetch(rawGithubUrl);
      const text = await res.text();
      parseXmlData(text);
      return;
    } catch(e) {}
  }

  try {
    const res = await fetch("apps.xml");
    if (!res.ok) throw new Error("HTTP error " + res.status);
    const text = await res.text();
    parseXmlData(text);
  } catch (err) {
    try {
      const res = await fetch(rawGithubUrl);
      const text = await res.text();
      parseXmlData(text);
    } catch(e) {
      const status = document.getElementById("Status");
      if (status) status.textContent = "Check your connection, All fixed?";
    }
  }
}

loadApps();
