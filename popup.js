const fillButton = document.getElementById("fillButton");
const statusElement = document.getElementById("status");

function setStatus(message, isError = false) {
  statusElement.textContent = message;
  statusElement.classList.toggle("error", isError);
}

async function fillCurrentTab() {
  setStatus("Filling fields...");

  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true
    });

    if (!tab?.id) {
      setStatus("No active tab found.", true);
      return;
    }

    const [result] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["fill.js"]
    });

    const message = result?.result?.message ?? "Autofill completed.";
    setStatus(message);
  } catch (error) {
    setStatus(error.message || "Unable to fill this page.", true);
  }
}

fillButton.addEventListener("click", fillCurrentTab);
