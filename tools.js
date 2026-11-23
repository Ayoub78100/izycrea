/* IzyCréa — outils : prévisionnel micro, prévisionnel complet, business model canvas, dossier de présentation.
   Tous les calculs sont faits dans le navigateur. Rien n'est envoyé en ligne. */
(function () {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const num = v => { const n = parseFloat(String(v ?? '').replace(/\s/g, '').replace(',', '.')); return isFinite(n) ? n : 0; };
  const eur = n => (Math.round(n) || 0).toLocaleString('fr-FR') + ' €';
  const pct = n => (Math.round(n * 1000) / 10).toLocaleString('fr-FR') + ' %';
  const today = () => new Date().toLocaleDateString('fr-FR');
  const store = {
    get(k) { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } },
    del(k) { try { localStorage.removeItem(k); } catch (e) { } }
  };
  const ICON = {
    xls: '<svg viewBox="0 0 24 24"><path d="M4 4h16v16H4z"/><path d="m8 8 8 8M16 8l-8 8"/></svg>',
    pdf: '<svg viewBox="0 0 24 24"><path d="M6 2h9l5 5v15H6z"/><path d="M14 2v6h6"/></svg>',
    save: '<svg viewBox="0 0 24 24"><path d="M12 3v12m0 0-4-4m4 4 4-4M4 21h16"/></svg>',
    open: '<svg viewBox="0 0 24 24"><path d="M12 21V9m0 0-4 4m4-4 4 4M4 3h16"/></svg>',
    reset: '<svg viewBox="0 0 24 24"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg>',
    demo: '<svg viewBox="0 0 24 24"><path d="M12 3l2.5 5 5.5.8-4 3.9.9 5.5-4.9-2.6-4.9 2.6.9-5.5-4-3.9 5.5-.8z"/></svg>'
  };
  const toast = m => window.izyToast && window.izyToast(m);

  function head(eyebrow, title, sub) {
    return `<div class="phead no-print"><div class="blob b1"></div><div class="blob b2"></div><div class="wrap">
      <div class="crumbs no-print"><a href="#/outils">Outils</a> / ${esc(title)}</div>
      <div class="eyebrow">${eyebrow}</div><h1 style="font-size:clamp(1.8rem,3.4vw,2.6rem)">${title}</h1><p>${sub}</p></div></div>`;
  }
  function bar(extra = '') {
    return `<div class="tool-bar no-print">
      <button class="btn" data-act="demo">${ICON.demo}Charger un exemple</button>
      <button class="btn ghost" data-act="reset">${ICON.reset}Vider</button>
      <span style="flex:1"></span>
      <button class="btn ghost" data-act="savejson" title="Enregistrer le projet sur votre ordinateur">${ICON.save}Enregistrer</button>
      <button class="btn ghost" data-act="openjson" title="Rouvrir un projet enregistré">${ICON.open}Ouvrir</button>
      ${extra}
      <button class="btn" data-act="pdf">${ICON.pdf}PDF</button>
    </div>`;
  }
  const F = (id, label, o = {}) => {
    const t = o.type || 'number';
    const cls = 'f' + (o.wide ? ' wide' : '') + (o.pse ? ' pse' : '');
    const hint = o.hint ? ` <span class="hint">${o.hint}</span>` : '';
    if (t === 'select') return `<div class="${cls}"><label for="${id}">${label}${hint}</label><select id="${id}" data-k="${id}">${o.opts.map(([v, l]) => `<option value="${v}">${l}</option>`).join('')}</select></div>`;
    if (t === 'textarea') return `<div class="${cls}"><label for="${id}">${label}${hint}</label><textarea id="${id}" data-k="${id}" placeholder="${esc(o.ph || '')}"></textarea></div>`;
    return `<div class="${cls}"><label for="${id}">${label}${hint}</label><input id="${id}" data-k="${id}" type="${t}" ${t === 'number' ? 'step="any" inputmode="decimal"' : ''} placeholder="${esc(o.ph || '')}"></div>`;
  };

  /* ----- gestion d'état générique (champs data-k + lignes) ----- */
  function readFields(root) { const v = {}; $$('[data-k]', root).forEach(el => v[el.dataset.k] = el.type === 'checkbox' ? el.checked : el.value); return v; }
  function writeFields(root, v) { $$('[data-k]', root).forEach(el => { if (v && el.dataset.k in v) { if (el.type === 'checkbox') el.checked = !!v[el.dataset.k]; else el.value = v[el.dataset.k]; } }); }
  function linesUI(id, cols, rows) {
    const cls = { charges: '', inv: 'inv', loan: 'loan' }[id.split('-')[0]] || '';
    return `<div class="lines" id="${id}" data-cols='${JSON.stringify(cols)}'>
      <div class="line ${cls} line-head">${cols.map(c => `<span>${c.l}</span>`).join('')}<span></span></div>
      ${rows.map(r => lineRow(cols, r, cls)).join('')}
    </div><button class="add no-print" data-add="${id}">+ Ajouter une ligne</button>`;
  }
  function lineRow(cols, r = {}, cls = '') {
    return `<div class="line ${cls}" data-line>${cols.map(c => `<input data-c="${c.k}" ${c.t === 'text' ? 'type="text"' : 'type="number" step="any" inputmode="decimal"'} value="${esc(r[c.k] ?? '')}" placeholder="${esc(c.ph || '')}" aria-label="${esc(c.l)}">`).join('')}<button class="del" data-del title="Supprimer">×</button></div>`;
  }
  function readLines(id) { const box = $('#' + id); if (!box) return []; return $$('[data-line]', box).map(l => { const o = {}; $$('[data-c]', l).forEach(i => o[i.dataset.c] = i.value); return o; }); }
  function setLines(id, rows) { const box = $('#' + id); const cols = JSON.parse(box.dataset.cols); const cls = box.querySelector('.line-head').className.replace('line', '').replace('line-head', '').trim(); $$('[data-line]', box).forEach(l => l.remove()); box.insertAdjacentHTML('beforeend', rows.map(r => lineRow(cols, r, cls)).join('')); }

  function wire(root, key, compute, getState, setState, demo, blank) {
    const save = () => store.set(key, getState());
    let raf;
    const run = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => { compute(); save(); }); };
    root.addEventListener('input', run);
    root.addEventListener('change', run);
    root.addEventListener('click', e => {
      const add = e.target.closest('[data-add]');
      if (add) { const box = $('#' + add.dataset.add); const cols = JSON.parse(box.dataset.cols); const cls = box.querySelector('.line-head').className.replace('line', '').replace('line-head', '').trim(); box.insertAdjacentHTML('beforeend', lineRow(cols, {}, cls)); box.lastElementChild.querySelector('input').focus(); run(); }
      if (e.target.closest('[data-del]')) { e.target.closest('[data-line]').remove(); run(); }
      const a = e.target.closest('[data-act]'); if (!a) return;
      const act = a.dataset.act;
      if (act === 'demo') { setState(JSON.parse(JSON.stringify(demo))); run(); toast('Exemple chargé'); }
      if (act === 'reset') { if (confirmInline(a)) { setState(JSON.parse(JSON.stringify(blank))); store.del(key); run(); toast('Formulaire vidé'); } }
      if (act === 'savejson') { download(new Blob([JSON.stringify({ izycrea: key, v: 1, data: getState() }, null, 2)], { type: 'application/json' }), fileName(key, 'json')); }
      if (act === 'openjson') { const inp = document.createElement('input'); inp.type = 'file'; inp.accept = '.json,application/json'; inp.onchange = () => { const f = inp.files[0]; if (!f) return; f.text().then(t => { try { const j = JSON.parse(t); if (j.izycrea !== key) throw 0; setState(j.data); run(); toast('Projet ouvert'); } catch (err) { toast('Ce fichier ne correspond pas à cet outil'); } }); }; inp.click(); }
      if (act === 'pdf') printNow(root.dataset.orient);
    });
    const saved = store.get(key);
    setState(saved || JSON.parse(JSON.stringify(blank)));
    compute();
    return run;
  }
  function confirmInline(btn) {
    if (btn.dataset.armed) { delete btn.dataset.armed; btn.lastChild.textContent = 'Vider'; return true; }
    btn.dataset.armed = 1; btn.lastChild.textContent = 'Confirmer ?';
    setTimeout(() => { if (btn.dataset.armed) { delete btn.dataset.armed; btn.lastChild.textContent = 'Vider'; } }, 3000);
    return false;
  }
  function download(blob, name) { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500); }
  function slug(s) { return String(s || 'projet').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase() || 'projet'; }
  function fileName(key, ext) { const n = ($('#nom') && $('#nom').value) || 'projet'; return `izycrea-${key.replace('izy_', '')}-${slug(n)}.${ext}`; }
  function printNow(orient) {
    let st = null;
    if (orient === 'landscape') { st = document.createElement('style'); st.textContent = '@page{size:A4 landscape;margin:10mm}'; document.head.appendChild(st); }
    setTimeout(() => { window.print(); if (st) setTimeout(() => st.remove(), 500); }, 60);
  }

  /* ----- petits graphiques SVG ----- */
  function bars(series, labels) {
    const W = 520, H = 180, P = 28, max = Math.max(1, ...series.flatMap(s => s.v.map(Math.abs)));
    const n = labels.length, gw = (W - P * 2) / n, bw = Math.min(34, gw / (series.length + 1));
    const y0 = H - 26, sc = (H - 50) / max;
    let g = `<line x1="${P}" x2="${W - P}" y1="${y0}" y2="${y0}" stroke="#e7ebf3"/>`;
    labels.forEach((l, i) => {
      series.forEach((s, j) => {
        const v = s.v[i], h = Math.abs(v) * sc, x = P + gw * i + (gw - bw * series.length) / 2 + j * bw;
        g += `<rect x="${x}" y="${v >= 0 ? y0 - h : y0}" width="${bw - 4}" height="${Math.max(1, h)}" rx="6" fill="${v >= 0 ? s.c : '#f87171'}"><animate attributeName="height" from="0" to="${Math.max(1, h)}" dur=".6s" fill="freeze"/><animate attributeName="y" from="${y0}" to="${v >= 0 ? y0 - h : y0}" dur=".6s" fill="freeze"/></rect>`;
      });
      g += `<text x="${P + gw * i + gw / 2}" y="${H - 8}" text-anchor="middle" font-size="12" fill="#64748b">${l}</text>`;
    });
    const leg = series.map((s, j) => `<rect x="${P + j * 130}" y="2" width="10" height="10" rx="3" fill="${s.c}"/><text x="${P + j * 130 + 16}" y="11" font-size="12" fill="#334155">${s.n}</text>`).join('');
    return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Graphique">${leg}${g}</svg>`;
  }
  function line(vals, labels) {
    const W = 520, H = 180, P = 30, mn = Math.min(0, ...vals), mx = Math.max(1, ...vals);
    const x = i => P + (W - P * 2) * i / (vals.length - 1 || 1), y = v => 20 + (H - 50) * (1 - (v - mn) / (mx - mn || 1));
    const d = vals.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
    const area = d + ` L${x(vals.length - 1)},${y(Math.max(mn, 0))} L${x(0)},${y(Math.max(mn, 0))} Z`;
    return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Trésorerie">
      <defs><linearGradient id="tg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5b5bf6" stop-opacity=".25"/><stop offset="1" stop-color="#14b8a6" stop-opacity="0"/></linearGradient></defs>
      <line x1="${P}" x2="${W - P}" y1="${y(0)}" y2="${y(0)}" stroke="#cbd5e1" stroke-dasharray="4 4"/>
      <path d="${area}" fill="url(#tg)"/><path d="${d}" fill="none" stroke="#5b5bf6" stroke-width="2.5" stroke-linejoin="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"><animate attributeName="stroke-dashoffset" from="1" to="0" dur=".9s" fill="freeze"/></path>
      ${vals.map((v, i) => `<circle cx="${x(i)}" cy="${y(v)}" r="3.5" fill="${v < 0 ? '#ef4444' : '#14b8a6'}"/>`).join('')}
      ${labels.map((l, i) => `<text x="${x(i)}" y="${H - 8}" text-anchor="middle" font-size="11" fill="#64748b">${l}</text>`).join('')}</svg>`;
  }

  /* ----- export Excel (SheetJS) : cellules avec formule + valeur calculée ----- */
  const EUR = '#,##0 "€";-#,##0 "€"', PCT = '0.0%';
  function xl() {
    if (!window.XLSX) { toast("Module Excel en cours de chargement, réessayez dans une seconde"); return null; }
    return window.XLSX;
  }
  function sheet(rows, widths) {
    const X = window.XLSX, ws = {};
    let maxC = 0;
    rows.forEach((r, ri) => r.forEach((c, ci) => {
      if (c === null || c === undefined || c === '') return;
      const ref = X.utils.encode_cell({ r: ri, c: ci });
      let cell;
      if (typeof c === 'object' && !Array.isArray(c)) {
        cell = {};
        if (c.f) { cell.f = c.f; cell.t = c.s ? 's' : 'n'; cell.v = c.v ?? 0; }
        else if (typeof c.v === 'number') { cell.t = 'n'; cell.v = c.v; }
        else { cell.t = 's'; cell.v = String(c.v ?? ''); }
        if (c.z) cell.z = c.z;
      } else if (typeof c === 'number') cell = { t: 'n', v: c };
      else cell = { t: 's', v: String(c) };
      ws[ref] = cell; maxC = Math.max(maxC, ci);
    }));
    ws['!ref'] = X.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: Math.max(0, rows.length - 1), c: maxC } });
    if (widths) ws['!cols'] = widths.map(w => ({ wch: w }));
    return ws;
  }
  const col = i => String.fromCharCode(65 + i);

  /* =====================================================================
     1. PRÉVISIONNEL MICRO-ENTREPRISE
     ===================================================================== */
  const ACT = {
    vente: { l: 'Achat-revente de marchandises (BIC)', taux: 12.3, abat: 71, vl: 1, cfp: 0.1, micro: 203100, tva: 85000, tvaM: 93500 },
    bic: { l: 'Prestations de services commerciales ou artisanales (BIC)', taux: 21.2, abat: 50, vl: 1.7, cfp: 0.3, micro: 83600, tva: 37500, tvaM: 41250 },
    bnc: { l: 'Autres prestations de services (BNC)', taux: 25.6, abat: 34, vl: 2.2, cfp: 0.2, micro: 83600, tva: 37500, tvaM: 41250 },
    cipav: { l: 'Profession libérale réglementée (Cipav)', taux: 23.2, abat: 34, vl: 2.2, cfp: 0.2, micro: 83600, tva: 37500, tvaM: 41250 }
  };
  const acreMonths = m => { m = Math.min(12, Math.max(1, Math.round(m) || 1)); const q = Math.ceil(m / 3); return Math.min(12, (q + 3) * 3 - m + 1); };
  const MICRO_BLANK = { f: { nom: '', porteur: '', act: 'bnc', taux: 25.6, abat: 34, vlr: 2.2, cfp: 0.2, mois: 1, acre: 'non', vl: 'non', ca1: '', ca2: '', ca3: '', aremode: 'aucune', droits: '', arem: '', prime: '', apport: '' }, charges: [{ l: 'Assurance RC pro' }, { l: 'Téléphone, internet, logiciels' }, { l: 'Déplacements' }] };
  const MICRO_DEMO = { f: { nom: 'Atelier conseil RH', porteur: 'Porteur exemple', act: 'bnc', taux: 25.6, abat: 34, vlr: 2.2, cfp: 0.2, mois: 2, acre: 'oui', vl: 'non', ca1: 32000, ca2: 45000, ca3: 52000, aremode: 'maintien', droits: 30000, arem: 1900, prime: 15000, apport: 5000 },
    charges: [{ l: 'Assurance RC pro', y1: 450, y2: 470, y3: 490 }, { l: 'Téléphone, internet, logiciels', y1: 900, y2: 900, y3: 950 }, { l: 'Déplacements', y1: 2400, y2: 3000, y3: 3200 }, { l: 'Formation, documentation', y1: 800, y2: 500, y3: 500 }, { l: 'Comptabilité, banque', y1: 600, y2: 600, y3: 650 }] };

  function microModel(s) {
    const f = s.f, A = ACT[f.act] || ACT.bnc;
    const taux = num(f.taux) / 100, abat = num(f.abat) / 100, vlr = num(f.vlr) / 100, cfp = num(f.cfp) / 100;
    const am = f.acre === 'oui' ? acreMonths(num(f.mois)) : 0;
    const ca = [num(f.ca1), num(f.ca2), num(f.ca3)];
    const ch = [0, 1, 2].map(y => s.charges.reduce((a, l) => a + num(l['y' + (y + 1)]), 0));
    const cot = ca.map((c, y) => c * taux * (y === 0 ? 1 - 0.25 * am / 12 : 1));
    const cf = ca.map(c => c * cfp);
    const vl = ca.map(c => f.vl === 'oui' ? c * vlr : 0);
    const imposable = ca.map(c => c * (1 - abat));
    const net = ca.map((c, y) => c - cot[y] - cf[y] - vl[y] - ch[y]);
    const droits = num(f.droits), arem = num(f.arem);
    let are = [0, 0, 0], arce = 0;
    if (f.aremode === 'arce') { arce = droits * 0.6 * 0.97; are[0] = arce; }
    if (f.aremode === 'maintien') {
      let cap = droits * 0.6;
      for (let m = 0; m < 36 && cap > 0; m++) { const y = Math.floor(m / 12); const rev = ca[y] / 12 * (1 - abat); const a = Math.min(cap, Math.max(0, arem - 0.7 * rev)); are[y] += a; cap -= a; }
    }
    const prime = num(f.prime);
    const aides = [are[0] + prime, are[1], are[2]];
    const res = net.map((n, y) => n + aides[y]);
    return { A, taux, abat, vlr, cfp, am, ca, ch, cot, cf, vl, imposable, net, are, arce, prime, aides, res, apport: num(f.apport) };
  }

  function microHTML() {
    return head('Outil', 'Prévisionnel micro-entreprise', "Le revenu réel du porteur sur 3 ans : cotisations 2026, Acre, versement libératoire, ARE ou ARCE et prime création PSE / RCC.") + `
    <div class="wrap tool" id="tool" data-key="izy_prev_micro">
      ${bar(`<button class="btn pri" data-act="xlsx">${ICON.xls}Excel</button>`)}
      <div class="print-only"><h2 id="pTitle"></h2><p class="muted" id="pSub"></p></div>
      <div class="two">
        <div class="no-print">
          <div class="panel"><h3><span class="num">1</span>Le projet</h3><div class="fields">
            ${F('nom', 'Nom du projet', { type: 'text', ph: 'Ex. Atelier conseil RH' })}${F('porteur', 'Porteur', { type: 'text' })}
            ${F('act', "Type d'activité", { type: 'select', wide: true, opts: Object.entries(ACT).map(([k, a]) => [k, a.l]) })}
            ${F('taux', 'Taux de cotisations', { hint: '%' })}${F('abat', 'Abattement fiscal', { hint: '%' })}${F('vlr', 'Taux versement libératoire', { hint: '%' })}${F('cfp', 'Formation pro (CFP)', { hint: '%' })}
            ${F('mois', 'Mois de démarrage', { hint: '1 à 12' })}
            ${F('acre', 'Acre accordée ?', { type: 'select', opts: [['non', 'Non'], ['oui', 'Oui (25 % d\'exonération)']] })}
            ${F('vl', 'Versement libératoire ?', { type: 'select', opts: [['non', 'Non'], ['oui', 'Oui']] })}
          </div></div>
          <div class="panel"><h3><span class="num">2</span>Chiffre d'affaires encaissé (HT)</h3><div class="fields">
            ${F('ca1', 'Année 1', { hint: '€' })}${F('ca2', 'Année 2', { hint: '€' })}${F('ca3', 'Année 3', { hint: '€' })}
          </div></div>
          <div class="panel"><h3><span class="num">3</span>Charges réelles</h3>
            <p class="muted" style="margin-top:-6px;font-size:.88rem">En micro, les charges ne sont pas déductibles des cotisations : on les retire pour connaître le revenu réel.</p>
            ${linesUI('charges-m', [{ k: 'l', l: 'Charge', t: 'text', ph: 'Libellé' }, { k: 'y1', l: 'Année 1' }, { k: 'y2', l: 'Année 2' }, { k: 'y3', l: 'Année 3' }], [])}
          </div>
          <div class="panel"><h3><span class="num">4</span>Ressources du porteur</h3><div class="fields">
            ${F('aremode', 'Aide France Travail', { type: 'select', wide: true, opts: [['aucune', 'Aucune'], ['arce', 'ARCE : 60 % des droits en capital'], ['maintien', "Maintien de l'ARE (cumul plafonné à 60 %)"]] })}
            ${F('droits', 'Droits ARE restants', { hint: '€' })}${F('arem', 'ARE mensuelle', { hint: '€ brut, si maintien' })}
            ${F('prime', 'Prime création PSE / RCC', { hint: '€ — saisie manuelle', pse: true })}${F('apport', 'Apport personnel investi', { hint: '€' })}
          </div>
          <p class="muted" style="font-size:.82rem;margin:12px 0 0">Maintien de l'ARE : estimation (allocation − 70 % du revenu après abattement, dans la limite de 60 % des droits). Le montant réel est calculé chaque mois par France Travail.</p></div>
        </div>
        <div class="sticky" id="out"></div>
      </div>
    </div>`;
  }
  function microInit() {
    const root = $('#tool');
    const getState = () => ({ f: readFields(root), charges: readLines('charges-m') });
    const setState = s => { writeFields(root, s.f); setLines('charges-m', s.charges || []); };
    const compute = () => {
      const s = getState(), m = microModel(s), A = m.A;
      $('#pTitle').textContent = 'Prévisionnel micro-entreprise — ' + (s.f.nom || 'Projet');
      $('#pSub').textContent = `${s.f.porteur ? s.f.porteur + ' · ' : ''}${A.l} · édité le ${today()} avec IzyCréa`;
      const al = [];
      m.ca.forEach((c, y) => {
        if (c > A.micro) al.push(['bad', `Année ${y + 1} : chiffre d'affaires au-dessus du seuil micro (${eur(A.micro)}). Le régime réel s'appliquera après deux années de dépassement.`]);
        else if (c > A.tvaM) al.push(['bad', `Année ${y + 1} : au-delà du seuil majoré de TVA (${eur(A.tvaM)}), la TVA est due dès le dépassement.`]);
        else if (c > A.tva) al.push(['warn', `Année ${y + 1} : au-dessus du seuil de franchise de TVA (${eur(A.tva)}). Vérifier la règle de tolérance.`]);
      });
      if (m.am) al.push(['ok', `Acre : environ ${m.am} mois d'exonération de 25 % en année 1 (jusqu'à la fin du 3e trimestre civil suivant le démarrage). Demande à faire à l'Urssaf.`]);
      if (s.f.aremode === 'arce' && m.arce) al.push(['warn', "ARCE : possible seulement si l'entreprise est créée après la fin du contrat de travail."]);
      if (m.ca[0] && s.f.mois > 1) al.push(['warn', "Seuils : la première année civile, ils sont proratisés selon la date de démarrage."]);
      const rows = [
        ['Chiffre d\'affaires', m.ca, 'tot'], ['Cotisations sociales', m.cot.map(x => -x)], ['Formation professionnelle', m.cf.map(x => -x)],
        ['Versement libératoire', m.vl.map(x => -x)], ['Charges réelles', m.ch.map(x => -x)], ['Revenu de l\'activité', m.net, 'tot'],
        ['ARE / ARCE', m.are], ['Prime création PSE / RCC', [m.prime, 0, 0]], ['Ressources totales', m.res, 'tot'], ['Soit par mois', m.res.map(x => x / 12), 'sub'],
        ['Revenu imposable (après abattement)', m.imposable, 'sub']
      ];
      $('#out').innerHTML = `
        <div class="kpis">
          <div class="kpi ${m.res[0] / 12 < 1000 ? 'bad' : 'good'}"><span>Ressources / mois · an 1</span><b>${eur(m.res[0] / 12)}</b></div>
          <div class="kpi"><span>Revenu activité · an 1</span><b>${eur(m.net[0])}</b></div>
          <div class="kpi"><span>Cotisations · an 1</span><b>${eur(m.cot[0])}</b></div>
          <div class="kpi"><span>Revenu activité · an 3</span><b>${eur(m.net[2])}</b></div>
        </div>
        <div class="alerts">${al.map(([c, t]) => `<div class="alert ${c}">${t}</div>`).join('')}</div>
        <div class="panel" style="padding:18px"><h3 style="margin-bottom:6px">Évolution sur 3 ans</h3>${bars([{ n: "Chiffre d'affaires", c: '#5b5bf6', v: m.ca }, { n: 'Ressources totales', c: '#14b8a6', v: m.res }], ['Année 1', 'Année 2', 'Année 3'])}</div>
        <div class="scroll-x"><table class="tbl res"><thead><tr><th></th><th class="num">Année 1</th><th class="num">Année 2</th><th class="num">Année 3</th></tr></thead><tbody>
          ${rows.map(([l, v, c]) => `<tr class="${c || ''}"><td>${l}</td>${v.map(x => `<td class="num">${eur(x)}</td>`).join('')}</tr>`).join('')}
        </tbody></table></div>
        <p class="muted" style="font-size:.8rem">Taux 2026 métropole. Impôt sur le revenu non calculé hors versement libératoire (il dépend du foyer fiscal). Estimation indicative.</p>`;
      store.set('izy_kpi_micro', { nom: s.f.nom, ca: m.ca, net: m.net, res: m.res, prime: m.prime, are: m.are, apport: m.apport, act: A.l, date: today() });
    };
    // préremplissage des taux selon l'activité
    root.addEventListener('change', e => { if (e.target.id === 'act') { const A = ACT[e.target.value]; $('#taux').value = A.taux; $('#abat').value = A.abat; $('#vlr').value = A.vlr || A.vl; $('#cfp').value = A.cfp; } }, true);
    wire(root, 'izy_prev_micro', compute, getState, setState, MICRO_DEMO, MICRO_BLANK);
    root.addEventListener('click', e => { if (e.target.closest('[data-act="xlsx"]')) microXlsx(getState()); });
  }

  function microXlsx(s) {
    const X = xl(); if (!X) return;
    const m = microModel(s), f = s.f;
    const H = 'Hypothèses';
    // Feuille Hypothèses
    const hyp = [
      ['IzyCréa — Prévisionnel micro-entreprise'], ['Projet', f.nom || ''], ['Porteur', f.porteur || ''], ['Activité', m.A.l], ['Édité le', today()], [],
      ['Paramètres', 'Valeur'],
      ['Taux de cotisations', { v: m.taux, z: PCT }],            // B8
      ['Abattement fiscal', { v: m.abat, z: PCT }],              // B9
      ['Taux versement libératoire', { v: m.vlr, z: PCT }],      // B10
      ['Taux formation pro (CFP)', { v: m.cfp, z: '0.00%' }],    // B11
      ['Mois de démarrage (1-12)', num(f.mois) || 1],            // B12
      ['Acre (Oui/Non)', f.acre === 'oui' ? 'Oui' : 'Non'],      // B13
      ['Versement libératoire (Oui/Non)', f.vl === 'oui' ? 'Oui' : 'Non'], // B14
      ['Aide France Travail', { aucune: 'Aucune', arce: 'ARCE', maintien: 'Maintien' }[f.aremode] || 'Aucune'], // B15
      ['Droits ARE restants', { v: num(f.droits), z: EUR }],     // B16
      ['ARE mensuelle (si maintien)', { v: num(f.arem), z: EUR }], // B17
      ['Prime création PSE / RCC', { v: m.prime, z: EUR }],     // B18
      ['Apport personnel investi', { v: m.apport, z: EUR }],     // B19
      [],
      ["Chiffre d'affaires HT", 'Année 1', 'Année 2', 'Année 3'], // row 21
      ['CA encaissé', { v: m.ca[0], z: EUR }, { v: m.ca[1], z: EUR }, { v: m.ca[2], z: EUR }], // row 22
      [],
      ['Charges réelles', 'Année 1', 'Année 2', 'Année 3']        // row 24
    ];
    const ch0 = hyp.length + 1; // première ligne de charges (1-indexée)
    s.charges.forEach(l => hyp.push([l.l || 'Charge', { v: num(l.y1), z: EUR }, { v: num(l.y2), z: EUR }, { v: num(l.y3), z: EUR }]));
    const ch1 = Math.max(ch0, hyp.length);
    if (!s.charges.length) hyp.push(['(aucune charge)', 0, 0, 0]);
    const wsH = sheet(hyp, [36, 16, 16, 16]);
    // Feuille Prévisionnel (formules)
    const h = r => `'${H}'!${r}`;
    const Y = ['B', 'C', 'D'];
    const P = [['IzyCréa — Prévisionnel micro-entreprise : ' + (f.nom || '')], [], ['', 'Année 1', 'Année 2', 'Année 3']];
    const r = {}; const add = (k, label, fn, z = EUR) => { P.push([label, ...[0, 1, 2].map(y => { const o = fn(y); return { f: o[0], v: o[1], z }; })]); r[k] = P.length; };
    add('ca', "Chiffre d'affaires", y => [h(Y[y] + '22'), m.ca[y]]);
    P.push(['Mois d\'Acre en année 1', { f: `IF(${h('B13')}="Oui",MIN(12,(ROUNDUP(${h('B12')}/3,0)+3)*3-${h('B12')}+1),0)`, v: m.am }]); r.am = P.length;
    add('cot', 'Cotisations sociales', y => [y === 0 ? `${Y[y]}${r.ca}*${h('B8')}*(1-0.25*$B$${r.am}/12)` : `${Y[y]}${r.ca}*${h('B8')}`, m.cot[y]]);
    add('cfp', 'Formation professionnelle', y => [`${Y[y]}${r.ca}*${h('B11')}`, m.cf[y]]);
    add('vl', 'Versement libératoire', y => [`IF(${h('B14')}="Oui",${Y[y]}${r.ca}*${h('B10')},0)`, m.vl[y]]);
    add('ch', 'Charges réelles', y => [`SUM(${h(Y[y] + ch0 + ':' + Y[y] + ch1)})`, m.ch[y]]);
    add('net', "Revenu de l'activité", y => [`${Y[y]}${r.ca}-${Y[y]}${r.cot}-${Y[y]}${r.cfp}-${Y[y]}${r.vl}-${Y[y]}${r.ch}`, m.net[y]]);
    // ARE : ARCE en formule, maintien en valeurs estimées
    P.push(['ARE / ARCE', ...[0, 1, 2].map(y => f.aremode === 'maintien' ? { v: m.are[y], z: EUR } : { f: y === 0 ? `IF(${h('B15')}="ARCE",${h('B16')}*0.6*0.97,0)` : '0', v: m.are[y], z: EUR })]); r.are = P.length;
    add('prime', 'Prime création PSE / RCC', y => [y === 0 ? h('B18') : '0', y === 0 ? m.prime : 0]);
    add('res', 'Ressources totales', y => [`${Y[y]}${r.net}+${Y[y]}${r.are}+${Y[y]}${r.prime}`, m.res[y]]);
    add('mois', 'Soit par mois', y => [`${Y[y]}${r.res}/12`, m.res[y] / 12]);
    add('imp', 'Revenu imposable (après abattement)', y => [`${Y[y]}${r.ca}*(1-${h('B9')})`, m.imposable[y]]);
    P.push([]);
    P.push(['Notes']);
    P.push(['Taux 2026 métropole. Acre : 25 % d\'exonération jusqu\'à la fin du 3e trimestre civil suivant le démarrage.']);
    if (f.aremode === 'maintien') P.push(["Maintien de l'ARE : montants estimés par IzyCréa (allocation − 70 % du revenu après abattement, plafond 60 % des droits)."]);
    P.push(['Estimation indicative : ne remplace pas l\'avis d\'un expert-comptable ni les calculs de France Travail et de l\'Urssaf.']);
    const wsP = sheet(P, [38, 16, 16, 16]);
    const wb = X.utils.book_new();
    X.utils.book_append_sheet(wb, wsP, 'Prévisionnel');
    X.utils.book_append_sheet(wb, wsH, H);
    X.writeFile(wb, fileName('izy_prev_micro', 'xlsx'));
    toast('Fichier Excel téléchargé');
  }

  /* =====================================================================
     2. PRÉVISIONNEL COMPLET 3 ANS
     ===================================================================== */
  const COMP_BLANK = {
    f: { nom: '', porteur: '', forme: 'SASU', regime: 'IS', mois: '', ca1: '', ca2: '', ca3: '', achats: '', dc: 30, df: 30, ds: 0, taxes1: 0, taxes2: '', taxes3: '', dir1: '', dir2: '', dir3: '', tdir: 80, sal1: '', sal2: '', sal3: '', tsal: 40, capital: '', cc: '', prime: '', ph: '', subv: '', tresoinit: '' },
    inv: [{ l: 'Matériel' }, { l: 'Informatique' }],
    loan: [{ l: 'Prêt bancaire' }],
    charges: ['Loyer et charges locatives', 'Assurances professionnelles', 'Expert-comptable, juridique', 'Téléphone, internet, logiciels', 'Publicité, communication', 'Déplacements, carburant', 'Fournitures, petit matériel', 'Frais bancaires', 'Assurances personnelles du dirigeant'].map(l => ({ l }))
  };
  const COMP_DEMO = {
    f: { nom: 'Au Bon Levain — micro-fournil', porteur: 'Porteur exemple', forme: 'EURL', regime: 'IS', mois: 3, ca1: 135000, ca2: 160000, ca3: 180000, achats: 30, dc: 0, df: 30, ds: 10, taxes1: 0, taxes2: 900, taxes3: 950, dir1: 18000, dir2: 24000, dir3: 28000, tdir: 45, sal1: 0, sal2: 14000, sal3: 15000, tsal: 30, capital: 5000, cc: 10000, prime: 25000, ph: 15000, subv: 3000, tresoinit: 8000 },
    inv: [{ l: 'Four et matériel de boulangerie', m: 38000, d: 7 }, { l: 'Agencement du local', m: 18000, d: 10 }, { l: 'Caisse, informatique', m: 2500, d: 3 }],
    loan: [{ l: 'Prêt bancaire', m: 40000, t: 4.2, n: 84 }],
    charges: [{ l: 'Loyer et charges locatives', y1: 14400, y2: 14700, y3: 15000 }, { l: 'Énergie', y1: 7200, y2: 8000, y3: 8500 }, { l: 'Assurances professionnelles', y1: 1800, y2: 1850, y3: 1900 }, { l: 'Expert-comptable, juridique', y1: 2400, y2: 2400, y3: 2500 }, { l: 'Publicité, communication', y1: 2500, y2: 1500, y3: 1500 }, { l: 'Emballages, fournitures', y1: 3600, y2: 4500, y3: 5000 }, { l: 'Entretien, maintenance', y1: 900, y2: 1500, y3: 1800 }, { l: 'Frais bancaires, terminal', y1: 900, y2: 1000, y3: 1100 }]
  };
  const isTax = rc => rc > 0 ? Math.min(rc, 42500) * 0.15 + Math.max(rc - 42500, 0) * 0.25 : 0;

  function loanSched(L) {
    const M = num(L.m), r = num(L.t) / 100 / 12, n = Math.round(num(L.n));
    const pay = n > 0 ? (r ? M * r / (1 - Math.pow(1 + r, -n)) : M / n) : 0;
    let bal = M; const rows = [];
    for (let i = 1; i <= 36; i++) { const it = i <= n ? bal * r : 0; const pr = i <= n ? Math.min(bal, pay - it) : 0; rows.push({ i, it, pr, start: bal }); bal -= pr; }
    return { M, pay, rows, n };
  }
  function compModel(s) {
    const f = s.f, Y = [0, 1, 2];
    const ca = Y.map(y => num(f['ca' + (y + 1)]));
    const tAch = num(f.achats) / 100;
    const ach = ca.map(c => c * tAch);
    const marge = ca.map((c, y) => c - ach[y]);
    const ext = Y.map(y => s.charges.reduce((a, l) => a + num(l['y' + (y + 1)]), 0));
    const va = Y.map(y => marge[y] - ext[y]);
    const taxes = Y.map(y => num(f['taxes' + (y + 1)]));
    const dir = Y.map(y => num(f['dir' + (y + 1)])), dirc = dir.map(d => d * num(f.tdir) / 100);
    const sal = Y.map(y => num(f['sal' + (y + 1)])), salc = sal.map(d => d * num(f.tsal) / 100);
    const pers = Y.map(y => dir[y] + dirc[y] + sal[y] + salc[y]);
    const ebe = Y.map(y => va[y] - taxes[y] - pers[y]);
    const dap = Y.map(y => s.inv.reduce((a, i) => { const d = Math.round(num(i.d)); return a + (d >= y + 1 ? num(i.m) / d : 0); }, 0));
    const rex = Y.map(y => ebe[y] - dap[y]);
    const loans = s.loan.filter(l => num(l.m) > 0).map(loanSched);
    const int = Y.map(y => loans.reduce((a, L) => a + L.rows.slice(y * 12, y * 12 + 12).reduce((b, r) => b + r.it, 0), 0));
    const princ = Y.map(y => loans.reduce((a, L) => a + L.rows.slice(y * 12, y * 12 + 12).reduce((b, r) => b + r.pr, 0), 0));
    const rc = Y.map(y => rex[y] - int[y]);
    const is = rc.map(x => f.regime === 'IS' ? isTax(x) : 0);
    const rn = Y.map(y => rc[y] - is[y]);
    const caf = Y.map(y => rn[y] + dap[y]);
    const cf = Y.map(y => ext[y] + taxes[y] + pers[y] + dap[y] + int[y]);
    const tm = ca.map((c, y) => c ? marge[y] / c : 0);
    const sr = Y.map(y => tm[y] > 0 ? cf[y] / tm[y] : null);
    const dc = num(f.dc), df = num(f.df), ds = num(f.ds);
    const bfr = Y.map(y => ca[y] * dc / 360 + ach[y] * ds / 360 - (ach[y] + ext[y]) * df / 360);
    const dbfr = Y.map(y => bfr[y] - (y ? bfr[y - 1] : 0));
    const invT = s.inv.reduce((a, i) => a + num(i.m), 0);
    const empT = loans.reduce((a, L) => a + L.M, 0);
    const apports = num(f.capital) + num(f.cc) + num(f.prime) + num(f.ph);
    const subv = num(f.subv), tinit = num(f.tresoinit);
    const besoinsInit = invT + Math.max(0, bfr[0]) + tinit;
    const ressInit = apports + empT + subv;
    const pfB = Y.map(y => (y ? 0 : invT) + dbfr[y] + princ[y]);
    const pfR = Y.map(y => (y ? 0 : apports + empT + subv) + caf[y]);
    const pfS = Y.map(y => pfR[y] - pfB[y]);
    const pfC = []; Y.forEach(y => pfC.push((y ? pfC[y - 1] : 0) + pfS[y]));
    // trésorerie mensuelle année 1 (simplifiée, HT)
    const lagC = Math.round(dc / 30), lagF = Math.round(df / 30);
    const tr = []; let cum = 0;
    for (let m = 0; m < 12; m++) {
      const enc = (m === 0 ? apports + empT + subv : 0) + (m >= lagC ? ca[0] / 12 : 0);
      const dec = (m === 0 ? invT + ach[0] * ds / 360 : 0) + (m >= lagF ? (ach[0] + ext[0]) / 12 : 0) + pers[0] / 12 + taxes[0] / 12 + loans.reduce((a, L) => a + L.rows[m].it + L.rows[m].pr, 0);
      cum += enc - dec; tr.push({ enc, dec, cum });
    }
    const pctApport = (apports + empT + subv) ? apports / (apports + empT + subv) : 0;
    return { ca, ach, marge, ext, va, taxes, dir, dirc, sal, salc, pers, ebe, dap, rex, int, princ, rc, is, rn, caf, cf, tm, sr, bfr, dbfr, invT, empT, apports, subv, tinit, besoinsInit, ressInit, pfB, pfR, pfS, pfC, tr, loans, pctApport, prime: num(f.prime) };
  }

  function compHTML() {
    const Y3 = (p, l, h) => F(p + '1', l + ' an 1', { hint: h }) + F(p + '2', 'An 2', { hint: h }) + F(p + '3', 'An 3', { hint: h });
    return head('Outil', 'Prévisionnel complet sur 3 ans', "Plan de financement, compte de résultat, seuil de rentabilité, BFR et trésorerie mensuelle : les tableaux attendus par une banque ou un réseau de prêt d'honneur.") + `
    <div class="wrap tool" id="tool" data-key="izy_prev_complet">
      ${bar(`<button class="btn pri" data-act="xlsx">${ICON.xls}Excel</button>`)}
      <div class="print-only"><h2 id="pTitle"></h2><p class="muted" id="pSub"></p></div>
      <div class="two">
        <div class="no-print">
          <div class="panel"><h3><span class="num">1</span>Le projet</h3><div class="fields">
            ${F('nom', 'Nom du projet', { type: 'text' })}${F('porteur', 'Porteur', { type: 'text' })}
            ${F('forme', 'Forme juridique', { type: 'select', opts: ['SASU', 'SAS', 'EURL', 'SARL', 'EI'].map(x => [x, x]) })}
            ${F('regime', 'Imposition des bénéfices', { type: 'select', opts: [['IS', 'Impôt sur les sociétés'], ['IR', 'Impôt sur le revenu (non calculé)']] })}
          </div></div>
          <div class="panel"><h3><span class="num">2</span>Investissements</h3>
            ${linesUI('inv-c', [{ k: 'l', l: 'Investissement', t: 'text', ph: 'Libellé' }, { k: 'm', l: 'Montant HT' }, { k: 'd', l: 'Amort. (ans)' }], [])}</div>
          <div class="panel"><h3><span class="num">3</span>Financement</h3><div class="fields">
            ${F('capital', 'Apport en capital', { hint: '€' })}${F('cc', "Apport en compte courant", { hint: '€' })}
            ${F('prime', 'dont prime création PSE / RCC', { hint: '€ — saisie manuelle', pse: true })}${F('ph', "Prêt d'honneur (apport)", { hint: '€' })}
            ${F('subv', 'Subventions', { hint: '€' })}${F('tresoinit', 'Trésorerie de sécurité visée', { hint: '€' })}
          </div>
          <p class="muted" style="font-size:.82rem;margin:10px 0 14px">La prime création et le prêt d'honneur sont des ressources personnelles apportées à l'entreprise : ils s'ajoutent aux apports.</p>
          ${linesUI('loan-c', [{ k: 'l', l: 'Emprunt', t: 'text', ph: 'Libellé' }, { k: 'm', l: 'Montant' }, { k: 't', l: 'Taux %' }, { k: 'n', l: 'Durée (mois)' }], [])}</div>
          <div class="panel"><h3><span class="num">4</span>Activité</h3><div class="fields">
            ${Y3('ca', "Chiffre d'affaires HT", '€')}
            ${F('achats', 'Achats consommés', { hint: '% du CA' })}${F('dc', 'Délai clients', { hint: 'jours' })}${F('df', 'Délai fournisseurs', { hint: 'jours' })}${F('ds', 'Stock moyen', { hint: "jours d'achats" })}
          </div></div>
          <div class="panel"><h3><span class="num">5</span>Charges externes (HT)</h3>
            ${linesUI('charges-c', [{ k: 'l', l: 'Charge', t: 'text', ph: 'Libellé' }, { k: 'y1', l: 'Année 1' }, { k: 'y2', l: 'Année 2' }, { k: 'y3', l: 'Année 3' }], [])}
            <div class="fields" style="margin-top:14px">${Y3('taxes', 'Impôts et taxes (CFE…)', '€')}</div></div>
          <div class="panel"><h3><span class="num">6</span>Rémunérations</h3><div class="fields">
            ${Y3('dir', 'Rémunération nette dirigeant', '€')}${F('tdir', 'Cotisations dirigeant', { hint: '% du net' })}
            ${Y3('sal', 'Salaires bruts salariés', '€')}${F('tsal', 'Charges patronales', { hint: '% du brut' })}
          </div>
          <p class="muted" style="font-size:.82rem;margin:10px 0 0">Repères : environ 45 % du net pour un dirigeant indépendant (gérant majoritaire, EI), environ 80 % pour un président de SAS/SASU. À affiner avec le simulateur de l'Urssaf.</p></div>
        </div>
        <div class="sticky" id="out"></div>
      </div>
      <div id="out2"></div>
    </div>`;
  }
  function compInit() {
    const root = $('#tool');
    const getState = () => ({ f: readFields(root), inv: readLines('inv-c'), loan: readLines('loan-c'), charges: readLines('charges-c') });
    const setState = s => { writeFields(root, s.f); setLines('inv-c', s.inv || []); setLines('loan-c', s.loan || []); setLines('charges-c', s.charges || []); };
    root.addEventListener('change', e => { if (e.target.id === 'forme') $('#tdir').value = /SAS/.test(e.target.value) ? 80 : 45; }, true);
    const compute = () => {
      const s = getState(), m = compModel(s), f = s.f;
      $('#pTitle').textContent = 'Prévisionnel financier — ' + (f.nom || 'Projet');
      $('#pSub').textContent = `${f.porteur ? f.porteur + ' · ' : ''}${f.forme} · ${f.regime} · édité le ${today()} avec IzyCréa`;
      const minT = Math.min(...m.tr.map(t => t.cum));
      const al = [];
      if (m.ressInit < m.besoinsInit) al.push(['bad', `Plan de financement initial : il manque ${eur(m.besoinsInit - m.ressInit)} pour couvrir les besoins de démarrage.`]);
      if (minT < 0) al.push(['bad', `Trésorerie négative en année 1 (point bas : ${eur(minT)}). Prévoir plus d'apport, un emprunt ou un découvert autorisé.`]);
      if (m.sr[0] !== null && m.ca[0] < m.sr[0]) al.push(['warn', `Seuil de rentabilité non atteint en année 1 (${eur(m.sr[0])} nécessaires).`]);
      if (m.rn[0] < 0) al.push(['warn', 'Résultat négatif en année 1 : fréquent au démarrage, à justifier dans le dossier.']);
      if (m.pctApport && m.pctApport < 0.25 && m.empT) al.push(['warn', `Apports personnels : ${pct(m.pctApport)} des ressources. Les financeurs attendent souvent un apport plus visible.`]);
      if (!al.length && m.ca[0]) al.push(['ok', 'Le plan est équilibré : besoins couverts, trésorerie positive et seuil de rentabilité atteint en année 1.']);
      const T = (rows, hd = ['Année 1', 'Année 2', 'Année 3']) => `<div class="scroll-x"><table class="tbl res"><thead><tr><th></th>${hd.map(x => `<th class="num">${x}</th>`).join('')}</tr></thead><tbody>${rows.map(([l, v, c]) => `<tr class="${c || ''}"><td>${l}</td>${v.map(x => `<td class="num">${x === null ? '—' : typeof x === 'string' ? x : eur(x)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
      $('#out').innerHTML = `
        <div class="kpis">
          <div class="kpi"><span>Chiffre d'affaires · an 1</span><b>${eur(m.ca[0])}</b></div>
          <div class="kpi ${m.rn[0] < 0 ? 'bad' : 'good'}"><span>Résultat net · an 1</span><b>${eur(m.rn[0])}</b></div>
          <div class="kpi ${minT < 0 ? 'bad' : 'good'}"><span>Trésorerie point bas · an 1</span><b>${eur(minT)}</b></div>
          <div class="kpi"><span>Seuil de rentabilité · an 1</span><b>${m.sr[0] === null ? '—' : eur(m.sr[0])}</b></div>
        </div>
        <div class="alerts">${al.map(([c, t]) => `<div class="alert ${c}">${t}</div>`).join('')}</div>
        <div class="panel" style="padding:18px"><h3 style="margin-bottom:6px">Chiffre d'affaires et résultat</h3>${bars([{ n: "Chiffre d'affaires", c: '#5b5bf6', v: m.ca }, { n: 'Résultat net', c: '#14b8a6', v: m.rn }], ['Année 1', 'Année 2', 'Année 3'])}</div>
        <div class="panel" style="padding:18px"><h3 style="margin-bottom:6px">Trésorerie mensuelle · année 1</h3>${line(m.tr.map(t => t.cum), m.tr.map((t, i) => 'M' + (i + 1)))}</div>
        <h3>Plan de financement initial</h3>
        ${T([['Investissements', [m.invT]], ['Besoin en fonds de roulement', [Math.max(0, m.bfr[0])]], ['Trésorerie de sécurité', [m.tinit]], ['Total des besoins', [m.besoinsInit], 'tot'],
          ['Apports (capital, compte courant, prime, prêt d\'honneur)', [m.apports]], ['dont prime création PSE / RCC', [m.prime], 'sub'], ['Emprunts', [m.empT]], ['Subventions', [m.subv]], ['Total des ressources', [m.ressInit], 'tot'], ['Écart', [m.ressInit - m.besoinsInit], 'sub']], ['Démarrage'])}`;
      $('#out2').innerHTML = `
        <div class="two" style="margin-top:8px"><div>
        <h3>Compte de résultat</h3>
        ${T([["Chiffre d'affaires", m.ca, 'tot'], ['Achats consommés', m.ach.map(x => -x)], ['Marge brute', m.marge, 'tot'], ['Charges externes', m.ext.map(x => -x)], ['Valeur ajoutée', m.va, 'tot'],
          ['Impôts et taxes', m.taxes.map(x => -x)], ['Rémunération dirigeant', m.dir.map(x => -x)], ['Cotisations dirigeant', m.dirc.map(x => -x)], ['Salaires bruts', m.sal.map(x => -x)], ['Charges patronales', m.salc.map(x => -x)],
          ['Excédent brut d\'exploitation', m.ebe, 'tot'], ['Dotations aux amortissements', m.dap.map(x => -x)], ["Résultat d'exploitation", m.rex, 'tot'], ['Charges financières', m.int.map(x => -x)],
          ['Résultat courant avant impôt', m.rc], ['Impôt sur les sociétés', m.is.map(x => -x)], ['Résultat net', m.rn, 'tot'], ["Capacité d'autofinancement", m.caf, 'sub']])}
        </div><div>
        <h3>Seuil de rentabilité</h3>
        ${T([['Charges fixes', m.cf], ['Taux de marge sur coûts variables', m.tm.map(x => pct(x))], ['Seuil de rentabilité', m.sr, 'tot'], ['Point mort', m.sr.map((x, y) => x === null || !m.ca[y] ? null : Math.round(x / m.ca[y] * 360) + ' jours')]])}
        <h3>Besoin en fonds de roulement</h3>
        ${T([['BFR', m.bfr, 'tot'], ['Variation', m.dbfr]])}
        <h3>Plan de financement sur 3 ans</h3>
        ${T([['Investissements', [m.invT, 0, 0]], ['Variation du BFR', m.dbfr], ['Remboursement des emprunts', m.princ], ['Total des besoins', m.pfB, 'tot'],
          ['Apports', [m.apports, 0, 0]], ['Emprunts', [m.empT, 0, 0]], ['Subventions', [m.subv, 0, 0]], ["Capacité d'autofinancement", m.caf], ['Total des ressources', m.pfR, 'tot'], ['Solde de l\'année', m.pfS], ['Trésorerie cumulée', m.pfC, 'tot']])}
        </div></div>
        <h3 style="margin-top:12px">Trésorerie mensuelle · année 1</h3>
        <div class="scroll-x"><table class="tbl res"><thead><tr><th></th>${m.tr.map((t, i) => `<th class="num">M${i + 1}</th>`).join('')}</tr></thead><tbody>
          <tr><td>Encaissements</td>${m.tr.map(t => `<td class="num">${eur(t.enc)}</td>`).join('')}</tr>
          <tr><td>Décaissements</td>${m.tr.map(t => `<td class="num">${eur(-t.dec)}</td>`).join('')}</tr>
          <tr class="tot"><td>Trésorerie fin de mois</td>${m.tr.map(t => `<td class="num">${eur(t.cum)}</td>`).join('')}</tr></tbody></table></div>
        <p class="muted" style="font-size:.8rem">Modèle simplifié en HT : TVA non modélisée, investissements et financements au mois 1, impôt sur les sociétés payé l'année suivante. IS calculé au taux réduit de 15 % jusqu'à 42 500 € de bénéfice (conditions PME), 25 % au-delà. Estimation à faire valider par un expert-comptable.</p>`;
      store.set('izy_kpi_complet', { nom: f.nom, forme: f.forme, ca: m.ca, rn: m.rn, caf: m.caf, sr: m.sr, invT: m.invT, apports: m.apports, prime: m.prime, empT: m.empT, subv: m.subv, besoins: m.besoinsInit, minT, date: today() });
    };
    wire(root, 'izy_prev_complet', compute, getState, setState, COMP_DEMO, COMP_BLANK);
    root.addEventListener('click', e => { if (e.target.closest('[data-act="xlsx"]')) compXlsx(getState()); });
  }

  function compXlsx(s) {
    const X = xl(); if (!X) return;
    const m = compModel(s), f = s.f, H = 'Hypothèses', h = r => `'${H}'!${r}`;
    const hyp = [['IzyCréa — Prévisionnel complet sur 3 ans'], ['Projet', f.nom || ''], ['Porteur', f.porteur || ''], ['Forme juridique', f.forme], ['Imposition (IS/IR)', f.regime], ['Édité le', today()], []];
    const ref = {};
    const put = (k, label, v, z = EUR) => { hyp.push([label, { v, z }]); ref[k] = 'B' + hyp.length; };
    const put3 = (k, label, arr, z = EUR) => { hyp.push([label, ...arr.map(v => ({ v, z }))]); ref[k] = hyp.length; };
    hyp.push(['Paramètres', 'Valeur']);
    put('achats', 'Achats consommés (% du CA)', num(f.achats) / 100, PCT);
    put('dc', 'Délai clients (jours)', num(f.dc), '0'); put('df', 'Délai fournisseurs (jours)', num(f.df), '0'); put('ds', "Stock moyen (jours d'achats)", num(f.ds), '0');
    put('tdir', 'Cotisations dirigeant (% du net)', num(f.tdir) / 100, PCT); put('tsal', 'Charges patronales (% du brut)', num(f.tsal) / 100, PCT);
    put('capital', 'Apport en capital', num(f.capital)); put('cc', 'Apport en compte courant', num(f.cc)); put('prime', 'Prime création PSE / RCC', num(f.prime));
    put('ph', "Prêt d'honneur (apport)", num(f.ph)); put('subv', 'Subventions', num(f.subv)); put('tinit', 'Trésorerie de sécurité visée', num(f.tresoinit));
    hyp.push([]); hyp.push(['Par année', 'Année 1', 'Année 2', 'Année 3']);
    put3('ca', "Chiffre d'affaires HT", m.ca); put3('taxes', 'Impôts et taxes', m.taxes); put3('dir', 'Rémunération nette dirigeant', m.dir); put3('sal', 'Salaires bruts salariés', m.sal);
    hyp.push([]); hyp.push(['Charges externes', 'Année 1', 'Année 2', 'Année 3']);
    const c0 = hyp.length + 1; s.charges.forEach(l => hyp.push([l.l || 'Charge', { v: num(l.y1), z: EUR }, { v: num(l.y2), z: EUR }, { v: num(l.y3), z: EUR }])); if (!s.charges.length) hyp.push(['(aucune)', 0, 0, 0]); const c1 = hyp.length;
    hyp.push([]); hyp.push(['Investissements', 'Montant HT', 'Amortissement (ans)']);
    const i0 = hyp.length + 1; s.inv.forEach(l => hyp.push([l.l || 'Investissement', { v: num(l.m), z: EUR }, Math.round(num(l.d))])); if (!s.inv.length) hyp.push(['(aucun)', 0, 0]); const i1 = hyp.length;
    hyp.push([]); hyp.push(['Emprunts', 'Montant', 'Taux annuel', 'Durée (mois)']);
    const loans = s.loan.filter(l => num(l.m) > 0);
    const l0 = hyp.length + 1; loans.forEach(l => hyp.push([l.l || 'Emprunt', { v: num(l.m), z: EUR }, { v: num(l.t) / 100, z: '0.00%' }, Math.round(num(l.n))]));
    // Feuille Emprunts : échéancier mensuel avec formules
    const E = [['Échéancier des emprunts (36 premiers mois)'], []];
    const ecol = []; // pour chaque emprunt : colonnes intérêts et capital
    const hdr = ['Mois', 'Année'];
    loans.forEach((l, k) => { hdr.push(`${l.l || 'Emprunt ' + (k + 1)} — capital début`, 'Intérêts', 'Capital remboursé', 'Mensualité'); });
    E.push(hdr);
    const sched = m.loans;
    for (let i = 1; i <= 36; i++) {
      const row = [i, Math.ceil(i / 12)]; const R = E.length + 1;
      loans.forEach((l, k) => {
        const hr = l0 + k, base = 2 + k * 4, cS = col(base), cI = col(base + 1), cP = col(base + 2), cM = col(base + 3);
        const pay = `IF(${h('D' + hr)}>0,PMT(${h('C' + hr)}/12,${h('D' + hr)},-${h('B' + hr)}),0)`;
        const L = sched[k].rows[i - 1];
        row.push({ f: i === 1 ? h('B' + hr) : `${cS}${R - 1}-${cP}${R - 1}`, v: L.start, z: EUR });
        row.push({ f: `IF(A${R}<=${h('D' + hr)},${cS}${R}*${h('C' + hr)}/12,0)`, v: L.it, z: EUR });
        row.push({ f: `IF(A${R}<=${h('D' + hr)},MIN(${cS}${R},${pay}-${cI}${R}),0)`, v: L.pr, z: EUR });
        row.push({ f: `${cI}${R}+${cP}${R}`, v: L.it + L.pr, z: EUR });
        ecol[k] = { cI, cP };
      });
      E.push(row);
    }
    const eR0 = 4, eR1 = 39;
    const wsE = sheet(E, [8, 8, ...loans.flatMap(() => [22, 14, 16, 14])]);
    // Feuille Résultats
    const Yc = ['B', 'C', 'D'];
    const R = [['IzyCréa — Prévisionnel financier : ' + (f.nom || '')], [], ['Compte de résultat', 'Année 1', 'Année 2', 'Année 3']];
    const r = {};
    const add = (k, label, fn, vals, z = EUR) => { R.push([label, ...[0, 1, 2].map(y => ({ f: fn(y, Yc[y]), v: vals[y], z }))]); r[k] = R.length; };
    add('ca', "Chiffre d'affaires", (y, c) => h(c + ref.ca), m.ca);
    add('ach', 'Achats consommés', (y, c) => `${c}${r.ca}*${h(ref.achats)}`, m.ach);
    add('marge', 'Marge brute', (y, c) => `${c}${r.ca}-${c}${r.ach}`, m.marge);
    add('ext', 'Charges externes', (y, c) => `SUM(${h(c + c0 + ':' + c + c1)})`, m.ext);
    add('va', 'Valeur ajoutée', (y, c) => `${c}${r.marge}-${c}${r.ext}`, m.va);
    add('tax', 'Impôts et taxes', (y, c) => h(c + ref.taxes), m.taxes);
    add('dir', 'Rémunération nette dirigeant', (y, c) => h(c + ref.dir), m.dir);
    add('dirc', 'Cotisations dirigeant', (y, c) => `${c}${r.dir}*${h(ref.tdir)}`, m.dirc);
    add('sal', 'Salaires bruts', (y, c) => h(c + ref.sal), m.sal);
    add('salc', 'Charges patronales', (y, c) => `${c}${r.sal}*${h(ref.tsal)}`, m.salc);
    add('ebe', "Excédent brut d'exploitation", (y, c) => `${c}${r.va}-${c}${r.tax}-${c}${r.dir}-${c}${r.dirc}-${c}${r.sal}-${c}${r.salc}`, m.ebe);
    add('dap', 'Dotations aux amortissements', (y) => { const C = h('C' + i0 + ':C' + i1), B = h('B' + i0 + ':B' + i1); return `SUMPRODUCT((${C}>=${y + 1})*(${C}>0)*${B}/(${C}+(${C}=0)))`; }, m.dap);
    add('rex', "Résultat d'exploitation", (y, c) => `${c}${r.ebe}-${c}${r.dap}`, m.rex);
    const yr = y => `Emprunts!$B$${eR0}:$B$${eR1}=${y + 1}`;
    add('int', 'Charges financières', (y) => loans.length ? loans.map((l, k) => `SUMPRODUCT((${yr(y)})*Emprunts!$${ecol[k].cI}$${eR0}:$${ecol[k].cI}$${eR1})`).join('+') : '0', m.int);
    add('rc', 'Résultat courant avant impôt', (y, c) => `${c}${r.rex}-${c}${r.int}`, m.rc);
    add('is', 'Impôt sur les sociétés', (y, c) => `IF('${H}'!$B$5="IS",IF(${c}${r.rc}>0,MIN(${c}${r.rc},42500)*0.15+MAX(${c}${r.rc}-42500,0)*0.25,0),0)`, m.is);
    add('rn', 'Résultat net', (y, c) => `${c}${r.rc}-${c}${r.is}`, m.rn);
    add('caf', "Capacité d'autofinancement", (y, c) => `${c}${r.rn}+${c}${r.dap}`, m.caf);
    R.push([]); R.push(['Seuil de rentabilité', 'Année 1', 'Année 2', 'Année 3']);
    add('cf', 'Charges fixes', (y, c) => `${c}${r.ext}+${c}${r.tax}+${c}${r.dir}+${c}${r.dirc}+${c}${r.sal}+${c}${r.salc}+${c}${r.dap}+${c}${r.int}`, m.cf);
    add('tm', 'Taux de marge sur coûts variables', (y, c) => `IF(${c}${r.ca}>0,${c}${r.marge}/${c}${r.ca},0)`, m.tm, PCT);
    add('sr', 'Seuil de rentabilité', (y, c) => `IF(${c}${r.tm}>0,${c}${r.cf}/${c}${r.tm},0)`, m.sr.map(x => x || 0));
    R.push([]); R.push(['Besoin en fonds de roulement', 'Année 1', 'Année 2', 'Année 3']);
    add('bfr', 'BFR', (y, c) => `${c}${r.ca}*${h(ref.dc)}/360+${c}${r.ach}*${h(ref.ds)}/360-(${c}${r.ach}+${c}${r.ext})*${h(ref.df)}/360`, m.bfr);
    add('dbfr', 'Variation du BFR', (y, c) => y ? `${c}${r.bfr}-${Yc[y - 1]}${r.bfr}` : `${c}${r.bfr}`, m.dbfr);
    R.push([]); R.push(['Plan de financement initial', 'Démarrage']);
    const one = (k, label, fx, v) => { R.push([label, { f: fx, v, z: EUR }]); r[k] = R.length; };
    one('inv', 'Investissements', `SUM(${h('B' + i0 + ':B' + i1)})`, m.invT);
    one('bfri', 'Besoin en fonds de roulement', `MAX(0,B${r.bfr})`, Math.max(0, m.bfr[0]));
    one('ti', 'Trésorerie de sécurité', h(ref.tinit), m.tinit);
    one('bes', 'Total des besoins', `B${r.inv}+B${r.bfri}+B${r.ti}`, m.besoinsInit);
    one('app', "Apports (capital, compte courant, prime, prêt d'honneur)", `${h(ref.capital)}+${h(ref.cc)}+${h(ref.prime)}+${h(ref.ph)}`, m.apports);
    one('emp', 'Emprunts', loans.length ? `SUM(${h('B' + l0 + ':B' + (l0 + loans.length - 1))})` : '0', m.empT);
    one('sub', 'Subventions', h(ref.subv), m.subv);
    one('res', 'Total des ressources', `B${r.app}+B${r.emp}+B${r.sub}`, m.ressInit);
    one('ecart', 'Écart', `B${r.res}-B${r.bes}`, m.ressInit - m.besoinsInit);
    R.push([]); R.push(['Plan de financement sur 3 ans', 'Année 1', 'Année 2', 'Année 3']);
    add('pinv', 'Investissements', (y) => y ? '0' : `B${r.inv}`, [m.invT, 0, 0]);
    add('pbfr', 'Variation du BFR', (y, c) => `${c}${r.dbfr}`, m.dbfr);
    add('ppr', 'Remboursement des emprunts', (y) => loans.length ? loans.map((l, k) => `SUMPRODUCT((${yr(y)})*Emprunts!$${ecol[k].cP}$${eR0}:$${ecol[k].cP}$${eR1})`).join('+') : '0', m.princ);
    add('pb', 'Total des besoins', (y, c) => `${c}${r.pinv}+${c}${r.pbfr}+${c}${r.ppr}`, m.pfB);
    add('pr', 'Total des ressources (apports, emprunts, subventions, CAF)', (y, c) => y ? `${c}${r.caf}` : `B${r.app}+B${r.emp}+B${r.sub}+${c}${r.caf}`, m.pfR);
    add('ps', "Solde de l'année", (y, c) => `${c}${r.pr}-${c}${r.pb}`, m.pfS);
    const rowPc = R.length + 1;
    add('pc', 'Trésorerie cumulée', (y, c) => y ? `${Yc[y - 1]}${rowPc}+${c}${r.ps}` : `${c}${r.ps}`, m.pfC);
    R.push([]); R.push(['Modèle simplifié en HT. IS : 15 % jusqu\'à 42 500 €, 25 % au-delà (conditions PME). Estimation à faire valider par un expert-comptable.']);
    const wsR = sheet(R, [52, 16, 16, 16]);
    // Feuille Trésorerie (valeurs)
    const Tz = [['Trésorerie mensuelle — année 1 (valeurs calculées par IzyCréa, modèle simplifié HT)'], [], ['', ...m.tr.map((t, i) => 'M' + (i + 1))],
      ['Encaissements', ...m.tr.map(t => ({ v: t.enc, z: EUR }))], ['Décaissements', ...m.tr.map(t => ({ v: t.dec, z: EUR }))], ['Trésorerie fin de mois', ...m.tr.map(t => ({ v: t.cum, z: EUR }))]];
    const wsT = sheet(Tz, [26, ...Array(12).fill(12)]);
    const wsH = sheet(hyp, [40, 16, 16, 16]);
    const wb = X.utils.book_new();
    X.utils.book_append_sheet(wb, wsR, 'Résultats');
    X.utils.book_append_sheet(wb, wsT, 'Trésorerie an 1');
    X.utils.book_append_sheet(wb, wsH, H);
    X.utils.book_append_sheet(wb, wsE, 'Emprunts');
    X.writeFile(wb, fileName('izy_prev_complet', 'xlsx'));
    toast('Fichier Excel téléchargé');
  }

  /* =====================================================================
     3. BUSINESS MODEL CANVAS
     ===================================================================== */
  const BMC = [
    ['kp', 'Partenaires clés', '🤝', 'Fournisseurs, sous-traitants, prescripteurs, réseaux : sur qui le projet s\'appuie-t-il ?'],
    ['ka', 'Activités clés', '⚙️', 'Ce que le porteur doit faire chaque semaine pour que le modèle fonctionne.'],
    ['kr', 'Ressources clés', '🧰', 'Compétences, matériel, local, financement, autorisations.'],
    ['vp', 'Proposition de valeur', '💎', 'Quel problème résout-on, pour qui, et pourquoi mieux que les concurrents ?'],
    ['cr', 'Relation client', '💬', 'Comment on gagne, garde et fidélise les clients.'],
    ['ch', 'Canaux', '📣', 'Comment les clients découvrent l\'offre, achètent et sont livrés.'],
    ['cs', 'Segments de clients', '🎯', 'Pour qui crée-t-on de la valeur ? Les clients les plus importants.'],
    ['co', 'Structure de coûts', '💸', 'Les coûts principaux : fixes, variables, investissements.'],
    ['rs', 'Sources de revenus', '💰', 'Ce que les clients paient, à quel prix, et comment.']
  ];
  const BMC_DEMO = { f: { nom: 'Au Bon Levain — micro-fournil bio', porteur: 'Porteur exemple', kp: 'Meunier bio local\nAMAP et épiceries du canton\nRéseau Initiative du département', ka: 'Fabrication quotidienne au levain\nVente au fournil et sur 2 marchés\nLivraisons aux épiceries', kr: 'Savoir-faire boulanger (CAP + 20 ans)\nFour à sole, pétrin\nLocal de 60 m² en centre-bourg', vp: 'Pain bio au levain naturel, longue fermentation, farines locales\nOuvert tôt pour les actifs du bourg', cr: 'Accueil personnalisé, carte de fidélité\nCommandes à l\'avance par SMS', ch: 'Boutique du fournil\nMarchés du mardi et du samedi\nÉpiceries partenaires', cs: 'Habitants du bourg et des villages voisins\nClientèle sensible au bio et au local\nÉpiceries fines', co: 'Farine et matières premières (≈ 32 % du CA)\nLoyer, énergie\nRemboursement du prêt four', rs: 'Vente de pains et viennoiseries (panier moyen 9 €)\nVente aux épiceries (prix revendeur)' } };
  function bmcHTML() {
    return head('Outil', 'Business model canvas', "Les 9 blocs du modèle économique sur une page. Une idée par ligne : le canevas s'imprime en PDF au format paysage.") + `
    <div class="wrap tool" id="tool" data-key="izy_bmc" data-orient="landscape">
      ${bar()}
      <div class="fields no-print" style="margin-bottom:16px">${F('nom', 'Projet', { type: 'text' })}${F('porteur', 'Porteur', { type: 'text' })}</div>
      <div class="print-only" id="bmcPrintHead"></div>
      <div class="bmc">${BMC.map(([k, t, i, q]) => `<div class="cell ${k}"><h4>${i} ${t}</h4><small>${q}</small><textarea data-k="${k}" aria-label="${t}"></textarea></div>`).join('')}</div>
      <p class="muted no-print" style="font-size:.85rem;margin-top:16px">Pour aller plus loin sur chaque bloc : <a href="https://www.lecoindesentrepreneurs.fr/preparation-projet-creation-entreprise/modele-economique-business-model/" target="_blank" rel="noopener">Le Coin des Entrepreneurs ↗</a></p>
    </div>`;
  }
  function bmcInit() {
    const root = $('#tool');
    const getState = () => ({ f: readFields(root) });
    const setState = s => writeFields(root, (s && s.f) || {});
    const compute = () => { const v = readFields(root); $('#bmcPrintHead').innerHTML = `<h2 style="margin:0">Business model canvas — ${esc(v.nom || 'Projet')}</h2><p class="muted" style="margin:0 0 8px">${esc(v.porteur || '')} · ${today()} · IzyCréa</p>`; };
    wire(root, 'izy_bmc', compute, getState, setState, BMC_DEMO, { f: {} });
  }

  /* =====================================================================
     4. DOSSIER DE PRÉSENTATION
     ===================================================================== */
  const DOS = [
    ['porteur', 'Le porteur de projet', 'Parcours, compétences clés, motivations, situation (PSE, RCC, congé de reclassement…).'],
    ['projet', 'Le projet', 'Activité, produits ou services, lieu d\'implantation, date de démarrage visée.'],
    ['marche', 'Le marché', 'Clientèle cible, taille du marché, tendances, sources utilisées (dossier projecteur, enquêtes…).'],
    ['concurrence', 'La concurrence', 'Concurrents directs et indirects, prix pratiqués, éléments de différenciation.'],
    ['offre', "L'offre et les prix", 'Gamme, prix de vente, panier moyen, saisonnalité.'],
    ['commercial', 'La stratégie commerciale', 'Canaux de vente, communication, premiers clients, partenaires prescripteurs.'],
    ['moyens', 'Les moyens', 'Local, matériel, fournisseurs, recrutements prévus, assurances.'],
    ['juridique', 'Statut juridique, fiscal et social', 'Forme retenue et pourquoi, régime fiscal, régime social du dirigeant, aides (Acre, ARCE ou ARE).'],
    ['calendrier', 'Le calendrier', 'Étapes clés jusqu\'au démarrage et sur la première année.'],
    ['risques', 'Risques et points de vigilance', 'Principaux risques et réponses prévues.'],
    ['avis', "L'avis du consultant", "Cohérence personne / projet, réalisme des hypothèses, conditions d'admission ou de versement à surveiller."]
  ];
  const DOS_DEMO = { f: { nom: 'Au Bon Levain — micro-fournil bio', porteur_nom: 'Porteur exemple', consultant: 'Consultant IzyCréa', prime: 25000, k_ca: 135000, k_ca3: 180000, k_res: 21296, k_sr: 99209, k_besoins: 66500, k_apports: 55000, k_emprunts: 40000,
    porteur: "20 ans d'expérience en production alimentaire, CAP boulanger obtenu en 2025. Départ volontaire dans le cadre d'un PSE, congé de reclassement de 10 mois.", projet: 'Micro-fournil bio au levain en centre-bourg, vente au fournil, sur deux marchés et à trois épiceries. Démarrage visé en mars.', marche: "Bourg de 4 500 habitants sans boulangerie bio, 12 000 habitants dans un rayon de 10 km. Dossier projecteur Bpifrance « Boulangerie » et enquête auprès de 80 habitants.", concurrence: '2 boulangeries traditionnelles (pas de bio), 1 grande surface. Différenciation : levain naturel, farines locales, ouverture 6h30.', offre: 'Pains au levain (4 à 7 €), viennoiseries le week-end. Panier moyen estimé à 9 €.', commercial: "Ouverture annoncée par la presse locale et les réseaux sociaux, dégustations sur les marchés, partenariat avec l'AMAP.", moyens: 'Local de 60 m² (bail signé sous condition), four à sole d’occasion révisé, pétrin. Embauche d’un apprenti en année 2.', juridique: "EURL à l'IS, gérant associé unique au régime des indépendants. Rémunération progressive du gérant dès la première année. Acre demandée.", calendrier: 'Formation hygiène en janvier, travaux en février, ouverture le 1er mars.', risques: 'Dépendance au four (contrat de maintenance), saisonnalité estivale (marchés touristiques en compensation).', avis: 'Projet cohérent avec le parcours et la motivation du porteur. Hypothèses de chiffre d’affaires prudentes au regard du dossier projecteur. Prime création conditionnée à l’immatriculation pendant le congé : à caler avec le calendrier.' } };
  function dossierHTML() {
    return head('Outil', 'Dossier de présentation', "Le projet présenté proprement pour la commission de suivi, un réseau de prêt d'honneur ou la banque. Les chiffres du prévisionnel s'importent en un clic.") + `
    <div class="wrap tool" id="tool" data-key="izy_dossier">
      ${bar(`<button class="btn pri" data-act="import">${ICON.open}Importer les chiffres</button>`)}
      <div class="two">
        <div class="no-print">
          <div class="panel"><h3><span class="num">✦</span>En-tête</h3><div class="fields">
            ${F('nom', 'Nom du projet', { type: 'text' })}${F('porteur_nom', 'Porteur', { type: 'text' })}${F('consultant', 'Consultant', { type: 'text' })}
            ${F('prime', 'Prime création PSE / RCC', { hint: '€ — saisie manuelle', pse: true })}
          </div></div>
          ${DOS.map(([k, t, q], i) => `<div class="panel"><h3><span class="num">${i + 1}</span>${t}</h3>${F(k, '', { type: 'textarea', wide: true, ph: q })}</div>`).join('')}
          <div class="panel"><h3><span class="num">€</span>Chiffres clés</h3><div id="kfields" class="fields">
            ${F('k_ca', "CA année 1", { hint: '€' })}${F('k_ca3', 'CA année 3', { hint: '€' })}${F('k_res', 'Résultat ou revenu an 1', { hint: '€' })}${F('k_besoins', 'Besoins de démarrage', { hint: '€' })}
            ${F('k_apports', 'Apports', { hint: '€' })}${F('k_emprunts', 'Emprunts', { hint: '€' })}${F('k_sr', 'Seuil de rentabilité', { hint: '€' })}
          </div></div>
        </div>
        <div class="sticky"><div class="panel" id="doc" style="padding:34px"></div></div>
      </div>
    </div>`;
  }
  function dossierInit() {
    const root = $('#tool');
    const getState = () => ({ f: readFields(root) });
    const setState = s => writeFields(root, (s && s.f) || {});
    const compute = () => {
      const v = readFields(root);
      const k = [['CA année 1', v.k_ca], ['CA année 3', v.k_ca3], ['Résultat / revenu an 1', v.k_res], ['Seuil de rentabilité', v.k_sr], ['Besoins de démarrage', v.k_besoins], ['Apports', v.k_apports], ['Emprunts', v.k_emprunts], ['Prime création PSE / RCC', v.prime]].filter(x => x[1] !== '' && x[1] != null);
      $('#doc').innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px"><div><div class="eyebrow">Dossier de présentation</div><h2 style="margin:0 0 4px">${esc(v.nom || 'Nom du projet')}</h2><p class="muted" style="margin:0">${esc(v.porteur_nom || 'Porteur')}${v.consultant ? ' · accompagné par ' + esc(v.consultant) : ''} · ${today()}</p></div><span class="logo-txt small">izy<b>créa</b></span></div>
        ${k.length ? `<div class="kpis" style="margin-top:20px">${k.map(([l, x]) => `<div class="kpi"><span>${l}</span><b>${eur(num(x))}</b></div>`).join('')}</div>` : ''}
        ${DOS.map(([key, t]) => v[key] ? `<h3 style="margin-top:22px">${t}</h3><p style="white-space:pre-wrap;color:var(--ink2);margin:0">${esc(v[key])}</p>` : '').join('') || '<p class="muted" style="margin-top:24px">Remplissez les rubriques : le dossier se compose ici en direct.</p>'}
        <p class="muted" style="font-size:.78rem;margin-top:28px">Document préparé avec IzyCréa. Les chiffres sont des prévisions fondées sur les hypothèses du porteur.</p>`;
    };
    wire(root, 'izy_dossier', compute, getState, setState, DOS_DEMO, { f: {} });
    root.addEventListener('click', e => {
      if (!e.target.closest('[data-act="import"]')) return;
      const c = store.get('izy_kpi_complet'), mi = store.get('izy_kpi_micro');
      const src = c && c.ca && c.ca[0] ? c : mi && mi.ca && mi.ca[0] ? mi : null;
      if (!src) { toast("Aucun prévisionnel trouvé : remplissez d'abord un prévisionnel sur cet appareil"); return; }
      const set = (id, val) => { const el = $('#' + id); if (el && val != null && isFinite(val)) el.value = Math.round(val); };
      set('k_ca', src.ca[0]); set('k_ca3', src.ca[2]);
      if (src === c) { set('k_res', c.rn[0]); set('k_besoins', c.besoins); set('k_apports', c.apports); set('k_emprunts', c.empT); set('k_sr', c.sr[0]); set('prime', c.prime || null); }
      else { set('k_res', mi.net[0]); set('k_apports', mi.apport); set('prime', mi.prime || null); }
      if (!$('#nom').value && src.nom) $('#nom').value = src.nom;
      root.dispatchEvent(new Event('input')); toast('Chiffres importés depuis le ' + (src === c ? 'prévisionnel complet' : 'prévisionnel micro'));
    });
  }

  // impression : les zones de texte sont recopiées dans des blocs qui s'agrandissent
  window.addEventListener('beforeprint', () => {
    $$('textarea[data-k]').forEach(t => { let d = t.nextElementSibling; if (!d || !d.classList.contains('ta-print')) { d = document.createElement('div'); d.className = 'ta-print'; t.after(d); } d.textContent = t.value; });
  });

  window.IZY_TOOLS = {
    'previsionnel-micro': { html: microHTML, init: microInit },
    'previsionnel-complet': { html: compHTML, init: compInit },
    'bmc': { html: bmcHTML, init: bmcInit },
    'dossier': { html: dossierHTML, init: dossierInit }
  };
  // exposé pour les tests
  window.IZY_MODELS = { microModel, compModel, acreMonths };
})();
