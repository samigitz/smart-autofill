(() => {
  function normalize(text) {
    return (text || "").toLowerCase().replace(/\s+/g, " ").trim();
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

  function setFieldValue(field, value) {
    if (!value) {
      return false;
    }

    if (field instanceof HTMLInputElement && (field.type === "checkbox" || field.type === "radio")) {
      if (!field.checked) {
        field.checked = true;
        field.dispatchEvent(new Event("change", { bubbles: true }));
        return true;
      }

      return false;
    }

    if (field instanceof HTMLSelectElement) {
      const option = Array.from(field.options).find((item) => item.value && !item.disabled);

      if (!option) {
        return false;
      }

      field.value = option.value;
      field.dispatchEvent(new Event("change", { bubbles: true }));
      return true;
    }

    field.value = field instanceof HTMLTextAreaElement ? "Sample text" : "Sample";
    field.dispatchEvent(new Event("input", { bubbles: true }));
    field.dispatchEvent(new Event("change", { bubbles: true }));

    return true;
  }

  function buildValue(field, context) {
    if (field instanceof HTMLSelectElement) {
      const option = Array.from(field.options).find((item) => item.value && !item.disabled);
      return option ? option.value : "";
    }

    if (field instanceof HTMLInputElement && (field.type === "checkbox" || field.type === "radio")) {
      return "__check__";
    }

    if (context.includes("email")) {
      return "olivia.smith@example.com";
    }

    if (context.includes("phone") || context.includes("mobile") || context.includes("tel")) {
      return "07123456789";
    }

    if (context.includes("first name") || context.includes("firstname") || context.includes("given name")) {
      return "Olivia";
    }

    if (context.includes("last name") || context.includes("lastname") || context.includes("surname")) {
      return "Smith";
    }

    if (context.includes("name")) {
      return "Olivia Smith";
    }

    if (context.includes("company") || context.includes("business")) {
      return "Northfield Labs";
    }

    if (context.includes("address")) {
      return "12 Oak Street";
    }

    if (context.includes("city") || context.includes("town")) {
      return "London";
    }

    if (context.includes("country")) {
      return "United Kingdom";
    }

    if (context.includes("message") || context.includes("comment") || context.includes("description")) {
      return "Please review this sample entry.";
    }

    return field instanceof HTMLTextAreaElement ? "Sample text" : "Sample";
  }

  const fields = Array.from(document.querySelectorAll("input, textarea, select")).filter(isEligible);
  let updatedCount = 0;

  fields.forEach((field) => {
    const context = buildContext(field);

    if (field instanceof HTMLInputElement && field.type !== "checkbox" && field.type !== "radio" && field.value.trim()) {
      return;
    }

    if (field instanceof HTMLTextAreaElement && field.value.trim()) {
      return;
    }

    if (field instanceof HTMLSelectElement && field.value) {
      return;
    }

    const value = buildValue(field, context);

    if (setFieldValue(field, value === "__check__" ? "checked" : value)) {
      updatedCount += 1;
    }
  });

  return {
    message: updatedCount > 0
      ? `Filled ${updatedCount} field${updatedCount === 1 ? "" : "s"}.`
      : "No empty fillable fields were found."
  };
})();
