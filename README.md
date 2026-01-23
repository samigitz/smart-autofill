# Smart Autofill Chrome Plugin

This Chrome extension fills the current page with short English sample values.

## What it does

- Detects likely field meaning from labels, names, IDs, placeholders, ARIA labels, and autocomplete hints
- Fills related values such as names, email, phone, address, company, city, country, and message fields
- Respects common field requirements like `type`, `required`, `minlength`, `maxlength`, and simple `pattern` rules
- Uses a small built-in sample data set instead of hardcoded single values everywhere

## Install locally

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select this folder:

## Use

1. Open any page with a form
2. Click the extension icon
3. Click **Fill Current Page**

## Notes

- It only fills empty fields so it does not overwrite existing values
- It prefers short English demo data
- Pattern handling is intentionally simple and safe for a first version
