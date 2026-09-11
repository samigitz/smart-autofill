(() => {
  if (window.__formmateReady) return;
  window.__formmateReady = true;

  const sampleData = {
    firstNames: ["Olivia", "Noah", "Emma", "Liam", "Mia", "Ethan"],
    lastNames: ["Smith", "Taylor", "Brown", "Walker", "Hall", "Young"],
    companies: ["Northfield Labs", "Bright River Studio", "Summit Lane Co"],
    streets: ["12 Oak Street", "48 River Road", "73 Hill Avenue"],
    cities: ["London", "Bristol", "York", "Leeds"],
    states: ["California", "Texas", "Florida", "New York"],
    countries: ["United Kingdom", "United States", "Canada"],
    jobTitles: ["Project Lead", "Sales Manager", "Support Agent"],
    shortWords: ["alpha", "bravo", "candle", "delta", "forest", "harbor"],
    sentenceParts: ["Please review this sample entry.", "This field contains short English text.", "Auto filled with simple demo content."]
  };

  const formFields = () => Array.from(document.querySelectorAll("input, textarea, select")).filter((field) => {
    if (field.disabled || field.readOnly) return false;
    if (field instanceof HTMLInputElement) return !["hidden", "submit", "reset", "button", "file", "image", "color"].includes(field.type);
    return field instanceof HTMLTextAreaElement || field instanceof HTMLSelectElement;
  });
  const normalize = (text) => (text || "").toLowerCase().replace(/\s+/g, " ").trim();
  const pick = (list, index = 0) => list[index % list.length];
  const contextFor = (field) => normalize([field.labels?.[0]?.textContent, field.closest("label")?.textContent, field.getAttribute("placeholder"), field.getAttribute("name"), field.getAttribute("id"), field.getAttribute("aria-label"), field.getAttribute("autocomplete"), field.getAttribute("type")].join(" "));
  const keyFor = (field, index) => field.getAttribute("name") || field.getAttribute("id") || `${contextFor(field)}:${index}`;
  const labelFor = (field, index) => (field.labels?.[0]?.textContent || field.getAttribute("placeholder") || field.getAttribute("name") || field.getAttribute("type") || `Field ${index + 1}`).trim().replace(/\s+/g, " ").slice(0, 28);

  function valueFor(field, context, index) {
    const type = field.getAttribute("type") || "";
    let value;
    if (field instanceof HTMLSelectElement) return Array.from(field.options).find((option) => option.value && !option.disabled)?.value || "";
    if (["checkbox", "radio"].includes(type)) return "__check__";
    if (type === "email" || context.includes("email")) value = `${pick(sampleData.firstNames, index).toLowerCase()}.${pick(sampleData.lastNames, index).toLowerCase()}@example.com`;
    else if (type === "tel" || /phone|mobile|tel/.test(context)) value = "07123456789";
    else if (type === "url" || /website|url/.test(context)) value = `https://${pick(sampleData.shortWords, index)}demo.com`;
    else if (type === "password" || context.includes("password")) value = "Alpha123Demo";
    else if (type === "number") value = /zip|postal|postcode/.test(context) ? "10001" : "42";
    else if (type === "date") value = "2026-09-11";
    else if (type === "datetime-local") value = "2026-09-11T09:30";
    else if (type === "time") value = "09:30";
    else if (/first name|firstname|given name/.test(context)) value = pick(sampleData.firstNames, index);
    else if (/last name|lastname|surname|family name/.test(context)) value = pick(sampleData.lastNames, index);
    else if (/full name|your name|name/.test(context)) value = `${pick(sampleData.firstNames, index)} ${pick(sampleData.lastNames, index)}`;
    else if (/company|business|organisation|organization/.test(context)) value = pick(sampleData.companies, index);
    else if (context.includes("address")) value = pick(sampleData.streets, index);
    else if (/city|town/.test(context)) value = pick(sampleData.cities, index);
    else if (/state|province|region/.test(context)) value = pick(sampleData.states, index);
    else if (context.includes("country")) value = pick(sampleData.countries, index);
    else if (/zip|postal|postcode/.test(context)) value = "10001";
    else if (/job|title|role/.test(context)) value = pick(sampleData.jobTitles, index);
    else if (field instanceof HTMLTextAreaElement || /message|comment|description/.test(context)) value = pick(sampleData.sentenceParts, index);
    else value = pick(sampleData.shortWords, index);
    if (field.minLength > 0) while (value.length < field.minLength) value += ` ${value}`;
    return field.maxLength > 0 ? value.slice(0, field.maxLength) : value;
  }

  function setValue(field, value, mark = true) {
    if (!value && mark) return false;
    if (field instanceof HTMLInputElement && ["checkbox", "radio"].includes(field.type)) {
      if (field.checked) return false;
      field.checked = true;
      if (mark) field.dataset.formmateFilled = "true";
    } else {
      const setter = Object.getOwnPropertyDescriptor(field.__proto__, "value")?.set;
      setter ? setter.call(field, value) : field.value = value;
      if (mark) field.dataset.formmateFilled = "true";
    }
    field.dispatchEvent(new Event("input", { bubbles: true }));
    field.dispatchEvent(new Event("change", { bubbles: true }));
    return true;
  }

  function extract() {
    return formFields().map((field, index) => ({
      key: keyFor(field, index),
      label: labelFor(field, index),
      value: field instanceof HTMLInputElement && ["checkbox", "radio"].includes(field.type) ? String(field.checked) : field.value,
      type: field.getAttribute("type") || field.tagName.toLowerCase()
    })).filter((field) => field.value);
  }

  function applyProfile(savedFields) {
    const saved = new Map(savedFields.map((field) => [field.key, field.value]));
    let count = 0;
    formFields().forEach((field, index) => {
      const value = saved.get(keyFor(field, index));
      const isChoice = field instanceof HTMLInputElement && ["checkbox", "radio"].includes(field.type);
      if (isChoice ? value === "true" && !field.checked : value && !field.value) count += setValue(field, value) ? 1 : 0;
    });
    return count;
  }

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    const currentFields = formFields();
    if (request.action === "scan") sendResponse({ fields: currentFields.map((field, index) => ({ label: labelFor(field, index), key: keyFor(field, index) })) });
    if (request.action === "extract") sendResponse({ fields: extract() });
    if (request.action === "fill") {
      let count = 0;
      currentFields.forEach((field, index) => {
        if ((field.type === "checkbox" || field.type === "radio") && setValue(field, "__check__")) count += 1;
        else if (!field.value && setValue(field, valueFor(field, contextFor(field), index))) count += 1;
      });
      sendResponse({ message: count ? `Filled ${count} empty field${count === 1 ? "" : "s"}.` : "No empty fields found." });
    }
    if (request.action === "fillProfile" || request.action === "paste") {
      const count = applyProfile(request.data || []);
      sendResponse({ message: count ? `Applied ${count} field${count === 1 ? "" : "s"}.` : "No matching empty fields found." });
    }
    if (request.action === "clear") {
      const filled = currentFields.filter((field) => field.dataset.formmateFilled === "true");
      filled.forEach((field) => {
        if (field instanceof HTMLInputElement && ["checkbox", "radio"].includes(field.type)) field.checked = false;
        else setValue(field, "", false);
      });
      filled.forEach((field) => delete field.dataset.formmateFilled);
      sendResponse({ message: filled.length ? `Cleared ${filled.length} field${filled.length === 1 ? "" : "s"}.` : "No Formmate values to clear." });
    }
    return true;
  });
})();
