"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

function Toast({ toast, onClose }) {
  if (!toast) return null;
  const styles =
    toast.type === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-900"
      : "border-rose-200 bg-rose-50 text-rose-900";

  return (
    <div
      className={`mb-4 flex items-start justify-between gap-3 rounded-xl border px-4 py-3 text-sm ${styles}`}
      role="status"
      aria-live="polite"
    >
      <div className="leading-5">{toast.message}</div>
      <button
        type="button"
        className="rounded-md px-2 py-1 text-sm font-medium opacity-70 hover:opacity-100"
        onClick={onClose}
        aria-label="Dismiss message"
      >
        ×
      </button>
    </div>
  );
}

function SkeletonRows() {
  return (
    <div className="space-y-3">
      <div className="space-y-3 sm:hidden">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="space-y-2 rounded-2xl border border-zinc-200 bg-white/70 p-4"
          >
            <div className="h-4 w-36 animate-pulse rounded bg-zinc-100" />
            <div className="h-4 w-full animate-pulse rounded bg-zinc-100" />
            <div className="h-3 w-44 animate-pulse rounded bg-zinc-100" />
          </div>
        ))}
      </div>

      <div className="hidden space-y-3 sm:block">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="grid grid-cols-12 gap-3">
            <div className="col-span-3 h-10 animate-pulse rounded-xl bg-zinc-100" />
            <div className="col-span-5 h-10 animate-pulse rounded-xl bg-zinc-100" />
            <div className="col-span-3 h-10 animate-pulse rounded-xl bg-zinc-100" />
            <div className="col-span-1 h-10 animate-pulse rounded-xl bg-zinc-100" />
          </div>
        ))}
      </div>
    </div>
  );
}

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return "";
  }
}

const OBJECT_ID_RE = /^[a-f0-9]{24}$/i;

function getRequestId(r) {
  return r?.id || r?._id || "";
}

export default function AdminPage() {
  const [adminKey, setAdminKey] = useState("");
  const [keyInput, setKeyInput] = useState("");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState(null);
  const [query, setQuery] = useState("");
  const [sortDir, setSortDir] = useState("desc"); // newest first by default
  const inFlightRef = useRef(false);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    const existing = sessionStorage.getItem("adminKey") || "";
    if (existing) setAdminKey(existing);
  }, []);

  const loadRequests = useCallback(async (key, opts = {}) => {
    const { background = false, clearToast = true } = opts;
    if (inFlightRef.current) return;
    inFlightRef.current = true;

    if (clearToast) setToast(null);
    if (background && hasLoadedRef.current) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await fetch("/api/requests", {
        headers: { "x-admin-key": key },
        cache: "no-store",
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (res.status === 401) {
          sessionStorage.removeItem("adminKey");
          setAdminKey("");
          setRequests([]);
          setToast({
            type: "error",
            message: "That admin key didn’t work. Please try again.",
          });
          return;
        }
        setToast({
          type: "error",
          message: data?.error || "Could not load requests.",
        });
        return;
      }

      setRequests(Array.isArray(data.requests) ? data.requests : []);
      hasLoadedRef.current = true;
    } catch {
      setToast({
        type: "error",
        message: "Network error while loading requests.",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
      inFlightRef.current = false;
    }
  }, []);

  useEffect(() => {
    if (!adminKey) return;
    loadRequests(adminKey);
  }, [adminKey, loadRequests]);

  useEffect(() => {
    if (!adminKey) return;
    const id = window.setInterval(() => {
      if (document.hidden) return;
      loadRequests(adminKey, { background: true, clearToast: false });
    }, 10_000);
    return () => window.clearInterval(id);
  }, [adminKey, loadRequests]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = q
      ? requests.filter((r) => {
          const name = String(r.name || "").toLowerCase();
          const song = String(r.song || "").toLowerCase();
          return name.includes(q) || song.includes(q);
        })
      : requests;

    const dir = sortDir === "asc" ? 1 : -1;
    return [...base].sort((a, b) => {
      const at = new Date(a.createdAt).getTime() || 0;
      const bt = new Date(b.createdAt).getTime() || 0;
      return (at - bt) * dir;
    });
  }, [query, requests, sortDir]);

  async function onUnlock(e) {
    e.preventDefault();
    setToast(null);
    const clean = keyInput.trim();
    if (!clean) {
      setToast({ type: "error", message: "Enter the admin key to continue." });
      return;
    }

    sessionStorage.setItem("adminKey", clean);
    setAdminKey(clean);
    setKeyInput("");
  }

  async function onDelete(id) {
    if (!adminKey) return;
    const cleanId = String(id || "");
    if (!OBJECT_ID_RE.test(cleanId)) {
      setToast({
        type: "error",
        message: `Invalid request id (${cleanId.length} chars): ${cleanId || "(empty)"}`,
      });
      return;
    }
    const ok = window.confirm("Delete this request? This can’t be undone.");
    if (!ok) return;

    setToast(null);
    try {
      const res = await fetch(`/api/requests/${encodeURIComponent(cleanId)}`, {
        method: "DELETE",
        headers: { "x-admin-key": adminKey },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setToast({
          type: "error",
          message: data?.error || "Could not delete request.",
        });
        return;
      }
      setRequests((prev) =>
        prev.filter((r) => String(getRequestId(r)) !== cleanId),
      );
      setToast({ type: "success", message: "Deleted." });
    } catch {
      setToast({ type: "error", message: "Network error while deleting." });
    }
  }

  function lock() {
    sessionStorage.removeItem("adminKey");
    setAdminKey("");
    setRequests([]);
    setQuery("");
    setToast({ type: "success", message: "Locked." });
  }

  return (
    <div className="min-h-[100dvh] bg-[linear-gradient(to_bottom,rgba(255,247,237,0.55),rgba(255,255,255,0.65)),radial-gradient(1000px_circle_at_10%_10%,rgba(251,146,60,0.14),transparent_55%),radial-gradient(900px_circle_at_90%_30%,rgba(245,158,11,0.12),transparent_60%),radial-gradient(800px_circle_at_40%_100%,rgba(250,204,21,0.10),transparent_55%),url('/img.jpg')] bg-cover bg-center bg-no-repeat">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:py-10">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              <span className="bg-gradient-to-r from-orange-700 via-amber-600 to-yellow-500 bg-clip-text text-transparent">
                Admin
              </span>
            </h1>
            <p className="mt-1 text-sm text-zinc-600">
              View and manage song requests.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/"
              className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 shadow-sm hover:bg-zinc-50"
            >
              Home
            </Link>
            {adminKey ? (
              <button
                type="button"
                className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 shadow-sm hover:bg-zinc-50"
                onClick={lock}
              >
                Lock
              </button>
            ) : null}
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white/90 p-6 shadow-sm backdrop-blur sm:p-8">
          <div className="pointer-events-none absolute -left-28 -top-28 h-56 w-56 rounded-full bg-gradient-to-br from-orange-300/25 to-amber-300/25 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-28 -right-28 h-56 w-56 rounded-full bg-gradient-to-br from-amber-300/25 to-yellow-300/25 blur-2xl" />
          <Toast toast={toast} onClose={() => setToast(null)} />

          {!adminKey ? (
            <form onSubmit={onUnlock} className="space-y-4">
              <div>
                <label
                  htmlFor="adminKey"
                  className="block text-sm font-medium text-zinc-900"
                >
                  Admin key
                </label>
                <input
                  id="adminKey"
                  name="adminKey"
                  type="password"
                  placeholder="Enter admin key"
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-zinc-900 shadow-sm outline-none placeholder:text-zinc-400 focus:border-zinc-300 focus:ring-4 focus:ring-orange-100"
                />
                <p className="mt-2 text-xs text-zinc-500">
                  Stored in <span className="font-mono">sessionStorage</span>{" "}
                  for this tab/session only.
                </p>
              </div>
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:from-orange-700 hover:via-amber-700 hover:to-yellow-600 focus:outline-none focus:ring-4 focus:ring-orange-200"
              >
                Unlock
              </button>
            </form>
          ) : (
            <>
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative flex-1">
                  <label htmlFor="search" className="sr-only">
                    Search
                  </label>
                  <input
                    id="search"
                    type="text"
                    placeholder="Search by name or song…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 shadow-sm outline-none placeholder:text-zinc-400 focus:border-zinc-300 focus:ring-4 focus:ring-amber-100"
                    disabled={loading}
                  />
                  <div className="mt-2 flex items-center justify-between text-xs text-zinc-500">
                    <span>Auto-refresh: every 10s</span>
                    {refreshing ? <span>Refreshing…</span> : <span />}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setSortDir((d) => (d === "desc" ? "asc" : "desc"))
                  }
                  className="inline-flex items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-900 shadow-sm hover:bg-zinc-50 disabled:opacity-60"
                  disabled={loading}
                  title="Toggle sort order"
                >
                  Sort: {sortDir === "desc" ? "Newest" : "Oldest"}
                </button>
              </div>

              {loading ? (
                <SkeletonRows />
              ) : filtered.length === 0 ? (
                <div className="rounded-xl border border-dashed border-zinc-200 px-6 py-10 text-center">
                  <p className="text-sm font-medium text-zinc-900">
                    No requests yet
                  </p>
                  <p className="mt-1 text-sm text-zinc-600">
                    New requests will show up here.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  {/* Mobile cards */}
                  <div className="space-y-3 sm:hidden">
                    {filtered.map((r) => {
                      const id = getRequestId(r);
                      return (
                      <div
                        key={id}
                        className="rounded-2xl border border-zinc-200 bg-white/80 p-4 shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-zinc-900">
                              {r.name}
                            </p>
                            <p className="mt-1 text-sm text-zinc-700">{r.song}</p>
                            <p className="mt-2 text-xs text-zinc-500">
                              {formatDate(r.createdAt)}
                            </p>
                          </div>
                          <button
                            type="button"
                            className="shrink-0 rounded-xl bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-100"
                            onClick={() => onDelete(id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      );
                    })}
                  </div>

                  {/* Desktop table */}
                  <div className="hidden sm:block">
                    <table className="w-full min-w-[720px] border-separate border-spacing-0">
                      <thead>
                        <tr className="text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          <th className="border-b border-zinc-200 px-3 py-3">
                            Name
                          </th>
                          <th className="border-b border-zinc-200 px-3 py-3">
                            Song
                          </th>
                          <th className="border-b border-zinc-200 px-3 py-3">
                            Created
                          </th>
                          <th className="border-b border-zinc-200 px-3 py-3 text-right">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.map((r) => {
                          const id = getRequestId(r);
                          return (
                          <tr key={id} className="align-top">
                            <td className="border-b border-zinc-100 px-3 py-4 text-sm font-medium text-zinc-900">
                              {r.name}
                            </td>
                            <td className="border-b border-zinc-100 px-3 py-4 text-sm text-zinc-700">
                              {r.song}
                            </td>
                            <td className="border-b border-zinc-100 px-3 py-4 text-sm text-zinc-600">
                              {formatDate(r.createdAt)}
                            </td>
                            <td className="border-b border-zinc-100 px-3 py-4 text-right">
                              <button
                                type="button"
                                className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-100"
                                onClick={() => onDelete(id)}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        <div className="h-8 pb-[env(safe-area-inset-bottom)]" />
      </div>
    </div>
  );
}
