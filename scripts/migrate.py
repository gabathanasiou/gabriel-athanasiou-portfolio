import os
import shutil
import re

# Paths
source_utils = "/Users/gabrielathanasiou/Documents/Software Apps/gabriel-portfolio/src/utils"
target_dir = "/Users/gabrielathanasiou/Documents/Software Apps/gabriel-portfolio-data/scripts"
target_utils = os.path.join(target_dir, "utils")

# Copy utils
if os.path.exists(target_utils):
    shutil.rmtree(target_utils)
shutil.copytree(source_utils, target_utils)

# 1. Update airtable-helpers.mjs
ah_path = os.path.join(target_dir, "lib", "airtable-helpers.mjs")
with open(ah_path, "r") as f:
    ah_content = f.read()

# Update imports
ah_content = ah_content.replace("../../src/utils", "../utils")

# Remove functions
funcs_to_remove = ["fetchTimestamps", "checkForChanges", "fetchChangedRecords"]
for func in funcs_to_remove:
    # Regex to capture the entire function. Assuming they start with `export [async ]function name` and end with `}`
    # Note: Regex parsing might be brittle if there's complex nesting, but for these simple functions it works.
    pattern = r"/\*\*(?:(?!\*/).)*\*/\s*export (?:async )?function " + func + r"\b.*?^}$"
    ah_content = re.sub(pattern, "", ah_content, flags=re.MULTILINE | re.DOTALL)

with open(ah_path, "w") as f:
    f.write(ah_content)


# 2. Update sync-core.mjs
sc_path = os.path.join(target_dir, "lib", "sync-core.mjs")
with open(sc_path, "r") as f:
    sc_content = f.read()

sc_content = sc_content.replace("../../src/utils", "../utils")

# Force full sync: replace useIncrementalSync definition
sc_content = re.sub(r"const useIncrementalSync = .*?;", "const useIncrementalSync = false;", sc_content)

with open(sc_path, "w") as f:
    f.write(sc_content)

# 3. Update generator scripts
scripts = ["sync-data.mjs", "generate-sitemap.mjs", "generate-robots.mjs", "upload-instagram-data.mjs"]
for script in scripts:
    script_path = os.path.join(target_dir, script)
    if not os.path.exists(script_path):
        continue
    with open(script_path, "r") as f:
        content = f.read()

    # Change output dirs. Usually they write to ../public or similar.
    # Looking for outputDir = '../public' or similar
    content = content.replace("'../public'", "'.'")
    content = content.replace('"../public"', '"."')
    content = content.replace("path.resolve(__dirname, '../../public')", "path.resolve(__dirname, '..')")
    content = content.replace("../../public", "..")

    with open(script_path, "w") as f:
        f.write(content)

print("Migration script completed successfully.")
