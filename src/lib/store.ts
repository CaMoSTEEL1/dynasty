"use client";
// ============================================================
// CFB Dynasty Storyline Platform - Zustand Store
// ============================================================
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  DynastyState,
  Team,
  GameResult,
  WeeklyPlayerStats,
  PickEmEntry,
  NewsArticle,
  PodcastEpisode,
  PodcastSegment,
} from "./types";
import { generateId } from "./utils";

// ---- Storyline Generation Engine ----

function generateArticlesForWeek(
  week: number,
  games: GameResult[],
  teams: Team[],
  weeklyStats: WeeklyPlayerStats[],
  currentSeason: number
): NewsArticle[] {
  const articles: NewsArticle[] = [];
  const weekGames = games.filter((g) => g.week === week);
  const teamMap = new Map(teams.map((t) => [t.id, t]));

  for (const game of weekGames) {
    const home = teamMap.get(game.homeTeamId);
    const away = teamMap.get(game.awayTeamId);
    if (!home || !away) continue;

    const winner = game.homeScore > game.awayScore ? home : away;
    const loser = game.homeScore > game.awayScore ? away : home;
    const winnerScore = Math.max(game.homeScore, game.awayScore);
    const loserScore = Math.min(game.homeScore, game.awayScore);
    const margin = winnerScore - loserScore;

    // Upset detection
    if (loser.overallRating > winner.overallRating + 5) {
      articles.push({
        id: generateId(),
        week,
        title: `UPSET ALERT: ${winner.name} ${winner.mascot} Stun ${loser.name} ${loser.mascot}`,
        subtitle: `${winner.name} pulls off the upset of the season with a ${winnerScore}-${loserScore} victory`,
        body: generateUpsetBody(winner, loser, winnerScore, loserScore, week),
        category: "upset",
        teamIds: [winner.id, loser.id],
        playerIds: [],
        createdAt: new Date().toISOString(),
        imageType: "upset",
      });
    }

    // Blowout detection
    if (margin >= 28) {
      articles.push({
        id: generateId(),
        week,
        title: `${winner.name} Dominates ${loser.name} in ${winnerScore}-${loserScore} Rout`,
        subtitle: `The ${winner.mascot} leave no doubt with a commanding ${margin}-point victory`,
        body: generateBlowoutBody(winner, loser, winnerScore, loserScore, margin, week),
        category: "blowout",
        teamIds: [winner.id, loser.id],
        playerIds: [],
        createdAt: new Date().toISOString(),
        imageType: "blowout",
      });
    }

    // Rivalry game
    if (game.isRivalry) {
      articles.push({
        id: generateId(),
        week,
        title: `Rivalry Renewed: ${winner.name} Takes Bragging Rights Over ${loser.name}`,
        subtitle: `An instant classic as ${winner.name} edges ${loser.name} ${winnerScore}-${loserScore}`,
        body: generateRivalryBody(winner, loser, winnerScore, loserScore, week),
        category: "rivalry",
        teamIds: [winner.id, loser.id],
        playerIds: [],
        createdAt: new Date().toISOString(),
        imageType: "rivalry",
      });
    }

    // Close game (thriller)
    if (margin <= 3 && !game.isRivalry) {
      articles.push({
        id: generateId(),
        week,
        title: `Instant Classic: ${winner.name} Survives ${loser.name} ${winnerScore}-${loserScore}`,
        subtitle: `A nail-biter goes down to the wire in Week ${week}`,
        body: generateThrillerBody(winner, loser, winnerScore, loserScore, week),
        category: "recap",
        teamIds: [winner.id, loser.id],
        playerIds: [],
        createdAt: new Date().toISOString(),
        imageType: "thriller",
      });
    }

    // General recap for games without special articles
    if (margin > 3 && margin < 28 && loser.overallRating <= winner.overallRating + 5 && !game.isRivalry) {
      articles.push({
        id: generateId(),
        week,
        title: `${winner.name} Defeats ${loser.name} ${winnerScore}-${loserScore}`,
        subtitle: `The ${winner.mascot} improve to ${winner.wins}-${winner.losses} on the season`,
        body: generateRecapBody(winner, loser, winnerScore, loserScore, week),
        category: "recap",
        teamIds: [winner.id, loser.id],
        playerIds: [],
        createdAt: new Date().toISOString(),
        imageType: "recap",
      });
    }
  }

  // Heisman Watch article (check for standout performers)
  const heismanCandidates = findHeismanCandidates(teams, weeklyStats, week);
  if (heismanCandidates.length > 0) {
    articles.push({
      id: generateId(),
      week,
      title: `Heisman Watch: Week ${week} Update`,
      subtitle: `The race for college football's most prestigious award heats up`,
      body: generateHeismanBody(heismanCandidates, teams, week),
      category: "heisman",
      teamIds: heismanCandidates.map((c) => c.teamId),
      playerIds: heismanCandidates.map((c) => c.playerId),
      createdAt: new Date().toISOString(),
      imageType: "heisman",
    });
  }

  // Power Rankings article
  if (weekGames.length >= 3) {
    const ranked = [...teams]
      .filter((t) => t.wins + t.losses > 0)
      .sort((a, b) => {
        const aWinPct = a.wins / (a.wins + a.losses);
        const bWinPct = b.wins / (b.wins + b.losses);
        if (bWinPct !== aWinPct) return bWinPct - aWinPct;
        return b.overallRating - a.overallRating;
      })
      .slice(0, 10);

    if (ranked.length >= 5) {
      articles.push({
        id: generateId(),
        week,
        title: `Power Rankings: Week ${week} - Who's In, Who's Out?`,
        subtitle: `Our updated top 10 after another wild week of college football`,
        body: generateRankingsBody(ranked, week),
        category: "ranking",
        teamIds: ranked.map((t) => t.id),
        playerIds: [],
        createdAt: new Date().toISOString(),
        imageType: "rankings",
      });
    }
  }

  // Playoff picture (after week 8+)
  if (week >= 8) {
    const contenders = [...teams]
      .filter((t) => t.wins + t.losses > 0)
      .sort((a, b) => {
        const aWinPct = a.wins / (a.wins + a.losses);
        const bWinPct = b.wins / (b.wins + b.losses);
        if (bWinPct !== aWinPct) return bWinPct - aWinPct;
        return b.overallRating - a.overallRating;
      })
      .slice(0, 12);

    if (contenders.length >= 4) {
      articles.push({
        id: generateId(),
        week,
        title: `Playoff Picture: ${currentSeason} 12-Team Bracket Projection`,
        subtitle: `Breaking down who's in, who's on the bubble, and who needs help`,
        body: generatePlayoffBody(contenders, week),
        category: "playoff",
        teamIds: contenders.slice(0, 12).map((t) => t.id),
        playerIds: [],
        createdAt: new Date().toISOString(),
        imageType: "playoff",
      });
    }
  }

  return articles;
}

function findHeismanCandidates(
  teams: Team[],
  weeklyStats: WeeklyPlayerStats[],
  _currentWeek: number
): { playerId: string; teamId: string; playerName: string; totalYards: number; totalTDs: number }[] {
  const playerTotals: Record<string, { teamId: string; playerName: string; totalYards: number; totalTDs: number }> = {};

  for (const team of teams) {
    for (const player of team.roster) {
      if (!player.isKeyPlayer) continue;
      const stats = weeklyStats.filter((s) => s.playerId === player.id);
      const totalYards = stats.reduce((sum, s) => sum + s.passYards + s.rushYards + s.recYards, 0);
      const totalTDs = stats.reduce((sum, s) => sum + s.passTDs + s.rushTDs + s.recTDs, 0);
      if (totalYards > 0 || totalTDs > 0) {
        playerTotals[player.id] = {
          teamId: team.id,
          playerName: player.name,
          totalYards,
          totalTDs,
        };
      }
    }
  }

  return Object.entries(playerTotals)
    .map(([playerId, data]) => ({ playerId, ...data }))
    .sort((a, b) => b.totalTDs * 100 + b.totalYards - (a.totalTDs * 100 + a.totalYards))
    .slice(0, 5);
}

// ---- Article body generators ----

function generateUpsetBody(winner: Team, loser: Team, ws: number, ls: number, week: number): string {
  return `In what will surely be remembered as one of the biggest upsets of the season, the ${winner.name} ${winner.mascot} marched into Week ${week} as heavy underdogs and walked away with a stunning ${ws}-${ls} victory over the ${loser.name} ${loser.mascot}.

The ${loser.mascot}, who entered the game as one of the top teams in the country, had no answer for ${winner.name}'s relentless effort on both sides of the ball. The ${winner.mascot} controlled the tempo from the opening drive and never looked back.

"Nobody gave us a chance," said the ${winner.name} coaching staff postgame. "But these kids believed in themselves and executed the game plan to perfection."

The loss puts ${loser.name}'s playoff hopes in serious jeopardy, while ${winner.name} has announced themselves as a legitimate contender in the ${winner.conference}. The college football landscape has been shaken, and this upset will reverberate through the rankings for weeks to come.

${loser.name} will need to regroup quickly as the season marches on, while ${winner.name} will look to ride this momentum into next week.`;
}

function generateBlowoutBody(winner: Team, loser: Team, ws: number, ls: number, margin: number, week: number): string {
  return `The ${winner.name} ${winner.mascot} made a statement in Week ${week}, dismantling the ${loser.name} ${loser.mascot} by a score of ${ws}-${ls} in a ${margin}-point demolition that was never in doubt.

From the opening kickoff, it was clear this was going to be ${winner.name}'s day. The offense was clicking on all cylinders, putting up points at will while the defense suffocated any hope of a ${loser.name} comeback.

The ${winner.mascot} scored early and often, building an insurmountable lead by halftime. The second half was little more than a formality as ${winner.name} emptied the bench and still managed to extend the margin.

This dominant performance sends a clear message to the rest of the ${winner.conference}: ${winner.name} is for real. With a roster that's firing on all cylinders, the ${winner.mascot} look like one of the most complete teams in college football.

${loser.name} drops to ${loser.wins}-${loser.losses} on the season and will need significant improvements to remain competitive going forward.`;
}

function generateRivalryBody(winner: Team, loser: Team, ws: number, ls: number, week: number): string {
  return `In one of college football's greatest traditions, ${winner.name} and ${loser.name} renewed their storied rivalry in Week ${week}, and it did not disappoint. The ${winner.mascot} emerged victorious with a hard-fought ${ws}-${ls} win that will be talked about for years to come.

The atmosphere was electric from the moment fans filed into the stadium. Both teams came out with an intensity that only rivalry week can produce, trading blows in a physical, emotional contest.

${winner.name} made the plays when it mattered most, delivering clutch performances in key moments to secure the bragging rights. The ${winner.mascot} players celebrated with their fans in what was a cathartic victory.

For ${loser.name}, the sting of this loss will linger. Rivalry games carry extra weight, and falling to ${winner.name} adds an extra layer of motivation for next season's rematch.

${winner.name} improves to ${winner.wins}-${winner.losses} while ${loser.name} falls to ${loser.wins}-${loser.losses}. But in rivalry games, records rarely tell the full story.`;
}

function generateThrillerBody(winner: Team, loser: Team, ws: number, ls: number, week: number): string {
  return `Week ${week} delivered an absolute thriller as ${winner.name} edged ${loser.name} in a nail-biting ${ws}-${ls} finish that had fans on the edge of their seats until the final whistle.

This game had everything: lead changes, momentum swings, and clutch plays from both sides. Neither team was willing to give an inch, making every possession feel like a championship-caliber moment.

In the end, it was ${winner.name} who made one more play than their opponent, securing a victory that could prove pivotal as the season unfolds. The ${winner.mascot} showed tremendous composure in the closing moments.

${loser.name} has nothing to hang their heads about. They fought valiantly and came within inches of pulling out the win. This type of close loss can either galvanize a team or break their spirit -- the coming weeks will reveal which.

Both teams showed they belong among the elite in their respective conferences. This is a game that will be replayed and discussed on highlight shows all week long.`;
}

function generateRecapBody(winner: Team, loser: Team, ws: number, ls: number, week: number): string {
  return `${winner.name} took care of business in Week ${week}, defeating ${loser.name} by a score of ${ws}-${ls} in a solid all-around performance by the ${winner.mascot}.

The game was competitive early, but ${winner.name} began to pull away as their talent advantage became evident. The ${winner.mascot} executed their game plan efficiently on both sides of the ball.

${winner.name} moves to ${winner.wins}-${winner.losses} on the season, keeping their postseason aspirations firmly intact. The ${winner.mascot} continue to stack quality wins and build their resume for the selection committee.

${loser.name} falls to ${loser.wins}-${loser.losses} and will look to bounce back next week. Despite the loss, there were some positive takeaways for the ${loser.mascot} coaching staff to build on.`;
}

function generateHeismanBody(
  candidates: { playerId: string; teamId: string; playerName: string; totalYards: number; totalTDs: number }[],
  teams: Team[],
  week: number
): string {
  const teamMap = new Map(teams.map((t) => [t.id, t]));
  let body = `As we reach Week ${week}, the Heisman Trophy race is taking shape. Here's our updated look at the top candidates making their case for college football's most coveted individual award.\n\n`;

  candidates.forEach((c, i) => {
    const team = teamMap.get(c.teamId);
    const teamName = team ? `${team.name} ${team.mascot}` : "Unknown";
    body += `**${i + 1}. ${c.playerName} - ${teamName}**\n`;
    body += `Season totals: ${c.totalYards.toLocaleString()} total yards, ${c.totalTDs} touchdowns\n`;
    body += `${c.playerName} continues to put up eye-popping numbers and is making a compelling case for the Heisman. `;
    if (i === 0) {
      body += `Currently the frontrunner, ${c.playerName} has been the most electrifying player in college football this season.\n\n`;
    } else {
      body += `A few more performances like this and ${c.playerName} could vault to the top of the list.\n\n`;
    }
  });

  body += `The Heisman race is far from over, and every week brings new opportunities to make a statement. Stay tuned as this compelling race continues to unfold.`;
  return body;
}

function generateRankingsBody(ranked: Team[], week: number): string {
  let body = `After Week ${week}, the college football landscape has shifted once again. Here are our updated Power Rankings:\n\n`;

  ranked.forEach((team, i) => {
    body += `**${i + 1}. ${team.name} ${team.mascot} (${team.wins}-${team.losses}) - ${team.conference}**\n`;
    if (i === 0) {
      body += `The ${team.mascot} hold firm at the top after another convincing performance. This team looks like the class of college football right now.\n\n`;
    } else if (team.losses === 0) {
      body += `Still undefeated, the ${team.mascot} are making a strong case for a playoff spot. Their schedule gets tougher from here.\n\n`;
    } else {
      body += `At ${team.wins}-${team.losses}, ${team.name} remains in the conversation. The ${team.mascot} need to keep winning to stay in contention.\n\n`;
    }
  });

  body += `The rankings will continue to fluctuate as conference play heats up. Every game matters from here on out.`;
  return body;
}

function generatePlayoffBody(contenders: Team[], week: number): string {
  let body = `With the regular season winding down after Week ${week}, here's our projection for the 12-team College Football Playoff:\n\n`;
  body += `**FIRST-ROUND BYES (Seeds 1-4):**\n`;
  contenders.slice(0, 4).forEach((team, i) => {
    body += `${i + 1}. ${team.name} ${team.mascot} (${team.wins}-${team.losses})\n`;
  });
  body += `\n**FIRST-ROUND GAMES (Seeds 5-12):**\n`;
  const matchups = [
    [4, 11],
    [5, 10],
    [6, 9],
    [7, 8],
  ];
  for (const [hi, lo] of matchups) {
    if (contenders[hi] && contenders[lo]) {
      body += `(${hi + 1}) ${contenders[hi].name} vs (${lo + 1}) ${contenders[lo].name}\n`;
    }
  }
  body += `\n**ON THE BUBBLE:**\n`;
  if (contenders.length > 12) {
    body += `Just outside looking in: Teams ranked 13+ will need chaos to sneak into the field.\n`;
  }
  body += `\nThe selection committee will weigh strength of schedule, head-to-head results, and overall body of work. Every game from here on is essentially a playoff elimination game. One slip-up could mean the difference between being in and being out.`;
  return body;
}

// ---- Podcast Generation ----

function generatePodcastForWeek(
  week: number,
  games: GameResult[],
  teams: Team[],
  weeklyStats: WeeklyPlayerStats[],
  picks: PickEmEntry[]
): PodcastEpisode {
  const weekGames = games.filter((g) => g.week === week);
  const teamMap = new Map(teams.map((t) => [t.id, t]));
  const segments: PodcastSegment[] = [];

  // Opening recap segment
  const recapLines: string[] = [];
  for (const game of weekGames) {
    const home = teamMap.get(game.homeTeamId);
    const away = teamMap.get(game.awayTeamId);
    if (home && away) {
      const winner = game.homeScore > game.awayScore ? home : away;
      const winScore = Math.max(game.homeScore, game.awayScore);
      const loseScore = Math.min(game.homeScore, game.awayScore);
      recapLines.push(`${winner.name} won ${winScore}-${loseScore}`);
    }
  }
  segments.push({
    title: `Week ${week} Recap`,
    content: `Welcome back to another episode of the CFB Dynasty Podcast! What a week it was in college football. Let's break down all the action.\n\n${recapLines.length > 0 ? "Results around the CFB world:\n" + recapLines.map((l) => `- ${l}`).join("\n") : "No games this week to recap."}`,
    type: "recap",
  });

  // Hot takes segment
  const upsets = weekGames.filter((g) => {
    const home = teamMap.get(g.homeTeamId);
    const away = teamMap.get(g.awayTeamId);
    if (!home || !away) return false;
    const winner = g.homeScore > g.awayScore ? home : away;
    const loser = g.homeScore > g.awayScore ? away : home;
    return loser.overallRating > winner.overallRating + 5;
  });

  if (upsets.length > 0) {
    const upset = upsets[0];
    const home = teamMap.get(upset.homeTeamId)!;
    const away = teamMap.get(upset.awayTeamId)!;
    const winner = upset.homeScore > upset.awayScore ? home : away;
    const loser = upset.homeScore > upset.awayScore ? away : home;
    segments.push({
      title: "Hot Take of the Week",
      content: `Here's my hot take: ${loser.name} is DONE. After getting upset by ${winner.name}, their playoff hopes are toast. I don't care what their record says -- when you lose to a team you should beat, it reveals who you really are. And ${winner.name}? Don't sleep on the ${winner.mascot}. They might be the most dangerous team nobody is talking about.`,
      type: "hot-take",
    });
  } else {
    segments.push({
      title: "Hot Take of the Week",
      content: "Here's my hot take this week: The top teams held serve, but I'm telling you -- there's a team out there that's about to go on a run nobody sees coming. The parity in college football right now is insane, and we're one big upset away from total chaos in the playoff race.",
      type: "hot-take",
    });
  }

  // Rankings discussion
  const ranked = [...teams]
    .filter((t) => t.wins + t.losses > 0)
    .sort((a, b) => {
      const aPct = a.wins / (a.wins + a.losses);
      const bPct = b.wins / (b.wins + b.losses);
      return bPct - aPct || b.overallRating - a.overallRating;
    })
    .slice(0, 5);

  if (ranked.length > 0) {
    segments.push({
      title: "Rankings Discussion",
      content: `Let's talk rankings. After Week ${week}, here's how I see the top 5:\n${ranked.map((t, i) => `${i + 1}. ${t.name} (${t.wins}-${t.losses})`).join("\n")}\n\nThere's going to be a lot of debate about these rankings, but I think the cream is rising to the top. These are the teams that have consistently shown up week after week.`,
      type: "rankings",
    });
  }

  // Pick'em results
  const weekPicks = picks.filter((p) => p.week === week && p.actualWinnerId);
  if (weekPicks.length > 0) {
    const correct = weekPicks.filter((p) => p.isCorrect).length;
    segments.push({
      title: "Pick'Em Results",
      content: `Time for the moment of truth -- how did our picks do this week? We went ${correct} for ${weekPicks.length} in Week ${week}. ${correct / weekPicks.length >= 0.7 ? "Not bad at all! The crystal ball was working overtime." : correct / weekPicks.length >= 0.5 ? "A decent week, but we definitely left some wins on the table." : "Yikes. College football humbles you every single week. We'll bounce back."}`,
      type: "picks",
    });
  }

  return {
    id: generateId(),
    week,
    title: `CFB Dynasty Podcast - Week ${week} Recap & Analysis`,
    description: `Breaking down all the action from Week ${week} of the college football season, including upsets, rankings changes, and Heisman watch updates.`,
    segments,
    duration: `${25 + Math.floor(Math.random() * 20)} min`,
    createdAt: new Date().toISOString(),
  };
}

// ---- Initial State ----
const initialState = {
  currentSeason: 2026,
  currentWeek: 1,
  teams: [] as Team[],
  games: [] as GameResult[],
  weeklyStats: [] as WeeklyPlayerStats[],
  picks: [] as PickEmEntry[],
  articles: [] as NewsArticle[],
  podcasts: [] as PodcastEpisode[],
  dynastyName: "My CFB Dynasty",
  userTeamId: null as string | null,
};

// ---- Store ----
export const useDynastyStore = create<DynastyState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setDynastyName: (name) => set({ dynastyName: name }),
      setCurrentSeason: (season) => set({ currentSeason: season }),
      setCurrentWeek: (week) => set({ currentWeek: week }),
      setUserTeam: (teamId) => set({ userTeamId: teamId }),

      addTeam: (team) =>
        set((state) => ({ teams: [...state.teams, team] })),

      updateTeam: (team) =>
        set((state) => ({
          teams: state.teams.map((t) => (t.id === team.id ? team : t)),
        })),

      removeTeam: (teamId) =>
        set((state) => ({
          teams: state.teams.filter((t) => t.id !== teamId),
        })),

      addPlayer: (teamId, player) =>
        set((state) => ({
          teams: state.teams.map((t) =>
            t.id === teamId ? { ...t, roster: [...t.roster, player] } : t
          ),
        })),

      updatePlayer: (teamId, player) =>
        set((state) => ({
          teams: state.teams.map((t) =>
            t.id === teamId
              ? {
                  ...t,
                  roster: t.roster.map((p) =>
                    p.id === player.id ? player : p
                  ),
                }
              : t
          ),
        })),

      removePlayer: (teamId, playerId) =>
        set((state) => ({
          teams: state.teams.map((t) =>
            t.id === teamId
              ? { ...t, roster: t.roster.filter((p) => p.id !== playerId) }
              : t
          ),
        })),

      addGame: (game) =>
        set((state) => {
          const teams = state.teams.map((t) => {
            if (t.id === game.homeTeamId) {
              return game.homeScore > game.awayScore
                ? { ...t, wins: t.wins + 1 }
                : { ...t, losses: t.losses + 1 };
            }
            if (t.id === game.awayTeamId) {
              return game.awayScore > game.homeScore
                ? { ...t, wins: t.wins + 1 }
                : { ...t, losses: t.losses + 1 };
            }
            return t;
          });
          return { games: [...state.games, game], teams };
        }),

      updateGame: (game) =>
        set((state) => ({
          games: state.games.map((g) => (g.id === game.id ? game : g)),
        })),

      addWeeklyStats: (stats) =>
        set((state) => ({
          weeklyStats: [...state.weeklyStats, stats],
        })),

      addPick: (pick) =>
        set((state) => ({ picks: [...state.picks, pick] })),

      updatePick: (pick) =>
        set((state) => ({
          picks: state.picks.map((p) => (p.id === pick.id ? pick : p)),
        })),

      addArticle: (article) =>
        set((state) => ({
          articles: [...state.articles, article],
        })),

      addPodcast: (podcast) =>
        set((state) => ({
          podcasts: [...state.podcasts, podcast],
        })),

      generateArticles: (week) => {
        const state = get();
        const newArticles = generateArticlesForWeek(
          week,
          state.games,
          state.teams,
          state.weeklyStats,
          state.currentSeason
        );
        set((s) => ({ articles: [...s.articles, ...newArticles] }));
      },

      generatePodcast: (week) => {
        const state = get();
        const podcast = generatePodcastForWeek(
          week,
          state.games,
          state.teams,
          state.weeklyStats,
          state.picks
        );
        set((s) => ({ podcasts: [...s.podcasts, podcast] }));
      },

      resetDynasty: () => set(initialState),
    }),
    {
      name: "cfb-dynasty-storage",
    }
  )
);
