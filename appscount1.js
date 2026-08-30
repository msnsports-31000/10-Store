const XML_URL = "https://raw.githubusercontent.com/msnsports-31000/10-Store/refs/heads/main/apps.xml";

async function fetchCatalogCount() {
  const countEl = document.getElementById("count");
  const statusEl = document.getElementById("status");

  try {
    const response = await fetch(XML_URL);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const xmlText = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "text/xml");

    if (xmlDoc.querySelector("parsererror")) {
      throw new Error("XML Parse Error");
    }

    const apps = xmlDoc.querySelectorAll("app");

    if (countEl) countEl.textContent = apps.length;
    if (statusEl) statusEl.textContent = "Live";
  } catch (err) {
    if (statusEl) statusEl.textContent = "Offline";
    if (countEl) countEl.textContent = "0";
  }
}

document.addEventListener("DOMContentLoaded", fetchCatalogCount);
