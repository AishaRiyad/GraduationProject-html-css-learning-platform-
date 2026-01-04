import React, { useEffect, useMemo, useRef, useState } from "react";
import AIHelpDrawer from "./AIHelpDrawer.jsx";

/* HTML validator (light) */
const validateHtml = (source) => {
  const errs = [];
  const warns = [];
  if (!/<!DOCTYPE html>/i.test(source)) warns.push("Consider adding <!DOCTYPE html> at the top.");
  if (!/<html[\s>]/i.test(source)) errs.push("Missing <html> root element.");
  if (!/<body[\s>]/i.test(source)) errs.push("Missing <body> element.");
  const openTagRe = /<([a-zA-Z][a-zA-Z0-9-]*)(?=[\s>\/])/g;
  const closeTagRe = /<\/([a-zA-Z][a-zA-Z0-9-]*)\s*>/g;
  const voids = new Set(["area","base","br","col","embed","hr","img","input","link","meta","param","source","track","wbr"]);
  const opens = [], closes = [];
  let m;
  while ((m = openTagRe.exec(source))) opens.push(m[1].toLowerCase());
  while ((m = closeTagRe.exec(source))) closes.push(m[1].toLowerCase());
  const count = (arr) => arr.reduce((a,t)=>{ a[t]=(a[t]||0)+1; return a; }, {});
  const openCount = count(opens.filter(t => !voids.has(t)));
  const closeCount = count(closes);
  Object.keys(openCount).forEach(tag => { if ((closeCount[tag]||0) < openCount[tag]) errs.push(`Unclosed <${tag}> tag(s).`); });
  Object.keys(closeCount).forEach(tag => { if ((openCount[tag]||0) < closeCount[tag]) errs.push(`Extra closing </${tag}> tag(s).`); });
  return { errs, warns };
};

const DEFAULT_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Document</title>
</head>
<body>

</body>
</html>`;

const DEFAULT_CSS = `/* Your CSS here */
body { font-family: system-ui, sans-serif; }
`;

const readNs = () => { try { return localStorage.getItem("tryit_ns") || "guest"; } catch { return "guest"; } };
const k = (name, ns) => `${name}_${ns}`;
const getInitialDark = () => {
  try {
    const saved = localStorage.getItem("theme");
    if (saved) return saved === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  } catch { return false; }
};
const lsGet = (key, fallback) => { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; } };
const lsSet = (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} };
const newId = () => String(Date.now());

const HTML_TAGS = [
  "a","abbr","address","area","article","aside","audio","b","base","bdi","bdo","blockquote","body","br","button",
  "canvas","caption","cite","code","col","colgroup","data","datalist","dd","del","details","dfn","dialog","div","dl","dt",
  "em","embed","fieldset","figcaption","figure","footer","form","h1","h2","h3","h4","h5","h6","head","header","hr","html",
  "i","iframe","img","input","ins","kbd","label","legend","li","link","main","map","mark","meta","meter","nav","noscript",
  "object","ol","optgroup","option","output","p","param","picture","pre","progress","q","rp","rt","ruby","s","samp","script",
  "section","select","small","source","span","strong","style","sub","summary","sup","table","tbody","td","template","textarea",
  "tfoot","th","thead","time","title","tr","track","u","ul","var","video","wbr"
];

const HTML_ATTRS = [
  "class","id","style","title","href","src","alt","rel","target","type","name","value","placeholder","disabled","checked","selected",
  "readonly","required","min","max","step","for","aria-label","aria-hidden","role","data-"
];

const CSS_PROPS = [
  "display","position","top","right","bottom","left","z-index","width","height","max-width","min-width","max-height","min-height",
  "margin","margin-top","margin-right","margin-bottom","margin-left","padding","padding-top","padding-right","padding-bottom","padding-left",
  "border","border-radius","border-color","border-width","border-style","outline","box-shadow",
  "background","background-color","background-image","background-size","background-position","background-repeat",
  "color","opacity","font","font-size","font-weight","font-family","line-height","letter-spacing","text-align","text-decoration","text-transform",
  "overflow","overflow-x","overflow-y","white-space","gap","row-gap","column-gap","flex","flex-direction","flex-wrap","justify-content","align-items","align-content",
  "grid","grid-template-columns","grid-template-rows","grid-column","grid-row","place-items",
  "transform","transition","animation","cursor","pointer-events","user-select"
];

const uniq = (arr) => Array.from(new Set(arr));

function getLastOpenTagName(html, caret) {
  const upto = html.slice(0, caret);
  const tagRe = /<\/?([a-zA-Z][a-zA-Z0-9-]*)(?=[\s>\/])/g;
  const voids = new Set(["area","base","br","col","embed","hr","img","input","link","meta","param","source","track","wbr"]);
  const stack = [];
  let m;
  while ((m = tagRe.exec(upto))) {
    const full = m[0];
    const name = (m[1] || "").toLowerCase();
    const isClose = full.startsWith("</");
    if (voids.has(name)) continue;
    if (!isClose) stack.push(name);
    else {
      const idx = stack.lastIndexOf(name);
      if (idx !== -1) stack.splice(idx, 1);
    }
  }
  return stack.length ? stack[stack.length - 1] : "";
}

function extractHtmlContext(text, caret) {
  const upto = text.slice(0, caret);
  const lastLt = upto.lastIndexOf("<");
  const lastGt = upto.lastIndexOf(">");
  if (lastLt === -1 || lastLt < lastGt) return null;
  const frag = upto.slice(lastLt);
  const closeMode = frag.startsWith("</");
  const after = closeMode ? frag.slice(2) : frag.slice(1);
  const spaceIdx = after.search(/[\s/>]/);
  const tagPart = spaceIdx === -1 ? after : after.slice(0, spaceIdx);
  const inTagName = spaceIdx === -1;
  const attrPart = spaceIdx === -1 ? "" : after.slice(spaceIdx + 1);
  const attrMatch = attrPart.match(/([a-zA-Z_:][-a-zA-Z0-9_:.]*)$/);
  const attrPrefix = attrMatch ? attrMatch[1] : "";
  return { lastLt, closeMode, tagPrefix: tagPart, inTagName, attrPrefix };
}

function extractCssContext(text, caret) {
  const upto = text.slice(0, caret);
  const lastSemi = upto.lastIndexOf(";");
  const lastBrace = upto.lastIndexOf("{");
  const start = Math.max(lastSemi, lastBrace) + 1;
  const line = upto.slice(start);
  const inComment = /\/\*[^]*$/.test(upto) && !/\*\//.test(upto.slice(upto.lastIndexOf("/*")));
  if (inComment) return null;
  const hasColon = line.includes(":");
  if (hasColon) return null;
  const m = line.match(/([a-zA-Z-]+)$/);
  const prefix = m ? m[1] : "";
  const inRule = lastBrace !== -1 && (lastBrace > upto.lastIndexOf("}"));
  if (!inRule) return null;
  return { prefix };
}

export default function HtmlPlayground() {
  const [ns, setNs] = useState(readNs());
  useEffect(() => {
    const refreshNs = () => setNs(readNs());
    window.addEventListener("focus", refreshNs);
    window.addEventListener("storage", refreshNs);
    return () => {
      window.removeEventListener("focus", refreshNs);
      window.removeEventListener("storage", refreshNs);
    };
  }, []);

  const [editorLang, setEditorLang] = useState("html"); // "html" | "css"
  const [html, setHtml] = useState(() => localStorage.getItem(k("tryit_html", ns)) || DEFAULT_HTML);
  const [css, setCss] = useState(() => localStorage.getItem(k("tryit_css", ns)) || DEFAULT_CSS);
  const [autoRun, setAutoRun]   = useState(false);
  const [dark, setDark]         = useState(getInitialDark());
  const [vertical, setVertical] = useState(true);
  const [device, setDevice]     = useState("desktop");
  const [wrap, setWrap]         = useState(true);
  const [fontSize, setFontSize] = useState(13);
  const [stackRatio, setStackRatio] = useState(0.30);

  const [previewHtml, setPreviewHtml] = useState(() => localStorage.getItem(k("tryit_html", ns)) || DEFAULT_HTML);
  const [errors, setErrors] = useState([]);
  const [warnings, setWarnings] = useState([]);

  const [projects, setProjects] = useState(() => lsGet(k("tryit_projects", ns), []));
  const [currentId, setCurrentId] = useState(() => localStorage.getItem(k("tryit_currentId", ns)) || "");
  const [showProjects, setShowProjects] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const textareaRef = useRef(null);
  const [acOpen, setAcOpen] = useState(false);
  const [acItems, setAcItems] = useState([]);
  const [acIndex, setAcIndex] = useState(0);
  const [acMeta, setAcMeta] = useState({ start: 0, end: 0, kind: "" });

  useEffect(() => {
    const newHtml = localStorage.getItem(k("tryit_html", ns)) || DEFAULT_HTML;
    const newCss  = localStorage.getItem(k("tryit_css", ns)) || DEFAULT_CSS;
    setHtml(newHtml);
    setCss(newCss);
    setPreviewHtml(newHtml);
    setProjects(lsGet(k("tryit_projects", ns), []));
    setCurrentId(localStorage.getItem(k("tryit_currentId", ns)) || "");
    setAcOpen(false);
  }, [ns]);

  const saveProject = (forceNew = false) => {
    let title; let id = currentId;
    if (!id || forceNew) {
      title = window.prompt("Project title:", "My HTML Project");
      if (!title) return;
      id = newId();
      const proj = { id, title, html, css, createdAt: Date.now(), updatedAt: Date.now() };
      const next = [proj, ...projects].slice(0, 200);
      setProjects(next); lsSet(k("tryit_projects", ns), next);
      setCurrentId(id); localStorage.setItem(k("tryit_currentId", ns), id);
      window.alert("Saved as new project ");
      return;
    }
    const next = projects.map(p => p.id === id ? { ...p, html, css, updatedAt: Date.now() } : p);
    setProjects(next); lsSet(k("tryit_projects", ns), next);
    window.alert("Project updated ");
  };
  const saveAsProject = () => saveProject(true);

  const newBlank = () => {
    setHtml(DEFAULT_HTML);
    setCss(DEFAULT_CSS);
    setPreviewHtml(DEFAULT_HTML);
    setCurrentId("");
    localStorage.removeItem(k("tryit_currentId", ns));
    localStorage.setItem(k("tryit_html", ns), DEFAULT_HTML);
    localStorage.setItem(k("tryit_css", ns), DEFAULT_CSS);
    setShowProjects(false);
    setAcOpen(false);
  };

  const loadProject = (id) => {
    const p = projects.find(x => x.id === id); if (!p) return;
    setHtml(p.html);
    setCss(p.css || DEFAULT_CSS);
    setCurrentId(id); localStorage.setItem(k("tryit_currentId", ns), id);
    setShowProjects(false);
    setAcOpen(false);
  };

  const deleteProject = (id) => {
    if (!window.confirm("Delete this project?")) return;
    const next = projects.filter(p => p.id !== id);
    setProjects(next); lsSet(k("tryit_projects", ns), next);
    if (currentId === id) { setCurrentId(""); localStorage.removeItem(k("tryit_currentId", ns)); }
  };

  const renameProject = (id) => {
    const p = projects.find(x => x.id === id); if (!p) return;
    const t = window.prompt("New title:", p.title); if (!t) return;
    const next = projects.map(x => x.id === id ? { ...x, title: t, updatedAt: Date.now() } : x);
    setProjects(next); lsSet(k("tryit_projects", ns), next);
  };

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    try { localStorage.setItem("theme", dark ? "dark" : "light"); } catch {}
  }, [dark]);

  useEffect(() => {
    try {
      localStorage.setItem(k("tryit_html", ns), html);
      localStorage.setItem(k("tryit_css", ns), css);
    } catch {}
  }, [html, css, ns]);

  const iframeRef = useRef(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const measure = () => { const el = iframeRef.current; if (el) setSize({ w: Math.round(el.clientWidth), h: Math.round(el.clientHeight) }); };
  useEffect(() => {
    measure();
    const onResize = () => measure();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const runOnce = () => {
    const { errs, warns } = validateHtml(html);
    setErrors(errs); setWarnings(warns);
    if (errs.length === 0) { setPreviewHtml(html); queueMicrotask(measure); }
  };
  useEffect(() => {
    if (!autoRun) return;
    const { errs, warns } = validateHtml(html);
    setErrors(errs); setWarnings(warns);
    if (errs.length === 0) { setPreviewHtml(html); queueMicrotask(measure); }
  }, [html, css, autoRun]);

  const srcDoc = useMemo(() => `${previewHtml}\n<style>${css || ""}</style>`, [previewHtml, css]);
  const previewWidth = device === "mobile" ? 375 : device === "tablet" ? 768 : "100%";

  const doReset = () => setHtml(DEFAULT_HTML);
  const doCopy  = async () => { try { await navigator.clipboard.writeText(html); window.alert("HTML copied ✅"); } catch { window.alert("Clipboard blocked — copy manually."); } };
  const doDownload = () => {
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a");
    a.href = url; a.download = "tryit.html"; a.click(); URL.revokeObjectURL(url);
  };
  const [fs, setFs] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const dragRef = useRef(null);
  useEffect(() => {
    if (vertical) return;
    const bar = dragRef.current; if (!bar) return;
    let startY = 0, startRatio = stackRatio;
    const onDown = (e) => {
      startY = e.clientY; startRatio = stackRatio;
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
      document.body.style.userSelect = "none";
    };
    const onMove = (e) => {
      const dy = e.clientY - startY;
      const vh = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
      const delta = dy / vh;
      let next = Math.min(0.7, Math.max(0.3, startRatio + delta));
      setStackRatio(next);
    };
    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      document.body.style.userSelect = "";
    };
    bar.addEventListener("mousedown", onDown);
    return () => bar.removeEventListener("mousedown", onDown);
  }, [vertical, stackRatio]);

  const previewAnchorRef = useRef(null);
  const jumpToResult = () => previewAnchorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  const editorH  = vertical ? "min(70vh, calc(100vh - 6rem))"  : `${Math.round(stackRatio * 100)}vh`;
  const previewH = fs ? "calc(100vh - 7.5rem)" : (vertical ? "min(75vh, calc(100vh - 7.5rem))" : `${Math.round((1 - stackRatio) * 100)}vh`);

  const closeAutocomplete = () => {
    setAcOpen(false);
    setAcItems([]);
    setAcIndex(0);
    setAcMeta({ start: 0, end: 0, kind: "" });
  };

  const openAutocomplete = (items, meta) => {
    const list = uniq(items).slice(0, 8);
    if (!list.length) return closeAutocomplete();
    setAcItems(list);
    setAcIndex(0);
    setAcMeta(meta);
    setAcOpen(true);
  };

  const updateAutocomplete = (text, caret, lang) => {
    if (!textareaRef.current) return closeAutocomplete();
    if (lang === "html") {
      const ctx = extractHtmlContext(text, caret);
      if (!ctx) return closeAutocomplete();

      if (ctx.closeMode && ctx.inTagName) {
        const want = ctx.tagPrefix.toLowerCase();
        const last = getLastOpenTagName(text, caret);
        const base = last ? [last] : [];
        const cand = base.concat(HTML_TAGS);
        const items = cand
          .filter(t => t.startsWith(want))
          .slice(0, 8)
          .map(t => t);
        return openAutocomplete(items, { start: ctx.lastLt + 2, end: caret, kind: "tag" });
      }

      if (ctx.inTagName) {
        const want = ctx.tagPrefix.toLowerCase();
        const items = HTML_TAGS.filter(t => t.startsWith(want)).slice(0, 8);
        return openAutocomplete(items, { start: ctx.lastLt + 1, end: caret, kind: "tag" });
      }

      const wantAttr = (ctx.attrPrefix || "").toLowerCase();
      if (!wantAttr) return closeAutocomplete();
      const items = HTML_ATTRS.filter(a => a.toLowerCase().startsWith(wantAttr)).slice(0, 8);
      return openAutocomplete(items, { start: caret - wantAttr.length, end: caret, kind: "attr" });
    }

    if (lang === "css") {
      const ctx = extractCssContext(text, caret);
      if (!ctx) return closeAutocomplete();
      const want = (ctx.prefix || "").toLowerCase();
      if (!want) return closeAutocomplete();
      const items = CSS_PROPS.filter(p => p.toLowerCase().startsWith(want)).slice(0, 8);
      return openAutocomplete(items, { start: caret - want.length, end: caret, kind: "css" });
    }

    closeAutocomplete();
  };

  const acceptAutocomplete = (pick) => {
    const el = textareaRef.current;
    if (!el) return;
    const text = editorLang === "html" ? html : css;
    const before = text.slice(0, acMeta.start);
    const after = text.slice(acMeta.end);

    let insert = pick;
    if (acMeta.kind === "attr") {
      if (pick === "class") insert = 'class=""';
      else if (pick === "id") insert = 'id=""';
      else if (pick === "href") insert = 'href=""';
      else if (pick === "src") insert = 'src=""';
      else if (pick === "alt") insert = 'alt=""';
      else if (pick === "title") insert = 'title=""';
      else if (pick === "name") insert = 'name=""';
      else if (pick === "placeholder") insert = 'placeholder=""';
      else if (pick === "type") insert = 'type=""';
      else if (pick === "value") insert = 'value=""';
      else if (pick.startsWith("aria-")) insert = `${pick}=""`;
      else if (pick === "data-") insert = 'data-=""';
    } else if (acMeta.kind === "css") {
      insert = `${pick}: `;
    }

    const nextText = before + insert + after;

    if (editorLang === "html") setHtml(nextText);
    else setCss(nextText);

    requestAnimationFrame(() => {
      const pos = before.length + insert.length;
      el.focus();
      if (acMeta.kind === "attr" && insert.includes('=""')) {
        const q = before.length + insert.indexOf('""') + 1;
        el.setSelectionRange(q, q);
      } else {
        el.setSelectionRange(pos, pos);
      }
    });

    closeAutocomplete();
  };

  const onEditorChange = (e) => {
    const v = e.target.value;
    if (editorLang === "html") setHtml(v);
    else setCss(v);
    const caret = e.target.selectionStart ?? v.length;
    updateAutocomplete(v, caret, editorLang);
  };

  const onEditorKeyDown = (e) => {
    if (!acOpen) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setAcIndex(i => Math.min(acItems.length - 1, i + 1));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setAcIndex(i => Math.max(0, i - 1));
      return;
    }
    if (e.key === "Escape") {
      e.preventDefault();
      closeAutocomplete();
      return;
    }
    if (e.key === "Tab" || e.key === "Enter") {
      e.preventDefault();
      const pick = acItems[acIndex];
      if (pick) acceptAutocomplete(pick);
      return;
    }
  };

  return (
    <div className="min-h-screen text-slate-900 dark:text-slate-100 relative">
      <style>{`
  :root {
    --bg-from: #fff7ed;
    --bg-to: #fffbeb;
    --accent: #f59e0b;
    --accent-light: #fde68a;
    --text-main: #1f2937;
    --text-muted: #6b7280;
  }
  html.dark {
    --bg-from: #0f172a;
    --bg-to: #1e293b;
    --accent: #facc15;
    --accent-light: #fde047;
    --text-main: #f9fafb;
    --text-muted: #d1d5db;
  }
`}</style>


      <div
        className="h-auto px-3 sm:px-4 py-2 flex items-center justify-between gap-2 flex-wrap
        border-b border-amber-300/70 shadow-sm
        bg-gradient-to-r from-amber-50 via-pink-50 to-rose-50
        dark:from-[#0f172a] dark:via-[#1e293b] dark:to-[#312e81]
        sticky top-0 z-20 backdrop-blur-md"
      >
        {/* Left */}
        <div className="flex items-center gap-2 text-sm text-slate-800 dark:text-slate-100">
          <button
            onClick={() => setMenuOpen(o => !o)}
            className="p-2 rounded-md border border-amber-300 dark:border-amber-700
            bg-white/70 dark:bg-slate-800/50 hover:bg-amber-100 dark:hover:bg-slate-700 transition"
            title="Quick actions"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600 dark:text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h10M4 18h16"/>
            </svg>
          </button>

          <span className="hidden sm:inline text-slate-600 dark:text-slate-300">HTML</span>
          <span className="hidden sm:inline text-slate-400">›</span>
          <span className="font-semibold text-amber-700 dark:text-amber-400">Tryit: HTML</span>

          {currentId && (
            <span className="ml-2 text-[10px] sm:text-xs px-2 py-0.5 rounded bg-gradient-to-r from-pink-100 to-amber-100 text-pink-700 border border-pink-200">
              Project: {projects.find((p) => p.id === currentId)?.title || "Untitled"}
            </span>
          )}
        </div>

       
        <div className="flex items-center gap-2 overflow-x-auto py-1 md:py-0 w-full md:w-auto">
         
          <div className="hidden md:flex items-center border border-amber-200 rounded-lg overflow-hidden shrink-0">
            {["html", "css"].map((lang) => (
              <button
                key={lang}
                onClick={() => { setEditorLang(lang); closeAutocomplete(); }}
                className={`px-3 py-1 text-xs font-semibold transition ${
                  editorLang === lang
                    ? "bg-gradient-to-r from-pink-500 to-amber-500 text-white"
                    : "bg-white/70 hover:bg-amber-50 dark:bg-slate-800/70 dark:hover:bg-slate-700 text-slate-700 dark:text-gray-200"
                }`}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>

          {/* New */}
          <button
            onClick={newBlank}
            className="px-2.5 py-1 rounded-md bg-white border border-amber-300 text-xs font-semibold text-amber-700 hover:bg-amber-50 transition shrink-0"
            title="New blank project"
          >
            New
          </button>

      
          <div className="hidden md:flex items-center gap-1 border border-amber-200 rounded-lg overflow-hidden shrink-0">
            {["mobile", "tablet", "desktop"].map((d) => (
              <button
                key={d}
                onClick={() => setDevice(d)}
                className={`px-3 py-1 text-xs font-semibold transition ${
                  device === d
                    ? "bg-gradient-to-r from-amber-500 to-pink-500 text-white"
                    : "bg-white/70 hover:bg-amber-50 dark:bg-slate-800/70 dark:hover:bg-slate-700 text-amber-700 dark:text-gray-200"
                }`}
              >
                {d === "mobile" ? "Mobile" : d === "tablet" ? "Tablet" : "Desktop"}
              </button>
            ))}
          </div>

        
          <label className="hidden md:flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 shrink-0">
            <input type="checkbox" className="accent-amber-600" checked={wrap} onChange={(e) => setWrap(e.target.checked)} />
            Wrap
          </label>
          <div className="hidden md:flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 shrink-0">
            <span>Aa</span>
            <input
              type="range"
              min="12"
              max="18"
              value={fontSize}
              onChange={(e) => setFontSize(+e.target.value)}
              className="accent-pink-500"
            />
          </div>

          {/* Auto-run */}
          <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 shrink-0">
            <input type="checkbox" className="accent-amber-600" checked={autoRun} onChange={(e) => setAutoRun(e.target.checked)} />
            Auto-run
          </label>

          {/* Run */}
          <button
            onClick={runOnce}
            className="px-3 py-1.5 rounded-md bg-gradient-to-r from-pink-500 to-amber-500 hover:opacity-90 text-white text-sm font-semibold shadow-md transition shrink-0"
          >
            Run ▶
          </button>

          {/* Orientation */}
          <button
            onClick={() => setVertical(v => !v)}
            className="p-2 rounded-md border border-yellow-200 bg-yellow-50 hover:bg-yellow-100/70 shrink-0"
            title="Change Orientation (Ctrl+Alt+O)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 10v6a3 3 0 0 0 3 3h6" />
              <path d="M21 14V8a3 3 0 0 0-3-3h-6" />
              <path d="m7 10-4-4M17 14l4 4" />
            </svg>
          </button>

          {/* Theme */}
          <button
            onClick={() => setDark(d => !d)}
            className="p-2 rounded-md border border-amber-300 dark:border-amber-700 bg-white/70 dark:bg-slate-800/50 hover:bg-amber-100 dark:hover:bg-slate-700 transition shrink-0"
            title="Toggle Theme"
          >
            {dark ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m8.66-9H20m-16 0H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-800 dark:text-amber-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
              </svg>
            )}
          </button>

          {/* Save / Projects / Copy / Download / Reset */}
          {["Save", "Projects", "Copy", "Download", "Reset"].map((label) => (
            <button
              key={label}
              onClick={
                label === "Save"
                  ? () => saveProject()
                  : label === "Projects"
                  ? () => setShowProjects(true)
                  : label === "Copy"
                  ? doCopy
                  : label === "Download"
                  ? doDownload
                  : doReset
              }
              className="px-2.5 py-1 rounded-md bg-white border border-amber-300 text-xs font-medium text-amber-700 hover:bg-amber-50 transition shrink-0"
              title={label}
            >
              {label}
            </button>
          ))}
        </div>

     
        {menuOpen && (
          <div className="w-full grid grid-cols-2 gap-2 md:hidden mt-2">
            <div className="col-span-2 flex items-center gap-1 border border-amber-200 rounded-lg overflow-hidden">
              {["html","css"].map((lang)=>(
                <button
                  key={lang}
                  onClick={()=>{ setEditorLang(lang); closeAutocomplete(); }}
                  className={`px-3 py-1 text-xs font-semibold transition w-full ${
                    editorLang===lang
                      ? "bg-gradient-to-r from-pink-500 to-amber-500 text-white"
                      : "bg-white/70 hover:bg-amber-50 text-slate-700"
                  }`}
                >{lang.toUpperCase()}</button>
              ))}
            </div>

            <div className="col-span-2 flex items-center gap-1 border border-amber-200 rounded-lg overflow-hidden">
              {["mobile","tablet","desktop"].map((d)=>(
                <button
                  key={d}
                  onClick={()=>setDevice(d)}
                  className={`px-3 py-1 text-xs font-semibold transition w-full ${
                    device===d
                      ? "bg-gradient-to-r from-amber-500 to-pink-500 text-white"
                      : "bg-white/70 hover:bg-amber-50 text-amber-700"
                  }`}
                >
                  {d === "mobile" ? "Mobile" : d === "tablet" ? "Tablet" : "Desktop"}
                </button>
              ))}
            </div>

            <label className="flex items-center gap-2 text-xs text-slate-700 bg-white/70 border border-amber-200 rounded-md p-2">
              <input type="checkbox" className="accent-amber-600" checked={wrap} onChange={(e) => setWrap(e.target.checked)} />
              Wrap
            </label>

            <div className="flex items-center gap-2 text-xs text-slate-700 bg-white/70 border border-amber-200 rounded-md p-2">
              <span>Aa</span>
              <input type="range" min="12" max="18" value={fontSize} onChange={(e)=>setFontSize(+e.target.value)} className="accent-pink-500 w-full" />
            </div>
          </div>
        )}
      </div>

      {!vertical && !fs && (
        <div className="sticky top-[var(--top,3.25rem)] z-10 bg-yellow-50/80 backdrop-blur border-b border-yellow-200 flex items-center gap-3 px-3 py-2">
          <span className="text-xs text-slate-700">Editor</span>
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs text-slate-600">Height {Math.round(stackRatio*100)}%</span>
            <input type="range" min="30" max="70" value={Math.round(stackRatio*100)} onChange={(e)=>setStackRatio(Number(e.target.value)/100)} />
            <button onClick={runOnce} className="px-2.5 py-1 rounded-md text-xs font-medium bg-white border border-amber-300 hover:bg-amber-50 text-amber-700 shadow-sm transition">Run</button>
            <button onClick={() => (document.querySelector("#preview-anchor")?.scrollIntoView({behavior:"smooth"}))} className="px-2.5 py-1 rounded-md bg-yellow-50 border border-yellow-200 text-xs hover:bg-yellow-100/70">Jump to Result ↓</button>
          </div>
        </div>
      )}

      
      <div className={(vertical || fs ? "grid grid-cols-1 md:grid-cols-2" : "grid grid-cols-1") + " gap-0"}>
        {/* Editor */}
        {!fs && (
          <div className="bg-yellow-50/60 border-b md:border-b-0 md:border-r border-yellow-200">
            <div className="px-4 py-2 text-xs font-medium text-slate-700 bg-yellow-100 border-b border-yellow-200">
              {editorLang.toUpperCase()}
            </div>

            <div className="relative">
              <textarea
                ref={textareaRef}
                value={editorLang === "html" ? html : css}
                onChange={onEditorChange}
                onKeyDown={onEditorKeyDown}
                onBlur={() => setTimeout(() => closeAutocomplete(), 120)}
                onClick={(e) => {
                  const v = e.target.value;
                  const caret = e.target.selectionStart ?? v.length;
                  updateAutocomplete(v, caret, editorLang);
                }}
                onKeyUp={(e) => {
                  const el = e.target;
                  const v = el.value;
                  const caret = el.selectionStart ?? v.length;
                  if (!["ArrowUp","ArrowDown","Enter","Tab","Escape"].includes(e.key)) updateAutocomplete(v, caret, editorLang);
                }}
                spellCheck={false}
                className={[
                  "w-full p-4 outline-none resize-none font-mono border transition-colors duration-300",
                  "max-h-[75vh] md:max-h-none",
                  dark ? "bg-slate-900 text-amber-100 border-slate-700" : "bg-white text-slate-900 border-yellow-200",
                  wrap ? "whitespace-pre-wrap break-words" : "whitespace-pre",
                ].join(" ")}
                style={{ height: editorH, fontSize: `clamp(12px, ${fontSize}px, 18px)`, lineHeight: "1.4" }}
                placeholder={editorLang === "html" ? "Write HTML here…" : "Write CSS here…"}
              />

              {acOpen && acItems.length > 0 && (
                <div
                  className={[
                    "absolute left-4 top-3 z-30 rounded-lg border shadow-lg overflow-hidden",
                    dark ? "bg-slate-800 border-slate-700" : "bg-white border-yellow-200",
                  ].join(" ")}
                >
                  <div className={["px-3 py-1 text-[10px] uppercase tracking-wide", dark ? "text-slate-300 bg-slate-900/30" : "text-slate-500 bg-yellow-50"].join(" ")}>
                    {editorLang === "html" ? "suggestions" : "css"}
                  </div>
                  <ul className="max-h-56 overflow-auto">
                    {acItems.map((it, idx) => (
                      <li key={it + idx}>
                        <button
                          type="button"
                          onMouseDown={(ev) => { ev.preventDefault(); acceptAutocomplete(it); }}
                          className={[
                            "w-full text-left px-3 py-2 text-xs font-medium transition",
                            idx === acIndex
                              ? (dark ? "bg-amber-500/20 text-amber-200" : "bg-amber-50 text-amber-800")
                              : (dark ? "text-slate-100 hover:bg-slate-700/50" : "text-slate-800 hover:bg-yellow-50"),
                          ].join(" ")}
                        >
                          <span className="font-mono">{it}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                  <div className={["px-3 py-1 text-[10px]", dark ? "text-slate-400 bg-slate-900/30" : "text-slate-500 bg-yellow-50"].join(" ")}>
                    Tab / Enter
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {!vertical && !fs && <div ref={dragRef} title="Drag to resize" className="h-2 w-full cursor-row-resize bg-yellow-200/80" />}

        {/* Preview */}
        <div className="bg-yellow-50/60" id="preview-anchor" ref={previewAnchorRef}>
          <div className="px-4 py-2 text-xs font-medium text-slate-700 bg-yellow-100 border-b border-yellow-200 flex items-center gap-3">
            <span>Result</span>
            <span className="text-slate-600">Size: {size.w} × {size.h}</span>
            <span className="ml-auto hidden md:inline text-xs text-slate-600">{device === "desktop" ? "Full width" : `${device} preset`}</span>
          </div>

          {errors.length > 0 && (
            <div className="mx-4 mt-3 rounded-md border border-red-300 bg-red-50 text-red-800 text-sm p-3">
              <div className="font-semibold mb-1">HTML Errors</div>
              <ul className="list-disc pl-5 space-y-0.5">{errors.map((e,i)=><li key={i}>{e}</li>)}</ul>
            </div>
          )}
          {warnings.length > 0 && errors.length === 0 && (
            <div className="mx-4 mt-3 rounded-md border border-amber-300 bg-amber-50 text-amber-900 text-sm p-3">
              <div className="font-semibold mb-1">Tips</div>
              <ul className="list-disc pl-5 space-y-0.5">{warnings.map((w,i)=><li key={i}>{w}</li>)}</ul>
            </div>
          )}

          <div className="w-full flex justify-center py-4 md:py-6">
          
            <div
              className="rounded-xl shadow-sm border border-yellow-200 bg-white overflow-hidden transition-all w-full max-w-full"
              style={{
                width: typeof previewWidth === "number" ? `${previewWidth}px` : "100%",
                maxWidth: "100%"
              }}
            >
              <iframe
                ref={iframeRef}
                title="preview"
                className="w-full"
                style={{ height: previewH }}
                sandbox="allow-same-origin allow-scripts"
                srcDoc={srcDoc}
                onLoad={measure}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Projects Drawer */}
      {showProjects && (
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/30" onClick={()=>setShowProjects(false)} />
          <div className="absolute right-0 top-0 h-full w-[min(420px,90vw)] bg-yellow-50 border-l border-yellow-200 shadow-xl p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold">My Projects</h2>
              <div className="flex items-center gap-2">
                <button onClick={()=>saveProject(true)} className="px-2.5 py-1 rounded-md bg-pink-500 text-white text-xs">Save As</button>
                <button onClick={()=>setShowProjects(false)} className="px-2.5 py-1 rounded-md bg-yellow-100 text-yellow-800 text-xs">Close</button>
              </div>
            </div>

            {projects.length === 0 && (
              <p className="text-sm text-slate-700">No projects yet. Use <b>Save</b> to create one.</p>
            )}

            <ul className="space-y-2 mt-2">
              {projects.map(p => (
                <li key={p.id} className={"rounded-lg border p-3 " + (p.id===currentId ? "border-pink-400 bg-pink-50" : "border-yellow-200")}>
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <div className="font-medium truncate">{p.title}</div>
                      <div className="text-xs text-slate-600">
                        {new Date(p.updatedAt || p.createdAt).toLocaleString()}
                        {p.id===currentId && <span className="ml-2 px-1.5 py-0.5 text-[10px] rounded bg-pink-100 text-pink-700">current</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={()=>loadProject(p.id)} className="px-2 py-1 text-xs rounded-md bg-yellow-50 border border-yellow-200 hover:bg-yellow-100">Open</button>
                      <button onClick={()=>renameProject(p.id)} className="px-2 py-1 text-xs rounded-md bg-yellow-50 border border-yellow-200 hover:bg-yellow-100">Rename</button>
                      <button onClick={()=>deleteProject(p.id)} className="px-2 py-1 text-xs rounded-md bg-red-500/90 text-white hover:bg-red-600">Delete</button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* <AIHelpDrawer open={drawerOpen} onOpenChange={setDrawerOpen} /> */}
    </div>
  );
}
