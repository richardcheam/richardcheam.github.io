      (function () {
        var root = document.documentElement;
        root.classList.add("js");

        var themeKey = "theme";
        var savedTheme = null;

        try {
          savedTheme = localStorage.getItem(themeKey);
        } catch (e) {
          savedTheme = null;
        }

        root.setAttribute("data-theme", "light");

        document.addEventListener("DOMContentLoaded", function () {
          var toggle = document.getElementById("theme-toggle");
          var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
          var themeMeta = document.querySelector('meta[name="theme-color"]');
          var scrollProgressBar = document.getElementById("scroll-progress-bar");
          var introScreen = document.getElementById("intro-screen");
          var body = document.body;
          var isHome = body.getAttribute("data-page") === "/";

          var themeOrder = ["light"];
          var themeNames = {
            light: "Light"
          };
          var themeMetaColors = {
            light: "#ffffff"
          };

          function getTheme() {
            var explicit = root.getAttribute("data-theme");
            if (themeOrder.indexOf(explicit) !== -1) return explicit;
            return "light";
          }

          function getNextTheme(currentTheme) {
            var currentIndex = themeOrder.indexOf(currentTheme);
            if (currentIndex === -1) return "light";
            return themeOrder[(currentIndex + 1) % themeOrder.length];
          }

          function refreshThemeUi() {
            var currentTheme = getTheme();
            if (themeMeta) {
              themeMeta.setAttribute("content", themeMetaColors[currentTheme] || themeMetaColors.light);
            }

            if (toggle) {
              var nextTheme = getNextTheme(currentTheme);
              var nextLabel = themeNames[nextTheme] || "Light";
              toggle.textContent = nextLabel;
              toggle.setAttribute("aria-label", "Switch to " + nextLabel + " mode");
            }
          }

          if (toggle) {
            toggle.addEventListener("click", function () {
              var next = getNextTheme(getTheme());
              root.setAttribute("data-theme", next);
              try {
                localStorage.setItem(themeKey, next);
              } catch (e) {}
              refreshThemeUi();
            });
          }

          refreshThemeUi();

          var megaRoot = document.querySelector("[data-mega-root]");
          var megaShell = megaRoot && megaRoot.querySelector("[data-mega-shell]");
          var megaTriggers = megaRoot ? Array.prototype.slice.call(megaRoot.querySelectorAll("[data-mega-target]")) : [];
          var megaPanels = megaRoot ? Array.prototype.slice.call(megaRoot.querySelectorAll("[data-mega-panel]")) : [];
          var megaCloseTimer = null;
          var desktopMega = window.matchMedia && window.matchMedia("(min-width: 901px)").matches;
          var activeMega = null;

          function clearMegaClose() {
            if (!megaCloseTimer) return;
            window.clearTimeout(megaCloseTimer);
            megaCloseTimer = null;
          }

          function setMegaOpen(isOpen) {
            if (!megaRoot || !megaShell) return;
            if (isOpen) megaShell.style.setProperty("--mega-top", Math.max(0, megaShell.getBoundingClientRect().top) + "px");
            megaRoot.classList.toggle("is-mega-open", isOpen);
            megaShell.setAttribute("aria-hidden", isOpen ? "false" : "true");
          }

          function activateMega(target) {
            if (!megaRoot || !megaShell) return;
            activeMega = target;

            megaPanels.forEach(function (panel) {
              panel.classList.toggle("is-active", panel.getAttribute("data-mega-panel") === target);
            });

            megaTriggers.forEach(function (trigger) {
              var isActive = trigger.getAttribute("data-mega-target") === target;
              trigger.classList.toggle("is-active", isActive);
              trigger.setAttribute("aria-expanded", isActive ? "true" : "false");
            });

            setMegaOpen(true);
          }

          function closeMega() {
            activeMega = null;
            megaPanels.forEach(function (panel) {
              panel.classList.remove("is-active");
            });
            megaTriggers.forEach(function (trigger) {
              trigger.classList.remove("is-active");
              trigger.setAttribute("aria-expanded", "false");
            });
            setMegaOpen(false);
          }

          function scheduleMegaClose() {
            clearMegaClose();
            megaCloseTimer = window.setTimeout(closeMega, 420);
          }

          if (megaRoot && megaShell && megaTriggers.length > 0) {
            megaTriggers.forEach(function (trigger) {
              trigger.addEventListener("mouseenter", function () {
                if (!desktopMega) return;
                clearMegaClose();
                activateMega(trigger.getAttribute("data-mega-target"));
              });

              trigger.addEventListener("focus", function () {
                if (!desktopMega) return;
                clearMegaClose();
                activateMega(trigger.getAttribute("data-mega-target"));
              });
            });

            megaRoot.addEventListener("mouseenter", clearMegaClose);
            megaRoot.addEventListener("mouseleave", function () {
              if (!desktopMega) return;
              scheduleMegaClose();
            });
            megaRoot.addEventListener("focusin", clearMegaClose);
            megaRoot.addEventListener("focusout", function (event) {
              if (!desktopMega) return;
              var nextFocused = event.relatedTarget;
              if (!nextFocused || !megaRoot.contains(nextFocused)) {
                scheduleMegaClose();
              }
            });

            document.addEventListener("keydown", function (event) {
              if (event.key === "Escape") closeMega();
            });

            document.addEventListener("click", function (event) {
              if (!megaRoot.contains(event.target)) closeMega();
            });

            window.addEventListener("resize", function () {
              desktopMega = window.matchMedia && window.matchMedia("(min-width: 901px)").matches;
              if (!desktopMega) closeMega();
            });
          }

          var editorialReading = /^\/(blog|projects|paper-reviews)(\/|$)/.test(window.location.pathname);
          var revealTargets = Array.prototype.slice.call(document.querySelectorAll("[data-reveal]"));
          if (revealTargets.length > 0) {
            revealTargets.forEach(function (target, index) {
              target.style.setProperty("--reveal-index", index % 8);
            });

            if (reduceMotion || editorialReading || typeof IntersectionObserver === "undefined") {
              revealTargets.forEach(function (target) {
                target.classList.add("is-visible");
              });
            } else {
              var revealObserver = new IntersectionObserver(
                function (entries, observer) {
                  entries.forEach(function (entry) {
                    if (!entry.isIntersecting) return;
                    entry.target.classList.add("is-visible");
                    observer.unobserve(entry.target);
                  });
                },
                {
                  threshold: 0.15,
                  rootMargin: "0px 0px -8% 0px"
                }
              );

              revealTargets.forEach(function (target) {
                revealObserver.observe(target);
              });
            }
          }

          function getStaggerColumns(grid) {
            if (grid.classList.contains("cards-grid")) {
              if (window.matchMedia("(max-width: 760px)").matches) return 1;
              if (window.matchMedia("(max-width: 1024px)").matches) return 2;
              return 3;
            }
            if (grid.classList.contains("notes-grid") || grid.classList.contains("blog-grid") || grid.classList.contains("review-grid")) {
              return window.matchMedia("(max-width: 760px)").matches ? 1 : 2;
            }
            return 1;
          }

          function applyCardStagger() {
            var staggerGrids = Array.prototype.slice.call(
              document.querySelectorAll(".cards-grid, .notes-grid, .blog-grid, .review-grid, .notes-list, .blog-list, .concept-list")
            );

            staggerGrids.forEach(function (grid) {
              var columns = Math.max(1, getStaggerColumns(grid));
              var staggerItems = Array.prototype.slice.call(grid.children).filter(function (item) {
                return item.hasAttribute("data-reveal");
              });

              staggerItems.forEach(function (item, index) {
                item.style.setProperty("--card-stagger-row", Math.floor(index / columns));
                item.style.setProperty("--card-stagger-col", index % columns);
              });
            });
          }

          applyCardStagger();
          window.addEventListener("resize", applyCardStagger);

          var hero = document.querySelector(".hero");
          var heroGlow = hero && hero.querySelector(".hero__glow");
          if (hero && heroGlow && !reduceMotion) {
            var heroTargetX = 0;
            var heroTargetY = 0;
            var heroCurrentX = 0;
            var heroCurrentY = 0;
            var heroRaf = null;

            function renderHeroParallax() {
              heroCurrentX += (heroTargetX - heroCurrentX) * 0.12;
              heroCurrentY += (heroTargetY - heroCurrentY) * 0.12;
              hero.style.setProperty("--hero-parallax-x", heroCurrentX.toFixed(2) + "px");
              hero.style.setProperty("--hero-parallax-y", heroCurrentY.toFixed(2) + "px");

              if (Math.abs(heroTargetX - heroCurrentX) > 0.04 || Math.abs(heroTargetY - heroCurrentY) > 0.04) {
                heroRaf = window.requestAnimationFrame(renderHeroParallax);
              } else {
                heroRaf = null;
              }
            }

            function scheduleHeroParallax() {
              if (heroRaf) return;
              heroRaf = window.requestAnimationFrame(renderHeroParallax);
            }

            hero.addEventListener("pointermove", function (event) {
              var rect = hero.getBoundingClientRect();
              if (!rect.width || !rect.height) return;
              var offsetX = (event.clientX - rect.left) / rect.width - 0.5;
              var offsetY = (event.clientY - rect.top) / rect.height - 0.5;
              heroTargetX = offsetX * 14;
              heroTargetY = offsetY * 10;
              scheduleHeroParallax();
            });

            hero.addEventListener("pointerleave", function () {
              heroTargetX = 0;
              heroTargetY = 0;
              scheduleHeroParallax();
            });
          }

          function updateScrollProgress() {
            if (!scrollProgressBar) return;
            var doc = document.documentElement;
            var scrollTop = window.pageYOffset || doc.scrollTop || 0;
            var maxScroll = Math.max(0, doc.scrollHeight - window.innerHeight);
            var progress = maxScroll > 0 ? Math.min(1, scrollTop / maxScroll) : 0;
            scrollProgressBar.style.transform = "scaleX(" + progress.toFixed(4) + ")";
          }

          var tabGroups = Array.prototype.slice.call(document.querySelectorAll("[data-detail-tabs]"));
          tabGroups.forEach(function (group) {
            var triggers = Array.prototype.slice.call(group.querySelectorAll("[data-detail-trigger]"));
            var panels = Array.prototype.slice.call(group.querySelectorAll("[data-detail-panel]"));
            if (triggers.length === 0 || panels.length === 0) return;

            function activate(panelId) {
              var hasActive = false;

              panels.forEach(function (panel) {
                var isActive = panel.id === panelId;
                panel.hidden = !isActive;
                panel.classList.toggle("is-active", isActive);
                if (isActive) hasActive = true;
              });

              triggers.forEach(function (trigger) {
                var targetId = (trigger.getAttribute("href") || "").replace(/^#/, "");
                var isActive = targetId === panelId;
                trigger.classList.toggle("is-active", isActive);
                trigger.setAttribute("aria-current", isActive ? "true" : "false");
              });

              return hasActive;
            }

            triggers.forEach(function (trigger) {
              trigger.addEventListener("click", function (event) {
                var targetId = (trigger.getAttribute("href") || "").replace(/^#/, "");
                if (!targetId) return;
                event.preventDefault();
                if (!activate(targetId)) return;
                if (window.history && window.history.replaceState) {
                  window.history.replaceState(null, "", "#" + targetId);
                }
              });
            });

            var hash = (window.location.hash || "").replace(/^#/, "");
            var fallback = (triggers[0].getAttribute("href") || "").replace(/^#/, "");
            if (!activate(hash)) {
              activate(fallback);
            }
          });

          var filterInput = document.querySelector("[data-filter-input]");
          var filterCards = Array.prototype.slice.call(document.querySelectorAll("[data-filter-card]"));
          var filterEmpty = document.querySelector("[data-filter-empty]");

          var reviewContent = document.querySelector("[data-review-content]");
          var reviewToc = document.querySelector("[data-review-toc]");
          if (reviewContent) {
            Array.prototype.slice.call(reviewContent.querySelectorAll("table")).forEach(function (table) {
              if (table.parentElement && table.parentElement.classList.contains("table-wrap")) return;
              var wrap = document.createElement("div");
              wrap.className = "table-wrap";
              wrap.setAttribute("role", "region");
              wrap.setAttribute("tabindex", "0");
              wrap.setAttribute("aria-label", table.getAttribute("aria-label") || "Table");
              table.parentNode.insertBefore(wrap, table);
              wrap.appendChild(table);
            });
          }

          if (reviewContent && reviewToc) {
            var tocHeadings = Array.prototype.slice.call(reviewContent.querySelectorAll("h2[id], h3[id]"));
            var tocList = reviewToc.querySelector("[data-review-toc-list]");
            var tocDetails = reviewToc.querySelector("[data-review-toc-details]");
            var tocSummary = tocDetails && tocDetails.querySelector("summary");
            var tocWide = window.matchMedia ? window.matchMedia("(min-width: 1025px)") : null;
            var tocLinks = [];
            var sectionNumber = 0;

            if (tocHeadings.length > 1 && tocList && tocDetails) {
              tocHeadings.forEach(function (heading) {
                var isSection = heading.tagName === "H2";
                var item = document.createElement("li");
                var link = document.createElement("a");
                item.className = isSection ? "review-toc__item" : "review-toc__item review-toc__item--sub";
                link.href = "#" + heading.id;
                if (isSection) {
                  sectionNumber += 1;
                  var number = (sectionNumber < 10 ? "0" : "") + sectionNumber;
                  heading.setAttribute("data-section-number", number);
                  var numberEl = document.createElement("span");
                  numberEl.className = "review-toc__number";
                  numberEl.setAttribute("aria-hidden", "true");
                  numberEl.textContent = number;
                  link.appendChild(numberEl);
                }
                link.appendChild(document.createTextNode(heading.textContent));
                item.appendChild(link);
                tocList.appendChild(item);
                tocLinks.push(link);

                link.addEventListener("click", function (event) {
                  if (!tocWide || tocWide.matches) return;
                  // Collapse first so the page height settles before scrolling.
                  event.preventDefault();
                  tocDetails.open = false;
                  window.requestAnimationFrame(function () {
                    heading.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
                    if (window.history && window.history.replaceState) {
                      window.history.replaceState(null, "", "#" + heading.id);
                    }
                  });
                });
              });

              reviewToc.hidden = false;

              function syncTocMode() {
                tocDetails.open = !!(tocWide && tocWide.matches);
              }

              syncTocMode();
              if (tocWide) {
                if (tocWide.addEventListener) tocWide.addEventListener("change", syncTocMode);
                else if (tocWide.addListener) tocWide.addListener(syncTocMode);
              }

              if (tocSummary) {
                tocSummary.addEventListener("click", function (event) {
                  if (tocWide && tocWide.matches) event.preventDefault();
                });
              }

              var activeTocIndex = -1;
              var tocRaf = null;
              var tocSection = [], lastSection = 0;
              tocHeadings.forEach(function (heading, index) {
                if (heading.tagName === "H2") lastSection = index;
                tocSection.push(lastSection);
              });

              function updateActiveToc() {
                tocRaf = null;
                var offset = 140;
                var current = 0;
                tocHeadings.forEach(function (heading, index) {
                  if (heading.getBoundingClientRect().top - offset <= 0) current = index;
                });
                if (current === activeTocIndex) return;
                activeTocIndex = current;
                // Subsections show only under the section being read, as in the blog rail.
                var section = tocSection[current];
                tocLinks.forEach(function (link, index) {
                  var isActive = index === current;
                  link.classList.toggle("is-active", isActive);
                  link.classList.toggle("is-parent", index === section && current !== section);
                  if (tocHeadings[index].tagName === "H3") link.parentNode.classList.toggle("is-folded", tocSection[index] !== section);
                  if (isActive) link.setAttribute("aria-current", "location");
                  else link.removeAttribute("aria-current");
                });
              }

              updateActiveToc();
              window.addEventListener("scroll", function () {
                if (!tocRaf) tocRaf = window.requestAnimationFrame(updateActiveToc);
              }, { passive: true });
            }
          }

          if (filterCards.length > 0) {
            var filterParams = null;
            try {
              filterParams = new URLSearchParams(window.location.search);
            } catch (e) {
              filterParams = null;
            }

            var initialFilter = filterParams ? (filterParams.get("category") || filterParams.get("q") || "").trim().toLowerCase() : "";
            var facetLinks = Array.prototype.slice.call(document.querySelectorAll("[data-facet-link]"));
            var filterCount = document.querySelector("[data-filter-count]");
            var facetState = {};

            facetLinks.forEach(function (link) {
              var facet = link.getAttribute("data-facet");
              facetState[facet] = filterParams ? (filterParams.get(facet) || "").trim().toLowerCase() : "";
            });

            if (filterInput && initialFilter) {
              filterInput.value = initialFilter;
            }

            function syncFacetLinks() {
              facetLinks.forEach(function (link) {
                var isActive = facetState[link.getAttribute("data-facet")] === (link.getAttribute("data-facet-value") || "");
                link.classList.toggle("is-active", isActive);
                if (isActive) link.setAttribute("aria-current", "true");
                else link.removeAttribute("aria-current");
              });
            }

            function applyFilter(queryValue) {
              var query = typeof queryValue === "string"
                ? queryValue.trim().toLowerCase()
                : (filterInput ? filterInput.value.trim().toLowerCase() : "");
              var matches = 0;

              filterCards.forEach(function (card) {
                var haystack = (card.getAttribute("data-filter-text") || "").toLowerCase();
                var facets = " " + (card.getAttribute("data-filter-facets") || "") + " ";
                var facetMatch = Object.keys(facetState).every(function (facet) {
                  return !facetState[facet] || facets.indexOf(" " + facet + ":" + facetState[facet] + " ") !== -1;
                });
                var show = facetMatch && (query === "" || haystack.indexOf(query) !== -1);
                card.hidden = !show;
                if (show) matches += 1;
              });

              if (filterEmpty) {
                filterEmpty.hidden = matches > 0;
              }

              if (filterCount) {
                var noun = filterCount.getAttribute("data-filter-noun") || (filterCards.length === 1 ? "entry" : "entries");
                filterCount.textContent = noun === "posts"
                  ? "Showing " + matches + " of " + filterCards.length + " posts"
                  : (matches === filterCards.length ? filterCards.length + " " + noun : matches + " of " + filterCards.length + " " + noun);
              }
            }

            facetLinks.forEach(function (link) {
              link.addEventListener("click", function (event) {
                event.preventDefault();
                // Exclusive facets (the blog's topics and categories) replace any other active facet.
                if (link.hasAttribute("data-facet-exclusive")) {
                  Object.keys(facetState).forEach(function (facet) { facetState[facet] = ""; });
                }
                facetState[link.getAttribute("data-facet")] = link.getAttribute("data-facet-value") || "";
                syncFacetLinks();
                applyFilter();

                if (window.history && window.history.replaceState) {
                  var nextParams = new URLSearchParams();
                  Object.keys(facetState).forEach(function (facet) {
                    if (facetState[facet]) nextParams.set(facet, facetState[facet]);
                  });
                  var search = nextParams.toString();
                  window.history.replaceState(null, "", window.location.pathname + (search ? "?" + search : "") + window.location.hash);
                }
              });
            });

            if (filterInput) {
              filterInput.addEventListener("input", function () {
                applyFilter();
              });
            }

            syncFacetLinks();
            applyFilter(initialFilter);
          }

          // Constellation rail: each section is a star, each subsection a smaller
          // star beside it. Reading draws the path between them; the current star
          // pulses and sends faint "attention" arcs back to earlier sections.
          function setupConstellation(rail, list, items, headings, subs) {
            var SVGNS = "http://www.w3.org/2000/svg";
            // Khmer skies, one scene per series, each moving from night towards light.
            var skies = {
              "speech-ai": [[31, 58, 95], [62, 110, 126], [217, 120, 154], [227, 155, 45], [201, 161, 91]],            // Angkor dawn: moat at night, first light, lotus, saffron, sandstone
              "dual-gh200": [[30, 52, 72], [63, 110, 120], [192, 112, 58], [226, 170, 90]],                        // Mekong dusk: river slate, silt teal, copper, ember gold
              "representation-collapse": [[30, 30, 63], [90, 78, 122], [216, 154, 60], [232, 194, 122]],           // Temple night: indigo, stone violet, candle amber, gold
              "reviews": [[44, 62, 80], [74, 110, 90], [168, 140, 80], [214, 170, 110]]                          // Bayon faces: slate stone, moss, lichen, warm sandstone
            };
            skies["foundations"] = [[28, 60, 58], [52, 110, 98], [120, 160, 120], [214, 180, 90]];  // Tonle Sap morning: deep river, jade, rice field, silk gold
            skies["angkor-dawn"] = skies["speech-ai"];
            var seriesSky = skies[rail.getAttribute("data-series")] || skies["speech-ai"];
            var postSky = rail.getAttribute("data-sky");
            var stops = skies[postSky] || seriesSky;
            function hue(t) {
              var x = Math.max(0, Math.min(1, t)) * (stops.length - 1), i = Math.min(stops.length - 2, Math.floor(x)), f = x - i;
              var c = stops[i].map(function (v, k) { return Math.round(v + (stops[i + 1][k] - v) * f); });
              return "rgb(" + c.join(",") + ")";
            }
            rail.classList.add("blog-rail--constellation");
            var n = items.length, order = [];
            var zig = [6, 22, 12, 30, 4, 18, 26, 10, 20, 2];
            items.forEach(function (item, i) {
              var col = hue(n > 1 ? i / (n - 1) : 0), x = zig[i % zig.length];
              item.style.setProperty("--c", col);
              item.style.setProperty("--x", x + "px");
              var link = item.querySelector(":scope > a"), star = document.createElement("span");
              star.className = "blog-rail__star"; star.setAttribute("aria-hidden", "true");
              link.insertBefore(star, link.firstChild);
              order.push({ star: star, section: i, sub: -1, color: col });
              headings[i].style.setProperty("--c", col);
              headings[i].classList.add("is-starred");
              subs[i].forEach(function (s, j) {
                var sstar = document.createElement("span");
                sstar.className = "blog-rail__star blog-rail__star--sub"; sstar.setAttribute("aria-hidden", "true");
                s.link.insertBefore(sstar, s.link.firstChild);
                s.link.parentNode.style.setProperty("--sx", (x + 10 + ((j % 2) ? 8 : 0)) + "px");
                s.heading.style.setProperty("--c", col);
                s.heading.classList.add("is-starred");
                order.push({ star: sstar, section: i, sub: j, color: col });
              });
            });
            // Carry each part's colour into its text: everything from one h2 to the next.
            var article = document.querySelector(".note-article") || document.querySelector("[data-review-content]");
            article.classList.add("is-constellation");
            var partIdx = -1, blocks = [];
            Array.prototype.forEach.call(article.querySelectorAll(":scope > *, :scope > .note-body > *"), function (el) {
              var idx = headings.indexOf(el);
              if (idx >= 0) partIdx = idx;
              else if (el.querySelector && headings.some(function (h) { return el.contains(h); })) return;
              if (partIdx >= 0 && !el.closest(".note-related")) { el.style.setProperty("--c", items[partIdx].style.getPropertyValue("--c")); blocks.push([el, partIdx]); }
            });
            var svg = document.createElementNS(SVGNS, "svg");
            svg.setAttribute("class", "blog-rail__sky"); svg.setAttribute("aria-hidden", "true");
            list.insertBefore(svg, list.firstChild);
            var pos = 0, cur = -1;
            function centre(el) {
              var r = el.getBoundingClientRect(), b = list.getBoundingClientRect();
              return [r.left + r.width / 2 - b.left, r.top + r.height / 2 - b.top];
            }
            function draw() {
              while (svg.firstChild) svg.removeChild(svg.firstChild);
              var pts = order.map(function (o) { return centre(o.star); });
              for (var k = 1; k < order.length; k++) {
                var lit = k <= pos, line = document.createElementNS(SVGNS, "line");
                line.setAttribute("x1", pts[k - 1][0]); line.setAttribute("y1", pts[k - 1][1]);
                line.setAttribute("x2", pts[k][0]); line.setAttribute("y2", pts[k][1]);
                line.setAttribute("class", lit ? "sky-edge is-lit" : "sky-edge");
                if (lit) line.style.stroke = order[k].color;
                svg.appendChild(line);
              }
              // Attention: arcs from the current section star back to up to three earlier ones.
              if (cur > 0) {
                var here = pts[order.findIndex(function (o) { return o.section === cur && o.sub === -1; })];
                for (var back = 1; back <= Math.min(3, cur); back++) {
                  var there = pts[order.findIndex(function (o) { return o.section === cur - back && o.sub === -1; })];
                  var arc = document.createElementNS(SVGNS, "path"), mx = Math.min(here[0], there[0]) - 18 - back * 10, my = (here[1] + there[1]) / 2;
                  arc.setAttribute("d", "M" + here[0] + " " + here[1] + " Q" + mx + " " + my + " " + there[0] + " " + there[1]);
                  arc.setAttribute("class", "sky-attention");
                  arc.style.stroke = order[order.findIndex(function (o) { return o.section === cur; })].color;
                  arc.style.opacity = String(0.42 - back * 0.1);
                  svg.appendChild(arc);
                }
              }
            }
            // The post's emblem: its finished constellation, placed before the related links.
            var related = article.querySelector(".note-related");
            var emblem = document.createElement("figure");
            emblem.className = "post-emblem"; emblem.setAttribute("aria-hidden", "true");
            var esvg = document.createElementNS(SVGNS, "svg");
            esvg.setAttribute("viewBox", "0 0 240 120");
            emblem.appendChild(esvg);
            var cap = document.createElement("figcaption");
            cap.textContent = "This post as a constellation: " + n + " parts, " + (order.length - n) + " subsections.";
            emblem.appendChild(cap);
            var seal = article.querySelector(".post-seal"), anchor = related || seal;
            if (anchor) anchor.parentNode.insertBefore(emblem, anchor); else article.appendChild(emblem);
            function drawEmblem() {
              while (esvg.firstChild) esvg.removeChild(esvg.firstChild);
              // Lay the stars out left to right, height from the rail zigzag.
              var ex = order.map(function (o, k) { return 14 + (k / Math.max(1, order.length - 1)) * 212; });
              var ey = order.map(function (o) { var z = zig[o.section % zig.length]; return o.sub < 0 ? 22 + z * 2.4 : 30 + z * 2.4 + (o.sub % 2 ? 14 : -10); });
              for (var k = 1; k < order.length; k++) {
                var l = document.createElementNS(SVGNS, "line");
                l.setAttribute("x1", ex[k - 1]); l.setAttribute("y1", ey[k - 1]); l.setAttribute("x2", ex[k]); l.setAttribute("y2", ey[k]);
                l.setAttribute("stroke", order[k].color); l.setAttribute("stroke-width", "1"); l.setAttribute("stroke-opacity", "0.55");
                esvg.appendChild(l);
              }
              order.forEach(function (o, k) {
                var c = document.createElementNS(SVGNS, "circle");
                c.setAttribute("cx", ex[k]); c.setAttribute("cy", ey[k]); c.setAttribute("r", o.sub < 0 ? 3.6 : 1.8); c.setAttribute("fill", o.color);
                esvg.appendChild(c);
              });
            }
            drawEmblem();
            // Recolour everything with another sky.
            function recolour(next) {
              stops = next;
              items.forEach(function (item, i) {
                var col = hue(n > 1 ? i / (n - 1) : 0);
                item.style.setProperty("--c", col);
                headings[i].style.setProperty("--c", col);
                subs[i].forEach(function (sb) { sb.heading.style.setProperty("--c", col); });
              });
              order.forEach(function (o) { o.color = items[o.section].style.getPropertyValue("--c"); });
              blocks.forEach(function (b) { b[0].style.setProperty("--c", items[b[1]].style.getPropertyValue("--c")); });
              drawEmblem(); draw();
            }
            window.addEventListener("resize", draw);
            if (document.fonts && document.fonts.ready) document.fonts.ready.then(draw);
            return {
              update: function (section, sub) {
                cur = section;
                pos = -1;
                order.forEach(function (o, k) { if (o.section < section || (o.section === section && o.sub <= sub)) pos = k; });
                order.forEach(function (o, k) {
                  o.star.classList.toggle("is-lit", k <= pos);
                  o.star.classList.toggle("is-current", k === pos);
                });
                draw();
              }
            };
          }

          var blogRail = document.querySelector("[data-blog-rail]");
          var blogArticle = document.querySelector(".note-article") || (blogRail && document.querySelector("[data-review-content]"));
          if (blogArticle) {
            var articleHeadings = Array.prototype.slice.call(blogArticle.querySelectorAll("h2")).filter(function (heading) {
              return !heading.closest(".note-related") && !/^(related|sources)$/i.test(heading.textContent.trim());
            });
            if (blogRail && articleHeadings.length > 1) {
              var railList = blogRail.querySelector("[data-blog-rail-list]");
              var railNumber = blogRail.querySelector("[data-blog-rail-number]");
              var railTitle = blogRail.querySelector("[data-blog-rail-title]");
              var railLinks = [];
              var railItems = [];
              // Subsections (h3) of each section, listed under it in the rail.
              var railSubs = [];
              articleHeadings.forEach(function (heading, index) {
                if (!heading.id) heading.id = "section-" + (index + 1);
                var number = (index < 9 ? "0" : "") + (index + 1);
                heading.setAttribute("data-section-number", number);
                var item = document.createElement("li");
                var link = document.createElement("a");
                var numberEl = document.createElement("span");
                link.href = "#" + heading.id;
                numberEl.className = "blog-rail__number";
                numberEl.setAttribute("aria-hidden", "true");
                numberEl.textContent = number;
                link.appendChild(numberEl);
                link.appendChild(document.createTextNode(heading.textContent));
                link.addEventListener("click", function () {
                  heading.setAttribute("tabindex", "-1");
                  window.setTimeout(function () { heading.focus({ preventScroll: true }); }, 0);
                });
                item.appendChild(link);
                // Collect the h3s between this h2 and the next one.
                var subs = [];
                var next = articleHeadings[index + 1];
                var all = Array.prototype.slice.call(blogArticle.querySelectorAll("h2, h3"));
                var start = all.indexOf(heading), stop = next ? all.indexOf(next) : all.length;
                all.slice(start + 1, stop).forEach(function (h) {
                  if (h.tagName === "H3" && !h.closest(".note-related") && !h.closest("figure")) subs.push(h);
                });
                if (subs.length) {
                  var subList = document.createElement("ol");
                  subList.className = "blog-rail__sublist";
                  subs.forEach(function (h, j) {
                    if (!h.id) h.id = heading.id + "-" + (j + 1);
                    var subItem = document.createElement("li");
                    var subLink = document.createElement("a");
                    subLink.href = "#" + h.id;
                    subLink.textContent = h.textContent;
                    subItem.appendChild(subLink);
                    subList.appendChild(subItem);
                  });
                  item.appendChild(subList);
                }
                railSubs.push(subs.map(function (h, j) { return { heading: h, link: item.querySelectorAll(".blog-rail__sublist a")[j] }; }));
                railList.appendChild(item);
                railLinks.push(link);
                railItems.push(item);
              });
              blogRail.hidden = false;
              var constellation = blogRail.getAttribute("data-rail-style") === "constellation"
                ? setupConstellation(blogRail, railList, railItems, articleHeadings, railSubs)
                : null;

              var activeRailIndex = -2;
              var activeSubKey = "";
              var railRaf = null;
              function updateBlogRail() {
                railRaf = null;
                var current = -1;
                articleHeadings.forEach(function (heading, index) {
                  if (heading.getBoundingClientRect().top - 160 <= 0) current = index;
                });
                var sub = -1;
                if (current >= 0) {
                  railSubs[current].forEach(function (s, j) {
                    if (s.heading.getBoundingClientRect().top - 160 <= 0) sub = j;
                  });
                }
                var subKey = current + ":" + sub;
                if (subKey === activeSubKey) return;
                activeSubKey = subKey;
                if (current !== activeRailIndex) {
                  activeRailIndex = current;
                  railLinks.forEach(function (link, index) {
                    var isActive = index === current;
                    link.classList.toggle("is-active", isActive);
                    link.classList.toggle("is-read", index < current);
                    railItems[index].classList.toggle("is-open", isActive);
                    if (isActive) link.setAttribute("aria-current", "location");
                    else link.removeAttribute("aria-current");
                  });
                }
                railSubs.forEach(function (list, index) {
                  list.forEach(function (s, j) {
                    var on = index === current && j === sub;
                    s.link.classList.toggle("is-active", on);
                    s.link.classList.toggle("is-read", index === current && j < sub);
                  });
                });
                blogRail.classList.toggle("has-current", current >= 0);
                if (constellation) constellation.update(current, sub);
                if (current >= 0) {
                  railNumber.textContent = ((current < 9 ? "0" : "") + (current + 1)) + " / " + ((articleHeadings.length < 10 ? "0" : "") + articleHeadings.length);
                  railTitle.textContent = articleHeadings[current].textContent;
                  var railSub = blogRail.querySelector("[data-blog-rail-sub]");
                  if (railSub) railSub.textContent = sub >= 0 ? railSubs[current][sub].heading.textContent : "";
                  blogRail.classList.toggle("has-sub", sub >= 0);
                  blogRail.style.setProperty("--progress", ((current + 1) / articleHeadings.length * 100).toFixed(1) + "%");
                  blogRail.style.setProperty("--bar", railItems[current].style.getPropertyValue("--c") || "var(--blog-orientation)");
                  var activeLink = sub >= 0 ? railSubs[current][sub].link : railLinks[current];
                  if (blogRail.scrollHeight > blogRail.clientHeight) {
                    var linkTop = activeLink.offsetTop, railTop = blogRail.scrollTop;
                    if (linkTop < railTop || linkTop > railTop + blogRail.clientHeight - 40) blogRail.scrollTop = linkTop - 40;
                  }
                }
              }
              var siteHeader = document.querySelector(".site-header");
              function syncBlogRailTop() {
                if (siteHeader) blogRail.style.setProperty("--blog-rail-top", siteHeader.offsetHeight + "px");
              }
              syncBlogRailTop();
              window.addEventListener("resize", syncBlogRailTop);
              updateBlogRail();
              window.addEventListener("scroll", function () {
                if (!railRaf) railRaf = window.requestAnimationFrame(updateBlogRail);
              }, { passive: true });
              window.addEventListener("resize", updateBlogRail);
            }
            function syncScrollableArtifacts() {
              Array.prototype.forEach.call(blogArticle.querySelectorAll("table, pre"), function (artifact) {
                if (artifact.scrollWidth > artifact.clientWidth + 1) {
                  artifact.tabIndex = 0;
                  artifact.setAttribute("aria-label", artifact.tagName === "TABLE" ? "Scrollable evidence table" : "Scrollable code excerpt");
                } else {
                  artifact.removeAttribute("tabindex");
                  artifact.removeAttribute("aria-label");
                }
              });
            }
            syncScrollableArtifacts();
            window.addEventListener("resize", syncScrollableArtifacts);
          }

          function finishIntro() {
            body.classList.remove("intro-pending");
            body.classList.remove("intro-started");
            body.classList.add("intro-complete");
          }

          // Play the intro once per browser; returning visitors go straight to the page.
          var introSeen = false;
          try { introSeen = localStorage.getItem("introSeen") === "1"; localStorage.setItem("introSeen", "1"); } catch (e) {}

          if (introScreen && isHome && !reduceMotion && !introSeen) {
            window.setTimeout(function () {
              body.classList.add("intro-started");
            }, 40);
            window.setTimeout(finishIntro, 2150);
          } else {
            finishIntro();
          }

          if (!reduceMotion) {
            document.addEventListener("click", function (event) {
              if (event.defaultPrevented) return;
              if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

              var link = event.target && event.target.closest ? event.target.closest("a[href]") : null;
              if (!link) return;
              if (link.target && link.target !== "_self") return;
              if (link.hasAttribute("download")) return;

              var hrefAttr = link.getAttribute("href") || "";
              if (hrefAttr === "" || hrefAttr.charAt(0) === "#") return;
              if (hrefAttr.indexOf("javascript:") === 0 || hrefAttr.indexOf("mailto:") === 0 || hrefAttr.indexOf("tel:") === 0) return;

              var targetUrl = null;
              try {
                targetUrl = new URL(link.href, window.location.href);
              } catch (e) {
                return;
              }

              if (targetUrl.origin !== window.location.origin) return;
              if (editorialReading || /^\/(blog|projects|paper-reviews)(\/|$)/.test(targetUrl.pathname)) return;
              if (targetUrl.pathname === window.location.pathname && targetUrl.search === window.location.search && targetUrl.hash) return;
              if (targetUrl.href === window.location.href) return;

              event.preventDefault();
              body.classList.add("route-leaving");
              window.setTimeout(function () {
                window.location.assign(targetUrl.href);
              }, 170);
            });
          }

          window.addEventListener("pageshow", function () {
            body.classList.remove("route-leaving");
          });

          updateScrollProgress();
          window.addEventListener("scroll", updateScrollProgress, { passive: true });
          window.addEventListener("resize", updateScrollProgress);
        });
      })();

      // Figure text is plain text, so math like "x_t" or "b_{lead}" would show
      // its underscore. Rewrite those as real subscripts wherever a figure
      // draws: a lowered, smaller tspan inside SVG, <sub> in HTML. Code and
      // form fields are left alone.
      (function () {
        var SUB = /(^|[^A-Za-z0-9_])([A-Za-zΑ-ω][̂̄]?)_(\{([^}]*)\}|[A-Za-z0-9α-ω]+)/;
        var SVGNS = "http://www.w3.org/2000/svg";
        function convert(node) {
          if (!node) return;
          var text = node.nodeValue, m = text && SUB.exec(text);
          if (!m) return;
          var parent = node.parentNode;
          if (!parent || parent.closest("code, pre, textarea, script, style, .katex, title")) return;
          var inSvg = parent instanceof SVGElement;
          var frag = document.createDocumentFragment(), rest = text, hit;
          while ((hit = SUB.exec(rest))) {
            var start = hit.index + hit[1].length;
            frag.appendChild(document.createTextNode(rest.slice(0, start) + hit[2]));
            var label = hit[4] !== undefined ? hit[4] : hit[3];
            if (inSvg) {
              var s = document.createElementNS(SVGNS, "tspan");
              s.setAttribute("dy", "0.3em");
              s.setAttribute("font-size", "72%");
              s.textContent = label;
              frag.appendChild(s);
              rest = rest.slice(hit.index + hit[0].length);
              // Lift the baseline back for whatever follows.
              var back = document.createElementNS(SVGNS, "tspan");
              back.setAttribute("dy", "-0.3em");
              back.textContent = rest || "\u200B";
              frag.appendChild(back);
              parent.replaceChild(frag, node);
              if (rest) convert(back.firstChild);
              return;
            }
            var sub = document.createElement("sub");
            sub.textContent = label;
            frag.appendChild(sub);
            rest = rest.slice(hit.index + hit[0].length);
          }
          frag.appendChild(document.createTextNode(rest));
          parent.replaceChild(frag, node);
        }
        function scan(root) {
          var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), list = [], n;
          while ((n = walker.nextNode())) if (n.nodeValue.indexOf("_") >= 0) list.push(n);
          list.forEach(convert);
        }
        function watch() {
          var figures = document.querySelectorAll(".blog-diagram, .review-figure, figure");
          if (!figures.length) return;
          var observer = new MutationObserver(function (records) {
            records.forEach(function (r) {
              if (r.type === "characterData") { if (r.target.nodeValue && r.target.nodeValue.indexOf("_") >= 0) convert(r.target); }
              else r.addedNodes.forEach(function (a) { if (a.nodeType === 3) { if (a.nodeValue.indexOf("_") >= 0) convert(a); } else if (a.nodeType === 1) scan(a); });
            });
          });
          figures.forEach(function (f) { scan(f); observer.observe(f, { childList: true, subtree: true, characterData: true }); });
        }
        if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", watch); else watch();
      })();
