// pages/api/standings.js
// Fetches real-time F1 standings from Ergast API (free, no key needed)
// Falls back to static 2026 data if API is unavailable

const STATIC_DRIVERS = [
  { pos: 1,  code: 'RUS', name: 'George Russell',    team: 'Mercedes',      teamId: 'mercedes',    pts: 51, wins: 1, podiums: 2, nat: '🇬🇧', num: 63, recentResults: [1, 3, null] },
  { pos: 2,  code: 'ANT', name: 'Kimi Antonelli',    team: 'Mercedes',      teamId: 'mercedes',    pts: 47, wins: 1, podiums: 2, nat: '🇮🇹', num: 12, recentResults: [3, 1, null] },
  { pos: 3,  code: 'LEC', name: 'Charles Leclerc',   team: 'Ferrari',       teamId: 'ferrari',     pts: 34, wins: 0, podiums: 1, nat: '🇲🇨', num: 16, recentResults: [2, 5, null] },
  { pos: 4,  code: 'HAM', name: 'Lewis Hamilton',    team: 'Ferrari',       teamId: 'ferrari',     pts: 33, wins: 0, podiums: 1, nat: '🇬🇧', num: 44, recentResults: [4, 2, null] },
  { pos: 5,  code: 'BEA', name: 'Oliver Bearman',    team: 'Haas',          teamId: 'haas',        pts: 17, wins: 0, podiums: 0, nat: '🇬🇧', num: 87, recentResults: [5, 5, null] },
  { pos: 6,  code: 'NOR', name: 'Lando Norris',      team: 'McLaren',       teamId: 'mclaren',     pts: 15, wins: 0, podiums: 0, nat: '🇬🇧', num: 1,  recentResults: [6, 9, null] },
  { pos: 7,  code: 'VER', name: 'Max Verstappen',    team: 'Red Bull',      teamId: 'redbull',     pts: 8,  wins: 0, podiums: 0, nat: '🇳🇱', num: 3,  recentResults: [7, 7, null] },
  { pos: 8,  code: 'LAW', name: 'Liam Lawson',       team: 'Racing Bulls',  teamId: 'racingbulls', pts: 8,  wins: 0, podiums: 0, nat: '🇳🇿', num: 30, recentResults: [8, 8, null] },
  { pos: 9,  code: 'HAD', name: 'Isack Hadjar',      team: 'Red Bull',      teamId: 'redbull',     pts: 4,  wins: 0, podiums: 0, nat: '🇫🇷', num: 6,  recentResults: [9, 11, null] },
  { pos: 10, code: 'LIN', name: 'Arvid Lindblad',    team: 'Racing Bulls',  teamId: 'racingbulls', pts: 4,  wins: 0, podiums: 0, nat: '🇬🇧', num: 41, recentResults: [10, 10, null] },
  { pos: 11, code: 'PIA', name: 'Oscar Piastri',     team: 'McLaren',       teamId: 'mclaren',     pts: 3,  wins: 0, podiums: 0, nat: '🇦🇺', num: 81, recentResults: [11, 12, null] },
  { pos: 12, code: 'ALO', name: 'Fernando Alonso',   team: 'Aston Martin',  teamId: 'astonmartin', pts: 2,  wins: 0, podiums: 0, nat: '🇪🇸', num: 14, recentResults: [12, 13, null] },
  { pos: 13, code: 'STR', name: 'Lance Stroll',      team: 'Aston Martin',  teamId: 'astonmartin', pts: 1,  wins: 0, podiums: 0, nat: '🇨🇦', num: 18, recentResults: [13, 14, null] },
  { pos: 14, code: 'GAS', name: 'Pierre Gasly',      team: 'Alpine',        teamId: 'alpine',      pts: 0,  wins: 0, podiums: 0, nat: '🇫🇷', num: 10, recentResults: [14, 15, null] },
  { pos: 15, code: 'DOO', name: 'Jack Doohan',       team: 'Alpine',        teamId: 'alpine',      pts: 0,  wins: 0, podiums: 0, nat: '🇦🇺', num: 7,  recentResults: [15, 16, null] },
  { pos: 16, code: 'HUL', name: 'Nico Hülkenberg',   team: 'Audi',          teamId: 'audi',        pts: 0,  wins: 0, podiums: 0, nat: '🇩🇪', num: 27, recentResults: [16, 17, null] },
  { pos: 17, code: 'SZA', name: 'Carlos Sainz',      team: 'Williams',      teamId: 'williams',    pts: 0,  wins: 0, podiums: 0, nat: '🇪🇸', num: 55, recentResults: [17, 18, null] },
  { pos: 18, code: 'ALB', name: 'Alexander Albon',   team: 'Williams',      teamId: 'williams',    pts: 0,  wins: 0, podiums: 0, nat: '🇹🇭', num: 23, recentResults: [18, 19, null] },
  { pos: 19, code: 'OCO', name: 'Esteban Ocon',      team: 'Haas',          teamId: 'haas',        pts: 0,  wins: 0, podiums: 0, nat: '🇫🇷', num: 31, recentResults: [19, 20, null] },
  { pos: 20, code: 'AND', name: 'Marco Andretti',    team: 'Cadillac',      teamId: 'cadillac',    pts: 0,  wins: 0, podiums: 0, nat: '🇺🇸', num: 2,  recentResults: [20, null, null] },
  { pos: 21, code: 'DAR', name: 'Romain Dardel',     team: 'Cadillac',      teamId: 'cadillac',    pts: 0,  wins: 0, podiums: 0, nat: '🇫🇷', num: 22, recentResults: [null, null, null] },
  { pos: 22, code: 'BOT', name: 'Valtteri Bottas',   team: 'Audi',          teamId: 'audi',        pts: 0,  wins: 0, podiums: 0, nat: '🇫🇮', num: 77, recentResults: [null, null, null] },
];

const STATIC_CONSTRUCTORS = [
  { pos: 1, name: 'Mercedes',      teamId: 'mercedes',    pts: 98, wins: 2, color: '#00D2BE' },
  { pos: 2, name: 'Ferrari',       teamId: 'ferrari',     pts: 67, wins: 0, color: '#DC0000' },
  { pos: 3, name: 'Haas',          teamId: 'haas',        pts: 17, wins: 0, color: '#E8002D' },
  { pos: 4, name: 'McLaren',       teamId: 'mclaren',     pts: 18, wins: 0, color: '#FF8000' },
  { pos: 5, name: 'Red Bull',      teamId: 'redbull',     pts: 12, wins: 0, color: '#3671C6' },
  { pos: 6, name: 'Racing Bulls',  teamId: 'racingbulls', pts: 12, wins: 0, color: '#5E88FF' },
  { pos: 7, name: 'Aston Martin',  teamId: 'astonmartin', pts: 3,  wins: 0, color: '#00A77E' },
  { pos: 8, name: 'McLaren',       teamId: 'mclaren',     pts: 3,  wins: 0, color: '#FF8000' },
  { pos: 9, name: 'Alpine',        teamId: 'alpine',      pts: 0,  wins: 0, color: '#0090FF' },
  { pos: 10, name: 'Williams',     teamId: 'williams',    pts: 0,  wins: 0, color: '#37BEDD' },
  { pos: 11, name: 'Audi',         teamId: 'audi',        pts: 0,  wins: 0, color: '#BB0000' },
  { pos: 12, name: 'Cadillac',     teamId: 'cadillac',    pts: 0,  wins: 0, color: '#C8A46B' },
];

const TEAM_ID_MAP = {
  'mercedes': 'mercedes', 'ferrari': 'ferrari', 'mclaren': 'mclaren',
  'red_bull': 'redbull', 'rb': 'racingbulls', 'haas': 'haas',
  'alpine': 'alpine', 'sauber': 'audi', 'williams': 'williams',
  'aston_martin': 'astonmartin',
};

function mapTeamId(constructorId) {
  return TEAM_ID_MAP[constructorId] || constructorId;
}

async function fetchErgast(url) {
  const res = await fetch(url, { 
    headers: { 'Accept': 'application/json' },
    signal: AbortSignal.timeout(8000)
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 's-maxage=120, stale-while-revalidate=300');

  try {
    const [driverData, constructorData, lastRaceData] = await Promise.all([
      fetchErgast('https://ergast.com/api/f1/current/driverStandings.json'),
      fetchErgast('https://ergast.com/api/f1/current/constructorStandings.json'),
      fetchErgast('https://ergast.com/api/f1/current/last/results.json'),
    ]);

    const driverStandings = driverData?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings;
    const constructorStandings = constructorData?.MRData?.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings;
    const lastRace = lastRaceData?.MRData?.RaceTable?.Races?.[0];

    if (!driverStandings || driverStandings.length === 0) {
      throw new Error('No standings data from Ergast');
    }

    const drivers = driverStandings.map((d, i) => {
      const staticDriver = STATIC_DRIVERS.find(
        s => s.code === d.Driver?.code || s.name === `${d.Driver?.givenName} ${d.Driver?.familyName}`
      );
      return {
        pos: parseInt(d.position),
        code: d.Driver?.code || d.Driver?.driverId?.slice(0, 3).toUpperCase(),
        name: `${d.Driver?.givenName} ${d.Driver?.familyName}`,
        team: d.Constructors?.[0]?.name || 'Unknown',
        teamId: mapTeamId(d.Constructors?.[0]?.constructorId || ''),
        pts: parseFloat(d.points) || 0,
        wins: parseInt(d.wins) || 0,
        podiums: staticDriver?.podiums || 0,
        nat: staticDriver?.nat || '🏁',
        num: parseInt(d.Driver?.permanentNumber) || staticDriver?.num || i + 1,
        recentResults: staticDriver?.recentResults || [],
      };
    });

    const constructors = (constructorStandings || []).map(c => {
      const staticCon = STATIC_CONSTRUCTORS.find(s => s.name.toLowerCase() === c.Constructor?.name?.toLowerCase());
      return {
        pos: parseInt(c.position),
        name: c.Constructor?.name,
        teamId: mapTeamId(c.Constructor?.constructorId || ''),
        pts: parseFloat(c.points) || 0,
        wins: parseInt(c.wins) || 0,
        color: staticCon?.color || '#888',
      };
    });

    // Parse last race podium
    let podium = [];
    let lastRaceName = '';
    let lastRaceDate = '';
    let lastRaceCircuit = '';
    if (lastRace) {
      lastRaceName = lastRace.raceName || '';
      lastRaceDate = lastRace.date || '';
      lastRaceCircuit = lastRace.Circuit?.circuitName || '';
      podium = (lastRace.Results || []).slice(0, 3).map(r => ({
        pos: parseInt(r.position),
        driver: `${r.Driver?.givenName} ${r.Driver?.familyName}`,
        team: r.Constructor?.name,
        teamId: mapTeamId(r.Constructor?.constructorId || ''),
        time: r.Time?.time || r.status,
        gap: r.gap || '',
      }));
    }

    res.status(200).json({
      source: 'ergast',
      lastUpdated: new Date().toISOString(),
      drivers,
      constructors,
      podium,
      lastRace: { name: lastRaceName, date: lastRaceDate, circuit: lastRaceCircuit },
      round: driverData?.MRData?.StandingsTable?.StandingsLists?.[0]?.round || '?',
    });

  } catch (err) {
    // Fallback to static data
    console.warn('Ergast API failed, using static data:', err.message);

    const lastRaceStatic = {
      name: 'Chinese Grand Prix',
      date: 'March 23, 2026',
      circuit: 'Shanghai International Circuit',
    };

    res.status(200).json({
      source: 'static',
      lastUpdated: new Date().toISOString(),
      drivers: STATIC_DRIVERS,
      constructors: STATIC_CONSTRUCTORS,
      podium: [
        { pos: 1, driver: 'Kimi Antonelli',  team: 'Mercedes', teamId: 'mercedes',  time: '1:29:31.421', gap: '' },
        { pos: 2, driver: 'Charles Leclerc', team: 'Ferrari',  teamId: 'ferrari',   time: '+8.547s', gap: '+8.547s' },
        { pos: 3, driver: 'George Russell',  team: 'Mercedes', teamId: 'mercedes',  time: '+14.312s', gap: '+14.312s' },
      ],
      lastRace: lastRaceStatic,
      round: '2',
    });
  }
}
