# gabriel-portfolio — Roadmap (Open Work Only)

This is the **live backlog**: `[ ]` not started, `[~]` in progress. Completed work is
retired to `docs/ROADMAP-ARCHIVE.md` as **one line**; git history keeps the narrative.

**How this file works — the whole workflow lives here, so no custom skill is required:**

- **Query, don't read it all:** `grep '^## ' docs/ROADMAP.md` lists every item with its
  flags. Read only the matched line range.
- **Every new ask goes through triage first.** Dedupe in this order: headings here →
  `docs/ROADMAP-ARCHIVE.md` → `AGENTS.md` + `docs/*.md` → `git log --oneline --grep=<term>`
  → source. Open item → do it; in-progress → never parallel; done → use the pointer;
  overlaps several → merge into ONE item; nothing → add one.
- **Ids are stable and unique forever.** Never renumber or reuse. Next id =
  `max(live ∪ archive) + 1`. The CLI does this.
- **Shape:** request → approach/files → verify → `Relations:` (depends on / merges /
  supersedes / blocked by).
- **Close in one commit:** flip `[x]`, add ONE archive row
  (`| id | title | doc + code + test pointers |`), delete the live section, then
  `npm run roadmap:check`.
- **CLI:** `npm run roadmap -- list | add "title" | close <id> --points "..." | check`.
- **Portable kit for other repos:** `docs/ROADMAP-KIT.md`.

---

