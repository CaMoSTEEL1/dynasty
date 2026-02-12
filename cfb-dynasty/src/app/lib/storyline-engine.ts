import { Game, Team, Player, PlayerStats, NewsArticle } from "./types";
import { v4 as uuidv4 } from "uuid";

// Storyline Engine: Generates news articles and narratives from dynasty data

interface StorylineContext {
  game: Game;
  homeTeam: Team;
  awayTeam: Team;
  homePlayers: Player[];
  awayPlayers: Player[];
  dynastyId: string;
  season: number;
  week: number;
}

export function generateGameRecapArticle(ctx: StorylineContext): Omit<NewsArticle, "created_at"> {
  const { game, homeTeam, awayTeam, dynastyId, season, week } = ctx;
  const homeWon = (game.home_score ?? 0) > (game.away_score ?? 0);
  const winner = homeWon ? homeTeam : awayTeam;
  const loser = homeWon ? awayTeam : homeTeam;
  const winScore = homeWon ? game.home_score : game.away_score;
  const loseScore = homeWon ? game.away_score : game.home_score;
  const margin = (winScore ?? 0) - (loseScore ?? 0);
  const isBlowout = margin >= 21;
  const isNailbiter = margin <= 7;
  const isUpset = (loser.ranking !== null && loser.ranking <= 10) && (winner.ranking === null || winner.ranking > 15);
  const isTopGame = (homeTeam.ranking !== null && homeTeam.ranking <= 25) && (awayTeam.ranking !== null && awayTeam.ranking <= 25);

  // Find standout players
  const winnerPlayers = homeWon ? ctx.homePlayers : ctx.awayPlayers;
  const starPlayer = winnerPlayers.find(p => p.is_key_player) || winnerPlayers[0];

  let title: string;
  let subtitle: string;
  let body: string;
  let category: string = "game_recap";
  let isBreaking = 0;

  if (isUpset) {
    title = `UPSET ALERT: ${winner.name} Stuns #${loser.ranking} ${loser.name} ${winScore}-${loseScore}`;
    subtitle = `${winner.name} pulls off the upset of the season in a shocking result`;
    isBreaking = 1;
    category = "upset";
    body = generateUpsetBody(winner, loser, winScore ?? 0, loseScore ?? 0, margin, starPlayer, week, game);
  } else if (isBlowout) {
    title = `${rankPrefix(winner)}${winner.name} Dominates ${rankPrefix(loser)}${loser.name} in ${winScore}-${loseScore} Rout`;
    subtitle = `${winner.name} leaves no doubt with a commanding performance`;
    body = generateBlowoutBody(winner, loser, winScore ?? 0, loseScore ?? 0, margin, starPlayer, week);
  } else if (isNailbiter) {
    title = `${rankPrefix(winner)}${winner.name} Edges ${rankPrefix(loser)}${loser.name} ${winScore}-${loseScore} in Instant Classic`;
    subtitle = `A thrilling finish decides this ${isTopGame ? "top-25 showdown" : "hard-fought battle"}`;
    body = generateNailbiterBody(winner, loser, winScore ?? 0, loseScore ?? 0, starPlayer, week, isTopGame);
  } else if (isTopGame) {
    title = `#${homeTeam.ranking} ${homeTeam.name} vs #${awayTeam.ranking} ${awayTeam.name}: ${winner.name} Prevails ${winScore}-${loseScore}`;
    subtitle = `The marquee matchup of Week ${week} lives up to the hype`;
    body = generateTopGameBody(winner, loser, winScore ?? 0, loseScore ?? 0, margin, starPlayer, week);
  } else {
    title = `${rankPrefix(winner)}${winner.name} Defeats ${rankPrefix(loser)}${loser.name} ${winScore}-${loseScore}`;
    subtitle = `${winner.name} improves to ${winner.wins + 1}-${winner.losses} on the season`;
    body = generateStandardBody(winner, loser, winScore ?? 0, loseScore ?? 0, margin, starPlayer, week);
  }

  if (game.is_rivalry) {
    title = `RIVALRY WEEK: ${title}`;
    category = "rivalry";
  }

  if (game.is_bowl_game && game.bowl_name) {
    title = `${game.bowl_name}: ${title}`;
    category = "playoff";
  }

  return {
    id: uuidv4(),
    dynasty_id: dynastyId,
    season,
    week,
    title,
    subtitle,
    body,
    category,
    image_url: null,
    is_breaking: isBreaking,
    related_team_id: winner.id,
    related_game_id: game.id,
    related_player_id: starPlayer?.id ?? null,
  };
}

function rankPrefix(team: Team): string {
  return team.ranking ? `#${team.ranking} ` : "";
}

function playerStatLine(player: Player | undefined): string {
  if (!player) return "";
  const stats: PlayerStats = JSON.parse(player.stats_json || "{}");
  const lines: string[] = [];
  if (stats.passing_yards) lines.push(`${stats.passing_yards} passing yards, ${stats.passing_tds ?? 0} TDs`);
  if (stats.rushing_yards) lines.push(`${stats.rushing_yards} rushing yards, ${stats.rushing_tds ?? 0} TDs`);
  if (stats.receiving_yards) lines.push(`${stats.receiving_yards} receiving yards, ${stats.receiving_tds ?? 0} TDs`);
  if (stats.tackles) lines.push(`${stats.tackles} tackles`);
  if (stats.sacks) lines.push(`${stats.sacks} sacks`);
  return lines.length > 0 ? lines.join(" and ") : "a solid all-around performance";
}

function generateUpsetBody(winner: Team, loser: Team, winScore: number, loseScore: number, margin: number, star: Player | undefined, week: number, game: Game): string {
  return `In what will go down as one of the biggest upsets of the season, ${winner.name} shocked the college football world by taking down #${loser.ranking} ${loser.name} ${winScore}-${loseScore} in Week ${week}.

${star ? `${star.name} (${star.position}, ${star.year}) was the catalyst for the ${winner.name}, delivering ${playerStatLine(star)} in what was an outstanding performance on the biggest stage.` : `The ${winner.name} played their most complete game of the season, executing on both sides of the ball.`}

The result throws the ${loser.conference} standings into chaos, as ${loser.name} drops from the ranks of the unbeaten. ${winner.name} will look to carry this momentum forward as the season progresses.

${game.is_conference_game ? `This ${winner.conference} showdown has major implications for the conference championship race.` : ""}

${loser.name} will need to regroup quickly as they look to recover from this devastating loss. Meanwhile, don't be surprised if ${winner.name} finds themselves receiving votes in next week's poll.`;
}

function generateBlowoutBody(winner: Team, loser: Team, winScore: number, loseScore: number, margin: number, star: Player | undefined, week: number): string {
  return `${rankPrefix(winner)}${winner.name} put on a clinic in Week ${week}, dismantling ${rankPrefix(loser)}${loser.name} by a score of ${winScore}-${loseScore}. The ${margin}-point victory was a statement win for the ${winner.mascot || winner.name}.

${star ? `${star.name} led the charge with ${playerStatLine(star)}, proving once again why they're one of the most impactful players in the ${winner.conference}.` : `${winner.name} dominated from start to finish, never allowing ${loser.name} to gain any momentum.`}

The ${winner.name} offense was firing on all cylinders, while the defense held ${loser.name} in check all game long. This was the kind of performance that turns heads across the nation and makes a strong case for ${winner.name}'s place among the elite.

${loser.name} drops to ${loser.wins}-${loser.losses + 1} and faces serious questions going forward. Can they bounce back from such a lopsided defeat?`;
}

function generateNailbiterBody(winner: Team, loser: Team, winScore: number, loseScore: number, star: Player | undefined, week: number, isTopGame: boolean): string {
  return `In a game that had everything — lead changes, momentum swings, and a dramatic finish — ${rankPrefix(winner)}${winner.name} held on to defeat ${rankPrefix(loser)}${loser.name} ${winScore}-${loseScore} in Week ${week}.

${isTopGame ? "This was the marquee matchup of the week, and it did not disappoint." : "From start to finish, neither team could pull away."}

${star ? `${star.name} was the difference-maker for ${winner.name}, recording ${playerStatLine(star)} in a gutsy performance when it mattered most.` : `${winner.name} made the plays when it counted most, grinding out a hard-earned victory.`}

Both teams left it all on the field in a game that will be remembered as one of the best of the season. ${loser.name} has nothing to hang their heads about after a valiant effort, but the final result is all that matters in the standings.

${winner.name} improves to ${winner.wins + 1}-${winner.losses} and remains in the thick of things in the ${winner.conference}.`;
}

function generateTopGameBody(winner: Team, loser: Team, winScore: number, loseScore: number, margin: number, star: Player | undefined, week: number): string {
  return `The battle between two ranked teams lived up to every expectation as ${rankPrefix(winner)}${winner.name} defeated ${rankPrefix(loser)}${loser.name} ${winScore}-${loseScore} in a Week ${week} showcase.

${star ? `${star.name} rose to the occasion in the spotlight, finishing with ${playerStatLine(star)}.` : `${winner.name} proved they belong among the nation's best with a measured, complete performance.`}

This was a game between two programs headed in the right direction, but on this day, ${winner.name} was the better team. The ${margin}-point margin tells the story of a team that was in control for most of the contest.

Look for ${winner.name} to climb in next week's rankings, while ${loser.name} may slip a few spots but remains a dangerous team moving forward.`;
}

function generateStandardBody(winner: Team, loser: Team, winScore: number, loseScore: number, margin: number, star: Player | undefined, week: number): string {
  return `${rankPrefix(winner)}${winner.name} took care of business in Week ${week} with a ${winScore}-${loseScore} victory over ${rankPrefix(loser)}${loser.name}.

${star ? `${star.name} was a standout performer for the ${winner.name}, posting ${playerStatLine(star)}.` : `The ${winner.name} were solid across the board in a well-rounded team effort.`}

${winner.name} moves to ${winner.wins + 1}-${winner.losses} on the season, while ${loser.name} falls to ${loser.wins}-${loser.losses + 1}. The win keeps ${winner.name}'s season on track as they continue to compete in the ${winner.conference}.

Up next, both teams will look ahead to Week ${week + 1} as the season marches on.`;
}

// Generate weekly storyline articles beyond game recaps
export function generateWeeklyStorylines(
  dynastyId: string,
  season: number,
  week: number,
  teams: Team[],
  completedGames: Game[]
): Omit<NewsArticle, "created_at">[] {
  const articles: Omit<NewsArticle, "created_at">[] = [];

  // Power Rankings blurb
  const rankedTeams = teams.filter(t => t.ranking !== null).sort((a, b) => (a.ranking ?? 99) - (b.ranking ?? 99));
  if (rankedTeams.length >= 5) {
    const top5 = rankedTeams.slice(0, 5);
    articles.push({
      id: uuidv4(),
      dynasty_id: dynastyId,
      season,
      week,
      title: `Week ${week} Power Rankings: ${top5[0].name} Holds the Top Spot`,
      subtitle: `A look at the top 25 after another wild week of college football`,
      body: `Here's how the top 25 shakes out after Week ${week}:\n\n${rankedTeams.map((t, i) => `${i + 1}. ${t.name} (${t.wins}-${t.losses})`).join("\n")}\n\nThe ${top5[0].name} remain firmly at #1 after another dominant week. ${top5.length > 2 ? `${top5[1].name} and ${top5[2].name} round out the top three in what is shaping up to be a three-horse race for the national championship.` : ""}\n\nKeep an eye on the teams just outside the top 10 — with rivalry games and conference championships on the horizon, things can change quickly.`,
      category: "rankings",
      image_url: null,
      is_breaking: 0,
      related_team_id: top5[0].id,
      related_game_id: null,
      related_player_id: null,
    });
  }

  // Undefeated Watch
  const undefeated = teams.filter(t => t.losses === 0 && t.wins > 0);
  if (undefeated.length > 0 && week >= 4) {
    articles.push({
      id: uuidv4(),
      dynasty_id: dynastyId,
      season,
      week,
      title: `Undefeated Watch: ${undefeated.length} Team${undefeated.length > 1 ? "s" : ""} Remain Perfect`,
      subtitle: `The list of unbeatens continues to shrink as we enter Week ${week + 1}`,
      body: `Only ${undefeated.length} team${undefeated.length > 1 ? "s" : ""} remain undefeated heading into Week ${week + 1}:\n\n${undefeated.map(t => `• ${rankPrefix(t)}${t.name} (${t.wins}-0)`).join("\n")}\n\nAs the schedule gets tougher, maintaining a perfect record becomes increasingly difficult. Which teams will survive and keep their playoff hopes alive?`,
      category: "general",
      image_url: null,
      is_breaking: 0,
      related_team_id: null,
      related_game_id: null,
      related_player_id: null,
    });
  }

  // Upset recap if any big upsets happened
  const upsets = completedGames.filter(g => {
    const homeWon = (g.home_score ?? 0) > (g.away_score ?? 0);
    const winner = homeWon ? teams.find(t => t.id === g.home_team_id) : teams.find(t => t.id === g.away_team_id);
    const loser = homeWon ? teams.find(t => t.id === g.away_team_id) : teams.find(t => t.id === g.home_team_id);
    if (!winner || !loser) return false;
    return (loser.ranking !== null && loser.ranking <= 15) && (winner.ranking === null || winner.ranking > 20);
  });

  if (upsets.length > 0) {
    articles.push({
      id: uuidv4(),
      dynasty_id: dynastyId,
      season,
      week,
      title: `Upset City! Week ${week} Delivers ${upsets.length} Shocking Result${upsets.length > 1 ? "s" : ""}`,
      subtitle: `Chaos reigns in college football as the favorites fall`,
      body: `Week ${week} was a rough one for the favorites. ${upsets.length} ranked team${upsets.length > 1 ? "s were" : " was"} knocked off by unranked or lower-ranked opponents, sending shockwaves through the college football landscape.\n\nThese results will have major implications for the playoff picture and conference standings heading into the second half of the season.`,
      category: "upset",
      image_url: null,
      is_breaking: 1,
      related_team_id: null,
      related_game_id: null,
      related_player_id: null,
    });
  }

  return articles;
}

// Generate podcast talking points from weekly data
export function generatePodcastContent(
  dynastyId: string,
  season: number,
  week: number,
  teams: Team[],
  games: Game[]
) {
  const completedGames = games.filter(g => g.is_completed);
  const upsets = completedGames.filter(g => {
    const loserTeam = (g.home_score ?? 0) > (g.away_score ?? 0)
      ? teams.find(t => t.id === g.away_team_id)
      : teams.find(t => t.id === g.home_team_id);
    return loserTeam && loserTeam.ranking !== null && loserTeam.ranking <= 15;
  });

  const segments = [
    { title: "Opening: The State of CFB", description: `Week ${week} is in the books. Let's break down everything that happened.`, type: "intro" as const },
    { title: "Game Recaps", description: `We had ${completedGames.length} games this week. Here are the biggest takeaways.`, type: "recap" as const },
  ];

  if (upsets.length > 0) {
    segments.push({ title: "Upset Alert", description: `${upsets.length} ranked teams went down. Let's talk about the chaos.`, type: "debate" as const });
  }

  segments.push(
    { title: `Week ${week + 1} Preview`, description: `Looking ahead to next week's biggest matchups.`, type: "preview" as const },
    { title: "Picks & Predictions", description: `Our picks for next week's slate.`, type: "picks" as const },
    { title: "Closing Thoughts", description: `Final takes and hot seats.`, type: "outro" as const },
  );

  const talkingPoints = [
    `${completedGames.length} games completed in Week ${week}`,
    ...upsets.length > 0 ? [`${upsets.length} ranked upset${upsets.length > 1 ? "s" : ""} this week`] : [],
    `Top matchup analysis and breakdown`,
    `Playoff picture implications`,
    `Key players and standout performances`,
  ];

  return {
    id: uuidv4(),
    dynasty_id: dynastyId,
    season,
    week,
    title: `Dynasty Central: Week ${week} Recap & Week ${week + 1} Preview`,
    description: `Breaking down all the action from Week ${week} and previewing what's ahead.`,
    show_name: "Dynasty Central",
    host: "Virtual Analyst",
    segments_json: JSON.stringify(segments),
    talking_points_json: JSON.stringify(talkingPoints),
    duration_display: `${25 + Math.floor(completedGames.length * 3)}:00`,
    created_at: new Date().toISOString(),
  };
}
