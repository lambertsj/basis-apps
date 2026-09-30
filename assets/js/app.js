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
        ? "inline-flex items-center rounded-lg bg-green-800 px-3 py-2 text-sm font-medium text-white hover:bg-green-900"
        : "inline-flex items-center rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-600 dark:hover:bg-zinc-800",
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

  function card(app) {
    var article = el(
      "article",
      "flex flex-col rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-900"
    );

    var head = el("div", "flex items-start justify-between gap-3");
    head.appendChild(el("h3", "text-lg font-semibold", app.name));
    head.appendChild(
      el(
        "span",
        "shrink-0 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-900 dark:bg-green-900/40 dark:text-green-200",
        "Basis Certified"
      )
    );
    article.appendChild(head);

    article.appendChild(
      el("p", "mt-1 text-sm font-medium text-zinc-700 dark:text-zinc-300", app.tagline)
    );
    article.appendChild(
      el("p", "mt-3 flex-1 text-sm text-zinc-600 dark:text-zinc-400", app.description)
    );

    var meta = [categoryLabel(app.category)]
      .concat(Array.isArray(app.platforms) ? app.platforms : [])
      .join(" · ");
    article.appendChild(el("p", "mt-4 text-xs text-zinc-500 dark:text-zinc-500", meta));

    var actions = el("div", "mt-4 flex flex-wrap gap-2");
    var url = safeUrl(app.url);
    var source = safeUrl(app.source);
    if (url) {
      actions.appendChild(linkButton("Bekijk de app", url, true));
    } else {
      actions.appendChild(
        el(
          "span",
          "inline-flex items-center rounded-lg bg-zinc-100 px-3 py-2 text-sm text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
          "Link volgt binnenkort"
        )
      );
    }
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
        "rounded-full border px-3 py-1.5 text-sm " +
          (active
            ? "border-green-800 bg-green-800 text-white"
            : "border-zinc-300 hover:bg-zinc-100 dark:border-zinc-600 dark:hover:bg-zinc-800"),
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
