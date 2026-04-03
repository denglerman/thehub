"use client";

import { createClient } from "@/lib/supabase-browser";
import { Pillar } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  hubName: string;
  pillars: Pillar[];
  itemCounts: Record<string, number>;
  onUpdate: () => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  hubName,
  pillars,
  itemCounts,
  onUpdate,
}: SettingsModalProps) {
  const router = useRouter();
  const supabase = createClient();
  const [editedHubName, setEditedHubName] = useState(hubName);
  const [editedPillars, setEditedPillars] = useState<Record<string, string>>(
    Object.fromEntries(pillars.map((p) => [p.id, p.name]))
  );
  const [newPillarName, setNewPillarName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleSaveHubName = async () => {
    setSaving(true);
    setError("");
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      await supabase
        .from("user_profiles")
        .update({ hub_name: editedHubName.trim() || "The Hub" })
        .eq("user_id", user.id);
      onUpdate();
    } catch {
      setError("Failed to update hub name");
    }
    setSaving(false);
  };

  const handleRenamePillar = async (id: string) => {
    const name = editedPillars[id];
    if (!name?.trim()) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/pillars", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, name: name.trim() }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to rename pillar");
      }
      onUpdate();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to rename pillar";
      setError(message);
    }
    setSaving(false);
  };

  const handleAddPillar = async () => {
    if (!newPillarName.trim()) return;
    if (pillars.length >= 4) {
      setError("Maximum 4 pillars allowed");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/pillars", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newPillarName.trim() }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to add pillar");
      }
      setNewPillarName("");
      onUpdate();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to add pillar";
      setError(message);
    }
    setSaving(false);
  };

  const handleDeletePillar = async (id: string) => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/pillars?id=${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete pillar");
      }
      setDeletingId(null);
      onUpdate();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to delete pillar";
      setError(message);
    }
    setSaving(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md z-50 overflow-y-auto"
            style={{
              backgroundColor: "#0f1420",
              borderLeft: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-lg font-bold">Settings</h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-[rgba(255,255,255,0.05)] text-text-muted hover:text-text-primary transition-colors"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div className="mb-8">
                <label className="block text-sm text-text-secondary mb-2">Hub name</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editedHubName}
                    onChange={(e) => setEditedHubName(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg bg-hub-bg border border-[rgba(255,255,255,0.08)] text-sm text-text-primary focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan transition-colors"
                  />
                  <button
                    onClick={handleSaveHubName}
                    disabled={saving}
                    className="px-3 py-2 rounded-lg text-sm border border-accent-cyan text-accent-cyan hover:bg-accent-cyan/10 transition-colors disabled:opacity-50"
                  >
                    Save
                  </button>
                </div>
              </div>

              <div className="mb-8">
                <label className="block text-sm text-text-secondary mb-3">Pillars</label>
                <div className="space-y-3">
                  {pillars.map((pillar) => (
                    <div key={pillar.id} className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: pillar.color }} />
                      <input
                        type="text"
                        value={editedPillars[pillar.id] || ""}
                        onChange={(e) => setEditedPillars((prev) => ({ ...prev, [pillar.id]: e.target.value }))}
                        onBlur={() => handleRenamePillar(pillar.id)}
                        onKeyDown={(e) => { if (e.key === "Enter") handleRenamePillar(pillar.id); }}
                        className="flex-1 px-3 py-2 rounded-lg bg-hub-bg border border-[rgba(255,255,255,0.08)] text-sm text-text-primary focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan transition-colors"
                      />
                      <span className="text-xs text-text-muted font-mono min-w-[24px] text-right">{itemCounts[pillar.id] || 0}</span>
                      {deletingId === pillar.id ? (
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleDeletePillar(pillar.id)}
                            disabled={saving || (itemCounts[pillar.id] || 0) > 0}
                            className="px-2 py-1 rounded text-xs bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 disabled:opacity-50 transition-colors"
                          >Confirm</button>
                          <button
                            onClick={() => setDeletingId(null)}
                            className="px-2 py-1 rounded text-xs border border-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.05)] transition-colors"
                          >Cancel</button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeletingId(pillar.id)}
                          className="p-1.5 rounded hover:bg-[rgba(255,255,255,0.05)] text-text-muted hover:text-red-400 transition-colors"
                          title="Delete pillar"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {pillars.length < 4 && (
                  <div className="flex gap-2 mt-3">
                    <input
                      type="text"
                      value={newPillarName}
                      onChange={(e) => setNewPillarName(e.target.value)}
                      placeholder="New pillar name"
                      onKeyDown={(e) => { if (e.key === "Enter") handleAddPillar(); }}
                      className="flex-1 px-3 py-2 rounded-lg bg-hub-bg border border-[rgba(255,255,255,0.08)] text-sm text-text-primary placeholder:text-text-muted placeholder:font-mono focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan transition-colors"
                    />
                    <button
                      onClick={handleAddPillar}
                      disabled={saving || !newPillarName.trim()}
                      className="px-3 py-2 rounded-lg text-sm border border-accent-cyan text-accent-cyan hover:bg-accent-cyan/10 transition-colors disabled:opacity-50"
                    >Add</button>
                  </div>
                )}
              </div>

              <div className="pt-6 border-t border-[rgba(255,255,255,0.08)]">
                <button
                  onClick={handleSignOut}
                  className="w-full py-2.5 rounded-lg text-sm text-text-secondary border border-[rgba(255,255,255,0.08)] hover:border-red-500/30 hover:text-red-400 hover:bg-red-500/5 transition-colors"
                >
                  Sign out
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
