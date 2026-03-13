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
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
      <CheckCircle size={9} /> Published
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-gray-400 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-full">
      <XCircle size={9} /> Draft
    </span>
  );
}

function ConfirmModal({ title, message, confirmLabel, confirmClass, onConfirm, onClose, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-sm p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-gray-900 text-base font-semibold mb-2">{title}</h2>
        <p className="text-gray-400 text-sm mb-6">{message}</p>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 text-sm text-gray-500 bg-gray-50 rounded-lg hover:bg-gray-100">Cancel</button>
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
      <button onClick={() => setOpen((o) => !o)} className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-gray-50 text-gray-400 hover:text-gray-700 transition-colors">
        <MoreHorizontal size={15} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-8 z-20 w-44 bg-white border border-gray-200 rounded-xl shadow-2xl py-1.5 text-sm">
            {tab !== "quizzes" && (
              <button onClick={() => { onTogglePublish(item); setOpen(false); }} className={`w-full flex items-center gap-2.5 px-3 py-2 hover:bg-gray-50 text-left ${isPublished ? "text-amber-700" : "text-emerald-600"}`}>
                {isPublished ? <EyeOff size={13} /> : <Eye size={13} />}
                {isPublished ? "Unpublish" : "Publish"}
              </button>
            )}
            <div className="my-1 border-t border-gray-200" />
            <button onClick={() => { onDelete(item); setOpen(false); }} className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-rose-50 text-rose-500 text-left">
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
      confirmClass: item.is_published ? "text-amber-700 bg-amber-50 hover:bg-amber-500/25" : "text-white bg-amber-500 hover:bg-amber-400",
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
      <h1 className="text-2xl font-bold">Content Management</h1>     

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2.5 flex-1 max-w-72 focus-within:border-amber-500/30 transition-colors">
          <Search size={13} className="text-gray-400 shrink-0" />
          <input
            placeholder={`Search ${activeTab}...`}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            className="bg-transparent text-gray-700 text-sm placeholder:text-gray-300 outline-none flex-1"
          />
          {search && <button onClick={() => setSearch("")} className="text-gray-400 hover:text-gray-600"><X size={12} /></button>}
        </div>
        <button onClick={fetchItems} className="w-9 h-9 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-400 hover:text-gray-700 transition-colors">
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
        </button>
         <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1 w-fit">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => { setActiveTab(key); setPage(0); setSearch(""); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === key
                  ? "bg-amber-50 text-amber-700 shadow-sm"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>
        <p className="text-gray-400 text-xs ml-auto">{total.toLocaleString()} {activeTab}</p>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-4 py-3">Title</th>
                <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-4 py-3">Creator</th>
                {activeTab !== "quizzes" && (
                  <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-4 py-3">Status</th>
                )}
                {activeTab === "lessons" && (
                  <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-4 py-3">Duration</th>
                )}
                {activeTab === "tutorials" && (
                  <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-4 py-3">Difficulty</th>
                )}
                {activeTab === "quizzes" && (
                  <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-4 py-3">Pass Score</th>
                )}
                <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-4 py-3">Created</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array(8).fill(0).map((_, i) => (
                    <tr key={i} className="border-b border-gray-100">
                      {Array(5).fill(0).map((_, j) => (
                        <td key={j} className="px-4 py-3"><div className="h-3 bg-gray-50 rounded animate-pulse w-28" /></td>
                      ))}
                    </tr>
                  ))
                : items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-gray-400 text-sm">No {activeTab} found</td>
                  </tr>
                ) : items.map((item) => {
                  const diffColors = { beginner: "text-emerald-600", intermediate: "text-amber-600", advanced: "text-rose-500" };
                  return (
                    <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="text-gray-800 text-sm font-medium truncate max-w-[260px]">{item.title}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">@{item.profiles?.username || "—"}</td>
                      {activeTab !== "quizzes" && (
                        <td className="px-4 py-3"><PublishedBadge published={item.is_published} /></td>
                      )}
                      {activeTab === "lessons" && (
                        <td className="px-4 py-3 text-gray-400 text-xs">{item.estimated_duration ? `${item.estimated_duration}m` : "—"}</td>
                      )}
                      {activeTab === "tutorials" && (
                        <td className="px-4 py-3">
                          <span className={`text-xs capitalize ${diffColors[item.difficulty_level] || "text-gray-400"}`}>{item.difficulty_level}</span>
                        </td>
                      )}
                      {activeTab === "quizzes" && (
                        <td className="px-4 py-3 text-gray-400 text-xs">{item.passing_score ?? "—"}%</td>
                      )}
                      <td className="px-4 py-3 text-gray-400 text-xs">{timeAgo(item.created_at)}</td>
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
          <div className="flex items-center justify-end px-4 py-3 border-t border-gray-200 gap-1">
            <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} className="px-3 py-1.5 text-xs text-gray-400 disabled:opacity-30 rounded-md hover:bg-gray-50">Prev</button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pg = page < 3 ? i : page - 2 + i;
              if (pg >= totalPages) return null;
              return <button key={pg} onClick={() => setPage(pg)} className={`w-7 h-7 text-xs rounded-md ${pg === page ? "bg-amber-50 text-amber-700" : "text-gray-400 hover:bg-gray-50"}`}>{pg + 1}</button>;
            })}
            <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="px-3 py-1.5 text-xs text-gray-400 disabled:opacity-30 rounded-md hover:bg-gray-50">Next</button>
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