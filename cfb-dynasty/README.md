# CFB Dynasty Storyline Platform

The ultimate quality-of-life dynasty overhaul for **CFB 26**. Generate news articles, build storylines, make picks, and bring your dynasty to life like never before.

## Features

### Dynasty Management
- Create and manage multiple dynasties
- Track seasons and weeks
- Set your team, conference, and coach

### Roster Builder
- Add teams with colors, rankings, records, and conferences
- Build full rosters with positions, ratings, class years
- Mark key/star players that drive storylines

### Weekly Scoreboard
- Log game results each week with scores
- Track conference games, rivalry games, and bowl/playoff games
- Auto-updating standings and records

### News & Storylines (Auto-Generated)
- **Game recap articles** generated from your scores and roster data
- **Upset alerts** when ranked teams fall
- **Power rankings** updates each week
- **Undefeated watch** tracking
- **Rivalry and bowl game** special coverage
- Articles reference your key players and their stats

### College GameDay Pick'em
- Add weekly matchups with spreads
- Make picks with confidence levels (1-5 stars)
- Track your pick'em record and win percentage
- Virtual analyst makes counter-picks
- Mark featured "GameDay" games
- Resolve picks and see results

### Podcast Hub
- Auto-generated podcast episodes with segments
- Talking points from your weekly data
- Recap, preview, debate, and picks segments
- Visual episode player

### Dashboard
- At-a-glance view of your entire dynasty
- Quick actions to all sections
- Top 10 rankings sidebar
- Latest headlines and scores

## Tech Stack

- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: SQLite (via better-sqlite3)
- **No external services required** — fully self-contained

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## How It Works

1. **Create a Dynasty** — Set up your team, coach, and conference
2. **Add Teams & Rosters** — Input all the teams in your dynasty with key players
3. **Log Weekly Results** — Enter scores after each week of play
4. **Experience the World** — News articles, podcast episodes, and storylines are auto-generated from your data

## Project Structure

```
cfb-dynasty/
├── src/app/
│   ├── (app)/           # App pages (with shared layout)
│   │   ├── dashboard/   # Main dashboard
│   │   ├── dynasty/     # Dynasty management
│   │   ├── roster/      # Team & player management
│   │   ├── scoreboard/  # Weekly scores & standings
│   │   ├── news/        # Auto-generated articles
│   │   ├── pickem/      # College GameDay Pick'em
│   │   └── podcast/     # Podcast hub
│   ├── api/             # REST API routes
│   ├── components/      # Shared components
│   └── lib/             # Database, types, storyline engine
└── package.json
```

## Storyline Engine

The core of the platform is the **storyline engine** (`src/app/lib/storyline-engine.ts`). When you log a completed game, it automatically:

- Detects upsets, blowouts, nail-biters, and top-25 matchups
- Generates contextual headlines and full article bodies
- References key players and their stats
- Creates weekly power rankings and undefeated watch articles
- Generates podcast episodes with talking points

## License

Fan-built tool for CFB 26 Dynasty Mode. Not affiliated with EA Sports or the NCAA.
