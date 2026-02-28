# Richard Cheam - Personal Website

A minimal Jekyll website for GitHub Pages.

## Project structure

- `_config.yml`: site-level settings (title, URL, timezone, plugins)
- `_layouts/default.html`: the only layout (HTML structure + nav + theme toggle)
- `_data/navigation.yml`: top navigation links
- `_pages/`: page content (`about`, `projects`, `cv`, `contact`, `404`)
- `assets/css/main.scss`: all styling (including light/dark mode)
- `images/`: static images (`favicon.ico`, `profile.png`)

## How pages work

Each file in `_pages/` has front matter and Markdown/HTML content.

Example:

```md
---
layout: default
title: "Projects"
permalink: /projects/
---

Your content here.
```

## What to edit first

1. Update text in `_pages/about.md`
2. Replace project descriptions in `_pages/projects.md`
3. Update experience/skills in `_pages/cv.md`
4. Update links in `_pages/contact.md`
5. Adjust menu links in `_data/navigation.yml`
6. Tweak styles/colors in `assets/css/main.scss`

## Light and dark mode

- System theme is used by default.
- The header toggle switches mode manually.
- Choice is saved in browser `localStorage`.

## Local development (optional)

```bash
bundle install
bundle exec jekyll serve
```

Then open `http://127.0.0.1:4000`.
