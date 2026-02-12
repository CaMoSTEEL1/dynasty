"use client";

import PageWrapper from "@/components/PageWrapper";
import { useDynastyStore } from "@/lib/store";
import {
  Mic,
  Play,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Clock,
  Flame,
  BarChart3,
  MessageSquare,
  Target,
  Radio,
} from "lucide-react";
import { useState } from "react";

const segmentIcons: Record<string, typeof Flame> = {
  "hot-take": Flame,
  analysis: MessageSquare,
  rankings: BarChart3,
  picks: Target,
  recap: Radio,
  interview: Mic,
};

const segmentColors: Record<string, string> = {
  "hot-take": "text-secondary bg-secondary/10",
  analysis: "text-cyan-400 bg-cyan-500/10",
  rankings: "text-amber-400 bg-amber-500/10",
  picks: "text-green-400 bg-green-500/10",
  recap: "text-purple-400 bg-purple-500/10",
  interview: "text-pink-400 bg-pink-500/10",
};

export default function PodcastPage() {
  const store = useDynastyStore();
  const [expandedPodcast, setExpandedPodcast] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const weeks = Array.from(
    { length: Math.max(store.currentWeek, 15) },
    (_, i) => i + 1
  );

  const sortedPodcasts = [...store.podcasts].sort(
    (a, b) => b.week - a.week
  );

  const handleGenerate = (week: number) => {
    setGenerating(true);
    setTimeout(() => {
      store.generatePodcast(week);
      setGenerating(false);
    }, 1000);
  };

  return (
    <PageWrapper
      title="CFB Dynasty Podcast"
      subtitle="Weekly podcast episodes with recaps, hot takes, rankings, and more"
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
            <option value="">Generate episode...</option>
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
            Recording this week&apos;s podcast episode...
          </p>
        </div>
      )}

      {/* Podcast Episodes */}
      {sortedPodcasts.length === 0 ? (
        <div className="text-center py-16">
          <Mic className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Episodes Yet</h3>
          <p className="text-muted-foreground max-w-md mx-auto mb-4">
            Generate podcast episodes after you&apos;ve logged game results.
            Each episode includes recaps, hot takes, rankings, and pick&apos;em
            results.
          </p>
          {store.games.length > 0 && (
            <button
              onClick={() => handleGenerate(store.currentWeek)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <Sparkles className="w-4 h-4" />
              Generate Week {store.currentWeek} Episode
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {sortedPodcasts.map((podcast) => {
            const isExpanded = expandedPodcast === podcast.id;
            return (
              <div
                key={podcast.id}
                className="rounded-xl bg-card border border-border overflow-hidden"
              >
                {/* Episode Header */}
                <div
                  className="p-5 cursor-pointer card-hover"
                  onClick={() =>
                    setExpandedPodcast(isExpanded ? null : podcast.id)
                  }
                >
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                      <Mic className="w-8 h-8 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-medium">
                          Week {podcast.week}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {podcast.duration}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {podcast.segments.length} segments
                        </span>
                      </div>
                      <h3 className="text-lg font-bold">{podcast.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {podcast.description}
                      </p>
                    </div>
                    <div className="shrink-0 flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity">
                        <Play className="w-5 h-5 text-primary-foreground ml-0.5" />
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Episode Content */}
                {isExpanded && (
                  <div className="border-t border-border animate-fade-in">
                    {/* Fake Audio Waveform */}
                    <div className="px-5 py-3 bg-muted/50">
                      <div className="flex items-center gap-3">
                        <button className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0 hover:opacity-90 transition-opacity">
                          <Play className="w-4 h-4 text-primary-foreground ml-0.5" />
                        </button>
                        <div className="flex-1 flex items-end gap-0.5 h-8">
                          {Array.from({ length: 60 }, (_, i) => (
                            <div
                              key={i}
                              className="flex-1 bg-primary/30 rounded-full"
                              style={{
                                height: `${
                                  20 + Math.sin(i * 0.5) * 40 + Math.random() * 40
                                }%`,
                              }}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground shrink-0">
                          {podcast.duration}
                        </span>
                      </div>
                    </div>

                    {/* Segments */}
                    <div className="p-5 space-y-4">
                      {podcast.segments.map((segment, i) => {
                        const Icon =
                          segmentIcons[segment.type] || MessageSquare;
                        const colorClass =
                          segmentColors[segment.type] ||
                          "text-muted-foreground bg-muted";

                        return (
                          <div key={i} className="flex gap-4">
                            <div
                              className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${colorClass}`}
                            >
                              <Icon className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold text-sm">
                                  {segment.title}
                                </h4>
                                <span className="text-xs text-muted-foreground capitalize">
                                  {segment.type.replace("-", " ")}
                                </span>
                              </div>
                              <div className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">
                                {segment.content}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </PageWrapper>
  );
}
