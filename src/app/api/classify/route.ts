import { createClient } from "@/lib/supabase-server";
import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { raw_input } = await request.json();
    if (!raw_input || typeof raw_input !== "string" || !raw_input.trim()) {
      return NextResponse.json({ error: "Input is required" }, { status: 400 });
    }

    // Fetch user's pillars
    const { data: pillars, error: pillarError } = await supabase
      .from("pillars")
      .select("*")
      .eq("user_id", user.id)
      .order("position", { ascending: true });

    if (pillarError || !pillars || pillars.length === 0) {
      return NextResponse.json(
        { error: "No pillars found. Complete onboarding first." },
        { status: 400 }
      );
    }

    const pillarNames = pillars.map((p) => p.name).join(", ");

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY!,
    });

    const systemPrompt = `You are a classifier for a personal intelligence hub. The user has these pillars: ${pillarNames}. Classify the input and return ONLY a valid JSON object — no markdown, no explanation, no preamble.

Return this exact shape:
{
  "pillar_name": "",
  "subcat": "",
  "title": "",
  "subtitle": "",
  "url": "",
  "ai_notes": ""
}

Classification rules:
- arXiv links or academic paper titles → subcat: paper
- LinkedIn /in/ URLs → subcat: candidate (default pillar: whichever of the user's pillars sounds most like hiring/recruiting/people, else first pillar)
- LinkedIn /company/ URLs → subcat: company
- GitHub /username (no repo) → subcat: person
- GitHub /org/repo → subcat: tool or resource depending on content
- Conference names (NeurIPS, ICML, ICLR, CVPR, re:Invent, KubeCon, ProductCon) → subcat: conference
- Named events, meetups, summits that aren't recurring academic conferences → subcat: event
- Competitive programming platforms (Codeforces, LeetCode, HackerRank, competitive challenges) → subcat: competition
- Company domains or company names → subcat: company
- Personal names with no URL → subcat: person
- SaaS tools, platforms, dev tools, frameworks → subcat: tool
- Blog posts, articles, docs, datasets, papers not on arXiv → subcat: resource
- When uncertain → subcat: other
- Route to the user's pillar that best matches the content semantically. If none clearly match, use the first pillar.
- subcat must be one of: candidate, person, company, conference, event, competition, paper, tool, resource, other
- url should be the URL from the input if present, or a reasonable URL if you can infer one, or empty string if not applicable
- title should be a clean, descriptive title
- subtitle should be a brief description or context
- ai_notes should be one sentence explaining the classification`;

    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20250315",
      max_tokens: 512,
      system: systemPrompt,
      messages: [{ role: "user", content: raw_input.trim() }],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return NextResponse.json(
        { error: "No text response from AI" },
        { status: 500 }
      );
    }

    let parsed;
    try {
      parsed = JSON.parse(textBlock.text);
    } catch {
      return NextResponse.json(
        { error: "Failed to parse AI response" },
        { status: 500 }
      );
    }

    // Match pillar by name
    const matchedPillar = pillars.find(
      (p) => p.name.toLowerCase() === parsed.pillar_name?.toLowerCase()
    ) || pillars[0];

    // Insert item
    const { data: item, error: insertError } = await supabase
      .from("hub_items")
      .insert({
        user_id: user.id,
        pillar_id: matchedPillar.id,
        subcat: parsed.subcat || "other",
        title: parsed.title || raw_input.trim(),
        subtitle: parsed.subtitle || null,
        url: parsed.url || null,
        raw_input: raw_input.trim(),
        ai_notes: parsed.ai_notes || null,
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json(item);
  } catch (err: unknown) {
    console.error("Classify error:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
