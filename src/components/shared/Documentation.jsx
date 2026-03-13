import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import { categories } from "../utils/docData";
import PageWrapper from "../layout/PageWrapper";

// ─── Icons (inline SVG) ──────────────────────────────────────────────────────
const ChevronDown = ({ className = "" }) => (
  <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);
const CodeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
  </svg>
);
const BookIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);
const NoteIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);
const MenuIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);
const XIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

// ─── Inline code renderer for backtick notation ──────────────────────────────
function renderInlineCode(text) {
  const parts = text.split(/`([^`]+)`/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <code
        key={i}
        className="inline-block px-1 py-0.5 rounded text-[0.78rem] font-mono"
        style={{ background: "rgba(99,102,241,0.12)", color: "#818cf8" }}
      >
        {part}
      </code>
    ) : (
      part
    )
  );
}

// ─── Code Block ──────────────────────────────────────────────────────────────
function CodeBlock({ code, label }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="rounded-xl overflow-hidden border border-white/5 text-sm">
      <div
        className="flex items-center justify-between px-4 py-2"
        style={{ background: "rgba(15,23,42,0.8)" }}
      >
        <span className="flex items-center gap-2 text-xs font-mono" style={{ color: "#94a3b8" }}>
          <CodeIcon />
          {label || "example"}
        </span>
        <button
          onClick={handleCopy}
          className="text-xs px-2 py-0.5 rounded transition-all cursor-pointer"
          style={{
            background: copied ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.06)",
            color: copied ? "#4ade80" : "#94a3b8",
          }}
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <div
        className="px-4 py-4 overflow-x-auto"
        style={{ background: "rgba(2,8,23,0.7)" }}
      >
        <pre className="font-mono text-sm leading-relaxed" style={{ color: "#e2e8f0" }}>
          {code}
        </pre>
      </div>
    </div>
  );
}

// ─── Topic Content Page ───────────────────────────────────────────────────────
function TopicPage({ topic, subcategory, category }) {
  return (
    <div className="max-w-3xl mx-auto px-6 py-10 animate-fadeIn!">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6 text-xs font-bold" style={{ color: "#64748b" }}>
        <span style={{ color: category.color }}>{category.title}</span>
        <span>/</span>
        <span style={{ color: subcategory.color }}>{subcategory.title}</span>
        <span>/</span>
        <span className="text-purple-800">{topic.title}</span>
      </div>

      {/* Title */}
      <h1
        className="text-3xl font-bold font-mono mb-3 tracking-tight"
      >
        {topic.title}
      </h1>

      {/* Description */}
      <p className="text-base leading-relaxed mb-8">
        {renderInlineCode(topic.description)}
      </p>

      {/* Syntax */}
      <div className="mb-8">
        <h2
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-3"
          style={{ color: "#64748b" }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: subcategory.color }}
          />
          Syntax
        </h2>
        <CodeBlock code={topic.syntax} label="syntax" />
      </div>

      {/* Notes */}
      {topic.notes?.length > 0 && (
        <div className="mb-8">
          <h2
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-3"
            style={{ color: "#64748b" }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: subcategory.color }}
            />
            Notes
          </h2>
          <div
            className="rounded-xl border overflow-hidden bg-gray-700"
          >
            {topic.notes.map((note, i) => (
              <div
                key={i}
                className="flex items-start gap-3 px-4 py-3 border-b last:border-b-0 border-blockly-yellow"
              >
                <span className="mt-0.5 shrink-0 text-sky-300">
                  <NoteIcon />
                </span>
                <p className="text-sm leading-relaxed text-white">
                  {renderInlineCode(note)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Example */}
      {topic.example && (
        <div className="mb-8">
          <h2
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-3"
            style={{ color: "#64748b" }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: subcategory.color }}
            />
            Example
          </h2>
          <CodeBlock code={topic.example} label="example.js" />
        </div>
      )}
    </div>
  );
}

// ─── Welcome Screen ───────────────────────────────────────────────────────────
function WelcomeScreen() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-8">
      <div
        className="w-30 h-30 rounded-2xl flex items-center justify-center mb-6"
      >
        <img src="/icon.png" alt="logo" />
      </div>
      <h1 className="text-2xl font-bold mb-2">
        HTML, CSS & JavaScript Reference
      </h1>
      <p className="text-sm font-boldmax-w-sm leading-relaxed" style={{ color: "#64748b" }}>
        Select a topic from the sidebar to read its documentation, syntax guide, and examples.
      </p>
      <div className="mt-8 grid sm:grid-cols-3 gap-3">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="px-4 py-4 rounded-xl border text-xl font-bold font-mono flex flex-col bg-white"
            style={{
              color: cat.color,
            }}
          >
            {cat.title}
            <span className="text-md mt-0.5" style={{ color: "#475569" }}>
              {cat.subcategories.reduce((a, s) => a + s.topics.length, 0)} topics
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function Sidebar({ selectedCat, selectedSub, selectedTopic, onSelect }) {
  const [openCats, setOpenCats] = useState({ [categories[0].id]: true });
  const [openSubs, setOpenSubs] = useState({});

  // Auto-expand to active selection
  useEffect(() => {
    if (selectedCat && selectedSub) {
      setOpenCats((prev) => ({ ...prev, [selectedCat]: true }));
      setOpenSubs((prev) => ({ ...prev, [`${selectedCat}-${selectedSub}`]: true }));
    }
  }, [selectedCat, selectedSub]);

  const toggleCat = (catId) => setOpenCats((prev) => ({ ...prev, [catId]: !prev[catId] }));
  const toggleSub = (key) => setOpenSubs((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <aside
      className="h-full flex flex-col overflow-hidden bg-white"
    >
      {/* Header */}
      <div
        className="px-4 py-4 border-b shrink-0 border-slate-700"
      >
        <h2 className="text-md font-bold uppercase tracking-widest" style={{ color: "#475569" }}>
          Reference
        </h2>
      </div>

      {/* Tree */}
      <div className="overflow-y-auto flex-1 py-3">
        {categories.map((cat) => {
          const catOpen = !!openCats[cat.id];
          return (
            <div key={cat.id} className="mb-1">
              {/* Category row */}
              <button
                onClick={() => toggleCat(cat.id)}
                className="w-full flex items-center justify-between px-4 py-2 text-left transition-colors cursor-pointer hover:bg-white/5 group"
              >
                <span className="flex items-center gap-2.5">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ background: cat.color }}
                  />
                  <span
                    className="text-sm font-semibold"
                    style={{ color: catOpen ? cat.color : "#94a3b8" }}
                  >
                    {cat.title}
                  </span>
                </span>
                <ChevronDown
                  className="transition-transform duration-200"
                  style={{
                    color: "#475569",
                    transform: catOpen ? "rotate(0deg)" : "rotate(-90deg)",
                  }}
                />
              </button>

              {/* Subcategories */}
              {catOpen && (
                <div className="ml-3 border-l pl-2" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                  {cat.subcategories.map((sub) => {
                    const subKey = `${cat.id}-${sub.id}`;
                    const subOpen = !!openSubs[subKey];
                    const isActiveSub = selectedCat === cat.id && selectedSub === sub.id;

                    return (
                      <div key={sub.id}>
                        {/* Subcategory row */}
                        <button
                          onClick={() => toggleSub(subKey)}
                          className="w-full flex items-center justify-between px-3 py-1.5 text-left transition-colors cursor-pointer hover:bg-white/5 rounded-md"
                        >
                          <span className="flex items-center gap-2">
                            <span
                              className="w-1.5 h-1.5 rounded-full shrink-0"
                              style={{ background: isActiveSub ? sub.color : "#334155" }}
                            />
                            <span
                              className="text-xs font-medium"
                              style={{ color: isActiveSub ? sub.color : "#64748b" }}
                            >
                              {sub.title}
                            </span>
                          </span>
                          <ChevronDown
                            className="transition-transform duration-150"
                            style={{
                              color: "#334155",
                              transform: subOpen ? "rotate(0deg)" : "rotate(-90deg)",
                            }}
                          />
                        </button>

                        {/* Topic items */}
                        {subOpen && (
                          <div className="ml-2 mt-0.5 mb-1">
                            {sub.topics.map((topic) => {
                              const isActive =
                                selectedCat === cat.id &&
                                selectedSub === sub.id &&
                                selectedTopic === topic.id;
                              return (
                                <button
                                  key={topic.id}
                                  onClick={() => onSelect(cat.id, sub.id, topic.id)}
                                  className="w-full text-left px-3 py-1 rounded-md text-xs font-mono transition-all cursor-pointer"
                                  style={{
                                    color: isActive ? "black" : "#475569",
                                    background: isActive
                                      ? `${sub.color}18`
                                      : "transparent",
                                    borderLeft: isActive
                                      ? `2px solid ${sub.color}`
                                      : "2px solid transparent",
                                  }}
                                >
                                  {topic.title}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}

// ─── Main Documentation Component ────────────────────────────────────────────
const Documentation = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const selectedCat = searchParams.get("cat") || null;
  const selectedSub = searchParams.get("sub") || null;
  const selectedTopic = searchParams.get("topic") || null;

  const handleSelect = (catId, subId, topicId) => {
    setSearchParams({ cat: catId, sub: subId, topic: topicId });
    setMobileSidebarOpen(false);
  };

  // Resolve active objects
  const activeCat = categories.find((c) => c.id === selectedCat);
  const activeSub = activeCat?.subcategories.find((s) => s.id === selectedSub);
  const activeTopic = activeSub?.topics.find((t) => t.id === selectedTopic);

  return (
    <>
      <div
        className="flex h-[calc(100vh-4rem)] overflow-hidden relative"
      >
        {/* ── Mobile overlay ── */}
        {mobileSidebarOpen && (
          <div
            className="fixed inset-0 z-20 bg-black/60 lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}

        {/* ── Sidebar ── */}
        <div
          className={[
            "fixed lg:relative z-30 lg:z-auto",
            "top-0 left-0 h-full w-64 shrink-0",
            "border-r-2 border-slate-400 transition-transform duration-300 lg:translate-x-0",
            mobileSidebarOpen ? "translate-x-0" : "-translate-x-full",
          ].join(" ")}
        >
          <Sidebar
            selectedCat={selectedCat}
            selectedSub={selectedSub}
            selectedTopic={selectedTopic}
            onSelect={handleSelect}
          />
        </div>

        {/* ── Content area ── */}
        <main className="flex-1 overflow-y-auto bg-amber-50">
          {/* Mobile header */}
          <div
            className="lg:hidden flex items-center gap-3 px-4 py-3 border-b sticky top-0 z-10 bg-blockly-purple"
            style={{
              borderColor: "rgba(255,255,255,0.06)",
              backdropFilter: "blur(8px)",
            }}
          >
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="p-1.5 rounded-lg transition-colors hover:bg-white/10 cursor-pointer"
              style={{ color: "white" }}
            >
              <MenuIcon />
            </button>
            <span className="text-sm font-bold text-blockly-light">
              {activeTopic
                ? `${activeCat?.title} / ${activeSub?.title} / ${activeTopic.title}`
                : "Documentation"}
            </span>
          </div>

          {activeTopic && activeSub && activeCat ? (
            <TopicPage topic={activeTopic} subcategory={activeSub} category={activeCat} />
          ) : (
            <WelcomeScreen />
          )}
        </main>
      </div>

      {/* Animation style */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.25s ease; }
      `}</style>
    </>
  );
};

export default Documentation;