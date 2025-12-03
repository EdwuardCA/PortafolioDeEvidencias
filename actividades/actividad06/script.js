// ======= Estado y utilidades =======
let patternsData = null;
let history = [];
let stats = { totalConversions: 0, satisfactory: 0, totalPatterns: 0, score: 0 };

const defaultPatterns = {
    patterns: [
        { id: 1, natural: "la suma de {a} y {b}", algebraic: "{a} + {b}", category: "operaciones_basicas" },
        { id: 2, natural: "la resta de {a} y {b}", algebraic: "{a} − {b}", category: "operaciones_basicas" },
        { id: 3, natural: "el producto de {a} y {b}", algebraic: "{a} × {b}", category: "operaciones_basicas" },
        { id: 4, natural: "{a} dividido por {b}", algebraic: "{a} ÷ {b}", category: "operaciones_basicas" },
        { id: 5, natural: "la suma de los cuadrados de {x} y {y}", algebraic: "{x}^2 + {y}^2", category: "combinadas" },
        { id: 6, natural: "la {f} es igual al producto de la {m} y la {a}", algebraic: "{f} = {m} × {a}", category: "fisica" }
    ]
};

const $ = (id) => document.getElementById(id);
const setText = (id, val) => { const el = $(id); if (el) el.textContent = val; };
function updateStats() {
    setText('stat-pat', stats.totalPatterns);
    setText('stat-conv', stats.totalConversions);
    setText('stat-sat', stats.satisfactory);
    setText('stat-score', stats.score);
    const pct = Math.max(0, Math.min(100, Math.round((stats.score / 100) * 100)));
    $('bar').style.width = pct + '%';
}
function pushHistory(type, input, output) {
    history.push({ type, input, output, ts: new Date().toISOString() });
    const box = $('history'); box.innerHTML = '';
    [...history].reverse().forEach(h => {
        const div = document.createElement('div'); div.className = 'item';
        div.textContent = `[${h.type}] ${h.input} => ${h.output}`;
        box.appendChild(div);
    });
    if (!history.length) { box.innerHTML = '<p class="no-history">No hay conversiones aún</p>'; }
}
function normalizeAlg(s) {
    return String(s)
        .replace(/\s+/g, '')
        .replace(/²/g, '^2')
        .replace(/³/g, '^3')
        .replace(/\*/g, '×')
        .replace(/\//g, '÷')
        .replace(/-/g, '−')
        .toLowerCase();
}
function normalizeNat(s) {
    return String(s).toLowerCase().replace(/\s+/g, ' ').trim();
}
function substitute(template, vars) {
    let out = template;
    for (const [k, v] of Object.entries(vars)) {
        out = out.replace(new RegExp('\\{' + k + '\\}', 'g'), v);
    }
    return out;
}

// ======= Matchers robustos =======
function matchNaturalPattern(input, pattern) {
    const inp = normalizeNat(input);
    let regex = pattern.toLowerCase();
    const variables = {}; let idx = 0;
    regex = regex.replace(/\{(\w+)\}/g, (_, name) => { variables[name] = idx++; return '([a-z0-9_]+)'; });
    regex = regex.replace(/\s+/g, '\\s*');
    regex = '^\\s*' + regex + '\\s*$';
    const m = inp.match(new RegExp(regex));
    if (!m) return { isMatch: false, variables: {} };
    const out = {};
    for (const [name, i] of Object.entries(variables)) { out[name] = m[i + 1]; }
    return { isMatch: true, variables: out };
}

function matchAlgebraicPattern(input, pattern) {
    const a = normalizeAlg(input);
    let p = normalizeAlg(pattern);
    // Escapar caracteres especiales (menos llaves)
    let rx = p.replace(/[-\/\\^$*+?.()|[\]]/g, '\\$&').replace(/\\\{/g, '{').replace(/\\\}/g, '}');
    const variables = {}; let idx = 0;
    rx = rx.replace(/\{(\w+)\}/g, (_, name) => { variables[name] = idx++; return '([a-z0-9_]+)'; });
    rx = '^\\s*' + rx + '\\s*$';
    const m = a.match(new RegExp(rx));
    if (!m) return { isMatch: false, variables: {} };
    const out = {}; for (const [name, i] of Object.entries(variables)) { out[name] = m[i + 1]; }
    return { isMatch: true, variables: out };
}

// ======= Conversión principal =======
function convertNaturalToAlgebraicText(input) {
    if (!patternsData || !patternsData.patterns?.length) { return "Error: no hay patrones cargados"; }
    for (const pat of patternsData.patterns) {
        const mt = matchNaturalPattern(input, pat.natural);
        if (mt.isMatch) { return substitute(pat.algebraic, mt.variables); }
    }
    return "No se encontró un patrón coincidente. Considera agregar este caso a los patrones.";
}

function convertAlgebraicToNaturalText(input) {
    if (!patternsData || !patternsData.patterns?.length) { return "Error: no hay patrones cargados"; }
    for (const pat of patternsData.patterns) {
        const mt = matchAlgebraicPattern(input, pat.algebraic);
        if (mt.isMatch) { return substitute(pat.natural, mt.variables); }
    }
    return "No se encontró un patrón coincidente. Considera agregar este caso a los patrones.";
}

// ======= Validación simple =======
function invalidNatural(s) {
    return !s || s.length < 3;
}
function invalidAlg(s) {
    return !s || !/[a-z]/i.test(s);
}

// ======= Complejos =======
function parseComplex(str) {
    if (!str) return null;
    let s = str.replace(/\s+/g, '').toLowerCase();
    if (s === 'i') s = '0+1i';
    if (s === '-i') s = '0-1i';
    if (/i/.test(s)) {
        const m = s.match(/^([+\-]?\d+(?:\.\d+)?)?([+\-]\d*(?:\.\d+)?)i$/);
        if (m) {
            const re = m[1] ? parseFloat(m[1]) : 0;
            const t = m[2];
            const im = (t === '+' || t === '') ? 1 : (t === '-' ? -1 : parseFloat(t));
            return { re, im };
        }
        const m2 = s.match(/^([+\-]?\d+(?:\.\d+)?)([+\-]\d+(?:\.\d+)?)i$/);
        if (m2) { return { re: parseFloat(m2[1]), im: parseFloat(m2[2]) }; }
    } else {
        if (/^[+\-]?\d+(\.\d+)?$/.test(s)) { return { re: parseFloat(s), im: 0 }; }
    }
    return null;
}
function analyzeComplex() {
    const raw = $('cx-input').value;
    const z = parseComplex(raw);
    if (!z) { stats.score -= 2; updateStats(); $('cx-out').textContent = 'Entrada inválida. Usa formato a+bi (ej: 3-4i)'; return; }
    const { re, im } = z;
    const mod = Math.hypot(re, im);
    const arg = Math.atan2(im, re);
    let clase = (im === 0) ? 'Real' : (re === 0 ? 'Imaginario puro' : 'Complejo no real');
    const polar = `${mod.toFixed(4)} · (cos(${arg.toFixed(4)}) + i·sin(${arg.toFixed(4)}))`;
    const res = [
        `Número: ${re} ${im < 0 ? '-' : '+'} ${Math.abs(im)}i`,
        `Clasificación: ${clase}`,
        `Módulo |z| = ${mod.toFixed(4)}`,
        `Argumento arg(z) = ${arg.toFixed(4)} rad`,
        `Forma polar: ${polar}`
    ].join('\\n');
    $('cx-out').textContent = res;
    stats.score += 5; updateStats();
}

// ======= Eventos UI =======
function init() {
    // Cargar patrones por defecto
    patternsData = JSON.parse(JSON.stringify(defaultPatterns));
    stats.totalPatterns = patternsData.patterns.length;
    updateStats();

    // Natural -> Algebraico
    $('btn-n2a').onclick = () => {
        const input = $('natural-input').value.trim();
        if (invalidNatural(input)) { stats.score -= 2; updateStats(); alert('Ingresa una expresión en lenguaje natural'); return; }
        const out = convertNaturalToAlgebraicText(input);
        $('natural-output').value = out;
        stats.totalConversions++; if (!out.startsWith('No se encontró')) stats.score += 5;
        pushHistory('N→A', input, out); updateStats();
    };
    $('btn-n-clear').onclick = () => { $('natural-input').value = ''; $('natural-output').value = ''; };

    // Algebraico -> Natural
    $('btn-a2n').onclick = () => {
        const input = $('alg-input').value.trim();
        if (invalidAlg(input)) { stats.score -= 2; updateStats(); alert('Ingresa una expresión algebraica'); return; }
        const out = convertAlgebraicToNaturalText(input);
        $('alg-output').value = out;
        stats.totalConversions++; if (!out.startsWith('No se encontró')) stats.score += 5;
        pushHistory('A→N', input, out); updateStats();
    };
    $('btn-a-clear').onclick = () => { $('alg-input').value = ''; $('alg-output').value = ''; };

    // Evaluación
    $('n-satisf').onclick = () => { stats.satisfactory++; stats.score += 3; updateStats(); };
    $('a-satisf').onclick = () => { stats.satisfactory++; stats.score += 3; updateStats(); };
    $('n-mejorar').onclick = () => { alert('Marcado para mejora. Considera agregar un nuevo patrón.'); };
    $('a-mejorar').onclick = () => { alert('Marcado para mejora. Considera agregar un nuevo patrón.'); };

    // Agregar patrón rápido
    $('n-add').onclick = () => {
        const natural = prompt('Nuevo patrón (natural):', 'la suma de {a} y {b}');
        if (!natural) return;
        const algebraic = prompt('Su forma algebraica:', '{a} + {b}');
        if (!algebraic) return;
        patternsData.patterns.push({ id: Date.now(), natural: natural.toLowerCase(), algebraic, category: 'personalizado' });
        stats.totalPatterns = patternsData.patterns.length; updateStats();
        alert('Patrón agregado 👍');
    };
    $('a-add').onclick = () => {
        const algebraic = prompt('Nuevo patrón (algebraico):', '{a} × {b}');
        if (!algebraic) return;
        const natural = prompt('Su forma natural:', 'el producto de {a} y {b}');
        if (!natural) return;
        patternsData.patterns.push({ id: Date.now(), natural: natural.toLowerCase(), algebraic, category: 'personalizado' });
        stats.totalPatterns = patternsData.patterns.length; updateStats();
        alert('Patrón agregado 👍');
    };

    // JSON loader (textarea, sin archivos externos)
    $('btn-load-json').onclick = () => {
        try {
            const data = JSON.parse($('json-area').value);
            if (!data || !Array.isArray(data.patterns)) throw new Error('Estructura inválida');
            patternsData = data;
            stats.totalPatterns = patternsData.patterns.length; updateStats();
            alert('Patrones cargados desde JSON');
        } catch (e) { alert('JSON inválido. Debe tener {"patterns":[...]}.'); }
    };
    $('btn-reset').onclick = () => {
        patternsData = JSON.parse(JSON.stringify(defaultPatterns));
        stats.totalPatterns = patternsData.patterns.length; updateStats();
        alert('Restablecido a patrones por defecto');
    };

    // Complejos
    $('btn-cx').onclick = analyzeComplex;
    $('btn-cx-clear').onclick = () => { $('cx-input').value = ''; $('cx-out').textContent = ''; };

    // Historial export/clear
    $('btn-export').onclick = () => {
        const blob = new Blob([JSON.stringify(history, null, 2)], { type: 'application/json' });
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'historial_conversor.json'; a.click();
    };
    $('btn-clear-hist').onclick = () => { history = []; $('history').innerHTML = '<p class="no-history">No hay conversiones aún</p>'; };
}
document.addEventListener('DOMContentLoaded', init);