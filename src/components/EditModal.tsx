"use client";

import { HubItem, Pillar, Subcat } from "@/types";
import { motion } from "framer-motion";
import { useState } from "react";

const SUBCATS: Subcat[] = [
  "candidate", "person", "company", "conference", "event",
  "competition", "paper", "tool", "resource", "other",
];

interface EditModalProps {
  item: HubItem;
  pillars: Pillar[];
  onSave: (updates: Partial<HubItem>) => void;
  onClose: () => void;
}

export default function EditModal({ item, pillars, onSave, onClose }: EditModalProps) {
  const [title, setTitle] = useState(item.title);
  const [subtitle, setSubtitle] = useState(item.subtitle || "");
  const [url, setUrl] = useState(item.url || "");
  const [subcat, setSubcat] = useState<Subcat>(item.subcat);
  const [pillarId, setPillarId] = useState(item.pillar_id);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave({
      id: item.id,
      title: title.trim(),
      subtitle: subtitle.trim() || null,
      url: url.trim() || null,
      subcat,
      pillar_id: pillarId,
    });
    setSaving(false);
    onClose();
  };

  const inputClass =
    "w-full px-3 py-2 rounded-lg bg-hub-bg border border-[rgba(255,255,255,0.08)] text-sm text-text-primary focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan transition-colors";

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 z-40"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div
          className="w-full max-w-md rounded-2xl p-6"
          style={{
            backgroundColor: "#0f1420",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <h3 className="text-lg font-bold mb-4">Edit item</h3>

          <div className="space-y-3">
            <div>
              <label className="block text-xs text-text-secondary mb-1">Title</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs text-text-secondary mb-1">Subtitle</label>
              <input type="text" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs text-text-secondary mb-1">URL</label>
              <input type="text" value={url} onChange={(e) => setUrl(e.target.value)} className={inputClass + " font-mono"} />
            </div>
            <div>
              <label className="block text-xs text-text-secondary mb-1">Category</label>
              <select
                value={subcat}
                onChange={(e) => setSubcat(e.target.value as Subcat)}
                className={inputClass}
              >
                {SUBCATS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-text-secondary mb-1">Pillar</label>
              <select
                value={pillarId}
                onChange={(e) => setPillarId(e.target.value)}
                className={inputClass}
              >
                {pillars.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-2 mt-6">
            <button
              onClick={onClose}
              className="flex-1 py-2 rounded-lg text-sm border border-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.05)] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !title.trim()}
              className="flex-1 py-2 rounded-lg text-sm bg-accent-cyan text-hub-bg hover:bg-[#00e6b8] transition-colors disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}
