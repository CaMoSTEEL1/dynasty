# CFB Dynasty Storyline Platform

A quality-of-life dynasty companion website for **College Football 26** on console. Enhances your dynasty experience with auto-generated storylines, immersive news articles, College GameDay Pick'Em, podcasts, standings, and much more.

## Features

### Dashboard
- Dynasty command center with season overview
- Quick stats: teams, games played, articles generated, pick'em record
- User team spotlight with record and roster summary
- Heisman Watch leaderboard
- Getting started guide for new dynasties

### Roster Management
- Add/edit/remove teams with school name, mascot, abbreviation, conference, colors, and overall rating
- Full player roster management per team (name, position, number, year, overall)
- Mark key players for Heisman Watch and storyline tracking
- Set your user-controlled team
- Color picker for team branding

### Weekly Scores & Stats
- Log game results week by week (home/away, scores)
- Tag games as Conference, Rivalry, Playoff, or Bowl games
- Auto-detects upsets, blowouts, and thrillers
- Per-player stat entry (passing, rushing, receiving, defense)
- Stats automatically roll up to season totals

### News & Storyline Engine
- **Auto-generates immersive news articles** based on your game results:
  - **Upset Alerts** when underdogs win
  - **Blowout recaps** for dominant victories
  - **Rivalry game narratives**
  - **Thriller/instant classic** write-ups for close games
  - **Heisman Watch** updates tracking top performers
  - **Power Rankings** updated weekly
  - **Playoff Picture** projections (after Week 8)
  - General game recaps
- Filter articles by week and category
- Expandable full-length articles with detailed narratives

### College GameDay Pick'Em
- Pick winners for each game before or after results
- Track your season record, win percentage, and streaks
- Weekly results with correct/incorrect indicators
- Visual matchup cards with team colors and records

### Podcast Hub
- Generate weekly podcast episodes with multiple segments:
  - **Week Recap** - full results summary
  - **Hot Takes** - bold opinions on upsets and trends
  - **Rankings Discussion** - top 5 breakdown
  - **Pick'Em Results** - how your picks performed
- Visual audio waveform player UI
- Segment-by-segment browsing

### Standings & Rankings
- **Power Rankings** - overall rankings sorted by win percentage and rating
- **Conference Standings** - collapsible conference-by-conference view
- **12-Team Playoff Bracket** - complete bracket projection with:
  - First-round byes (seeds 1-4)
  - First-round matchups (seeds 5-12)
  - Bubble teams

### Data Persistence
- All data saved to `localStorage` automatically via Zustand persist
- No backend or login required
- Works as a standalone hosted website

## Tech Stack

- **Next.js 16** with App Router
- **TypeScript** for type safety
- **Tailwind CSS v4** for styling
- **Zustand** for state management with localStorage persistence
- **Lucide React** for icons

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

Open [http://localhost:3000](http://localhost:3000) in your browser.

## How to Use

1. **Add Teams** - Go to Rosters and add the teams in your dynasty. Set your user team and add key players.
2. **Log Games** - After each week in your dynasty, enter game scores on the Scores page. Add individual player stats for standout performances.
3. **Generate News** - Visit the News page and generate articles for any week. The engine creates immersive storylines from your data.
4. **Make Picks** - Use the Pick'Em section to pick winners and track your accuracy.
5. **Listen to Podcasts** - Generate podcast episodes for weekly recaps with hot takes and rankings.
6. **Track Standings** - Monitor conference standings, power rankings, and playoff projections all season.

## Deployment

This is a standard Next.js application. Deploy to:
- **Vercel** (recommended) - `vercel deploy`
- **Netlify** - connect your repository
- **GitHub Pages** - with static export
- Any platform that supports Node.js

## License

MIT
