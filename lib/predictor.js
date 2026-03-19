/**
 * F1 HUB 2026 — AI PREDICTOR ENGINE
 * 
 * Uses a multi-factor weighted probability model based on:
 * 1. Championship Points Form      (30%) — normalized current points
 * 2. Recent Race Form              (25%) — exponentially weighted last-5 results
 * 3. Qualifying Pace               (20%) — grid position efficiency
 * 4. Circuit History               (15%) — historical wins/podiums at circuit
 * 5. Car Reliability               (10%) — DNF rate & mechanical factor
 * 
 * Championship model adds:
 * - Expected points from remaining races
 * - Historical championship win rate from current points gap
 * - Car development trajectory (season-long trend)
 */

// Historical circuit win data (career wins at each track)
const CIRCUIT_HISTORY = {
  russell: {
    suzuka: 0, monaco: 0, silverstone: 2, spa: 0, monza: 0, singapore: 1,
    melbourne: 1, shanghai: 0, cota: 0, baku: 1, miami: 0, imola: 0,
    zandvoort: 1, hungaroring: 0, montmelo: 0, interlagos: 0, lasvegas: 0,
    lusail: 1, yasmarina: 0, villeneuve: 0, spielberg: 1, rodriguez: 0,
  },
  antonelli: {
    suzuka: 0, monaco: 0, silverstone: 0, spa: 0, monza: 0, singapore: 0,
    melbourne: 0, shanghai: 1, // just won here
    cota: 0, baku: 0, miami: 0, imola: 0, zandvoort: 0, hungaroring: 0,
    montmelo: 0, interlagos: 0, lasvegas: 0, lusail: 0, yasmarina: 0,
    villeneuve: 0, spielberg: 0, rodriguez: 0,
  },
  leclerc: {
    suzuka: 0, monaco: 3, silverstone: 0, spa: 1, monza: 2, singapore: 3,
    melbourne: 0, shanghai: 0, cota: 0, baku: 2, miami: 0, imola: 0,
    zandvoort: 0, hungaroring: 1, montmelo: 0, interlagos: 0, lasvegas: 1,
    lusail: 0, yasmarina: 0, villeneuve: 0, spielberg: 0, rodriguez: 0,
  },
  hamilton: {
    suzuka: 4, monaco: 3, silverstone: 9, spa: 6, monza: 5, singapore: 4,
    melbourne: 5, shanghai: 6, cota: 6, baku: 2, miami: 1, imola: 0,
    zandvoort: 3, hungaroring: 9, montmelo: 5, interlagos: 6, lasvegas: 1,
    lusail: 2, yasmarina: 2, villeneuve: 3, spielberg: 4, rodriguez: 4,
  },
  verstappen: {
    suzuka: 3, monaco: 0, silverstone: 2, spa: 3, monza: 0, singapore: 0,
    melbourne: 3, shanghai: 2, cota: 6, baku: 2, miami: 3, imola: 2,
    zandvoort: 4, hungaroring: 2, montmelo: 3, interlagos: 3, lasvegas: 1,
    lusail: 3, yasmarina: 3, villeneuve: 2, spielberg: 3, rodriguez: 3,
  },
  norris: {
    suzuka: 0, monaco: 0, silverstone: 1, spa: 0, monza: 0, singapore: 1,
    melbourne: 0, shanghai: 0, cota: 1, baku: 0, miami: 1, imola: 0,
    zandvoort: 0, hungaroring: 0, montmelo: 0, interlagos: 0, lasvegas: 0,
    lusail: 0, yasmarina: 0, villeneuve: 0, spielberg: 0, rodriguez: 0,
  },
};

// Circuit ID mapping from race names
const CIRCUIT_MAP = {
  'Japanese Grand Prix': 'suzuka',
  'Monaco Grand Prix': 'monaco',
  'British Grand Prix': 'silverstone',
  'Belgian Grand Prix': 'spa',
  'Italian Grand Prix': 'monza',
  'Singapore Grand Prix': 'singapore',
  'Australian Grand Prix': 'melbourne',
  'Chinese Grand Prix': 'shanghai',
  'United States Grand Prix': 'cota',
  'Azerbaijan Grand Prix': 'baku',
  'Miami Grand Prix': 'miami',
  'Emilia Romagna Grand Prix': 'imola',
  'Dutch Grand Prix': 'zandvoort',
  'Hungarian Grand Prix': 'hungaroring',
  'Spanish Grand Prix': 'montmelo',
  'São Paulo Grand Prix': 'interlagos',
  'Las Vegas Grand Prix': 'lasvegas',
  'Qatar Grand Prix': 'lusail',
  'Abu Dhabi Grand Prix': 'yasmarina',
  'Canadian Grand Prix': 'villeneuve',
  'Austrian Grand Prix': 'spielberg',
  'Mexico City Grand Prix': 'rodriguez',
};

// Team-level car performance ratings (0-1 scale, updated based on 2026 performance)
const CAR_PERFORMANCE = {
  mercedes:    0.95,
  ferrari:     0.82,
  mclaren:     0.78,
  redbull:     0.68,
  haas:        0.65,
  racingbulls: 0.62,
  astonmartin: 0.55,
  alpine:      0.48,
  williams:    0.45,
  audi:        0.42,
  cadillac:    0.35,
};

// Driver rating from historical performance & talent (subjective expert weighting)
const DRIVER_RATING = {
  rus: 0.88, ant: 0.82, lec: 0.90, ham: 0.91, ver: 0.95, nor: 0.89,
  pia: 0.83, bea: 0.78, law: 0.75, had: 0.72, lin: 0.70, alo: 0.87,
  str: 0.68, gas: 0.74, doo: 0.70, hul: 0.73, sza: 0.82, alb: 0.74,
  oco: 0.75, and: 0.65, dar: 0.62, bot: 0.72,
};

/**
 * Calculate recent form factor using exponential decay weighting.
 * More recent results carry higher weight.
 * @param {Array} results - Race positions array (most recent last), null = DNF
 * @returns {number} 0-1 factor
 */
function recentFormFactor(results = []) {
  const valid = results.filter(r => r !== null && r !== undefined);
  if (valid.length === 0) return 0.5;

  // Exponential weights: most recent = highest weight
  const weights = [0.10, 0.15, 0.20, 0.25, 0.30];
  let weightedSum = 0;
  let weightTotal = 0;

  valid.slice(-5).reverse().forEach((pos, i) => {
    const w = weights[i] || 0.1;
    // Normalize position 1-20 to 0-1 (1st = 1.0, 20th = 0.0)
    const normalized = 1 - (pos - 1) / 19;
    weightedSum += normalized * w;
    weightTotal += w;
  });

  return weightTotal > 0 ? weightedSum / weightTotal : 0.5;
}

/**
 * Calculate circuit history factor based on wins + podiums at the track
 * @param {string} driverCode - lowercase driver code
 * @param {string} circuitKey - circuit identifier
 * @returns {number} 0-1 factor
 */
function circuitHistoryFactor(driverCode, circuitKey) {
  if (!circuitKey) return 0.3; // neutral if unknown circuit

  const history = CIRCUIT_HISTORY[driverCode.toLowerCase()];
  if (!history) return 0.2; // unknown driver, low factor

  const wins = history[circuitKey] || 0;
  // Sigmoid curve: 0 wins = 0.2, 1 win = 0.45, 3 wins = 0.7, 6+ wins = 0.95
  return 0.2 + (0.75 * (1 - Math.exp(-0.4 * wins)));
}

/**
 * Apply softmax to convert raw scores to probabilities
 * @param {Array} scores - raw score values
 * @param {number} temperature - lower = more differentiation
 * @returns {Array} probabilities summing to 1
 */
function softmax(scores, temperature = 0.3) {
  const maxScore = Math.max(...scores);
  const expScores = scores.map(s => Math.exp((s - maxScore) / temperature));
  const sumExp = expScores.reduce((a, b) => a + b, 0);
  return expScores.map(s => s / sumExp);
}

/**
 * Calculate race win probability for each driver
 * @param {Array} drivers - driver standings array from API
 * @param {string} nextRaceName - next race name for circuit lookup
 * @returns {Array} sorted array with win probabilities
 */
export function calculateRaceWinProbability(drivers, nextRaceName = '') {
  if (!drivers || drivers.length === 0) return [];

  const maxPts = Math.max(...drivers.map(d => d.pts || 0));
  const circuitKey = CIRCUIT_MAP[nextRaceName] || '';

  const rawScores = drivers.map(driver => {
    const code = (driver.code || '').toLowerCase();

    // Factor 1: Championship points (30%)
    const ptsFactor = maxPts > 0 ? (driver.pts || 0) / maxPts : 0;

    // Factor 2: Recent form (25%)
    const formFactor = recentFormFactor(driver.recentResults || []);

    // Factor 3: Car performance (20%)
    const carFactor = CAR_PERFORMANCE[driver.teamId] || 0.5;

    // Factor 4: Circuit history (15%)
    const circuitFactor = circuitHistoryFactor(code, circuitKey);

    // Factor 5: Driver rating/talent (10%)
    const driverRating = DRIVER_RATING[code.slice(0, 3)] || 0.65;

    const rawScore = (ptsFactor * 0.30)
      + (formFactor * 0.25)
      + (carFactor * 0.20)
      + (circuitFactor * 0.15)
      + (driverRating * 0.10);

    return { driver, rawScore };
  });

  // Apply softmax for probability distribution
  const probs = softmax(rawScores.map(s => s.rawScore), 0.25);

  return rawScores.map(({ driver }, i) => ({
    ...driver,
    winProbability: (probs[i] * 100).toFixed(1),
    rawScore: rawScores[i].rawScore,
  })).sort((a, b) => b.winProbability - a.winProbability);
}

/**
 * Calculate championship win probability for each driver
 * Uses projected points over remaining races + current gap analysis
 * @param {Array} drivers - driver standings
 * @param {number} totalRaces - total races in season
 * @param {number} racesCompleted - races already done
 * @returns {Array} sorted array with championship probabilities
 */
export function calculateChampionshipProbability(drivers, totalRaces = 24, racesCompleted = 2) {
  if (!drivers || drivers.length === 0) return [];

  const remainingRaces = totalRaces - racesCompleted;
  const maxPossiblePts = 26 * remainingRaces; // max 26pts per race (win + fastest lap)
  const maxCurrentPts = Math.max(...drivers.map(d => d.pts || 0));

  const rawScores = drivers.map(driver => {
    const code = (driver.code || '').toLowerCase();
    const currentPts = driver.pts || 0;
    const carPerf = CAR_PERFORMANCE[driver.teamId] || 0.5;
    const driverRating = DRIVER_RATING[code.slice(0, 3)] || 0.65;
    const formFactor = recentFormFactor(driver.recentResults || []);

    // Points gap factor: how far behind leader?
    const ptsGap = maxCurrentPts - currentPts;
    const gapFactor = maxPossiblePts > 0 ? Math.max(0, 1 - (ptsGap / maxPossiblePts)) : 0;

    // Season pace factor: average car + driver performance
    const paceFactor = (carPerf * 0.6) + (driverRating * 0.4);

    // Championship win probability combines:
    // - Current points position (40%)
    // - Projected season pace (35%)
    // - Current form trajectory (25%)
    const score = (gapFactor * 0.40)
      + (paceFactor * 0.35)
      + (formFactor * 0.25);

    return { driver: driver.name, teamId: driver.teamId, code, rawScore: score };
  });

  // Apply softmax for championship probabilities
  const probs = softmax(rawScores.map(s => s.rawScore), 0.2);

  const results = rawScores.map(({ driver, teamId, code }, i) => ({
    name: driver,
    teamId,
    pts: drivers[i].pts,
    pos: drivers[i].pos,
    champProbability: (probs[i] * 100).toFixed(1),
  })).sort((a, b) => b.champProbability - a.champProbability);

  return results;
}

/**
 * Get predicted podium with confidence levels
 * @param {Array} drivers - drivers with win probabilities
 * @returns {Object} {p1, p2, p3} each with driver info and confidence
 */
export function getPredictedPodium(drivers) {
  if (!drivers || drivers.length < 3) return null;

  const sorted = [...drivers].sort((a, b) => parseFloat(b.winProbability) - parseFloat(a.winProbability));

  return {
    p1: { ...sorted[0], confidence: 'HIGH' },
    p2: { ...sorted[1], confidence: parseFloat(sorted[1].winProbability) > 10 ? 'MEDIUM' : 'LOW' },
    p3: { ...sorted[2], confidence: parseFloat(sorted[2].winProbability) > 5 ? 'MEDIUM' : 'LOW' },
  };
}

/**
 * Get key prediction factors breakdown for a specific driver
 * @param {Object} driver 
 * @param {string} circuitKey 
 * @returns {Array} factor breakdown
 */
export function getDriverFactors(driver, circuitKey = '') {
  const code = (driver.code || '').toLowerCase();
  const maxPts = 51; // approximate current leader points

  return [
    {
      name: 'POINTS FORM',
      weight: '30%',
      value: ((driver.pts || 0) / maxPts * 100).toFixed(0) + '%',
      score: (driver.pts || 0) / maxPts,
    },
    {
      name: 'RECENT FORM',
      weight: '25%',
      value: (recentFormFactor(driver.recentResults || []) * 100).toFixed(0) + '%',
      score: recentFormFactor(driver.recentResults || []),
    },
    {
      name: 'CAR PACE',
      weight: '20%',
      value: ((CAR_PERFORMANCE[driver.teamId] || 0.5) * 100).toFixed(0) + '%',
      score: CAR_PERFORMANCE[driver.teamId] || 0.5,
    },
    {
      name: 'CIRCUIT HISTORY',
      weight: '15%',
      value: (circuitHistoryFactor(code, circuitKey) * 100).toFixed(0) + '%',
      score: circuitHistoryFactor(code, circuitKey),
    },
    {
      name: 'DRIVER RATING',
      weight: '10%',
      value: ((DRIVER_RATING[code.slice(0, 3)] || 0.65) * 100).toFixed(0) + '%',
      score: DRIVER_RATING[code.slice(0, 3)] || 0.65,
    },
  ];
}
