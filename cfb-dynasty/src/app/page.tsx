import Link from "next/link";

const FEATURES = [
  {
    icon: "🏟️",
    title: "Dynasty Management",
    description: "Set up your dynasty, add teams, conferences, and track your coach's journey through the seasons.",
  },
  {
    icon: "🏈",
    title: "Roster Builder",
    description: "Input rosters for every team — key players, positions, ratings, and class years. Your data drives the storylines.",
  },
  {
    icon: "📋",
    title: "Weekly Scoreboard",
    description: "Log scores and stats each week. Track records, conference standings, and season-long performance.",
  },
  {
    icon: "📰",
    title: "News & Storylines",
    description: "Auto-generated articles from YOUR data — upsets, blowouts, rivalry games, rankings shakeups, and more.",
  },
  {
    icon: "🎯",
    title: "GameDay Pick'em",
    description: "Make your picks each week with spreads, confidence levels, and track your record against the analysts.",
  },
  {
    icon: "🎙️",
    title: "Podcast Hub",
    description: "Generated podcast segments with talking points, recaps, previews, and hot takes from your dynasty.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--navy)" }}>
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 49px, var(--field-green) 49px, var(--field-green) 50px),
              repeating-linear-gradient(90deg, transparent, transparent 49px, var(--field-green) 49px, var(--field-green) 50px)`,
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 py-24 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <span
              className="text-5xl font-black tracking-tight"
              style={{ color: "var(--gold)" }}
            >
              CFB DYNASTY
            </span>
            <span
              className="text-2xl font-black px-3 py-1 rounded-lg"
              style={{ background: "var(--gold)", color: "var(--navy)" }}
            >
              26
            </span>
          </div>
          <h1
            className="text-4xl md:text-5xl font-black mb-4 tracking-tight"
            style={{ color: "var(--white)" }}
          >
            STORYLINE PLATFORM
          </h1>
          <p
            className="text-lg md:text-xl max-w-2xl mx-auto mb-10"
            style={{ color: "var(--gray-300)" }}
          >
            The ultimate quality-of-life dynasty overhaul. Generate news articles, build
            storylines, make picks, and bring your CFB 26 dynasty to life like never before.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/dynasty" className="btn-primary text-lg px-8 py-3 no-underline">
              Start Your Dynasty
            </Link>
            <Link href="/dashboard" className="btn-secondary text-lg px-8 py-3 no-underline">
              Go to Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Ticker */}
      <div
        className="py-2 px-4 text-center text-sm font-bold tracking-wider"
        style={{ background: "var(--gold)", color: "var(--navy)" }}
      >
        BREAKING: YOUR DYNASTY. YOUR STORIES. YOUR SEASON. — CFB DYNASTY STORYLINE PLATFORM NOW LIVE
      </div>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <h2
          className="text-3xl font-black text-center mb-4"
          style={{ color: "var(--gold)" }}
        >
          EVERYTHING YOUR DYNASTY NEEDS
        </h2>
        <p className="text-center mb-12" style={{ color: "var(--gray-400)" }}>
          Input your data. We build the world around it.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="card animate-fade-in">
              <div className="text-3xl mb-3">{feature.icon}</div>
              <h3
                className="text-lg font-bold mb-2"
                style={{ color: "var(--white)" }}
              >
                {feature.title}
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "var(--gray-400)" }}
              >
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section
        className="py-20"
        style={{ background: "var(--navy-light)" }}
      >
        <div className="max-w-5xl mx-auto px-4">
          <h2
            className="text-3xl font-black text-center mb-12"
            style={{ color: "var(--gold)" }}
          >
            HOW IT WORKS
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: "1", title: "Create Dynasty", desc: "Set up your dynasty with your team, conference, and coach name." },
              { step: "2", title: "Add Teams & Rosters", desc: "Input rosters, key players, ratings, and positions for every team." },
              { step: "3", title: "Log Weekly Results", desc: "Enter scores, stats, and results as you play each week." },
              { step: "4", title: "Experience the World", desc: "News articles, storylines, podcast segments, and pick'em — all generated from your data." },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-black mx-auto mb-4"
                  style={{ background: "var(--gold)", color: "var(--navy)" }}
                >
                  {item.step}
                </div>
                <h3 className="font-bold mb-2" style={{ color: "var(--white)" }}>
                  {item.title}
                </h3>
                <p className="text-sm" style={{ color: "var(--gray-400)" }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h2
          className="text-3xl font-black mb-4"
          style={{ color: "var(--white)" }}
        >
          READY TO ELEVATE YOUR DYNASTY?
        </h2>
        <p className="mb-8" style={{ color: "var(--gray-400)" }}>
          Stop playing your dynasty in a vacuum. Create the world around your season
          with news, storylines, and interactive features that make every game matter.
        </p>
        <Link href="/dynasty" className="btn-primary text-lg px-10 py-4 no-underline">
          Get Started Now
        </Link>
      </section>

      {/* Footer */}
      <footer
        className="py-8 text-center text-sm border-t"
        style={{
          borderColor: "var(--navy-mid)",
          color: "var(--gray-500)",
        }}
      >
        <p>CFB Dynasty Storyline Platform — A fan-built QOL tool for CFB 26 Dynasty Mode</p>
        <p className="mt-1" style={{ color: "var(--gray-600)" }}>
          Not affiliated with EA Sports or the NCAA.
        </p>
      </footer>
    </div>
  );
}
