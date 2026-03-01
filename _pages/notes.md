---
layout: default
title: "Notes"
permalink: /notes/
---

<p class="minimal-intro">My public knowledge base: short notes to remember key ideas and review faster.</p>

{% assign sorted_notes = site.notes | sort: 'date' | reverse %}

<div class="notes-controls" aria-label="Notes controls">
  <label class="notes-controls__group" for="notes-search">
    <span>Search</span>
    <input id="notes-search" type="search" placeholder="Search notes...">
  </label>

  <label class="notes-controls__group" for="notes-category-filter">
    <span>Category</span>
    <select id="notes-category-filter">
      <option value="all">All categories</option>
      {% for cat in site.data.notes_categories %}
        <option value="{{ cat.key }}">{{ cat.label }}</option>
      {% endfor %}
    </select>
  </label>

  <button id="notes-reset" class="btn btn--inverse notes-reset" type="button">Reset</button>
</div>

<div class="proof-strip notes-catalog" aria-label="Notes categories">
  <button type="button" class="notes-chip is-active" data-category-chip="all">All</button>
  {% for cat in site.data.notes_categories %}
    <button type="button" class="notes-chip" data-category-chip="{{ cat.key }}">{{ cat.label }}</button>
  {% endfor %}
</div>

<p id="notes-no-results" class="notes-no-results" hidden>No notes match this filter.</p>

{% for cat in site.data.notes_categories %}
  <section id="{{ cat.key }}" class="notes-category" data-category-section data-category-key="{{ cat.key }}">
    <header class="notes-category__header">
      <p class="minimal-kicker">Category</p>
      <h2>{{ cat.label }}</h2>
      <p>{{ cat.summary }}</p>
    </header>

    <div class="minimal-grid notes-grid">
      {% assign category_has_note = false %}
      {% for note in sorted_notes %}
        {% assign note_key = note.category | default: "" | slugify %}
        {% if note_key == cat.key %}
          {% assign category_has_note = true %}
          {% capture search_blob %}{{ note.title }} {{ note.excerpt }} {{ note.category }}{% endcapture %}
          <a class="minimal-card note-card" href="{{ note.url | relative_url }}" data-note-card data-category-key="{{ note_key }}" data-search-text="{{ search_blob | strip_html | downcase | strip | escape_once }}">
            <p class="minimal-card__meta">{{ note.category | default: "Note" }}{% if note.date %} • {{ note.date | date: "%b %Y" }}{% endif %}</p>
            <h3>{{ note.title }}</h3>
            {% if note.excerpt %}
              <p>{{ note.excerpt | strip_html | truncate: 140 }}</p>
            {% endif %}
          </a>
        {% endif %}
      {% endfor %}

      {% unless category_has_note %}
        <div class="minimal-card note-card note-empty" data-note-empty>
          <p class="minimal-card__meta">Empty</p>
          <h3>No notes yet</h3>
          <p>Add a markdown file in <code>_notes/</code> with category set to <code>{{ cat.key }}</code>.</p>
        </div>
      {% endunless %}
    </div>
  </section>
{% endfor %}

<script>
  (function () {
    function normalize(value) {
      return (value || "").toLowerCase().trim();
    }

    document.addEventListener("DOMContentLoaded", function () {
      var searchInput = document.getElementById("notes-search");
      var categorySelect = document.getElementById("notes-category-filter");
      var resetButton = document.getElementById("notes-reset");
      var noResults = document.getElementById("notes-no-results");
      var noteCards = Array.prototype.slice.call(document.querySelectorAll("[data-note-card]"));
      var sections = Array.prototype.slice.call(document.querySelectorAll("[data-category-section]"));
      var chips = Array.prototype.slice.call(document.querySelectorAll("[data-category-chip]"));

      if (!searchInput || !categorySelect || noteCards.length === 0 || sections.length === 0) return;

      function markActiveChip(categoryValue) {
        chips.forEach(function (chip) {
          var isActive = chip.getAttribute("data-category-chip") === categoryValue;
          chip.classList.toggle("is-active", isActive);
        });
      }

      function applyFilter() {
        var query = normalize(searchInput.value);
        var selectedCategory = categorySelect.value || "all";
        var isFiltering = selectedCategory !== "all" || query.length > 0;
        var visibleCount = 0;

        noteCards.forEach(function (card) {
          var cardCategory = card.getAttribute("data-category-key") || "";
          var haystack = normalize(card.getAttribute("data-search-text"));
          var categoryOk = selectedCategory === "all" || cardCategory === selectedCategory;
          var queryOk = query.length === 0 || haystack.indexOf(query) !== -1;
          var show = categoryOk && queryOk;
          card.hidden = !show;
          if (show) visibleCount += 1;
        });

        sections.forEach(function (section) {
          var sectionCards = Array.prototype.slice.call(section.querySelectorAll("[data-note-card]"));
          var sectionHasVisibleNotes = sectionCards.some(function (card) { return !card.hidden; });
          var emptyCard = section.querySelector("[data-note-empty]");

          if (isFiltering) {
            if (emptyCard) emptyCard.hidden = true;
            section.hidden = !sectionHasVisibleNotes;
          } else {
            section.hidden = false;
            if (emptyCard) emptyCard.hidden = sectionHasVisibleNotes;
          }
        });

        noResults.hidden = !(isFiltering && visibleCount === 0);
        markActiveChip(selectedCategory);
      }

      chips.forEach(function (chip) {
        chip.addEventListener("click", function () {
          var selected = chip.getAttribute("data-category-chip") || "all";
          categorySelect.value = selected;
          applyFilter();
        });
      });

      searchInput.addEventListener("input", applyFilter);
      categorySelect.addEventListener("change", applyFilter);
      resetButton.addEventListener("click", function () {
        searchInput.value = "";
        categorySelect.value = "all";
        applyFilter();
      });

      applyFilter();
    });
  })();
</script>
