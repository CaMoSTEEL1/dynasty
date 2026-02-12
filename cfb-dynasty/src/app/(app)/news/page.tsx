"use client";
import { useState, useEffect, useCallback } from "react";
import { useDynasty } from "../../components/DynastyProvider";
import { NewsArticle } from "../../lib/types";

const CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
  game_recap: { label: "GAME RECAP", color: "var(--field-green)" },
  upset: { label: "UPSET", color: "var(--red-accent)" },
  rivalry: { label: "RIVALRY", color: "var(--red-accent)" },
  rankings: { label: "RANKINGS", color: "var(--gold)" },
  preview: { label: "PREVIEW", color: "var(--navy-mid)" },
  transfer: { label: "TRANSFER", color: "#6366f1" },
  injury: { label: "INJURY", color: "#ef4444" },
  milestone: { label: "MILESTONE", color: "var(--gold)" },
  playoff: { label: "PLAYOFF", color: "var(--gold)" },
  award: { label: "AWARD", color: "var(--gold)" },
  general: { label: "NEWS", color: "var(--navy-mid)" },
};

export default function NewsPage() {
  const { activeDynasty } = useDynasty();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [expandedArticle, setExpandedArticle] = useState<string | null>(null);

  const loadArticles = useCallback(async () => {
    if (!activeDynasty) return;
    let url = `/api/news?dynasty_id=${activeDynasty.id}`;
    if (selectedWeek) url += `&week=${selectedWeek}`;
    if (selectedCategory) url += `&category=${selectedCategory}`;
    const res = await fetch(url);
    setArticles(await res.json());
  }, [activeDynasty, selectedWeek, selectedCategory]);

  useEffect(() => { loadArticles(); }, [loadArticles]);

  if (!activeDynasty) {
    return (
      <div className="text-center py-20 animate-fade-in">
        <h1 className="section-title">CFB News & Storylines</h1>
        <p style={{ color: "var(--gray-400)" }}>Create a dynasty and log game results to generate news articles.</p>
        <a href="/dynasty" className="btn-primary inline-block mt-4 no-underline">Go to Dynasty Setup</a>
      </div>
    );
  }

  const weeks = Array.from({ length: activeDynasty.current_week + 2 }, (_, i) => i + 1);
  const breakingNews = articles.filter(a => a.is_breaking);
  const regularNews = articles.filter(a => !a.is_breaking);

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h1 className="section-title mb-0">CFB News & Storylines</h1>
        <span className="text-sm" style={{ color: "var(--gray-400)" }}>
          {articles.length} article{articles.length !== 1 ? "s" : ""}
        </span>
      </div>
      <p className="text-sm mb-6" style={{ color: "var(--gray-400)" }}>
        Auto-generated articles from your dynasty data. Log game results to see more stories.
      </p>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div>
          <select
            className="input-field text-sm"
            value={selectedWeek ?? ""}
            onChange={(e) => setSelectedWeek(e.target.value ? parseInt(e.target.value) : null)}
          >
            <option value="">All Weeks</option>
            {weeks.map((w) => <option key={w} value={w}>Week {w}</option>)}
          </select>
        </div>
        <div>
          <select
            className="input-field text-sm"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {Object.entries(CATEGORY_LABELS).map(([key, val]) => (
              <option key={key} value={key}>{val.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Breaking News Ticker */}
      {breakingNews.length > 0 && (
        <div className="mb-6 rounded-lg overflow-hidden" style={{ border: "2px solid var(--red-accent)" }}>
          <div className="px-4 py-2 flex items-center gap-3" style={{ background: "var(--red-accent)" }}>
            <span className="font-black text-sm text-white tracking-wider">BREAKING NEWS</span>
          </div>
          <div className="p-4" style={{ background: "var(--navy-light)" }}>
            {breakingNews.map((article) => (
              <div
                key={article.id}
                className="cursor-pointer py-2"
                style={{ borderBottom: "1px solid var(--navy-mid)" }}
                onClick={() => setExpandedArticle(expandedArticle === article.id ? null : article.id)}
              >
                <h3 className="font-bold" style={{ color: "var(--white)" }}>{article.title}</h3>
                <p className="text-sm" style={{ color: "var(--gray-400)" }}>{article.subtitle}</p>
                {expandedArticle === article.id && (
                  <div className="mt-3 text-sm leading-relaxed whitespace-pre-line" style={{ color: "var(--gray-300)" }}>
                    {article.body}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Articles Grid */}
      {articles.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-4xl mb-4">📰</p>
          <p className="text-lg font-semibold" style={{ color: "var(--gray-400)" }}>No stories yet.</p>
          <p className="text-sm mt-2" style={{ color: "var(--gray-500)" }}>
            Log completed game results in the Scoreboard to auto-generate news articles, recaps, and storylines.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Featured Article */}
          {regularNews[0] && (
            <div
              className="card md:col-span-2 cursor-pointer"
              onClick={() => setExpandedArticle(expandedArticle === regularNews[0].id ? null : regularNews[0].id)}
            >
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="badge"
                  style={{
                    background: CATEGORY_LABELS[regularNews[0].category]?.color || "var(--navy-mid)",
                    color: "white",
                  }}
                >
                  {CATEGORY_LABELS[regularNews[0].category]?.label || regularNews[0].category.toUpperCase()}
                </span>
                <span className="text-xs" style={{ color: "var(--gray-500)" }}>
                  Week {regularNews[0].week} • Season {regularNews[0].season}
                </span>
              </div>
              <h2 className="text-xl font-black mb-2" style={{ color: "var(--white)" }}>
                {regularNews[0].title}
              </h2>
              <p className="text-sm mb-3" style={{ color: "var(--gray-400)" }}>{regularNews[0].subtitle}</p>
              {regularNews[0].team_name && (
                <span className="text-xs" style={{ color: "var(--gold)" }}>Related: {regularNews[0].team_name}</span>
              )}
              {expandedArticle === regularNews[0].id && (
                <div className="mt-4 pt-4 text-sm leading-relaxed whitespace-pre-line" style={{ borderTop: "1px solid var(--navy-mid)", color: "var(--gray-300)" }}>
                  {regularNews[0].body}
                </div>
              )}
            </div>
          )}

          {/* Remaining Articles */}
          {regularNews.slice(1).map((article) => (
            <div
              key={article.id}
              className="card cursor-pointer"
              onClick={() => setExpandedArticle(expandedArticle === article.id ? null : article.id)}
            >
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="badge"
                  style={{
                    background: CATEGORY_LABELS[article.category]?.color || "var(--navy-mid)",
                    color: "white",
                  }}
                >
                  {CATEGORY_LABELS[article.category]?.label || article.category.toUpperCase()}
                </span>
                <span className="text-xs" style={{ color: "var(--gray-500)" }}>
                  Week {article.week}
                </span>
              </div>
              <h3 className="font-bold mb-1" style={{ color: "var(--white)" }}>{article.title}</h3>
              <p className="text-sm" style={{ color: "var(--gray-400)" }}>{article.subtitle}</p>
              {article.team_name && (
                <span className="text-xs block mt-2" style={{ color: "var(--gold)" }}>Related: {article.team_name}</span>
              )}
              {expandedArticle === article.id && (
                <div className="mt-3 pt-3 text-sm leading-relaxed whitespace-pre-line" style={{ borderTop: "1px solid var(--navy-mid)", color: "var(--gray-300)" }}>
                  {article.body}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
