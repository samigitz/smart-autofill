chrome.commands.onCommand.addListener(async (command) => {
  if (command !== "fill-current-page") return;
  const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  if (!tab?.id) return;
  try {
    await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ["fill.js"] });
    await chrome.tabs.sendMessage(tab.id, { action: "fill" });
  } catch {
    // Restricted browser pages do not allow script injection.
  }
});
