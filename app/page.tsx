"use client";

import { useState, useEffect } from "react";

// ── Types ──────────────────────────────────────────────────────────────────────

interface AttendeeForm {
  name: string;
  company: string;
  role: string;
}

interface MeetingBrief {
  attendees: Array<{
    name: string;
    background: string;
    recentHighlights: string;
  }>;
  talkTracks: Array<{
    topic: string;
    approach: string;
    keyPoints: string[];
  }>;
  anticipatedObjections: Array<{
    objection: string;
    suggestedResponse: string;
  }>;
  followUpEmailTemplate: string;
  executiveSummary: string;
}

// ── Utilities ──────────────────────────────────────────────────────────────────

function briefToText(brief: MeetingBrief): string {
  return [
    `MEETING STRATEGY\n${brief.executiveSummary}`,
    `ATTENDEE BACKGROUNDS\n${brief.attendees
      .map((a) => `${a.name}\n${a.background}\nRecent: ${a.recentHighlights}`)
      .join("\n\n")}`,
    `TALK TRACKS\n${brief.talkTracks
      .map(
        (t) =>
          `${t.topic}\n${t.approach}\n${t.keyPoints.map((p) => `• ${p}`).join("\n")}`
      )
      .join("\n\n")}`,
    `ANTICIPATED OBJECTIONS\n${brief.anticipatedObjections
      .map((o) => `Objection: ${o.objection}\nResponse: ${o.suggestedResponse}`)
      .join("\n\n")}`,
    `FOLLOW-UP EMAIL\n${brief.followUpEmailTemplate}`,
  ].join("\n\n────────\n\n");
}

// ── Loading steps ──────────────────────────────────────────────────────────────

const LOADING_STEPS = [
  { label: "Researching attendees", detail: "Searching the web for profiles & recent news" },
  { label: "Analysing meeting context", detail: "Understanding your goals and position" },
  { label: "Building strategy brief", detail: "Claude is crafting talk tracks & objections" },
  { label: "Finalising email template", detail: "Almost there…" },
];

function LoadingState() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timings = [5000, 12000, 22000];
    const timers = timings.map((delay, i) =>
      setTimeout(() => setStep(i + 1), delay)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-20 gap-8 px-4">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-2 border-zinc-100" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-zinc-800 animate-spin" />
        <div className="absolute inset-2 rounded-full border border-zinc-100" />
      </div>

      <ol className="space-y-3 w-full max-w-xs">
        {LOADING_STEPS.map((s, i) => {
          const done = i < step;
          const active = i === step;
          return (
            <li
              key={i}
              className={`flex items-start gap-3 transition-opacity duration-500 ${
                i > step ? "opacity-30" : "opacity-100"
              }`}
            >
              <span
                className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold transition-colors duration-300 ${
                  done
                    ? "bg-emerald-500 text-white"
                    : active
                    ? "bg-zinc-800 text-white"
                    : "bg-zinc-200 text-zinc-400"
                }`}
              >
                {done ? (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  i + 1
                )}
              </span>
              <div>
                <p className={`text-sm font-semibold ${active ? "text-zinc-900" : "text-zinc-500"}`}>
                  {s.label}
                </p>
                {active && (
                  <p className="text-xs text-zinc-400 mt-0.5">{s.detail}</p>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      <p className="text-xs text-zinc-400">Typically 15–30 seconds</p>
    </div>
  );
}

// ── Copy button ────────────────────────────────────────────────────────────────

function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* fallback */
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-700 px-2.5 py-1.5 rounded-md hover:bg-zinc-100 transition-colors"
      aria-label={label}
    >
      {copied ? (
        <>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span className="text-emerald-600">Copied</span>
        </>
      ) : (
        <>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          {label}
        </>
      )}
    </button>
  );
}

// ── Section card ───────────────────────────────────────────────────────────────

function SectionCard({
  title,
  icon,
  copyText,
  children,
  accentColor,
}: {
  title: string;
  icon: React.ReactNode;
  copyText: string;
  children: React.ReactNode;
  accentColor?: string;
}) {
  return (
    <div
      className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm"
      style={accentColor ? { borderLeft: `4px solid ${accentColor}` } : undefined}
    >
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-100 bg-zinc-50/80">
        <div className="flex items-center gap-2.5">
          <span className="text-zinc-500">{icon}</span>
          <h3 className="text-sm font-semibold text-zinc-800">{title}</h3>
        </div>
        <CopyButton text={copyText} />
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

// ── Results panel ──────────────────────────────────────────────────────────────

function ResultsPanel({ brief, onReset }: { brief: MeetingBrief; onReset: () => void }) {
  const fullText = briefToText(brief);

  const handlePrint = () => window.print();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-zinc-900">Meeting Brief</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-800 px-2.5 py-1.5 rounded-md hover:bg-zinc-100 transition-colors print:hidden"
            title="Print brief"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 6 2 18 2 18 9" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
            Print
          </button>
          <CopyButton text={fullText} label="Copy all" />
        </div>
      </div>

      {/* Strategy banner */}
      <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-2xl p-5 text-white shadow-md">
        <div className="flex items-center gap-2 mb-2">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Meeting Strategy</p>
        </div>
        <p className="text-sm leading-relaxed text-zinc-100">{brief.executiveSummary}</p>
      </div>

      {/* Attendee Backgrounds */}
      <SectionCard
        title="Attendee Backgrounds"
        accentColor="#60a5fa"
        icon={
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        }
        copyText={brief.attendees
          .map((a) => `${a.name}\n${a.background}\n\nRecent: ${a.recentHighlights}`)
          .join("\n\n---\n\n")}
      >
        <div className="space-y-6">
          {brief.attendees.map((a, i) => (
            <div key={i} className={i > 0 ? "pt-6 border-t border-zinc-100" : ""}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-full bg-zinc-900 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-white">{a.name.charAt(0)}</span>
                </div>
                <p className="text-sm font-bold text-zinc-900">{a.name}</p>
              </div>
              <p className="text-sm text-zinc-600 leading-relaxed">{a.background}</p>
              <div className="mt-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
                <p className="text-xs font-semibold text-blue-600 mb-1">Recent highlights</p>
                <p className="text-xs text-blue-700 leading-relaxed">{a.recentHighlights}</p>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Talk Tracks */}
      <SectionCard
        title="Talk Tracks"
        accentColor="#a78bfa"
        icon={
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        }
        copyText={brief.talkTracks
          .map(
            (t) =>
              `${t.topic}\n${t.approach}\n${t.keyPoints.map((p) => `• ${p}`).join("\n")}`
          )
          .join("\n\n")}
      >
        <div className="space-y-5">
          {brief.talkTracks.map((track, i) => (
            <div key={i} className={i > 0 ? "pt-5 border-t border-zinc-100" : ""}>
              <div className="flex items-start gap-3 mb-2">
                <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-bold">
                  {i + 1}
                </span>
                <div>
                  <p className="text-sm font-bold text-zinc-900">{track.topic}</p>
                  <p className="text-xs text-zinc-400 italic mt-0.5">{track.approach}</p>
                </div>
              </div>
              <ul className="space-y-2 ml-8">
                {track.keyPoints.map((point, j) => (
                  <li key={j} className="flex gap-2.5 text-sm text-zinc-600 leading-relaxed">
                    <span className="mt-2 w-1 h-1 rounded-full bg-zinc-300 flex-shrink-0" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Anticipated Objections */}
      <SectionCard
        title="Anticipated Objections"
        accentColor="#fbbf24"
        icon={
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        }
        copyText={brief.anticipatedObjections
          .map((o) => `Objection: ${o.objection}\nResponse: ${o.suggestedResponse}`)
          .join("\n\n")}
      >
        <div className="space-y-4">
          {brief.anticipatedObjections.map((obj, i) => (
            <div key={i} className={i > 0 ? "pt-4 border-t border-zinc-100" : ""}>
              <div className="mb-3 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
                <span className="text-xs font-semibold text-amber-600">Objection</span>
                <p className="text-sm font-medium text-zinc-800 mt-1">{obj.objection}</p>
              </div>
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3">
                <span className="text-xs font-semibold text-emerald-600">Your response</span>
                <p className="text-sm text-zinc-700 leading-relaxed mt-1">{obj.suggestedResponse}</p>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Follow-up Email */}
      <SectionCard
        title="Follow-up Email Template"
        accentColor="#34d399"
        icon={
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
        }
        copyText={brief.followUpEmailTemplate}
      >
        <pre className="text-sm text-zinc-600 leading-relaxed whitespace-pre-wrap font-sans bg-zinc-50 rounded-xl p-4 border border-zinc-100">
          {brief.followUpEmailTemplate}
        </pre>
      </SectionCard>

      {/* Reset */}
      <button
        onClick={onReset}
        className="w-full py-2.5 px-4 bg-white border border-zinc-200 text-zinc-500 text-sm font-medium rounded-xl hover:bg-zinc-50 hover:text-zinc-800 transition-colors print:hidden"
      >
        Prep another meeting
      </button>
    </div>
  );
}

// ── Input form ─────────────────────────────────────────────────────────────────

function InputForm({
  onSubmit,
  loading,
}: {
  onSubmit: (data: {
    attendees: AttendeeForm[];
    meetingContext: string;
    userCompany: string;
    userRole: string;
  }) => void;
  loading: boolean;
}) {
  const [attendees, setAttendees] = useState<AttendeeForm[]>([
    { name: "", company: "", role: "" },
  ]);
  const [meetingContext, setMeetingContext] = useState("");
  const [userCompany, setUserCompany] = useState("");
  const [userRole, setUserRole] = useState("");

  const addAttendee = () => {
    if (attendees.length < 10)
      setAttendees([...attendees, { name: "", company: "", role: "" }]);
  };

  const removeAttendee = (i: number) =>
    setAttendees(attendees.filter((_, idx) => idx !== i));

  const updateAttendee = (i: number, field: keyof AttendeeForm, value: string) => {
    const updated = [...attendees];
    updated[i][field] = value;
    setAttendees(updated);
  };

  const canSubmit =
    !loading &&
    attendees.some((a) => a.name.trim()) &&
    meetingContext.trim().length >= 10;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    onSubmit({ attendees, meetingContext, userCompany, userRole });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* About you */}
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-5 space-y-4">
        <h2 className="text-sm font-semibold text-zinc-900">About you</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1.5">
              Your company <span className="text-zinc-300">(optional)</span>
            </label>
            <input
              type="text"
              value={userCompany}
              onChange={(e) => setUserCompany(e.target.value)}
              placeholder="Acme Corp"
              className="w-full text-sm px-3 py-2 rounded-lg border border-zinc-200 bg-white text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-800 focus:border-transparent transition"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1.5">
              Your role <span className="text-zinc-300">(optional)</span>
            </label>
            <input
              type="text"
              value={userRole}
              onChange={(e) => setUserRole(e.target.value)}
              placeholder="VP of Sales"
              className="w-full text-sm px-3 py-2 rounded-lg border border-zinc-200 bg-white text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-800 focus:border-transparent transition"
            />
          </div>
        </div>
      </div>

      {/* Attendees */}
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-900">Attendees</h2>
          {attendees.length > 1 && (
            <span className="text-xs text-zinc-400">{attendees.length} people</span>
          )}
        </div>

        <div className="space-y-2.5">
          <div className="grid grid-cols-[1fr_1fr_1fr_28px] gap-2 px-0.5">
            <p className="text-xs font-medium text-zinc-400">Name *</p>
            <p className="text-xs font-medium text-zinc-400">Company</p>
            <p className="text-xs font-medium text-zinc-400">Role</p>
            <span />
          </div>

          {attendees.map((attendee, i) => (
            <div key={i} className="grid grid-cols-[1fr_1fr_1fr_28px] gap-2 items-center">
              <input
                type="text"
                value={attendee.name}
                onChange={(e) => updateAttendee(i, "name", e.target.value)}
                placeholder="Jane Smith"
                className="text-sm px-3 py-2 rounded-lg border border-zinc-200 bg-white text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-800 focus:border-transparent transition"
              />
              <input
                type="text"
                value={attendee.company}
                onChange={(e) => updateAttendee(i, "company", e.target.value)}
                placeholder="Company"
                className="text-sm px-3 py-2 rounded-lg border border-zinc-200 bg-white text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-800 focus:border-transparent transition"
              />
              <input
                type="text"
                value={attendee.role}
                onChange={(e) => updateAttendee(i, "role", e.target.value)}
                placeholder="CEO"
                className="text-sm px-3 py-2 rounded-lg border border-zinc-200 bg-white text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-800 focus:border-transparent transition"
              />
              {attendees.length > 1 ? (
                <button
                  type="button"
                  onClick={() => removeAttendee(i)}
                  className="flex items-center justify-center w-7 h-7 rounded-md text-zinc-300 hover:text-red-400 hover:bg-red-50 transition-colors"
                  aria-label={`Remove attendee ${i + 1}`}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              ) : (
                <span />
              )}
            </div>
          ))}
        </div>

        {attendees.length < 10 && (
          <button
            type="button"
            onClick={addAttendee}
            className="flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-800 transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add attendee
          </button>
        )}
      </div>

      {/* Meeting context */}
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-900">Meeting context</h2>
          <span
            className={`text-xs transition-colors ${
              meetingContext.trim().length >= 10 ? "text-emerald-500" : "text-zinc-300"
            }`}
          >
            {meetingContext.trim().length} chars
          </span>
        </div>
        <textarea
          value={meetingContext}
          onChange={(e) => setMeetingContext(e.target.value)}
          placeholder="What is this meeting about? What are you trying to accomplish? Any background, concerns, or history the AI should know?"
          required
          minLength={10}
          rows={4}
          className="w-full text-sm px-3 py-2.5 rounded-lg border border-zinc-200 bg-white text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-800 focus:border-transparent transition resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full py-3 px-4 bg-zinc-900 hover:bg-zinc-700 disabled:bg-zinc-300 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            Generating…
          </>
        ) : (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
            Generate Meeting Brief
          </>
        )}
      </button>
    </form>
  );
}

// ── App ────────────────────────────────────────────────────────────────────────

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [brief, setBrief] = useState<MeetingBrief | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: {
    attendees: AttendeeForm[];
    meetingContext: string;
    userCompany: string;
    userRole: string;
  }) => {
    const validAttendees = data.attendees.filter((a) => a.name.trim());
    if (validAttendees.length === 0) return;

    setLoading(true);
    setError(null);
    setBrief(null);

    try {
      const res = await fetch("/api/meeting-prep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attendees: validAttendees.map((a) => ({
            name: a.name.trim(),
            company: a.company.trim() || undefined,
            role: a.role.trim() || undefined,
          })),
          meetingContext: data.meetingContext.trim(),
          userCompany: data.userCompany.trim() || undefined,
          userRole: data.userRole.trim() || undefined,
        }),
      });

      const responseData = await res.json();

      if (!res.ok) {
        setError(responseData.error || "Something went wrong. Please try again.");
      } else {
        setBrief(responseData.brief);
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setBrief(null);
    setError(null);
  };

  const showSplit = brief && !loading;

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-900 leading-none">Meeting Prep</p>
              <p className="text-xs text-zinc-500 mt-0.5">AI Strategy Assistant</p>
            </div>
          </div>
          {showSplit && (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
              Brief ready
            </span>
          )}
        </div>
      </header>

      <main
        className={
          showSplit
            ? "max-w-6xl mx-auto px-6 py-8 pb-16 grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-8 items-start"
            : "max-w-3xl mx-auto px-6 py-8 pb-16"
        }
      >
        {/* Left / only column */}
        <div className={showSplit ? "lg:sticky lg:top-20" : ""}>
          {!loading && !brief && (
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">
                Prepare for any meeting in&nbsp;minutes
              </h1>
              <p className="text-sm text-zinc-500 mt-2 max-w-sm mx-auto">
                Drop in your attendees and context. Get a tailored brief with talk tracks, objections, and a follow-up email — ready before you walk in.
              </p>
            </div>
          )}

          {showSplit && (
            <div className="mb-4">
              <h2 className="text-sm font-semibold text-zinc-700">Update inputs</h2>
              <p className="text-xs text-zinc-400 mt-0.5">Regenerate with different context</p>
            </div>
          )}

          {loading ? (
            <LoadingState />
          ) : (
            <InputForm onSubmit={handleSubmit} loading={loading} />
          )}

          {error && !loading && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-2xl p-5">
              <p className="text-sm text-red-700 font-medium">Something went wrong</p>
              <p className="text-xs text-red-500 mt-1">{error}</p>
              <button
                onClick={handleReset}
                className="mt-3 text-xs font-semibold text-red-600 hover:text-red-800 transition-colors"
              >
                Try again →
              </button>
            </div>
          )}
        </div>

        {/* Right column — results */}
        {showSplit && (
          <div className="min-w-0">
            <ResultsPanel brief={brief!} onReset={handleReset} />
          </div>
        )}
      </main>

      <style>{`
        @media print {
          header { display: none !important; }
          body { background: white; }
          main { display: block !important; max-width: 100% !important; }
        }
      `}</style>
    </div>
  );
}
