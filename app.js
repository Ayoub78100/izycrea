/* IzyCréa — routeur, recherche, pages de contenu */
(function () {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const app = $('#app');
  const FICHES = window.IZY_FICHES || [];
  const THEMES = window.IZY_THEMES || [];
  const theme = id => THEMES.find(t => t.id === id) || { label: id, icon: '•' };
  const BADGES = {
    vigueur: 'Texte en vigueur', decret: 'Nouvelles règles', variable: 'Pratique variable selon FT', discussion: 'Texte en discussion'
  };
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const norm = s => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const fmtDate = d => new Date(d + 'T12:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  const badge = b => `<span class="badge ${b}">${BADGES[b] || b}</span>`;

  /* ---------- outils (déclarés ici, rendus par tools.js) ---------- */
  const TOOLS = [
    { id: 'bmc', t: 'Business model canvas', d: "Les 9 blocs du modèle économique sur une page, export PDF prêt à présenter.", ico: '🧩', g: 'g1', tag: 'PDF' },
    { id: 'previsionnel-micro', t: 'Prévisionnel micro-entreprise', d: "Chiffre d'affaires, cotisations 2026, Acre, versement libératoire, ARE et prime création : le revenu réel du porteur sur 3 ans.", ico: '📈', g: 'g2', tag: 'Excel · PDF' },
    { id: 'previsionnel-complet', t: 'Prévisionnel complet 3 ans', d: "Plan de financement, compte de résultat, seuil de rentabilité, BFR et trésorerie : le format attendu par la banque.", ico: '🏦', g: 'g3', tag: 'Excel · PDF' },
    { id: 'dossier', t: 'Dossier de présentation', d: "Le projet présenté proprement pour la commission ou le financeur, avec les chiffres du prévisionnel.", ico: '📄', g: 'g4', tag: 'PDF' }
  ];
  window.IZY_TOOL_LIST = TOOLS;

  /* ---------- index de recherche ---------- */
  const INDEX = [];
  FICHES.forEach(f => INDEX.push({ k: 'Fiche', t: f.titre, d: f.resume, href: '#/fiche/' + f.id, hay: norm([f.titre, f.resume, f.motscles, theme(f.theme).label, f.contenu.replace(/<[^>]+>/g, ' ')].join(' ')), w: 3 }));
  TOOLS.forEach(t => INDEX.push({ k: 'Outil', t: t.t, d: t.d, href: '#/outils/' + t.id, hay: norm(t.t + ' ' + t.d + ' outil export excel pdf'), w: 2 }));
  (window.IZY_METIERS || []).forEach(([m, c]) => INDEX.push({ k: 'Dossier métier', t: m, d: 'Dossier projecteur Bpifrance — ' + c, href: '#/projecteurs?q=' + encodeURIComponent(m), hay: norm(m + ' ' + c + ' dossier projecteur bpi metier'), w: 1 }));
  (window.IZY_RESSOURCES || []).forEach(g => g.items.forEach(r => INDEX.push({ k: 'Ressource', t: r.t, d: r.d, href: r.u, ext: true, hay: norm(r.t + ' ' + r.d + ' ' + g.cat), w: 1 })));

  function search(q, limit = 12) {
    const terms = norm(q).split(/\s+/).filter(x => x.length > 1);
    if (!terms.length) return [];
    return INDEX.map(it => {
      let s = 0;
      for (const term of terms) {
        const inT = norm(it.t).includes(term);
        const c = it.hay.split(term).length - 1;
        if (!c && !inT) return null;
        s += c + (inT ? 6 : 0);
      }
      return { it, s: s * it.w };
    }).filter(Boolean).sort((a, b) => b.s - a.s).slice(0, limit).map(x => x.it);
  }
  function hl(text, q) {
    let out = esc(text);
    norm(q).split(/\s+/).filter(x => x.length > 1).forEach(term => {
      const nt = norm(out);
      let idx = nt.indexOf(term), res = '', last = 0;
      while (idx > -1) { res += out.slice(last, idx) + '<mark>' + out.slice(idx, idx + term.length) + '</mark>'; last = idx + term.length; idx = nt.indexOf(term, last); }
      out = res + out.slice(last);
    });
    return out;
  }

  /* ---------- pages ---------- */
  function home() {
    const latest = [...FICHES].slice(0, 8);
    const ex = ['ARCE', 'Acre 2026', 'congé de reclassement', 'seuils micro', 'franchise TVA', 'cumul emploi-retraite'];
    return `
    <section class="hero">
      <div class="grid-bg"></div><div class="blob b1"></div><div class="blob b2"></div><div class="blob b3"></div>
      <div class="wrap hero-in">
        <span class="pill rv"><i></i> Mis à jour le ${fmtDate('2026-11-23')} · chiffres 2026</span>
        <h1 class="rv">L'accompagnement création,<br><span class="grad-txt">en version izy.</span></h1>
        <p class="lead rv">Une base de connaissances sourcée et des outils qui sortent le prévisionnel, le business model et le dossier de présentation de vos porteurs de projet. Pour les consultants, tous cabinets confondus.</p>
        <form class="bigsearch rv" id="heroSearch" autocomplete="off">
          <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
          <input id="heroQ" aria-label="Rechercher" placeholder="">
          <button type="submit">Rechercher</button>
        </form>
        <div class="chips rv">${ex.map(e => `<a class="chip" href="#/base?q=${encodeURIComponent(e)}">${e}</a>`).join('')}</div>
        <div class="stats rv">
          <div class="stat"><b data-count="${FICHES.length}">0</b><span>fiches sourcées</span></div>
          <div class="stat"><b data-count="4">0</b><span>outils d'export</span></div>
          <div class="stat"><b data-count="${(window.IZY_METIERS || []).length}">0</b><span>dossiers métiers</span></div>
          <div class="stat"><b>0 €</b><span>et rien stocké en ligne</span></div>
        </div>
      </div>
    </section>

    <section class="block">
      <div class="wrap">
        <div class="sec-head rv"><div><div class="eyebrow">Outils</div><h2>Du projet au dossier, en un après-midi</h2></div><p>Saisie guidée, calculs à jour des taux 2026, exports Excel avec formules et PDF prêts à envoyer.</p></div>
        <div class="cards">${TOOLS.map((t, i) => `
          <a class="card tool-card rv" style="transition-delay:${i * 60}ms" href="#/outils/${t.id}">
            <span class="tag">${t.tag}</span><span class="ico ${t.g}">${t.ico}</span>
            <h3>${t.t}</h3><p>${t.d}</p><span class="go">Ouvrir l'outil</span>
          </a>`).join('')}</div>
      </div>
    </section>

    <section class="block soft">
      <div class="wrap">
        <div class="sec-head rv"><div><div class="eyebrow">Base de connaissances</div><h2>Les vraies questions du terrain</h2></div><a class="btn" href="#/base">Toutes les fiches →</a></div>
        <div class="cards">${latest.map((f, i) => `
          <a class="card rv" style="transition-delay:${i * 50}ms" href="#/fiche/${f.id}">
            <div class="meta">${badge(f.badge)}<span>${theme(f.theme).icon} ${theme(f.theme).label}</span></div>
            <h3>${esc(f.titre)}</h3><p>${esc(f.resume)}</p><span class="go">Lire la fiche</span>
          </a>`).join('')}</div>
      </div>
    </section>

    <section class="block">
      <div class="wrap">
        <div class="sec-head rv"><div><div class="eyebrow">Méthode</div><h2>Un fil conducteur pour chaque accompagnement</h2></div></div>
        <div class="steps-h">
          <div class="step-h rv"><h3>Valider la personne et l'idée</h3><p>Motivations, contraintes, santé, dossier métier Bpifrance.</p></div>
          <div class="step-h rv" style="transition-delay:60ms"><h3>Construire le modèle</h3><p>Business model canvas, cible, prix, canaux.</p></div>
          <div class="step-h rv" style="transition-delay:120ms"><h3>Chiffrer et sécuriser</h3><p>Prévisionnel, statut, ARCE ou ARE, Acre, prime PSE.</p></div>
          <div class="step-h rv" style="transition-delay:180ms"><h3>Présenter et financer</h3><p>Dossier de présentation, prêt d'honneur, banque.</p></div>
        </div>
      </div>
    </section>

    <section class="block soft">
      <div class="wrap">
        <div class="sec-head rv"><div><div class="eyebrow">Dossiers projecteurs</div><h2>Le bon dossier métier en un clic</h2></div><a class="btn" href="#/projecteurs">Voir l'annuaire →</a></div>
      </div>
      <div class="marquee rv"><div class="marquee-track">${[...(window.IZY_METIERS || []), ...(window.IZY_METIERS || [])].map(([m]) => `<a class="chip" href="#/projecteurs?q=${encodeURIComponent(m)}">${esc(m)}</a>`).join('')}</div></div>
    </section>`;
  }

  function base(params) {
    const q = params.get('q') || '';
    const th = params.get('theme') || '';
    const counts = {}; FICHES.forEach(f => counts[f.theme] = (counts[f.theme] || 0) + 1);
    return `
    <div class="phead"><div class="blob b1"></div><div class="blob b2"></div><div class="wrap">
      <div class="eyebrow">Base de connaissances</div><h1 style="font-size:clamp(1.9rem,3.6vw,2.8rem)">Toutes les fiches</h1>
      <p>Chaque fiche est datée, sourcée et porte un badge de fiabilité.</p></div></div>
    <div class="wrap layout">
      <aside class="side">
        <h4>Thèmes</h4>
        <button data-theme="" class="${!th ? 'on' : ''}">✨ Tout <span class="n">${FICHES.length}</span></button>
        ${THEMES.filter(t => counts[t.id]).map(t => `<button data-theme="${t.id}" class="${th === t.id ? 'on' : ''}">${t.icon} ${t.label}<span class="n">${counts[t.id]}</span></button>`).join('')}
        <div class="legend">${Object.keys(BADGES).map(b => badge(b)).join('')}</div>
      </aside>
      <div>
        <div class="filter-in"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><input id="baseQ" value="${esc(q)}" placeholder="Filtrer les fiches…" aria-label="Filtrer les fiches"></div>
        <div class="list" id="baseList"></div>
      </div>
    </div>`;
  }
  function renderBaseList() {
    const q = $('#baseQ')?.value || '';
    const th = ($('.side button.on')?.dataset.theme) || '';
    let items = FICHES.filter(f => !th || f.theme === th);
    if (q.trim()) {
      const hits = search(q, 100).filter(h => h.k === 'Fiche').map(h => h.href.split('/').pop());
      items = hits.map(id => items.find(f => f.id === id)).filter(Boolean);
    }
    $('#baseList').innerHTML = items.length ? items.map((f, i) => `
      <a class="row page-enter" style="animation-delay:${i * 30}ms" href="#/fiche/${f.id}">
        <span class="ico g${(i % 4) + 1}">${theme(f.theme).icon}</span>
        <div><h3>${hl(f.titre, q)}</h3><p>${hl(f.resume, q)}</p></div>${badge(f.badge)}
      </a>`).join('') : `<div class="empty">Aucune fiche ne correspond. Essayez un autre mot ou <a href="#/ressources">les ressources externes</a>.</div>`;
  }

  function fiche(id) {
    const f = FICHES.find(x => x.id === id);
    if (!f) return notFound();
    const related = FICHES.filter(x => x.theme === f.theme && x.id !== f.id).slice(0, 4);
    return `
    <div class="wrap fiche">
      <article>
        <div class="crumbs"><a href="#/base">Base</a> / <a href="#/base?theme=${f.theme}">${theme(f.theme).label}</a></div>
        <div class="meta">${badge(f.badge)}<span>Vérifiée le ${fmtDate(f.maj)}</span></div>
        <h1 style="margin-top:14px">${esc(f.titre)}</h1>
        <p class="resume">${esc(f.resume)}</p>
        <div class="prose">${f.contenu}</div>
        <h3 style="margin-top:36px">Sources</h3>
        <ul class="prose">${f.sources.map(s => `<li><a href="${s.u}" target="_blank" rel="noopener">${esc(s.t)} ↗</a></li>`).join('')}</ul>
        <p class="muted" style="font-size:.85rem;margin-top:28px">Information générale, ne remplace pas l'avis d'un professionnel ni la décision de l'organisme concerné.</p>
      </article>
      <aside><div class="aside-box">
        <h4>Dans le même thème</h4>
        <ul>${related.map(r => `<li><a href="#/fiche/${r.id}">${esc(r.titre)}</a></li>`).join('') || '<li class="muted">—</li>'}</ul>
        <h4 style="margin-top:18px">Outils utiles</h4>
        <ul><li><a href="#/outils/previsionnel-micro">Prévisionnel micro</a></li><li><a href="#/outils/previsionnel-complet">Prévisionnel complet</a></li><li><a href="#/outils/dossier">Dossier de présentation</a></li></ul>
        <div class="legend">${badge(f.badge)}<span>${{ vigueur: "La règle est en vigueur et vérifiée sur une source officielle.", decret: "Règles récentes : relire la source avant un rendez-vous.", variable: "Le texte laisse une marge d'appréciation à France Travail : informer sans garantir.", discussion: "Le texte n'est pas encore adopté : ne rien affirmer." }[f.badge]}</span></div>
      </div></aside>
    </div>`;
  }

  function projecteurs(params) {
    const q = params.get('q') || '';
    return `
    <div class="phead"><div class="blob b1"></div><div class="blob b2"></div><div class="wrap">
      <div class="eyebrow">Dossiers projecteurs</div><h1 style="font-size:clamp(1.9rem,3.6vw,2.8rem)">Dossiers métiers Bpifrance</h1>
      <p>Les dossiers projecteurs de Bpifrance Création décrivent le marché, la réglementation et les chiffres clés d'un métier. Le lien lance la recherche du dossier le plus récent sur le site de Bpifrance : vérifiez sa date, certains n'ont pas été mis à jour depuis longtemps.</p></div></div>
    <div class="wrap" style="padding:36px 24px 80px">
      <div class="filter-in"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><input id="projQ" value="${esc(q)}" placeholder="Rechercher un métier : VTC, gîte, coach…" aria-label="Rechercher un métier"></div>
      <div class="cards" id="projList"></div>
      <div class="callout" style="margin-top:28px">Métier absent de la liste ? <a href="https://bpifrance-creation.fr" target="_blank" rel="noopener">Chercher directement sur Bpifrance Création ↗</a></div>
    </div>`;
  }
  function renderProj() {
    const q = norm($('#projQ')?.value || '');
    const list = (window.IZY_METIERS || []).filter(([m, c]) => !q || norm(m + ' ' + c).includes(q));
    $('#projList').innerHTML = list.length ? list.map(([m, c], i) => {
      const u = 'https://www.google.com/search?q=' + encodeURIComponent('site:bpifrance-creation.fr dossier projecteur ' + m);
      return `<a class="card page-enter" style="animation-delay:${Math.min(i, 12) * 25}ms" href="${u}" target="_blank" rel="noopener"><div class="meta"><span>${esc(c)}</span></div><h3>${esc(m)}</h3><span class="go">Trouver le dossier ↗</span></a>`;
    }).join('') : `<div class="empty" style="grid-column:1/-1">Aucun métier trouvé.</div>`;
  }

  function ressources() {
    return `
    <div class="phead"><div class="blob b1"></div><div class="blob b2"></div><div class="wrap">
      <div class="eyebrow">Ressources</div><h1 style="font-size:clamp(1.9rem,3.6vw,2.8rem)">Les liens utiles</h1>
      <p>Les sites officiels, simulateurs et réseaux que les consultants utilisent au quotidien.</p></div></div>
    <div class="wrap" style="padding:36px 24px 80px">
      ${(window.IZY_RESSOURCES || []).map(g => `
        <h2 class="rv" style="font-size:1.3rem;margin:28px 0 14px">${esc(g.cat)}</h2>
        <div class="cards">${g.items.map(r => `<a class="card rv" href="${r.u}" target="_blank" rel="noopener"><h3 style="margin-top:0">${esc(r.t)}</h3><p>${esc(r.d)}</p><span class="go">Ouvrir ↗</span></a>`).join('')}</div>`).join('')}
    </div>`;
  }

  function outils() {
    return `
    <div class="phead"><div class="blob b1"></div><div class="blob b2"></div><div class="wrap">
      <div class="eyebrow">Outils</div><h1 style="font-size:clamp(1.9rem,3.6vw,2.8rem)">Les outils du consultant</h1>
      <p>Tout se calcule dans votre navigateur : rien n'est envoyé ni stocké en ligne. Pensez à exporter avant de fermer la page.</p></div></div>
    <div class="wrap" style="padding:36px 24px 80px"><div class="cards">${TOOLS.map((t, i) => `
      <a class="card tool-card rv" style="transition-delay:${i * 60}ms" href="#/outils/${t.id}"><span class="tag">${t.tag}</span><span class="ico ${t.g}">${t.ico}</span><h3>${t.t}</h3><p>${t.d}</p><span class="go">Ouvrir l'outil</span></a>`).join('')}</div></div>`;
  }

  function apropos() {
    return `
    <div class="phead"><div class="blob b1"></div><div class="blob b2"></div><div class="wrap"><div class="eyebrow">À propos</div><h1 style="font-size:clamp(1.9rem,3.6vw,2.8rem)">IzyCréa, comment ça marche</h1></div></div>
    <div class="wrap prose" style="padding:36px 24px 80px;max-width:820px">
      <h3>Pour qui ?</h3><p>Pour les consultants qui accompagnent des créateurs et repreneurs d'entreprise, notamment dans le cadre de PSE, RCC, congés de reclassement et de mobilité, quel que soit leur cabinet.</p>
      <h3>D'où viennent les informations ?</h3><p>Chaque fiche est rédigée à partir de sources officielles (service-public, Urssaf, France Travail, Unédic, impots.gouv, Bpifrance Création), datée et accompagnée de ses sources. Les badges indiquent le niveau de fiabilité : texte en vigueur, nouvelles règles, pratique variable selon France Travail, texte en discussion.</p>
      <h3>Les outils et vos données</h3><p>Les calculs sont faits dans votre navigateur. Rien n'est transmis ni conservé sur un serveur. Une sauvegarde locale facultative peut être conservée dans votre navigateur ; elle s'efface si vous videz vos données de navigation.</p>
      <h3>Limites</h3><p>IzyCréa fournit une information générale. Les prévisionnels sont des estimations fondées sur les hypothèses saisies : ils ne remplacent ni l'avis d'un expert-comptable, ni la décision de France Travail, de l'Urssaf ou d'un financeur. Les accords d'entreprise (PSE, RCC) ne sont pas publiés ici : la prime création se saisit manuellement dans les outils.</p>
      <h3>Une erreur, une fiche à ajouter ?</h3><p>Signalez-la à l'équipe qui maintient le site.</p>
    </div>`;
  }

  function notFound() {
    return `<div class="wrap" style="padding:120px 24px;text-align:center"><h1>Page introuvable</h1><p class="muted">Cette page n'existe pas ou a été déplacée.</p><a class="btn pri" href="#/">Retour à l'accueil</a></div>`;
  }

  /* ---------- routeur ---------- */
  function route() {
    const h = location.hash.replace(/^#/, '') || '/';
    const [path, qs] = h.split('?');
    const params = new URLSearchParams(qs || '');
    const parts = path.split('/').filter(Boolean);
    let html, after = null, nav = parts[0] || '';
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
    if (!parts.length) { html = home(); after = initHome; }
    else if (parts[0] === 'base') { html = base(params); after = initBase; }
    else if (parts[0] === 'fiche') { html = fiche(parts[1]); nav = 'base'; }
    else if (parts[0] === 'projecteurs') { html = projecteurs(params); after = () => { renderProj(); $('#projQ').addEventListener('input', renderProj); }; }
    else if (parts[0] === 'ressources') { html = ressources(); }
    else if (parts[0] === 'outils' && !parts[1]) { html = outils(); }
    else if (parts[0] === 'outils' && window.IZY_TOOLS && window.IZY_TOOLS[parts[1]]) { const t = window.IZY_TOOLS[parts[1]]; html = t.html(); after = t.init; nav = 'outils'; }
    else if (parts[0] === 'a-propos') { html = apropos(); }
    else html = notFound();
    app.innerHTML = `<div class="page-enter">${html}</div>`;
    $$('.nav a').forEach(a => a.classList.toggle('on', a.dataset.nav === nav));
    $('#nav').classList.remove('open'); $('#burger').classList.remove('on');
    const titleMap = { base: 'Base de connaissances', fiche: 'Fiche', projecteurs: 'Dossiers métiers', ressources: 'Ressources', outils: 'Outils', 'a-propos': 'À propos' };
    const f = parts[0] === 'fiche' && FICHES.find(x => x.id === parts[1]);
    document.title = (f ? f.titre : titleMap[parts[0]] ? titleMap[parts[0]] : "L'accompagnement création, en version izy") + ' · IzyCréa';
    if (after) after(params);
    reveal(); glow(); counters();
  }

  function initHome() {
    const input = $('#heroQ');
    const ph = ['Mon porteur peut-il toucher l\'ARCE ?', 'Acre 2026 : qui y a droit ?', 'Créer pendant un congé de reclassement', 'Seuils de la micro-entreprise', 'Franchise en base de TVA'];
    let i = 0, j = 0, del = false, timer;
    const tick = () => {
      if (document.activeElement === input || input.value) { input.placeholder = 'Rechercher une fiche, un outil, un métier…'; timer = setTimeout(tick, 600); return; }
      const w = ph[i];
      input.placeholder = w.slice(0, j);
      if (!del && j < w.length) j++; else if (!del) { del = true; timer = setTimeout(tick, 1400); return; }
      else if (j > 0) j--; else { del = false; i = (i + 1) % ph.length; }
      timer = setTimeout(tick, del ? 28 : 55);
    };
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) tick(); else input.placeholder = ph[0];
    window.addEventListener('hashchange', () => clearTimeout(timer), { once: true });
    $('#heroSearch').addEventListener('submit', e => { e.preventDefault(); openPalette(input.value); });
    input.addEventListener('focus', () => { if (!input.value) {} });
  }
  function initBase(params) {
    renderBaseList();
    $('#baseQ').addEventListener('input', renderBaseList);
    $$('.side button').forEach(b => b.addEventListener('click', () => { $$('.side button').forEach(x => x.classList.remove('on')); b.classList.add('on'); renderBaseList(); }));
  }

  /* ---------- effets ---------- */
  let io;
  function reveal() {
    io && io.disconnect();
    io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .12 });
    $$('.rv').forEach(el => io.observe(el));
  }
  function glow() {
    $$('.card').forEach(c => c.addEventListener('pointermove', e => { const r = c.getBoundingClientRect(); c.style.setProperty('--mx', (e.clientX - r.left) + 'px'); c.style.setProperty('--my', (e.clientY - r.top) + 'px'); }));
  }
  function counters() {
    $$('[data-count]').forEach(el => {
      const end = +el.dataset.count, t0 = performance.now(), d = 1100;
      const step = t => { const p = Math.min(1, (t - t0) / d); el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
    });
  }
  window.addEventListener('scroll', () => {
    const y = scrollY, h = document.documentElement.scrollHeight - innerHeight;
    $('#top').classList.toggle('scrolled', y > 8);
    $('#progress').style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
  }, { passive: true });

  /* ---------- palette de recherche ---------- */
  const pal = $('#palette'), pin = $('#paletteInput'), pres = $('#paletteRes');
  let sel = 0, cur = [];
  function openPalette(v = '') { pal.hidden = false; pin.value = v; renderPal(); setTimeout(() => pin.focus(), 20); }
  function closePalette() { pal.hidden = true; }
  function renderPal() {
    const q = pin.value;
    cur = q.trim() ? search(q, 10) : FICHES.slice(0, 6).map(f => ({ k: 'Fiche', t: f.titre, d: f.resume, href: '#/fiche/' + f.id }));
    sel = 0;
    pres.innerHTML = cur.length ? cur.map((r, i) => `<a class="pr ${i === 0 ? 'sel' : ''}" href="${r.href}" ${r.ext ? 'target="_blank" rel="noopener"' : ''}><div><span class="k">${r.k}</span><b>${hl(r.t, q)}</b><p>${hl(r.d, q)}</p></div></a>`).join('')
      : `<div class="empty" style="margin:8px">Aucun résultat pour « ${esc(q)} ».</div>`;
  }
  pin.addEventListener('input', renderPal);
  pin.addEventListener('keydown', e => {
    const items = $$('.pr', pres);
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); sel = (sel + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length; items.forEach((x, i) => x.classList.toggle('sel', i === sel)); items[sel]?.scrollIntoView({ block: 'nearest' }); }
    if (e.key === 'Enter' && items[sel]) { e.preventDefault(); items[sel].click(); closePalette(); }
  });
  pres.addEventListener('click', e => { if (e.target.closest('a')) closePalette(); });
  pal.addEventListener('click', e => { if (e.target === pal) closePalette(); });
  $('#openSearch').addEventListener('click', () => openPalette());
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !pal.hidden) closePalette();
    if ((e.key === '/' || (e.key === 'k' && (e.metaKey || e.ctrlKey))) && pal.hidden && !/input|textarea|select/i.test(document.activeElement.tagName)) { e.preventDefault(); openPalette(); }
  });
  $('#burger').addEventListener('click', () => { $('#nav').classList.toggle('open'); $('#burger').classList.toggle('on'); });

  window.izyToast = msg => { const t = $('#toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('on'), 2600); };
  window.izyRoute = route;
  window.addEventListener('hashchange', route);
  document.addEventListener('DOMContentLoaded', route);
})();
