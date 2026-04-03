"use client";

import { HubItem, Pillar, SUBCAT_STYLES } from "@/types";
import { motion } from "framer-motion";
import { useState } from "react";

interface ItemCardProps {
  item: HubItem;
  pillar: Pillar | undefined;
  onDelete: (id: string) => void;
  onEdit: (item: HubItem) => void;
  index: number;
}

function getDomain(url: string | null): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

export default function ItemCard({
  item,
  pillar,
  onDelete,
  onEdit,
  index,
}: ItemCardProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const styles = SUBCAT_STYLES[item.subcat] || SUBCAT_STYLES.other;
  const domain = getDomain(item.url);
  const date = new Date(item.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.03 }}
      className="group relative rounded-xl p-4"
      style={{
        backgroundColor: "#0f1420",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {/* Pillar color dot */}
      {pillar && (
        <div
          className="absolute top-3 right-3 w-2 h-2 rounded-full"
          style={{ backgroundColor: pillar.color }}
        />
      )}

      {/* Hover actions */}
      <div className="absolute top-3 right-7 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(item)}
          className="p-1 rounded hover:bg-[rgba(255,255,255,0.05)] text-text-muted hover:text-text-secondary transition-colors"
          title="Edit"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>
        <button
          onClick={() => setShowConfirm(true)}
          className="p-1 rounded hover:bg-[rgba(255,255,255,0.05)] text-text-muted hover:text-red-400 transition-colors"
          title="Delete"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Delete confirmation */}
      {showConfirm && (
        <div className="absolute inset-0 bg-hub-surface/95 rounded-xl flex items-center justify-center z-10 backdrop-blur-sm">
          <div className="text-center">
            <p className="text-sm text-text-secondary mb-3">Delete this item?</p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-3 py-1.5 rounded-lg text-xs border border-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.05)] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => onDelete(item.id)}
                className="px-3 py-1.5 rounded-lg text-xs bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-start gap-3">
        {/* Favicon */}
        <div className="flex-shrink-0 mt-0.5">
          {domain ? (
            <img
              src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
              alt=""
              width={20}
              height={20}
              className="rounded"
            />
          ) : (
            <div className="w-5 h-5 rounded bg-[rgba(255,255,255,0.05)] flex items-center justify-center">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-text-muted"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          {/* Title */}
          <h3 className="text-sm font-medium text-text-primary truncate">
            {item.title}
          </h3>

          {/* Subtitle */}
          {item.subtitle && (
            <p className="text-xs text-text-secondary mt-0.5 truncate">
              {item.subtitle}
            </p>
          )}

          {/* URL */}
          {item.url && (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono text-text-muted hover:text-accent-cyan mt-1 block truncate transition-colors"
            >
              {domain || item.url}
            </a>
          )}

          {/* Bottom row: subcat pill + date */}
          <div className="flex items-center justify-between mt-2.5">
            <span
              className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium"
              style={{
                backgroundColor: styles.bg,
                color: styles.text,
                border: `1px solid ${styles.border}`,
              }}
            >
              {item.subcat}
            </span>
            <span className="text-[10px] font-mono text-text-muted">{date}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
