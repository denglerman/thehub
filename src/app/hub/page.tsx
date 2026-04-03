"use client";

import { createClient } from "@/lib/supabase-browser";
import { HubItem, Pillar, Subcat, SUBCAT_STYLES } from "@/types";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import useSWR from "swr";
import EditModal from "@/components/EditModal";
import ItemCard from "@/components/ItemCard";
import SettingsModal from "@/components/SettingsModal";

interface UserData {
  hub_name: string;
  email: string;
  avatar_url: string;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function HubPage() {
  const supabase = createClient();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [inputValue, setInputValue] = useState("");
  const [classifying, setClassifying] = useState(false);
  const [classifyError, setClassifyError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<HubItem | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const { data: pillars = [], mutate: mutatePillars } = useSWR<Pillar[]>(
    "/api/pillars",
    fetcher
  );
  const { data: items = [], mutate: mutateItems } = useSWR<HubItem[]>(
    "/api/items",
    fetcher
  );

  useEffect(() => {
    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("user_profiles")
        .select("hub_name")
        .eq("user_id", user.id)
        .single();

      setUserData({
        hub_name: profile?.hub_name || "The Hub",
        email: user.email || "",
        avatar_url: user.user_metadata?.avatar_url || "",
      });
    };
    loadUser();
  }, [supabase]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleClassify = useCallback(async () => {
    if (!inputValue.trim() || classifying) return;
    setClassifying(true);
    setClassifyError("");

    try {
      const res = await fetch("/api/classify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ raw_input: inputValue.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Classification failed");
      }

      setInputValue("");
      mutateItems();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Classification failed";
      setClassifyError(message);
    }
    setClassifying(false);
  }, [inputValue, classifying, mutateItems]);

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await fetch(`/api/items?id=${id}`, { method: "DELETE" });
        mutateItems();
      } catch (err) {
        console.error("Delete failed:", err);
      }
    },
    [mutateItems]
  );

  const handleEditSave = useCallback(
    async (updates: Partial<HubItem>) => {
      try {
        await fetch("/api/items", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        });
        mutateItems();
      } catch (err) {
        console.error("Edit failed:", err);
      }
    },
    [mutateItems]
  );

  const handleUpdate = useCallback(() => {
    mutatePillars();
    mutateItems();
    const reload = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("hub_name")
        .eq("user_id", user.id)
        .single();
      setUserData((prev) =>
        prev ? { ...prev, hub_name: profile?.hub_name || "The Hub" } : prev
      );
    };
    reload();
  }, [mutatePillars, mutateItems, supabase]);

  const filteredItems = items.filter((item: HubItem) => {
    const matchesPillar =
      activeTab === "all" || item.pillar_id === activeTab;
    const matchesSearch =
      !searchQuery ||
      [item.title, item.subtitle, item.url, item.raw_input]
        .filter(Boolean)
        .some((field) =>
          field!.toLowerCase().includes(searchQuery.toLowerCase())
        );
    return matchesPillar && matchesSearch;
  });

  const itemCounts: Record<string, number> = {};
  items.forEach((item: HubItem) => {
    itemCounts[item.pillar_id] = (itemCounts[item.pillar_id] || 0) + 1;
  });

  const groupedBySubcat: Record<string, HubItem[]> = {};
  if (activeTab !== "all") {
    filteredItems.forEach((item) => {
      if (!groupedBySubcat[item.subcat]) groupedBySubcat[item.subcat] = [];
      groupedBySubcat[item.subcat].push(item);
    });
  }

  const pillarMap = Object.fromEntries(pillars.map((p: Pillar) => [p.id, p]));

  return (
    <div className="min-h-screen flex flex-col">
      <nav
        className="sticky top-0 z-30 px-4 sm:px-6 py-3 flex items-center justify-between"
        style={{
          backgroundColor: "rgba(10,14,26,0.85)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="text-sm text-text-muted font-medium min-w-0 truncate">
          {userData?.hub_name || "The Hub"}
        </div>

        <div className="flex items-center gap-1 overflow-x-auto mx-4 flex-shrink scrollbar-none">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              activeTab === "all"
                ? "bg-accent-cyan/15 text-accent-cyan"
                : "text-text-secondary hover:text-text-primary hover:bg-[rgba(255,255,255,0.05)]"
            }`}
          >
            All
            <span className="ml-1.5 text-[10px] opacity-60">{items.length}</span>
          </button>
          {pillars.map((pillar: Pillar) => (
            <button
              key={pillar.id}
              onClick={() => setActiveTab(pillar.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                activeTab === pillar.id
                  ? "bg-[rgba(255,255,255,0.08)] text-text-primary"
                  : "text-text-secondary hover:text-text-primary hover:bg-[rgba(255,255,255,0.05)]"
              }`}
            >
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: pillar.color }}
              />
              {pillar.name}
              <span className="text-[10px] opacity-60">
                {itemCounts[pillar.id] || 0}
              </span>
            </button>
          ))}
        </div>

        <div className="relative flex-shrink-0" ref={menuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1 rounded-lg hover:bg-[rgba(255,255,255,0.05)] transition-colors"
          >
            {userData?.avatar_url ? (
              <img
                src={userData.avatar_url}
                alt=""
                className="w-7 h-7 rounded-full"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-accent-indigo/20 flex items-center justify-center text-xs text-accent-indigo">
                {userData?.email?.[0]?.toUpperCase() || "?"}
              </div>
            )}
          </button>

          {showUserMenu && (
            <div
              className="absolute right-0 top-full mt-2 w-56 rounded-xl p-2 z-50"
              style={{
                backgroundColor: "#0f1420",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <div className="px-3 py-2 mb-1">
                <p className="text-xs text-text-muted font-mono truncate">
                  {userData?.email}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  setSettingsOpen(true);
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-[rgba(255,255,255,0.05)] transition-colors"
              >
                Settings
              </button>
              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  window.location.href = "/";
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm text-text-secondary hover:text-red-400 hover:bg-red-500/5 transition-colors"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </nav>

      <div className="px-4 sm:px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                setClassifyError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleClassify();
              }}
              placeholder="Paste anything &#8212; URL, name, LinkedIn, arXiv, company, conference..."
              className="w-full px-4 py-3 pr-24 rounded-xl bg-hub-surface border border-[rgba(255,255,255,0.08)] text-sm text-text-primary placeholder:text-text-muted placeholder:font-mono focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan transition-colors"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
              {classifying ? (
                <div className="flex items-center gap-2 text-xs text-accent-cyan">
                  <span className="w-2 h-2 rounded-full bg-accent-cyan animate-pulse" />
                  Classifying...
                </div>
              ) : (
                <>
                  <span className="text-[10px] text-text-muted font-mono hidden sm:inline">
                    Ctrl+K
                  </span>
                  <button
                    onClick={handleClassify}
                    disabled={!inputValue.trim()}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-accent-cyan text-hub-bg hover:bg-[#00e6b8] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Add
                  </button>
                </>
              )}
            </div>
          </div>
          {classifyError && (
            <p className="mt-2 text-xs text-red-400">{classifyError}</p>
          )}

          {activeTab === "all" && items.length > 0 && (
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search items..."
              className="w-full mt-3 px-4 py-2 rounded-lg bg-hub-bg border border-[rgba(255,255,255,0.06)] text-sm text-text-primary placeholder:text-text-muted placeholder:font-mono focus:border-accent-cyan/50 focus:ring-1 focus:ring-accent-cyan/50 transition-colors"
            />
          )}
        </div>
      </div>

      <div className="flex-1 px-4 sm:px-6 pb-8">
        <div className="max-w-4xl mx-auto">
          {filteredItems.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <p className="text-text-muted text-sm">
                {items.length === 0
                  ? "No items yet. Paste a URL, name, or anything above to get started."
                  : "No matching items found."}
              </p>
            </motion.div>
          ) : activeTab === "all" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <AnimatePresence>
                {filteredItems.map((item: HubItem, i: number) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    pillar={pillarMap[item.pillar_id]}
                    onDelete={handleDelete}
                    onEdit={setEditingItem}
                    index={i}
                  />
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedBySubcat).map(([subcat, subcatItems]) => {
                const style = SUBCAT_STYLES[subcat as Subcat] || SUBCAT_STYLES.other;
                return (
                  <div key={subcat}>
                    <div className="flex items-center gap-2 mb-3">
                      <span
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium"
                        style={{
                          backgroundColor: style.bg,
                          color: style.text,
                          border: `1px solid ${style.border}`,
                        }}
                      >
                        {subcat}
                      </span>
                      <span className="text-xs text-text-muted">
                        {subcatItems.length}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      <AnimatePresence>
                        {subcatItems.map((item: HubItem, i: number) => (
                          <ItemCard
                            key={item.id}
                            item={item}
                            pillar={pillarMap[item.pillar_id]}
                            onDelete={handleDelete}
                            onEdit={setEditingItem}
                            index={i}
                          />
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {editingItem && (
          <EditModal
            item={editingItem}
            pillars={pillars}
            onSave={handleEditSave}
            onClose={() => setEditingItem(null)}
          />
        )}
      </AnimatePresence>

      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        hubName={userData?.hub_name || "The Hub"}
        pillars={pillars}
        itemCounts={itemCounts}
        onUpdate={handleUpdate}
      />
    </div>
  );
}
