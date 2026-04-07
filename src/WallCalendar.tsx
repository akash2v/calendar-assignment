"use client";

import { useState, useEffect, useCallback, useRef } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type ThemeKey = "blue" | "teal" | "amber" | "rose" | "slate";
type SceneKey = "mountain" | "forest" | "desert" | "sakura" | "city";

interface Theme {
  main: string;
  dark: string;
  light: string;
  scene: SceneKey;
}

interface DatePoint {
  y: number;
  m: number;
  d: number;
}

interface NotesStore {
  [key: string]: string[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MONTHS = [
  "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
  "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER",
] as const;

const SHORT_MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
] as const;

const HOLIDAYS: Record<string, string> = {
  "2026-1-1": "New Year's Day",
  "2026-1-26": "Republic Day",
  "2026-3-14": "Holi",
  "2026-4-14": "Dr. Ambedkar Jayanti",
  "2026-5-1": "Labour Day",
  "2026-8-15": "Independence Day",
  "2026-10-2": "Gandhi Jayanti",
  "2026-10-20": "Dussehra",
  "2026-11-5": "Diwali",
  "2026-12-25": "Christmas Day",
};

const THEMES: Record<ThemeKey, Theme> = {
  blue:  { main: "#1a85d6", dark: "#0e5fa0", light: "#e8f4fd", scene: "mountain" },
  teal:  { main: "#0d9488", dark: "#0f766e", light: "#d1fae5", scene: "forest" },
  amber: { main: "#d97706", dark: "#b45309", light: "#fef3c7", scene: "desert" },
  rose:  { main: "#e11d48", dark: "#9f1239", light: "#ffe4e6", scene: "sakura" },
  slate: { main: "#475569", dark: "#1e293b", light: "#f1f5f9", scene: "city" },
};

const THEME_DOTS: { key: ThemeKey; color: string; label: string }[] = [
  { key: "blue",  color: "#1a85d6", label: "Ocean" },
  { key: "teal",  color: "#0d9488", label: "Forest" },
  { key: "amber", color: "#d97706", label: "Sunset" },
  { key: "rose",  color: "#e11d48", label: "Rose" },
  { key: "slate", color: "#475569", label: "Slate" },
];

// ─── Utilities ────────────────────────────────────────────────────────────────

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function darken(hex: string, amount: number): string {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.max(0, Math.min(255, (n >> 16) - Math.round(amount * 255)));
  const g = Math.max(0, Math.min(255, ((n >> 8) & 0xff) - Math.round(amount * 255)));
  const b = Math.max(0, Math.min(255, (n & 0xff) - Math.round(amount * 255)));
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

function toComparable(dt: DatePoint): number {
  return dt.y * 10000 + dt.m * 100 + dt.d;
}

function formatDate(dt: DatePoint | null): string {
  if (!dt) return "";
  return `${SHORT_MONTHS[dt.m]} ${dt.d}`;
}

function daysBetween(a: DatePoint, b: DatePoint): number {
  const d1 = new Date(a.y, a.m, a.d);
  const d2 = new Date(b.y, b.m, b.d);
  return Math.abs(Math.round((d2.getTime() - d1.getTime()) / 86400000)) + 1;
}

function getHolidaysForMonth(year: number, month: number): Record<number, string> {
  const result: Record<number, string> = {};
  Object.entries(HOLIDAYS).forEach(([key, name]) => {
    const [y, m, d] = key.split("-").map(Number);
    if (y === year && m === month + 1) result[d] = name;
  });
  return result;
}

function notesKey(year: number, month: number): string {
  return `${year}-${month}`;
}

// ─── SVG Hero Scenes ──────────────────────────────────────────────────────────

function MountainScene({ theme }: { theme: Theme }) {
  return (
    <>
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={darken(theme.dark, 0.3)} />
          <stop offset="100%" stopColor={theme.main} />
        </linearGradient>
      </defs>
      <rect width="900" height="220" fill="url(#sky)" />
      <polygon points="0,220 120,60 240,220" fill="rgba(255,255,255,0.08)" />
      <polygon points="80,220 250,30 420,220" fill="rgba(255,255,255,0.12)" />
      <polygon points="300,220 500,50 700,220" fill="rgba(255,255,255,0.07)" />
      <polygon points="500,220 680,80 860,220" fill="rgba(255,255,255,0.10)" />
      <polygon points="650,220 800,100 950,220" fill="rgba(255,255,255,0.06)" />
      <ellipse cx="160" cy="70" rx="60" ry="18" fill="rgba(255,255,255,0.15)" />
      <ellipse cx="400" cy="50" rx="80" ry="22" fill="rgba(255,255,255,0.10)" />
      <ellipse cx="700" cy="80" rx="55" ry="16" fill="rgba(255,255,255,0.12)" />
      <rect x="0" y="180" width="900" height="40" fill="rgba(0,0,0,0.18)" />
    </>
  );
}

function ForestScene({ theme }: { theme: Theme }) {
  const trees = [40, 120, 200, 280, 360, 440, 520, 600, 680, 760, 840];
  return (
    <>
      <rect width="900" height="220" fill={darken(theme.dark, 0.2)} />
      {trees.map((x, i) => (
        <polygon
          key={x}
          points={`${x},220 ${x + 30},${80 + (i % 3) * 20} ${x + 60},220`}
          fill={`rgba(255,255,255,${(0.07 + (i % 4) * 0.025).toFixed(3)})`}
        />
      ))}
      <ellipse cx="200" cy="60" rx="70" ry="20" fill="rgba(255,255,255,0.08)" />
      <ellipse cx="600" cy="45" rx="90" ry="24" fill="rgba(255,255,255,0.07)" />
      <rect x="0" y="190" width="900" height="30" fill="rgba(0,0,0,0.22)" />
    </>
  );
}

function DesertScene({ theme }: { theme: Theme }) {
  return (
    <>
      <defs>
        <linearGradient id="dsky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7c2d12" />
          <stop offset="50%" stopColor={theme.main} />
          <stop offset="100%" stopColor="#fbbf24" />
        </linearGradient>
      </defs>
      <rect width="900" height="220" fill="url(#dsky)" />
      <ellipse cx="140" cy="80" rx="50" ry="50" fill="rgba(255,200,100,0.25)" />
      <path d="M0,160 Q150,120 300,150 Q450,180 600,140 Q750,100 900,160 L900,220 L0,220Z" fill="rgba(0,0,0,0.25)" />
      <rect x="200" y="100" width="8" height="80" fill="rgba(255,255,255,0.15)" />
      <path d="M204,120 Q230,110 210,115" stroke="rgba(255,255,255,0.15)" fill="none" strokeWidth="6" />
      <rect x="600" y="90" width="8" height="90" fill="rgba(255,255,255,0.12)" />
      <path d="M604,110 Q630,100 610,105" stroke="rgba(255,255,255,0.12)" fill="none" strokeWidth="6" />
    </>
  );
}

function SakuraScene({ theme }: { theme: Theme }) {
  const petals = Array.from({ length: 30 }, (_, i) => ({
    cx: (i * 137.5) % 900,
    cy: (i * 73) % 200,
    rx: 3 + (i % 5),
    ry: 2 + (i % 3),
    opacity: 0.1 + (i % 3) * 0.07,
    rotate: (i * 43) % 360,
  }));
  return (
    <>
      <rect width="900" height="220" fill={theme.dark} />
      <ellipse cx="200" cy="90" rx="120" ry="80" fill="rgba(255,255,255,0.06)" />
      <ellipse cx="700" cy="70" rx="100" ry="70" fill="rgba(255,255,255,0.06)" />
      {petals.map((p, i) => (
        <ellipse
          key={i}
          cx={p.cx} cy={p.cy} rx={p.rx} ry={p.ry}
          fill={`rgba(255,255,255,${p.opacity.toFixed(2)})`}
          transform={`rotate(${p.rotate} ${p.cx} ${p.cy})`}
        />
      ))}
      <rect x="0" y="185" width="900" height="35" fill="rgba(0,0,0,0.18)" />
    </>
  );
}

function CityScene({ theme }: { theme: Theme }) {
  const buildings = [
    [0,140,60,80],[60,160,40,60],[100,120,50,100],[150,150,35,70],
    [185,100,55,120],[240,140,40,80],[280,160,30,60],[310,110,60,110],
    [370,130,45,90],[415,150,40,70],[455,90,65,130],[520,140,45,80],
    [565,120,50,100],[615,160,35,60],[650,100,60,120],[710,140,40,80],
    [750,160,35,60],[785,110,55,110],[840,140,40,80],[880,150,30,70],
  ];

  const windowSeeds = [0.1,0.9,0.3,0.7,0.5,0.2,0.8,0.4,0.6,0.15,0.85,0.35,0.65,0.45,0.75,0.25,0.55,0.95,0.05,0.88];

  return (
    <>
      <rect width="900" height="220" fill={darken(theme.dark, 0.4)} />
      {buildings.map(([x, y, w, h], bi) => {
        const rows = Math.floor(h / 20);
        const cols = Math.floor(w / 16);
        const windows: React.ReactElement[] = [];
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const lit = windowSeeds[(bi + r * 3 + c) % windowSeeds.length] > 0.4;
            windows.push(
              <rect
                key={`${r}-${c}`}
                x={x + 4 + c * 14} y={y + 4 + r * 18}
                width="8" height="10"
                fill={lit ? "rgba(255,230,100,0.25)" : "transparent"}
              />
            );
          }
        }
        return (
          <g key={bi}>
            <rect x={x} y={y} width={w} height={h} fill="rgba(255,255,255,0.08)" />
            {windows}
          </g>
        );
      })}
      <rect x="0" y="200" width="900" height="20" fill="rgba(0,0,0,0.3)" />
    </>
  );
}

function HeroScene({ theme }: { theme: Theme }) {
  switch (theme.scene) {
    case "forest":  return <ForestScene theme={theme} />;
    case "desert":  return <DesertScene theme={theme} />;
    case "sakura":  return <SakuraScene theme={theme} />;
    case "city":    return <CityScene theme={theme} />;
    default:        return <MountainScene theme={theme} />;
  }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SpiralBinding() {
  const coils = Array.from({ length: 18 }, (_, i) => i);
  return (
    <div className="wc-spiral-bar">
      <div className="wc-nail-hook" />
      {coils.map((i) => (
        <div key={i} className="wc-coil" />
      ))}
    </div>
  );
}

interface DayCellProps {
  day: number;
  isOtherMonth?: boolean;
  isToday?: boolean;
  isWeekend?: boolean;
  isStart?: boolean;
  isEnd?: boolean;
  inRange?: boolean;
  hasHoliday?: boolean;
  onClick?: () => void;
}

function DayCell({
  day, isOtherMonth, isToday, isWeekend,
  isStart, isEnd, inRange, hasHoliday, onClick,
}: DayCellProps) {
  const classes = [
    "wc-day",
    isOtherMonth ? "wc-day--other" : "",
    isToday      ? "wc-day--today" : "",
    isWeekend    ? "wc-day--weekend" : "",
    isStart      ? "wc-day--start" : "",
    isEnd        ? "wc-day--end" : "",
    inRange && !isStart && !isEnd ? "wc-day--range" : "",
    hasHoliday   ? "wc-day--holiday" : "",
  ].filter(Boolean).join(" ");

  return (
    <button className={classes} onClick={onClick} disabled={isOtherMonth} type="button">
      {day}
    </button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export interface WallCalendarProps {
  /** Initial month to display (0-indexed). Defaults to current month. */
  initialMonth?: number;
  /** Initial year to display. Defaults to current year. */
  initialYear?: number;
  /** Initial theme. Defaults to "blue". */
  initialTheme?: ThemeKey;
  /** Called whenever the date range changes. */
  onRangeChange?: (start: DatePoint | null, end: DatePoint | null) => void;
}

export default function WallCalendar({
  initialMonth,
  initialYear,
  initialTheme = "blue",
  onRangeChange,
}: WallCalendarProps) {
  const today = new Date();
  const [year, setYear]     = useState(initialYear  ?? today.getFullYear());
  const [month, setMonth]   = useState(initialMonth ?? today.getMonth());
  const [theme, setTheme]   = useState<ThemeKey>(initialTheme);
  const [rangeStart, setRangeStart] = useState<DatePoint | null>(null);
  const [rangeEnd,   setRangeEnd]   = useState<DatePoint | null>(null);
  const [selecting,  setSelecting]  = useState(false);
  const [notes, setNotes]           = useState<NotesStore>({});

  const t = THEMES[theme];
  const holidays = getHolidaysForMonth(year, month);
  const key = notesKey(year, month);

  // Ensure notes array exists for current month
  const currentNotes = notes[key] ?? ["", "", ""];

  // Notify parent on range change
  useEffect(() => {
    onRangeChange?.(rangeStart, rangeEnd);
  }, [rangeStart, rangeEnd, onRangeChange]);

  // ── Navigation ──────────────────────────────────────────────────────────────

  const prevMonth = useCallback(() => {
    const d = new Date(year, month - 1, 1);
    setYear(d.getFullYear());
    setMonth(d.getMonth());
    setRangeStart(null);
    setRangeEnd(null);
    setSelecting(false);
  }, [year, month]);

  const nextMonth = useCallback(() => {
    const d = new Date(year, month + 1, 1);
    setYear(d.getFullYear());
    setMonth(d.getMonth());
    setRangeStart(null);
    setRangeEnd(null);
    setSelecting(false);
  }, [year, month]);

  // ── Day selection ───────────────────────────────────────────────────────────

  const handleDayClick = useCallback((d: number) => {
    const pt: DatePoint = { y: year, m: month, d };
    if (!selecting || !rangeStart) {
      setRangeStart(pt);
      setRangeEnd(null);
      setSelecting(true);
    } else {
      setRangeEnd(pt);
      setSelecting(false);
    }
  }, [selecting, rangeStart, year, month]);

  const clearSelection = () => {
    setRangeStart(null);
    setRangeEnd(null);
    setSelecting(false);
  };

  // ── Notes ───────────────────────────────────────────────────────────────────

  const updateNote = (idx: number, val: string) => {
    setNotes((prev) => {
      const arr = [...(prev[key] ?? ["", "", ""])];
      arr[idx] = val;
      return { ...prev, [key]: arr };
    });
  };

  const addNote = () => {
    setNotes((prev) => ({
      ...prev,
      [key]: [...(prev[key] ?? ["", "", ""]), ""],
    }));
  };

  // ── Calendar grid ────────────────────────────────────────────────────────────

  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0=Sun
  const startOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const rs = rangeStart ? toComparable(rangeStart) : null;
  const re = rangeEnd   ? toComparable(rangeEnd)   : null;
  const minR = rs !== null && re !== null ? Math.min(rs, re) : rs;
  const maxR = rs !== null && re !== null ? Math.max(rs, re) : rs;

  // ── Selection summary ────────────────────────────────────────────────────────

  let selectionSummary = "";
  let notesRangeLabel = "";

  if (rangeStart && rangeEnd) {
    const rsC = toComparable(rangeStart);
    const reC = toComparable(rangeEnd);
    const start = rsC <= reC ? rangeStart : rangeEnd;
    const end   = rsC <= reC ? rangeEnd   : rangeStart;
    const days  = daysBetween(start, end);
    selectionSummary = `${formatDate(start)} – ${formatDate(end)} · ${days} day${days > 1 ? "s" : ""}`;
    notesRangeLabel  = `${formatDate(start)} – ${formatDate(end)}`;
  } else if (rangeStart) {
    selectionSummary = `Start: ${formatDate(rangeStart)}`;
    notesRangeLabel  = formatDate(rangeStart);
  }

  // ── Theme CSS variables ──────────────────────────────────────────────────────

  const themeVars = {
    "--wc-main":       t.main,
    "--wc-dark":       t.dark,
    "--wc-light":      t.light,
    "--wc-range-bg":   hexToRgba(t.main, 0.12),
    "--wc-range-bd":   hexToRgba(t.main, 0.3),
    "--wc-hero-start": darken(t.dark, 0.3),
    "--wc-hero-end":   t.main,
  } as React.CSSProperties;

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <>
      <style>{CSS}</style>
      <div className="wc-root" style={themeVars}>
        {/* Wire binding */}
        <SpiralBinding />

        {/* Main card */}
        <div className="wc-card">

          {/* Hero */}
          <div className="wc-hero">
            <svg
              className="wc-hero-svg"
              viewBox="0 0 900 220"
              preserveAspectRatio="xMidYMid slice"
              aria-hidden="true"
            >
              <HeroScene theme={t} />
            </svg>
            <div className="wc-hero-overlay">
              <div className="wc-month-display">
                <span className="wc-year">{year}</span>
                <span className="wc-month">{MONTHS[month]}</span>
              </div>
              <div className="wc-nav-btns">
                <button className="wc-nav-btn" onClick={prevMonth} aria-label="Previous month">←</button>
                <button className="wc-nav-btn" onClick={nextMonth} aria-label="Next month">→</button>
              </div>
            </div>
          </div>

          {/* Lower panel */}
          <div className="wc-lower">

            {/* Notes */}
            <aside className="wc-notes">
              <p className="wc-notes-label">Notes</p>
              {notesRangeLabel && (
                <p className="wc-notes-range">{notesRangeLabel}</p>
              )}
              <div className="wc-notes-fields">
                {currentNotes.map((val, i) => (
                  <input
                    key={i}
                    className="wc-note-input"
                    type="text"
                    placeholder={`Note ${i + 1}…`}
                    value={val}
                    onChange={(e) => updateNote(i, e.target.value)}
                  />
                ))}
              </div>
              <button className="wc-add-note" onClick={addNote} type="button">
                + add note
              </button>

              {/* Holidays */}
              <div className="wc-holidays">
                <p className="wc-holidays-label">This month</p>
                {Object.keys(holidays).length === 0 ? (
                  <p className="wc-no-holiday">No holidays</p>
                ) : (
                  Object.entries(holidays).map(([d, name]) => (
                    <div key={d} className="wc-holiday-item">
                      <span className="wc-holiday-dot" />
                      <span><strong>{d}</strong> {name}</span>
                    </div>
                  ))
                )}
              </div>
            </aside>

            {/* Calendar grid */}
            <div className="wc-grid-panel">
              {/* Weekday headers */}
              <div className="wc-weekdays">
                {["MON","TUE","WED","THU","FRI","SAT","SUN"].map((d) => (
                  <div key={d} className={`wc-weekday${d === "SAT" || d === "SUN" ? " wc-weekday--weekend" : ""}`}>
                    {d}
                  </div>
                ))}
              </div>

              {/* Day cells */}
              <div className="wc-days" role="grid" aria-label={`${MONTHS[month]} ${year}`}>
                {/* Previous month overflow */}
                {Array.from({ length: startOffset }, (_, i) => (
                  <DayCell
                    key={`prev-${i}`}
                    day={prevMonthDays - startOffset + 1 + i}
                    isOtherMonth
                  />
                ))}

                {/* Current month */}
                {Array.from({ length: daysInMonth }, (_, i) => {
                  const d = i + 1;
                  const dayOfWeek = new Date(year, month, d).getDay();
                  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                  const isToday =
                    today.getFullYear() === year &&
                    today.getMonth() === month &&
                    today.getDate() === d;
                  const comp = toComparable({ y: year, m: month, d });
                  const isStart = rs !== null && comp === rs;
                  const isEnd   = re !== null && comp === re;
                  const inRange =
                    minR !== null && maxR !== null &&
                    comp >= minR && comp <= maxR;

                  return (
                    <DayCell
                      key={d}
                      day={d}
                      isToday={isToday}
                      isWeekend={isWeekend}
                      isStart={isStart}
                      isEnd={isEnd}
                      inRange={inRange}
                      hasHoliday={!!holidays[d]}
                      onClick={() => handleDayClick(d)}
                    />
                  );
                })}

                {/* Next month overflow */}
                {(() => {
                  const total = startOffset + daysInMonth;
                  const remaining = total % 7 === 0 ? 0 : 7 - (total % 7);
                  return Array.from({ length: remaining }, (_, i) => (
                    <DayCell key={`next-${i}`} day={i + 1} isOtherMonth />
                  ));
                })()}
              </div>

              {/* Selection hints */}
              <p className="wc-hint">
                {rangeStart && !rangeEnd
                  ? "Now click an end date"
                  : rangeEnd
                  ? "Click a date to start a new selection"
                  : "Click a date to start selecting a range"}
              </p>
              {selectionSummary && (
                <p className="wc-summary">{selectionSummary}</p>
              )}
              {(rangeStart || rangeEnd) && (
                <button className="wc-clear" onClick={clearSelection} type="button">
                  clear selection
                </button>
              )}
            </div>
          </div>

          {/* Theme picker */}
          <div className="wc-theme-bar">
            <span className="wc-theme-label">Theme</span>
            {THEME_DOTS.map(({ key: k, color, label }) => (
              <button
                key={k}
                className={`wc-theme-dot${theme === k ? " wc-theme-dot--active" : ""}`}
                style={{ background: color }}
                onClick={() => setTheme(k)}
                title={label}
                aria-label={`${label} theme`}
                aria-pressed={theme === k}
                type="button"
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Scoped CSS ───────────────────────────────────────────────────────────────

const CSS = `
  .wc-root {
    font-family: 'DM Sans', system-ui, sans-serif;
    max-width: 900px;
    margin: 0 auto;
    padding: 16px;
  }

  /* Spiral binding */
  .wc-spiral-bar {
    display: flex;
    justify-content: center;
    align-items: flex-end;
    height: 28px;
    gap: 8px;
    padding: 0 32px;
    position: relative;
    z-index: 10;
  }
  .wc-nail-hook {
    position: absolute;
    left: 50%; top: -20px;
    transform: translateX(-50%);
    width: 12px; height: 26px;
    border: 3px solid #999;
    border-bottom: none;
    border-radius: 6px 6px 0 0;
  }
  .wc-nail-hook::before {
    content: '';
    position: absolute;
    left: 50%; top: -8px;
    transform: translateX(-50%);
    width: 6px; height: 8px;
    background: #999;
    border-radius: 3px;
  }
  .wc-coil {
    width: 14px; height: 20px;
    border: 2.5px solid #aaa;
    border-bottom: none;
    border-radius: 7px 7px 0 0;
  }

  /* Card */
  .wc-card {
    background: #fff;
    border-radius: 0 0 12px 12px;
    overflow: hidden;
    box-shadow: 0 8px 40px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.06);
  }

  /* Hero */
  .wc-hero {
    position: relative;
    height: 220px;
    overflow: hidden;
    background: linear-gradient(135deg, var(--wc-hero-start) 0%, var(--wc-hero-end) 100%);
  }
  .wc-hero-svg {
    position: absolute;
    inset: 0;
    width: 100%; height: 100%;
  }
  .wc-hero-overlay {
    position: absolute;
    bottom: 0; right: 0;
    width: 55%; height: 100%;
    clip-path: polygon(30% 0%, 100% 0%, 100% 100%, 0% 100%);
    background: var(--wc-main);
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    justify-content: flex-end;
    padding: 24px 28px;
    z-index: 2;
  }
  .wc-month-display { text-align: right; }
  .wc-year {
    display: block;
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 22px;
    font-weight: 400;
    color: rgba(255,255,255,0.85);
    letter-spacing: 3px;
  }
  .wc-month {
    display: block;
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 42px;
    font-weight: 700;
    color: #fff;
    line-height: 1;
    letter-spacing: 2px;
  }
  .wc-nav-btns { display: flex; gap: 8px; margin-top: 14px; }
  .wc-nav-btn {
    background: rgba(255,255,255,0.18);
    border: none;
    border-radius: 50%;
    width: 34px; height: 34px;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    color: #fff; font-size: 16px;
    transition: background 0.2s;
  }
  .wc-nav-btn:hover { background: rgba(255,255,255,0.32); }

  /* Lower split */
  .wc-lower {
    display: grid;
    grid-template-columns: 200px 1fr;
  }

  /* Notes panel */
  .wc-notes {
    padding: 24px 20px;
    border-right: 1px solid #eef0f4;
    background: #fafbfd;
    min-height: 340px;
    display: flex;
    flex-direction: column;
  }
  .wc-notes-label {
    font-size: 11px;
    font-weight: 500;
    color: #7a7a8a;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    margin-bottom: 8px;
  }
  .wc-notes-range {
    font-size: 12px;
    color: var(--wc-main);
    font-weight: 500;
    margin-bottom: 10px;
    min-height: 18px;
  }
  .wc-notes-fields {
    display: flex;
    flex-direction: column;
    gap: 10px;
    flex: 1;
    margin-bottom: 10px;
  }
  .wc-note-input {
    border: none;
    border-bottom: 1px solid #dde0ea;
    background: transparent;
    font-family: inherit;
    font-size: 13px;
    color: #1a1a2e;
    padding: 3px 0;
    width: 100%;
    outline: none;
    transition: border-color 0.2s;
  }
  .wc-note-input:focus { border-color: var(--wc-main); }
  .wc-note-input::placeholder { color: #ccc; }
  .wc-add-note {
    font-size: 12px;
    color: var(--wc-main);
    background: none;
    border: none;
    cursor: pointer;
    text-align: left;
    padding: 0;
    font-family: inherit;
    opacity: 0.8;
    transition: opacity 0.2s;
  }
  .wc-add-note:hover { opacity: 1; }

  /* Holidays */
  .wc-holidays {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px dashed #e0e3ed;
  }
  .wc-holidays-label {
    font-size: 10px;
    font-weight: 500;
    color: #7a7a8a;
    text-transform: uppercase;
    letter-spacing: 1.2px;
    margin-bottom: 8px;
  }
  .wc-holiday-item {
    font-size: 11px;
    color: #1a1a2e;
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 5px;
  }
  .wc-holiday-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: #f0a500;
    flex-shrink: 0;
  }
  .wc-no-holiday { font-size: 11px; color: #bbb; }

  /* Grid panel */
  .wc-grid-panel { padding: 20px 20px 16px; }
  .wc-weekdays {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    margin-bottom: 6px;
  }
  .wc-weekday {
    text-align: center;
    font-size: 11px;
    font-weight: 500;
    color: #7a7a8a;
    letter-spacing: 0.8px;
    padding: 4px 0;
  }
  .wc-weekday--weekend { color: #e53935; }

  /* Day grid */
  .wc-days {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 2px;
  }
  .wc-day {
    aspect-ratio: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    border: none;
    background: transparent;
    font-size: 13px;
    font-weight: 400;
    font-family: inherit;
    color: #1a1a2e;
    cursor: pointer;
    transition: all 0.15s;
    position: relative;
    user-select: none;
    padding: 0;
  }
  .wc-day:hover:not(:disabled) {
    background: var(--wc-light);
    color: var(--wc-dark);
  }
  .wc-day:disabled {
    color: #ccc;
    cursor: default;
    font-size: 12px;
  }
  .wc-day--today {
    font-weight: 700;
    border: 2px solid var(--wc-main);
    color: var(--wc-main);
  }
  .wc-day--weekend { color: #e53935; }
  .wc-day--range {
    background: var(--wc-range-bg);
    border-radius: 0;
    color: var(--wc-dark);
  }
  .wc-day--start {
    background: var(--wc-main) !important;
    color: #fff !important;
    border-radius: 50% 0 0 50%;
    font-weight: 600;
    z-index: 2;
  }
  .wc-day--end {
    background: var(--wc-main) !important;
    color: #fff !important;
    border-radius: 0 50% 50% 0;
    font-weight: 600;
    z-index: 2;
  }
  .wc-day--start.wc-day--end { border-radius: 50%; }
  .wc-day--holiday::after {
    content: '';
    position: absolute;
    bottom: 3px; left: 50%;
    transform: translateX(-50%);
    width: 4px; height: 4px;
    border-radius: 50%;
    background: #f0a500;
  }
  .wc-day--start.wc-day--holiday::after,
  .wc-day--end.wc-day--holiday::after {
    background: rgba(255,255,255,0.8);
  }

  /* Hints */
  .wc-hint {
    text-align: center;
    font-size: 11px;
    color: #7a7a8a;
    padding: 10px 0 2px;
    letter-spacing: 0.3px;
  }
  .wc-summary {
    text-align: center;
    font-size: 12px;
    color: var(--wc-main);
    font-weight: 500;
    padding: 2px 0;
  }
  .wc-clear {
    display: block;
    margin: 4px auto 0;
    font-size: 11px;
    color: #aaa;
    background: none;
    border: none;
    cursor: pointer;
    font-family: inherit;
    padding: 4px 8px;
    transition: color 0.2s;
  }
  .wc-clear:hover { color: #e53935; }

  /* Theme bar */
  .wc-theme-bar {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
    padding: 10px 20px;
    background: #fafbfd;
    border-top: 1px solid #eef0f4;
  }
  .wc-theme-label {
    font-size: 11px;
    color: #7a7a8a;
    margin-right: 4px;
  }
  .wc-theme-dot {
    width: 18px; height: 18px;
    border-radius: 50%;
    cursor: pointer;
    border: 2.5px solid transparent;
    transition: border-color 0.2s;
    padding: 0;
  }
  .wc-theme-dot--active { border-color: #333; }

  /* Responsive */
  @media (max-width: 620px) {
    .wc-lower { grid-template-columns: 1fr; }
    .wc-notes {
      border-right: none;
      border-bottom: 1px solid #eef0f4;
      min-height: auto;
    }
    .wc-hero { height: 160px; }
    .wc-hero-overlay { width: 60%; padding: 14px 16px; }
    .wc-month { font-size: 28px; }
    .wc-year { font-size: 16px; }
    .wc-day { font-size: 11px; }
    .wc-theme-bar { padding: 8px 12px; }
    .wc-grid-panel { padding: 14px 12px 10px; }
    .wc-notes { padding: 16px 14px; }
  }
`;
