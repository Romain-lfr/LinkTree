const CONFIG = {
  host: "romain-lfr.com",         
  user: "visiteur",
  owner: "Romain-Lfr",

  // Lignes affichées
  whoami: [
    "Romain Lefranc, Étudiant en BUT Informatique.",
    "Je me spécialise dans l'exploitation de données et la DATA IA.",
    "Ici, tu trouves les projets que j'héberge en ce moment."
  ],

  // "url" = chemin sur ton Hostinger ("/mon-projet/") ou URL complète.
  projects: [
    { id: "Myxo", name: "Myxo", url: "/myxo/", desc: "Myxo est une application web spécialisée dans la création et l'exploration de cocktails.", stack: "React, Nest, Prisma, PostgreSQL" },
    { id: "Portfolio", name: "Portfolio", url: "/portfolio/", desc: "Mon portfolio personnel.", stack: "HTML, CSS, JavaScript" },
    // { id: "projet-3", name: "Projet 3", url: "/projet-3/", desc: "Une phrase qui dit ce que fait le projet.", stack: "Node.js" },
    // { id: "projet-4", name: "Projet 4", url: "/projet-4/", desc: "Une phrase qui dit ce que fait le projet.", stack: "Python" }
  ],

  // Liens de contact 
  contact: [
    { label: "github",   url: "https://github.com/Romain-lfr" },
    { label: "linkedin", url: "https://www.linkedin.com/in/romain-lefranc-723712354/" },
    { label: "mail",     url: "mailto:lefranc.romain@outlook.fr" }
  ],

  defaultTheme: "ambre"
};
/* ========================================================= */

const $ = (s) => document.querySelector(s);
const out = $("#out"), term = $("#term"), form = $("#line"), input = $("#cmd");
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const history = [];
let histPos = 0;

/* ---------- petits utilitaires ---------- */
function el(tag, props = {}, ...kids) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (k === "class") n.className = v;
    else if (k === "text") n.textContent = v;
    else n.setAttribute(k, v);
  }
  for (const k of kids) n.append(k);
  return n;
}
function scroll() { term.scrollTop = term.scrollHeight; }
function print(text = "", cls = "") { out.append(el("div", { class: ("line " + cls).trim(), text })); scroll(); }
function printNode(node) { out.append(node); scroll(); }

function promptNode() {
  return el("span", { class: "prompt" },
    `${CONFIG.user}@${CONFIG.host}:`, el("span", { class: "path", text: "~" }), "$");
}
function echoCommand(cmd) {
  const line = el("div", { class: "line" }, promptNode(), " ", el("span", { class: "hi", text: cmd }));
  printNode(line);
}
function link(label, url, extra = {}) {
  const a = el("a", { href: url, text: label, ...extra });
  if (/^https?:\/\//.test(url) && !url.includes(location.host)) {
    a.target = "_blank"; a.rel = "noopener";
  }
  return a;
}
function findProject(id) {
  if (!id) return null;
  const key = id.replace(/\/$/, "").toLowerCase();
  return CONFIG.projects.find(p => p.id.toLowerCase() === key);
}
function needProject(cmd, arg) {
  if (!arg) { print(`${cmd} : il manque le nom du projet. Exemple : ${cmd} ${CONFIG.projects[0]?.id ?? "projet"}`, "err"); return null; }
  const p = findProject(arg);
  if (!p) { print(`${cmd} : « ${arg} » n'existe pas. Tape ls pour voir les projets.`, "err"); return null; }
  return p;
}

/* ---------- thèmes ---------- */
const THEMES = ["ambre", "vert", "blanc"];
function setTheme(name, save = true) {
  document.documentElement.dataset.theme = name;
  $("#statusTheme").textContent = name;
  if (save) { try { localStorage.setItem("term-theme", name); } catch (e) {} }
}

/* ---------- commandes ---------- */
const COMMANDS = {
  help: {
    desc: "affiche cette aide",
    run() {
      const g = el("div", { class: "help block" });
      for (const [name, c] of Object.entries(COMMANDS)) {
        if (c.hidden) continue;
        g.append(el("span", { class: "hi", text: name + (c.args ? " " + c.args : "") }), el("span", { class: "dim", text: c.desc }));
      }
      printNode(g);
      print("Astuce : Tab complète les noms, ↑ et ↓ rappellent les commandes précédentes.", "dim");
    }
  },
  ls: {
    args: "[-l]",
    desc: "liste les projets (-l avec les descriptions)",
    run(args) {
      if (args.includes("-l") || args.includes("-la") || args.includes("-al")) {
        const g = el("div", { class: "ls-l" });
        for (const p of CONFIG.projects) {
          const desc = el("span", { class: "desc" }, p.desc);
          if (p.stack) desc.append(" ", el("span", { class: "stack", text: `[${p.stack}]` }));
          g.append(link(p.id + "/", p.url), desc);
        }
        printNode(g);
      } else {
        const row = el("div", { class: "line ls" });
        for (const p of CONFIG.projects) row.append(link(p.id + "/", p.url));
        if (CONFIG.contact.length) row.append(el("span", { text: "contact.txt" }));
        printNode(row);
      }
    }
  },
  cat: {
    args: "<projet>",
    desc: "affiche les détails d'un projet",
    run([arg]) {
      if (arg && arg.replace(/\.txt$/, "") === "contact") return COMMANDS.contact.run();
      const p = needProject("cat", arg); if (!p) return;
      const b = el("div", { class: "block" });
      b.append(
        el("div", { class: "line hi", text: p.name }),
        el("div", { class: "line", text: p.desc }),
      );
      if (p.stack) b.append(el("div", { class: "line dim", text: "stack : " + p.stack }));
      b.append(el("div", { class: "line" }, "ouvrir : ", link(p.url, p.url)));
      printNode(b);
    }
  },
  open: {
    args: "<projet>",
    desc: "ouvre un projet",
    run([arg]) {
      const p = needProject("open", arg); if (!p) return;
      print(`Ouverture de ${p.id}…`, "dim");
      setTimeout(() => { location.href = p.url; }, reduced ? 0 : 450);
    }
  },
  whoami: {
    desc: "qui je suis",
    run() { const b = el("div", { class: "block" }); CONFIG.whoami.forEach(t => b.append(el("div", { class: "line", text: t }))); printNode(b); }
  },
  contact: {
    desc: "me contacter",
    run() {
      if (!CONFIG.contact.length) return print("Pas de contact renseigné.", "dim");
      const g = el("div", { class: "help block" });
      for (const c of CONFIG.contact) g.append(el("span", { class: "dim", text: c.label }), link(c.url.replace(/^mailto:|^https?:\/\/(www\.)?/, ""), c.url));
      printNode(g);
    }
  },
  theme: {
    args: "<ambre|vert|blanc>",
    desc: "change les couleurs",
    run([arg]) {
      if (!THEMES.includes(arg)) return print(`Thèmes disponibles : ${THEMES.join(", ")}. Exemple : theme vert`, arg ? "err" : "");
      setTheme(arg); print(`Thème ${arg} appliqué.`, "dim");
    }
  },
  history: {
    desc: "commandes tapées",
    run() { history.forEach((h, i) => print(`${String(i + 1).padStart(3)}  ${h}`)); }
  },
  clear: { desc: "efface l'écran", run() { out.replaceChildren(); } },

  /* commandes cachées */
  cd:     { hidden: true, run(args) { if (!args[0] || args[0] === "~") return; COMMANDS.open.run(args); } },
  pwd:    { hidden: true, run() { print("/home/" + CONFIG.user); } },
  date:   { hidden: true, run() { print(new Date().toLocaleString("fr-FR", { dateStyle: "full", timeStyle: "short" })); } },
  echo:   { hidden: true, run(args) { print(args.join(" ")); } },
  sudo:   { hidden: true, run() { print(`${CONFIG.user} n'est pas dans le fichier sudoers. Cet incident sera signalé.`, "err"); } },
  rm:     { hidden: true, run() { print("Bien tenté. Rien n'a été supprimé.", "err"); } },
  exit:   { hidden: true, run() { print("Il n'y a pas de sortie. Mais il y a des projets : tape ls.", "dim"); } },
  hello:  { hidden: true, run() { print("Salut ! Tape help pour commencer."); } },
  bonjour:{ hidden: true, run() { print("Bonjour ! Tape help pour commencer."); } },
  vim:    { hidden: true, run() { print("Tu n'en ressortiras jamais. Essaie plutôt cat.", "dim"); } }
};

function run(raw, { echo = true } = {}) {
  const line = raw.trim();
  if (echo) echoCommand(line);
  if (!line) return;
  if (history[history.length - 1] !== line) history.push(line);
  histPos = history.length;

  const [name, ...args] = line.split(/\s+/);
  const key = name.toLowerCase();
  if (COMMANDS[key]) return COMMANDS[key].run(args);
  if (findProject(key)) return COMMANDS.cat.run([key]);   // taper juste le nom d'un projet
  print(`${name} : commande introuvable. Tape help pour voir ce qui existe.`, "err");
}

/* ---------- autocomplétion ---------- */
function complete() {
  const v = input.value;
  const parts = v.split(/\s+/);
  let pool, current;
  if (parts.length <= 1) {
    pool = Object.keys(COMMANDS).filter(k => !COMMANDS[k].hidden).concat(CONFIG.projects.map(p => p.id));
    current = parts[0];
  } else {
    pool = parts[0] === "theme" ? THEMES : CONFIG.projects.map(p => p.id);
    current = parts[parts.length - 1];
  }
  const matches = pool.filter(x => x.startsWith(current.toLowerCase()));
  if (matches.length === 1) {
    parts[parts.length - 1] = matches[0];
    input.value = parts.join(" ") + " ";
  } else if (matches.length > 1) {
    echoCommand(v);
    print(matches.join("   "), "dim");
  }
}

/* ---------- saisie ---------- */
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const v = input.value;
  input.value = "";
  run(v);
});
input.addEventListener("keydown", (e) => {
  if (e.key === "Tab") { e.preventDefault(); complete(); }
  else if (e.key === "ArrowUp") { e.preventDefault(); if (histPos > 0) input.value = history[--histPos]; }
  else if (e.key === "ArrowDown") {
    e.preventDefault();
    if (histPos < history.length - 1) input.value = history[++histPos];
    else { histPos = history.length; input.value = ""; }
  }
  else if (e.key === "l" && e.ctrlKey) { e.preventDefault(); COMMANDS.clear.run(); }
});
document.querySelectorAll(".quick button").forEach(b =>
  b.addEventListener("click", () => { if (form.hidden) finishBoot(); run(b.dataset.cmd); }));

// Cliquer dans le terminal remet le focus sur la saisie (sauf sélection de texte ou lien),
// uniquement avec une souris pour ne pas ouvrir le clavier sur mobile.
const finePointer = matchMedia("(pointer: fine)").matches;
term.addEventListener("click", (e) => {
  if (!finePointer || e.target.closest("a, button") || String(getSelection())) return;
  input.focus();
});

/* ---------- démarrage ---------- */
let skip = false;
const sleep = (ms) => new Promise(r => setTimeout(r, skip ? 0 : ms));

async function typeInto(node, text, speed) {
  if (skip || reduced) { node.textContent = text; return; }
  for (let i = 1; i <= text.length; i++) {
    if (skip) { node.textContent = text; return; }
    node.textContent = text.slice(0, i);
    scroll();
    await new Promise(r => setTimeout(r, speed));
  }
}

function finishBoot() { skip = true; }

async function boot() {
  $("#promptLabel").replaceChildren(promptNode());
  $("#statusLeft").textContent = `[${CONFIG.host}] 0:sh*`;
  document.title = `~/ ${CONFIG.host}`;

  let saved = null;
  try { saved = localStorage.getItem("term-theme"); } catch (e) {}
  setTheme(THEMES.includes(saved) ? saved : CONFIG.defaultTheme, false);

  let seen = false;
  try { seen = sessionStorage.getItem("term-seen") === "1"; sessionStorage.setItem("term-seen", "1"); } catch (e) {}
  if (seen) skip = true;

  const stop = () => finishBoot();
  addEventListener("keydown", stop, { once: true });
  term.addEventListener("pointerdown", stop, { once: true });

  const intro = [
    [`Connexion à ${CONFIG.host} établie.`, "dim"],
    [`Bienvenue. Ici, ${CONFIG.projects.length} projets t'attendent.`, ""],
    ["Clique sur un nom pour l'ouvrir, ou tape help pour jouer avec le terminal.", "dim"],
    ["", ""]
  ];
  for (const [text, cls] of intro) {
    const n = el("div", { class: ("line " + cls).trim() });
    out.append(n);
    await typeInto(n, text, 16);
    await sleep(120);
  }

  // tape "ls -l" tout seul pour montrer les projets
  const cmdSpan = el("span", { class: "hi" });
  printNode(el("div", { class: "line" }, promptNode(), " ", cmdSpan));
  await sleep(250);
  await typeInto(cmdSpan, "ls -l", 70);
  await sleep(180);
  history.push("ls -l"); histPos = history.length;
  COMMANDS.ls.run(["-l"]);

  form.hidden = false;
  scroll();
  if (finePointer) input.focus({ preventScroll: true });
}

/* horloge de la barre d'état */
function tick() {
  $("#clock").textContent = new Date().toLocaleString("fr-FR", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short" });
}
tick(); setInterval(tick, 30000);

boot();
