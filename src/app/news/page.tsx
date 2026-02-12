"use client";

import PageWrapper from "@/components/PageWrapper";
import { useDynastyStore } from "@/lib/store";
import type { NewsCategory } from "@/lib/types";
import {
  Newspaper,
  Zap,
  Sparkles,
  Filter,
  ChevronDown,
  ChevronUp,
  Trophy,
  Flame,
  Star,
  TrendingUp,
  AlertTriangle,
  Target,
  BarChart3,
} from "lucide-react";
import { useState } from "react";

const categoryConfig: Record<
  NewsCategory,
  { label: string; color: string; icon: typeof Zap }
> = {
  upset: { label: "Upset Alert", color: "text-danger", icon: Zap },
  blowout: { label: "Blowout", color: "text-warning", icon: AlertTriangle },
  rivalry: { label: "Rivalry", color: "text-purple-400", icon: Flame },
  heisman: { label: "Heisman Watch", color: "text-gold", icon: Star },
  breakout: { label: "Breakout", color: "text-success", icon: Sparkles },
  playoff: { label: "Playoff", color: "text-primary", icon: Trophy },
  coaching: { label: "Coaching", color: "text-pink-400", icon: Target },
  preview: { label: "Preview", color: "text-cyan-400", icon: TrendingUp },
  recap: { label: "Game Recap", color: "text-purple-400", icon: Newspaper },
  ranking: { label: "Rankings", color: "text-secondary", icon: BarChart3 },
  injury: { label: "Injury", color: "text-danger", icon: AlertTriangle },
  transfer: { label: "Transfer", color: "text-cyan-400", icon: TrendingUp },
  general: { label: "General", color: "text-muted-foreground", icon: Newspaper },
};

export default function NewsPage() {
  const store = useDynastyStore();
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedArticle, setExpandedArticle] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const weeks = Array.from(
    { length: Math.max(store.currentWeek, 15) },
    (_, i) => i + 1
  );

  const filteredArticles = store.articles
    .filter((a) => (selectedWeek ? a.week === selectedWeek : true))
    .filter((a) => (selectedCategory ? a.category === selectedCategory : true))
    .sort((a, b) => b.week - a.week || b.createdAt.localeCompare(a.createdAt));

  const handleGenerate = (week: number) => {
    setGenerating(true);
    // Small delay for UX
    setTimeout(() => {
      store.generateArticles(week);
      setGenerating(false);
      setSelectedWeek(week);
    }, 800);
  };

  const categories = Array.from(
    new Set(store.articles.map((a) => a.category))
  );

  return (
    <PageWrapper
      title="CFB News & Storylines"
      subtitle="Auto-generated news articles from around the college football world"
      actions={
        <div className="flex items-center gap-2">
          <select
            className="px-3 py-2 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            onChange={(e) => {
              const week = parseInt(e.target.value);
              if (week > 0) handleGenerate(week);
            }}
            value=""
          >
            <option value="">Generate for week...</option>
            {weeks.map((w) => (
              <option key={w} value={w}>
                Week {w}
              </option>
            ))}
          </select>
        </div>
      }
    >
      {/* Generating Indicator */}
      {generating && (
        <div className="mb-6 p-4 rounded-xl bg-primary/10 border border-primary/30 flex items-center gap-3 animate-pulse-glow">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-primary font-medium">
            Generating storylines from your dynasty data...
          </p>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <button
          onClick={() => setSelectedWeek(null)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            selectedWeek === null
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          All Weeks
        </button>
        {weeks
          .filter((w) => store.articles.some((a) => a.week === w))
          .map((w) => (
            <button
              key={w}
              onClick={() => setSelectedWeek(w === selectedWeek ? null : w)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedWeek === w
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              Wk {w}
            </button>
          ))}

        {categories.length > 0 && (
          <>
            <div className="w-px h-6 bg-border mx-1" />
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedCategory === null
                  ? "bg-accent text-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              All Types
            </button>
            {categories.map((cat) => {
              const config = categoryConfig[cat];
              return (
                <button
                  key={cat}
                  onClick={() =>
                    setSelectedCategory(
                      cat === selectedCategory ? null : cat
                    )
                  }
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    selectedCategory === cat
                      ? "bg-accent text-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {config.label}
                </button>
              );
            })}
          </>
        )}
      </div>

      {/* Articles */}
      {filteredArticles.length === 0 ? (
        <div className="text-center py-16">
          <Newspaper className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No News Articles Yet</h3>
          <p className="text-muted-foreground max-w-md mx-auto mb-4">
            {store.games.length === 0
              ? "Add teams and game results first, then generate news articles to bring your dynasty to life."
              : "Select a week and click 'Generate' to create news articles based on your game results."}
          </p>
          {store.games.length > 0 && (
            <button
              onClick={() => handleGenerate(store.currentWeek)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <Sparkles className="w-4 h-4" />
              Generate Week {store.currentWeek} Articles
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredArticles.map((article) => {
            const config = categoryConfig[article.category];
            const Icon = config.icon;
            const isExpanded = expandedArticle === article.id;

            return (
              <article
                key={article.id}
                className={`rounded-xl bg-card border-l-4 border border-border overflow-hidden cat-${article.category} card-hover cursor-pointer`}
                onClick={() =>
                  setExpandedArticle(isExpanded ? null : article.id)
                }
              >
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className={`w-4 h-4 ${config.color}`} />
                    <span
                      className={`text-xs font-semibold uppercase tracking-wider ${config.color}`}
                    >
                      {config.label}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      &middot; Week {article.week}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold mb-1">{article.title}</h2>
                  <p className="text-sm text-muted-foreground">
                    {article.subtitle}
                  </p>

                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-border animate-fade-in">
                      <div className="prose prose-sm prose-invert max-w-none">
                        {article.body.split("\n\n").map((paragraph, i) => (
                          <p
                            key={i}
                            className="text-sm text-foreground/90 mb-3 leading-relaxed"
                          >
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      {isExpanded ? (
                        <ChevronUp className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      )}
                      {isExpanded ? "Collapse" : "Read full article"}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </PageWrapper>
  );
}
