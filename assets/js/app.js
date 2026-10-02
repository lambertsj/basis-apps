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

  // Gloed achter het icoon per categorie. Volledige klassenamen, zodat Tailwind ze vindt.
  var TILE_TINT = {
    administratie: "from-white to-green-100/80 dark:from-stone-900 dark:to-green-950/50",
    wonen: "from-white to-amber-100/80 dark:from-stone-900 dark:to-amber-950/40",
  };
  var TILE_TINT_DEFAULT = "from-white to-stone-100 dark:from-stone-900 dark:to-stone-800/60";

  function safeUrl(value) {
    if (typeof value !== "string") return null;
    try {
      var u = new URL(value);
      return u.protocol === "https:" || u.protocol === "http:" ? u.href : null;
    } catch (e) {
      return null;
    }
  }

  // Iconen staan lokaal in assets/icons/. Geen externe adressen: dat zou bezoekers volgen.
  function safeIcon(value) {
    if (typeof value !== "string") return null;
    return /^assets\/icons\/[A-Za-z0-9._-]+\.(png|jpe?g|webp|svg)$/.test(value) ? value : null;
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  var ICONS = {
    globe: {
      stroke: true,
      d: ["M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z", "M3 12h18", "M12 3c2.5 2.4 3.8 5.4 3.8 9s-1.3 6.6-3.8 9c-2.5-2.4-3.8-5.4-3.8-9S9.5 5.4 12 3z"]
    },
    github: {
      stroke: false,
      d: ["M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-2c-3.2.7-3.87-1.37-3.87-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.69 1.25 3.35.96.1-.74.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.78 0c2.2-1.49 3.17-1.18 3.17-1.18.62 1.59.23 2.76.11 3.05.74.81 1.18 1.83 1.18 3.09 0 4.42-2.7 5.4-5.27 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z"]
    }
  };

  function icon(name) {
    var ns = "http://www.w3.org/2000/svg";
    var def = ICONS[name];
    var svg = document.createElementNS(ns, "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("class", "mr-1.5 h-4 w-4 shrink-0");
    svg.setAttribute("aria-hidden", "true");
    if (def.stroke) {
      svg.setAttribute("fill", "none");
      svg.setAttribute("stroke", "currentColor");
      svg.setAttribute("stroke-width", "1.8");
      svg.setAttribute("stroke-linecap", "round");
      svg.setAttribute("stroke-linejoin", "round");
    } else {
      svg.setAttribute("fill", "currentColor");
    }
    def.d.forEach(function (d) {
      var path = document.createElementNS(ns, "path");
      path.setAttribute("d", d);
      svg.appendChild(path);
    });
    return svg;
  }

  function linkButton(label, href, primary, iconName) {
    var a = el(
      "a",
      primary
        ? "inline-flex items-center rounded-full bg-green-800 px-4 py-2 text-sm font-medium text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_1px_2px_rgba(20,83,45,0.35)] transition hover:bg-green-900 active:scale-[0.98]"
        : "inline-flex items-center rounded-full px-2 py-2 text-sm font-medium text-stone-600 underline decoration-stone-300 underline-offset-4 transition hover:text-stone-900 hover:decoration-green-700 dark:text-stone-400 dark:decoration-stone-700 dark:hover:text-stone-100 dark:hover:decoration-green-400",
      label
    );
    if (iconName) a.insertBefore(icon(iconName), a.firstChild);
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
      "absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-green-900 shadow-sm ring-1 ring-green-800/15 backdrop-blur dark:bg-stone-900/80 dark:text-green-300 dark:ring-green-400/20"
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

  var ICON_CLASS =
    "h-24 w-24 rounded-[22%] shadow-[0_18px_34px_-10px_rgba(28,25,23,0.45),0_0_0_1px_rgba(28,25,23,0.06)] transition duration-500 group-hover:-translate-y-1 group-hover:scale-105 group-hover:-rotate-2";

  function iconTile(app) {
    var tint = TILE_TINT[app.category] || TILE_TINT_DEFAULT;
    var tile = el(
      "div",
      "relative grid aspect-[4/3] place-items-center rounded-[1.4rem] bg-gradient-to-b " + tint
    );
    var src = safeIcon(app.icon);
    if (src) {
      var img = el("img", ICON_CLASS);
      img.src = src;
      img.alt = "";
      img.width = 96;
      img.height = 96;
      tile.appendChild(img);
    } else {
      var letter = el(
        "div",
        ICON_CLASS + " grid place-items-center bg-green-800 text-4xl font-semibold text-white",
        String(app.name || "?").charAt(0).toUpperCase()
      );
      letter.setAttribute("aria-hidden", "true");
      tile.appendChild(letter);
    }
    tile.appendChild(certifiedBadge());
    return tile;
  }

  function card(app) {
    var article = el(
      "article",
      "group flex flex-col rounded-[1.9rem] bg-stone-100/80 p-2 ring-1 ring-stone-900/5 transition duration-300 hover:shadow-[0_28px_50px_-30px_rgba(20,83,45,0.5)] dark:bg-stone-800/40 dark:ring-white/10 dark:hover:shadow-none"
    );
    article.appendChild(iconTile(app));

    var body = el("div", "flex flex-1 flex-col px-4 pb-3 pt-5");
    body.appendChild(el("h3", "text-xl font-semibold tracking-tight", app.name));
    body.appendChild(
      el("p", "mt-1.5 font-medium text-stone-800 dark:text-stone-200", app.tagline)
    );
    body.appendChild(
      el(
        "p",
        "mt-3 flex-1 text-pretty text-sm leading-relaxed text-stone-600 dark:text-stone-400",
        app.description
      )
    );

    var meta = [categoryLabel(app.category)]
      .concat(Array.isArray(app.platforms) ? app.platforms : [])
      .join(" · ");
    body.appendChild(el("p", "mt-5 text-xs text-stone-500", meta));

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
          "inline-flex items-center rounded-full bg-stone-200/70 px-4 py-2 text-sm text-stone-600 dark:bg-stone-800 dark:text-stone-400",
          "Link volgt binnenkort"
        )
      );
    }
    if (website) actions.appendChild(linkButton("Website", website, false, "globe"));
    if (source) actions.appendChild(linkButton("Broncode", source, false, "github"));
    body.appendChild(actions);
    article.appendChild(body);

    return article;
  }

  // Uitnodiging in de laatste kolom, alleen zonder filter of zoekterm.
  function inviteTile() {
    var a = el(
      "a",
      "group flex min-h-[18rem] flex-col items-center justify-center rounded-[1.9rem] border-2 border-dashed border-stone-300 p-8 text-center transition hover:border-green-700 hover:bg-green-50/60 dark:border-stone-700 dark:hover:border-green-400 dark:hover:bg-green-400/5"
    );
    a.href = "#aanmelden";
    a.appendChild(
      el(
        "span",
        "grid h-14 w-14 place-items-center rounded-2xl bg-amber-200 text-3xl font-light text-stone-900 transition duration-300 group-hover:rotate-90 dark:bg-amber-300",
        "+"
      )
    );
    a.appendChild(el("span", "mt-5 text-xl font-semibold tracking-tight", "Jouw app hier?"));
    a.appendChild(
      el("span", "mt-1.5 max-w-[14rem] text-sm text-stone-600 dark:text-stone-400", "Voldoet hij aan het manifest? Meld hem aan.")
    );
    return a;
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
    var nodes = list.map(card);
    if (state.category === "alle" && !state.query) nodes.push(inviteTile());
    els.grid.replaceChildren.apply(els.grid, nodes);
    els.count.textContent =
      list.length === 1 ? "1 app gevonden" : list.length + " apps gevonden";
    els.status.hidden = list.length !== 0;
    if (list.length === 0) {
      els.status.textContent = "Geen apps gevonden. Probeer een andere zoekterm of categorie.";
    }
  }

  function countFor(id) {
    if (id === "alle") return state.apps.length;
    return state.apps.filter(function (a) {
      return a.category === id;
    }).length;
  }

  function renderFilters() {
    els.filters.replaceChildren();
    state.categories.forEach(function (c) {
      var active = c.id === state.category;
      var b = el(
        "button",
        "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm transition active:scale-[0.97] " +
          (active
            ? "border-transparent bg-amber-200 text-stone-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] dark:bg-amber-300"
            : "border-stone-300 bg-white hover:border-stone-400 hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-900 dark:hover:bg-stone-800"),
        c.label
      );
      b.appendChild(
        el("span", "text-xs tabular-nums " + (active ? "text-stone-700" : "text-stone-400"), String(countFor(c.id)))
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
