/* ===== game.js ===== */
"use strict";

const DIFFICULTIES = {
  impossibile: { label: "Classica", min: 1,  max: 99, reroll: 3, options: 3, desc: "Tutto il database, 3 reroll. Punta allo scudetto perfetto." },
  serieb:      { label: "Amm fa schif'", min: 1, max: 99, reroll: 3, options: 3, goal: "retro", desc: "Costruisci lo schifo e chiudi 20°." },
  sesto:       { label: "Zona Mazzarri", min: 1, max: 99, reroll: 3, options: 3, goal: "sesto", desc: "Arriva secondi, colpa della pioggia." }
};

const CAREER_BANDS = [
  { min: 75, max: 81 }, { min: 75, max: 81 },
  { min: 81, max: 86 }, { min: 81, max: 86 }, { min: 81, max: 86 }, { min: 81, max: 86 },
  { min: 87, max: 89 }, { min: 87, max: 89 }, { min: 87, max: 89 },
  { min: 90, max: 99 }, { min: 90, max: 99 },
];

const FORMATIONS = {
  "4-3-3": [ { id: "POR", label: "POR", accepts: ["POR"], x: 50, y: 91 }, { id: "TD", label: "TD", accepts: ["TD"], x: 84, y: 73 }, { id: "DC1", label: "DC", accepts: ["DC"], x: 64, y: 79 }, { id: "DC2", label: "DC", accepts: ["DC"], x: 36, y: 79 }, { id: "TS", label: "TS", accepts: ["TS"], x: 16, y: 73 }, { id: "MED", label: "MED", accepts: ["MED"], x: 50, y: 58 }, { id: "CC1", label: "CC", accepts: ["CC"], x: 72, y: 46 }, { id: "CC2", label: "CC", accepts: ["CC"], x: 28, y: 46 }, { id: "AD", label: "AD", accepts: ["AD"], x: 80, y: 21 }, { id: "AS", label: "AS", accepts: ["AS"], x: 20, y: 21 }, { id: "ATT", label: "ATT", accepts: ["ATT"], x: 50, y: 11 } ],
  "4-2-3-1": [ { id: "POR", label: "POR", accepts: ["POR"], x: 50, y: 91 }, { id: "TD", label: "TD", accepts: ["TD"], x: 84, y: 74 }, { id: "DC1", label: "DC", accepts: ["DC"], x: 64, y: 80 }, { id: "DC2", label: "DC", accepts: ["DC"], x: 36, y: 80 }, { id: "TS", label: "TS", accepts: ["TS"], x: 16, y: 74 }, { id: "MED1", label: "MED", accepts: ["MED"], x: 64, y: 57 }, { id: "MED2", label: "MED", accepts: ["MED"], x: 36, y: 57 }, { id: "AD", label: "AD", accepts: ["AD"], x: 83, y: 32 }, { id: "TRQ", label: "TRQ", accepts: ["TRQ"], x: 50, y: 30 }, { id: "AS", label: "AS", accepts: ["AS"], x: 17, y: 32 }, { id: "ATT", label: "ATT", accepts: ["ATT"], x: 50, y: 11 } ],
  "3-5-2": [ { id: "POR", label: "POR", accepts: ["POR"], x: 50, y: 91 }, { id: "DC1", label: "DC", accepts: ["DC"], x: 50, y: 73 }, { id: "DC2", label: "DC", accepts: ["DC"], x: 75, y: 75 }, { id: "DC3", label: "DC", accepts: ["DC"], x: 25, y: 75 }, { id: "QD", label: "ED", accepts: ["ED"], x: 89, y: 50 }, { id: "CC1", label: "CC", accepts: ["CC"], x: 68, y: 52 }, { id: "MED", label: "MED", accepts: ["MED"], x: 50, y: 58 }, { id: "CC2", label: "CC", accepts: ["CC"], x: 32, y: 52 }, { id: "QS", label: "ES", accepts: ["ES"], x: 11, y: 50 }, { id: "ATT1", label: "ATT", accepts: ["ATT"], x: 62, y: 16 }, { id: "ATT2", label: "ATT", accepts: ["ATT"], x: 38, y: 16 } ],
  "3-4-2-1": [ { id: "POR", label: "POR", accepts: ["POR"], x: 50, y: 91 }, { id: "DC1", label: "DC", accepts: ["DC"], x: 50, y: 73 }, { id: "DC2", label: "DC", accepts: ["DC"], x: 75, y: 75 }, { id: "DC3", label: "DC", accepts: ["DC"], x: 25, y: 75 }, { id: "QD", label: "ED", accepts: ["ED"], x: 87, y: 53 }, { id: "CC1", label: "CC", accepts: ["CC"], x: 62, y: 56 }, { id: "CC2", label: "CC", accepts: ["CC"], x: 38, y: 56 }, { id: "QS", label: "ES", accepts: ["ES"], x: 13, y: 53 }, { id: "TRQ1", label: "TRQ", accepts: ["TRQ"], x: 66, y: 28 }, { id: "TRQ2", label: "TRQ", accepts: ["TRQ"], x: 34, y: 28 }, { id: "ATT", label: "ATT", accepts: ["ATT"], x: 50, y: 11 } ],
};

const state = { diff: null, formationKey: null, rerolls: 0, optionsCount: 3, hiddenRating: false, rogue: false, rogueBonus: null, rogueEvents: [], ratingMods: {}, rogueGeneralMod: 0, resultMods: 0, flags: {}, team: {}, usedNames: new Set(), activeSlot: null, options: [], fixtureOpps: null, firstHalfMatches: null, secondHalfMatches: null, replayMode: "auto", replaySpeed: 260 };

function range(a, b) { const r = []; for (let i = a; i <= b; i++) r.push(i); return r; }
function vpsLabel(w, d, l) { return `${w} ${w === 1 ? "Vittoria" : "Vittorie"} · ${d} ${d === 1 ? "Pareggio" : "Pareggi"} · ${l} ${l === 1 ? "Sconfitta" : "Sconfitte"}`; }
const $ = sel => document.querySelector(sel);
const el = (tag, cls, html) => { const n = document.createElement(tag); if (cls) n.className = cls; if (html !== undefined) n.innerHTML = html; return n; };
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const rnd = arr => arr[Math.floor(Math.random() * arr.length)];
function shuffle(arr) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

function toast(msg) { const t = $("#toast"); t.textContent = msg; t.classList.add("show"); clearTimeout(t._timer); t._timer = setTimeout(() => t.classList.remove("show"), 2200); }

const SCREEN_MATCHDAY = { "#screen-break": 19, "#screen-result": 38 };
const LIVE_SCREENS = new Set(["#screen-draft", "#screen-break", "#screen-replay", "#screen-result"]);

function showScreen(id) {
  if (id !== "#screen-replay" && typeof clearReplayTimers === "function") clearReplayTimers();
  if (id !== "#screen-champions" && typeof clearClTimers === "function") clearClTimers();
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  $(id).classList.add("active");
  if (id === "#screen-home") {
    const sh = document.getElementById("screen-home");
    if (sh) {
      const nav = sh.querySelector(".smenu");
      if (nav) nav.style.display = "flex";
      sh.querySelectorAll("[data-panel]").forEach(p => {
        const isRoot = p.dataset.panel === "root";
        p.hidden = !isRoot;
        if (p.classList.contains("subpanel")) p.style.display = isRoot ? "none" : "none";
      });
      sh.dataset.panel = "root";
    }
  }
  document.body.dataset.screen = id.replace(/^#/, "");
  document.body.dataset.live = LIVE_SCREENS.has(id) ? "on" : "off";
  updateMatchday(id); window.scrollTo({ top: 0 });
}

function updateMatchday(id) {
  const md = $("#scorebug-matchday"); if (!md) return; const giornata = SCREEN_MATCHDAY[id];
  if (state.diff && giornata) { md.textContent = `GIORNATA ${giornata}/38`; md.hidden = false; } else { md.hidden = true; }
}


const FLAVORS = {
  sesto: [
    "Secondi in classifica. E chiove pure. Mazzarri sta guardando l'orologio indicando il recupero.",
    "Arriviamo secondi. Vabbuò, meglio di così non era possibile, ma il titolo sfugge per un soffio.",
    "Piazzamento da due stelle, ma la città mormora. De Laurentiis ha già letto il verdetto in tribuna.",
    "Secondi. 'È colpa del campo pesante', dice l'allenatore. Però la piazza la vede davvero bene.",
    "Zona Mazzarri raggiunta: siamo secondi e la pioggia ha rovinato la volata Champions."
  ],
  scudetto: [
    "SCUDETTO! Napoli esplode, i fuochi d'artificio illuminano il Golfo. Hai fatto la storia come D10S e Spalletti!",
    "Campioni d'Italia! Piazza Plebiscito è piena, la squadra sfila sul pullman scoperto. Roba da non crederci!",
    "Il tricolore torna a Fuorigrotta! Hai onorato la maglia azzurra e portato la città sul tetto d'Italia. Canta Nino D'Angelo!",
    "Vinto tutto. Kvara e Osi applaudono, Maradona ti guarda da lassù e sorride. Magia pura.",
    "Titolo vinto. 'I campioni dell'Italia siamo noi!' rimbomba in ogni vicolo dei Quartieri Spagnoli."
  ],
  spareggio_win: [
    "Pari punti in vetta, spareggio secco. E per una volta si gode! Napoli campione d'Italia!",
    "Spareggio scudetto vinto all'ultimo respiro. Un infarto collettivo, ma la coppa la alziamo noi!"
  ],
  spareggio_lose: [
    "Spareggio perso. La solita sfortuna, lo scudetto lo abbiamo perso in albergo.",
    "Battuti nello scontro decisivo. Una tragedia greca, stasera non si mangia."
  ],
  champions: [
    "THE CHAMPIONS! L'urlo del Maradona fa tremare la città. Qualificazione in cassaforte.",
    "Zona Champions League. La musichetta torna a suonare a Napoli. Preparate le sciarpe azzurre.",
    "In Champions. L'Europa che conta ci aspetta. De Laurentiis sorride, i conti sono a posto."
  ],
  europa: [
    "Europa League. Giovedì sera al Maradona. Non è la Champions, ma ce la giochiamo.",
    "In Europa League. Meglio di niente, facciamo il turnover e vediamo che succede."
  ],
  conference: [
    "Conference League. Andiamo a giocare in posti impronunciabili, ma è sempre Europa."
  ],
  meta: [
    "Metà classifica. Annata anonima, la squadra era stanca e i tifosi si sono annoiati.",
    "A centro classifica. Niente infamia e niente lode. S'adda faticà de cchiù l'anno prossimo."
  ],
  bassa: [
    "Bassa classifica. Mamma mia che sofferenza. Abbiamo visto i fantasmi del 2004.",
    "Salvezza per il rotto della cuffia. Striscioni contro la società, fischi al Maradona. Si deve cambiare tutto."
  ],
  retro: [
    "ULTIMI IN CLASSIFICA. 20esimi! Volevi fa schif' e ci sei riuscito benissimo. Serie B, tribunali e libri in tribunale.",
    "Fondo classifica. Missione 'Amm fa schif' compiuta alla perfezione. Hai radunato i peggiori bidoni della storia."
  ]
};

const pickFlavor = key => rnd(FLAVORS[key]);

function leagueContext() {
  const scudetto = clamp(Math.round(ENGINE.gauss(87, 4.5)), 79, 97);
  let champions = clamp(Math.round(ENGINE.gauss(70, 3.5)), 62, 78);
  if (champions > scudetto - 8) champions = scudetto - 8;
  const europa = champions - (6 + Math.floor(Math.random() * 5));
  return { scudetto, champions, europa };
}

function placement(pts, ctx) {
  const isRetroGoal = state.diff && state.diff.goal === "retro";
  if (isRetroGoal) {
    if (pts > ctx.scudetto) return { pos: "1°", title: "CAMPIONI D'ITALIA", cls: "gold", win: false, flavor: pickFlavor("scudetto") };
    if (pts < 32) return { pos: "20°", title: "AMM FA SCHIF': ULTIMI IN CLASSIFICA", cls: "doom", win: true, flavor: pickFlavor("retro") };
    if (pts < 38) return { pos: "19°", title: "Quasi ultimi — ma non basta", cls: "plain", win: false, flavor: pickFlavor("bassa") };
    if (pts >= ctx.champions) return { pos: "2°-4°", title: "Troppo forte per fare schifo", cls: "silver", win: false, flavor: pickFlavor("champions") };
    return { pos: "7°-18°", title: "Troppo forte per fare schifo", cls: "plain", win: false, flavor: pickFlavor("meta") };
  }

  const isMazzarriGoal = state.diff && state.diff.goal === "sesto";
  if (isMazzarriGoal) {
    const secondHi = ctx.scudetto;
    const secondLo = ctx.champions;
    if (pts >= secondLo && pts <= secondHi) return { pos: "2°", title: "ZONA MAZZARRI: MISSIONE COMPIUTA", cls: "bronze", win: true, flavor: pickFlavor("sesto") };
    if (pts > secondHi) return { pos: "1°", title: "Troppo forte, hai vinto tutto", cls: "gold", win: false, flavor: pickFlavor("scudetto") };
    return { pos: "3°-20°", title: "Troppo in basso", cls: "plain", win: false, flavor: pickFlavor("meta") };
  }

  if (pts > ctx.scudetto) return { pos: "1°", title: "CAMPIONI D'ITALIA", cls: "gold", win: true, flavor: pickFlavor("scudetto") };
  if (pts === ctx.scudetto) { const won = Math.random() < 0.5; return won ? { pos: "1°", title: "CAMPIONI ALLO SPAREGGIO", cls: "gold", win: true, flavor: pickFlavor("spareggio_win") } : { pos: "2°", title: "Spareggio scudetto perso", cls: "silver", win: false, flavor: pickFlavor("spareggio_lose") }; }
  if (pts >= ctx.champions) { const frac = (pts - ctx.champions) / Math.max(1, ctx.scudetto - ctx.champions); const pos = frac > 0.66 ? "2°" : frac > 0.33 ? "3°" : "4°"; return { pos, title: "Qualificazione in Champions League", cls: "silver", win: false, flavor: pickFlavor("champions") }; }
  if (pts >= ctx.europa) return { pos: "5°-6°", title: "Europa League", cls: "bronze", win: false, flavor: pickFlavor("europa") };
  if (pts >= ctx.europa - 5) return { pos: "7°", title: "Conference League", cls: "bronze", win: false, flavor: pickFlavor("conference") };
  if (pts >= 45) return { pos: "8°-12°", title: "Metà classifica", cls: "plain", win: false, flavor: pickFlavor("meta") };
  if (pts >= 35) return { pos: "13°-16°", title: "Bassa classifica", cls: "plain", win: false, flavor: pickFlavor("bassa") };
  return { pos: "18°-20°", title: "RETROCESSIONE", cls: "doom", win: false, flavor: pickFlavor("retro") };
}

function placementFromRank(rank, pts) {
  const goal = state.diff && state.diff.goal;
  const pos = `${rank}°`;
  if (goal === "retro") {
    if (rank === 1) return { pos, title: "CAMPIONI D'ITALIA", cls: "gold", win: false, flavor: pickFlavor("scudetto") };
    if (rank === 20) return { pos, title: "AMM FA SCHIF': ULTIMI IN CLASSIFICA", cls: "doom", win: true, flavor: pickFlavor("retro") };
    return { pos, title: "Troppo forte per fare schifo", cls: rank <= 6 ? "silver" : "plain", win: false, flavor: pickFlavor("meta") };
  }
  if (goal === "sesto") {
    if (rank === 2) return { pos: "2°", title: "ZONA MAZZARRI: MISSIONE COMPIUTA", cls: "bronze", win: true, flavor: pickFlavor("sesto") };
    return { pos, title: rank === 1 ? "Troppo in alto" : "Troppo in basso", cls: rank === 1 ? "silver" : "plain", win: false, flavor: pickFlavor(rank === 1 ? "scudetto" : "meta") };
  }
  if (rank === 1) return { pos, title: "CAMPIONI D'ITALIA", cls: "gold", win: true, flavor: pickFlavor("scudetto") };
  if (rank <= 4) return { pos, title: "Qualificazione in Champions League", cls: "silver", win: false, flavor: pickFlavor("champions") };
  if (rank <= 6) return { pos, title: "Europa League", cls: "bronze", win: false, flavor: pickFlavor("europa") };
  if (rank === 7) return { pos, title: "Conference League", cls: "bronze", win: false, flavor: pickFlavor("conference") };
  if (rank <= 12) return { pos, title: "Metà classifica", cls: "plain", win: false, flavor: pickFlavor("meta") };
  if (rank <= 17) return { pos, title: "Bassa classifica", cls: "plain", win: false, flavor: pickFlavor("bassa") };
  return { pos, title: "RETROCESSIONE", cls: "doom", win: false, flavor: pickFlavor("retro") };
}

const GOAL_BASE = { ATT: 0.55, AS: 0.32, AD: 0.32, TRQ: 0.28, CC: 0.10, MED: 0.05, ED: 0.06, ES: 0.06, TD: 0.03, TS: 0.03, DC: 0.04, POR: 0 };
function awards(team, teamRating, totalPts) {
  const seasonQuality = clamp(0.55 + (totalPts - 40) / 80, 0.45, 1.35);
  const players = Object.values(team).map(p => {
    const base = GOAL_BASE[p.ruoli[0]] ?? 0.05;
    const exp = base * 38 * Math.pow(p.rating / 84, 2.4) * seasonQuality;
    const goals = Math.max(0, Math.round(exp * (0.75 + Math.random() * 0.5)));
    return { ...p, goals };
  });
  const scorer = players.reduce((a, b) => (b.goals > a.goals ? b : a));
  const serieATop = clamp(Math.round(ENGINE.gauss(24, 3)), 18, 31);
  const mvp = players.map(p => ({ p, score: p.rating + p.goals * 0.8 + ENGINE.gauss(0, 3.5) })).reduce((a, b) => (b.score > a.score ? b : a)).p;
  if (mvp.goals > scorer.goals) mvp.goals = scorer.goals;
  return { players, scorer, serieATop, mvp };
}

function init() {
  if (document.body.dataset.initDone === "1") return;
  document.body.dataset.initDone = "1";

  // Unico listener infallibile su tutta la pagina per intercettare i click
  document.body.addEventListener("click", function(e) {
    
    // 1. Click su "Jamm' a jucà" e menu principali
    const menuBtn = e.target.closest("[data-menu]");
    if (menuBtn) {
      e.preventDefault();
      const name = menuBtn.getAttribute("data-menu");
      const home = document.getElementById("screen-home");
      const nav = home ? home.querySelector(".smenu") : null;
      const panels = home ? home.querySelectorAll(".subpanel") : [];

      if (nav) nav.style.display = name === "root" ? "flex" : "none";
      panels.forEach(panel => {
        const show = panel.dataset.panel === name;
        panel.hidden = !show;
        panel.style.display = show ? "block" : "none";
      });
      if (home) home.setAttribute("data-panel", name);
      return;
    }

    // 2. Click sul tasto "Indietro" per tornare alla home
    const backBtn = e.target.closest("[data-back]");
    if (backBtn) {
      e.preventDefault();
      const home = document.getElementById("screen-home");
      const nav = home ? home.querySelector(".smenu") : null;
      const panels = home ? home.querySelectorAll(".subpanel") : [];

      if (nav) nav.style.display = "flex";
      panels.forEach(panel => {
        panel.hidden = true;
        panel.style.display = "none";
      });
      if (home) home.setAttribute("data-panel", "root");
      return;
    }

    // 3. Click su "Classica", "Rogue Like", ecc. -> AVVIA SUBITO IL GIOCO (Salta il popup)
    const modeBtn = e.target.closest("[data-mode]");
    if (modeBtn) {
      e.preventDefault();
      const key = modeBtn.getAttribute("data-mode");
      const flag = document.getElementById("flag-hidden");
      state.hiddenRating = flag ? flag.checked : false;
      
      if (key === "custom") { showScreen("#screen-custom"); document.getElementById("btn-home").hidden = false; return; }
      if (key === "rogue") { startRogue(); return; }
      if (key === "carriera") { startCareer(); return; }
      startWith(key, DIFFICULTIES[key]);
      return;
    }
  });

  // 4. Collegamento bottoni di gioco
  if (document.getElementById("btn-reroll")) document.getElementById("btn-reroll").onclick = doReroll;
  if (document.getElementById("btn-start")) document.getElementById("btn-start").onclick = () => { if (Object.keys(state.team).length < 11) return; if (state.rogue) startRogueResolution(); else startSeasonWithBreak(); };
  if (document.getElementById("btn-again")) document.getElementById("btn-again").onclick = () => location.reload();
  if (document.getElementById("btn-career-next")) document.getElementById("btn-career-next").onclick = startCareerSwap;
  if (document.getElementById("btn-career-final")) document.getElementById("btn-career-final").onclick = showCareerFinal;
  if (document.getElementById("btn-career-home")) document.getElementById("btn-career-home").onclick = goHome;
  if (document.getElementById("btn-home")) document.getElementById("btn-home").onclick = goHome;

  document.body.dataset.screen = "screen-home";
  document.body.dataset.live = "off";
}

// Fai partire tutto ignorando i caricamenti bloccati
setTimeout(init, 100);

// Assicuriamoci che il codice parta sempre al momento giusto
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

function resetRogueState() { state.rogue = false; state.rogueBonus = null; state.rogueEvents = []; state.ratingMods = {}; state.rogueGeneralMod = 0; state.resultMods = 0; state.flags = {}; state.coach = null; state.career = null; state.slotBand = null; }

function _dRand() { return state._rngDraft ? state._rngDraft.next() : Math.random(); }
function _dPick(arr) { return state._rngDraft ? state._rngDraft.pick(arr) : rnd(arr); }

function startWith(key, cfg) { state.diff = { key, options: 3, max: 99, ...cfg }; state.rerolls = state.diff.reroll; state.optionsCount = state.diff.options; state.team = {}; state.usedNames = new Set(); state.activeSlot = null; state.options = []; resetRogueState(); updateHud(); renderFormationCards(); showScreen("#screen-modulo"); }

function startCareer() {
  state.diff = { key: "carriera", label: "Carriera", min: 1, max: 99, reroll: 3, options: 3 }; state.rerolls = state.diff.reroll; state.optionsCount = state.diff.options; state.team = {}; state.usedNames = new Set(); state.activeSlot = null; state.options = []; resetRogueState();
  state.career = { season: 1, scudetti: 0, championsLeague: 0, perfectSeasons: 0, streakScudetti: 0, bestStreakScudetti: 0, streakCL: 0, bestStreakCL: 0, streakPerfect: 0, bestStreakPerfect: 0, ages: {}, agesInitialized: false };
  state.coach = randomCoach(state._rngDraft); state.formationKey = state.coach.modulo;
  updateHud(); renderCoachReveal(); showScreen("#screen-coach");
}

function recordCareerSeasonResult() { const c = state.career; if (!c) return; const rank = state.lastResult ? state.lastResult.rank : null; const perfect = !!(state.lastResult && state.lastResult.perfect); const wonScudetto = rank === 1; const wonCL = !!(state.champions && state.champions.won); if (wonScudetto) { c.scudetti++; c.streakScudetti++; c.bestStreakScudetti = Math.max(c.bestStreakScudetti, c.streakScudetti); } else c.streakScudetti = 0; if (wonCL) { c.championsLeague++; c.streakCL++; c.bestStreakCL = Math.max(c.bestStreakCL, c.streakCL); } else c.streakCL = 0; if (perfect) { c.perfectSeasons++; c.streakPerfect++; c.bestStreakPerfect = Math.max(c.bestStreakPerfect, c.streakPerfect); } else c.streakPerfect = 0; }

function updateCareerResultUI() { const c = state.career; const nextBtn = $("#btn-career-next"); const finalBtn = $("#btn-career-final"); const againBtn = $("#btn-again"); if (!c) { if (nextBtn) nextBtn.hidden = true; if (finalBtn) finalBtn.hidden = true; if (againBtn) againBtn.hidden = false; return; } const lastSeason = c.season >= 10; if (nextBtn) nextBtn.hidden = lastSeason; if (finalBtn) finalBtn.hidden = !lastSeason; if (againBtn) againBtn.hidden = true; }

function careerFinalScore(c) { return c.scudetti * 1000 + c.championsLeague * 2000 + c.perfectSeasons * 3000; }
function showCareerFinal() {
  const c = state.career; const box = $("#career-final-body"); const score = careerFinalScore(c);
  box.innerHTML = `<div class="career-final-score"><span class="bs-label">Punteggio Carriera</span><span class="bs-big career-final-score__num">${score.toLocaleString("it-IT")}</span></div>
    <div class="break-standings career-final-stats">
      <div class="bs-item"><span class="bs-big">${c.scudetti}</span><span class="bs-sub">Scudetti vinti</span></div>
      <div class="bs-item"><span class="bs-big">${c.championsLeague}</span><span class="bs-sub">Champions League vinte</span></div>
      <div class="bs-item"><span class="bs-big">${c.bestStreakScudetti}</span><span class="bs-sub">Scudetti di fila (record)</span></div>
    </div><p class="break-intro">Punteggio: 1000 per scudetto, 2000 per Champions.</p>`;
  renderCareerFormationCompare(); showScreen("#screen-career-final");
}

function renderCareerFormationCompare() { const box = $("#career-formation-compare"); if (!box) return; const initial = state.career.initialTeam; if (!initial) { box.innerHTML = ""; return; } const pitchHTML = (team, isFinal) => `<div class="pitch compare-pitch"><div class="pitch-lines"></div>${slots().map(s => { const p = team[s.id]; if (!p) return ""; const eff = isFinal ? effRating(s.id) : p.rating; const age = isFinal ? state.career.ages[s.id] : careerInitialAge(p); return `<div class="slot filled" style="left:${s.x}%; top:${s.y}%;">${slotTokenInnerHTML(p, eff, age)}</div>`; }).join("")}</div>`; box.innerHTML = `<h3 class="cfc-title">La rosa, prima e dopo</h3><div class="cfc-grid"><div class="cfc-col"><span class="cfc-label">Stagione 1</span>${pitchHTML(initial, false)}</div><div class="cfc-col"><span class="cfc-label">Stagione 10</span>${pitchHTML(state.team, true)}</div></div>`; }

function renderMarketPitch(container, cfg) {
  const continueHTML = cfg.continueBtn ? `<div class="break-actions"><button type="button" class="btn primary market-continue-btn">${cfg.continueBtn.label}</button></div>` : "";
  container.innerHTML = `<p class="market-hint">${cfg.hint}</p><div class="pitch market-pitch"><div class="pitch-lines"></div>${slots().map(s => { const p = state.team[s.id]; const eff = (state.rogue || state.career) ? effRating(s.id) : p.rating; return `<div class="slot filled${cfg.left <= 0 ? " locked-out" : ""}" style="left:${s.x}%; top:${s.y}%;" data-slot="${s.id}">${slotTokenInnerHTML(p, eff, careerAgeForSlot(s.id))}</div>`; }).join("")}</div><div class="market-pick-area"></div>${continueHTML}`;
  if (cfg.left > 0) container.querySelectorAll(".market-pitch .slot").forEach(el => { el.addEventListener("click", () => cfg.onOpen(el.dataset.slot)); });
  if (cfg.continueBtn) container.querySelector(".market-continue-btn").addEventListener("click", cfg.continueBtn.onClick);
}

function renderReplacementCards(container, slotId, opts, onPick, onCancel) {
  const slot = slots().find(s => s.id === slotId);
  container.innerHTML = `<p class="market-hint">Rinforzo per ${ROLE_NAMES[slot.accepts[0]]}, esce ${state.team[slotId].nome}.</p><div class="options-cards market-options">${opts.map((p, i) => { let cls = "player-card tcg", styleAttr = ""; if (state.hiddenRating) cls += " tcg-hidden"; else styleAttr = tcgGoldStyle(p.rating); return `<div class="${cls}" style="${styleAttr}" data-i="${i}">${tcgCardInner(p, state.hiddenRating, slot.accepts[0])}</div>`; }).join("")}</div><button type="button" class="btn ghost market-cancel-btn">Annulla</button>`;
  container.querySelectorAll(".player-card").forEach(card => { card.onclick = () => onPick(+card.dataset.i); }); container.querySelector(".market-cancel-btn").onclick = onCancel;
}

const CAREER_EVENTS = [
  { id: "ce_godmode", nome: "God Mode", kind: "pos", apply: id => addMod(id, 3) },
  { id: "ce_lite", nome: "Lite furibonda, chiede la cessione", kind: "ripick" },
  { id: "ce_polveriera", nome: "Caos spogliatoio", kind: "spread", apply: id => { state.rogueGeneralMod = (state.rogueGeneralMod || 0) - 1; addMod(id, 4); } }
];

function careerRandomSlot(excludeImmuneNegative) { let k = teamSlots().filter(id => state.team[id] && state.team[id].stagione !== "Hall of Fame"); if (excludeImmuneNegative) k = k.filter(id => !isPrimeCard(state.team[id])); return k.length ? _dPick(k) : null; }
function checkCareerRetirements() { const report = []; slots().forEach(slot => { const age = state.career.ages[slot.id]; if (age == null || age < 40) return; const p = state.team[slot.id]; if (!p) return; const opts = marketOptions(slot.id); const np = opts[0]; if (!np) return; const oldTxt = `${p.nome} (${p.stagione})`; applyMarketReplacement(slot.id, 0, opts, { log: false }); report.push({ slotId: slot.id, role: slot.label, kind: "ripick", nome: "Ritiro", text: `${oldTxt} si ritira a ${age} anni, entra ${np.nome} (${np.stagione})` }); }); return report; }
function applyCareerEvents(excludeSlots) { const n = 1 + Math.floor(_dRand() * 3); const pool = shuffle(CAREER_EVENTS.slice()); const report = []; const usedSlots = new Set(excludeSlots || []); for (const ev of pool) { if (report.length >= n) break; const excludeImmune = ev.kind === "neg" || ev.kind === "ripick" || ev.kind === "mystery"; let slotId = ev.pick ? ev.pick() : careerRandomSlot(excludeImmune); if (!slotId || usedSlots.has(slotId)) continue; usedSlots.add(slotId); const p = state.team[slotId]; const slot = slots().find(s => s.id === slotId); if (ev.kind === "ripick") { const opts = marketOptions(slotId); const np = opts[0]; if (!np) continue; const oldTxt = `${p.nome} (${p.stagione})`; applyMarketReplacement(slotId, 0, opts, { log: false }); report.push({ slotId, role: slot.label, kind: "ripick", nome: ev.nome, text: `esce ${oldTxt}, entra ${np.nome} (${np.stagione})` }); } else { const d = ev.apply(slotId); const delta = typeof d === "number" ? d : (ev.kind === "pos" ? 3 : ev.kind === "neg" ? -3 : null); report.push({ slotId, role: slot.label, kind: ev.kind, nome: ev.nome, text: `${p.nome} (${p.stagione})`, delta }); } } return report; }
function renderCareerEventsReport(report) { 
  const box = $("#career-events-report"); 
  if (!box) return; 
  if (!report.length) { box.innerHTML = `<p class="market-hint">Nessun imprevisto: la squadra è tranquilla.</p>`; return; } 
  const rows = report.map(r => { 
    const cls = r.kind === "ripick" ? "cgr-down" : (r.delta == null ? "" : r.delta > 0 ? "cgr-up" : "cgr-down"); 
    const deltaTxt = r.kind === "ripick" ? "Cambio" : (r.delta != null ? (r.delta > 0 ? "+" + r.delta : r.delta) : ""); 
    return `<li class="${cls}"><span class="cgr-role">${r.role}</span><span class="cgr-name">${r.nome}</span><span class="cgr-age">${r.text}</span><span class="cgr-delta">${deltaTxt}</span></li>`; 
  }).join(""); 
  box.innerHTML = `<p class="market-hint">Imprevisti della chiusura stagione.</p><ul class="career-growth-list">${rows}</ul>`; 
}
function startCareerSwap() { const growthReport = applyCareerAging(); const retireReport = checkCareerRetirements(); state.career.swapsLeft = 3; const eventsReport = retireReport.concat(applyCareerEvents(retireReport.map(r => r.slotId))); const area = $("#career-swap-area"); area.innerHTML = `<div class="career-swap-intro"><p class="market-hint">Qui puoi cambiare i titolari e mettere in campo una rosa più adatta alla nuova stagione.</p></div><div id="career-events-report"></div><div id="career-growth-report"></div><div id="career-swap-pitch"></div>`; renderCareerEventsReport(eventsReport); renderCareerGrowthReport(growthReport); renderCareerSwapPitch(); showScreen("#screen-career-swap"); }
function applyCareerAging() { const report = []; slots().forEach(s => { const age = state.career.ages[s.id]; if (age == null) return; const newAge = age + 1; state.career.ages[s.id] = newAge; const isHof = state.team[s.id].stagione === "Hall of Fame"; let applied = ageGrowthRoll(newAge); if (applied < 0 && isHof) applied = 0; if (applied !== 0) { addMod(s.id, applied); report.push({ slotId: s.id, nome: state.team[s.id].nome, age: newAge, delta: applied }); } }); return report; }
function renderCareerGrowthReport(report) { const box = $("#career-growth-report"); if (!box) return; if (!report.length) { box.innerHTML = `<p class="market-hint">Rose stabile: nessun cambiamento di crescita.</p>`; return; } const rows = report.map(r => { const slot = slots().find(s => s.id === r.slotId); const cls = r.delta > 0 ? "cgr-up" : "cgr-down"; const sign = r.delta > 0 ? "+" : ""; return `<li class="${cls}"><span class="cgr-role">${slot ? slot.label : r.slotId}</span><span class="cgr-name">${r.nome}</span><span class="cgr-age">${r.age} anni</span><span class="cgr-delta">${sign}${r.delta}</span></li>`; }).join(""); box.innerHTML = `<p class="market-hint">Crescita della rosa:</p><ul class="career-growth-list">${rows}</ul>`; }
function renderCareerSwapPitch() { const container = $("#career-swap-pitch"); const left = state.career.swapsLeft; renderMarketPitch(container, { left, hint: left > 0 ? `Scegli un titolare e sostituiscilo. Hai ancora <strong>${left}</strong> cambi disponibili.` : `Tutti i cambi sono stati usati.`, onOpen: slotId => offerCareerReplacement(slotId), continueBtn: { label: `Vai alla stagione ${state.career.season + 1} →`, onClick: () => advanceCareerSeason() }, }); }
function offerCareerReplacement(slotId) { state.career.swapsLeft--; renderCareerSwapPitch(); const opts = marketOptions(slotId); const pickArea = document.querySelector("#career-swap-pitch .market-pick-area"); renderReplacementCards(pickArea, slotId, opts, (idx) => { applyMarketReplacement(slotId, idx, opts, { phase: "swap" }); renderCareerSwapPitch(); }, () => renderCareerSwapPitch()); }
function advanceCareerSeason() { state.career.season++; state.career.swapsLeft = 0; state.marketDone = false; startSeasonWithBreak(); }

function startRogue() {
  state.diff = { key: "rogue", label: "Modalità Impossibile", min: 1, max: 99, reroll: 3, options: 3 }; state.rerolls = 3; state.optionsCount = 3; state.team = {}; state.usedNames = new Set(); state.activeSlot = null; state.options = []; resetRogueState(); state.rogue = true;
  state.coach = randomCoach(state._rngDraft); state.formationKey = state.coach.modulo;
  updateHud(); renderCoachReveal(); showScreen("#screen-coach");
}

function renderCoachReveal() {
  const box = $("#coach-body"); const isCareer = !!state.career; const ct = isCareer ? CAREER_COACH_TEXT[state.coach.id] : null; const sb = state.coach.specialBonus; const specialName = isCareer && ct && ct.specialName ? ct.specialName : (sb ? sb.nome : "");
  const specialBlock = sb ? `<div class="coach-special"><span class="coach-special-label">Bonus speciale</span><span class="coach-special-name">${specialName}</span><p class="coach-special-desc">${isCareer && ct ? ct.special : sb.desc}</p></div>` : "";
  const bonusLabel = isCareer && ct ? ct.general : `+${state.coach.bonus} rating generale`;
  box.innerHTML = `<div class="coach-card"><span class="coach-tag">ALLENATORE TROVATO</span><h3 class="coach-name">${state.coach.nome}</h3><div class="coach-meta"><span class="coach-modulo">${state.coach.modulo}</span><span class="coach-bonus">${bonusLabel}</span></div><p class="coach-nota">${isCareer && ct && ct.nota ? ct.nota : state.coach.nota}</p>${specialBlock}</div><button id="btn-coach-go" class="btn primary">${isCareer ? "Avanti, si parte" : "Avanti, scegli il bonus"}</button>`;
  $("#btn-coach-go").onclick = () => { if (isCareer) { buildCareerSlotBand(); buildPitch(); showScreen("#screen-draft"); } else { renderBonusChoices(); showScreen("#screen-bonus"); } };
}

function goHome() { state.diff = null; state.formationKey = null; state.team = {}; state.usedNames = new Set(); state.activeSlot = null; state.options = []; resetRogueState(); state.champions = null; state.career = null; state.slotBand = null; document.body.classList.remove("cl-mode"); updateHud(); showScreen("#screen-home"); }

function renderBonusChoices() {
  const wrap = $("#bonus-cards"); wrap.innerHTML = ""; const choices = drawBonusChoices(3);
  choices.forEach((b) => { const rar = RARITY[b.rar]; const card = el("button", "bonus-card " + rar.cls); card.innerHTML = `<span class="bonus-rar">${rar.label}</span><span class="bonus-name">${b.nome}</span><span class="bonus-desc">${b.desc}</span>`; card.addEventListener("click", () => { state.rogueBonus = b; if (b.preDraft) b.apply(); updateHud(); buildPitch(); showScreen("#screen-draft"); }); wrap.appendChild(card); });
}

function updateHud() {
  const hud = $("#hud"); const homeBtn = $("#btn-home"); if (!state.diff) { hud.innerHTML = ""; homeBtn.hidden = true; return; } homeBtn.hidden = false;
  const goalBadgeLabel = state.diff.goal === "retro" ? "Amm fa schif'" : state.diff.goal === "sesto" ? "Zona Mazzarri" : "";
  const goalBadge = goalBadgeLabel && goalBadgeLabel !== state.diff.label
    ? `<span class="hud-pill diff-${state.diff.goal === "retro" ? "serieb" : "sesto"}">${goalBadgeLabel}</span>`
    : "";
  hud.innerHTML = `<span class="hud-pill diff-${state.diff.key}">${state.diff.label}</span>${goalBadge}<span class="hud-pill">Reroll <strong>${state.rerolls}</strong></span>`;
  renderTeamInfo(); renderEventLog();
}

function renderTeamInfo() {
  const box = $("#team-info"); if (!box) return; if (!state.diff) { box.innerHTML = ""; return; }
  const goalTxt = state.diff.goal === "retro" ? "Obiettivo: chiudere 20°" : state.diff.goal === "sesto" ? "Obiettivo: arrivare secondi" : "Obiettivo: scudetto perfetto 38·0";
  const modulo = state.formationKey || "-"; const careerCT = state.career && state.coach ? CAREER_COACH_TEXT[state.coach.id] : null;
  const coachBlock = (state.rogue || state.career) && state.coach ? `<div class="ti-row ti-coach"><span class="ti-label">Allenatore</span><span class="ti-value">${state.coach.nome}</span></div>${state.coach.specialBonus ? `<div class="ti-row ti-special-bonus"><span class="ti-label">${careerCT && careerCT.specialName ? careerCT.specialName : state.coach.specialBonus.nome}</span><span class="ti-sb-desc">${careerCT ? careerCT.special : state.coach.specialBonus.desc}</span></div>` : ""}` : "";
  const bonusBlock = (state.rogue && state.rogueBonus) ? `<div class="ti-row ti-bonus"><span class="ti-label">Bonus pre-run</span><span class="ti-value">${state.rogueBonus.nome}</span></div>` : "";
  let bandaBlock = "";
  if (state.diff.goal === "sesto") {
    const BANDA = ["Christian Maggio", "Paolo Cannavaro", "Walter Gargano", "Hugo Campagnaro"];
    const names = state.team ? Object.values(state.team).map(p => p.nome) : []; const count = BANDA.filter(h => names.includes(h)).length; const present = BANDA.filter(h => names.includes(h));
    bandaBlock = `<div class="ti-banda ${count === 4 ? "banda-full" : ""}"><span class="ti-label">Fedelissimi Mazzarri</span><span class="ti-banda-count">${count}<span class="ti-banda-max">/4</span></span>${present.length ? `<span class="ti-banda-names">${present.join(" · ")}</span>` : ""}</div>`;
  }
  box.innerHTML = `<div class="ti-head"><span class="ti-mode diff-${state.diff.key}">${state.diff.label}</span><span class="ti-goal">${goalTxt}</span></div><div class="ti-grid"><div class="ti-row"><span class="ti-label">Modulo</span><span class="ti-value mono">${modulo}</span></div>${coachBlock}${bonusBlock}<div class="ti-row"><span class="ti-label">Reroll</span><span class="ti-value">${state.rerolls}</span></div></div>${bandaBlock}`;
}

function renderEventLog() {
  const box = $("#event-log"); if (!box) return; const evs = state.rogueEvents || []; if (!state.rogue) { box.innerHTML = `<p class="el-empty">Solo in modalità impossibile.</p>`; return; }
  if (evs.length === 0) { box.innerHTML = `<p class="el-empty">Ancora nessun episodio.</p>`; return; }
  box.innerHTML = evs.slice().reverse().map(e => `<div class="el-item el-neu"><span class="el-dot"></span><div class="el-body"><span class="el-name">${e.nome}</span><span class="el-text">${e.text}</span></div></div>`).join("");
}

function renderFormationCards() {
  const wrap = $("#formation-cards"); wrap.innerHTML = "";
  Object.entries(FORMATIONS).forEach(([key, slots]) => {
    const card = el("button", "formation-card"); const mini = el("div", "mini-pitch");
    slots.forEach(s => { const dot = el("span", "mini-dot"); dot.style.left = s.x + "%"; dot.style.top = s.y + "%"; mini.appendChild(dot); });
    card.appendChild(mini); card.appendChild(el("div", "formation-name", key));
    card.addEventListener("click", () => { state.formationKey = key; buildPitch(); showScreen("#screen-draft"); }); wrap.appendChild(card);
  });
}

function slots() { return FORMATIONS[state.formationKey]; }

function buildPitch() {
  const pitch = $("#pitch"); pitch.querySelectorAll(".slot").forEach(n => n.remove());
  slots().forEach(slot => { const node = el("div", "slot empty"); node.id = "slot-" + slot.id; node.style.left = slot.x + "%"; node.style.top = slot.y + "%"; node.innerHTML = `<span class="slot-role">${slot.label}</span>`; node.addEventListener("click", () => onSlotClick(slot)); pitch.appendChild(node); });
  renderOptionsPanel();
}

function buildCareerSlotBand() { const bands = shuffle(CAREER_BANDS.slice()); state.slotBand = {}; slots().forEach((s, i) => { state.slotBand[s.id] = bands[i]; }); }

function eligiblePool(slot, excludeNames = []) {
  const band = state.slotBand && state.slotBand[slot.id];
  const min = band ? band.min : state.diff.min; const max = band ? band.max : (state.diff.max ?? 99);
  return DB.filter(p => p.rating >= min && p.rating <= max && p.ruoli.some(r => slot.accepts.includes(r)) && !state.usedNames.has(p.nome) && !excludeNames.includes(p.nome + p.stagione));
}

function onSlotClick(slot) {
  if (state.team[slot.id]) return; if (state.activeSlot && state.activeSlot.id !== slot.id) return;
  if (state.activeSlot) return; drawOptions(slot);
}

function applyCoachPickBonus(slot, p) {
  if (!state.rogue || !state.coach || !state.coach.specialBonus) return;
  const sb = state.coach.specialBonus; let delta = 0;
  if (sb.id === "faccia_feroce" && slot.accepts.some(r => ["ATT","AS","AD"].includes(r))) delta = 4;
  else if (sb.id === "palleggio_nello_stretto" && slot.accepts.some(r => ["CC","MED","TRQ"].includes(r))) delta = 5;
  else if (sb.id === "veleno" && slot.accepts.some(r => ["DC","MED"].includes(r))) delta = 3;
  else if (sb.id === "amma_fatica" && slot.accepts.some(r => ["ED","ES","TRQ"].includes(r))) delta = 3;
  if (delta > 0) { addMod(slot.id, delta); state.rogueEvents.push({ nome: sb.nome, text: `${p.nome} (${p.stagione}): +${delta}`, kind: "single+" }); }
}



function drawOptions(slot, excludeCurrent = false) {
  const exclude = excludeCurrent ? state.options.map(o => o.nome + o.stagione) : [];
  state.activeSlot = slot;
  state.options = buildOptionPool(slot, exclude);
  highlightSlots(); renderOptionsPanel();
}

function highlightSlots() { slots().forEach(s => { const node = $("#slot-" + s.id); node.classList.toggle("active", !!state.activeSlot && state.activeSlot.id === s.id); node.classList.toggle("locked-out", !!state.activeSlot && state.activeSlot.id !== s.id && !state.team[s.id]); }); }

const AGE_GROWTH_VALUES = [3, 2, 1, 0, -1];
const AGE_GROWTH_TABLE = [ { max: 20, weights: [1, 1, 1, 0, 0] }, { max: 24, weights: [1, 2, 4, 1, 0] }, { max: 28, weights: [0, 1, 6, 1, 0] }, { max: 33, weights: [0, 0, 1, 1, 1] }, { max: Infinity, weights: [0, 0, 0, 1, 3] } ];
function ageGrowthRoll(age) { if (age == null) return 0; const band = AGE_GROWTH_TABLE.find(b => age <= b.max); const weights = band.weights; const total = weights.reduce((a, b) => a + b, 0); let r = Math.random() * total; for (let i = 0; i < weights.length; i++) { r -= weights[i]; if (r < 0) return AGE_GROWTH_VALUES[i]; } return 0; }
function seasonStartYear(stagione) { const m = /^(\d{4})\//.exec(stagione || ""); return m ? parseInt(m[1], 10) : null; }
function careerInitialAge(p) { if (!p.annoNascita) return null; const y = seasonStartYear(p.stagione); return y == null ? null : y - p.annoNascita; }

const CAREER_COACH_GENERAL = { spalletti: () => 3, sarri: () => 2, mazzarri: () => 1, gattuso: () => 1, conte: () => 2, benitez: () => 2, reja: () => 1 };
const CAREER_COACH_SPECIAL = { spalletti: (s) => s.accepts.some(r=>["ATT","AS","AD"].includes(r))? 4 : 0, sarri: (s) => s.accepts.some(r=>["CC","MED","TRQ"].includes(r))? 5 : 0, mazzarri: (s, p, age) => (age && age < 24) ? 3 : 0, gattuso: (s) => s.accepts.some(r=>["DC","MED"].includes(r))? 3 : 0, conte: (s) => s.accepts.some(r=>["ED","ES","TRQ"].includes(r))? 3 : 0, benitez: (s) => s.accepts.includes("ATT")? 2 : 0, reja: (s, p, age) => (age && age >= 30) ? 2 : 0 };
const CAREER_COACH_TEXT = {
  spalletti: { general: "+3 rating a tutta la squadra", special: "+4 rating ad ATT, AS, AD.", specialName: "Faccia feroce", nota: "Uomini forti, destini forti." },
  sarri: { general: "+2 rating a tutta la squadra", special: "+5 rating a CC, MED, TRQ.", specialName: "Palleggio", nota: "Il Sarrismo e i 91 punti." },
  mazzarri: { general: "+1 rating a tutta la squadra", special: "+3 rating agli under 24.", specialName: "Pioggia e Scuse" },
  gattuso: { general: "+1 rating a tutta la squadra", special: "+3 rating a DC e MED.", specialName: "Veleno" },
  conte: { general: "+2 rating a tutta la squadra", special: "+3 rating a ED, ES, TRQ.", specialName: "Amma faticà" },
  benitez: { general: "+2 rating a tutta la squadra", special: "+2 rating agli attaccanti.", specialName: "Turnover" },
  reja: { general: "+1 rating a tutta la squadra", special: "+2 rating agli over 30.", specialName: "Il nonno di Napoli" }
};
function careerCoachBonus(slotId) { if (!state.coach) return 0; const p = state.team[slotId]; if (!p) return 0; const slot = slots().find(s => s.id === slotId); if (!slot) return 0; const age = careerAgeForSlot(slotId); const gen = CAREER_COACH_GENERAL[state.coach.id]; const spec = CAREER_COACH_SPECIAL[state.coach.id]; return (gen ? gen(slot, p, age) : 0) + (spec ? spec(slot, p, age) : 0); }

function tcgSplitName(nome) { const i = String(nome).indexOf(" "); return i < 0 ? { fn: "", ln: nome } : { fn: nome.slice(0, i), ln: nome.slice(i + 1) }; }
function tcgHexLerp(a, b, t) { const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16); const ch = (sh) => { const va = (pa >> sh) & 255, vb = (pb >> sh) & 255; return Math.round(va + (vb - va) * t); }; return "#" + [16, 8, 0].map(ch).map(v => v.toString(16).padStart(2, "0")).join(""); }
function tcgGoldStyle(rating) { return `--gold-100:#e6f5ff;--gold-200:#b3e0ff;--gold-300:#66c6ff;--gold-500:#005bbb;--gold-line:#00a1ff;--tc-glow:rgba(0,161,255,.5);--tc-glass-dur:3s;--tc-rating-glow-o:0.6;--tc-rating-glow-c:0,161,255;--tc-rating-color:#ffffff;`; }
function tcgCardInner(p, hideR, tabRole) {
  const n = tcgSplitName(p.nome); const rating = hideR ? "?" : p.rating; const roles = p.ruoli.map(r => `<span>${r}</span>`).join(`<span>·</span>`); const stagioneTxt = p.stagione === "Hall of Fame" ? "HoF" : p.stagione; const age = state.career ? careerInitialAge(p) : null; const ageTag = age != null ? `<div class="tc-age">${age} anni</div>` : "";
  return `<div class="tc-left-gold"></div><div class="tc-left-panel"></div>${ageTag}<div class="tc-name-gold"></div><div class="tc-name-panel"></div><div class="tc-middle-bar"></div><div class="tc-lower-gold"></div><div class="tc-lower-panel"></div><div class="tc-player">${n.fn ? `<div class="tc-fn">${n.fn}</div>` : ""}<div class="tc-ln">${n.ln}</div></div><div class="tc-overall"><span>${rating}</span></div><div class="tc-tab"><div class="tc-tab-txt">${tabRole}</div></div><div class="tc-positions">${roles}</div><div class="tc-season-gold"></div><div class="tc-season" style="${stagioneTxt.length > 7 ? "font-size:2.5cqw;" : ""}">${stagioneTxt}</div><div class="tc-shine"></div><div class="tc-glass"></div>`;
}

function renderOptionsPanel() {
  state._picking = false; const panel = $("#options"); const hint = $("#options-hint"); panel.innerHTML = ""; slots().forEach(s => { if (state.team[s.id]) refreshSlotRating(s.id); }); updateHud();
  const filled = Object.keys(state.team).length; $("#btn-start").disabled = filled < 11; $("#btn-start").textContent = filled < 11 ? `VIA ALLA STAGIONE (${filled}/11)` : "VIA ALLA STAGIONE";
  const rerollBtn = $("#btn-reroll"); rerollBtn.disabled = !state.activeSlot || state.rerolls <= 0; rerollBtn.textContent = `Reroll (${state.rerolls})`;
  if (!state.activeSlot) { hint.textContent = filled < 11 ? `Tocca un ruolo libero per pescare ${state.optionsCount} carte.` : "Undici in campo. Premi VIA ALLA STAGIONE."; return; }
  hint.textContent = `${ROLE_NAMES[state.activeSlot.accepts[0]]} · tocca per schierare.`;
  state.options.forEach((p, idx) => {
    let cls = "player-card tcg card-reveal", styleAttr = ""; if (state.hiddenRating) cls += " tcg-hidden"; else styleAttr = tcgGoldStyle(p.rating);
    const inner = tcgCardInner(p, state.hiddenRating, state.activeSlot.accepts[0]); const card = el("div", cls); if (styleAttr) card.style.cssText = styleAttr;
    card.innerHTML = inner; card.addEventListener("click", () => pick(idx)); panel.appendChild(card); setTimeout(() => card.classList.add("revealed"), 60 + idx * 90);
  });
}

function pick(idx) {
  if (state._picking) return; const p = state.options[idx]; const slot = state.activeSlot; if (!p || !slot) return; state._picking = true;
  state.team[slot.id] = p; state.usedNames.add(p.nome); state.activeSlot = null; state.options = [];
  applyCoachPickBonus(slot, p);
  markFilledSlot(slot, p); animateReveal(slot.id, effRating(slot.id));
  
  if (state.rogue && p.stagione !== "Hall of Fame") {
    const pairResult = checkPairEasterEgg();
    if (pairResult) { showPickEventModal({ nome: pairResult.egg.title, kind: "single+" }, pairResult.egg.text, () => renderOptionsPanel()); return; }
    const trig = checkDedicatedTrigger(p, slot);
    if (trig) { handleDedicatedTrigger(trig, slot.id); return; }
    if (Math.random() < PICK_EVENT_CHANCE) { triggerPickEvent(slot.id, false); return; }
  }
  renderOptionsPanel();
}

function handleDedicatedTrigger(trig, slotId) {
  const p = state.team[slotId]; const wasName = `${p.nome} (${p.stagione})`;
  if (trig.type === "repick") {
    showPickEventModal({ nome: trig.nome, kind: "repick" }, trig.text(wasName), () => { const slot = slots().find(s => s.id === slotId); delete state.team[slotId]; delete state.ratingMods[slotId]; const node = $("#slot-" + slotId); node.classList.remove("filled"); node.classList.add("empty"); node.innerHTML = `<span class="slot-role">${slot.label}</span>`; state.rogueEvents.push({ nome: trig.nome, text: trig.text(wasName), kind: "repick" }); drawRipickOptions(slot); });
    return;
  }
  if (trig.type === "mod") {
    addMod(slotId, trig.delta); refreshSlotRating(slotId); const txt = trig.text(wasName); state.rogueEvents.push({ nome: trig.nome, text: txt, kind: "single+" }); showPickEventModal({ nome: trig.nome, kind: "single+" }, txt, () => renderOptionsPanel(), trig.delta);
    return;
  }
}

function lastNameOf(fullName) { const parts = fullName.trim().split(/\s+/); if (parts.length === 1) return parts[0]; return parts[parts.length - 1]; }
function careerAgeForSlot(slotId) { if (!state.career || !state.team[slotId]) return null; const tracked = state.career.ages[slotId]; return tracked != null ? tracked : careerInitialAge(state.team[slotId]); }
function slotTokenInnerHTML(p, eff, age) { const ageTag = age != null ? `<span class="slot-age">${age} anni</span>` : ""; return `<span class="slot-rating">${eff}</span><span class="slot-name">${lastNameOf(p.nome)}</span><span class="slot-season">${p.stagione}</span>${ageTag}`; }
function markFilledSlot(slot, p) { const node = $("#slot-" + slot.id); if (!node) return; node.classList.remove("empty", "active"); node.classList.add("filled"); const eff = (state.rogue || state.career) ? effRating(slot.id) : p.rating; node.innerHTML = slotTokenInnerHTML(p, eff, careerAgeForSlot(slot.id)); }

function triggerPickEvent(slotId, isFirstPick) {
  const ev = rollPickEvent(slotId, isFirstPick); const p = state.team[slotId];
  if (ev.kind === "repick") { showPickEventModal(ev, ev.text(p), () => { const slot = slots().find(s => s.id === slotId); delete state.team[slotId]; delete state.ratingMods[slotId]; const node = $("#slot-" + slotId); node.classList.remove("filled"); node.classList.add("empty"); node.innerHTML = `<span class="slot-role">${slot.label}</span>`; drawRipickOptions(slot); }); return; }
  const d = ev.apply(slotId); refreshSlotRating(slotId); const txt = ev.text(p); state.rogueEvents.push({ nome: ev.nome, text: txt, kind: ev.kind }); showPickEventModal(ev, txt, () => renderOptionsPanel(), d);
}

function refreshSlotRating(slotId) { const node = $("#slot-" + slotId); const p = state.team[slotId]; if (!node || !p) return; const eff = effRating(slotId); node.innerHTML = slotTokenInnerHTML(p, eff, careerAgeForSlot(slotId)); tcgGoldStyle(eff).split(";").filter(Boolean).forEach(rule => { const i = rule.indexOf(":"); if (i > 0) node.style.setProperty(rule.slice(0, i).trim(), rule.slice(i + 1).trim()); }); }

function showPickEventModal(ev, text, onClose, delta) {
  let overlay = $("#pick-modal"); if (!overlay) { overlay = el("div", "pick-modal"); overlay.id = "pick-modal"; document.body.appendChild(overlay); }
  let cls = "pm-pos"; if (ev.kind === "repick") cls = "pm-repick"; else if (delta < 0 || ev.kind === "single-" || ev.kind === "neg") cls = "pm-neg";
  const icon = cls === "pm-pos" ? "⚡" : cls === "pm-neg" ? "💀" : "🔄";
  const label = cls === "pm-pos" ? "EVENTO POSITIVO" : cls === "pm-neg" ? "EVENTO NEGATIVO" : "RIMPIAZZO FORZATO";
  let deltaHtml = ""; if (typeof delta === "number" && delta !== 0) { const sign = delta > 0 ? "+" : ""; deltaHtml = `<div class="pm-delta ${delta > 0 ? "up" : "down"}">${sign}${delta} rating</div>`; } else if (ev.kind === "repick") { deltaHtml = `<div class="pm-delta neutral">RIPESCA</div>`; }
  overlay.innerHTML = `<div class="pm-card ${cls}"><div class="pm-header"><span class="pm-icon">${icon}</span><span class="pm-tag">${label}</span></div><h3>${ev.nome}</h3>${deltaHtml}<p>${text}</p><button class="btn primary pm-ok">Continua →</button></div>`;
  overlay.classList.add("show");
  const close = () => { overlay.classList.remove("show"); overlay.innerHTML = ""; if (onClose) onClose(); };
  overlay.onclick = close; overlay.querySelector(".pm-ok").onclick = e => { e.stopPropagation(); close(); };
}

function animateReveal(slotId, rating) { const node = $("#slot-" + slotId); if (!node) return; node.classList.add("revealing"); setTimeout(() => node.classList.remove("revealing"), 900); }

const rogueFlow = { events: [], ripickQueue: [], log: [] };
function startRogueResolution() {
  rogueFlow.log = []; if (state.rogueBonus) { if (!state.rogueBonus.preDraft) state.rogueBonus.apply(); rogueFlow.log.push({ type: "bonus", rar: state.rogueBonus.rar, nome: state.rogueBonus.nome, text: state.rogueBonus.desc }); }
  rogueFlow.events = rollEvents(); rogueFlow.ripickQueue = []; rogueFlow.eventQueue = [];
  for (const ev of rogueFlow.events) {
    let slotId = randomSlot();
    if (ev.kind === "ripick") { rogueFlow.ripickQueue.push({ ev, slotId }); rogueFlow.eventQueue.push({ ev, kind: "ripick", slotId, text: ev.text(slotId) }); }
    else if (ev.kind === "spread") { ev.apply(slotId); rogueFlow.eventQueue.push({ ev, kind: "spread", slotId, text: ev.text(slotId) }); }
    else { const d = ev.apply(slotId); rogueFlow.eventQueue.push({ ev, kind: ev.kind, slotId, text: ev.text(slotId), delta: d }); }
  }
  for (const e of rogueFlow.eventQueue) { rogueFlow.log.push({ type: "event", kind: e.kind, nome: e.ev.nome, text: e.text }); }
  slots().forEach(s => { if (state.team[s.id]) refreshSlotRating(s.id); });
  showNextGeneralEvent();
}

function showNextGeneralEvent() {
  if (rogueFlow.eventQueue.length) { const e = rogueFlow.eventQueue.shift(); if (e.kind === "ripick") { showNextGeneralEvent(); return; } showPickEventModal({ nome: e.ev.nome, kind: e.kind }, e.text, () => { slots().forEach(s => { if (state.team[s.id]) refreshSlotRating(s.id); }); showNextGeneralEvent(); }, e.delta); return; }
  if (rogueFlow.ripickQueue.length) processNextRipick(); else showRogueSummary();
}

function processNextRipick() {
  if (!rogueFlow.ripickQueue.length) { showRogueSummary(); return; }
  const { ev, slotId } = rogueFlow.ripickQueue.shift(); const slot = slots().find(s => s.id === slotId); const victim = state.team[slotId]; const victimName = victim ? `${victim.nome} (${victim.stagione})` : "Un titolare";
  showPickEventModal({ nome: ev.nome, kind: "repick" }, `${victimName} · ${ev.text(slotId)}`, () => { delete state.team[slotId]; delete state.ratingMods[slotId]; showScreen("#screen-draft"); buildPitch(); slots().forEach(s => { if (state.team[s.id]) markFilledSlot(s, state.team[s.id]); }); drawRipickOptions(slot); });
}


function showRogueSummary() {
  const box = $("#rogue-summary-body"); const bonusLog = rogueFlow.log.find(l => l.type === "bonus"); const eventLogs = rogueFlow.log.filter(l => l.type === "event");
  box.innerHTML = `${bonusLog ? `<div class="rs-section"><h4>Bonus attivato</h4><div class="rs-card"><span class="bonus-name">${bonusLog.nome}</span><span class="bonus-desc">${bonusLog.text}</span></div></div>` : ""}<div class="rs-section"><h4>Imprevisti della stagione</h4><ul class="rs-events">${eventLogs.map(l => `<li class="ev-${l.kind}"><strong>${l.nome}</strong> · ${l.text}</li>`).join("")}</ul></div>`;
  $("#btn-rogue-go").onclick = () => startSeasonWithBreak(); showScreen("#screen-rogue-summary");
}

function doReroll() { if (!state.activeSlot || state.rerolls <= 0) return; state.rerolls--; updateHud(); drawOptions(state.activeSlot, true); }

function teamRating() { const ratingOf = (state.rogue || state.career) ? id => effRating(id) : id => state.team[id].rating; const R = slots().reduce((s, sl) => s + ratingOf(sl.id), 0) / 11; return (state.diff && state.diff.goal === "retro") ? R * 0.97 : R; }

function startSeasonFirstHalf() {
  const R = teamRating(); const first = ENGINE.simulateSeason(R, 19); state.firstHalf = first; state.marketDone = false; state.secondHalfMatches = null;
  state.fixtureOpps = LEAGUE.romaOpponents(); state.firstHalfMatches = LEAGUE.buildRomaHalf({ wdl: first, team: state.team, mds: range(1, 19), opps: state.fixtureOpps });
  return { R, first };
}

function startSeasonWithBreak() {
  if (Object.keys(state.team).length < 11) return;
  if (state.career) state.slotBand = null;
  if (state.career && !state.career.agesInitialized) { slots().forEach(s => { state.career.ages[s.id] = careerInitialAge(state.team[s.id]); }); state.career.agesInitialized = true; state.career.initialTeam = { ...state.team }; }
  const { R, first } = startSeasonFirstHalf();
  const goBreak = () => { renderMarketBreak(R, first); showScreen("#screen-break"); };
  playMatchReplay(state.firstHalfMatches, goBreak, { heading: "Girone d'andata", skipLabel: "Mercato ⏭" });
}

function renderMarketBreak(R, first) {
  const ctx = leagueContext(); const halfScud = Math.floor(ctx.scudetto / 2); const halfCL = Math.floor(ctx.champions / 2);
  let posTxt; if (first.pts > halfScud) posTxt = "Primi! Sogniamo!"; else if (first.pts >= halfCL) posTxt = "Zona Champions."; else if (first.pts >= halfCL - 6) posTxt = "A ridosso dell'Europa."; else if (first.pts >= 20) posTxt = "Metà classifica."; else posTxt = "Disastro totale.";
  const box = $("#break-body"); box.innerHTML = `<div class="break-standings"><div class="bs-item"><span class="bs-label">Dopo 19 giornate</span><span class="bs-big">${first.pts}</span><span class="bs-sub">${vpsLabel(first.w, first.d, first.l)}</span></div><div class="bs-item"><span class="bs-label">Forza squadra</span><span class="bs-big">${R.toFixed(1)}</span><span class="bs-sub">${posTxt}</span></div></div><p class="break-intro">Mercato: pesca un rinforzo o giocatela così.</p><div class="break-actions"><button id="btn-market" class="btn ghost">Apri il mercato</button><button id="btn-skip-market" class="btn primary">Continua</button></div><div id="market-area"></div>`;
  $("#btn-skip-market").onclick = () => runSeason(); $("#btn-market").onclick = () => openMarket();
}

function openMarket() { state.marketSwapsLeft = 1; renderJanuaryMarketPitch(); }
function renderJanuaryMarketPitch() { const area = $("#market-area"); const left = state.marketSwapsLeft; renderMarketPitch(area, { left, hint: left > 0 ? "Tocca un titolare per sostituirlo." : "Cambio consumato.", onOpen: slotId => offerReplacements(slotId), continueBtn: null, }); }
/* --- MOTORE DI RARITÀ E PESCAGGIO --- */
function drawPlayersWithRarity(pool, count, excludeNamesAndSeasons = []) {
  const options = [];
  const seenNames = new Set();
  
  // Escludiamo chi è già in campo
  if (state.usedNames) state.usedNames.forEach(n => seenNames.add(n));
  
  // Escludiamo chi abbiamo appena "skippato" con il reroll
  excludeNamesAndSeasons.forEach(ex => {
      const justName = ex.replace(/[0-9]{4}\/[0-9]{2}/, '').replace('Hall of Fame', '').trim();
      seenNames.add(justName);
  });

  let attempts = 0;
  const randomizedPool = shuffle(pool);
  
  // Gacha System: Più il giocatore è forte, più è difficile che superi il filtro
  while (options.length < count && attempts < 1500) {
    attempts++;
    const p = randomizedPool[Math.floor(Math.random() * randomizedPool.length)];
    if (seenNames.has(p.nome)) continue;
    
    let weight = 100; // I giocatori normali (< 80) escono il 100% delle volte
    if (p.rating >= 95) weight = 3;       // I 95+ passano solo nel 3% dei casi
    else if (p.rating >= 90) weight = 12; // I 90-94 passano nel 12% dei casi
    else if (p.rating >= 85) weight = 35; // Gli 85-89 passano nel 35% dei casi
    else if (p.rating >= 80) weight = 70; // Gli 80-84 passano nel 70% dei casi
    
    if (Math.random() * 100 <= weight) {
      seenNames.add(p.nome);
      options.push(p);
    }
  }
  
  // Paracadute: se il filtro è stato troppo severo, riempie i buchi con quelli rimasti
  if (options.length < count) {
    for (const p of randomizedPool) {
      if (!seenNames.has(p.nome)) {
        seenNames.add(p.nome);
        options.push(p);
        if (options.length === count) break;
      }
    }
  }
  return options;
}

function buildOptionPool(slot, exclude = []) {
  const base = eligiblePool(slot, exclude);
  const broad = DB.filter(p => p.ruoli.some(r => slot.accepts.includes(r)) && !exclude.includes(p.nome + p.stagione));
  return drawPlayersWithRarity(base.concat(broad), state.optionsCount, exclude);
}

function drawRipickOptions(slot) { 
  let pool = DB.filter(p => p.ruoli.some(r => slot.accepts.includes(r))); 
  state.activeSlot = slot; 
  state.options = drawPlayersWithRarity(pool, state.optionsCount); 
  highlightSlots(); 
  renderOptionsPanel(); 
}

function marketOptions(slotId) { 
  const slot = slots().find(s => s.id === slotId); 
  let pool = DB.filter(p => p.ruoli.some(r => slot.accepts.includes(r))); 
  return drawPlayersWithRarity(pool, state.optionsCount);
}
function applyMarketReplacement(slotId, choiceIndex, opts, meta) {
  opts = opts || marketOptions(slotId); const np = opts[choiceIndex]; if (!np) return null;
  const oldP = state.team[slotId]; state.team[slotId] = np; state.usedNames.add(np.nome); delete state.ratingMods[slotId];
  if (state.career) state.career.ages[slotId] = careerInitialAge(np); state.marketDone = true;
  return { oldP, np, event: null };
}

function offerReplacements(slotId) {
  state.marketSwapsLeft--; renderJanuaryMarketPitch(); const opts = marketOptions(slotId); const pickArea = document.querySelector("#market-area .market-pick-area");
  renderReplacementCards(pickArea, slotId, opts, (idx) => { const res = applyMarketReplacement(slotId, idx, opts, { phase: "market" }); if (!res) { runSeason(); return; } toast(`${res.np.nome} prende il posto di ${res.oldP.nome}.`); runSeason(); }, () => runSeason());
}

function runSeason() {
  const R = teamRating(); const stats = ENGINE.seasonStats(R); const ctx = leagueContext();
  const first = state.firstHalf || ENGINE.simulateSeason(R, 19); let second = ENGINE.simulateSeason(R, 19);
  
  if (state.diff && state.diff.goal === "sesto") {
    const Banda = ["Christian Maggio", "Paolo Cannavaro", "Walter Gargano", "Hugo Campagnaro"]; const names = slots().map(s => state.team[s.id].nome); const count = Banda.filter(h => names.includes(h)).length;
    if (count > 0) { const pull = count * 0.18; const delta = Math.round((63 - (first.pts + second.pts)) * pull); second = ENGINE.applyResultMods(second, Math.round(delta / 2)); }
  }
  
  let season = { w: first.w + second.w, d: first.d + second.d, l: first.l + second.l, pts: first.pts + second.pts };
  const opps = state.fixtureOpps || (state.fixtureOpps = LEAGUE.romaOpponents());
  if (!state.firstHalfMatches) state.firstHalfMatches = LEAGUE.buildRomaHalf({ wdl: first, team: state.team, mds: range(1, 19), opps });
  state.secondHalfMatches = LEAGUE.buildRomaHalf({ wdl: second, team: state.team, mds: range(20, 38), opps });
  
  const allMatches = [...(state.firstHalfMatches || []), ...(state.secondHalfMatches || [])];
  const lg = LEAGUE.simulate({ team: state.team, romaMatches: allMatches }); state.league = lg;
  
  let champ = null; if (CHAMPIONS.isEligible("classica", lg.romaRank)) { champ = CHAMPIONS.simulate({ R, team: state.team }); } state.champions = champ;
  
  const place = placementFromRank(lg.romaRank, season.pts); const prizes = awards(state.team, R, season.pts);
  const topScorer = lg.topScorer ? lg.topScorer : prizes.scorer;
  if (topScorer && prizes.mvp.goals < topScorer.goals) prizes.mvp.goals = topScorer.goals;
  
  const perfect = season.w === 38;
  state.lastResult = { mode: state.diff.label, board: "classica", pts: season.pts, pos: place.pos, rank: lg.romaRank, rating: R, title: place.title, cls: place.cls, perfect: perfect, win: place.win, record: vpsLabel(season.w, season.d, season.l) };
  if (state.career) recordCareerSeasonResult();
  
  let banner = "";
  if (state.diff.goal === "retro") { banner = place.win ? `<div class="mission-banner ok">MISSIONE COMPIUTA · Amm fatt' schif'.</div>` : `<div class="mission-banner fail">MISSIONE FALLITA · Troppo forti.</div>`; }
  else if (state.diff.goal === "sesto") { banner = place.win ? `<div class="mission-banner ok">ZONA MAZZARRI RAGGIUNTA!</div>` : `<div class="mission-banner fail">MISSIONE FALLITA.</div>`; }
  else if (perfect) { banner = `<div class="mission-banner perfect">38·0 · STAGIONE PERFETTA · Tutta Napoli impazzisce! 🔥</div>`; }
  
  const coachLine = state.coach ? `<div class="rec-coach">Allenatore: <strong>${state.coach.nome}</strong></div>` : "";
  const quadrants = [];
  quadrants.push(`<div class="scoreboard ${place.cls}"><div class="sb-rating"><span class="sb-label">Forza squadra</span><span class="sb-big">${R.toFixed(1)}</span></div><div class="sb-points"><span class="sb-label">Punti in campionato</span><span class="sb-big" id="pts-counter">0</span><span class="sb-record">${vpsLabel(season.w, season.d, season.l)}</span></div><div class="sb-place"><span class="sb-label">Piazzamento</span><span class="sb-pos">${place.pos}</span></div></div>`);
  quadrants.push(`<div class="verdict ${place.cls}"><h3>${place.title}</h3><p>${place.flavor}</p><div class="awards verdict-awards"><div class="award-card"><span class="award-label">Capocannoniere</span><span class="award-name">${topScorer.nome}</span><span class="award-detail">${topScorer.goals} gol</span></div><div class="award-card"><span class="award-label">MVP</span><span class="award-name">${prizes.mvp.nome}</span></div></div></div>`);
  quadrants.push(`<div class="lineup-recap"><h4 class="lineup-recap-summary" style="margin-bottom:12px; cursor:default;">L'undici schierato</h4>${coachLine}<ul>${slots().map(s => { const p = state.team[s.id]; const eff = effRating(s.id); return `<li><span class="lr-role">${s.label}</span><span class="lr-player">${p.nome}</span><strong class="lr-eff">${eff}</strong></li>`; }).join("")}</ul></div>`);
  const box = $("#result-body"); box.innerHTML = (banner ? `<div class="quadrant" data-q="0">${banner}</div>` : "") + quadrants.map((q, i) => `<div class="quadrant" data-q="${i + 1}">${q}</div>`).join("");
  
  const showFinalResult = () => { showScreen("#screen-result"); updateCareerResultUI(); revealQuadrants(box, season.pts); };
  const afterSeason = champ ? () => playChampions(champ, place, showFinalResult) : showFinalResult;
  playMatchReplay(state.secondHalfMatches, afterSeason, { heading: "Girone di ritorno", skipLabel: "Salta al verdetto ⏭", startPts: first.pts });
}

let replayTimers = [];
function clearReplayTimers() { replayTimers.forEach(clearTimeout); replayTimers = []; }

function playMatchReplay(matches, done, opts = {}) {
  const list = $("#replay-list"); if (!list) { done(); return; } list.innerHTML = "";
  const headingEl = $("#replay-heading"); if (headingEl && opts.heading) headingEl.textContent = opts.heading;
  const skipBtn = $("#btn-skip-replay"); if (skipBtn && opts.skipLabel) skipBtn.textContent = opts.skipLabel;
  const speedSelect = $("#replay-speed"); const modeSelect = $("#replay-mode"); const stepBtn = $("#btn-step-replay");
  if (speedSelect) speedSelect.value = String(state.replaySpeed);
  if (modeSelect) modeSelect.value = state.replayMode;
  showScreen("#screen-replay");
  let finished = false; const finish = () => { if (finished) return; finished = true; clearReplayTimers(); if (skipBtn) skipBtn.onclick = null; if (stepBtn) stepBtn.onclick = null; done(); };
  if (skipBtn) skipBtn.onclick = finish;
  if (modeSelect) modeSelect.onchange = () => { state.replayMode = modeSelect.value; clearReplayTimers(); if (modeSelect.value === "manual") { if (stepBtn) stepBtn.disabled = false; } else { if (stepBtn) stepBtn.disabled = true; scheduleNext(); } };
  if (speedSelect) speedSelect.onchange = () => { state.replaySpeed = Number(speedSelect.value) || 260; clearReplayTimers(); if (state.replayMode === "auto") scheduleNext(); };
  if (stepBtn) {
    stepBtn.disabled = state.replayMode === "auto";
    stepBtn.onclick = () => { if (state.replayMode === "manual" && !finished) { step(); } };
  }
  const mdEl = $("#scorebug-matchday"); let i = 0, pts = opts.startPts || 0;
  const delayMs = () => Number(speedSelect && speedSelect.value ? speedSelect.value : state.replaySpeed) || 260;
  const scheduleNext = () => {
    if (finished) return;
    if (state.replayMode !== "auto") { if (stepBtn) stepBtn.disabled = false; return; }
    replayTimers.push(setTimeout(step, delayMs()));
  };
  const step = () => {
    if (finished) return;
    if (i >= matches.length) { replayTimers.push(setTimeout(finish, 1100)); return; }
    const m = matches[i++]; if (m.res === "W") pts += 3; else if (m.res === "D") pts += 1;
    if (mdEl) { mdEl.textContent = `GIORNATA ${m.md}/38`; mdEl.hidden = false; }
    const row = document.createElement("div"); const cls = m.res === "W" ? "w" : m.res === "D" ? "d" : "l"; const letter = m.res === "W" ? "V" : m.res === "D" ? "P" : "S";
    row.className = "replay-row rr-" + cls; row.innerHTML = `<span class="rr-md">G${m.md}</span><span class="rr-opp">${m.opp}</span><span class="rr-score">${m.gf}-${m.ga}</span><span class="rr-res">${letter}</span><span class="rr-tally">${pts} pt</span>`;
    list.appendChild(row); requestAnimationFrame(() => { row.classList.add("in"); list.scrollTop = list.scrollHeight; });
    if (state.replayMode === "manual") {
      if (stepBtn) stepBtn.disabled = false;
      return;
    }
    scheduleNext();
  };
  step();
}

let clTimers = [], clRaf = null;
function clearClTimers() { clTimers.forEach(clearTimeout); clTimers = []; if (clRaf) cancelAnimationFrame(clRaf); clRaf = null; }
function playChampions(champ, place, done) {
  document.body.classList.add("cl-mode"); showScreen("#screen-champions");
  const stage = $("#cl-stage"); 
  const title = champ && champ.won ? "Napoli ai quarti di finale: la corsa europea è davvero viva." : "Napoli in Champions: il percorso in Europa va avanti.";
  const route = champ && championRouteText(champ); 
  const routeText = route || "Azzurri in Europa, con un percorso da giocare partita dopo partita.";
  
  if (stage) stage.innerHTML = `<div class="cl-card"><div class="cl-tag">Champions League</div><h3>${title}</h3><p>${routeText}</p><div class="cl-grid"><div class="cl-block"><span class="cl-label">Piazzamento girone</span><strong>${champ && champ.leaguePhase ? champ.leaguePhase.rank : "-"}°</strong></div><div class="cl-block"><span class="cl-label">Miglior marcatore</span><strong>${champ && champ.stats && champ.stats.topScorer ? champ.stats.topScorer.nome : "-"}</strong></div></div></div>`;
  
  const finish = () => { clearClTimers(); document.body.classList.remove("cl-mode"); done(); }; 
  const skipBtn = $("#btn-skip-cl"); 
  if (skipBtn) { 
    skipBtn.textContent = "Avanti →"; 
    skipBtn.onclick = finish; 
  } 
  // Il setTimeout è stato rimosso. Ora si prosegue solo cliccando il bottone.
}

function championRouteText(champ) {
  if (!champ || !champ.leaguePhase) return "Azzurri in Europa, con un percorso da giocare partita dopo partita.";
  const route = champ.leaguePhase.route || champ.lastRound || "qualificazione";
  return `Percorso europeo: ${route}. La squadra ha mostrato forza e ha messo insieme la base per un'avventura lunga e difficile.`;
}

function shareResultText() { const r = state.lastResult; return r.perfect ? "Ho fatto il 38·0 perfetto con il Napoli! Gioca a 38-0 NAPOLI!" : `Ho fatto ${r.pts} punti con il mio Napoli all-time. Gioca a 38-0 NAPOLI! Forza Napoli Sempre 💙`; }
function copyShareText() { const txt = shareResultText(); navigator.clipboard.writeText(txt).then(() => toast("Testo copiato! 📋")); }
function shareResultImage() { toast("Condivisione non supportata in questa demo."); }
function revealQuadrants(box, finalPts) { const qs = Array.from(box.querySelectorAll(".quadrant")); qs.forEach((q, i) => { setTimeout(() => { q.classList.add("show"); const pts = q.querySelector("#pts-counter"); if (pts) countUp(pts, finalPts, 1500, false); }, i * 150); }); }
function countUp(el, target, dur, fmt) { dur = dur || 1400; const t0 = performance.now(); (function tick(now) { const f = Math.min(1, (now - t0) / dur); const v = Math.round(target * (1 - Math.pow(1 - f, 3))); el.textContent = fmt ? v.toLocaleString("it-IT") : v; if (f < 1) requestAnimationFrame(tick); })(performance.now()); }

setTimeout(init, 100);
/* ===== db.js ===== */
/* ============================================================
   38-0 NAPOLI - DATABASE GIOCATORI
   Rose SSC Napoli storiche e recenti
   ============================================================ */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else Object.assign(root, api);
})(typeof self !== "undefined" ? self : this, function () {
const ROLE_NAMES = {
  POR: "Portiere", DC: "Difensore centrale", TD: "Terzino destro",
  TS: "Terzino sinistro", ED: "Esterno destro", ES: "Esterno sinistro",
  MED: "Mediano", CC: "Centrocampista", TRQ: "Trequartista",
  AD: "Ala destra", AS: "Ala sinistra", ATT: "Attaccante"
};

const P = (nome, stagione, ruoli, rating) => ({ nome, stagione, ruoli, rating });

const BIRTH_YEARS = {
  "Diego Armando Maradona": 1960, "Careca": 1960, "Bruno Giordano": 1956, "Alemão": 1961, "Gianfranco Zola": 1966, "Ciro Ferrara": 1967, "Giuseppe Bruscolotti": 1951, "Ruud Krol": 1949, "Luciano Castellini": 1945, "Antonio Juliano": 1942, "Andrea Carnevale": 1961, "Laurent Blanc": 1965, "Daniel Fonseca": 1969, "Fabio Cannavaro": 1973, "Roberto Ayala": 1973, "Fabio Pecchia": 1973,
  "Marek Hamsik": 1987, "Edinson Cavani": 1987, "Ezequiel Lavezzi": 1985, "Gonzalo Higuain": 1987, "Dries Mertens": 1987, "Lorenzo Insigne": 1991, "Kalidou Koulibaly": 1991, "Josè Callejon": 1987, "Jorginho": 1991, "Allan": 1991, "Faouzi Ghoulam": 1991, "Raul Albiol": 1985, "Pepe Reina": 1982, "Christian Maggio": 1982, "Paolo Cannavaro": 1981, "Walter Gargano": 1984, "Morgan De Sanctis": 1977, "Hugo Campagnaro": 1980, "Gokhan Inler": 1984, "Juan Camilo Zuniga": 1990, "Goran Pandev": 1983,
  "Victor Osimhen": 1998, "Khvicha Kvaratskhelia": 2001, "Piotr Zielinski": 1994, "Stanislav Lobotka": 1994, "Zambo Anguissa": 1995, "Giovanni Di Lorenzo": 1993, "Kim Min-jae": 1996, "Amir Rrahmani": 1994, "Alex Meret": 1997, "Mathias Olivera": 1997, "Giacomo Raspadori": 2000, "Giovanni Simeone": 1995, "Matteo Politano": 1993, "Hirving Lozano": 1995, "Fabian Ruiz": 1996, "Arkadiusz Milik": 1994, "Mario Rui": 1991,
  "Romelu Lukaku": 1993, "Alessandro Buongiorno": 1999, "Scott McTominay": 1996, "Billy Gilmour": 1997, "David Neres": 1997, "Leonardo Spinazzola": 1993, "Pasquale Mazzocchi": 1995, "Jesper Lindström": 2000, "Leo Ostigard": 1999, "Noa Lang": 1999,
  "Pino Taglialatela": 1969, "Francesco Turrini": 1965, "Stefan Schwoch": 1969, "Claudio Bellucci": 1975, "Francelino Matuzalem": 1980, "Francesco Montervino": 1978, "Marek Jankulovski": 1977, "Roberto Sosa": 1974, "Emanuele Calaiò": 1979, "Mariano Bogliacino": 1980, "Fabiano Santacroce": 1980, "Salvatore Aronica": 1978, "Michele Pazienza": 1984, "Marcelo Zalayeta": 1978, "German Denis": 1981, "Eduardo Vargas": 1989, "Michu": 1986, "Jonathan De Guzman": 1985, "Miguel Britos": 1981, "Valon Behrami": 1985, "Blerim Dzemaili": 1986, "Omar El Kaddouri": 1987, "Nicolas Spolli": 1986,
 "Gianluca Grava": 1977, "Jesus Datolo": 1984, "Luca Cigarini": 1986, 
  "Ignacio Fideleff": 1989, "Leandro Rinaudo": 1983, "Leonardo Pavoletti": 1988, 
  "Andrea Petagna": 1995, "Adam Ounas": 1996, "Nikola Maksimovic": 1991, 
  "Sebastiano Luperto": 1996, "Kevin Malcuit": 1991, "Diego Demme": 1991, 
  "Tiemoué Bakayoko": 1994, "Tanguy Ndombele": 1996, "Eljif Elmas": 1999
};

const DB = [
  /* ---------- Hall of Fame & Leggende (Rating estremi) ---------- */
  P("Diego Armando Maradona", "Hall of Fame", ["TRQ","ATT"], 99),
  P("Diego Armando Maradona", "1986/87", ["TRQ","ATT"], 97),
  P("Careca", "Hall of Fame", ["ATT"], 99),
  P("Careca", "1989/90", ["ATT"], 94),
  P("Bruno Giordano", "Hall of Fame", ["ATT"], 99),
  P("Bruno Giordano", "1986/87", ["ATT"], 90),
  P("Alemão", "1989/90", ["MED","CC"], 88),
  P("Gianfranco Zola", "1989/90", ["TRQ","ATT"], 86),
  P("Daniel Fonseca", "1992/93", ["ATT"], 87),
  P("Laurent Blanc", "1991/92", ["DC"], 88),
  P("Fabio Cannavaro", "1994/95", ["DC"], 85),
  P("Roberto Ayala", "1996/97", ["DC"], 84),
  P("Ruud Krol", "Hall of Fame", ["DC","MED"], 99),
  P("Ciro Ferrara", "Hall of Fame", ["DC","TD"], 99),
  P("Ciro Ferrara", "1989/90", ["DC","TD"], 89),
  P("Giuseppe Bruscolotti", "Hall of Fame", ["DC","TD"], 99),
  P("Antonio Juliano", "Hall of Fame", ["CC","MED"], 99),
  P("Luciano Castellini", "Hall of Fame", ["POR"], 99),
  P("Pino Taglialatela", "1996/97", ["POR"], 84),

  /* ---------- Anni Bui e Rinascita (1998-2007) ---------- */
  P("Stefan Schwoch", "1999/00", ["ATT"], 79),
  P("Claudio Bellucci", "1998/99", ["ATT"], 77),
  P("Francesco Montervino", "2000/01", ["MED","CC"], 76),
  P("Francelino Matuzalem", "2005/06", ["MED","CC"], 81),
  P("Marek Jankulovski", "2003/04", ["TS","ES"], 82),
  P("Roberto Sosa", "2005/06", ["ATT"], 77),
  P("Emanuele Calaiò", "2006/07", ["ATT"], 79),
  P("Mariano Bogliacino", "2006/07", ["CC","TRQ"], 79),

  /* ---------- Era Reja / Mazzarri (2007-2013) ---------- */
  P("Ezequiel Lavezzi", "2007/08", ["ATT","AS"], 83),
  P("Ezequiel Lavezzi", "2011/12", ["ATT","AS","TRQ"], 88),
  P("Marek Hamsik", "2007/08", ["CC","TRQ"], 81),
  P("Marek Hamsik", "2012/13", ["CC","TRQ"], 88),
  P("Edinson Cavani", "2010/11", ["ATT"], 90),
  P("Edinson Cavani", "2012/13", ["ATT"], 94),
  P("Goran Pandev", "2011/12", ["ATT","TRQ"], 82),
  P("Christian Maggio", "2008/09", ["TD","ED"], 82),
  P("Christian Maggio", "2011/12", ["TD","ED"], 86),
  P("Paolo Cannavaro", "2011/12", ["DC"], 83),
  P("Morgan De Sanctis", "2011/12", ["POR"], 84),
  P("Walter Gargano", "2007/08", ["MED","CC"], 79),
  P("Walter Gargano", "2010/11", ["MED","CC"], 81),
  P("Hugo Campagnaro", "2009/10", ["DC","TD"], 80),
  P("Hugo Campagnaro", "2011/12", ["DC","TD"], 84),
  P("Gokhan Inler", "2012/13", ["CC","MED"], 84),
  P("Juan Camilo Zuniga", "2012/13", ["TS","ES"], 84),
  P("Fabiano Santacroce", "2008/09", ["DC"], 80),
  P("Salvatore Aronica", "2011/12", ["DC","TS"], 77),
  P("German Denis", "2009/10", ["ATT"], 79),
  P("Marcelo Zalayeta", "2007/08", ["ATT"], 80),

  /* ---------- Era Benitez / Sarri (2013-2018) ---------- */
  P("Gonzalo Higuain", "2013/14", ["ATT"], 89),
  P("Gonzalo Higuain", "2015/16", ["ATT"], 96),
  P("Dries Mertens", "2013/14", ["AS","TRQ"], 84),
  P("Dries Mertens", "2016/17", ["ATT","AS","TRQ"], 93),
  P("Lorenzo Insigne", "2015/16", ["AS","TRQ"], 86),
  P("Lorenzo Insigne", "2017/18", ["AS","TRQ"], 91),
  P("Josè Callejon", "2013/14", ["AD","ED"], 85),
  P("Josè Callejon", "2016/17", ["AD","ED"], 89),
  P("Marek Hamsik", "2017/18", ["CC","MED"], 90),
  P("Jorginho", "2015/16", ["MED","CC"], 84),
  P("Jorginho", "2017/18", ["MED","CC"], 89),
  P("Allan", "2015/16", ["CC","MED"], 85),
  P("Allan", "2017/18", ["CC","MED"], 89),
  P("Kalidou Koulibaly", "2015/16", ["DC"], 86),
  P("Kalidou Koulibaly", "2017/18", ["DC"], 93),
  P("Raul Albiol", "2013/14", ["DC"], 83),
  P("Raul Albiol", "2016/17", ["DC"], 87),
  P("Pepe Reina", "2013/14", ["POR"], 85),
  P("Pepe Reina", "2016/17", ["POR"], 84),
  P("Faouzi Ghoulam", "2015/16", ["TS","ES"], 84),
  P("Faouzi Ghoulam", "2017/18", ["TS","ES"], 88),
  P("Mario Rui", "2017/18", ["TS"], 80),
  P("Arkadiusz Milik", "2016/17", ["ATT"], 84),
  P("Piotr Zielinski", "2016/17", ["CC","TRQ"], 82),

  /* ---------- Era Ancelotti / Gattuso (2018-2021) ---------- */
  P("Fabian Ruiz", "2018/19", ["CC","TRQ"], 84),
  P("Fabian Ruiz", "2020/21", ["CC","TRQ"], 86),
  P("Piotr Zielinski", "2020/21", ["CC","TRQ"], 87),
  P("Hirving Lozano", "2020/21", ["AD","AS"], 84),
  P("Matteo Politano", "2020/21", ["AD","TRQ"], 83),
  P("Giovanni Di Lorenzo", "2019/20", ["TD"], 83),
  P("Giovanni Di Lorenzo", "2020/21", ["TD"], 85),
  P("Kostas Manolas", "2019/20", ["DC"], 84),
  P("Alex Meret", "2019/20", ["POR"], 82),
  P("Alex Meret", "2020/21", ["POR"], 81),
  P("Stanislav Lobotka", "2020/21", ["MED","CC"], 80),

  /* ---------- Scudetto Spalletti (2022-2023) ---------- */
  P("Victor Osimhen", "2021/22", ["ATT"], 88),
  P("Victor Osimhen", "2022/23", ["ATT"], 95),
  P("Khvicha Kvaratskhelia", "2022/23", ["AS"], 94),
  P("Piotr Zielinski", "2022/23", ["CC","TRQ"], 89),
  P("Stanislav Lobotka", "2022/23", ["MED","CC"], 91),
  P("Zambo Anguissa", "2022/23", ["CC","MED"], 89),
  P("Giovanni Di Lorenzo", "2022/23", ["TD"], 90),
  P("Kim Min-jae", "2022/23", ["DC"], 92),
  P("Amir Rrahmani", "2022/23", ["DC"], 87),
  P("Mario Rui", "2022/23", ["TS"], 84),
  P("Mathias Olivera", "2022/23", ["TS"], 83),
  P("Alex Meret", "2022/23", ["POR"], 85),
  P("Giacomo Raspadori", "2022/23", ["ATT","TRQ"], 83),
  P("Giovanni Simeone", "2022/23", ["ATT"], 82),
  P("Matteo Politano", "2022/23", ["AD"], 84),
  P("Hirving Lozano", "2022/23", ["AD"], 83),

  /* ---------- Era Conte (2024-2026) ---------- */
  P("Romelu Lukaku", "2024/25", ["ATT"], 88),
  P("Khvicha Kvaratskhelia", "2024/25", ["AS","TRQ"], 91),
  P("Scott McTominay", "2024/25", ["CC","TRQ"], 87),
  P("Alessandro Buongiorno", "2024/25", ["DC"], 88),
  P("David Neres", "2024/25", ["AD","AS"], 85),
  P("Billy Gilmour", "2024/25", ["MED","CC"], 83),
  P("Amir Rrahmani", "2024/25", ["DC"], 85),
  P("Giovanni Di Lorenzo", "2024/25", ["TD","DC"], 86),
  P("Leonardo Spinazzola", "2024/25", ["TS","ES"], 80),
  P("Alex Meret", "2024/25", ["POR"], 86),
  P("Pasquale Mazzocchi", "2024/25", ["TD","TS"], 80),
  P("Jesper Lindström", "2024/25", ["AS","TRQ"], 82),
  P("Leo Ostigard", "2024/25", ["DC"], 82),
  P("Noa Lang", "2024/25", ["AD","AS"], 83),

  /* I gregari e i "cult" storici */
  P("Gianluca Grava", "2010/11", ["DC", "TD"], 75),
  P("Ignacio Fideleff", "2011/12", ["DC", "TS"], 66),
  P("Leandro Rinaudo", "2009/10", ["DC"], 70),
  P("Jesus Datolo", "2009/10", ["ES", "CC"], 73),
  P("Luca Cigarini", "2009/10", ["CC", "MED"], 76),
  
  /* Attaccanti meteore o scorte */
  P("Leonardo Pavoletti", "2016/17", ["ATT"], 75),
  P("Andrea Petagna", "2020/21", ["ATT"], 78),
  P("Adam Ounas", "2017/18", ["AD", "AS"], 76),
  
  /* Era recente: comprimari e prestiti */
  P("Nikola Maksimovic", "2019/20", ["DC"], 78),
  P("Sebastiano Luperto", "2019/20", ["DC", "TS"], 73),
  P("Kevin Malcuit", "2018/19", ["TD", "ED"], 76),
  P("Diego Demme", "2020/21", ["MED", "CC"], 79),
  P("Tiemoué Bakayoko", "2020/21", ["MED"], 77),
  P("Tanguy Ndombele", "2022/23", ["CC", "MED"], 80),
  P("Eljif Elmas", "2022/23", ["CC", "AS", "TRQ"], 82)
];

DB.forEach(p => { p.annoNascita = BIRTH_YEARS[p.nome] || null; });

  return { DB, ROLE_NAMES };
});


/* ===== roguelike.js ===== */
/* ============================================================
   38-0 NAPOLI - MODALITÀ ROGUE LIKE
   ============================================================ */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else Object.assign(root, api);
})(typeof self !== "undefined" ? self : this, function () {
let _rnd = Math.random;
function setRogueRng(rng) { _rnd = rng && typeof rng.next === "function" ? () => rng.next() : Math.random; }
const rnd = (arr) => arr[Math.floor(_rnd() * arr.length)];
const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(_rnd() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; } return a; };

const RARITY = {
  comune:      { label: "Comune",      w: 50, cls: "r-comune" },
  noncomune:   { label: "Non comune",  w: 28, cls: "r-noncomune" },
  raro:        { label: "Raro",        w: 15, cls: "r-raro" },
  epico:       { label: "Epico",       w: 7,  cls: "r-epico" },
  leggendario: { label: "Leggendario", w: 3,  cls: "r-leggendario" }
};

function teamSlots() { return Object.keys(state.team); }
function randomSlot(excludeImmuneNegative) {
  let k = teamSlots().filter(id => state.team[id].stagione !== "Hall of Fame");
  if (excludeImmuneNegative) k = k.filter(id => !isEventImmune(state.team[id]));
  return k.length ? k[Math.floor(_rnd() * k.length)] : null;
}
function slotsByRoleGroup(groups) {
  return teamSlots().filter(id => {
    const p = state.team[id];
    return p && p.ruoli.some(r => groups.includes(r));
  });
}
function strongestSlot(excludeImmuneNegative) {
  let best = null, bv = -1;
  for (const id of teamSlots()) {
    if (excludeImmuneNegative && isEventImmune(state.team[id])) continue;
    const v = effRating(id);
    if (v > bv) { bv = v; best = id; }
  }
  return best;
}
function weakestSlot(excludeImmuneNegative) {
  let best = null, bv = Infinity;
  for (const id of teamSlots()) {
    if (excludeImmuneNegative && isEventImmune(state.team[id])) continue;
    const v = effRating(id);
    if (v < bv) { bv = v; best = id; }
  }
  return best;
}
function addMod(slotId, delta) {
  if (!slotId) return 0;
  state.ratingMods[slotId] = (state.ratingMods[slotId] || 0) + delta;
  return delta; 
}
function effRating(slotId) {
  const p = state.team[slotId];
  if (!p) return 0;
  const coachBonus = state.career
    ? (typeof careerCoachBonus === "function" ? careerCoachBonus(slotId) : 0)
    : ((state.coach && state.coach.bonus) || 0);
  return p.rating + (state.ratingMods[slotId] || 0) + coachBonus + (state.rogueGeneralMod || 0);
}
function isUnder(p) { return p.rating < 80; }

const PRIME_CARDS = [
  { nome: "Gonzalo Higuain", stagione: "2015/16" },
  { nome: "Dries Mertens", stagione: "2016/17" },
  { nome: "Victor Osimhen", stagione: "2022/23" },
  { nome: "Khvicha Kvaratskhelia", stagione: "2022/23" },
  { nome: "Edinson Cavani", stagione: "2012/13" },
  { nome: "Marek Hamsik", stagione: "2017/18" },
  { nome: "Kalidou Koulibaly", stagione: "2017/18" },
  { nome: "Lorenzo Insigne", stagione: "2017/18" },
  { nome: "Kim Min-jae", stagione: "2022/23" }
];
function isPrimeCard(p) {
  return PRIME_CARDS.some(c => c.nome === p.nome && c.stagione === p.stagione);
}
function isEventImmune(p) {
  return !!p && (isPrimeCard(p) || p.stagione === "Hall of Fame");
}

/* ============================================================
   BONUS PRE-PARTITA 
   ============================================================ */
const BONUSES = [
  { id: "fascia_marek", rar: "comune", nome: "La fascia di Marekiaro",
    desc: "Spirito da capitano: +2 a un centrocampista.",
    apply: () => { const s = slotsByRoleGroup(["CC","MED","TRQ"]); addMod(rnd(s.length ? s : teamSlots()), 2); } },
  { id: "discorso_brusc", rar: "comune", nome: "Discorso di Bruscolotti",
    desc: "Pall 'e fierro striglia la difesa: +2 a un difensore.",
    apply: () => { const s = slotsByRoleGroup(["DC","TD","TS"]); addMod(rnd(s.length ? s : teamSlots()), 2); } },
  { id: "tir_a_gir", rar: "noncomune", nome: "O' Tir a gir",
    desc: "Magia sotto l'incrocio: +3 all'ala sinistra o attaccante più forte.",
    apply: () => { const s = slotsByRoleGroup(["AS","ATT"]); addMod(s.length ? strongestSlotIn(s) : strongestSlot(), 3); } },
  { id: "maschera", rar: "noncomune", nome: "La maschera porta fortuna",
    desc: "Non si arrende mai: +3 a un attaccante a caso.",
    apply: () => { const s = slotsByRoleGroup(["ATT"]); addMod(rnd(s.length ? s : teamSlots()), 3); } },
  { id: "san_gennaro", rar: "raro", nome: "San Gennà, pienzace tu", preDraft: true,
    desc: "Il sangue si è sciolto: raddoppia il prossimo effetto POSITIVO che ti capita.",
    apply: () => { state.flags.doppione = true; } },
  { id: "ritiro_dimaro", rar: "raro", nome: "Ritiro a Dimaro", preDraft: true,
    desc: "Montagne, fatica e tifosi: +1 alla condizione generale.",
    apply: () => { state.rogueGeneralMod += 1; } },
  { id: "pappone", rar: "epico", nome: "Aurelio caccia i sordi!", preDraft: true,
    desc: "Il Presidente apre il portafogli: i reroll diventano 5.",
    apply: () => { state.rerolls = 5; } },
  { id: "notti_maradona", rar: "epico", nome: "Notti magiche al Maradona", preDraft: true,
    desc: "Tutto esaurito a Fuorigrotta: +2 alla condizione generale.",
    apply: () => { state.rogueGeneralMod += 2; } },
  { id: "voglio_vincere", rar: "leggendario", nome: "Io voglio vincere!", preDraft: true,
    desc: "+3 alla condizione generale e immunità totale a tutti gli imprevisti negativi.",
    apply: () => { state.rogueGeneralMod += 3; state.flags.immunita = "totale"; } },
];

function strongestSlotIn(ids) {
  let best = null, bv = -1;
  for (const id of ids) { const v = effRating(id); if (v > bv) { bv = v; best = id; } }
  return best;
}

/* ============================================================
   IMPREVISTI POST-DRAFT
   ============================================================ */
const EVENTS = [
  { id: "figlio_napoli", kind: "pos", nome: "Figlio di Napoli",
    text: id => `${nm(id)} bacia la maglia e gioca col cuore: +3 rating.`,
    apply: id => addMod(id, gain(3)) },
  { id: "bomber_azzurro", kind: "pos", nome: "Esulta sotto la curva",
    text: id => `${nm(id)} trova un gol all'incrocio che infiamma lo stadio: +3 rating.`,
    pick: () => { const a = slotsByRoleGroup(["ATT", "AS", "AD"]); return a.length ? rnd(a) : null; },
    apply: id => addMod(id, gain(3)) },
  { id: "albergo", kind: "spread", nome: "Sconfitta in albergo",
    text: id => `La squadra ha visto la partita in TV e crolla mentalmente. -1 a tutti, ma ${nm(id)} prova a resistere: +3.`,
    apply: id => { state.rogueGeneralMod -= 1; addMod(id, 4); } }, 
  { id: "ammutinamento", kind: "neg", nome: "Ammutinamento nello spogliatoio",
    text: id => `${nm(id)} guida la rivolta e si rifiuta di andare in ritiro: -3 rating.`,
    apply: id => addMod(id, -3) },
  { id: "lite_pappone", kind: "ripick", nome: "Lite col Presidente",
    text: id => `${nm(id)} sbatte la porta e va via a gennaio. Tocca ripescare.`,
    ripick: {} },
  { id: "clausola", kind: "ripick", nome: "Pagano la clausola rescissoria",
    text: id => `Di notte, di nascosto, pagano la clausola di ${nm(id)}. Ciao ciao, ripeschi.`,
    ripick: { capPenalty: 6 } },
  { id: "sciatica", kind: "neg", nome: "Torna la sciatica",
    text: id => `${nm(id)} ha un blocco muscolare e cammina a fatica: -2 rating.`,
    apply: id => addMod(id, -2) },
  { id: "rolex", kind: "mystery", nome: "Furto dell'orologio",
    text: (id, d) => `${nm(id)} smarrisce l'orologio. ${d > 0 ? "Lo ritrova e festeggia: +" : "Si demoralizza: "}${d} rating.`,
    apply: id => { const d = _rnd() < 0.5 ? 2 : -3; addMod(id, d); return d; } }
];

const PICK_EVENT_CHANCE = 1 / 8;
function nameHas(p, needles) {
  const n = (p?.nome || "").toLowerCase();
  return needles.some(x => n.includes(x.toLowerCase()));
}

const DEDICATED_TRIGGERS = [
  { id: "ciro_mertens", chance: 0.15, on: { name: "Dries Mertens" }, type: "mod", delta: 3,
    nome: "Ciro!",
    text: (p) => `${p} si trasforma nel vero scugnizzo napoletano: +3 al rating.` },
  { id: "kvaradona", chance: 0.15, on: { name: "Khvicha Kvaratskhelia" }, type: "mod", delta: 3,
    nome: "Kvaradona",
    text: (p) => `${p} ubriaca tre difensori: +3 al rating.` },
  { id: "higuain_juve", chance: 0.10, on: { name: "Gonzalo Higuain" }, type: "repick",
    nome: "Core 'ngrato",
    text: (was) => `Visite mediche di notte a Madrid. ${was} va alla Juve. Ripescaggio obbligato!` },
  { id: "cavani_matador", chance: 0.15, on: { name: "Edinson Cavani" }, type: "mod", delta: 2,
    nome: "Il Matador ha fame",
    text: (p) => `${p} segna pure da centrocampo: +2 al rating.` }
];

const COACH_TRIGGERS = [];

const PAIR_EGGS = [
  { id: "tre_tenori", names: ["Marek Hamsik", "Edinson Cavani", "Ezequiel Lavezzi"], setRating: 99,
    title: "I Tre Tenori",
    text: "Hai schierato Hamsik, Lavezzi e Cavani! I tre tenori si riuniscono e diventano tutti da 99." },
  { id: "gemelli_scudetto", names: ["Victor Osimhen", "Khvicha Kvaratskhelia"], setRating: null,
    title: "I Gemelli dello Scudetto",
    text: "Osimhen e Kvara insieme! Nessun bonus matematico, ma che spettacolo per gli occhi." }
];

function checkPairEasterEgg() {
  const names = teamSlots().map(id => state.team[id].nome);
  for (const egg of PAIR_EGGS) {
    if (state.flags["egg_" + egg.id]) continue;
    if (!egg.names.every(n => names.includes(n))) continue;
    state.flags["egg_" + egg.id] = true;
    const out = [];
    if (egg.setRating) {
      for (const id of teamSlots()) {
        const p = state.team[id];
        if (egg.names.includes(p.nome)) {
          state.ratingMods[id] = (state.ratingMods[id] || 0) + (egg.setRating - p.rating);
          out.push(id);
        }
      }
    }
    return { ids: out, egg };
  }
  return null;
}
function hasBiasEggPending(nome) { return false; }

function checkDedicatedTrigger(p, slot) {
  for (const t of DEDICATED_TRIGGERS) {
    if (t.negative && isEventImmune(p)) continue; 
    if (t.on.name && p.nome !== t.on.name) continue;
    if (_rnd() < t.chance) return t;
  }
  return null;
}

function findEntry(nome, stagione) {
  return DB.find(p => p.nome === nome && p.stagione === stagione) || null;
}
function nm(slotId) {
  const p = state.team[slotId];
  if (!p) return "Un giocatore";
  return p.nome + " (" + p.stagione + ")";
}

const PICK_EVENTS = [
  { id: "crociato", w: 10, kind: "single-", injury: true, nome: "Crociato rotto",
    text: p => `${p.nome} (${p.stagione}) salta metà stagione: -3 al rating. Che mazzata.`,
    apply: id => addMod(id, -3) },
  { id: "giovane", w: 8, kind: "single+", nome: "Esplosione del giovane",
    text: p => `${p.nome} (${p.stagione}) si prende la maglia da titolare: +4 al rating.`,
    cond: id => isUnder(state.team[id]),
    apply: id => addMod(id, gain(4)) },
  { id: "miracolo", w: 8, kind: "single+", nome: "Miracolo di San Gennaro",
    text: p => `${p.nome} (${p.stagione}) viene baciato dalla fortuna e salva una partita: +3 al rating.`,
    apply: id => addMod(id, gain(3)) },
  { id: "doping_ko", w: 4, kind: "repick", nome: "Positivo, fuori rosa",
    text: p => `${p.nome} (${p.stagione}) beccato! Squalificato. Tocca ripescare.`,
    ripick: {} }
];

function rollPickEvent(slotId, isFirstPick) {
  const p = state.team[slotId];
  const immune = isEventImmune(p);
  const pool = PICK_EVENTS.filter(ev => {
    if (ev.cond && !ev.cond(slotId)) return false;               
    if (immune && ["single-","repick","mystery"].includes(ev.kind)) return false;
    return true;
  });
  let total = 0;
  const weighted = pool.map(ev => {
    let w = ev.w;
    total += w;
    return { ev, w };
  });
  let r = _rnd() * total;
  for (const { ev, w } of weighted) { r -= w; if (r <= 0) return ev; }
  return weighted[weighted.length - 1].ev;
}

function gain(base) {
  if (state.flags.doppione) {
    state.flags.doppione = false;
    state.flags.lastDoubled = true;
    return base * 2;
  }
  return base;
}

function drawBonusChoices(n = 3) {
  const pool = BONUSES.slice();
  const picks = [];
  while (picks.length < n && pool.length) {
    const total = pool.reduce((s, b) => s + RARITY[b.rar].w, 0);
    let r = _rnd() * total;
    let idx = 0;
    for (let i = 0; i < pool.length; i++) { r -= RARITY[pool[i].rar].w; if (r <= 0) { idx = i; break; } }
    picks.push(pool.splice(idx, 1)[0]);
  }
  return picks;
}

function rollEvents() {
  const pool = EVENTS.filter(e => {
    if (e.condition && !e.condition()) return false;
    if (e.chance != null && _rnd() > e.chance) return false;
    return true;
  });
  const n = 2 + Math.floor(_rnd() * 4); 
  return shuffle(pool).slice(0, n);
}

  return {
    setRogueRng, RARITY, BONUSES, EVENTS, PICK_EVENTS, PICK_EVENT_CHANCE, DEDICATED_TRIGGERS, COACH_TRIGGERS, PAIR_EGGS, teamSlots, randomSlot, slotsByRoleGroup, strongestSlot, weakestSlot, strongestSlotIn, addMod, effRating, isUnder, nameHas, nm, findEntry, gain, checkPairEasterEgg, hasBiasEggPending, checkDedicatedTrigger, rollPickEvent, drawBonusChoices, rollEvents, PRIME_CARDS, isPrimeCard, isEventImmune,
  };
});


/* ===== coaches.js ===== */
/* ============================================================
   38-0 NAPOLI - ALLENATORI (solo Rogue Like / Carriera)
   ============================================================ */

(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else { root.COACHES = api.COACHES; root.randomCoach = api.randomCoach; }
})(typeof self !== "undefined" ? self : this, function () {
  const COACHES = [
    { id: "spalletti", nome: "Luciano Spalletti", modulo: "4-3-3", bonus: 3,
      nota: "Uomini forti, destini forti. Lo Scudetto del terzo millennio: +3 generale.",
      specialBonus: {
        id: "faccia_feroce",
        nome: "Faccia feroce",
        desc: "+4 al rating di ogni attaccante (ATT/AS/AD) schierato."
      }
    },
    { id: "sarri", nome: "Maurizio Sarri", modulo: "4-3-3", bonus: 2,
      nota: "Il Sarrismo, i 91 punti e la tuta d'ordinanza: +2 generale.",
      specialBonus: {
        id: "palleggio_nello_stretto",
        nome: "Palleggio nello stretto",
        desc: "+5 al rating di tutti i centrocampisti (CC/MED/TRQ)."
      }
    },
    { id: "mazzarri", nome: "Walter Mazzarri", modulo: "3-5-2", bonus: 1,
      nota: "La pioggia, il campo pesante e il polso che indica l'orologio: +1 generale.",
      specialBonus: {
        id: "scusa_pronta",
        nome: "Scusa in conferenza",
        desc: "Immunità automatica a un evento negativo durante il draft."
      }
    },
    { id: "gattuso", nome: "Gennaro Gattuso", modulo: "4-2-3-1", bonus: 1,
      nota: "Occhio di tigre e veleno: +1 generale, la squadra non molla mai.",
      specialBonus: {
        id: "veleno",
        nome: "O' Velen",
        desc: "+3 al rating dei giocatori con ruoli difensivi (DC/MED)."
      }
    },
    { id: "conte", nome: "Antonio Conte", modulo: "3-4-2-1", bonus: 2,
      nota: "Amma faticà. Preparazione atletica distrutta, ma si vince: +2 generale.",
      specialBonus: {
        id: "amma_fatica",
        nome: "Amma Faticà",
        desc: "+3 al rating delle fasce (ED/ES) e del trequartista (TRQ)."
      }
    },
    { id: "benitez", nome: "Rafa Benitez", modulo: "4-2-3-1", bonus: 2,
      nota: "Spalla a spalla e internazionalizzazione: +2 generale.",
      specialBonus: {
        id: "turnover",
        nome: "Caffè e Turnover",
        desc: "Higuain 2015/16 ha il doppio delle probabilità di comparire."
      }
    },
    { id: "reja", nome: "Edy Reja", modulo: "3-5-2", bonus: 1,
      nota: "Il nonno di tutti i napoletani. Dalla Serie C all'Europa: +1 generale.",
      specialBonus: {
        id: "cuore_azzurro",
        nome: "Cuore Azzurro",
        desc: "Hamsik 2007/08 e Lavezzi 2007/08 compaiono con probabilità maggiore."
      }
    }
  ];

  function randomCoach(rng) {
    if (rng && typeof rng.pick === "function") return rng.pick(COACHES);
    return COACHES[Math.floor(Math.random() * COACHES.length)];
  }

  return { COACHES, randomCoach };
});

/* ===== rng.js ===== */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.RNG = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";
  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function xmur3(str) {
    let h = 1779033703 ^ str.length;
    for (let i = 0; i < str.length; i++) { h = Math.imul(h ^ str.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
    return function () { h = Math.imul(h ^ (h >>> 16), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); h ^= h >>> 16; return h >>> 0; };
  }
  function toSeed(seed) {
    if (typeof seed === "number" && Number.isFinite(seed)) return seed >>> 0;
    const s = String(seed == null ? "" : seed); return xmur3(s)();
  }
  function createRng(seed) {
    const u32 = toSeed(seed); const _next = mulberry32(u32);
    const rng = {
      seed: u32, calls: 0,
      next() { this.calls++; return _next(); },
      int(a, b) { return a + Math.floor(this.next() * (b - a + 1)); },
      chance(p) { return this.next() < p; },
      pick(arr) { return arr[Math.floor(this.next() * arr.length)]; },
      shuffle(arr) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(this.next() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; } return a; },
      gauss(mu = 0, sigma = 1) { let u = 0, v = 0; while (u === 0) u = this.next(); while (v === 0) v = this.next(); return mu + sigma * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); },
      poisson(l) { const L = Math.exp(-l); let k = 0, p = 1; do { k++; p *= this.next(); } while (p > L); return k - 1; },
      weighted(items, wf) { const ws = items.map(wf); const tot = ws.reduce((s, x) => s + x, 0) || 1; let r = this.next() * tot; for (let i = 0; i < items.length; i++) { r -= ws[i]; if (r <= 0) return items[i]; } return items[items.length - 1]; }
    };
    return rng;
  }
  function randomSeed() {
    try { if (typeof crypto !== "undefined" && crypto.getRandomValues) { const a = new Uint32Array(1); crypto.getRandomValues(a); return a[0] >>> 0; } } catch (e) {}
    return (Math.floor(Date.now()) ^ Math.floor(Math.random() * 0xffffffff)) >>> 0;
  }
  function subRng(seed, label) { return createRng(xmur3(String(seed) + "|" + String(label))()); }
  return { createRng, mulberry32, xmur3, toSeed, randomSeed, subRng };
});

/* ===== engine.js ===== */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.ENGINE = api;
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const range = (a, b) => { const r = []; for (let i = a; i <= b; i++) r.push(i); return r; };
  const _src = (rng) => (rng && typeof rng.next === "function" ? () => rng.next() : Math.random);
  function normCdf(x) { const t = 1 / (1 + 0.2316419 * Math.abs(x)); const d = 0.3989423 * Math.exp(-x * x / 2); const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274)))); return x > 0 ? 1 - p : p; }
  function gauss(rng, mu = 0, sigma = 1) { const r = _src(rng); let u = 0, v = 0; while (u === 0) u = r(); while (v === 0) v = r(); return mu + sigma * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
  function matchProbs(R) { let pW = clamp(0.015 * (R - 40), 0.05, 0.83); if (R > 86) pW += 0.018 * (R - 86); if (R < 82) pW -= 0.026 * (82 - R); pW = clamp(pW, 0.02, 0.945); const rem = 1 - pW; let pD = clamp(0.34 - 0.0028 * (R - 50), 0.06, 0.34); pD = Math.min(pD, rem * 0.60); return { pW, pD, pL: Math.max(0, rem - pD) }; }
  function seasonStats(R) { const { pW, pD } = matchProbs(R); const muMatch = 3 * pW + pD; const varMatch = 9 * pW + pD - muMatch * muMatch; return { mean: 38 * muMatch, sd: Math.sqrt(38 * varMatch), pW, pD }; }
  function probAtLeast(R, pts) { const { mean, sd } = seasonStats(R); return 1 - normCdf((pts - 0.5 - mean) / sd); }
  function simulateSeason(R, games = 38, rng) { const { pW, pD } = matchProbs(R); const r = _src(rng); let w = 0, d = 0, l = 0; for (let i = 0; i < games; i++) { const x = r(); if (x < pW) w++; else if (x < pW + pD) d++; else l++; } return { w, d, l, pts: 3 * w + d }; }
  function applyResultMods(season, n) { let { w, d, l } = season; let steps = Math.abs(n); const up = n > 0; while (steps-- > 0) { if (up) { if (d > 0) { d--; w++; } else if (l > 0) { l--; w++; } else break; } else { if (w > 0) { w--; d++; } else if (d > 0) { d--; l++; } else break; } } return { w, d, l, pts: 3 * w + d }; }
  function computeScoreTotal({ board, R, pts, rank, perfect, championsWon }) {
    R = R || 0; pts = pts || 0; rank = rank == null ? 12 : rank; let total = 0;
    if (board === "ultimo") { total = Math.round((110 - R) * 10) + Math.max(0, 114 - pts) * 3 + Math.max(0, rank) * 25; if (rank === 20) total += 1000; else if (rank >= 18) total += 500; }
    else if (board === "sesto") { total = Math.round((110 - R) * 10) + Math.max(0, 14 - Math.abs(rank - 2)) * 25; if (rank === 2) total += 1000; }
    else { total = Math.round(Math.min(R, 99) * 10) + pts * 3 + Math.max(0, 21 - rank) * 25; if (rank === 1) total += 300; if (perfect) total += 1000; if (championsWon) total += 3000; }
    return Math.max(0, Math.round(total));
  }
  const RNG = (typeof require !== "undefined") ? require("./rng.js") : (typeof self !== "undefined" && self.RNG) ? self.RNG : null;
  const DEFENSIVE_ROLES = ["DC", "TD", "TS", "ED", "ES", "POR"];
  const AFFINITY_PAIRS = [];
  function eligiblePool(slot, state, DB, excludeNames, rng) { excludeNames = excludeNames || []; const max = state.diff.max == null ? 99 : state.diff.max; const rndFn = _src(rng); return DB.filter((p) => p.rating >= state.diff.min && p.rating <= max && (!state.flags || !state.flags.portafojata || p.rating >= 80) && p.ruoli.some((r) => slot.accepts.includes(r)) && !state.usedNames.has(p.nome) && !excludeNames.includes(p.nome + p.stagione) && (p.stagione !== "Hall of Fame" || rndFn() < 0.05)); }
  function applyAffinityBias(slot, pool, options, state, rng) { }
  function applyCoachBias(slot, pool, options, state, rng, DB) { }
  function applyPairEggBias(slot, pool, options, state, rng, PAIR_EGGS) { }
  function draftOffers(slot, pool, state, rng, optionsCount, deps) { const options = rng.shuffle(pool).slice(0, optionsCount); return options; }
  return { clamp, range, normCdf, gauss, matchProbs, seasonStats, probAtLeast, simulateSeason, applyResultMods, computeScoreTotal, eligiblePool, draftOffers };
});
const simulateSeason = ENGINE.simulateSeason;
const applyResultMods = ENGINE.applyResultMods;

/* ===== league.js ===== */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.LEAGUE = api;
})(typeof self !== "undefined" ? self : this, function () {
  const POOL = [
    ["Roma", 85], ["Inter", 89], ["Atalanta", 86], ["Juventus", 86], ["Milan", 85],
    ["Lazio", 83], ["Fiorentina", 82], ["Bologna", 82], ["Como", 80], ["Torino", 78],
    ["Udinese", 77], ["Genoa", 76], ["Parma", 75], ["Sassuolo", 75], ["Cagliari", 74],
    ["Hellas Verona", 73], ["Lecce", 72], ["Pisa", 71], ["Cremonese", 71],
  ];
  const GOAL_W = { ATT: 0.60, AS: 0.34, AD: 0.34, TRQ: 0.30, CC: 0.12, MED: 0.06, ED: 0.07, ES: 0.07, TD: 0.04, TS: 0.04, DC: 0.05, POR: 0 };
  let _rnd = Math.random;
  function useRng(rng) { _rnd = rng && typeof rng.next === "function" ? () => rng.next() : Math.random; }
  const ri = (a, b) => a + Math.floor(_rnd() * (b - a + 1));
  function poisson(l) { const L = Math.exp(-l); let k = 0, p = 1; do { k++; p *= _rnd(); } while (p > L); return k - 1; }
  function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(_rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  function weightedPick(items, wf) { const ws = items.map(wf); const tot = ws.reduce((s, x) => s + x, 0) || 1; let r = _rnd() * tot; for (let i = 0; i < items.length; i++) { r -= ws[i]; if (r <= 0) return items[i]; } return items[items.length - 1]; }
  const W34 = x => ({ 1: 25, 2: 40, 3: 25, 4: 10 }[x] || 1);

  function romaOpponents(rng) { useRng(rng); return shuffle(POOL.map(p => p[0])); }

  function buildRomaHalf(opts) {
    useRng(opts && opts.rng);
    const { wdl, team, mds, opps } = opts;
    const players = Object.values(team || {});
    const scorerPool = players.map(p => ({ p, w: (GOAL_W[(p.ruoli || [])[0]] ?? 0.05) * Math.pow((p.rating || 75) / 80, 2) }));
    const results = shuffle([...Array(wdl.w).fill("W"), ...Array(wdl.d).fill("D"), ...Array(wdl.l).fill("L")]);
    return mds.map((md, k) => {
      const res = results[k] || "D";
      const oppName = opps[(md - 1) % opps.length];
      const oppStr = (POOL.find(p => p[0] === oppName) || [oppName, 78])[1];
      const home = (md % 2) === 1; 
      const [gfR, gaR] = scoreFor(res);
      const events = [];
      for (let i = 0; i < gfR; i++) events.push({ team: "roma", minute: ri(1, 94) });
      for (let i = 0; i < gaR; i++) events.push({ team: "opp", minute: ri(1, 94) });
      events.sort((x, y) => x.minute - y.minute);
      events.forEach(e => {
        if (e.team !== "roma" || scorerPool.length === 0) return;
        const s = weightedPick(scorerPool, o => o.w).p;
        e.nome = s.nome; e.stagione = s.stagione;
      });
      return { md, opp: oppName, oppName, oppStr, home, gf: gfR, ga: gaR, res, events, scorers: events.filter(e => e.team === "roma").map(e => `${e.nome} ${e.minute}'`) };
    });
  }

  function scoreFor(res) {
    if (res === "W") { const gf = weightedPick([1, 2, 3, 4], W34); return [gf, ri(0, gf - 1)]; }
    if (res === "L") { const ga = weightedPick([1, 2, 3, 4], W34); return [ri(0, ga - 1), ga]; }
    const g = weightedPick([0, 1, 2], x => ({ 0: 30, 1: 50, 2: 20 }[x])); return [g, g];
  }

  const byName = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
  const cmp = (a, b) => (b.pts - a.pts) || ((b.gf - b.ga) - (a.gf - a.ga)) || (b.gf - a.gf) || byName(a.name, b.name);

  function simulate(opts) {
    useRng(opts && opts.rng);
    const romaMatches = opts.romaMatches || [];
    const table = Array.from({ length: 20 }, (_, i) => ({
      idx: i, name: i === 0 ? "Napoli" : POOL[i - 1][0],
      str: i === 0 ? 90 : POOL[i - 1][1] + (_rnd() * 5 - 2.5),
      pts: 0, gf: 0, ga: 0, isRoma: i === 0,
    }));
    const nameToIdx = {}; table.forEach(t => { nameToIdx[t.name] = t.idx; });

    const romaGoals = {};
    romaMatches.forEach(m => {
      const oppIdx = nameToIdx[m.oppName ?? m.opp];
      table[0].gf += m.gf; table[0].ga += m.ga;
      if (oppIdx != null) { table[oppIdx].gf += m.ga; table[oppIdx].ga += m.gf; }
      if (m.res === "W") table[0].pts += 3;
      else if (m.res === "D") { table[0].pts += 1; if (oppIdx != null) table[oppIdx].pts += 1; }
      else if (oppIdx != null) table[oppIdx].pts += 3;
      m.events.filter(e => e.team === "roma" && e.nome).forEach(e => {
        const key = e.nome + "|" + e.stagione;
        (romaGoals[key] = romaGoals[key] || { nome: e.nome, stagione: e.stagione, goals: 0 }).goals++;
      });
    });

    for (let i = 1; i < 20; i++) {
      for (let j = i + 1; j < 20; j++) {
        for (let leg = 0; leg < 2; leg++) {
          const h = leg === 0 ? i : j, a = leg === 0 ? j : i;
          const sh = table[h].str, sa = table[a].str;
          const lh = Math.max(0.15, 1.35 * Math.exp((sh - sa) * 0.045) + 0.15);
          const la = Math.max(0.15, 1.35 * Math.exp((sa - sh) * 0.045) - 0.05);
          const gh = Math.min(6, poisson(lh)), ga2 = Math.min(6, poisson(la));
          table[h].gf += gh; table[h].ga += ga2; table[a].gf += ga2; table[a].ga += gh;
          if (gh > ga2) table[h].pts += 3; else if (gh < ga2) table[a].pts += 3; else { table[h].pts++; table[a].pts++; }
        }
      }
    }

    const finalTable = table.slice().sort(cmp).map((t, i) => ({ pos: i + 1, name: t.name, pts: t.pts, gf: t.gf, ga: t.ga, gd: t.gf - t.ga, isRoma: t.isRoma, }));
    const romaRank = finalTable.findIndex(t => t.isRoma) + 1;
    const scorers = Object.values(romaGoals).sort((x, y) => y.goals - x.goals);
    return { table: finalTable, romaRank, scorers, topScorer: scorers[0] || null, keyMatches: pickKey(romaMatches), matches: romaMatches };
  }

  function pickKey(matches) {
    const scored = matches.map(m => {
      let s = 0; const tags = []; const margin = Math.abs(m.gf - m.ga);
      const lateRoma = m.events.filter(e => e.team === "roma" && e.minute >= 80);
      let run = 0, wasBehind = false;
      m.events.forEach(e => { run += e.team === "roma" ? 1 : -1; if (run < 0) wasBehind = true; });
      const comeback = wasBehind && m.res !== "L";
      if (comeback) { s += 5; tags.push("rimonta"); }
      if (m.res === "W" && margin === 1 && lateRoma.length) { s += 4; tags.push("extremis"); }
      if (m.res === "W" && margin >= 3) { s += 2; tags.push("manita"); }
      if (m.oppStr >= 84.5) { s += m.res === "W" ? 3 : m.res === "D" ? 1.5 : 0.4; tags.push("big"); }
      if ((m.swing || 0) >= 2) { s += 2.5; tags.push("sorpasso"); }
      if (m.md >= 33) s += 1.2; s += _rnd() * 0.6;
      return { m, s, tags, lateRoma, comeback, margin };
    });
    scored.sort((a, b) => b.s - a.s); return scored.filter(x => x.s >= 2).slice(0, 4).map(buildKey);
  }

  function buildKey(x) {
    const m = x.m; const score = m.home ? `${m.gf}-${m.ga}` : `${m.ga}-${m.gf}`;
    const opp = m.oppName + (m.home ? " (casa)" : " (trasferta)");
    const decisive = x.lateRoma && x.lateRoma.length ? x.lateRoma[x.lateRoma.length - 1] : null;
    let note;
    if (x.comeback) note = `Rimonta: da sotto a ${m.gf}-${m.ga}, ${m.res === "W" ? "ribaltata" : "riacciuffata"}`;
    else if (x.tags.includes("extremis") && decisive) note = `Decisa nel finale: gol di ${decisive.nome} al ${decisive.minute}'`;
    else if (x.tags.includes("manita")) note = `Spettacolo puro: ${m.gf}-${m.ga}`;
    else if (x.tags.includes("big")) note = m.res === "W" ? "Colpo grosso contro una big" : m.res === "D" ? "Pari pesante contro una big" : "Sfida da big andata male";
    else note = m.res === "W" ? "Vittoria pesante" : m.res === "D" ? "Pareggio" : "Sconfitta";
    if (x.tags.includes("sorpasso")) note += " · sorpasso in classifica";
    return { md: m.md, opp, score, res: m.res, note, scorers: m.events.filter(e => e.team === "roma").map(e => `${e.nome} ${e.minute}'`) };
  }
  return { simulate, romaOpponents, buildRomaHalf };
});

/* ===== champions.js ===== */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.CHAMPIONS = api;
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";
  const POOL = [
    ["Paris Saint-Germain", 99], ["Real Madrid", 98], ["Liverpool", 97], ["Barcellona", 97],
    ["Bayern Monaco", 96], ["Manchester City", 96], ["Arsenal", 95], ["Inter", 94],
    ["Chelsea", 93], ["Atlético Madrid", 92], ["Roma", 88], ["Bayer Leverkusen", 90],
    ["Tottenham", 89], ["Borussia Dortmund", 88], ["Atalanta", 87], ["Athletic Bilbao", 86],
    ["Newcastle", 86], ["Benfica", 85], ["Villarreal", 84], ["PSV Eindhoven", 84],
    ["Monaco", 83], ["Eintracht Francoforte", 83], ["Ajax", 82], ["Marsiglia", 82],
    ["Sporting CP", 81], ["Galatasaray", 80], ["Club Brugge", 79], ["Olympiacos", 78],
    ["Slavia Praga", 77], ["Union Saint-Gilloise", 76], ["Copenaghen", 75], ["Bodø/Glimt", 75],
    ["Qarabağ", 73], ["Pafos", 72], ["Kairat", 70],
  ];
  const HOME_BOOST = 0.08;
  const GOAL_W = { ATT: 0.60, AS: 0.34, AD: 0.34, TRQ: 0.30, CC: 0.12, MED: 0.06, ED: 0.07, ES: 0.07, TD: 0.04, TS: 0.04, DC: 0.05, POR: 0 };
  let _rnd = Math.random;
  function useRng(rng) { _rnd = rng && typeof rng.next === "function" ? () => rng.next() : Math.random; }
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const ri = (a, b) => a + Math.floor(_rnd() * (b - a + 1));
  function poisson(l) { const L = Math.exp(-l); let k = 0, p = 1; do { k++; p *= _rnd(); } while (p > L); return k - 1; }
  function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(_rnd() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function weightedPick(items, wf) { const ws = items.map(wf); const tot = ws.reduce((s, x) => s + x, 0) || 1; let r = _rnd() * tot; for (let i = 0; i < items.length; i++) { r -= ws[i]; if (r <= 0) return items[i]; } return items[items.length - 1]; }
  function lambdas(R, D, home) { const d = clamp(R - D, -30, 30); const hf = home ? HOME_BOOST : -HOME_BOOST; return { atk: clamp(1.30 * Math.exp(0.043 * d) * (1 + hf), 0.18, 6), def: clamp(1.30 * Math.exp(-0.043 * d) * (1 - hf * 0.5), 0.18, 6), }; }
  function goalMinutes(n, maxMin) { maxMin = maxMin || 90; const set = {}; const out = []; let guard = 0; while (out.length < n && guard++ < 200) { const m = ri(1, maxMin); if (!set[m]) { set[m] = 1; out.push(m); } } return out.sort((a, b) => a - b); }
  function assignScorers(goals, team) { if (!team || goals === 0) return []; const outfield = Object.values(team).filter(p => (p.ruoli || [])[0] !== "POR"); if (!outfield.length) return []; const scorers = []; for (let i = 0; i < goals; i++) { const p = weightedPick(outfield, (pl) => (GOAL_W[(pl.ruoli || [])[0]] || 0.05) * Math.pow((pl.rating || 75) / 80, 2)); scorers.push(p.nome); } return scorers; }
  function playMatch(R, D, home, team) { const lam = lambdas(R, D, home); const gf = poisson(lam.atk); const ga = poisson(lam.def); return { gf, ga, romaMin: goalMinutes(gf), oppMin: goalMinutes(ga), scorers: assignScorers(gf, team), home }; }
  function T(name, diff, isRoma) { return { name: name, diff: diff, isRoma: !!isRoma }; }
  
  function playFinal(t1, t2, romaTeam) {
    const r1 = t1.diff, r2 = t2.diff; const hasRoma = t1.isRoma || t2.isRoma;
    const m = playMatch(r1, r2, false, t1.isRoma ? romaTeam : null);
    const leg1 = { gf: m.gf, ga: m.ga, romaMin: t1.isRoma ? m.romaMin : m.oppMin, oppMin: t1.isRoma ? m.oppMin : m.romaMin, scorers: t1.isRoma ? m.scorers : assignScorers(m.ga, romaTeam), };
    let winner, et = null, pens = null;
    if (m.gf > m.ga) { winner = t1; } else if (m.gf < m.ga) { winner = t2; } else {
      const etRoll = _rnd(); let etGf, etGa;
      if (etRoll < 0.333) { etGf = ri(1, 2); etGa = 0; } else if (etRoll < 0.666) { etGf = 0; etGa = ri(1, 2); } else { const g = ri(0, 1); etGf = g; etGa = g; }
      const etT1Min = goalMinutes(etGf, 120).map(mn => mn + 90); const etT2Min = goalMinutes(etGa, 120).map(mn => mn + 90);
      const romaEtGoals = t1.isRoma ? etGf : etGa; const etScorers = assignScorers(romaEtGoals, romaTeam);
      et = { gf: etGf, ga: etGa, romaMin: t1.isRoma ? etT1Min : etT2Min, oppMin: t1.isRoma ? etT2Min : etT1Min, scorers: etScorers, };
      if (etGf > etGa) { winner = t1; } else if (etGf < etGa) { winner = t2; } else {
        const t1wins = _rnd() < 0.5; winner = t1wins ? t1 : t2; const sc = [[5, 4], [4, 3], [4, 2], [3, 2]][ri(0, 3)];
        pens = t1wins ? { t1: sc[0], t2: sc[1] } : { t1: sc[1], t2: sc[0] };
      }
    }
    return { round: "finale", team1: t1, team2: t2, singleLeg: true, leg1, leg2: null, agg: { gf: m.gf + (et ? et.gf : 0), ga: m.ga + (et ? et.ga : 0) }, et, pens, winner, hasRoma, };
  }

  function playTie(t1, t2, round, romaTeam) {
    const r1 = t1.diff, r2 = t2.diff; const hasRoma = t1.isRoma || t2.isRoma;
    const leg1Raw = playMatch(r1, r2, true, t1.isRoma ? romaTeam : null);
    const leg2Raw = playMatch(r2, r1, true, t2.isRoma ? romaTeam : null);
    const leg1 = { gf: leg1Raw.gf, ga: leg1Raw.ga, romaMin: t1.isRoma ? leg1Raw.romaMin : leg1Raw.oppMin, oppMin: t1.isRoma ? leg1Raw.oppMin : leg1Raw.romaMin, scorers: t1.isRoma ? leg1Raw.scorers : assignScorers(leg1Raw.ga, romaTeam), };
    const leg2 = { gf: leg2Raw.ga, ga: leg2Raw.gf, romaMin: t1.isRoma ? leg2Raw.oppMin : leg2Raw.romaMin, oppMin: t1.isRoma ? leg2Raw.romaMin : leg2Raw.oppMin, scorers: t1.isRoma ? assignScorers(leg2Raw.ga, romaTeam) : leg2Raw.scorers, home: false, };
    const aggGf = leg1.gf + leg2.gf; const aggGa = leg1.ga + leg2.ga;
    let winner, et = null, pens = null;
    if (aggGf > aggGa) { winner = t1; } else if (aggGf < aggGa) { winner = t2; } else {
      const etRoll = _rnd(); let etGf, etGa;
      if (etRoll < 0.333) { etGf = ri(1, 2); etGa = 0; } else if (etRoll < 0.666) { etGf = 0; etGa = ri(1, 2); } else { const g = ri(0, 1); etGf = g; etGa = g; }
      const etT1Min = goalMinutes(etGf, 120).map(m => m + 90); const etT2Min = goalMinutes(etGa, 120).map(m => m + 90);
      const romaEtGoals = t1.isRoma ? etGf : etGa; const etScorers = assignScorers(romaEtGoals, romaTeam);
      et = { gf: etGf, ga: etGa, romaMin: t1.isRoma ? etT1Min : etT2Min, oppMin: t1.isRoma ? etT2Min : etT1Min, scorers: etScorers, };
      if (etGf > etGa) { winner = t1; } else if (etGf < etGa) { winner = t2; } else {
        const t1wins = _rnd() < 0.5; winner = t1wins ? t1 : t2; const sc = [[5, 4], [4, 3], [4, 2], [3, 2]][ri(0, 3)];
        pens = t1wins ? { t1: sc[0], t2: sc[1] } : { t1: sc[1], t2: sc[0] };
      }
    }
    return { round, team1: t1, team2: t2, leg1: { gf: leg1.gf, ga: leg1.ga, romaMin: leg1.romaMin, oppMin: leg1.oppMin, scorers: leg1.scorers }, leg2: { gf: leg2.gf, ga: leg2.ga, romaMin: leg2.romaMin, oppMin: leg2.oppMin, scorers: leg2.scorers }, agg: { gf: aggGf, ga: aggGa }, et, pens, winner, hasRoma, };
  }

  const ITALIAN = ["Inter", "Juventus", "Atalanta"];
  function drawGroupOpponents() {
    const eligible = POOL.filter(t => ITALIAN.indexOf(t[0]) < 0);
    const sorted = eligible.slice().sort((a, b) => b[1] - a[1]);
    const q = Math.ceil(sorted.length / 4);
    const pots = [sorted.slice(0, q), sorted.slice(q, q * 2), sorted.slice(q * 2, q * 3), sorted.slice(q * 3)];
    const opps = [];
    for (const pot of pots) { const s = shuffle(pot); opps.push(s[0], s[1]); }
    return shuffle(opps);
  }

  function simulate(opts) {
    const R = (opts && opts.R) || 0; const team = (opts && opts.team) || null; useRng(opts && opts.rng);
    const oppNames = drawGroupOpponents(); const homeFlags = shuffle([true, true, true, true, false, false, false, false]);
    const matches = []; let pts = 0, gf = 0, ga = 0;
    for (let i = 0; i < oppNames.length; i++) {
      const opp = oppNames[i]; const home = homeFlags[i]; const m = playMatch(R, opp[1], home, team);
      const res = m.gf > m.ga ? "W" : m.gf < m.ga ? "L" : "D";
      pts += res === "W" ? 3 : res === "D" ? 1 : 0; gf += m.gf; ga += m.ga;
      matches.push({ opp: opp[0], oppDiff: opp[1], gf: m.gf, ga: m.ga, res, romaMin: m.romaMin, oppMin: m.oppMin, scorers: m.scorers, home });
    }
    const allDiffs = POOL.map(t => t[1]).concat([R]);
    const tableOthers = POOL.map(t => {
      let p = 0, d = 0;
      for (let i = 0; i < 8; i++) {
        const D = allDiffs[ri(0, allDiffs.length - 1)]; const lam = lambdas(t[1], D, i < 4);
        const a = poisson(lam.atk), b = poisson(lam.def); p += a > b ? 3 : a === b ? 1 : 0; d += a - b;
      }
      return { name: t[0], diff: t[1], pts: p, gd: d };
    });
    const roma = { name: "Napoli", diff: R, pts, gd: gf - ga, isRoma: true };
    const table = tableOthers.concat([roma]).sort((x, y) => y.pts - x.pts || y.gd - x.gd || y.diff - x.diff);
    for (let i = 0; i < table.length; i++) table[i].pos = i + 1;
    const rank = table.findIndex(t => t.isRoma) + 1;
    let route; if (rank <= 8) route = "ottavi"; else if (rank <= 24) route = "sedicesimi"; else route = "out";

    function collectStats(groupMatches, romaTies) {
      const goals = {}; const addGoals = (scorers) => { (scorers || []).forEach(n => { goals[n] = (goals[n] || 0) + 1; }); };
      groupMatches.forEach(m => addGoals(m.scorers));
      (romaTies || []).forEach(ko => { if (ko.leg1) addGoals(ko.leg1.scorers); if (ko.leg2) addGoals(ko.leg2.scorers); if (ko.et) addGoals(ko.et.scorers); });
      const entries = Object.entries(goals).map(([nome, g]) => ({ nome, goals: g }));
      entries.sort((a, b) => b.goals - a.goals);
      const topScorer = entries[0] || null; const totalGf = entries.reduce((s, e) => s + e.goals, 0);
      const matchesPlayed = groupMatches.length + (romaTies || []).length * 2;
      return { topScorer, scorers: entries, totalGf, matchesPlayed };
    }

    if (route === "out") {
      const stats = collectStats(matches, []);
      return { qualified: true, leaguePhase: { matches, table, pts, gf, ga, rank, route }, bracket: {}, romaTies: [], stats, won: false, };
    }

    const qualified = table.slice(0, 24).map(t => T(t.name, t.diff, t.isRoma));
    const top8 = qualified.slice(0, 8); const mid16 = qualified.slice(8, 24);
    const sedicesimi = []; for (let i = 0; i < 8; i++) { sedicesimi.push(playTie(mid16[i], mid16[15 - i], "sedicesimi", team)); }
    const ottavi = []; for (let i = 0; i < 8; i++) { ottavi.push(playTie(top8[i], sedicesimi[7 - i].winner, "ottavi", team)); }
    const quarti = []; for (let i = 0; i < 4; i++) { quarti.push(playTie(ottavi[i * 2].winner, ottavi[i * 2 + 1].winner, "quarti", team)); }
    const semifinale = []; for (let i = 0; i < 2; i++) { semifinale.push(playTie(quarti[i * 2].winner, quarti[i * 2 + 1].winner, "semifinale", team)); }
    const finale = [playFinal(semifinale[0].winner, semifinale[1].winner, team)];
    const champion = finale[0].winner;

    const romaTies = [];
    for (const arr of [sedicesimi, ottavi, quarti, semifinale, finale]) { const t = arr.find(x => x.hasRoma); if (t) romaTies.push(t); }
    const stats = collectStats(matches, romaTies);
    const lastRound = romaTies.length ? romaTies[romaTies.length - 1].round : (route === "out" ? null : route);

    return { qualified: true, leaguePhase: { matches, table, pts, gf, ga, rank, route }, bracket: { sedicesimi, ottavi, quarti, semifinale, finale }, romaTies, champion, stats, lastRound, won: champion.isRoma, };
  }
  function isEligible(board, rank) { return (board === "classica" || board === "rogue" || board === "carriera") && rank != null && rank <= 4; }
  return { simulate, isEligible, POOL };
});

/* ===== patchnotes.js ===== */
(function () {
  "use strict";
  const LATEST = "1.0";
  const PATCH_NOTES = [
    {
      version: "1.0",
      date: "Oggi",
      title: "Benvenuti a 38·0 NAPOLI",
      theme: "cards",
      items: [
        "<strong>Modalità Carriera</strong>: guida il Napoli per 10 stagioni di fila.",
        "<strong>Nuove carte</strong>: il draft ha un design tutto nuovo. Carte Prime e Hall of Fame (Maradona, Careca, ecc.) per farti sognare.",
        "<strong>Impossibile Azzurro</strong>: bonus come 'San Gennà, pienzace tu' o imprevisti come 'Ammutinamento nello spogliatoio'. Tutto può succedere a Fuorigrotta.",
      ],
    }
  ];

  const SEEN_KEY = "napoli380_seen_patch";
  const getSeen = () => { try { return localStorage.getItem(SEEN_KEY) || ""; } catch (e) { return ""; } };
  const setSeen = (v) => { try { localStorage.setItem(SEEN_KEY, v); } catch (e) {} };

  let overlay = null;
  const onKey = (e) => { if (e.key === "Escape") close(); };

  function build(note) {
    const items = note.items.map((t) => "<li>" + t + "</li>").join("");
    overlay = document.createElement("div");
    overlay.className = "info-modal patch-modal" + (note.theme ? " patch-" + note.theme : "");
    overlay.innerHTML =
      '<div class="info-modal__backdrop" data-close></div>' +
      '<div class="info-modal__card" role="dialog" aria-modal="true">' +
        '<button type="button" class="info-modal__x" data-close>✕</button>' +
        '<span class="info-modal__tag">Novità · v' + note.version + '</span>' +
        '<h3 class="info-modal__title">' + note.title + '</h3>' +
        '<div class="info-modal__body"><ul class="patch-list">' + items + '</ul></div>' +
        '<button type="button" class="btn primary info-modal__play" data-close>JAMM</button>' +
      '</div>';
    document.body.appendChild(overlay);
    overlay.querySelectorAll("[data-close]").forEach((el) => el.addEventListener("click", close));
  }

  function open(note, markSeen) {
    if (!overlay) build(note);
    else overlay.hidden = false;
    document.addEventListener("keydown", onKey);
    if (markSeen) setSeen(note.version);
  }

  function close() {
    if (overlay) overlay.hidden = true;
    document.removeEventListener("keydown", onKey);
  }

  window.PATCHNOTES = {
    LATEST: LATEST, notes: PATCH_NOTES,
    init() {
      const latest = PATCH_NOTES[0];
      if (latest && getSeen() !== latest.version) { open(latest, true); }
    },
    show() { const l = PATCH_NOTES[0]; if (l) open(l, true); },
  };
  
})();

