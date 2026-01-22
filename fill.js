(() => {
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
    sentenceParts: [
      "Please review this sample entry.",
      "This field contains short English text.",
      "Auto filled with simple demo content."
    ]
  };

  function pick(list, offset = 0) {
    return list[offset % list.length];
  }

  function normalize(text) {
    return (text || "").toLowerCase().replace(/\s+/g, " ").trim();
  }

  function cleanValue(value, maxLength) {
    if (!maxLength || maxLength < 0) {
      return value;
    }

    return value.slice(0, maxLength);
  }

  function buildContext(field) {
    const label = field.labels?.[0]?.textContent || "";
    const parentLabel = field.closest("label")?.textContent || "";
    const placeholder = field.getAttribute("placeholder") || "";
    const name = field.getAttribute("name") || "";
    const id = field.getAttribute("id") || "";
    const ariaLabel = field.getAttribute("aria-label") || "";
    const autocomplete = field.getAttribute("autocomplete") || "";
    const type = field.getAttribute("type") || "";

    return normalize(
      [label, parentLabel, placeholder, name, id, ariaLabel, autocomplete, type].join(" ")
    );
  }

  function isEligible(field) {
    if (field.disabled || field.readOnly) {
      return false;
    }

    if (field instanceof HTMLInputElement) {
      const blockedTypes = ["hidden", "submit", "reset", "button", "file", "image", "color"];
      return !blockedTypes.includes(field.type);
    }

    return field instanceof HTMLTextAreaElement || field instanceof HTMLSelectElement;
  }

  function getMaxLength(field) {
    return typeof field.maxLength === "number" && field.maxLength > 0 ? field.maxLength : null;
  }

  function getMinLength(field) {
    return typeof field.minLength === "number" && field.minLength > 0 ? field.minLength : 0;
  }

  function repeatWordUntilLength(base, minLength) {
    let value = base;

    while (value.length < minLength) {
      value += ` ${base}`;
    }

    return value;
  }

  function matchesPattern(pattern, value) {
    if (!pattern) {
      return true;
    }

    try {
      return new RegExp(`^(?:${pattern})$`).test(value);
    } catch {
      return true;
    }
  }

  function valueFromPattern(field, context, fallback) {
    const pattern = field.getAttribute("pattern");

    if (!pattern) {
      return fallback;
    }

    const candidates = [
      "Sample123",
      "Alpha123",
      "AB12",
      "12345",
      "London",
      "Bravo7"
    ];

    if (context.includes("zip") || context.includes("postal")) {
      candidates.unshift("90210", "10001");
    }

    for (const candidate of candidates) {
      if (matchesPattern(pattern, candidate)) {
        return candidate;
      }
    }

    return fallback;
  }

  function buildEmail(index) {
    const first = pick(sampleData.firstNames, index).toLowerCase();
    const last = pick(sampleData.lastNames, index).toLowerCase();
    return `${first}.${last}@example.com`;
  }

  function buildPhone() {
    return "07123456789";
  }

  function buildUrl(index) {
    const word = pick(sampleData.shortWords, index);
    return `https://www.${word}demo.com`;
  }

  function buildPassword(field) {
    const minLength = Math.max(getMinLength(field), 8);
    return repeatWordUntilLength("Alpha123", minLength).replace(/\s+/g, "").slice(0, Math.max(minLength, 12));
  }

  function buildTextValue(field, context, index) {
    const type = field.getAttribute("type") || "";
    const maxLength = getMaxLength(field);
    const minLength = getMinLength(field);

    let value;

    if (field instanceof HTMLSelectElement) {
      const option = Array.from(field.options).find((item) => item.value && !item.disabled);
      return option ? option.value : "";
    }

    if (type === "email" || context.includes("email")) {
      value = buildEmail(index);
    } else if (type === "tel" || context.includes("phone") || context.includes("mobile") || context.includes("tel")) {
      value = buildPhone();
    } else if (type === "url" || context.includes("website") || context.includes("url")) {
      value = buildUrl(index);
    } else if (type === "password" || context.includes("password")) {
      value = buildPassword(field);
    } else if (type === "number") {
      value = context.includes("zip") || context.includes("postal") ? "10001" : "42";
    } else if (type === "date") {
      value = "2026-07-14";
    } else if (type === "datetime-local") {
      value = "2026-07-14T09:30";
    } else if (type === "time") {
      value = "09:30";
    } else if (context.includes("first name") || context.includes("firstname") || context.includes("given name")) {
      value = pick(sampleData.firstNames, index);
    } else if (context.includes("last name") || context.includes("lastname") || context.includes("surname") || context.includes("family name")) {
      value = pick(sampleData.lastNames, index);
    } else if (context.includes("full name") || context.includes("your name") || context.includes("name")) {
      value = `${pick(sampleData.firstNames, index)} ${pick(sampleData.lastNames, index)}`;
    } else if (context.includes("company") || context.includes("business") || context.includes("organisation") || context.includes("organization")) {
      value = pick(sampleData.companies, index);
    } else if (context.includes("address")) {
      value = pick(sampleData.streets, index);
    } else if (context.includes("city") || context.includes("town")) {
      value = pick(sampleData.cities, index);
    } else if (context.includes("state") || context.includes("province") || context.includes("region")) {
      value = pick(sampleData.states, index);
    } else if (context.includes("country")) {
      value = pick(sampleData.countries, index);
    } else if (context.includes("zip") || context.includes("postal")) {
      value = "10001";
    } else if (context.includes("job") || context.includes("title") || context.includes("role")) {
      value = pick(sampleData.jobTitles, index);
    } else if (field instanceof HTMLTextAreaElement || context.includes("message") || context.includes("comment") || context.includes("description")) {
      value = pick(sampleData.sentenceParts, index);
    } else {
      value = pick(sampleData.shortWords, index);
    }

    if (minLength > 0 && value.length < minLength) {
      value = repeatWordUntilLength(value, minLength);
    }

    value = valueFromPattern(field, context, value);
    value = cleanValue(value, maxLength);

    return value;
  }

  function setFieldValue(field, value) {
    if (!value) {
      return false;
    }

    if (field instanceof HTMLInputElement && (field.type === "checkbox" || field.type === "radio")) {
      if (!field.checked) {
        field.checked = true;
        field.dispatchEvent(new Event("input", { bubbles: true }));
        field.dispatchEvent(new Event("change", { bubbles: true }));
        return true;
      }

      return false;
    }

    const nativeSetter = Object.getOwnPropertyDescriptor(field.__proto__, "value")?.set;

    if (nativeSetter) {
      nativeSetter.call(field, value);
    } else {
      field.value = value;
    }

    field.dispatchEvent(new Event("input", { bubbles: true }));
    field.dispatchEvent(new Event("change", { bubbles: true }));
    field.dispatchEvent(new Event("blur", { bubbles: true }));

    return true;
  }

  const fields = Array.from(document.querySelectorAll("input, textarea, select")).filter(isEligible);
  let updatedCount = 0;

  fields.forEach((field, index) => {
    const context = buildContext(field);

    if (!context && !(field instanceof HTMLTextAreaElement)) {
      return;
    }

    if (field instanceof HTMLInputElement && field.type !== "checkbox" && field.type !== "radio" && field.value.trim()) {
      return;
    }

    if (field instanceof HTMLTextAreaElement && field.value.trim()) {
      return;
    }

    if (field instanceof HTMLSelectElement && field.value) {
      return;
    }

    const value = buildTextValue(field, context, index);

    if (setFieldValue(field, value)) {
      updatedCount += 1;
    }
  });

  return {
    message: updatedCount > 0
      ? `Filled ${updatedCount} field${updatedCount === 1 ? "" : "s"}.`
      : "No empty fillable fields were found."
  };
})();
