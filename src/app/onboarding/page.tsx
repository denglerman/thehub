"use client";

import { createClient } from "@/lib/supabase-browser";
import { PILLAR_COLORS } from "@/types";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();
  const [hubName, setHubName] = useState("");
  const [pillars, setPillars] = useState(["Engineering", "Product", "Research", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const activePillars = pillars.filter((p) => p.trim() !== "");

  const handlePillarChange = (index: number, value: string) => {
    const updated = [...pillars];
    updated[index] = value;
    setPillars(updated);
  };

  const handleSubmit = async () => {
    if (activePillars.length < 1) {
      setError("You need at least 1 pillar.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Create user profile
      const { error: profileError } = await supabase.from("user_profiles").insert({
        user_id: user.id,
        hub_name: hubName.trim() || "The Hub",
        onboarded: true,
      });
      if (profileError) throw profileError;

      // Create pillars
      const pillarRows = activePillars.map((name, i) => ({
        user_id: user.id,
        name: name.trim(),
        color: PILLAR_COLORS[i] || PILLAR_COLORS[0],
        position: i,
      }));

      const { error: pillarError } = await supabase.from("pillars").insert(pillarRows);
      if (pillarError) throw pillarError;

      router.push("/hub");
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-lg"
      >
        <div
          className="rounded-2xl p-8"
          style={{
            backgroundColor: "#0f1420",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <h1 className="text-2xl font-bold mb-1">Set up your Hub</h1>
          <p className="text-text-secondary text-sm mb-8">
            Personalize your intelligence dashboard in seconds.
          </p>

          {/* Hub name */}
          <div className="mb-6">
            <label className="block text-sm text-text-secondary mb-2">Hub name</label>
            <input
              type="text"
              value={hubName}
              onChange={(e) => setHubName(e.target.value)}
              placeholder="The Hub"
              className="w-full px-4 py-2.5 rounded-lg bg-hub-bg border border-[rgba(255,255,255,0.08)] text-text-primary placeholder:text-text-muted placeholder:font-mono text-sm focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan transition-colors"
            />
          </div>

          {/* Pillars */}
          <div className="mb-6">
            <label className="block text-sm text-text-secondary mb-1">Your pillars</label>
            <p className="text-xs text-text-muted mb-3">
              These are your top-level categories — e.g. Engineering, Research, Deal Flow,
              Prospects. You can rename them anytime.
            </p>
            <div className="space-y-3">
              {pillars.map((pillar, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: PILLAR_COLORS[i] || PILLAR_COLORS[0] }}
                  />
                  <input
                    type="text"
                    value={pillar}
                    onChange={(e) => handlePillarChange(i, e.target.value)}
                    placeholder={`Pillar ${i + 1}`}
                    className="flex-1 px-4 py-2.5 rounded-lg bg-hub-bg border border-[rgba(255,255,255,0.08)] text-text-primary placeholder:text-text-muted placeholder:font-mono text-sm focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan transition-colors"
                  />
                </div>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-400 mb-4">{error}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading || activePillars.length < 1}
            className="w-full py-3 rounded-lg text-sm font-medium bg-accent-cyan text-hub-bg hover:bg-[#00e6b8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Building..." : "Build my Hub"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
