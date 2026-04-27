"use client";

import { useState } from "react";

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

export default function Home() {
  const [attendees, setAttendees] = useState<AttendeeForm[]>([
    { name: "", company: "", role: "" },
  ]);
  const [meetingContext, setMeetingContext] = useState("");
  const [userCompany, setUserCompany] = useState("");
  const [userRole, setUserRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [brief, setBrief] = useState<MeetingBrief | null>(null);
  const [error, setError] = useState<string | null>(null);

  const addAttendee = () => {
    setAttendees([...attendees, { name: "", company: "", role: "" }]);
  };

  const removeAttendee = (index: number) => {
    setAttendees(attendees.filter((_, i) => i !== index));
  };

  const updateAttendee = (index: number, field: keyof AttendeeForm, value: string) => {
    const updated = [...attendees];
    updated[index][field] = value;
    setAttendees(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setBrief(null);

    const payload = {
      attendees: attendees.filter((a) => a.name.trim()),
      meetingContext,
      userCompany,
      userRole,
    };

    try {
      const res = await fetch("/api/meeting-prep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      setBrief(data.brief);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            AI Meeting Prep Assistant
          </h1>
          <p className="text-gray-500 text-lg">
            Get a structured brief on your attendees, talk tracks, and anticipated objections — in under 2 minutes.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">Your Info</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Company</label>
                <input
                  type="text"
                  value={userCompany}
                  onChange={(e) => setUserCompany(e.target.value)}
                  placeholder="Acme Corp"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Role</label>
                <input
                  type="text"
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value)}
                  placeholder="VP of Sales"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">Attendees</h2>
            {attendees.map((attendee, i) => (
              <div key={i} className="flex gap-3 items-start">
                <div className="flex-1 grid grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={attendee.name}
                    onChange={(e) => updateAttendee(i, "name", e.target.value)}
                    placeholder="Full name *"
                    required
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    value={attendee.company}
                    onChange={(e) => updateAttendee(i, "company", e.target.value)}
                    placeholder="Company"
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    value={attendee.role}
                    onChange={(e) => updateAttendee(i, "role", e.target.value)}
                    placeholder="Role / title"
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                {attendees.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeAttendee(i)}
                    className="text-gray-400 hover:text-red-500 mt-2 text-xl leading-none"
                  >
                    &times;
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addAttendee}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              + Add another attendee
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 space-y-3">
            <h2 className="text-lg font-semibold text-gray-800">Meeting Context</h2>
            <textarea
              value={meetingContext}
              onChange={(e) => setMeetingContext(e.target.value)}
              placeholder="What is this meeting about? What are your goals? Any known concerns or topics you need to navigate?"
              required
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-xl text-base transition-colors"
          >
            {loading ? "Generating your brief..." : "Generate Meeting Brief"}
          </button>
        </form>

        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">
            {error}
          </div>
        )}

        {brief && (
          <div className="mt-10 space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-blue-900 mb-2">Executive Summary</h2>
              <p className="text-blue-800 text-sm leading-relaxed">{brief.executiveSummary}</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Attendee Profiles</h2>
              <div className="space-y-4">
                {brief.attendees.map((a, i) => (
                  <div key={i} className="border-l-4 border-blue-400 pl-4">
                    <h3 className="font-semibold text-gray-800">{a.name}</h3>
                    <p className="text-gray-600 text-sm mt-1">{a.background}</p>
                    <p className="text-blue-700 text-sm mt-1 font-medium">{a.recentHighlights}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Recommended Talk Tracks</h2>
              <div className="space-y-4">
                {brief.talkTracks.map((t, i) => (
                  <div key={i} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-800">{t.topic}</h3>
                    <p className="text-gray-500 text-sm mt-1 italic">{t.approach}</p>
                    <ul className="mt-2 space-y-1">
                      {t.keyPoints.map((p, j) => (
                        <li key={j} className="text-sm text-gray-700 flex gap-2">
                          <span className="text-blue-500 mt-0.5">&#8226;</span>
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Anticipated Objections</h2>
              <div className="space-y-4">
                {brief.anticipatedObjections.map((o, i) => (
                  <div key={i} className="grid grid-cols-2 gap-4">
                    <div className="bg-red-50 border border-red-100 rounded-lg p-3">
                      <p className="text-red-700 text-sm font-medium mb-1">Objection</p>
                      <p className="text-red-800 text-sm">{o.objection}</p>
                    </div>
                    <div className="bg-green-50 border border-green-100 rounded-lg p-3">
                      <p className="text-green-700 text-sm font-medium mb-1">Your Response</p>
                      <p className="text-green-800 text-sm">{o.suggestedResponse}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Follow-up Email Template</h2>
              <pre className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap font-sans">
                {brief.followUpEmailTemplate}
              </pre>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
