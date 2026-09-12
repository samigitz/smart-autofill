const statusElement = document.getElementById("status");
const siteNameElement = document.getElementById("siteName");
const fieldCountElement = document.getElementById("fieldCount");
const scanStatusElement = document.getElementById("scanStatus");
const fieldPreviewElement = document.getElementById("fieldPreview");
const profileCountElement = document.getElementById("profileCount");
const profileListElement = document.getElementById("profileList");

let activeTab;
let currentHost = "unknown-site";

function setStatus(message, isError = false) {
  statusElement.textContent = message;
  statusElement.classList.toggle("error", isError);
}

function siteKey() {
  return `profiles:${currentHost}`;
}

async function getActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) throw new Error("No active tab found.");
  activeTab = tab;
  try { currentHost = new URL(tab.url).hostname || "current-page"; } catch { currentHost = "current-page"; }
  siteNameElement.textContent = currentHost.replace(/^www\./, "");
}

async function runPageAction(action, data) {
  if (!activeTab?.id) await getActiveTab();
  await chrome.scripting.executeScript({ target: { tabId: activeTab.id }, files: ["fill.js"] });
  return chrome.tabs.sendMessage(activeTab.id, { action, data });
}

function renderFieldPreview(fields) {
  fieldPreviewElement.innerHTML = "";
  fields.slice(0, 5).forEach((field) => {
    const chip = document.createElement("span");
    chip.className = "field-chip";
    const strong = document.createElement("strong");
    strong.textContent = field.label;
    chip.appendChild(strong);
    fieldPreviewElement.appendChild(chip);
  });
  if (fields.length > 5) {
    const chip = document.createElement("span");
    chip.className = "field-chip";
    chip.textContent = `+${fields.length - 5} more`;
    fieldPreviewElement.appendChild(chip);
  }
}

async function scanPage(clearStatus = true) {
  if (clearStatus) setStatus("");
  fieldCountElement.textContent = "Scanning…";
  scanStatusElement.textContent = "Looking for fillable fields";
  try {
    await getActiveTab();
    const result = await runPageAction("scan");
    const detectedFields = result?.fields || [];
    fieldCountElement.textContent = `${detectedFields.length} field${detectedFields.length === 1 ? "" : "s"}`;
    scanStatusElement.textContent = detectedFields.length ? "Ready to fill" : "No fillable fields found";
    renderFieldPreview(detectedFields);
  } catch (error) {
    fieldCountElement.textContent = "Unavailable";
    scanStatusElement.textContent = "This page cannot be scanned";
    setStatus(error.message || "Unable to scan this page.", true);
  }
}

async function fillPage() {
  setStatus("Filling empty fields…");
  const button = document.getElementById("fillButton");
  button.disabled = true;
  try {
    const result = await runPageAction("fill");
    await scanPage(false);
    setStatus(result?.message || "Autofill completed.");
  } catch (error) { setStatus(error.message || "Unable to fill this page.", true); }
  finally { button.disabled = false; }
}

async function clearPage() {
  setStatus("Clearing values added by Formmate…");
  const button = document.getElementById("clearButton");
  button.disabled = true;
  try {
    const result = await runPageAction("clear");
    await scanPage(false);
    setStatus(result?.message || "Cleared Formmate values.");
  } catch (error) { setStatus(error.message || "Unable to clear this page.", true); }
  finally { button.disabled = false; }
}

async function saveProfile(event) {
  event.preventDefault();
  const nameInput = document.getElementById("profileName");
  const name = nameInput.value.trim();
  if (!name) return;
  try {
    const result = await runPageAction("extract");
    const stored = await chrome.storage.local.get(siteKey());
    const profiles = stored[siteKey()] || [];
    profiles.unshift({ name, host: currentHost, fields: result?.fields || [], createdAt: Date.now() });
    await chrome.storage.local.set({ [siteKey()]: profiles.slice(0, 8) });
    nameInput.value = "";
    setStatus(`Saved “${name}” for ${currentHost}.`);
    await renderProfiles();
  } catch (error) { setStatus(error.message || "Unable to save this profile.", true); }
}

async function renderProfiles() {
  const stored = await chrome.storage.local.get(siteKey());
  const profiles = stored[siteKey()] || [];
  profileCountElement.textContent = profiles.length;
  profileListElement.innerHTML = "";
  if (!profiles.length) {
    profileListElement.innerHTML = '<p class="empty-state">No saved profiles for this site yet.<br>Save a filled form to reuse it later.</p>';
    return;
  }
  profiles.forEach((profile, index) => {
    const item = document.createElement("div");
    item.className = "profile-item";
    item.innerHTML = `<div><strong></strong><small>${profile.fields.length} saved fields</small></div><button type="button" data-use="${index}">Use</button><button type="button" data-delete="${index}" aria-label="Delete profile">×</button>`;
    item.querySelector("strong").textContent = profile.name;
    profileListElement.appendChild(item);
  });
}

async function useProfile(index) {
  const stored = await chrome.storage.local.get(siteKey());
  const profile = (stored[siteKey()] || [])[index];
  if (!profile) return;
  try {
    const result = await runPageAction("fillProfile", profile.fields);
    setStatus(result?.message || `Applied “${profile.name}”.`);
    await scanPage();
  } catch (error) { setStatus(error.message || "Unable to apply this profile.", true); }
}

async function deleteProfile(index) {
  const stored = await chrome.storage.local.get(siteKey());
  const profiles = stored[siteKey()] || [];
  profiles.splice(index, 1);
  await chrome.storage.local.set({ [siteKey()]: profiles });
  await renderProfiles();
  setStatus("Profile deleted.");
}

async function copyForm() {
  setStatus("Copying form data locally…");
  try {
    const result = await runPageAction("extract");
    await chrome.storage.local.set({ clipboard: { host: currentHost, fields: result?.fields || [], copiedAt: Date.now() } });
    setStatus(`Copied ${result?.fields?.length || 0} fields locally.`);
  } catch (error) { setStatus(error.message || "Unable to copy form data.", true); }
}

async function pasteForm() {
  const stored = await chrome.storage.local.get("clipboard");
  if (!stored.clipboard?.fields?.length) { setStatus("There is no copied form data yet.", true); return; }
  try {
    const result = await runPageAction("paste", stored.clipboard.fields);
    setStatus(result?.message || "Pasted copied form data.");
    await scanPage();
  } catch (error) { setStatus(error.message || "Unable to paste form data.", true); }
}

async function clearClipboard() {
  await chrome.storage.local.remove("clipboard");
  setStatus("Copied form data cleared.");
}

document.getElementById("fillButton").addEventListener("click", fillPage);
document.getElementById("clearButton").addEventListener("click", clearPage);
document.getElementById("refreshButton").addEventListener("click", scanPage);
document.getElementById("profileForm").addEventListener("submit", saveProfile);
document.getElementById("copyButton").addEventListener("click", copyForm);
document.getElementById("pasteButton").addEventListener("click", pasteForm);
document.getElementById("clearClipboardButton").addEventListener("click", clearClipboard);
document.querySelectorAll(".tab").forEach((tab) => tab.addEventListener("click", async () => {
  document.querySelectorAll(".tab").forEach((item) => item.classList.toggle("is-active", item === tab));
  document.querySelectorAll(".panel").forEach((panel) => panel.classList.toggle("is-hidden", panel.dataset.panel !== tab.dataset.tab));
  if (tab.dataset.tab === "saved") await renderProfiles();
}));
profileListElement.addEventListener("click", async (event) => {
  const useButton = event.target.closest("[data-use]");
  const deleteButton = event.target.closest("[data-delete]");
  if (useButton) await useProfile(Number(useButton.dataset.use));
  if (deleteButton) await deleteProfile(Number(deleteButton.dataset.delete));
});

scanPage();
