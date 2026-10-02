// Laadt ideas.json en toont de ideeën als tegels.
// Alle tekst uit ideas.json gaat via textContent: ideeën kunnen van derden komen.

(function () {
  "use strict";

  var grid = document.getElementById("idea-grid");
  var status = document.getElementById("idea-status");
  if (!grid) return;

  var SUBMIT_URL = "https://github.com/lambertsj/basis-apps/issues/new?template=app_submission.md";

  var EFFORT = {
    weekend: "Weekendproject",
    "paar-weekenden": "Paar weekenden",
  };

  // Volledige klassenamen, zodat Tailwind ze vindt.
  var TINTS = [
    "bg-green-100/70 dark:bg-green-400/10",
    "bg-amber-100/80 dark:bg-amber-300/10",
    "bg-stone-100 dark:bg-stone-800/50",
  ];

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function tile(idea, index) {
    var article = el(
      "article",
      "group flex flex-col rounded-3xl p-6 ring-1 ring-stone-900/5 transition duration-300 hover:-translate-y-1 dark:ring-white/10 " +
        TINTS[index % TINTS.length]
    );
    article.appendChild(
      el(
        "p",
        "text-xs font-medium uppercase tracking-wider text-stone-500 dark:text-stone-400",
        EFFORT[idea.effort] || "Aan jou om in te schatten"
      )
    );
    article.appendChild(el("h3", "mt-3 text-xl font-semibold tracking-tight", idea.name));
    article.appendChild(
      el(
        "p",
        "mt-2 flex-1 text-pretty text-sm leading-relaxed text-stone-700 dark:text-stone-300",
        idea.pitch
      )
    );
    var a = el(
      "a",
      "mt-5 inline-flex items-center gap-1.5 self-start text-sm font-medium underline decoration-stone-400/60 decoration-2 underline-offset-4 transition hover:decoration-green-700 dark:hover:decoration-green-400",
      "Ik bouw dit "
    );
    a.appendChild(
      el("span", "transition-transform group-hover:translate-x-0.5", "→")
    );
    a.href = SUBMIT_URL + "&title=" + encodeURIComponent("Idee: " + idea.name);
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    article.appendChild(a);
    return article;
  }

  fetch("ideas.json", { cache: "no-cache" })
    .then(function (res) {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.json();
    })
    .then(function (data) {
      var ideas = Array.isArray(data.ideas) ? data.ideas : [];
      grid.replaceChildren.apply(grid, ideas.map(tile));
      status.hidden = ideas.length !== 0;
      if (ideas.length === 0) status.textContent = "Er staan nog geen ideeën op de lijst.";
    })
    .catch(function () {
      status.hidden = false;
      status.textContent = "De ideeën konden niet worden geladen. Probeer het later opnieuw.";
    });
})();
