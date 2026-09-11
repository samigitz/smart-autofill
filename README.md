# Formmate - Smart Autofill Chrome Plugin

Repository: [github.com/samigitz/smart-autofill](https://github.com/samigitz/smart-autofill)

Formmate is a privacy-conscious Chrome extension for filling form-heavy test scenarios with short, related English sample data.

## What it does

- Detects likely field meaning from labels, names, IDs, placeholders, ARIA labels, and autocomplete hints
- Fills names, email, phone, address, company, city, country, dates, numbers, passwords, and messages
- Respects common field requirements like input type, `minlength`, and `maxlength`
- Saves up to eight reusable profiles per website using `chrome.storage.local`
- Copies a form snapshot locally and pastes matching fields into another form
- Clears only values that Formmate added during the current page session
- Supports `Ctrl+Shift+Y` (or `MacCtrl+Shift+Y`) for a quick fill action
- Uses no remote API and requests page access only when the user acts

## Install locally

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select this folder:

`/Users/sampatharachchige/Sites/test/smart-autofill-chrome-plugin`

## Use

1. Open any page with a form
2. Click the extension icon
3. Click **Fill Current Page**

Use **Saved** to store a site-specific profile after filling a form. Use **Copy / Paste** to move a local snapshot between related forms.

## Test locally

Open `test-form.html` in Chrome and load the extension as unpacked. It covers contact, delivery, textarea, select, validation length, and checkbox scenarios.

## Notes

- It only fills empty fields so it does not overwrite existing values
- It prefers short English demo data
- The extension does not submit forms
- Restricted browser pages such as Chrome settings may reject page access
- Saved and copied values remain in local extension storage until removed
