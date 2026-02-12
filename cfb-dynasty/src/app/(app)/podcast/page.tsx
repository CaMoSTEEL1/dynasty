"use client";
import { useState, useEffect, useCallback } from "react";
import { useDynasty } from "../../components/DynastyProvider";
import { Podcast, PodcastSegment } from "../../lib/types";

const SEGMENT_ICONS: Record<string, string> = {
  intro: "🎤",
  recap: "📋",
  preview: "🔮",
  interview: "🎙️",
  debate: "🔥",
  picks: "🎯",
  outro: "👋",
};

export default function PodcastPage() {
  const { activeDynasty } = useDynasty();
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [expandedPodcast, setExpandedPodcast] = useState<string | null>(null);

  const loadPodcasts = useCallback(async () => {
    if (!activeDynasty) return;
    const res = await fetch(`/api/podcasts?dynasty_id=${activeDynasty.id}`);
    setPodcasts(await res.json());
  }, [activeDynasty]);

  useEffect(() => { loadPodcasts(); }, [loadPodcasts]);

  if (!activeDynasty) {
    return (
      <div className="text-center py-20 animate-fade-in">
        <h1 className="section-title">Podcast Hub</h1>
        <p style={{ color: "var(--gray-400)" }}>Create a dynasty and log game results to generate podcast content.</p>
        <a href="/dynasty" className="btn-primary inline-block mt-4 no-underline">Go to Dynasty Setup</a>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-2">
        <h1 className="section-title mb-0">Podcast Hub</h1>
        <span className="text-sm" style={{ color: "var(--gray-400)" }}>
          {podcasts.length} episode{podcasts.length !== 1 ? "s" : ""}
        </span>
      </div>
      <p className="text-sm mb-8" style={{ color: "var(--gray-400)" }}>
        Auto-generated podcast episodes with talking points, segments, and recaps from your dynasty.
        Log game results to generate new episodes.
      </p>

      {podcasts.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-4xl mb-4">🎙️</p>
          <p className="text-lg font-semibold" style={{ color: "var(--gray-400)" }}>No episodes yet.</p>
          <p className="text-sm mt-2" style={{ color: "var(--gray-500)" }}>
            Podcast episodes are generated when you log completed game results.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {podcasts.map((podcast) => {
            const segments: PodcastSegment[] = JSON.parse(podcast.segments_json || "[]");
            const talkingPoints: string[] = JSON.parse(podcast.talking_points_json || "[]");
            const isExpanded = expandedPodcast === podcast.id;

            return (
              <div key={podcast.id} className="card">
                {/* Header */}
                <div
                  className="flex items-start justify-between cursor-pointer"
                  onClick={() => setExpandedPodcast(isExpanded ? null : podcast.id)}
                >
                  <div className="flex gap-4">
                    {/* Art */}
                    <div
                      className="w-20 h-20 rounded-lg flex items-center justify-center text-3xl flex-shrink-0"
                      style={{ background: "linear-gradient(135deg, var(--gold), var(--navy-mid))" }}
                    >
                      🎙️
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="badge badge-gold">{podcast.show_name}</span>
                        <span className="text-xs" style={{ color: "var(--gray-500)" }}>
                          Season {podcast.season} • Week {podcast.week}
                        </span>
                      </div>
                      <h2 className="font-bold text-lg" style={{ color: "var(--white)" }}>{podcast.title}</h2>
                      <p className="text-sm" style={{ color: "var(--gray-400)" }}>{podcast.description}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-xs" style={{ color: "var(--gray-500)" }}>
                          Host: {podcast.host}
                        </span>
                        <span className="text-xs" style={{ color: "var(--gray-500)" }}>
                          Duration: ~{podcast.duration_display}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className="text-xl" style={{ color: "var(--gray-400)" }}>
                    {isExpanded ? "−" : "+"}
                  </span>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="mt-6 pt-6" style={{ borderTop: "1px solid var(--navy-mid)" }}>
                    {/* Segments */}
                    <h3 className="font-bold mb-4" style={{ color: "var(--gold)" }}>Episode Segments</h3>
                    <div className="space-y-3 mb-6">
                      {segments.map((seg, i) => (
                        <div key={i} className="flex gap-3 p-3 rounded-lg" style={{ background: "var(--navy)" }}>
                          <span className="text-2xl">{SEGMENT_ICONS[seg.type] || "📌"}</span>
                          <div>
                            <p className="font-semibold text-sm" style={{ color: "var(--white)" }}>{seg.title}</p>
                            <p className="text-sm" style={{ color: "var(--gray-400)" }}>{seg.description}</p>
                          </div>
                          <span className="badge badge-navy self-start ml-auto">{seg.type}</span>
                        </div>
                      ))}
                    </div>

                    {/* Talking Points */}
                    <h3 className="font-bold mb-3" style={{ color: "var(--gold)" }}>Key Talking Points</h3>
                    <ul className="space-y-2">
                      {talkingPoints.map((point, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm" style={{ color: "var(--gray-300)" }}>
                          <span className="font-bold" style={{ color: "var(--gold)" }}>•</span>
                          {point}
                        </li>
                      ))}
                    </ul>

                    {/* Simulated Player */}
                    <div className="mt-6 p-4 rounded-lg flex items-center gap-4" style={{ background: "var(--navy)", border: "1px solid var(--navy-mid)" }}>
                      <div className="flex items-center gap-3 flex-1">
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
                          style={{ background: "var(--gold)", color: "var(--navy)" }}
                        >
                          ▶
                        </div>
                        <div>
                          <p className="font-bold text-sm" style={{ color: "var(--white)" }}>{podcast.title}</p>
                          <p className="text-xs" style={{ color: "var(--gray-400)" }}>{podcast.show_name} • ~{podcast.duration_display}</p>
                        </div>
                      </div>
                      {/* Waveform visual */}
                      <div className="flex items-center gap-0.5 h-8">
                        {Array.from({ length: 30 }).map((_, i) => (
                          <div
                            key={i}
                            className="rounded-full"
                            style={{
                              width: "3px",
                              height: `${Math.random() * 24 + 8}px`,
                              background: "var(--gold)",
                              opacity: 0.3 + Math.random() * 0.7,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
