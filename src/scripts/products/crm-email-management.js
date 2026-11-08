/* =========================================================
   CRM & EMAIL MANAGEMENT — the page's own demos.
   graphic-design.js (loaded first) runs the page chrome, the email
   rail and viewer, and the brief form. This file only adds:

   1. Tabs (automation triggers, evaluation problems)
   2. Segment demo (conditions → audience → message)
   3. Plan finder (three answers → a first direction)
   4. "Request an audit" ticks its need in the brief

   Copy is written in both languages (lang-id / lang-en spans), so
   nothing here has to listen for a language change.
========================================================= */
(function () {
  "use strict";

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const motionOK = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* =========================================================
     1. TABS — [data-crm-tabs], ARIA tabs with arrow keys.
     data-auto="ms" cycles while on screen, until someone picks one.
  ========================================================= */
  $$("[data-crm-tabs]").forEach((box) => {
    const tabs = $$('[role="tab"]', box);
    const panels = tabs.map((tab) => document.getElementById(tab.getAttribute("aria-controls")));
    const every = Number(box.dataset.auto) || 0;
    let index = 0;
    let timer = 0;
    let picked = false;
    let inView = false;

    function select(i, focus) {
      index = (i + tabs.length) % tabs.length;
      tabs.forEach((tab, k) => {
        tab.setAttribute("aria-selected", String(k === index));
        tab.tabIndex = k === index ? 0 : -1;
        panels[k].hidden = k !== index;
      });
      if (focus) tabs[index].focus();
    }

    function schedule() {
      clearTimeout(timer);
      if (!every || picked || !motionOK || !inView || document.hidden) return;
      timer = setTimeout(() => {
        select(index + 1, false);
        schedule();
      }, every);
    }

    tabs.forEach((tab, i) => {
      tab.addEventListener("click", () => {
        picked = true;
        clearTimeout(timer);
        select(i, false);
      });
      tab.addEventListener("keydown", (e) => {
        const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
        if (e.key === "Home" || e.key === "End" || step) {
          e.preventDefault();
          picked = true;
          clearTimeout(timer);
          select(e.key === "Home" ? 0 : e.key === "End" ? tabs.length - 1 : index + step, true);
        }
      });
    });

    if (every) {
      new IntersectionObserver((entries) => {
        inView = entries[0].isIntersecting;
        schedule();
      }, { threshold: 0.35 }).observe(box);
      document.addEventListener("visibilitychange", schedule);
    }
  });

  /* =========================================================
     2. SEGMENT DEMO — made-up contacts (seeded, so it looks the
     same on every visit). A "clicked" contact has always opened.
     Unsubscribed contacts are never included, whatever is on.
  ========================================================= */
  (function segment() {
    const box = $("[data-seg]");
    if (!box) return;
    const field = $("[data-seg-dots]", box);
    const rules = $$('input[type="checkbox"]', box);
    const count = $("[data-seg-count]", box);
    const subject = $("[data-seg-subject]", box);
    const why = $("[data-seg-why]", box);
    const tag = $("[data-seg-tag]", box);
    const TOTAL = 144;

    let seed = 20261108;
    const random = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };

    const contacts = Array.from({ length: TOTAL }, () => {
      const opened = random() < 0.58;
      return {
        out: random() < 0.07,
        opened,
        clicked: opened && random() < 0.55,
        buyer: random() < 0.38,
        city: random() < 0.52,
      };
    });

    const dots = contacts.map((c) => {
      const dot = document.createElement("i");
      if (c.out) dot.className = "is-out";
      field.append(dot);
      return dot;
    });
    $("[data-seg-total]", box).textContent = String(TOTAL);

    const name = "<mark>{{name}}</mark>";
    const both = (id, en) => `<span class="lang-id">${id}</span><span class="lang-en">${en}</span>`;
    const MESSAGES = {
      "clicked+buyer": [
        both(`${name}, ada versi baru dari produk yang kamu lihat`, `${name}, there's a new version of what you viewed`),
        both("Sudah beli dan baru klik produk: tawarkan upgrade, bukan perkenalan.", "Bought before and just clicked: offer an upgrade, not an introduction."),
      ],
      clicked: [
        both(`Masih menimbang, ${name}? Ini detailnya`, `Still deciding, ${name}? Here are the details`),
        both("Sudah klik tapi belum beli: kirim detail dan jawab keraguannya.", "Clicked but hasn't bought: send details and answer doubts."),
      ],
      buyer: [
        both(`Terima kasih sudah bertransaksi, ${name}`, `Thanks for your purchase, ${name}`),
        both("Pelanggan: ucapkan terima kasih, lalu tawarkan produk terkait.", "Customers: say thanks, then offer something related."),
      ],
      opened: [
        both(`Update bulan ini untukmu, ${name}`, `This month's update for you, ${name}`),
        both("Pembaca aktif: cocok untuk newsletter rutin dan edukasi.", "Active readers: right for regular newsletters and education."),
      ],
      all: [
        both("Newsletter bulanan", "Monthly newsletter"),
        both("Semua kontak aktif dapat pesan umum. Yang unsubscribe tidak ikut.", "Every active contact gets a general message. Unsubscribes are left out."),
      ],
    };

    function render() {
      const on = rules.filter((r) => r.checked).map((r) => r.value);
      let reached = 0;
      contacts.forEach((c, i) => {
        const hit = !c.out && on.every((rule) => c[rule]);
        dots[i].classList.toggle("is-on", hit);
        if (hit) reached += 1;
      });
      count.textContent = String(reached);
      const has = (rule) => on.includes(rule);
      const key = has("clicked") && has("buyer") ? "clicked+buyer"
        : has("clicked") ? "clicked"
        : has("buyer") ? "buyer"
        : has("opened") ? "opened"
        : "all";
      subject.innerHTML = MESSAGES[key][0];
      why.innerHTML = MESSAGES[key][1];
      tag.hidden = !has("city");
    }

    // "Clicked" needs "opened": ticking one keeps the other consistent
    rules.forEach((rule) => rule.addEventListener("change", () => {
      const opened = rules.find((r) => r.value === "opened");
      const clicked = rules.find((r) => r.value === "clicked");
      if (rule === clicked && clicked.checked) opened.checked = true;
      if (rule === opened && !opened.checked) clicked.checked = false;
      render();
    }));
    render();
  })();

  /* =========================================================
     3. PLAN FINDER
  ========================================================= */
  (function finder() {
    const box = $("[data-fit]");
    if (!box) return;
    const form = $("form", box);
    const plans = $$("[data-plan]", box);
    const notes = $$("[data-size]", box);
    const result = $(".fit-result", box);
    const lineup = $$("[data-lineup]", box);
    const PICKS = { mailchimp: ["mailchimp"], resend: ["resend"], combo: ["resend", "mailchimp"], insider: ["insider"] };

    function render() {
      const d = new FormData(form);
      const plan = d.get("channel") === "multi" ? "insider"
        : d.get("send") === "system" ? "resend"
        : d.get("send") === "both" ? "combo"
        : "mailchimp";
      result.dataset.active = plan;
      lineup.forEach((el) => el.classList.toggle("is-pick", PICKS[plan].includes(el.dataset.lineup)));
      plans.forEach((el) => (el.hidden = el.dataset.plan !== plan));
      notes.forEach((el) => (el.hidden = el.dataset.size !== d.get("size")));
    }

    form.addEventListener("change", render);
    form.addEventListener("submit", (e) => e.preventDefault());
    render();
  })();

  /* =========================================================
     4. A link with data-pick ticks that need in the brief
  ========================================================= */
  $$("[data-pick]").forEach((link) => {
    link.addEventListener("click", () => {
      const box = $(`[data-brief] [name="need"][value="${link.dataset.pick}"]`);
      if (!box || box.checked) return;
      box.checked = true;
      box.dispatchEvent(new Event("change", { bubbles: true }));
    });
  });
})();
