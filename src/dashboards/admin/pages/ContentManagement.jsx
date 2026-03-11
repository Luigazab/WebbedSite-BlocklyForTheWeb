import { useState, useEffect } from "react";
import {
  BookOpen, Layers, ClipboardList, Eye, EyeOff,
  MoreHorizontal, Search, RefreshCw, Trash2, X,
  CheckCircle, XCircle, ExternalLink
} from "lucide-react";
import { supabase } from "../../../supabaseClient";

const TABS = [
  { key: "lessons",   label: "Lessons",   icon: BookOpen },
  { key: "tutorials", label: "Tutorials", icon: Layers },
  { key: "quizzes",   label: "Quizzes",   icon: ClipboardList },
];

function PublishedBadge({ published }) {
  return published ? (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
      <CheckCircle size={9} /> Published
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-white/30 bg-white/[0.04] border border-white/[0.08] px-2 py-0.5 rounded-full">
      <XCircle size={9} /> Draft
    </span>
  );
}

function ConfirmModal({ title, message, confirmLabel, confirmClass, onConfirm, onClose, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[#13151e] border border-white/10 rounded-2xl w-full max-w-sm p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-white text-base font-semibold mb-2">{title}</h2>
        <p className="text-white/40 text-sm mb-6">{message}</p>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 text-sm text-white/50 bg-white/[0.04] rounded-lg hover:bg-white/[0.07]">Cancel</button>
          <button onClick={onConfirm} disabled={loading} className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 ${confirmClass}`}>
            {loading ? "…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function RowMenu({ item, tab, onTogglePublish, onDelete }) {
  const [open, setOpen] = useState(false);
  const isPublished = item.is_published;
  return (
    <div className="relative">
      <button onClick={() => setOpen((o) => !o)} className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white/[0.06] text-white/30 hover:text-white/70 transition-colors">
        <MoreHorizontal size={15} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-8 z-20 w-44 bg-[#1a1d2a] border border-white/10 rounded-xl shadow-2xl py-1.5 text-sm">
            {tab !== "quizzes" && (
              <button onClick={() => { onTogglePublish(item); setOpen(false); }} className={`w-full flex items-center gap-2.5 px-3 py-2 hover:bg-white/[0.05] text-left ${isPublished ? "text-amber-300" : "text-emerald-400"}`}>
                {isPublished ? <EyeOff size={13} /> : <Eye size={13} />}
                {isPublished ? "Unpublish" : "Publish"}
              </button>
            )}
            <div className="my-1 border-t border-white/[0.06]" />
            <button onClick={() => { onDelete(item); setOpen(false); }} className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-rose-500/10 text-rose-400 text-left">
              <Trash2 size={13} />
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default function ContentManagement() {
  const [activeTab, setActiveTab] = useState("lessons");
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [confirmModal, setConfirmModal] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const PAGE_SIZE = 12;

  const fetchItems = async () => {
    setLoading(true);
    try {
      let q;
      if (activeTab === "lessons") {
        q = supabase.from("lessons").select("id,title,is_published,created_at,estimated_duration,profiles(username)", { count: "exact" }).order("created_at", { ascending: false });
      } else if (activeTab === "tutorials") {
        q = supabase.from("tutorials").select("id,title,is_published,created_at,difficulty_level,profiles(username)", { count: "exact" }).order("created_at", { ascending: false });
      } else {
        q = supabase.from("quizzes").select("id,title,created_at,passing_score,profiles(username)", { count: "exact" }).order("created_at", { ascending: false });
      }

      if (search) q = q.ilike("title", `%${search}%`);
      q = q.range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

      const { data, count, error } = await q;
      if (error) throw error;
      setItems(data || []);
      setTotal(count || 0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, [activeTab, search, page]);

  const handleTogglePublish = (item) => {
    setConfirmModal({
      type: "publish",
      item,
      title: item.is_published ? "Unpublish Content" : "Publish Content",
      message: `Are you sure you want to ${item.is_published ? "unpublish" : "publish"} "${item.title}"?`,
      confirmLabel: item.is_published ? "Unpublish" : "Publish",
      confirmClass: item.is_published ? "text-amber-300 bg-amber-500/15 hover:bg-amber-500/25" : "text-black bg-amber-500 hover:bg-amber-400",
    });
  };

  const handleDelete = (item) => {
    setConfirmModal({
      type: "delete",
      item,
      title: "Delete Content",
      message: `Permanently delete "${item.title}"? This cannot be undone.`,
      confirmLabel: "Delete",
      confirmClass: "text-white bg-rose-600 hover:bg-rose-500",
    });
  };

  const executeAction = async () => {
    if (!confirmModal) return;
    setActionLoading(true);
    try {
      if (confirmModal.type === "publish") {
        const table = activeTab === "lessons" ? "lessons" : "tutorials";
        await supabase.from(table).update({ is_published: !confirmModal.item.is_published }).eq("id", confirmModal.item.id);
      } else if (confirmModal.type === "delete") {
        const table = activeTab;
        await supabase.from(table).delete().eq("id", confirmModal.item.id);
      }
      setConfirmModal(null);
      fetchItems();
    } finally {
      setActionLoading(false);
    }
  };

  const timeAgo = (ts) => {
    if (!ts) return "—";
    const d = new Date(ts);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="max-w-7xl space-y-4 mx-auto py-4">
      {/* Tabs */}
      <div className="flex items-center gap-1 bg-[#13151e] border border-white/[0.06] rounded-xl p-1 w-fit">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => { setActiveTab(key); setPage(0); setSearch(""); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === key
                ? "bg-amber-500/15 text-amber-300 shadow-sm"
                : "text-white/35 hover:text-white/60"
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-[#13151e] border border-white/[0.06] rounded-lg px-3 py-2.5 flex-1 max-w-72 focus-within:border-amber-500/30 transition-colors">
          <Search size={13} className="text-white/30 shrink-0" />
          <input
            placeholder={`Search ${activeTab}...`}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            className="bg-transparent text-white/70 text-sm placeholder:text-white/20 outline-none flex-1"
          />
          {search && <button onClick={() => setSearch("")} className="text-white/30 hover:text-white/60"><X size={12} /></button>}
        </div>
        <button onClick={fetchItems} className="w-9 h-9 flex items-center justify-center rounded-lg bg-[#13151e] border border-white/[0.06] text-white/40 hover:text-white/70 transition-colors">
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
        </button>
        <p className="text-white/30 text-xs ml-auto">{total.toLocaleString()} {activeTab}</p>
      </div>

      {/* Table */}
      <div className="bg-[#13151e] border border-white/[0.06] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left text-[11px] font-semibold text-white/25 uppercase tracking-wider px-4 py-3">Title</th>
                <th className="text-left text-[11px] font-semibold text-white/25 uppercase tracking-wider px-4 py-3">Creator</th>
                {activeTab !== "quizzes" && (
                  <th className="text-left text-[11px] font-semibold text-white/25 uppercase tracking-wider px-4 py-3">Status</th>
                )}
                {activeTab === "lessons" && (
                  <th className="text-left text-[11px] font-semibold text-white/25 uppercase tracking-wider px-4 py-3">Duration</th>
                )}
                {activeTab === "tutorials" && (
                  <th className="text-left text-[11px] font-semibold text-white/25 uppercase tracking-wider px-4 py-3">Difficulty</th>
                )}
                {activeTab === "quizzes" && (
                  <th className="text-left text-[11px] font-semibold text-white/25 uppercase tracking-wider px-4 py-3">Pass Score</th>
                )}
                <th className="text-left text-[11px] font-semibold text-white/25 uppercase tracking-wider px-4 py-3">Created</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array(8).fill(0).map((_, i) => (
                    <tr key={i} className="border-b border-white/[0.03]">
                      {Array(5).fill(0).map((_, j) => (
                        <td key={j} className="px-4 py-3"><div className="h-3 bg-white/[0.04] rounded animate-pulse w-28" /></td>
                      ))}
                    </tr>
                  ))
                : items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-white/25 text-sm">No {activeTab} found</td>
                  </tr>
                ) : items.map((item) => {
                  const diffColors = { beginner: "text-emerald-400", intermediate: "text-amber-400", advanced: "text-rose-400" };
                  return (
                    <tr key={item.id} className="border-b border-white/[0.03] hover:bg-white/[0.015] transition-colors">
                      <td className="px-4 py-3">
                        <p className="text-white/80 text-sm font-medium truncate max-w-[260px]">{item.title}</p>
                      </td>
                      <td className="px-4 py-3 text-white/40 text-xs">@{item.profiles?.username || "—"}</td>
                      {activeTab !== "quizzes" && (
                        <td className="px-4 py-3"><PublishedBadge published={item.is_published} /></td>
                      )}
                      {activeTab === "lessons" && (
                        <td className="px-4 py-3 text-white/40 text-xs">{item.estimated_duration ? `${item.estimated_duration}m` : "—"}</td>
                      )}
                      {activeTab === "tutorials" && (
                        <td className="px-4 py-3">
                          <span className={`text-xs capitalize ${diffColors[item.difficulty_level] || "text-white/40"}`}>{item.difficulty_level}</span>
                        </td>
                      )}
                      {activeTab === "quizzes" && (
                        <td className="px-4 py-3 text-white/40 text-xs">{item.passing_score ?? "—"}%</td>
                      )}
                      <td className="px-4 py-3 text-white/30 text-xs">{timeAgo(item.created_at)}</td>
                      <td className="px-4 py-3">
                        <RowMenu item={item} tab={activeTab} onTogglePublish={handleTogglePublish} onDelete={handleDelete} />
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-end px-4 py-3 border-t border-white/[0.06] gap-1">
            <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} className="px-3 py-1.5 text-xs text-white/40 disabled:opacity-30 rounded-md hover:bg-white/[0.04]">Prev</button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pg = page < 3 ? i : page - 2 + i;
              if (pg >= totalPages) return null;
              return <button key={pg} onClick={() => setPage(pg)} className={`w-7 h-7 text-xs rounded-md ${pg === page ? "bg-amber-500/20 text-amber-300" : "text-white/35 hover:bg-white/[0.04]"}`}>{pg + 1}</button>;
            })}
            <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="px-3 py-1.5 text-xs text-white/40 disabled:opacity-30 rounded-md hover:bg-white/[0.04]">Next</button>
          </div>
        )}
      </div>

      {confirmModal && (
        <ConfirmModal
          {...confirmModal}
          onConfirm={executeAction}
          onClose={() => setConfirmModal(null)}
          loading={actionLoading}
        />
      )}
    </div>
  );
}