import { createClient } from "@/lib/supabase-server";
import { PILLAR_COLORS } from "@/types";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: pillars, error } = await supabase
      .from("pillars")
      .select("*")
      .eq("user_id", user.id)
      .order("position", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(pillars);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check max 4 pillars
    const { data: existing } = await supabase
      .from("pillars")
      .select("id")
      .eq("user_id", user.id);

    if (existing && existing.length >= 4) {
      return NextResponse.json(
        { error: "Maximum 4 pillars allowed" },
        { status: 400 }
      );
    }

    const { name } = await request.json();
    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const position = existing ? existing.length : 0;

    const { data: pillar, error } = await supabase
      .from("pillars")
      .insert({
        user_id: user.id,
        name: name.trim(),
        color: PILLAR_COLORS[position] || PILLAR_COLORS[0],
        position,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(pillar);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, name } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "Pillar ID is required" }, { status: 400 });
    }
    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const { data: pillar, error } = await supabase
      .from("pillars")
      .update({ name: name.trim() })
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(pillar);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Pillar ID is required" }, { status: 400 });
    }

    // Check if pillar has items
    const { data: items } = await supabase
      .from("hub_items")
      .select("id")
      .eq("pillar_id", id)
      .eq("user_id", user.id);

    if (items && items.length > 0) {
      return NextResponse.json(
        { error: `Cannot delete pillar with ${items.length} items. Remove items first.` },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("pillars")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
