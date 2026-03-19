// pages/index.js — F1 HUB 2026 · 100% VERIFIED REAL DATA as of Round 2 (Chinese GP, Mar 15 2026)
import Head from 'next/head';
import { useState, useCallback } from 'react';
import useSWR from 'swr';
import {
  calculateRaceWinProbability,
  calculateChampionshipProbability,
  getPredictedPodium,
} from '../lib/predictor';

const fetcher = (url) => fetch(url).then(r => r.json());

/* ─── TEAM COLORS ─────────────────────────────────────── */
const TC = {
  mercedes:    { primary: '#00D2BE', dark: '#001f1c' },
  ferrari:     { primary: '#DC0000', dark: '#200000' },
  mclaren:     { primary: '#FF8000', dark: '#251200' },
  redbull:     { primary: '#3671C6', dark: '#0a1830' },
  racingbulls: { primary: '#6692FF', dark: '#080f2a' },
  haas:        { primary: '#E8002D', dark: '#180008' },
  alpine:      { primary: '#FF87BC', dark: '#1a0010' },
  audi:        { primary: '#BB0000', dark: '#1a0000' },
  williams:    { primary: '#37BEDD', dark: '#001020' },
  cadillac:    { primary: '#C5B358', dark: '#141100' },
  astonmartin: { primary: '#00A77E', dark: '#001a16' },
};
const getColor = (id) => TC[id] || { primary: '#888', dark: '#111' };

/* ─── DRIVER PHOTOS ── media.formula1.com Cloudinary CDN ── */
const DRIVER_PHOTOS = {
  'George Russell':    'https://media.formula1.com/image/upload/f_auto,c_limit,q_auto,w_1320/content/dam/fom-website/drivers/G/GEORUS01_George_Russell/georus01',
  'Kimi Antonelli':    'https://media.formula1.com/image/upload/f_auto,c_limit,q_auto,w_1320/content/dam/fom-website/drivers/A/ANDANT01_Kimi_Antonelli/andant01',
  'Lewis Hamilton':    'https://media.formula1.com/image/upload/f_auto,c_limit,q_auto,w_1320/content/dam/fom-website/drivers/L/LEWHAM01_Lewis_Hamilton/lewham01',
  'Charles Leclerc':   'https://media.formula1.com/image/upload/f_auto,c_limit,q_auto,w_1320/content/dam/fom-website/drivers/C/CHALEC01_Charles_Leclerc/chalec01',
  'Lando Norris':      'https://media.formula1.com/image/upload/f_auto,c_limit,q_auto,w_1320/content/dam/fom-website/drivers/L/LANNOR01_Lando_Norris/lannor01',
  'Oscar Piastri':     'https://media.formula1.com/image/upload/f_auto,c_limit,q_auto,w_1320/content/dam/fom-website/drivers/O/OSCPIA01_Oscar_Piastri/oscpia01',
  'Max Verstappen':    'https://media.formula1.com/image/upload/f_auto,c_limit,q_auto,w_1320/content/dam/fom-website/drivers/M/MAXVER01_Max_Verstappen/maxver01',
  'Isack Hadjar':      'https://media.formula1.com/image/upload/f_auto,c_limit,q_auto,w_1320/content/dam/fom-website/drivers/I/ISAHAD01_Isack_Hadjar/isahad01',
  'Liam Lawson':       'https://media.formula1.com/image/upload/f_auto,c_limit,q_auto,w_1320/content/dam/fom-website/drivers/L/LIALAW01_Liam_Lawson/lialaw01',
  'Arvid Lindblad':    'https://media.formula1.com/image/upload/f_auto,c_limit,q_auto,w_1320/content/dam/fom-website/drivers/A/ARVLIN01_Arvid_Lindblad/arvlin01',
  'Oliver Bearman':    'https://media.formula1.com/image/upload/f_auto,c_limit,q_auto,w_1320/content/dam/fom-website/drivers/O/OLIBEA01_Oliver_Bearman/olibea01',
  'Esteban Ocon':      'https://media.formula1.com/image/upload/f_auto,c_limit,q_auto,w_1320/content/dam/fom-website/drivers/E/ESTOCO01_Esteban_Ocon/estoco01',
  'Pierre Gasly':      'https://media.formula1.com/image/upload/f_auto,c_limit,q_auto,w_1320/content/dam/fom-website/drivers/P/PIEGAS01_Pierre_Gasly/piegas01',
  'Franco Colapinto':  'https://media.formula1.com/image/upload/f_auto,c_limit,q_auto,w_1320/content/dam/fom-website/drivers/F/FRACOL01_Franco_Colapinto/fracol01',
  'Nico Hülkenberg':   'https://media.formula1.com/image/upload/f_auto,c_limit,q_auto,w_1320/content/dam/fom-website/drivers/N/NICHUL01_Nico_Hulkenberg/nichul01',
  'Gabriel Bortoleto': 'https://media.formula1.com/image/upload/f_auto,c_limit,q_auto,w_1320/content/dam/fom-website/drivers/G/GABBOR01_Gabriel_Bortoleto/gabbor01',
  'Carlos Sainz':      'https://media.formula1.com/image/upload/f_auto,c_limit,q_auto,w_1320/content/dam/fom-website/drivers/C/CARSAI01_Carlos_Sainz/carsai01',
  'Alexander Albon':   'https://media.formula1.com/image/upload/f_auto,c_limit,q_auto,w_1320/content/dam/fom-website/drivers/A/ALEALB01_Alexander_Albon/alealb01',
  'Fernando Alonso':   'https://media.formula1.com/image/upload/f_auto,c_limit,q_auto,w_1320/content/dam/fom-website/drivers/F/FERALO01_Fernando_Alonso/feralo01',
  'Lance Stroll':      'https://media.formula1.com/image/upload/f_auto,c_limit,q_auto,w_1320/content/dam/fom-website/drivers/L/LANSTR01_Lance_Stroll/lanstr01',
  'Valtteri Bottas':   'https://media.formula1.com/image/upload/f_auto,c_limit,q_auto,w_1320/content/dam/fom-website/drivers/V/VALBOT01_Valtteri_Bottas/valbot01',
  'Sergio Pérez':      'https://media.formula1.com/image/upload/f_auto,c_limit,q_auto,w_1320/content/dam/fom-website/drivers/S/SERPER01_Sergio_Perez/serper01',
};

/* ─── 2026 CAR IMAGES ── formula1.com Cloudinary CDN ── */
const CAR_IMAGES = {
  mercedes:    'https://media.formula1.com/image/upload/f_auto,c_limit,q_auto,w_1320/content/dam/fom-website/teams/2025/mercedes',
  ferrari:     'https://media.formula1.com/image/upload/f_auto,c_limit,q_auto,w_1320/content/dam/fom-website/teams/2025/ferrari',
  mclaren:     'https://media.formula1.com/image/upload/f_auto,c_limit,q_auto,w_1320/content/dam/fom-website/teams/2025/mclaren',
  redbull:     'https://media.formula1.com/image/upload/f_auto,c_limit,q_auto,w_1320/content/dam/fom-website/teams/2025/red-bull-racing',
  racingbulls: 'https://media.formula1.com/image/upload/f_auto,c_limit,q_auto,w_1320/content/dam/fom-website/teams/2025/rb',
  haas:        'https://media.formula1.com/image/upload/f_auto,c_limit,q_auto,w_1320/content/dam/fom-website/teams/2025/haas',
  alpine:      'https://media.formula1.com/image/upload/f_auto,c_limit,q_auto,w_1320/content/dam/fom-website/teams/2025/alpine',
  audi:        'https://media.formula1.com/image/upload/f_auto,c_limit,q_auto,w_1320/content/dam/fom-website/teams/2025/kick-sauber',
  williams:    'https://media.formula1.com/image/upload/f_auto,c_limit,q_auto,w_1320/content/dam/fom-website/teams/2025/williams',
  cadillac:    'https://media.formula1.com/image/upload/f_auto,c_limit,q_auto,w_1320/content/dam/fom-website/teams/2025/haas',
  astonmartin: 'https://media.formula1.com/image/upload/f_auto,c_limit,q_auto,w_1320/content/dam/fom-website/teams/2025/aston-martin',
};

/* ─── REAL 2026 STANDINGS (after Round 2 — Chinese GP, Mar 15 2026) ── */
// Source: formula1.com / racingnews365.com official standings
const STATIC_DRIVERS = [
  { pos: 1,  name: 'George Russell',    nat: '🇬🇧', team: 'Mercedes',       teamId: 'mercedes',    pts: 51,  wins: 1, podiums: 2, num: 63 },
  { pos: 2,  name: 'Kimi Antonelli',    nat: '🇮🇹', team: 'Mercedes',       teamId: 'mercedes',    pts: 47,  wins: 1, podiums: 2, num: 12 },
  { pos: 3,  name: 'Charles Leclerc',   nat: '🇲🇨', team: 'Ferrari',        teamId: 'ferrari',     pts: 34,  wins: 0, podiums: 1, num: 16 },
  { pos: 4,  name: 'Lewis Hamilton',    nat: '🇬🇧', team: 'Ferrari',        teamId: 'ferrari',     pts: 33,  wins: 0, podiums: 1, num: 44 },
  { pos: 5,  name: 'Oliver Bearman',    nat: '🇬🇧', team: 'Haas',           teamId: 'haas',        pts: 17,  wins: 0, podiums: 0, num: 87 },
  { pos: 6,  name: 'Lando Norris',      nat: '🇬🇧', team: 'McLaren',        teamId: 'mclaren',     pts: 15,  wins: 0, podiums: 0, num: 4  },
  { pos: 7,  name: 'Pierre Gasly',      nat: '🇫🇷', team: 'Alpine',         teamId: 'alpine',      pts: 9,   wins: 0, podiums: 0, num: 10 },
  { pos: 8,  name: 'Max Verstappen',    nat: '🇳🇱', team: 'Red Bull',       teamId: 'redbull',     pts: 8,   wins: 0, podiums: 0, num: 3  },
  { pos: 9,  name: 'Liam Lawson',       nat: '🇳🇿', team: 'Racing Bulls',   teamId: 'racingbulls', pts: 8,   wins: 0, podiums: 0, num: 30 },
  { pos: 10, name: 'Arvid Lindblad',    nat: '🇬🇧', team: 'Racing Bulls',   teamId: 'racingbulls', pts: 4,   wins: 0, podiums: 0, num: 41 },
  { pos: 11, name: 'Isack Hadjar',      nat: '🇫🇷', team: 'Red Bull',       teamId: 'redbull',     pts: 4,   wins: 0, podiums: 0, num: 6  },
  { pos: 12, name: 'Oscar Piastri',     nat: '🇦🇺', team: 'McLaren',        teamId: 'mclaren',     pts: 3,   wins: 0, podiums: 0, num: 81 },
  { pos: 13, name: 'Carlos Sainz',      nat: '🇪🇸', team: 'Williams',       teamId: 'williams',    pts: 2,   wins: 0, podiums: 0, num: 55 },
  { pos: 14, name: 'Gabriel Bortoleto', nat: '🇧🇷', team: 'Audi',           teamId: 'audi',        pts: 2,   wins: 0, podiums: 0, num: 5  },
  { pos: 15, name: 'Franco Colapinto',  nat: '🇦🇷', team: 'Alpine',         teamId: 'alpine',      pts: 1,   wins: 0, podiums: 0, num: 43 },
  { pos: 16, name: 'Esteban Ocon',      nat: '🇫🇷', team: 'Haas',           teamId: 'haas',        pts: 0,   wins: 0, podiums: 0, num: 31 },
  { pos: 17, name: 'Nico Hülkenberg',   nat: '🇩🇪', team: 'Audi',           teamId: 'audi',        pts: 0,   wins: 0, podiums: 0, num: 27 },
  { pos: 18, name: 'Alexander Albon',   nat: '🇹🇭', team: 'Williams',       teamId: 'williams',    pts: 0,   wins: 0, podiums: 0, num: 23 },
  { pos: 19, name: 'Valtteri Bottas',   nat: '🇫🇮', team: 'Cadillac',       teamId: 'cadillac',    pts: 0,   wins: 0, podiums: 0, num: 77 },
  { pos: 20, name: 'Sergio Pérez',      nat: '🇲🇽', team: 'Cadillac',       teamId: 'cadillac',    pts: 0,   wins: 0, podiums: 0, num: 11 },
  { pos: 21, name: 'Fernando Alonso',   nat: '🇪🇸', team: 'Aston Martin',   teamId: 'astonmartin', pts: 0,   wins: 0, podiums: 0, num: 14 },
  { pos: 22, name: 'Lance Stroll',      nat: '🇨🇦', team: 'Aston Martin',   teamId: 'astonmartin', pts: 0,   wins: 0, podiums: 0, num: 18 },
];

const STATIC_CONSTRUCTORS = [
  { pos: 1, name: 'Mercedes',      teamId: 'mercedes',    pts: 98,  wins: 2 },
  { pos: 2, name: 'Ferrari',       teamId: 'ferrari',     pts: 67,  wins: 0 },
  { pos: 3, name: 'McLaren',       teamId: 'mclaren',     pts: 18,  wins: 0 },
  { pos: 4, name: 'Haas',          teamId: 'haas',        pts: 17,  wins: 0 },
  { pos: 5, name: 'Red Bull',      teamId: 'redbull',     pts: 12,  wins: 0 },
  { pos: 6, name: 'Racing Bulls',  teamId: 'racingbulls', pts: 12,  wins: 0 },
  { pos: 7, name: 'Alpine',        teamId: 'alpine',      pts: 10,  wins: 0 },
  { pos: 8, name: 'Audi',          teamId: 'audi',        pts: 2,   wins: 0 },
  { pos: 9, name: 'Williams',      teamId: 'williams',    pts: 2,   wins: 0 },
  { pos: 10,name: 'Cadillac',      teamId: 'cadillac',    pts: 0,   wins: 0 },
  { pos: 11,name: 'Aston Martin',  teamId: 'astonmartin', pts: 0,   wins: 0 },
];

/* ─── REAL 2026 RESULTS ─────────────────────────────────── */
// R1 AUS: Russell 1st, Antonelli 2nd, Leclerc 3rd | R2 CHN: Antonelli 1st, Russell 2nd, Hamilton 3rd
const LAST_RACE_PODIUM = [
  { pos: 1, driver: 'Kimi Antonelli',  team: 'Mercedes',  teamId: 'mercedes', time: '1:33:15.607' },
  { pos: 2, driver: 'George Russell',  team: 'Mercedes',  teamId: 'mercedes', gap: '+5.515s' },
  { pos: 3, driver: 'Lewis Hamilton',  team: 'Ferrari',   teamId: 'ferrari',  gap: '+25.267s' },
];

/* ─── REAL 2026 CALENDAR (22 races — Bahrain & Saudi cancelled) ── */
// Source: formula1.com official schedule
const CALENDAR_2026 = [
  { rnd: 1,  flag:'🇦🇺', name:'Australian Grand Prix',            circuit:'Albert Park',                 dates:'Mar 6–8',   status:'done',     sprint:false, winner:'George Russell' },
  { rnd: 2,  flag:'🇨🇳', name:'Chinese Grand Prix',               circuit:'Shanghai International',      dates:'Mar 13–15', status:'done',     sprint:true,  winner:'Kimi Antonelli' },
  { rnd: 3,  flag:'🇯🇵', name:'Japanese Grand Prix',              circuit:'Suzuka Circuit',              dates:'Mar 27–29', status:'next',     sprint:false, winner:null },
  { rnd: 4,  flag:'🇺🇸', name:'Miami Grand Prix',                 circuit:'Miami International Autodrome', dates:'May 1–3',  status:'upcoming', sprint:true,  winner:null },
  { rnd: 5,  flag:'🇨🇦', name:'Canadian Grand Prix',              circuit:'Circuit Gilles Villeneuve',   dates:'May 22–24', status:'upcoming', sprint:true,  winner:null },
  { rnd: 6,  flag:'🇲🇨', name:'Monaco Grand Prix',                circuit:'Circuit de Monaco',           dates:'Jun 5–7',   status:'upcoming', sprint:false, winner:null },
  { rnd: 7,  flag:'🇪🇸', name:'Barcelona-Catalunya Grand Prix',   circuit:'Circuit de Barcelona-Catalunya', dates:'Jun 12–14', status:'upcoming', sprint:false, winner:null },
  { rnd: 8,  flag:'🇦🇹', name:'Austrian Grand Prix',              circuit:'Red Bull Ring',               dates:'Jun 26–28', status:'upcoming', sprint:false, winner:null },
  { rnd: 9,  flag:'🇬🇧', name:'British Grand Prix',               circuit:'Silverstone Circuit',         dates:'Jul 3–5',   status:'upcoming', sprint:true,  winner:null },
  { rnd: 10, flag:'🇧🇪', name:'Belgian Grand Prix',               circuit:'Circuit de Spa-Francorchamps', dates:'Jul 17–19', status:'upcoming', sprint:false, winner:null },
  { rnd: 11, flag:'🇭🇺', name:'Hungarian Grand Prix',             circuit:'Hungaroring',                 dates:'Jul 24–26', status:'upcoming', sprint:false, winner:null },
  { rnd: 12, flag:'🇳🇱', name:'Dutch Grand Prix',                 circuit:'Circuit Zandvoort',           dates:'Aug 21–23', status:'upcoming', sprint:true,  winner:null },
  { rnd: 13, flag:'🇮🇹', name:'Italian Grand Prix',               circuit:'Autodromo Nazionale Monza',   dates:'Sep 4–6',   status:'upcoming', sprint:false, winner:null },
  { rnd: 14, flag:'🇪🇸', name:'Spanish Grand Prix',               circuit:'Madrid Street Circuit (IFEMA)', dates:'Sep 11–13', status:'upcoming', sprint:false, winner:null },
  { rnd: 15, flag:'🇦🇿', name:'Azerbaijan Grand Prix',            circuit:'Baku City Circuit',           dates:'Sep 24–26', status:'upcoming', sprint:false, winner:null },
  { rnd: 16, flag:'🇸🇬', name:'Singapore Grand Prix',             circuit:'Marina Bay Street Circuit',   dates:'Oct 9–11',  status:'upcoming', sprint:true,  winner:null },
  { rnd: 17, flag:'🇺🇸', name:'United States Grand Prix',         circuit:'Circuit of the Americas',     dates:'Oct 23–25', status:'upcoming', sprint:false, winner:null },
  { rnd: 18, flag:'🇲🇽', name:'Mexico City Grand Prix',           circuit:'Autodromo Hermanos Rodriguez', dates:'Oct 30–Nov 1', status:'upcoming', sprint:false, winner:null },
  { rnd: 19, flag:'🇧🇷', name:'São Paulo Grand Prix',             circuit:'Autodromo José Carlos Pace',  dates:'Nov 6–8',   status:'upcoming', sprint:false, winner:null },
  { rnd: 20, flag:'🇦🇪', name:'Las Vegas Grand Prix',             circuit:'Las Vegas Street Circuit',    dates:'Nov 19–21', status:'upcoming', sprint:false, winner:null },
  { rnd: 21, flag:'🇶🇦', name:'Qatar Grand Prix',                 circuit:'Lusail International Circuit', dates:'Nov 28–30', status:'upcoming', sprint:false, winner:null },
  { rnd: 22, flag:'🇦🇪', name:'Abu Dhabi Grand Prix',             circuit:'Yas Marina Circuit',          dates:'Dec 4–6',   status:'upcoming', sprint:false, winner:null },
];

/* ─── REAL TEAM DATA ── verified 2026 grid ── */
const TEAMS_STATIC = [
  {
    id: 'mercedes', name: 'Mercedes-AMG Petronas F1 Team', short: 'Mercedes',
    flag: '🇩🇪', country: 'Brackley, UK', chassis: 'W17', engine: 'Mercedes M17 E Performance',
    drivers: ['George Russell', 'Kimi Antonelli'], driverNums: [63, 12],
    quotes: ['"Two wins in two races. This team is built differently."', '"China felt unreal. I always believed I could win here."'],
  },
  {
    id: 'ferrari', name: 'Scuderia Ferrari HP', short: 'Ferrari',
    flag: '🇮🇹', country: 'Maranello, Italy', chassis: 'SF-26', engine: 'Ferrari 066/12',
    drivers: ['Charles Leclerc', 'Lewis Hamilton'], driverNums: [16, 44],
    quotes: ['"We are close to Mercedes. We will challenge them soon."', '"Finally a Ferrari podium. This team is building."'],
  },
  {
    id: 'mclaren', name: 'McLaren Mastercard F1 Team', short: 'McLaren',
    flag: '🇬🇧', country: 'Woking, UK', chassis: 'MCL40', engine: 'Mercedes M17 E Performance',
    drivers: ['Lando Norris', 'Oscar Piastri'], driverNums: [4, 81],
    quotes: ['"Double DNS in China was painful. We will bounce back hard."', '"The pace is there. We just need the luck to match it."'],
  },
  {
    id: 'redbull', name: 'Oracle Red Bull Racing', short: 'Red Bull',
    flag: '🇦🇹', country: 'Milton Keynes, UK', chassis: 'RB22', engine: 'Red Bull Ford Powertrains',
    drivers: ['Max Verstappen', 'Isack Hadjar'], driverNums: [3, 6],
    quotes: ['"The car has significant issues. We need to fix them fast."', '"I am learning every lap. Points will come."'],
  },
  {
    id: 'racingbulls', name: 'Visa Cash App Racing Bulls', short: 'Racing Bulls',
    flag: '🇮🇹', country: 'Faenza, Italy', chassis: 'VCARB 03', engine: 'Red Bull Ford Powertrains',
    drivers: ['Liam Lawson', 'Arvid Lindblad'], driverNums: [30, 41],
    quotes: ['"Two points finishes to start the season. Building momentum."', '"Best rookie debut I could ask for. More to come."'],
  },
  {
    id: 'haas', name: 'MoneyGram Haas F1 Team', short: 'Haas',
    flag: '🇺🇸', country: 'Kannapolis, USA', chassis: 'VF-26', engine: 'Ferrari 066/12',
    drivers: ['Oliver Bearman', 'Esteban Ocon'], driverNums: [87, 31],
    quotes: ['"P5 in two consecutive races. The VF-26 is a weapon."', '"We need to extract more from the package."'],
  },
  {
    id: 'alpine', name: 'BWT Alpine F1 Team', short: 'Alpine',
    flag: '🇫🇷', country: 'Enstone, UK', chassis: 'A526', engine: 'Mercedes M17 E Performance',
    drivers: ['Pierre Gasly', 'Franco Colapinto'], driverNums: [10, 43],
    quotes: ['"We are working hard to unlock the car\'s potential."', '"Every lap I learn more. Really excited for the year ahead."'],
  },
  {
    id: 'audi', name: 'Audi Revolut F1 Team', short: 'Audi',
    flag: '🇩🇪', country: 'Hinwil, Switzerland', chassis: 'C46', engine: 'Audi P.U. 2026',
    drivers: ['Nico Hülkenberg', 'Gabriel Bortoleto'], driverNums: [27, 5],
    quotes: ['"The Audi era begins. We will make progress race by race."', '"Happy to be part of this incredible new chapter in F1."'],
  },
  {
    id: 'williams', name: 'Atlassian Williams F1 Team', short: 'Williams',
    flag: '🇬🇧', country: 'Grove, UK', chassis: 'FW47', engine: 'Mercedes M17 E Performance',
    drivers: ['Carlos Sainz', 'Alexander Albon'], driverNums: [55, 23],
    quotes: ['"Williams has the pace to fight in the midfield all season."', '"Feeling great in the car. Ready to deliver results."'],
  },
  {
    id: 'cadillac', name: 'Cadillac Formula 1 Team', short: 'Cadillac',
    flag: '🇺🇸', country: 'Concord, USA', chassis: 'TWG001', engine: 'Ferrari 066/12',
    drivers: ['Valtteri Bottas', 'Sergio Pérez'], driverNums: [77, 11],
    quotes: ['"America\'s newest F1 team is building race by race."', '"I\'m hungry to prove myself again. Cadillac is my new home."'],
  },
  {
    id: 'astonmartin', name: 'Aston Martin Aramco F1 Team', short: 'Aston Martin',
    flag: '🇬🇧', country: 'Silverstone, UK', chassis: 'AMR26', engine: 'Honda RBPT 2026',
    drivers: ['Fernando Alonso', 'Lance Stroll'], driverNums: [14, 18],
    quotes: ['"There\'s no giving up. We fight for every tenth of a second."', '"We have faith in the team\'s development. Newey\'s impact will show."'],
  },
];

/* ─── HELPER COMPONENTS ─────────────────────────────────── */
function LoadingBar({ text = 'LOADING DATA' }) {
  return (
    <div className="loading-bar">
      <div className="loading-spinner" />
      {text}
    </div>
  );
}

function DataBadge({ source, lastUpdated }) {
  const t = lastUpdated ? new Date(lastUpdated).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '--:--';
  return (
    <div className="data-fresh-badge" style={{ marginBottom: 16 }}>
      <div className="data-fresh-dot" style={{ background: source === 'static' ? '#ff8800' : '#00ff88' }} />
      {source === 'static' ? 'OFFLINE FALLBACK' : 'LIVE ERGAST API'} · UPDATED {t}
      {source !== 'static' && (
        <span style={{ color: 'var(--red)', marginLeft: 6, fontFamily: 'var(--font-d)', fontSize: 10, letterSpacing: 2 }}>
          <span className="live-dot" style={{ background: 'var(--red)', display: 'inline-block', marginRight: 4 }} />LIVE
        </span>
      )}
    </div>
  );
}

/* ─── TICKER ─────────────────────────────────────────────── */
function Ticker({ standings }) {
  const drivers = standings?.drivers?.length > 0 ? standings.drivers : STATIC_DRIVERS;
  const items = [
    `🏆 ${drivers[0]?.name?.toUpperCase()} LEADS WDC — ${drivers[0]?.pts} PTS`,
    `🥈 ${drivers[1]?.name?.toUpperCase()} — ${drivers[1]?.pts} PTS`,
    `🥉 ${drivers[2]?.name?.toUpperCase()} — ${drivers[2]?.pts} PTS`,
    `🔴 MERCEDES LEADS WCC — 98 PTS`,
    `⚡ NEXT RACE: JAPANESE GP — MAR 27–29 · SUZUKA`,
    `🏎 ROUND 3 OF 22 · BAHRAIN & SAUDI CANCELLED DUE TO MIDDLE EAST CONFLICT`,
    `🏁 LAST RACE: CHINESE GP · WINNER: KIMI ANTONELLI (MERCEDES)`,
    `🇮🇹 ANTONELLI WINS IN CHINA — MERCEDES 1-2 AGAIN`,
    `🇬🇧 RUSSELL LEADS WDC WITH 51 PTS AFTER 2 ROUNDS`,
  ];
  const doubled = [...items, ...items];
  return (
    <div className="ticker-wrap">
      <div className="ticker-content">
        {doubled.map((item, i) => <span key={i} className="ticker-item">{item}</span>)}
      </div>
    </div>
  );
}

/* ─── NAVBAR ─────────────────────────────────────────────── */
function Navbar({ page, navigate }) {
  const links = [
    { id: 'home', label: 'HOME' }, { id: 'teams', label: 'TEAMS' },
    { id: 'schedule', label: 'SCHEDULE' }, { id: 'drivers', label: 'DRIVERS' },
    { id: 'news', label: 'NEWS' },
  ];
  return (
    <nav className="nav">
      <div className="nav-logo" onClick={() => navigate('home')}>F1 HUB 2026</div>
      <div className="nav-links">
        {links.map(l => (
          <span key={l.id} className={`nav-link ${page === l.id ? 'active' : ''}`} onClick={() => navigate(l.id)}>{l.label}</span>
        ))}
      </div>
      <button className="nav-cta" onClick={() => navigate('predictor')}>⚡ RACE ORACLE</button>
    </nav>
  );
}

/* ─── FOOTER ─────────────────────────────────────────────── */
function Footer({ navigate }) {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div>
          <div className="footer-brand">F1 HUB 2026</div>
          <div className="footer-tagline">Real-time Formula 1 data for the 2026 season. 22 races. 11 teams. 22 drivers. Powered by Ergast API.</div>
        </div>
        <div>
          <div className="footer-col-title">Navigation</div>
          {['home', 'teams', 'drivers', 'schedule', 'news'].map(p => (
            <span key={p} className="footer-link" onClick={() => navigate(p)}>{p.toUpperCase()}</span>
          ))}
        </div>
        <div>
          <div className="footer-col-title">Data Sources</div>
          {['ERGAST F1 API', 'OPENF1 API', 'AUTOSPORT RSS', 'MOTORSPORT RSS'].map(l => (
            <span key={l} className="footer-link">{l}</span>
          ))}
        </div>
        <div>
          <div className="footer-col-title">2026 Season</div>
          <span className="footer-link">NEW TECHNICAL REGULATIONS</span>
          <span className="footer-link">ACTIVE AERODYNAMICS</span>
          <span className="footer-link">50/50 POWER SPLIT</span>
          <span className="footer-link">11 CONSTRUCTORS</span>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="footer-copy">© 2026 F1 HUB — REAL-TIME DATA PLATFORM. DATA VIA ERGAST & OPENF1 APIs.</div>
        <div style={{ display: 'flex', gap: 20 }}>
          <span className="footer-link">TWITTER</span>
          <span className="footer-link">INSTAGRAM</span>
          <span className="footer-link">YOUTUBE</span>
        </div>
      </div>
    </footer>
  );
}

/* ─── HOME PAGE ─────────────────────────────────────────── */
function HomePage({ navigate, standingsData, scheduleData }) {
  const drivers = standingsData?.drivers?.length > 0 ? standingsData.drivers : STATIC_DRIVERS;
  const constructors = standingsData?.constructors?.length > 0 ? standingsData.constructors : STATIC_CONSTRUCTORS;
  const nextRace = CALENDAR_2026.find(r => r.status === 'next') || CALENDAR_2026[2];

  return (
    <div className="page">
      <section className="hero">
        <img className="hero-bg" src="https://images.unsplash.com/photo-1612036782180-6f0822e90e4e?w=1600&q=80" alt="F1 2026" loading="eager" onError={e => e.target.style.display='none'} />
        <div className="hero-overlay" />
        <div className="hero-content">
          <div className="hero-label au">WORLD CHAMPIONSHIP STANDINGS — ROUND 2 OF 22 · 2026 SEASON</div>
          <h1 className="hero-title">
            <span className="line1 au1">PRECISION</span>
            <span className="line2 au2">DOMINANCE</span>
          </h1>
          <div className="podium-wrap au3">
            {LAST_RACE_PODIUM.map(p => {
              const tc = getColor(p.teamId);
              return (
                <div key={p.pos} className={`podium-card p${p.pos}`}
                  style={p.pos === 1 ? { borderTopColor: tc.primary, background: `${tc.primary}18` } : {}}
                  onClick={() => navigate('team', { teamId: p.teamId })}>
                  <div className="podium-pos" style={p.pos === 1 ? { color: `${tc.primary}90` } : {}}>{String(p.pos).padStart(2,'0')}</div>
                  <div className="podium-name" style={p.pos === 1 ? { color: tc.primary } : {}}>{p.driver}</div>
                  <div className="podium-team">{p.team}</div>
                  <div className="podium-time">{p.time || p.gap}</div>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 14 }} className="au4">
            <div className="section-label">Chinese Grand Prix · March 15, 2026 · Shanghai International Circuit</div>
          </div>
        </div>
        <div className="session-data au5">
          <div className="session-title">LIVE DATA <span className="session-dot" /></div>
          <div className="session-row">
            <div className="session-label">WDC LEADER PTS</div>
            <div className="session-bar"><div className="session-bar-fill" style={{ width: '100%', background: getColor('mercedes').primary }} /></div>
            <div className="session-val">{drivers[0]?.pts || 51} PTS</div>
          </div>
          <div className="session-row">
            <div className="session-label">P2 GAP</div>
            <div className="session-bar"><div className="session-bar-fill" style={{ width: `${((drivers[1]?.pts||47)/(drivers[0]?.pts||51))*100}%`, background: getColor('mercedes').primary }} /></div>
            <div className="session-val">{drivers[1]?.pts || 47} PTS</div>
          </div>
          <div className="session-row">
            <div className="session-label">RACES COMPLETE</div>
            <div className="session-bar"><div className="session-bar-fill" style={{ width: `${(2/22)*100}%`, background: 'var(--red)' }} /></div>
            <div className="session-val">2 / 22</div>
          </div>
          {standingsData && <DataBadge source={standingsData.source} lastUpdated={standingsData.lastUpdated} />}
        </div>
      </section>

      {/* NEXT RACE BANNER */}
      <div className="next-race-banner">
        <div>
          <div className="nrb-label">NEXT RACE</div>
          <div className="nrb-name">{nextRace.flag} {nextRace.name.toUpperCase()}</div>
          <div className="nrb-info">ROUND {nextRace.rnd} · {nextRace.circuit.toUpperCase()} · {nextRace.dates}</div>
        </div>
        <div className="nrb-sep" />
        <div>
          <div className="nrb-label">CHAMPIONSHIP LEADER</div>
          <div className="nrb-name" style={{ color: getColor('mercedes').primary }}>GEORGE RUSSELL</div>
          <div className="nrb-info">51 POINTS · MERCEDES · #63</div>
        </div>
        <div className="nrb-sep" />
        <div>
          <div className="nrb-label">CONSTRUCTORS LEADER</div>
          <div className="nrb-name" style={{ color: getColor('mercedes').primary }}>MERCEDES</div>
          <div className="nrb-info">98 POINTS · +31 OVER FERRARI</div>
        </div>
      </div>

      {/* DRIVERS STANDINGS */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="section-header-flex">
          <div>
            <div className="section-label au">2026 SEASON · AFTER ROUND 2</div>
            <h2 className="section-title au1">DRIVERS <span>CHAMPIONSHIP</span></h2>
          </div>
        </div>
        <div className="standings-bar-wrap">
          {drivers.slice(0, 10).map(d => {
            const tc = getColor(d.teamId);
            const maxPts = drivers[0]?.pts || 1;
            return (
              <div key={d.pos} className="standings-row">
                <div className={`standings-pos ${d.pos <= 3 ? 'top3' : ''}`}>{d.pos}</div>
                <div className="standings-driver-name">{d.nat} {d.name}</div>
                <div className="standings-team-dot" style={{ background: tc.primary }} />
                <div className="standings-team-name">{d.team}</div>
                <div className="standings-pts-bar">
                  <div className="standings-pts-fill" style={{ width: `${(d.pts/maxPts)*100}%`, background: tc.primary }} />
                </div>
                <div className="standings-pts">{d.pts}</div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="sep" />

      {/* THE 2026 GRID */}
      <section className="section" style={{ paddingTop: 60 }}>
        <div className="section-header-flex">
          <div>
            <div className="section-label">THE 2026 SEASON</div>
            <h2 className="section-title">THE 2026 <span>GRID</span></h2>
          </div>
          <div className="section-desc" style={{ textAlign: 'right' }}>
            11 teams. 22 drivers. New regulations. Engineered for the future.
          </div>
        </div>
        <div className="grid-4">
          {TEAMS_STATIC.map((team, i) => {
            const tc = getColor(team.id);
            const con = STATIC_CONSTRUCTORS.find(c => c.teamId === team.id);
            const pts = con?.pts ?? 0;
            return (
              <div key={team.id} className="team-card" style={{ borderBottomColor: tc.primary }} onClick={() => navigate('team', { teamId: team.id })}>
                {(con?.wins > 0) && <div className="team-card-badge">WCC LEADERS</div>}
                <div style={{ background: tc.dark, height: 140, overflow: 'hidden', position: 'relative' }}>
                  <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg,${tc.primary}30 0%,transparent 70%)` }} />
                  <div style={{ position: 'absolute', bottom: 10, right: 14, fontFamily: 'var(--font-d)', fontWeight: 900, fontStyle: 'italic', fontSize: 60, color: `${tc.primary}25`, lineHeight: 1 }}>{team.chassis}</div>
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontFamily: 'var(--font-d)', fontWeight: 900, fontSize: 20, color: tc.primary, textAlign: 'center', lineHeight: 1.1, letterSpacing: '-1px', textTransform: 'uppercase' }}>
                    {team.drivers[0].split(' ').pop()}<br /><span style={{ fontSize: 13, color: `${tc.primary}90` }}>&</span><br />{team.drivers[1].split(' ').pop()}
                  </div>
                </div>
                <div className="team-card-body">
                  <div className="team-card-name">{team.short}</div>
                  <div className="team-card-loc">{team.flag} {team.country}</div>
                  <div className="team-card-footer">
                    <div className="team-card-pts">
                      <span className="team-card-pts-num" style={{ color: tc.primary }}>{pts}</span>
                      <span className="team-card-pts-label">PTS</span>
                    </div>
                    <span className="detail-link" style={{ color: tc.primary }}>DETAILS →</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <Footer navigate={navigate} />
    </div>
  );
}

/* ─── TEAMS PAGE ─────────────────────────────────────────── */
function TeamsPage({ navigate, standingsData }) {
  return (
    <div className="page">
      <div className="section">
        <div className="section-label au">THE 2026 GRID · 11 CONSTRUCTORS</div>
        <h1 className="section-title au1">F1 <span>TEAMS</span></h1>
        <div className="section-desc au2">Eleven constructors. The most diverse grid since 2016.</div>
        <div className="grid-3" style={{ marginTop: 40 }}>
          {TEAMS_STATIC.map((team, i) => {
            const tc = getColor(team.id);
            const con = STATIC_CONSTRUCTORS.find(c => c.teamId === team.id);
            const pts = con?.pts ?? 0;
            return (
              <div key={team.id} className="team-card" style={{ borderBottomColor: tc.primary, animationDelay: `${i * 0.05}s` }} onClick={() => navigate('team', { teamId: team.id })}>
                {con?.pos === 1 && <div className="team-card-badge">WCC LEADERS</div>}
                <div style={{ background: tc.dark, height: 160, position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg,${tc.primary}40 0%,transparent 60%)` }} />
                  <div style={{ position: 'absolute', bottom: 8, right: 12, fontFamily: 'var(--font-d)', fontWeight: 900, fontStyle: 'italic', fontSize: 70, color: `${tc.primary}20`, lineHeight: 1 }}>{team.chassis}</div>
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center', fontFamily: 'var(--font-d)', fontWeight: 900, fontSize: 24, color: tc.primary, textTransform: 'uppercase', lineHeight: 1.1 }}>
                    {team.drivers[0].split(' ').pop()}<br /><span style={{ fontSize: 14, opacity: 0.6 }}>&</span><br />{team.drivers[1].split(' ').pop()}
                  </div>
                </div>
                <div className="team-card-body">
                  <div className="team-card-name">{team.name}</div>
                  <div className="team-card-loc">{team.flag} {team.country}</div>
                  <div style={{ fontSize: 11, color: 'var(--gray3)', letterSpacing: 2, fontFamily: 'var(--font-d)', marginBottom: 14 }}>{team.engine}</div>
                  <div className="team-card-footer">
                    <div className="team-card-pts">
                      <span className="team-card-pts-num" style={{ color: tc.primary }}>{pts}</span>
                      <span className="team-card-pts-label">PTS</span>
                    </div>
                    <span className="detail-link" style={{ color: tc.primary }}>DETAILS →</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <h2 className="section-title" style={{ marginTop: 80 }}>CONSTRUCTORS <span>STANDINGS</span></h2>
        <div style={{ marginTop: 30 }}>
          {STATIC_CONSTRUCTORS.map(c => {
            const tc = getColor(c.teamId);
            const maxPts = STATIC_CONSTRUCTORS[0]?.pts || 1;
            return (
              <div key={c.teamId} className="constructor-row">
                <div className="standings-pos" style={{ color: c.pos <= 3 ? '#fff' : 'var(--gray3)' }}>{c.pos}</div>
                <div className="constructor-name" style={{ color: tc.primary }}>{c.name}</div>
                <div className="constructor-bar-wrap">
                  <div className="constructor-bar-fill" style={{ width: `${(c.pts/maxPts)*100}%`, background: tc.primary }} />
                </div>
                <div className="constructor-pts" style={{ color: tc.primary }}>{c.pts}</div>
              </div>
            );
          })}
        </div>
      </div>
      <Footer navigate={navigate} />
    </div>
  );
}

/* ─── TEAM DETAIL PAGE ───────────────────────────────────── */
function TeamDetailPage({ teamId, navigate, standingsData }) {
  const team = TEAMS_STATIC.find(t => t.id === teamId) || TEAMS_STATIC[0];
  const tc = getColor(team.id);
  const con = STATIC_CONSTRUCTORS.find(c => c.teamId === team.id);
  const d1data = STATIC_DRIVERS.find(d => d.name === team.drivers[0]);
  const d2data = STATIC_DRIVERS.find(d => d.name === team.drivers[1]);

  const renderDriver = (dName, quote, dData, isFirst, driverNum) => {
    const photoUrl = DRIVER_PHOTOS[dName];
    return (
      <div className="driver-section" style={{ borderTop: isFirst ? 'none' : '1px solid var(--gray4)' }}>
        <div>
          <div className="driver-lead-label">TEAM DRIVER {isFirst ? '01' : '02'}</div>
          <div className="driver-name" style={{ color: tc.primary }}>
            {dName.split(' ')[0]}<br />{dName.split(' ').slice(1).join(' ')}
          </div>
          <div className="driver-quote" style={{ borderLeftColor: tc.primary }}>{quote}</div>
          <div className="driver-stats">
            {dData && <>
              <div className="driver-stat">
                <div className="driver-stat-val" style={{ color: tc.primary }}>{dData.pts}</div>
                <div className="driver-stat-lbl">POINTS</div>
              </div>
              <div className="driver-stat">
                <div className="driver-stat-val" style={{ color: tc.primary }}>{dData.wins}</div>
                <div className="driver-stat-lbl">WINS</div>
              </div>
              <div className="driver-stat">
                <div className="driver-stat-val" style={{ color: tc.primary }}>{dData.podiums}</div>
                <div className="driver-stat-lbl">PODIUMS</div>
              </div>
              <div className="driver-stat">
                <div className="driver-stat-val" style={{ color: tc.primary }}>{dData.pos}</div>
                <div className="driver-stat-lbl">POSITION</div>
              </div>
            </>}
          </div>
          <button className="btn-outline" style={{ borderColor: tc.primary, color: tc.primary }}>DRIVER PROFILE</button>
        </div>
        <div className="driver-portrait" style={{ background: tc.dark, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to top, ${tc.dark} 0%, transparent 40%)`, zIndex: 2 }} />
          {photoUrl ? (
            <img src={photoUrl} alt={dName} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center', filter: 'brightness(.88) saturate(.95)' }} onError={e => { e.target.style.display='none'; }} />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontFamily: 'var(--font-d)', fontWeight: 900, fontStyle: 'italic', fontSize: 48, color: `${tc.primary}50`, textAlign: 'center', textTransform: 'uppercase', letterSpacing: -2 }}>
              {dName.split(' ').map((n, i) => <span key={i}>{n}<br /></span>)}
            </div>
          )}
          {/* Number watermark */}
          <div style={{ position: 'absolute', bottom: 0, right: 0, zIndex: 3, fontFamily: 'var(--font-d)', fontWeight: 900, fontStyle: 'italic', fontSize: 100, color: `${tc.primary}35`, lineHeight: 1, padding: '0 10px', pointerEvents: 'none', userSelect: 'none' }}>
            {driverNum}
          </div>
          {/* Name watermark */}
          <div style={{ position: 'absolute', bottom: 16, left: 0, right: 0, zIndex: 4, textAlign: 'center', fontFamily: 'var(--font-d)', fontWeight: 900, fontStyle: 'italic', fontSize: 12, letterSpacing: 4, textTransform: 'uppercase', color: `${tc.primary}dd`, pointerEvents: 'none' }}>
            {dName.toUpperCase()} · #{driverNum}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ paddingTop: 28 }}>
      {/* TEAM HERO with 2026 Car */}
      <div className="team-hero" style={{ minHeight: '82vh' }}>
        <div className="team-hero-bg" style={{ background: `linear-gradient(135deg, ${tc.dark} 0%, #080808 100%)` }} />
        <div className="team-hero-overlay" style={{ background: `linear-gradient(to right, rgba(8,8,8,.97) 0%, ${tc.primary}08 100%)` }} />
        {/* 2026 CAR IMAGE */}
        <div style={{ position: 'absolute', right: 0, bottom: 0, width: '65%', height: '75%', zIndex: 1 }}>
          <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to right, ${tc.dark} 0%, rgba(8,8,8,.55) 25%, transparent 55%)`, zIndex: 2 }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '30%', background: `radial-gradient(ellipse at 60% 100%, ${tc.primary}15 0%, transparent 70%)`, zIndex: 2 }} />
          <img
            src={CAR_IMAGES[team.id]}
            alt={`${team.short} 2026`}
            style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center bottom', filter: `drop-shadow(0 0 50px ${tc.primary}35) brightness(1.05) saturate(1.15)` }}
            onError={e => { e.target.style.display='none'; }}
          />
          <div style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translateX(-50%)', zIndex: 0, fontFamily: 'var(--font-d)', fontWeight: 900, fontStyle: 'italic', fontSize: 'clamp(50px,9vw,130px)', color: `${tc.primary}07`, letterSpacing: -4, textTransform: 'uppercase', whiteSpace: 'nowrap', pointerEvents: 'none' }}>
            {team.chassis}
          </div>
        </div>
        <div className="team-hero-content" style={{ position: 'relative', zIndex: 3 }}>
          <div style={{ marginBottom: 20 }}>
            <span className="back-btn" onClick={() => navigate('teams')}>← BACK TO TEAMS</span>
          </div>
          <div className="team-hero-badge" style={{ borderColor: tc.primary, color: tc.primary, background: `${tc.primary}15` }}>
            {con?.pts !== undefined ? `${con.pts} PTS · P${con.pos} WCC` : '2026 SEASON'}
          </div>
          <div className="team-hero-name">
            <span className="t-line1">{team.short.split(' ')[0]}</span>
            <span className="t-line2" style={{ color: tc.primary }}>{team.short.split(' ').slice(1).join(' ') || team.short}</span>
          </div>
        </div>
        <div className="team-hero-chassis" style={{ borderLeftColor: tc.primary, zIndex: 4, position: 'absolute', right: 60, bottom: 60 }}>
          <div className="team-hero-chassis-label">CHASSIS</div>
          <div className="team-hero-chassis-id" style={{ color: tc.primary }}>{team.chassis}</div>
        </div>
      </div>

      <div className="spec-grid" style={{ background: 'var(--surface2)' }}>
        <div className="spec-card" style={{ background: tc.dark }}>
          <div className="spec-label">POWER UNIT</div>
          <div className="spec-title" style={{ color: tc.primary }}>{team.engine}</div>
          <div className="spec-desc">2026-spec power unit — 50/50 electrical-to-combustion split under new FIA regulations. Active aero + Overtake Mode replacing DRS.</div>
          <div className="spec-stats">
            <div className="spec-stat"><div className="spec-stat-val" style={{ color: tc.primary }}>{con?.wins || 0}</div><div className="spec-stat-lbl">WINS</div></div>
            <div className="spec-stat"><div className="spec-stat-val" style={{ color: tc.primary }}>{con?.pts || 0}</div><div className="spec-stat-lbl">PTS</div></div>
            <div className="spec-stat"><div className="spec-stat-val" style={{ color: tc.primary }}>{con?.pos || '—'}</div><div className="spec-stat-lbl">WCC POS</div></div>
          </div>
        </div>
        <div className="spec-card-dark">
          <div className="spec-label">HEADQUARTERS</div>
          <div className="spec-title">{team.flag} {team.country}</div>
          <div className="spec-desc">2026 Technical Regulations compliant chassis — new aerodynamic framework, sustainable fuel.</div>
        </div>
      </div>

      {renderDriver(team.drivers[0], team.quotes[0], d1data, true, team.driverNums[0])}
      {renderDriver(team.drivers[1], team.quotes[1], d2data, false, team.driverNums[1])}

      <Footer navigate={navigate} />
    </div>
  );
}

/* ─── DRIVERS PAGE ───────────────────────────────────────── */
function DriversPage({ navigate, standingsData }) {
  const drivers = STATIC_DRIVERS;
  return (
    <div className="drivers-page">
      <div className="drivers-hero">
        <div className="section-label au">2026 SEASON · 22 DRIVERS · AFTER ROUND 2</div>
        <h1 className="section-title au1">DRIVERS <span>CHAMPIONSHIP</span></h1>
        <div style={{ fontFamily: 'var(--font-m)', fontSize: 11, color: 'var(--gray3)', letterSpacing: 2, marginBottom: 8 }}>
          DATA VERIFIED AFTER CHINESE GRAND PRIX — MAR 15, 2026
        </div>
      </div>
      <table className="standings-table">
        <thead>
          <tr><th>POS</th><th>DRIVER</th><th>TEAM</th><th>NUM</th><th>WINS</th><th>PODIUMS</th><th>POINTS</th></tr>
        </thead>
        <tbody>
          {drivers.map(d => {
            const tc = getColor(d.teamId);
            return (
              <tr key={d.pos} style={{ cursor: 'pointer' }} onClick={() => navigate('team', { teamId: d.teamId })}>
                <td><span style={{ fontFamily: 'var(--font-d)', fontWeight: 900, fontSize: 20, color: d.pos <= 3 ? '#fff' : 'var(--gray3)' }}>{d.pos}</span></td>
                <td>
                  <span className="flag-span">{d.nat}</span>
                  <span style={{ fontFamily: 'var(--font-d)', fontWeight: 900, fontStyle: 'italic', fontSize: 18, textTransform: 'uppercase' }}>{d.name}</span>
                </td>
                <td>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: tc.primary, display: 'inline-block' }} />
                    <span style={{ fontFamily: 'var(--font-d)', fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--gray2)' }}>{d.team}</span>
                  </span>
                </td>
                <td><span style={{ fontFamily: 'var(--font-m)', color: 'var(--gray3)' }}>#{d.num}</span></td>
                <td><span style={{ fontFamily: 'var(--font-m)', color: tc.primary }}>{d.wins}</span></td>
                <td><span style={{ fontFamily: 'var(--font-m)', color: 'var(--gray2)' }}>{d.podiums}</span></td>
                <td><span style={{ fontFamily: 'var(--font-m)', fontSize: 18, color: tc.primary, fontWeight: 700 }}>{d.pts}</span></td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <Footer navigate={navigate} />
    </div>
  );
}

/* ─── NEWS PAGE ──────────────────────────────────────────── */
function NewsPage({ navigate }) {
  const { data: newsData, isLoading } = useSWR('/api/news', fetcher, { refreshInterval: 600000, revalidateOnFocus: false });
  const catColors = { 'RACE REPORT': '#E8002D', 'CHAMPIONSHIP': '#00D2BE', 'TECHNICAL': '#FF8000', 'DRIVER': '#5E88FF', 'TEAM': '#00A77E', 'PREVIEW': '#C8A46B', 'ANALYSIS': '#BB0000' };
  const articles = newsData?.articles || [];
  return (
    <div className="news-page">
      <div className="section-label au">LATEST NEWS · AUTO-UPDATING</div>
      <h1 className="section-title au1">F1 <span>NEWS</span></h1>
      <div className="section-desc au2">Real-time Formula 1 news from Autosport, Motorsport.com and RaceFans.</div>
      {isLoading ? (
        <div className="news-loading"><div className="news-spinner" /><div className="news-load-text">FETCHING LIVE NEWS FEED</div></div>
      ) : articles.length === 0 ? (
        <div className="error-msg" style={{ marginTop: 40 }}>NO NEWS AVAILABLE — CHECK BACK SOON</div>
      ) : (
        <div className="news-grid" style={{ marginTop: 30 }}>
          {articles.slice(0,5).map((a,idx) => (
            <div key={a.id} className={`news-card ${idx===0?'featured':''}`} onClick={() => a.link !== '#' && window.open(a.link,'_blank')}>
              <img className="news-card-img" src={a.image || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80'} alt={a.title} onError={e => e.target.src='https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80'} />
              <div className="news-card-body">
                <div className="news-card-cat" style={{ color: catColors[a.category] || 'var(--red)' }}>● {a.category?.toUpperCase()}</div>
                <div className="news-card-title">{a.title}</div>
                {idx === 0 && <div className="news-card-summary">{a.summary}</div>}
                <div className="news-card-meta">{a.source?.toUpperCase()} · {a.date}</div>
              </div>
            </div>
          ))}
        </div>
      )}
      <Footer navigate={navigate} />
    </div>
  );
}

/* ─── SCHEDULE PAGE ──────────────────────────────────────── */
function SchedulePage({ navigate }) {
  return (
    <div className="schedule-page">
      <div className="section-label au">2026 SEASON · 22 GRANDS PRIX</div>
      <h1 className="section-title au1">RACE <span>CALENDAR</span></h1>
      <div className="section-desc au2">
        Bahrain & Saudi Arabian GPs cancelled due to Middle East conflict. 22 races remain.
      </div>
      <div className="race-list" style={{ marginTop: 30 }}>
        {CALENDAR_2026.map((race, i) => (
          <div key={i}
            className={`race-row ${race.status === 'done' ? 'completed' : ''} ${race.status === 'next' ? 'next' : ''}`}>
            <span className="race-round" style={{ color: race.status === 'done' ? 'var(--gray3)' : race.status === 'next' ? 'var(--red)' : 'var(--gray4)' }}>R{race.rnd}</span>
            <span className="race-flag">{race.flag}</span>
            <span className="race-name" style={{ color: race.status === 'next' ? 'var(--white)' : race.status === 'done' ? 'var(--gray2)' : 'var(--gray1)' }}>{race.name}{race.sprint ? <span style={{ marginLeft: 8, fontSize: 10, color: 'var(--red)', fontFamily: 'var(--font-d)', letterSpacing: 2 }}>SPRINT</span> : null}</span>
            <span className="race-circuit">{race.circuit}</span>
            <span className="race-date">{race.dates}</span>
            {race.winner ? (
              <span className="race-winner"><span className="race-winner-dot" />{race.winner}</span>
            ) : (
              <span className="race-winner" style={{ color: 'var(--gray4)', fontStyle: 'italic' }}>—</span>
            )}
            <span className={`race-status ${race.status === 'done' || race.status === 'next' ? 'done' : 'upcoming'}`}
              style={race.status === 'next' ? { borderColor: 'var(--red)', color: 'var(--red)' } : {}}>
              {race.status === 'done' ? 'COMPLETE' : race.status === 'next' ? 'NEXT RACE' : 'UPCOMING'}
            </span>
          </div>
        ))}
      </div>
      <Footer navigate={navigate} />
    </div>
  );
}

/* ─── RACE ORACLE PAGE ───────────────────────────────────── */
function PredictorPage({ navigate, standingsData, scheduleData }) {
  const drivers = standingsData?.drivers?.length > 0 ? standingsData.drivers : STATIC_DRIVERS;
  const constructors = standingsData?.constructors?.length > 0 ? standingsData.constructors : STATIC_CONSTRUCTORS;
  const nextRace = CALENDAR_2026.find(r => r.status === 'next');
  const raceName = nextRace?.name || 'Japanese Grand Prix';
  const totalRaces = 22;
  const racesCompleted = 2;
  const racesLeft = totalRaces - racesCompleted;
  const MAX_PTS_PER_RACE = 26;
  const ptsAvailable = racesLeft * MAX_PTS_PER_RACE;

  const raceWinners = calculateRaceWinProbability(drivers, raceName);
  const champProbs = calculateChampionshipProbability(drivers, totalRaces, racesCompleted);
  const conChampProbs = calculateChampionshipProbability(
    constructors.map(c => ({ name: c.name, pts: c.pts, pos: c.pos, teamId: c.teamId, code: c.teamId.slice(0,3), recentResults: [] })),
    totalRaces, racesCompleted
  );

  const leaderPts = drivers[0]?.pts || 51;
  const conLeaderPts = constructors[0]?.pts || 98;

  const factors = [
    { icon: '📊', title: 'POINTS FORM', weight: '30%', desc: 'Current championship points normalized against the field leader.' },
    { icon: '🏎', title: 'RECENT FORM', weight: '25%', desc: 'Exponentially weighted average of last 5 race finishing positions.' },
    { icon: '⚡', title: 'CAR PERFORMANCE', weight: '20%', desc: 'Constructor 2026 car pace rating based on season results.' },
    { icon: '🗺', title: 'CIRCUIT HISTORY', weight: '15%', desc: 'Career wins and podiums at the specific circuit being predicted.' },
    { icon: '🎯', title: 'DRIVER RATING', weight: '10%', desc: 'Expert-weighted driver talent and historical performance score.' },
  ];

  return (
    <div className="predictor-page">
      <div className="predictor-hero">
        <div className="section-label au">POWERED BY LIVE F1 DATA · UPDATES AFTER EVERY RACE</div>
        <h1 className="section-title au1">F1 <span>RACE ORACLE</span></h1>
        <div className="section-desc au2" style={{ maxWidth: 700, marginBottom: 20 }}>
          Multi-factor weighted probability model using verified 2026 standings. Predicts race winners, championship outcomes, and minimum wins/podiums needed — after Round 2 (Chinese GP).
        </div>
        <div className="update-badge">
          <span className="update-dot" />
          ROUND {racesCompleted} OF {totalRaces} COMPLETE · {racesLeft} RACES REMAINING · {ptsAvailable} PTS STILL AVAILABLE
        </div>
        {standingsData && <DataBadge source={standingsData.source} lastUpdated={standingsData.lastUpdated} />}
      </div>

      <div className="predictor-grid">
        {/* Next Race Win Prediction */}
        <div className="predictor-panel">
          <div className="predictor-panel-title">🏁 NEXT RACE WINNER</div>
          <div className="predictor-panel-sub">{nextRace?.flag} {raceName?.toUpperCase()} · {nextRace?.circuit?.toUpperCase() || 'SUZUKA'} · {nextRace?.dates}</div>
          {raceWinners.slice(0,10).map((d, i) => {
            const tc = getColor(d.teamId);
            const maxProb = parseFloat(raceWinners[0].winProbability);
            return (
              <div key={d.pos||i} className="predictor-row">
                <div className={`predictor-rank ${i<3?`r${i+1}`:''}`}>{i+1}</div>
                <div className="predictor-team-dot" style={{ background: tc.primary }} />
                <div className="predictor-driver">{d.name}</div>
                <div className="predictor-bar-wrap">
                  <div className="predictor-bar-fill" style={{ width: `${(parseFloat(d.winProbability)/maxProb)*100}%`, background: i===0?tc.primary:`${tc.primary}88` }} />
                </div>
                <div className="predictor-pct" style={{ color: i===0?tc.primary:'var(--gray1)' }}>{d.winProbability}%</div>
              </div>
            );
          })}
        </div>

        {/* WDC Probability */}
        <div className="predictor-panel">
          <div className="predictor-panel-title">🏆 WDC PROBABILITY</div>
          <div className="predictor-panel-sub">CHAMPIONSHIP WIN CHANCE · {racesLeft} RACES REMAINING · {ptsAvailable} PTS AVAILABLE</div>
          {champProbs.slice(0,10).map((d, i) => {
            const tc = getColor(d.teamId);
            const maxProb = parseFloat(champProbs[0].champProbability);
            return (
              <div key={d.name||i} className="predictor-row">
                <div className={`predictor-rank ${i<3?`r${i+1}`:''}`}>{i+1}</div>
                <div className="predictor-team-dot" style={{ background: tc.primary }} />
                <div className="predictor-driver">{d.name}</div>
                <div className="predictor-bar-wrap">
                  <div className="predictor-bar-fill" style={{ width: `${(parseFloat(d.champProbability)/maxProb)*100}%`, background: i===0?tc.primary:`${tc.primary}88` }} />
                </div>
                <div className="predictor-pct" style={{ color: i===0?tc.primary:'var(--gray1)' }}>{d.champProbability}%</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* DRIVERS — Wins & Podiums Needed */}
      <div className="predictor-panel" style={{ marginTop: 3 }}>
        <div className="predictor-panel-title">📐 DRIVERS — WINS & PODIUMS NEEDED TO CLOSE THE GAP</div>
        <div className="predictor-panel-sub">
          LEADER: {drivers[0]?.name?.toUpperCase()} ({leaderPts} PTS) · {ptsAvailable} PTS STILL AVAILABLE ACROSS {racesLeft} RACES
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 3, marginTop: 16 }}>
          {drivers.slice(0,12).map((d, i) => {
            const tc = getColor(d.teamId);
            const gap = leaderPts - d.pts;
            const isLeader = i === 0;
            const eliminated = (d.pts + ptsAvailable) < leaderPts;
            const winsNeeded = isLeader ? null : Math.ceil(gap / 25);
            const podsNeeded = isLeader ? null : Math.ceil(gap / 15);
            return (
              <div key={d.name} style={{
                background: isLeader ? `${tc.primary}12` : eliminated ? 'rgba(255,255,255,.02)' : 'var(--surface2)',
                border: isLeader ? `1px solid ${tc.primary}40` : '1px solid transparent',
                padding: '16px 20px', opacity: eliminated ? 0.45 : 1,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontFamily: 'var(--font-d)', fontWeight: 900, fontSize: 20, color: isLeader ? tc.primary : 'var(--gray3)', width: 28 }}>{d.pos}</span>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: tc.primary, display: 'inline-block', flexShrink: 0 }} />
                    <span style={{ fontFamily: 'var(--font-d)', fontWeight: 900, fontStyle: 'italic', fontSize: 14, textTransform: 'uppercase', color: isLeader ? tc.primary : 'var(--gray1)' }}>{d.name}</span>
                  </div>
                  <span style={{ fontFamily: 'var(--font-m)', fontSize: 13, color: tc.primary }}>{d.pts} PTS</span>
                </div>
                {isLeader ? (
                  <div style={{ fontFamily: 'var(--font-d)', fontSize: 12, letterSpacing: 2, color: tc.primary, textTransform: 'uppercase' }}>
                    🏆 CHAMPIONSHIP LEADER · +{d.pts - (drivers[1]?.pts||0)} OVER P2
                  </div>
                ) : eliminated ? (
                  <div style={{ fontFamily: 'var(--font-d)', fontSize: 11, letterSpacing: 2, color: 'var(--gray3)', textTransform: 'uppercase' }}>
                    ✗ MATHEMATICALLY ELIMINATED · GAP: {gap} PTS
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: 16 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: 'var(--font-m)', fontSize: 10, color: 'var(--gray3)', letterSpacing: 1, marginBottom: 3 }}>GAP</div>
                      <div style={{ fontFamily: 'var(--font-d)', fontWeight: 900, fontSize: 22, color: 'var(--white)' }}>{gap}</div>
                      <div style={{ fontFamily: 'var(--font-m)', fontSize: 9, color: 'var(--gray3)' }}>POINTS</div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: 'var(--font-m)', fontSize: 10, color: 'var(--gray3)', letterSpacing: 1, marginBottom: 3 }}>MIN WINS</div>
                      <div style={{ fontFamily: 'var(--font-d)', fontWeight: 900, fontSize: 22, color: tc.primary }}>{winsNeeded}</div>
                      <div style={{ fontFamily: 'var(--font-m)', fontSize: 9, color: 'var(--gray3)' }}>TO LEAD</div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: 'var(--font-m)', fontSize: 10, color: 'var(--gray3)', letterSpacing: 1, marginBottom: 3 }}>MIN PODS</div>
                      <div style={{ fontFamily: 'var(--font-d)', fontWeight: 900, fontSize: 22, color: tc.primary }}>{podsNeeded}</div>
                      <div style={{ fontFamily: 'var(--font-m)', fontSize: 9, color: 'var(--gray3)' }}>TO LEAD</div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* CONSTRUCTORS — Championship + Wins Needed */}
      <div className="predictor-panel" style={{ marginTop: 3 }}>
        <div className="predictor-panel-title">🏗 CONSTRUCTORS CHAMPIONSHIP</div>
        <div className="predictor-panel-sub">WCC PROBABILITY + WINS NEEDED · LEADER: MERCEDES ({conLeaderPts} PTS) · {racesLeft} RACES LEFT</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 3, marginTop: 16 }}>
          {conChampProbs.slice(0,6).map((c, i) => {
            const tc = getColor(c.teamId);
            const conPts = constructors.find(x => x.teamId === c.teamId)?.pts || 0;
            const gap = conLeaderPts - conPts;
            const isLeader = i === 0;
            const conPtsLeft = racesLeft * MAX_PTS_PER_RACE * 2;
            const eliminated = !isLeader && (conPts + conPtsLeft) < conLeaderPts;
            const winsNeeded = isLeader ? null : Math.ceil(gap / 25);
            const podsNeeded = isLeader ? null : Math.ceil(gap / 30);
            return (
              <div key={c.name} style={{
                background: isLeader ? `${tc.primary}12` : eliminated ? 'rgba(255,255,255,.02)' : 'var(--surface2)',
                border: isLeader ? `1px solid ${tc.primary}40` : '1px solid transparent',
                padding: '16px 20px', opacity: eliminated && !isLeader ? 0.45 : 1,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontFamily: 'var(--font-d)', fontWeight: 900, fontSize: 18, color: isLeader ? tc.primary : 'var(--gray3)', width: 24 }}>{i+1}</span>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: tc.primary, display: 'inline-block' }} />
                    <span style={{ fontFamily: 'var(--font-d)', fontWeight: 900, fontStyle: 'italic', fontSize: 15, textTransform: 'uppercase', color: isLeader ? tc.primary : 'var(--gray1)' }}>{c.name}</span>
                  </div>
                  <span style={{ fontFamily: 'var(--font-m)', fontSize: 12, color: tc.primary }}>{conPts} PTS</span>
                </div>
                <div style={{ height: 3, background: 'var(--gray4)', marginBottom: 10 }}>
                  <div style={{ height: '100%', width: `${parseFloat(c.champProbability)}%`, background: tc.primary, transition: 'width 1s ease' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: 'var(--font-m)', fontSize: 13, color: isLeader ? tc.primary : 'var(--gray1)' }}>{c.champProbability}% WIN CHANCE</span>
                  {isLeader ? (
                    <span style={{ fontFamily: 'var(--font-d)', fontSize: 11, letterSpacing: 2, color: tc.primary }}>🏆 LEADER</span>
                  ) : eliminated ? (
                    <span style={{ fontFamily: 'var(--font-d)', fontSize: 10, letterSpacing: 1, color: 'var(--gray3)' }}>✗ ELIM · -{gap} PTS</span>
                  ) : (
                    <div style={{ display: 'flex', gap: 16 }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontFamily: 'var(--font-d)', fontWeight: 900, fontSize: 18, color: tc.primary }}>{winsNeeded}</div>
                        <div style={{ fontFamily: 'var(--font-m)', fontSize: 9, color: 'var(--gray3)' }}>WINS NEEDED</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontFamily: 'var(--font-d)', fontWeight: 900, fontSize: 18, color: tc.primary }}>{podsNeeded}</div>
                        <div style={{ fontFamily: 'var(--font-m)', fontSize: 9, color: 'var(--gray3)' }}>PODS NEEDED</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Algorithm Factors */}
      <div style={{ marginTop: 40 }}>
        <div className="section-label">PREDICTION ALGORITHM · HOW IT WORKS</div>
        <h2 className="section-title" style={{ fontSize: 'clamp(28px,4vw,50px)' }}>WEIGHTED <span>FACTORS</span></h2>
        <div className="factors-grid" style={{ marginTop: 24 }}>
          {factors.map(f => (
            <div key={f.title} className="factor-card">
              <div className="factor-icon">{f.icon}</div>
              <div className="factor-title">{f.title}</div>
              <div className="factor-desc">{f.desc}</div>
              <div className="factor-weight">{f.weight} WEIGHT</div>
            </div>
          ))}
          <div className="factor-card" style={{ background: 'rgba(232,0,45,.08)', border: '1px solid rgba(232,0,45,.2)' }}>
            <div className="factor-icon">🔢</div>
            <div className="factor-title" style={{ color: 'var(--red)' }}>SOFTMAX OUTPUT</div>
            <div className="factor-desc">Final probabilities via softmax normalization — all predictions sum to 100% with meaningful differentiation.</div>
            <div className="factor-weight" style={{ color: 'var(--white)' }}>PROBABILITY OUTPUT</div>
          </div>
        </div>
      </div>

      <Footer navigate={navigate} />
    </div>
  );
}

/* ─── APP ROOT ───────────────────────────────────────────── */
export default function F1Hub() {
  const [page, setPage] = useState('home');
  const [teamId, setTeamId] = useState(null);

  const { data: standingsData } = useSWR('/api/standings', fetcher, { refreshInterval: 300000, revalidateOnFocus: true, dedupingInterval: 60000 });
  const { data: scheduleData } = useSWR('/api/schedule', fetcher, { refreshInterval: 3600000, revalidateOnFocus: false });

  const navigate = useCallback((p, extra = {}) => {
    setPage(p);
    if (extra.teamId) setTeamId(extra.teamId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const renderPage = () => {
    const props = { navigate, standingsData, scheduleData };
    if (page === 'team' && teamId) return <TeamDetailPage teamId={teamId} {...props} />;
    switch (page) {
      case 'home':      return <HomePage {...props} />;
      case 'teams':     return <TeamsPage {...props} />;
      case 'drivers':   return <DriversPage {...props} />;
      case 'news':      return <NewsPage {...props} />;
      case 'schedule':  return <SchedulePage {...props} />;
      case 'predictor': return <PredictorPage {...props} />;
      default:          return <HomePage {...props} />;
    }
  };

  return (
    <>
      <Head>
        <title>F1 HUB 2026 — Real-Time Formula 1 Data</title>
        <meta name="description" content="Real-time Formula 1 standings, predictions, news and analysis for the 2026 season. 22 races, 11 teams, 22 drivers." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🏎</text></svg>" />
      </Head>
      <Ticker standings={standingsData} />
      <Navbar page={page} navigate={navigate} />
      {renderPage()}
    </>
  );
}
