// Laadt apps.json, toont de apps en filtert op categorie en zoekterm.
// Alle tekst uit apps.json gaat via textContent: aanmeldingen zijn van derden.

(function () {
  "use strict";

  var state = { apps: [], categories: [], category: "alle", query: "" };

  var els = {
    grid: document.getElementById("app-grid"),
    filters: document.getElementById("app-filters"),
    search: document.getElementById("app-search"),
    status: document.getElementById("app-status"),
    count: document.getElementById("app-count"),
  };

  function safeUrl(value) {
    if (typeof value !== "string") return null;
    try {
      var u = new URL(value);
      return u.protocol === "https:" || u.protocol === "http:" ? u.href : null;
    } catch (e) {
      return null;
    }
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function linkButton(label, href, primary) {
    var a = el(
      "a",
      primary
        ? "inline-flex items-center rounded-lg bg-green-800 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-green-900 active:scale-[0.98]"
        : "inline-flex items-center rounded-lg px-2.5 py-2 text-sm font-medium text-stone-600 underline decoration-stone-300 underline-offset-4 transition hover:text-stone-900 hover:decoration-green-700 dark:text-stone-400 dark:decoration-stone-700 dark:hover:text-stone-100 dark:hover:decoration-green-400",
      label
    );
    a.href = href;
    a.rel = "noopener noreferrer";
    a.target = "_blank";
    return a;
  }

  function categoryLabel(id) {
    var c = state.categories.find(function (x) {
      return x.id === id;
    });
    return c ? c.label : id;
  }

  function certifiedBadge() {
    var ns = "http://www.w3.org/2000/svg";
    var badge = el(
      "span",
      "inline-flex shrink-0 items-center gap-1 rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-900 ring-1 ring-inset ring-green-800/15 dark:bg-green-400/10 dark:text-green-300 dark:ring-green-400/20"
    );
    var svg = document.createElementNS(ns, "svg");
    svg.setAttribute("viewBox", "0 0 16 16");
    svg.setAttribute("class", "h-3 w-3");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "2.2");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");
    svg.setAttribute("aria-hidden", "true");
    var path = document.createElementNS(ns, "path");
    path.setAttribute("d", "M3 8.5l3.2 3.2L13 4.8");
    svg.appendChild(path);
    badge.appendChild(svg);
    badge.appendChild(document.createTextNode("Basis Certified"));
    return badge;
  }

  function card(app) {
    var article = el(
      "article",
      "flex flex-col rounded-xl bg-stone-50 p-6 ring-1 ring-stone-900/5 transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-24px_rgba(20,83,45,0.4)] dark:bg-stone-950 dark:ring-white/10 dark:hover:shadow-none"
    );

    var head = el("div", "flex items-start justify-between gap-3");
    head.appendChild(el("h3", "text-xl font-semibold tracking-tight", app.name));
    head.appendChild(certifiedBadge());
    article.appendChild(head);

    article.appendChild(
      el("p", "mt-2 font-medium text-stone-800 dark:text-stone-200", app.tagline)
    );
    article.appendChild(
      el("p", "mt-3 flex-1 text-pretty text-sm leading-relaxed text-stone-600 dark:text-stone-400", app.description)
    );

    var meta = [categoryLabel(app.category)]
      .concat(Array.isArray(app.platforms) ? app.platforms : [])
      .join(" · ");
    article.appendChild(el("p", "mt-5 text-xs text-stone-500", meta));

    var actions = el("div", "mt-4 flex flex-wrap items-center gap-x-1 gap-y-2");
    var url = safeUrl(app.url);
    var source = safeUrl(app.source);
    var website = safeUrl(app.website);
    if (url) {
      actions.appendChild(linkButton("Bekijk de app", url, true));
    } else {
      actions.appendChild(
        el(
          "span",
          "inline-flex items-center rounded-lg bg-stone-200/70 px-3.5 py-2 text-sm text-stone-600 dark:bg-stone-800 dark:text-stone-400",
          "Link volgt binnenkort"
        )
      );
    }
    if (website) actions.appendChild(linkButton("Website", website, false));
    if (source) actions.appendChild(linkButton("Broncode", source, false));
    article.appendChild(actions);

    return article;
  }

  function matches(app) {
    if (state.category !== "alle" && app.category !== state.category) return false;
    if (!state.query) return true;
    var haystack = [app.name, app.tagline, app.description, categoryLabel(app.category)]
      .join(" ")
      .toLowerCase();
    return haystack.indexOf(state.query) !== -1;
  }

  function renderApps() {
    var list = state.apps.filter(matches);
    els.grid.replaceChildren.apply(els.grid, list.map(card));
    els.count.textContent =
      list.length === 1 ? "1 app gevonden" : list.length + " apps gevonden";
    els.status.hidden = list.length !== 0;
    if (list.length === 0) {
      els.status.textContent = "Geen apps gevonden. Probeer een andere zoekterm of categorie.";
    }
  }

  function renderFilters() {
    els.filters.replaceChildren();
    state.categories.forEach(function (c) {
      var active = c.id === state.category;
      var b = el(
        "button",
        "rounded-md border px-3 py-1.5 text-sm transition active:scale-[0.97] " +
          (active
            ? "border-green-800 bg-green-800 text-white"
            : "border-stone-300 hover:bg-stone-100 dark:border-stone-700 dark:hover:bg-stone-800"),
        c.label
      );
      b.type = "button";
      b.setAttribute("aria-pressed", active ? "true" : "false");
      b.addEventListener("click", function () {
        state.category = c.id;
        renderFilters();
        renderApps();
      });
      els.filters.appendChild(b);
    });
  }

  function showError(message) {
    els.grid.replaceChildren();
    els.status.hidden = false;
    els.status.textContent = message;
  }

  els.search.addEventListener("input", function () {
    state.query = els.search.value.trim().toLowerCase();
    renderApps();
  });

  fetch("apps.json", { cache: "no-cache" })
    .then(function (res) {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.json();
    })
    .then(function (data) {
      state.categories = Array.isArray(data.categories) ? data.categories : [];
      state.apps = Array.isArray(data.apps) ? data.apps : [];
      renderFilters();
      renderApps();
    })
    .catch(function () {
      showError("De lijst met apps kon niet worden geladen. Probeer het later opnieuw.");
    });
})();
