const fillButton = document.getElementById("fillButton");
const statusElement = document.getElementById("status");

function setStatus(message, isError = false) {
  statusElement.textContent = message;
  statusElement.classList.toggle("error", isError);
}

async function fillCurrentTab() {
  setStatus("Preparing tab...");

  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true
    });

    if (!tab?.id) {
      setStatus("No active tab found.", true);
      return;
    }

    setStatus("Autofill script will run here soon.");
  } catch (error) {
    setStatus(error.message || "Unable to access this tab.", true);
  }
}

fillButton.addEventListener("click", fillCurrentTab);
