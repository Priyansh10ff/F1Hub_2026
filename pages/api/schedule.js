// pages/api/schedule.js
// Fetches F1 2026 race calendar from Ergast API (free, no key needed)

const STATIC_CALENDAR = [
  { rnd: 1,  name: 'Australian GP',  circuit: 'Albert Park',           country: 'Australia',     flag: '🇦🇺', dates: 'Mar 14–16',  status: 'done',    winner: 'George Russell' },
  { rnd: 2,  name: 'Chinese GP',     circuit: 'Shanghai Intl Circuit', country: 'China',         flag: '🇨🇳', dates: 'Mar 21–23',  status: 'done',    winner: 'Kimi Antonelli' },
  { rnd: 3,  name: 'Japanese GP',    circuit: 'Suzuka Circuit',        country: 'Japan',         flag: '🇯🇵', dates: 'Mar 27–29',  status: 'next',    winner: null },
  { rnd: 4,  name: 'Bahrain GP',     circuit: 'Bahrain Intl Circuit',  country: 'Bahrain',       flag: '🇧🇭', dates: 'Apr 4–6',    status: 'cancelled', winner: null },
  { rnd: 5,  name: 'Saudi Arabian GP',circuit: 'Jeddah Corniche',     country: 'Saudi Arabia',  flag: '🇸🇦', dates: 'Apr 11–13',  status: 'cancelled', winner: null },
  { rnd: 6,  name: 'Miami GP',       circuit: 'Miami International',   country: 'USA',           flag: '🇺🇸', dates: 'May 2–4',    status: 'upcoming', winner: null },
  { rnd: 7,  name: 'Emilia Romagna GP',circuit: 'Autodromo Enzo Ferrari',country: 'Italy',      flag: '🇮🇹', dates: 'May 16–18',  status: 'upcoming', winner: null },
  { rnd: 8,  name: 'Monaco GP',      circuit: 'Circuit de Monaco',     country: 'Monaco',        flag: '🇲🇨', dates: 'May 23–25',  status: 'upcoming', winner: null },
  { rnd: 9,  name: 'Spanish GP',     circuit: 'Circuit de Catalunya',  country: 'Spain',         flag: '🇪🇸', dates: 'May 30–Jun 1',status: 'upcoming', winner: null },
  { rnd: 10, name: 'Canadian GP',    circuit: 'Circuit Gilles Villeneuve',country: 'Canada',     flag: '🇨🇦', dates: 'Jun 13–15',  status: 'upcoming', winner: null },
  { rnd: 11, name: 'Austrian GP',    circuit: 'Red Bull Ring',         country: 'Austria',       flag: '🇦🇹', dates: 'Jun 27–29',  status: 'upcoming', winner: null },
  { rnd: 12, name: 'British GP',     circuit: 'Silverstone Circuit',   country: 'UK',            flag: '🇬🇧', dates: 'Jul 4–6',    status: 'upcoming', winner: null },
  { rnd: 13, name: 'Belgian GP',     circuit: 'Circuit de Spa-Francorchamps', country: 'Belgium',flag: '🇧🇪', dates: 'Jul 25–27',  status: 'upcoming', winner: null },
  { rnd: 14, name: 'Hungarian GP',   circuit: 'Hungaroring',           country: 'Hungary',       flag: '🇭🇺', dates: 'Aug 1–3',    status: 'upcoming', winner: null },
  { rnd: 15, name: 'Dutch GP',       circuit: 'Circuit Zandvoort',     country: 'Netherlands',   flag: '🇳🇱', dates: 'Aug 29–31',  status: 'upcoming', winner: null },
  { rnd: 16, name: 'Italian GP',     circuit: 'Autodromo di Monza',    country: 'Italy',         flag: '🇮🇹', dates: 'Sep 5–7',    status: 'upcoming', winner: null },
  { rnd: 17, name: 'Azerbaijan GP',  circuit: 'Baku City Circuit',     country: 'Azerbaijan',    flag: '🇦🇿', dates: 'Sep 19–21',  status: 'upcoming', winner: null },
  { rnd: 18, name: 'Singapore GP',   circuit: 'Marina Bay Street Circuit',country: 'Singapore',  flag: '🇸🇬', dates: 'Oct 3–5',    status: 'upcoming', winner: null },
  { rnd: 19, name: 'United States GP',circuit: 'Circuit of the Americas',country: 'USA',         flag: '🇺🇸', dates: 'Oct 17–19',  status: 'upcoming', winner: null },
  { rnd: 20, name: 'Mexico City GP', circuit: 'Autodromo Hermanos Rodriguez',country: 'Mexico',   flag: '🇲🇽', dates: 'Oct 24–26',  status: 'upcoming', winner: null },
  { rnd: 21, name: 'São Paulo GP',   circuit: 'Autodromo José Carlos Pace',country: 'Brazil',    flag: '🇧🇷', dates: 'Nov 7–9',    status: 'upcoming', winner: null },
  { rnd: 22, name: 'Las Vegas GP',   circuit: 'Las Vegas Street Circuit',country: 'USA',          flag: '🇺🇸', dates: 'Nov 20–22',  status: 'upcoming', winner: null },
  { rnd: 23, name: 'Qatar GP',       circuit: 'Lusail International',  country: 'Qatar',         flag: '🇶🇦', dates: 'Nov 27–29',  status: 'upcoming', winner: null },
  { rnd: 24, name: 'Abu Dhabi GP',   circuit: 'Yas Marina Circuit',    country: 'UAE',           flag: '🇦🇪', dates: 'Dec 4–6',    status: 'upcoming', winner: null },
];

function parseErgastSchedule(races, results) {
  // Build a map of race results for winners
  const resultMap = {};
  results.forEach(r => {
    if (r.Results?.[0]) {
      const d = r.Results[0].Driver;
      resultMap[r.round] = `${d.givenName} ${d.familyName}`;
    }
  });

  const today = new Date();
  let foundNext = false;

  return races.map(race => {
    const raceDate = new Date(race.date);
    const roundNum = parseInt(race.round);
    const winner = resultMap[race.round] || null;

    let status;
    if (winner) {
      status = 'done';
    } else if (!foundNext && raceDate >= today) {
      status = 'next';
      foundNext = true;
    } else if (raceDate < today) {
      status = 'done';
    } else {
      status = 'upcoming';
    }

    return {
      rnd: roundNum,
      name: race.raceName,
      circuit: race.Circuit?.circuitName || '',
      country: race.Circuit?.Location?.country || '',
      flag: STATIC_CALENDAR.find(s => s.rnd === roundNum)?.flag || '🏁',
      dates: `${new Date(race.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`,
      status,
      winner,
    };
  });
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=7200');

  try {
    const [scheduleRes, resultsRes] = await Promise.all([
      fetch('https://ergast.com/api/f1/current.json', { signal: AbortSignal.timeout(8000) }),
      fetch('https://ergast.com/api/f1/current/results.json?limit=100', { signal: AbortSignal.timeout(8000) }),
    ]);

    if (!scheduleRes.ok) throw new Error(`Schedule fetch failed: ${scheduleRes.status}`);

    const scheduleData = await scheduleRes.json();
    const resultsData = resultsRes.ok ? await resultsRes.json() : { MRData: { RaceTable: { Races: [] } } };

    const races = scheduleData?.MRData?.RaceTable?.Races || [];
    const results = resultsData?.MRData?.RaceTable?.Races || [];

    if (races.length === 0) throw new Error('No races from Ergast');

    const calendar = parseErgastSchedule(races, results);

    res.status(200).json({
      source: 'ergast',
      lastUpdated: new Date().toISOString(),
      calendar,
      season: scheduleData?.MRData?.RaceTable?.season || '2026',
      totalRounds: races.length,
    });

  } catch (err) {
    console.warn('Ergast schedule failed, using static:', err.message);

    res.status(200).json({
      source: 'static',
      lastUpdated: new Date().toISOString(),
      calendar: STATIC_CALENDAR,
      season: '2026',
      totalRounds: STATIC_CALENDAR.length,
    });
  }
}
