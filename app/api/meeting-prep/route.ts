export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import Exa from "exa-js";

// Lazily initialized so build-time evaluation doesn't require env vars
function getAnthropic() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
}

function getExa() {
  return new Exa(process.env.EXA_API_KEY!);
}

export interface MeetingPrepRequest {
  attendees: Array<{
    name: string;
    company?: string;
    role?: string;
  }>;
  meetingContext: string;
  userCompany?: string;
  userRole?: string;
}

export interface AttendeeResearch {
  name: string;
  company?: string;
  background: string;
  recentNews: string[];
}

export interface MeetingBrief {
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

async function researchAttendee(
  name: string,
  company?: string
): Promise<AttendeeResearch> {
  const queries = [
    `${name}${company ? ` ${company}` : ""} professional background LinkedIn`,
    `${name}${company ? ` ${company}` : ""} recent news 2024 2025`,
  ];

  const recentNews: string[] = [];
  let background = "";

  try {
    const exa = getExa();
    const [profileResult, newsResult] = await Promise.all([
      exa.searchAndContents(queries[0], {
        numResults: 2,
        type: "neural",
        highlights: true,
        summary: true,
      }),
      exa.searchAndContents(queries[1], {
        numResults: 3,
        type: "neural",
        highlights: true,
        summary: true,
        startPublishedDate: "2024-01-01",
      }),
    ]);

    // Extract background from profile results
    if (profileResult.results.length > 0) {
      const profileSummaries = profileResult.results
        .filter((r) => r.summary)
        .map((r) => r.summary)
        .join(" ");
      background = profileSummaries || "No detailed profile found.";
    }

    // Extract recent news
    for (const result of newsResult.results) {
      if (result.summary) {
        recentNews.push(`[${result.title}] ${result.summary}`);
      } else if (result.highlights && result.highlights.length > 0) {
        recentNews.push(`[${result.title}] ${result.highlights[0]}`);
      }
    }
  } catch (err) {
    console.error(`Exa research failed for ${name}:`, err);
    background = "Research unavailable.";
  }

  return { name, company, background, recentNews };
}

async function generateMeetingBrief(
  request: MeetingPrepRequest,
  attendeeResearch: AttendeeResearch[]
): Promise<MeetingBrief> {
  const researchContext = attendeeResearch
    .map((a) => {
      return `
ATTENDEE: ${a.name}${a.company ? ` (${a.company})` : ""}
Background: ${a.background}
Recent News:
${a.recentNews.length > 0 ? a.recentNews.map((n) => `- ${n}`).join("\n") : "- No recent news found"}
`.trim();
    })
    .join("\n\n---\n\n");

  const prompt = `You are an expert meeting strategist and executive coach. Based on the research below, create a comprehensive meeting preparation brief.

MEETING CONTEXT:
${request.meetingContext}

USER INFO:
Company: ${request.userCompany || "Not specified"}
Role: ${request.userRole || "Not specified"}

RESEARCH ON ATTENDEES:
${researchContext}

Generate a structured meeting brief in the following JSON format:
{
  "attendees": [
    {
      "name": "string",
      "background": "2-3 sentence professional summary",
      "recentHighlights": "1-2 sentences on what's notable about them right now"
    }
  ],
  "talkTracks": [
    {
      "topic": "string",
      "approach": "suggested approach/angle",
      "keyPoints": ["point 1", "point 2", "point 3"]
    }
  ],
  "anticipatedObjections": [
    {
      "objection": "likely pushback or concern",
      "suggestedResponse": "how to address it effectively"
    }
  ],
  "followUpEmailTemplate": "Complete ready-to-send follow-up email template with [PLACEHOLDERS] for variable content",
  "executiveSummary": "2-3 sentence overall meeting strategy summary"
}

Be specific, actionable, and tailored to the actual people and context. Return ONLY valid JSON.`;

  const anthropic = getAnthropic();
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== "text") {
    throw new Error("Unexpected response type from Claude");
  }

  // Extract JSON from the response (handle potential markdown code blocks)
  let jsonText = content.text.trim();
  const jsonMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonText = jsonMatch[1].trim();
  }

  return JSON.parse(jsonText) as MeetingBrief;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as MeetingPrepRequest;

    // Validate required fields
    if (!body.attendees || body.attendees.length === 0) {
      return NextResponse.json(
        { error: "At least one attendee is required" },
        { status: 400 }
      );
    }

    if (!body.meetingContext || body.meetingContext.trim().length < 10) {
      return NextResponse.json(
        { error: "Meeting context must be at least 10 characters" },
        { status: 400 }
      );
    }

    if (body.attendees.length > 10) {
      return NextResponse.json(
        { error: "Maximum 10 attendees supported per request" },
        { status: 400 }
      );
    }

    // Research all attendees in parallel
    const attendeeResearch = await Promise.all(
      body.attendees.map((a) => researchAttendee(a.name, a.company))
    );

    // Generate the meeting brief using Claude
    const brief = await generateMeetingBrief(body, attendeeResearch);

    return NextResponse.json({
      success: true,
      brief,
      metadata: {
        attendeesResearched: attendeeResearch.length,
        generatedAt: new Date().toISOString(),
        model: "claude-sonnet-4-6",
      },
    });
  } catch (error) {
    console.error("Meeting prep API error:", error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Failed to parse meeting brief response" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}

// Health check
export async function GET() {
  return NextResponse.json({
    status: "ok",
    endpoint: "/api/meeting-prep",
    version: "1.0.0",
    description: "AI Meeting Prep & Strategy Assistant API",
  });
}
