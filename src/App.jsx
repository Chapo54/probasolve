import { useState, useRef, useEffect } from "react";
import "katex/dist/katex.min.css";
import katex from "katex";

// ── Types & exemples ──────────────────────────────────────────────────────────
const TYPES = [
  { id: "classique",      label: "Probabilités classiques",   emoji: "🎲" },
  { id: "conditionnelle", label: "Probabilité conditionnelle", emoji: "🔀" },
  { id: "bayes",          label: "Théorème de Bayes",          emoji: "🧮" },
  { id: "binomiale",      label: "Loi binomiale",              emoji: "📊" },
  { id: "normale",        label: "Loi normale",                emoji: "🔔" },
  { id: "poisson",        label: "Loi de Poisson",             emoji: "⚡" },
  { id: "combinatoire",   label: "Combinatoire",               emoji: "🔢" },
  { id: "esperance",      label: "Espérance & variance",       emoji: "📈" },
  { id: "autre",          label: "Autre",                      emoji: "✨" },
];

const EXAMPLES = {
  classique:      ["On lance un dé équilibré à 6 faces. Quelle est la probabilité d'obtenir un chiffre pair ?","Un sac contient 5 billes rouges, 3 bleues et 2 vertes. On tire une bille au hasard. Quelle est la probabilité qu'elle soit bleue ?"],
  conditionnelle: ["P(A)=0.4, P(B)=0.5, P(A∩B)=0.2. Calculer P(A|B) et P(B|A).","60% des élèves ont réussi les maths et 40% les deux matières. Sachant qu'un élève a réussi les maths, quelle est la probabilité qu'il ait réussi la physique ?"],
  bayes:          ["Une maladie touche 1% de la population. Un test a une sensibilité de 99% et une spécificité de 95%. Si une personne teste positive, quelle est la probabilité qu'elle soit malade ?"],
  binomiale:      ["On lance une pièce équilibrée 10 fois. Quelle est la probabilité d'obtenir exactement 6 faces ?","Un QCM a 5 questions avec 4 réponses chacune. En répondant au hasard, probabilité d'avoir au moins 3 bonnes réponses ?"],
  normale:        ["X suit une loi N(100, 15²). Calculer P(85 < X < 115) et P(X > 130).","La taille des adultes suit N(170, 8²) en cm. Quelle proportion mesure entre 162 et 178 cm ?"],
  poisson:        ["Un centre d'appels reçoit en moyenne 3 appels/min. Probabilité de recevoir exactement 5 appels en une minute ?"],
  combinatoire:   ["Combien de façons peut-on choisir 3 personnes parmi 10 pour former un comité ?","Un code de 4 chiffres (0-9) est formé sans répétition. Combien de codes sont possibles ?"],
  esperance:      ["X prend les valeurs 1,2,3,4 avec probabilités 0.1, 0.3, 0.4, 0.2. Calculer E(X) et Var(X).","On gagne 10€ si on tire pile, on perd 5€ si on tire face. Calculer l'espérance du gain."],
  autre:          ["On tire 5 cartes d'un jeu de 52. Quelle est la probabilité d'avoir exactement une paire ?"],
};

const SYSTEM = `Tu es un professeur expert en probabilités et statistiques. Tu résous des exercices avec des explications pédagogiques complètes en français.

TRÈS IMPORTANT : Utilise la notation LaTeX pour TOUTES les expressions mathématiques.
- Formules en ligne : $formule$  (ex: $P(A) = \\frac{1}{2}$)
- Formules en bloc  : $$formule$$  sur sa propre ligne
- Utilise LaTeX pour : fractions, exposants, indices, racines, sommes, combinaisons $\\binom{n}{k}$, symboles grecs ($\\alpha$, $\\lambda$, $\\mu$, $\\sigma$), intégrales, etc.

Structure ta réponse avec ces sections exactes :

**📌 Analyse du problème**
Identifier le type, les données et ce qu'on cherche.

**📐 Théorie et formules**
La formule principale en LaTeX display ($$...$$).

**✏️ Résolution étape par étape**
Étapes numérotées (1., 2., 3...) avec tous les calculs en LaTeX.

**✅ Résultat final**
La réponse finale avec la valeur numérique en LaTeX.

**💡 Interprétation**
Que signifie ce résultat concrètement ?

**📌 À retenir**
La formule clé en LaTeX.`;

// ── KaTeX rendering ───────────────────────────────────────────────────────────
function esc(s) {
  return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}

function renderMathHTML(raw) {
  const segments = raw.split(/((?:\$\$[\s\S]+?\$\$|\$[^\$\n]+?\$))/g);
  return segments.map(seg => {
    if (seg.startsWith("$$") && seg.endsWith("$$") && seg.length > 4) {
      try { return `<span class="kd">${katex.renderToString(seg.slice(2,-2).trim(), { displayMode: true, throwOnError: false })}</span>`; }
      catch { return esc(seg); }
    }
    if (seg.startsWith("$") && seg.endsWith("$") && seg.length > 2) {
      try { return katex.renderToString(seg.slice(1,-1).trim(), { displayMode: false, throwOnError: false }); }
      catch { return esc(seg); }
    }
    return esc(seg)
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*([^*\n]+?)\*/g, "<em>$1</em>");
  }).join("");
}

function MathContent({ text }) {
  const lines = text.split("\n");
  return (
    <div style={{ lineHeight: 1.85, fontSize: 15 }}>
      {lines.map((line, i) => {
        const t = line.trim();
        if (!t) return <div key={i} style={{ height: "0.4em" }} />;
        const stepM = t.match(/^(\d+)\.\s([\s\S]*)/);
        if (stepM) {
          return (
            <div key={i} style={{ display:"flex", gap:10, marginBottom:8, alignItems:"flex-start" }}>
              <span style={{ background:"var(--text)", color:"var(--bg)", borderRadius:4, minWidth:22, height:22, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:600, flexShrink:0, marginTop:3 }}>{stepM[1]}</span>
              <span style={{ flex:1 }} dangerouslySetInnerHTML={{ __html: renderMathHTML(stepM[2]) }} />
            </div>
          );
        }
        const html = renderMathHTML(t);
        if (html.includes("kd")) {
          return <div key={i} style={{ margin:"0.8rem 0", textAlign:"center", overflowX:"auto" }} dangerouslySetInnerHTML={{ __html: html }} />;
        }
        return <p key={i} style={{ margin:"3px 0" }} dangerouslySetInnerHTML={{ __html: html }} />;
      })}
    </div>
  );
}

// ── Section parser ────────────────────────────────────────────────────────────
function parseSections(text) {
  const defs = [
    { key:"analyse",        re:/\*\*📌 Analyse du problème\*\*/i },
    { key:"theorie",        re:/\*\*📐 Théorie et formules\*\*/i },
    { key:"resolution",     re:/\*\*✏️ Résolution étape par étape\*\*/i },
    { key:"resultat",       re:/\*\*✅ Résultat final\*\*/i },
    { key:"interpretation", re:/\*\*💡 Interprétation\*\*/i },
    { key:"retenir",        re:/\*\*📌 À retenir\*\*/i },
  ];
  const out = {};
  const parts = text.split(/(?=\*\*[📌📐✏️✅💡])/u);
  for (const part of parts)
    for (const d of defs)
      if (d.re.test(part)) out[d.key] = part.replace(d.re,"").trim();
  return out;
}

const CARDS = [
  { key:"analyse",        title:"Analyse du problème",        emoji:"📌", style:{ bg:"var(--bg2)", bo:"var(--border)", lbl:"var(--text2)" } },
  { key:"theorie",        title:"Théorie et formules",         emoji:"📐", style:{ bg:"var(--info-bg)", bo:"var(--info-border)", lbl:"var(--info-text)" } },
  { key:"resolution",     title:"Résolution étape par étape",  emoji:"✏️", style:{ bg:"var(--bg2)", bo:"var(--border)", lbl:"var(--text2)" } },
  { key:"resultat",       title:"Résultat final",              emoji:"✅", style:{ bg:"var(--success-bg)", bo:"var(--success-border)", lbl:"var(--success-text)" } },
  { key:"interpretation", title:"Interprétation",              emoji:"💡", style:{ bg:"var(--warning-bg)", bo:"var(--warning-border)", lbl:"var(--warning-text)" } },
  { key:"retenir",        title:"À retenir",                   emoji:"📌", style:{ bg:"var(--bg2)", bo:"var(--border)", lbl:"var(--text2)" } },
];

function SolutionView({ text }) {
  const secs = parseSections(text);
  if (Object.keys(secs).length < 2)
    return <div style={{ padding:"1.5rem" }}><MathContent text={text} /></div>;
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:10, padding:"1.5rem" }}>
      {CARDS.map(c => {
        if (!secs[c.key]) return null;
        return (
          <div key={c.key} style={{ background:c.style.bg, border:`1px solid ${c.style.bo}`, borderRadius:"var(--radius)", overflow:"hidden", animation:"fadeIn 0.3s ease both" }}>
            <div style={{ padding:"7px 14px", borderBottom:`1px solid ${c.style.bo}`, display:"flex", alignItems:"center", gap:7 }}>
              <span>{c.emoji}</span>
              <span style={{ fontSize:11, fontWeight:600, letterSpacing:"0.07em", textTransform:"uppercase", color:c.style.lbl }}>{c.title}</span>
            </div>
            <div style={{ padding:"12px 16px" }}>
              <MathContent text={secs[c.key]} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [selectedType, setSelectedType] = useState("classique");
  const [input, setInput]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [solution, setSolution] = useState(null);
  const [error, setError]       = useState(null);
  const [history, setHistory]   = useState([]);
  const solRef = useRef(null);

  const solve = async () => {
    if (!input.trim() || loading) return;
    setLoading(true); setSolution(null); setError(null);
    const typeLabel = TYPES.find(t => t.id === selectedType)?.label || selectedType;
    try {
      // Appel vers notre backend sécurisé (Vercel serverless function)
      const res = await fetch("/api/solve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: typeLabel,
          exercise: input.trim(),
          system: SYSTEM,
        }),
      });
      if (!res.ok) throw new Error(`Erreur serveur : ${res.status}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setSolution(data.text);
      setHistory(h => [{ q: input.trim().substring(0,80), a: data.text, type: typeLabel, time: new Date() }, ...h].slice(0,8));
      setTimeout(() => solRef.current?.scrollIntoView({ behavior:"smooth", block:"start" }), 100);
    } catch(e) { setError(e.message); }
    setLoading(false);
  };

  const examples = EXAMPLES[selectedType] || [];

  return (
    <div style={{ maxWidth:800, margin:"0 auto", padding:"2rem 1.25rem 6rem" }}>

      {/* Header */}
      <div style={{ borderBottom:`1px solid var(--border)`, paddingBottom:"1.5rem", marginBottom:"2rem" }}>
        <h1 style={{ fontSize:28, fontWeight:700, margin:"0 0 4px", letterSpacing:"-0.02em" }}>
          Proba<span style={{ color:"#c8792a" }}>Solve</span>
        </h1>
        <p style={{ color:"var(--text2)", fontSize:14, margin:0 }}>
          Résolvez n'importe quel exercice de probabilités — formules LaTeX, étapes détaillées
        </p>
      </div>

      {/* Types */}
      <div style={{ marginBottom:"1.5rem" }}>
        <p style={{ fontSize:11, fontWeight:600, color:"var(--text2)", letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:8 }}>Type d'exercice</p>
        <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
          {TYPES.map(t => (
            <button key={t.id} onClick={() => setSelectedType(t.id)} style={{
              padding:"5px 13px", fontSize:13,
              border: selectedType===t.id ? "1.5px solid var(--text)" : "1px solid var(--border2)",
              background: selectedType===t.id ? "var(--text)" : "transparent",
              color: selectedType===t.id ? "var(--bg)" : "var(--text)",
              borderRadius:"var(--radius-sm)", cursor:"pointer",
              fontWeight: selectedType===t.id ? 600 : 400, transition:"all 0.12s"
            }}>{t.emoji} {t.label}</button>
          ))}
        </div>
      </div>

      {/* Exemples */}
      {examples.length > 0 && (
        <div style={{ marginBottom:"1rem" }}>
          <p style={{ fontSize:11, color:"var(--text2)", marginBottom:6, letterSpacing:"0.08em", textTransform:"uppercase", fontWeight:600 }}>Exemples</p>
          <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
            {examples.map((ex,i) => (
              <button key={i} onClick={() => setInput(ex)} style={{
                textAlign:"left", padding:"6px 12px", fontSize:13,
                border:"1px solid var(--border)", borderRadius:"var(--radius-sm)",
                background:"var(--bg2)", color:"var(--text2)",
                cursor:"pointer", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis",
                transition:"border-color 0.12s"
              }}>↗ {ex}</button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div style={{ marginBottom:"1rem" }}>
        <p style={{ fontSize:11, fontWeight:600, color:"var(--text2)", letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:8 }}>Énoncé</p>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.ctrlKey && e.key==="Enter") solve(); }}
          placeholder="Collez ou tapez votre exercice ici… (Ctrl+Entrée pour résoudre)"
          rows={5}
          style={{
            width:"100%", resize:"vertical", padding:"12px 14px", fontSize:15,
            border:`1px solid var(--border2)`, borderRadius:"var(--radius)",
            background:"var(--bg)", color:"var(--text)",
            fontFamily:"inherit", lineHeight:1.7, outline:"none", boxSizing:"border-box",
            transition:"border-color 0.15s"
          }}
        />
      </div>

      {/* Bouton */}
      <button onClick={solve} disabled={loading || !input.trim()} style={{
        width:"100%", padding:"13px",
        background: loading || !input.trim() ? "var(--bg3)" : "var(--text)",
        color: loading || !input.trim() ? "var(--text3)" : "var(--bg)",
        border:"none", borderRadius:"var(--radius)",
        fontSize:15, fontWeight:600, cursor: loading || !input.trim() ? "not-allowed" : "pointer",
        display:"flex", alignItems:"center", justifyContent:"center", gap:8, transition:"all 0.15s"
      }}>
        {loading
          ? <><span style={{ width:15, height:15, border:"2px solid rgba(255,255,255,0.3)", borderTopColor:"currentColor", borderRadius:"50%", animation:"spin 0.7s linear infinite", display:"inline-block" }} /> Résolution en cours…</>
          : "Résoudre l'exercice →"
        }
      </button>

      {/* Erreur */}
      {error && (
        <div style={{ marginTop:"1.2rem", padding:"12px 16px", background:"#fef2f2", border:"1px solid rgba(220,38,38,0.3)", borderRadius:"var(--radius-sm)", color:"#b91c1c", fontSize:13 }}>
          ⚠️ {error}
        </div>
      )}

      {/* Solution */}
      {solution && (
        <div ref={solRef} style={{ marginTop:"2rem", border:`1px solid var(--border2)`, borderRadius:"var(--radius)", overflow:"hidden", background:"var(--bg)", animation:"fadeIn 0.3s ease" }}>
          <div style={{ padding:"12px 20px", background:"var(--bg2)", borderBottom:`1px solid var(--border)`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <span style={{ fontWeight:600, fontSize:15 }}>Solution complète</span>
            <span style={{ background:"var(--success-bg)", color:"var(--success-text)", fontSize:11, fontWeight:600, padding:"3px 10px", borderRadius:4, letterSpacing:"0.08em", textTransform:"uppercase" }}>Résolu ✓</span>
          </div>
          <SolutionView text={solution} />
        </div>
      )}

      {/* Historique */}
      {history.length > 1 && (
        <div style={{ marginTop:"2.5rem" }}>
          <p style={{ fontSize:11, fontWeight:600, color:"var(--text2)", letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:10 }}>Historique</p>
          <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
            {history.slice(1).map((h,i) => (
              <details key={i} style={{ border:`1px solid var(--border)`, borderRadius:"var(--radius-sm)", overflow:"hidden" }}>
                <summary style={{ padding:"8px 14px", fontSize:13, cursor:"pointer", color:"var(--text2)", display:"flex", justifyContent:"space-between", listStyle:"none" }}>
                  <span style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", flex:1 }}>{h.q}{h.q.length>=80?"…":""}</span>
                  <span style={{ marginLeft:12, color:"var(--text3)", flexShrink:0 }}>{h.time.toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"})}</span>
                </summary>
                <div style={{ padding:"0.5rem", borderTop:`1px solid var(--border)`, background:"var(--bg2)" }}>
                  <SolutionView text={h.a} />
                </div>
              </details>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
