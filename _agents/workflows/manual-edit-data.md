---
description: How to make a manual edit to a static JSON file without triggering a full sync
---

# Manual Data Edit Workflow

Follow these steps to update production portfolio data without triggering an Airtable sync.

1. **Switch to the data branch** in the data repository:
   ```bash
   git checkout data
   ```

2. **Edit the target file**:
   - `directing/portfolio-data.json`
   - `postproduction/portfolio-data.json`

3. **Commit with skip ci**:
   // turbo
   ```bash
   git add .
   git commit -m "chore: manual data patch [ci skip]"
   git push origin data
   ```

4. **Purge Cache** (Optional but recommended):
   Open in browser:
   `https://purge.jsdelivr.net/gh/gabathanasiou/gabriel-portfolio-data@data/directing/portfolio-data.json`
