"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

function ConfettiBurst({ runKey }) {
  const [pieces, setPieces] = useState([]);

  useEffect(() => {
    if (!runKey) return;

    const colors = [
      "#f97316", // orange
      "#fb7185", // rose
      "#f59e0b", // amber
      "#facc15", // yellow
      "#ef4444", // red
      "#fdba74", // orange (light)
    ];
    const next = Array.from({ length: 28 }).map((_, i) => {
      const angle = (i / 28) * Math.PI * 2;
      const radius = 140 + Math.random() * 140;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius - (120 + Math.random() * 60);
      const r = (Math.random() * 720 - 360).toFixed(0);
      const d = (Math.random() * 120).toFixed(0);
      return {
        id: `${runKey}-${i}`,
        x: `${x.toFixed(0)}px`,
        y: `${y.toFixed(0)}px`,
        r: `${r}deg`,
        d: `${d}ms`,
        bg: colors[Math.floor(Math.random() * colors.length)],
      };
    });

    // Trigger a short-lived "burst" when runKey changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPieces(next);
    const t = setTimeout(() => setPieces([]), 1200);
    return () => clearTimeout(t);
  }, [runKey]);

  if (pieces.length === 0) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="confetti-piece"
          style={{
            background: p.bg,
            ["--x"]: p.x,
            ["--y"]: p.y,
            ["--r"]: p.r,
            ["--d"]: p.d,
          }}
        />
      ))}
    </div>
  );
}

function MusicNotesBurst({ runKey }) {
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    if (!runKey) return;

    const glyphs = ["♪", "♫", "♩", "♬"];
    const colors = [
      "from-orange-600 to-yellow-400",
      "from-amber-600 to-orange-500",
      "from-yellow-500 to-amber-500",
    ];

    const next = Array.from({ length: 10 }).map((_, i) => {
      const x = (Math.random() * 360 - 180).toFixed(0);
      const y = (-220 - Math.random() * 140).toFixed(0);
      const r = (Math.random() * 80 - 40).toFixed(0);
      const d = (Math.random() * 140).toFixed(0);
      return {
        id: `${runKey}-n-${i}`,
        glyph: glyphs[Math.floor(Math.random() * glyphs.length)],
        x: `${x}px`,
        y: `${y}px`,
        r: `${r}deg`,
        d: `${d}ms`,
        gradient: colors[Math.floor(Math.random() * colors.length)],
      };
    });

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNotes(next);
    const t = setTimeout(() => setNotes([]), 1400);
    return () => clearTimeout(t);
  }, [runKey]);

  if (notes.length === 0) return null;

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      {notes.map((n) => (
        <span
          key={n.id}
          className={`music-note bg-gradient-to-r ${n.gradient} bg-clip-text text-transparent`}
          style={{
            ["--x"]: n.x,
            ["--y"]: n.y,
            ["--r"]: n.r,
            ["--d"]: n.d,
          }}
        >
          {n.glyph}
        </span>
      ))}
    </div>
  );
}

function SparklesBurst({ runKey }) {
  const [sparkles, setSparkles] = useState([]);

  useEffect(() => {
    if (!runKey) return;

    const next = Array.from({ length: 14 }).map((_, i) => {
      const angle = (i / 14) * Math.PI * 2;
      const radius = 90 + Math.random() * 130;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius - (60 + Math.random() * 60);
      const r = (Math.random() * 180 - 90).toFixed(0);
      const d = (Math.random() * 140).toFixed(0);
      return {
        id: `${runKey}-s-${i}`,
        x: `${x.toFixed(0)}px`,
        y: `${y.toFixed(0)}px`,
        r: `${r}deg`,
        d: `${d}ms`,
      };
    });

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSparkles(next);
    const t = setTimeout(() => setSparkles([]), 1200);
    return () => clearTimeout(t);
  }, [runKey]);

  if (sparkles.length === 0) return null;

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      {sparkles.map((s) => (
        <span
          key={s.id}
          className="sparkle"
          style={{
            ["--x"]: s.x,
            ["--y"]: s.y,
            ["--r"]: s.r,
            ["--d"]: s.d,
          }}
        />
      ))}
    </div>
  );
}

function BurstRings({ runKey }) {
  if (!runKey) return null;
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      <span className="celebration-ring" style={{ ["--d"]: "0ms" }} />
      <span
        className="celebration-ring"
        style={{
          ["--d"]: "120ms",
          width: "340px",
          height: "340px",
          borderColor: "rgba(245,158,11,0.20)",
        }}
      />
    </div>
  );
}

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

export default function HomePage() {
  const [name, setName] = useState("");
  const [song, setSong] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [touched, setTouched] = useState({ name: false, song: false });
  const [celebrateKey, setCelebrateKey] = useState(0);
  const [celebrating, setCelebrating] = useState(false);

  useEffect(() => {
    if (!celebrateKey) return;
    setCelebrating(true);
    const t = setTimeout(() => setCelebrating(false), 600);
    return () => clearTimeout(t);
  }, [celebrateKey]);

  const errors = useMemo(() => {
    const next = {};
    if (touched.name && name.trim().length < 2) next.name = "Enter your name.";
    if (touched.song && song.trim().length < 2) next.song = "Enter a song title.";
    return next;
  }, [name, song, touched]);

  async function onSubmit(e) {
    e.preventDefault();
    setToast(null);
    setTouched({ name: true, song: true });

    const cleanName = name.trim();
    const cleanSong = song.trim();
    if (cleanName.length < 2 || cleanSong.length < 2) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: cleanName, song: cleanSong }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setToast({
          type: "error",
          message: data?.error || "Could not send request. Please try again.",
        });
        return;
      }

      setName("");
      setSong("");
      setTouched({ name: false, song: false });
      setCelebrateKey((k) => k + 1);
    } catch {
      setToast({
        type: "error",
        message: "Network error. Please check your connection and try again.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative min-h-[100dvh] bg-[linear-gradient(to_bottom,rgba(255,247,237,0.55),rgba(255,255,255,0.65)),radial-gradient(1000px_circle_at_10%_10%,rgba(251,146,60,0.14),transparent_55%),radial-gradient(900px_circle_at_90%_30%,rgba(245,158,11,0.12),transparent_60%),radial-gradient(800px_circle_at_40%_100%,rgba(250,204,21,0.10),transparent_55%),url('/img.jpg')] bg-cover bg-center bg-no-repeat">
      <div className="ambient-layer" aria-hidden="true">
        <div className="ambient-sheen" />
        <div
          className="ambient-blob"
          style={{
            top: "-10%",
            left: "-12%",
            ["--s"]: "520px",
            ["--x"]: "34px",
            ["--y"]: "26px",
            ["--t"]: "11s",
          }}
        />
        <div
          className="ambient-blob"
          style={{
            top: "8%",
            right: "-16%",
            ["--s"]: "560px",
            ["--x"]: "-28px",
            ["--y"]: "34px",
            ["--t"]: "13s",
          }}
        />
        <div
          className="ambient-blob"
          style={{
            bottom: "-18%",
            left: "12%",
            ["--s"]: "640px",
            ["--x"]: "22px",
            ["--y"]: "-28px",
            ["--t"]: "15s",
          }}
        />

        <span className="ambient-dot" style={{ top: "18%", left: "16%", ["--t"]: "2.8s", ["--d"]: "0ms" }} />
        <span className="ambient-dot" style={{ top: "26%", right: "18%", ["--t"]: "3.4s", ["--d"]: "200ms" }} />
        <span className="ambient-dot" style={{ bottom: "26%", left: "10%", ["--t"]: "3.1s", ["--d"]: "450ms" }} />
        <span className="ambient-dot" style={{ bottom: "18%", right: "14%", ["--t"]: "2.6s", ["--d"]: "120ms" }} />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[100dvh] max-w-2xl items-start px-4 py-8 sm:items-center sm:py-10">
        <div className="w-full">
          <div className="mx-auto w-full max-w-xl">
            <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-center sm:text-left">
              <h1 className="text-2xl font-semibold tracking-tight">
                  <span className="relative inline-block">
               
                  </span>
                </h1>

              </div>
              <div className="flex justify-center sm:block">

              </div>
            </header>

            <div className="rounded-3xl bg-gradient-to-r from-orange-300/70 via-amber-300/60 to-yellow-200/70 p-[1px] shadow-lg shadow-zinc-900/5">
            <div
              className={`relative overflow-hidden rounded-3xl border border-white/40 bg-white/88 p-6 backdrop-blur sm:p-8 ${
                celebrating ? "celebration-pop" : ""
              }`}
            >
              <div className="pointer-events-none absolute -left-28 -top-28 h-56 w-56 rounded-full bg-gradient-to-br from-orange-300/35 to-amber-300/35 blur-2xl" />
              <div className="pointer-events-none absolute -bottom-28 -right-28 h-56 w-56 rounded-full bg-gradient-to-br from-amber-300/30 to-yellow-300/30 blur-2xl" />
              {/* Re-mount on each submit to restart CSS keyframes */}
              {celebrateKey ? (
                <div key={celebrateKey} className="eq-burst" aria-hidden="true">
                  <span className="eq-bar" style={{ ["--d"]: "0ms" }} />
                  <span className="eq-bar" style={{ ["--d"]: "70ms" }} />
                  <span className="eq-bar" style={{ ["--d"]: "140ms" }} />
                  <span className="eq-bar" style={{ ["--d"]: "210ms" }} />
                  <span className="eq-bar" style={{ ["--d"]: "280ms" }} />
                </div>
              ) : null}
              <BurstRings runKey={celebrateKey} />
              <ConfettiBurst runKey={celebrateKey} />
              <MusicNotesBurst runKey={celebrateKey} />
              <SparklesBurst runKey={celebrateKey} />

              <div className="relative">
                <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>

          
                    <div className={`heading-wrap ${celebrating ? "heading-bounce" : ""}`}>
                      <span aria-hidden="true" className="heading-aura">
                        SLIIT தைப்பொங்கல்
                      </span>
                      <span className="heading-shimmer">Sliit தைப்பொங்கல்</span>
                      <span aria-hidden="true" className="heading-underline" />
                      <span aria-hidden="true" className="heading-float heading-float-1">
                        ♫
                      </span>
                      <span aria-hidden="true" className="heading-float heading-float-2">
                        ✦
                      </span>
                    </div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-zinc-600">
                      Let’s celebrate good music
                    </p>
                    <h2 className="mt-1 text-lg font-semibold text-zinc-900">
                      Drop your request
                    </h2>
                  </div>
                  <span className="inline-flex w-fit items-center rounded-full border border-white/50 bg-white/70 px-2.5 py-1 text-xs font-semibold text-zinc-700 shadow-sm">
                    Live 🎶
                  </span>
                </div>

                <Toast toast={toast} onClose={() => setToast(null)} />

                <form onSubmit={onSubmit} className="space-y-5">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-zinc-900"
                    >
                      Name
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      placeholder="DJ Sanjee"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                      className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white/90 px-4 py-3 text-zinc-900 shadow-sm outline-none ring-0 placeholder:text-zinc-400 focus:border-zinc-300 focus:ring-4 focus:ring-orange-100"
                      disabled={submitting}
                    />
                    {errors.name ? (
                      <p className="mt-2 text-sm text-rose-600">{errors.name}</p>
                    ) : (
                      <p className="mt-2 text-xs text-zinc-500">
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="song"
                      className="block text-sm font-medium text-zinc-900"
                    >
                      Song name
                    </label>
                    <input
                      id="song"
                      name="song"
                      type="text"
                      autoComplete="off"
                      placeholder="thalapathy kacheri"
                      value={song}
                      onChange={(e) => setSong(e.target.value)}
                      onBlur={() => setTouched((t) => ({ ...t, song: true }))}
                      className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white/90 px-4 py-3 text-zinc-900 shadow-sm outline-none ring-0 placeholder:text-zinc-400 focus:border-zinc-300 focus:ring-4 focus:ring-amber-100"
                      disabled={submitting}
                    />
                    {errors.song ? (
                      <p className="mt-2 text-sm text-rose-600">{errors.song}</p>
                    ) : (
                      <p className="mt-2 text-xs text-zinc-500">
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:from-orange-700 hover:via-amber-700 hover:to-yellow-600 focus:outline-none focus:ring-4 focus:ring-orange-200 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <span className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100">
                      <span className="absolute -left-10 top-0 h-full w-24 -skew-x-12 bg-white/20 blur-sm" />
                    </span>
                    {submitting ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                        Sending…
                      </>
                    ) : (
                      "Send request"
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
