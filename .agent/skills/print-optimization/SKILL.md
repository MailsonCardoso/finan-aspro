# Print Optimization Skill

Optimization techniques for web-to-print layouts, ensuring single-page fitting and professional appearance.

## Essential CSS for Printing

### 1. The Reset
```css
@media print {
  body, html {
    margin: 0 !important;
    padding: 0 !important;
    background: white !important;
    -webkit-print-color-adjust: exact;
  }
}
```

### 2. The Page Setup
```css
@page {
  size: A4 landscape; /* or portrait */
  margin: 5mm; /* Minimum safe margin */
}
```

### 3. Fighting the "Second Blank Page"
- **Avoid `height: 100vh`**: Browsers often miscalculate this for print. Use `height: 100%` or specific `mm` heights.
- **Table Row Padding**: Reduce table cell padding to the minimum (`p-1` or `2mm`).
- **Whitespace Removal**: Explicitly set `margin: 0` and `padding: 0` on the outermost container.
- **Box Sizing**: Ensure `box-sizing: border-box` is active globally in print.

### 4. Precision Units
- **Font size**: Use `pt` (1pt = 1/72 inch). Standard is 10pt-11pt.
- **Dimensions**: Use `mm` for containers to match paper specs.

### 5. Parent Transform Traps
If a print component is inside a parent with `transform`, `filter`, or `perspective` (common in modals/sidepanels), `position: fixed` will be relative to that parent instead of the viewport.
**Fix**:
```css
div { transform: none !important; }
```

## Table Optimization
- Set `table-layout: fixed` for predictable widths.
- Use `word-wrap: break-word` on cells.
- Limit empty padding rows.
