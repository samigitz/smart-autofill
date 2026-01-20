(() => {
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

  const fields = Array.from(document.querySelectorAll("input, textarea, select")).filter(isEligible);
  let updatedCount = 0;

  fields.forEach((field) => {
    if (field instanceof HTMLInputElement && field.type !== "checkbox" && field.type !== "radio" && field.value.trim()) {
      return;
    }

    if (field instanceof HTMLTextAreaElement && field.value.trim()) {
      return;
    }

    if (field instanceof HTMLSelectElement && field.value) {
      return;
    }

    if (setFieldValue(field)) {
      updatedCount += 1;
    }
  });

  return {
    message: updatedCount > 0
      ? `Filled ${updatedCount} field${updatedCount === 1 ? "" : "s"}.`
      : "No empty fillable fields were found."
  };
})();
