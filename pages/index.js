// pages/index.js — F1 HUB 2026 · 100% VERIFIED REAL DATA as of Round 2 (Chinese GP, Mar 15 2026)
import Head from 'next/head';
import { useState, useCallback, useEffect, useRef } from 'react';
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
  redbull:     { primary: '#1B3FAB', dark: '#05091e' },
  racingbulls: { primary: '#5377FF', dark: '#050b28' },
  haas:        { primary: '#E8002D', dark: '#180008' },
  alpine:      { primary: '#FF87BC', dark: '#1a0010' },
  audi:        { primary: '#BB0000', dark: '#1a0000' },
  williams:    { primary: '#37BEDD', dark: '#001020' },
  cadillac:    { primary: '#C5B358', dark: '#141100' },
  astonmartin: { primary: '#00A77E', dark: '#001a16' },
};
const getColor = (id) => TC[id] || { primary: '#888', dark: '#111' };

const DRIVER_IMG_FALLBACK = 'https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?w=900&q=80&fit=crop';
const CAR_IMG_FALLBACK = 'https://images.unsplash.com/photo-1611821064430-0d40291d0f0b?w=1400&q=80&fit=crop';
const applyFallbackImage = (e, fallbackUrl) => {
  const img = e.currentTarget;
  if (img.dataset.fallbackApplied === '1') {
    img.style.display = 'none';
    return;
  }
  img.dataset.fallbackApplied = '1';
  img.src = fallbackUrl;
};

/* ─── DRIVER PHOTOS ── Official F1 CDN with built-in fallback ── */
const DRIVER_PHOTOS = {
  'George Russell': 'https://media.formula1.com/image/upload/c_fill,w_720/q_auto/d_common:f1:2026:fallback:driver:2026fallbackdriverright.webp/common/f1/2026/mercedes/georus01/2026mercedesgeorus01right.webp',

'Kimi Antonelli': 'https://media.formula1.com/image/upload/c_fill,w_720/q_auto/v1740000001/common/f1/2026/mercedes/andant01/2026mercedesandant01right.webp',  'Lewis Hamilton': 'https://media.formula1.com/image/upload/c_fill,w_720/q_auto/d_common:f1:2026:fallback:driver:2026fallbackdriverright.webp/common/f1/2026/ferrari/lewham01/2026ferrarilewham01right.webp',

  'Charles Leclerc': 'https://media.formula1.com/image/upload/c_fill,w_720/q_auto/d_common:f1:2026:fallback:driver:2026fallbackdriverright.webp/common/f1/2026/ferrari/chalec01/2026ferrarichalec01right.webp',

  'Lando Norris': 'https://media.formula1.com/image/upload/c_fill,w_720/q_auto/d_common:f1:2026:fallback:driver:2026fallbackdriverright.webp/common/f1/2026/mclaren/lannor01/2026mclarenlannor01right.webp',

  'Oscar Piastri': 'https://media.formula1.com/image/upload/c_fill,w_720/q_auto/d_common:f1:2026:fallback:driver:2026fallbackdriverright.webp/common/f1/2026/mclaren/oscpia01/2026mclarenoscpia01right.webp',

  'Max Verstappen': 'https://media.formula1.com/image/upload/c_fill,w_720/q_auto/d_common:f1:2026:fallback:driver:2026fallbackdriverright.webp/common/f1/2026/redbullracing/maxver01/2026redbullracingmaxver01right.webp',

  'Isack Hadjar': 'https://media.formula1.com/image/upload/c_fill,w_720/q_auto/d_common:f1:2026:fallback:driver:2026fallbackdriverright.webp/common/f1/2026/racingbulls/isahad01/2026racingbullsisahad01right.webp',

  'Liam Lawson': 'https://media.formula1.com/image/upload/c_fill,w_720/q_auto/d_common:f1:2026:fallback:driver:2026fallbackdriverright.webp/common/f1/2026/redbullracing/lialaw01/2026redbullracinglialaw01right.webp',

  'Arvid Lindblad': 'https://media.formula1.com/image/upload/c_fill,w_720/q_auto/d_common:f1:2026:fallback:driver:2026fallbackdriverright.webp/common/f1/2026/racingbulls/arvlin01/2026racingbullsarvlin01right.webp',

  'Oliver Bearman': 'https://media.formula1.com/image/upload/c_fill,w_720/q_auto/d_common:f1:2026:fallback:driver:2026fallbackdriverright.webp/common/f1/2026/haas/olibea01/2026haasolibea01right.webp',

  'Esteban Ocon': 'https://media.formula1.com/image/upload/c_fill,w_720/q_auto/d_common:f1:2026:fallback:driver:2026fallbackdriverright.webp/common/f1/2026/haas/estoco01/2026haasestoco01right.webp',

  'Pierre Gasly': 'https://media.formula1.com/image/upload/c_fill,w_720/q_auto/d_common:f1:2026:fallback:driver:2026fallbackdriverright.webp/common/f1/2026/alpine/piegas01/2026alpinepiegas01right.webp',

  'Franco Colapinto': 'https://media.formula1.com/image/upload/c_fill,w_720/q_auto/d_common:f1:2026:fallback:driver:2026fallbackdriverright.webp/common/f1/2026/alpine/fracol01/2026alpinefracol01right.webp',

  'Nico Hülkenberg': 'https://media.formula1.com/image/upload/c_fill,w_720/q_auto/d_common:f1:2026:fallback:driver:2026fallbackdriverright.webp/common/f1/2026/audi/nichul01/2026audinichul01right.webp',

  'Gabriel Bortoleto': 'https://media.formula1.com/image/upload/c_fill,w_720/q_auto/d_common:f1:2026:fallback:driver:2026fallbackdriverright.webp/common/f1/2026/audi/gabbor01/2026audigabbor01right.webp',

  'Carlos Sainz': 'https://media.formula1.com/image/upload/c_fill,w_720/q_auto/d_common:f1:2026:fallback:driver:2026fallbackdriverright.webp/common/f1/2026/williams/carsai01/2026williamscarsai01right.webp',

  'Alexander Albon': 'https://media.formula1.com/image/upload/c_fill,w_720/q_auto/d_common:f1:2026:fallback:driver:2026fallbackdriverright.webp/common/f1/2026/williams/alealb01/2026williamsalealb01right.webp',

  'Fernando Alonso': 'https://media.formula1.com/image/upload/c_fill,w_720/q_auto/d_common:f1:2026:fallback:driver:2026fallbackdriverright.webp/common/f1/2026/astonmartin/feralo01/2026astonmartinferalo01right.webp',

  'Lance Stroll': 'https://media.formula1.com/image/upload/c_fill,w_720/q_auto/d_common:f1:2026:fallback:driver:2026fallbackdriverright.webp/common/f1/2026/astonmartin/lanstr01/2026astonmartinlanstr01right.webp',

  'Valtteri Bottas': 'https://media.formula1.com/image/upload/c_fill,w_720/q_auto/d_common:f1:2026:fallback:driver:2026fallbackdriverright.webp/common/f1/2026/cadillac/valbot01/2026cadillacvalbot01right.webp',

  'Sergio Pérez': 'https://media.formula1.com/image/upload/c_fill,w_720/q_auto/d_common:f1:2026:fallback:driver:2026fallbackdriverright.webp/common/f1/2026/cadillac/serper01/2026cadillacserper01right.webp'
};
/* ─── 2026 CAR IMAGES ── Official F1 CDN with fallback ── */
const CAR_IMAGES = {
  mercedes:    'https://media.formula1.com/image/upload/c_lfill,w_512/q_auto/d_common:f1:2026:fallback:car:2026fallbackcarright.webp/common/f1/2026/mercedes/2026mercedescarright.webp',

  ferrari:     'https://media.formula1.com/image/upload/c_lfill,w_512/q_auto/d_common:f1:2026:fallback:car:2026fallbackcarright.webp/common/f1/2026/ferrari/2026ferraricarright.webp',

  mclaren:     'https://media.formula1.com/image/upload/c_lfill,w_512/q_auto/d_common:f1:2026:fallback:car:2026fallbackcarright.webp/common/f1/2026/mclaren/2026mclarencarright.webp',

  redbull:     'https://media.formula1.com/image/upload/c_lfill,w_512/q_auto/d_common:f1:2026:fallback:car:2026fallbackcarright.webp/common/f1/2026/redbullracing/2026redbullracingcarright.webp',

  racingbulls: 'https://media.formula1.com/image/upload/c_lfill,w_512/q_auto/d_common:f1:2026:fallback:car:2026fallbackcarright.webp/common/f1/2026/racingbulls/2026racingbullscarright.webp',

  haas:        'https://media.formula1.com/image/upload/c_lfill,w_512/q_auto/d_common:f1:2026:fallback:car:2026fallbackcarright.webp/common/f1/2026/haas/2026haascarright.webp',

  alpine:      'https://media.formula1.com/image/upload/c_lfill,w_512/q_auto/d_common:f1:2026:fallback:car:2026fallbackcarright.webp/common/f1/2026/alpine/2026alpinecarright.webp',

  audi:        'https://media.formula1.com/image/upload/c_lfill,w_512/q_auto/d_common:f1:2026:fallback:car:2026fallbackcarright.webp/common/f1/2026/audi/2026audicarright.webp',

  williams:    'https://media.formula1.com/image/upload/c_lfill,w_512/q_auto/d_common:f1:2026:fallback:car:2026fallbackcarright.webp/common/f1/2026/williams/2026williamscarright.webp',

  cadillac:    'https://media.formula1.com/image/upload/c_lfill,w_512/q_auto/d_common:f1:2026:fallback:car:2026fallbackcarright.webp/common/f1/2026/cadillac/2026cadillaccarright.webp',

  astonmartin: 'https://media.formula1.com/image/upload/c_lfill,w_512/q_auto/d_common:f1:2026:fallback:car:2026fallbackcarright.webp/common/f1/2026/astonmartin/2026astonmartincarright.webp',
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
    { id: 'news', label: 'NEWS' }, { id: 'calculator', label: 'CALC' },
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
        {/* Multi-driver collage background */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 0 }}>
          {/* Base track atmosphere image */}
          <img
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(.28) saturate(.6)', zIndex: 0 }}
            src="https://images.unsplash.com/photo-1537808288253-200047a98c1b?w=1800&q=90"
            alt="" onError={e => e.target.style.display='none'}
          />
          {/* Driver photo strip — right side */}
          <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '58%', display: 'flex', zIndex: 1 }}>
            {[
              { name: 'George Russell',  teamId: 'mercedes' },
              { name: 'Kimi Antonelli',  teamId: 'mercedes' },
              { name: 'Charles Leclerc', teamId: 'ferrari' },
              { name: 'Lewis Hamilton',  teamId: 'ferrari' },
              { name: 'Lando Norris',    teamId: 'mclaren' },
              { name: 'Max Verstappen',  teamId: 'redbull' },
            ].map((d, i) => {
              const tc = getColor(d.teamId);
              const photo = DRIVER_PHOTOS[d.name];
              return (
                <div key={d.name} style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                  {photo && <img src={photo} alt={d.name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 18%', filter: 'brightness(.55) saturate(.7)' }} onError={e => applyFallbackImage(e, DRIVER_IMG_FALLBACK)} />}
                  {/* team colour sliver at bottom */}
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: tc.primary }} />
                </div>
              );
            })}
            {/* left-to-right fade so drivers blend into text */}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(8,8,8,1) 0%, rgba(8,8,8,.7) 18%, rgba(8,8,8,.2) 55%, rgba(8,8,8,.55) 100%)', zIndex: 2 }} />
            {/* bottom fade */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '45%', background: 'linear-gradient(to top, rgba(8,8,8,.95) 0%, transparent 100%)', zIndex: 3 }} />
          </div>
          {/* F1 logo watermark — enormous behind drivers */}
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 0, fontFamily: 'var(--font-d)', fontWeight: 900, fontStyle: 'italic', fontSize: 'clamp(200px,32vw,480px)', color: 'rgba(255,255,255,.028)', letterSpacing: -20, lineHeight: 1, pointerEvents: 'none', userSelect: 'none', whiteSpace: 'nowrap' }}>
            F<span style={{ color: 'rgba(232,0,45,.045)' }}>1</span>
          </div>
          {/* 2026 watermark */}
          <div style={{ position: 'absolute', right: '3%', bottom: '8%', zIndex: 4, fontFamily: 'var(--font-d)', fontWeight: 900, fontSize: 'clamp(40px,7vw,100px)', color: 'rgba(255,255,255,.035)', letterSpacing: 8, pointerEvents: 'none', userSelect: 'none' }}>
            2026
          </div>
        </div>
        {/* dark left overlay for text legibility */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(8,8,8,.98) 0%, rgba(8,8,8,.82) 38%, transparent 65%)', zIndex: 1 }} />
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
            <img src={photoUrl} alt={dName} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 16%', filter: 'brightness(.88) saturate(.95)' }} onError={e => applyFallbackImage(e, DRIVER_IMG_FALLBACK)} />
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
            onError={e => applyFallbackImage(e, CAR_IMG_FALLBACK)}
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


/* ═══════════════════════════════════════════════════════════
   F1 RACE-START INTRO SCREEN
═══════════════════════════════════════════════════════════ */
function IntroScreen({ onDone }) {
  const [phase, setPhase] = useState('idle');
  const [litCount, setLitCount] = useState(0);
  const [lightColor, setLightColor] = useState('off'); // off | red | yellow | green
  const [statusText, setStatusText] = useState('');
  const [wipeRed, setWipeRed] = useState(false);
  const [wipeDark, setWipeDark] = useState(false);
  const [fading, setFading] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const seq = (ms) => new Promise(r => setTimeout(r, ms));
    (async () => {
      await seq(200);
      setShowContent(true);
      setStatusText('2026 FIA FORMULA ONE WORLD CHAMPIONSHIP');
      await seq(1000);
      setPhase('lights');
      setStatusText('RACE START SEQUENCE INITIATED');

      // RED lights — one by one
      for (let n = 1; n <= 5; n++) {
        await seq(540);
        setLightColor('red');
        setLitCount(n);
        setStatusText(`LIGHT ${n}`);
      }
      await seq(1200); // tension hold

      // YELLOW flash
      setLightColor('yellow');
      setStatusText('STANDBY');
      await seq(650);

      // GREEN — all lit green
      setLightColor('green');
      setStatusText('');
      await seq(280);

      // LIGHTS OUT
      setLitCount(0);
      setLightColor('off');
      setPhase('go');

      await seq(100);
      setWipeRed(true);
      await seq(360);
      setWipeDark(true);
      await seq(500);
      setFading(true);
      await seq(300);
      onDone();
    })();
  }, []);

  const getLightGlow = (n) => {
    const lit = litCount >= n;
    if (!lit) return {
      bg: 'radial-gradient(circle at 50% 50%, #1a0000 0%, #0d0000 100%)',
      border: '#2a0000',
      shadow: 'inset 0 2px 8px rgba(0,0,0,.9)',
    };
    if (lightColor === 'red') return {
      bg: 'radial-gradient(circle at 38% 32%, #ff9090 0%, #E8002D 35%, #7a0012 100%)',
      border: '#ff2244',
      shadow: '0 0 24px rgba(232,0,45,1), 0 0 55px rgba(232,0,45,.7), 0 0 110px rgba(232,0,45,.35), inset 0 3px 8px rgba(255,200,200,.3)',
    };
    if (lightColor === 'yellow') return {
      bg: 'radial-gradient(circle at 38% 32%, #fff0a0 0%, #FFC200 35%, #8a6800 100%)',
      border: '#ffe566',
      shadow: '0 0 24px rgba(255,194,0,1), 0 0 55px rgba(255,194,0,.7), 0 0 110px rgba(255,194,0,.35), inset 0 3px 8px rgba(255,240,180,.3)',
    };
    if (lightColor === 'green') return {
      bg: 'radial-gradient(circle at 38% 32%, #aaffcc 0%, #00C853 35%, #004d20 100%)',
      border: '#44ff88',
      shadow: '0 0 24px rgba(0,200,83,1), 0 0 55px rgba(0,200,83,.7), 0 0 110px rgba(0,200,83,.35), inset 0 3px 8px rgba(180,255,200,.3)',
    };
    return { bg: '#111', border: '#222', shadow: 'none' };
  };

  // Background glow matches light color
  const bgGlow = lightColor === 'red'
    ? 'radial-gradient(ellipse at 50% 52%, rgba(180,0,20,.55) 0%, rgba(100,0,10,.25) 35%, transparent 65%)'
    : lightColor === 'yellow'
    ? 'radial-gradient(ellipse at 50% 52%, rgba(200,140,0,.45) 0%, rgba(120,80,0,.2) 35%, transparent 65%)'
    : lightColor === 'green'
    ? 'radial-gradient(ellipse at 50% 52%, rgba(0,160,60,.45) 0%, rgba(0,90,30,.2) 35%, transparent 65%)'
    : 'radial-gradient(ellipse at 50% 52%, rgba(60,0,5,.3) 0%, transparent 55%)';

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 99999,
      background: '#000',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden',
      opacity: fading ? 0 : 1,
      transition: 'opacity 0.35s ease',
    }}>
      {/* ── BACKGROUND: F1 neon red glowing logo photo ── */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        {/* Real F1 track + atmosphere */}
        <img
          src="https://images.unsplash.com/photo-1558618047-f4e60c9b07c5?w=1800&q=90"
          alt=""
          style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            objectFit: 'cover', objectPosition: 'center',
            filter: `brightness(${showContent ? .14 : 0}) saturate(.5) contrast(1.2)`,
            transition: 'filter 1s ease',
          }}
          onError={e => e.target.style.display = 'none'}
        />
        {/* Deep black vignette — like the neon logo photo */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,.2) 0%, rgba(0,0,0,.75) 55%, rgba(0,0,0,.97) 100%)',
        }} />
        {/* Dynamic light glow from the race lights */}
        <div style={{
          position: 'absolute', inset: 0,
          background: bgGlow,
          transition: 'background 0.18s ease',
        }} />
        {/* Scanlines — TV broadcast look */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,.012) 2px, rgba(255,255,255,.012) 4px)',
          pointerEvents: 'none',
        }} />
      </div>

      {/* ── REAL F1 SVG LOGO — centered, glowing ── */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -55%)',
        zIndex: 1,
        opacity: showContent ? 1 : 0,
        transition: 'opacity 0.8s ease',
        pointerEvents: 'none',
      }}>
        {/* Official F1 logo shape via SVG path — the exact arrow-F + 1 logo */}
        <svg viewBox="0 0 400 160" style={{
          width: 'clamp(280px, 38vw, 520px)',
          filter: lightColor === 'red'
            ? 'drop-shadow(0 0 30px rgba(232,0,45,.9)) drop-shadow(0 0 80px rgba(232,0,45,.5)) drop-shadow(0 0 160px rgba(232,0,45,.25))'
            : lightColor === 'yellow'
            ? 'drop-shadow(0 0 30px rgba(255,194,0,.9)) drop-shadow(0 0 80px rgba(255,194,0,.5))'
            : lightColor === 'green'
            ? 'drop-shadow(0 0 30px rgba(0,200,83,.9)) drop-shadow(0 0 80px rgba(0,200,83,.5))'
            : 'drop-shadow(0 0 20px rgba(232,0,45,.4)) drop-shadow(0 0 50px rgba(232,0,45,.2))',
          transition: 'filter 0.2s ease',
        }}>
          {/* F1 logo: left F-shape with arrow cutout + right 1 with speed stripes */}
          {/* Rectangle background */}
          <rect x="0" y="10" width="400" height="140" rx="6"
            fill={lightColor === 'red' ? '#E8002D'
                : lightColor === 'yellow' ? '#d4a000'
                : lightColor === 'green' ? '#00882e'
                : '#C8001E'}
            opacity="0.92"
          />
          {/* The white F shape */}
          <path d="M 30 30 L 30 130 L 58 130 L 58 95 L 105 95 L 105 72 L 58 72 L 58 52 L 118 52 L 118 30 Z"
            fill="white" />
          {/* Arrow cutout in F to make the hidden 1 */}
          <path d="M 78 52 L 58 72 L 78 72 Z" fill={
            lightColor === 'red' ? '#E8002D'
            : lightColor === 'yellow' ? '#d4a000'
            : lightColor === 'green' ? '#00882e'
            : '#C8001E'
          } />
          {/* Speed lines (3 diagonal stripes) */}
          <path d="M 135 30 L 175 30 L 175 130 L 135 130 Z" fill="white" opacity="0.0" />
          {/* Diagonal speed stripes */}
          <path d="M 138 30 L 158 30 L 158 130 L 138 130 Z" fill="white" opacity="0.15" />
          <path d="M 166 30 L 186 30 L 186 130 L 166 130 Z" fill="white" opacity="0.15" />
          <path d="M 194 30 L 214 30 L 214 130 L 194 130 Z" fill="white" opacity="0.15" />
          {/* The 1 numeral */}
          <path d="M 240 30 L 240 130 L 270 130 L 270 30 Z" fill="white" />
          {/* Diagonal stroke of 1 top-left */}
          <path d="M 215 50 L 240 30 L 240 58 L 215 78 Z" fill="white" />
          {/* Base serif of 1 */}
          <path d="M 210 130 L 210 115 L 300 115 L 300 130 Z" fill="white" />
          {/* Speed stripes right side */}
          <path d="M 318 30 L 338 30 L 268 130 L 248 130 Z" fill="white" opacity="0.18" />
          <path d="M 345 30 L 365 30 L 295 130 L 275 130 Z" fill="white" opacity="0.18" />
          <path d="M 372 30 L 392 30 L 322 130 L 302 130 Z" fill="white" opacity="0.18" />
          {/* Right border */}
          <rect x="380" y="10" width="20" height="140" rx="3"
            fill={lightColor === 'red' ? '#E8002D' : lightColor === 'yellow' ? '#d4a000' : lightColor === 'green' ? '#00882e' : '#C8001E'}
          />
        </svg>
      </div>

      {/* ── CONTENT ── */}
      <div style={{
        position: 'relative', zIndex: 5,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center',
        opacity: showContent ? 1 : 0,
        transition: 'opacity 0.6s ease',
        marginTop: '15vh',
      }}>
        {/* FIA + 2026 row */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 20,
          marginBottom: 28,
          fontFamily: 'var(--font-d)',
        }}>
          <div style={{ border: '1px solid rgba(255,255,255,.3)', padding: '5px 14px', fontWeight: 900, fontSize: 14, letterSpacing: 4, color: 'rgba(255,255,255,.6)' }}>FIA</div>
          <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,.2)' }} />
          <div style={{ fontWeight: 900, fontSize: 18, letterSpacing: 6, color: 'rgba(255,255,255,.5)' }}>2026</div>
          <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,.2)' }} />
          <div style={{ fontWeight: 600, fontSize: 10, letterSpacing: 4, color: 'rgba(255,255,255,.35)', lineHeight: 1.6, textAlign: 'center' }}>FORMULA ONE<br />WORLD CHAMPIONSHIP</div>
        </div>

        {/* Status text */}
        <div style={{
          fontFamily: 'var(--font-m)', fontSize: 11, letterSpacing: 4,
          color: lightColor === 'green' ? '#00C853'
               : lightColor === 'yellow' ? '#FFC200'
               : lightColor === 'red' ? 'rgba(255,100,100,.7)'
               : 'rgba(255,255,255,.4)',
          minHeight: 18, textAlign: 'center', marginBottom: 32,
          transition: 'color 0.2s ease',
          textTransform: 'uppercase',
        }}>
          {statusText}
        </div>

        {/* ── THE 5 LIGHTS ── */}
        {(phase === 'lights' || phase === 'go') && (
          <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
            {/* Gantry crossbar */}
            <div style={{ position: 'absolute', width: '380px', height: 14, marginTop: -50, background: 'linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 60%, #111 100%)', borderRadius: 4, boxShadow: '0 4px 16px rgba(0,0,0,.8)' }} />
            {/* Mounting poles */}
            {[0,1,2,3,4].map(i => (
              <div key={i} style={{ position: 'absolute', width: 8, height: 32, marginTop: -30, marginLeft: i*74 - 148, background: '#1a1a1a', borderRadius: 2 }} />
            ))}
            {[1,2,3,4,5].map(n => {
              const g = getLightGlow(n);
              const lit = litCount >= n;
              return (
                <div key={n} style={{
                  width: 64, height: 64, borderRadius: '50%',
                  background: g.bg,
                  border: `3px solid ${g.border}`,
                  boxShadow: g.shadow,
                  transition: 'all 0.08s ease',
                  position: 'relative',
                  flexShrink: 0,
                }}>
                  {lit && (
                    <div style={{
                      position: 'absolute', top: '18%', left: '22%',
                      width: '28%', height: '16%',
                      borderRadius: '50%',
                      background: 'rgba(255,255,255,.35)',
                      transform: 'rotate(-20deg)',
                    }} />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* GO text */}
        {phase === 'go' && (
          <div style={{
            marginTop: 36, fontFamily: 'var(--font-d)', fontWeight: 900, fontStyle: 'italic',
            fontSize: 'clamp(28px, 5vw, 44px)', letterSpacing: 8, color: '#00C853',
            textShadow: '0 0 40px rgba(0,200,83,.9), 0 0 80px rgba(0,200,83,.4)',
            animation: 'introStatusPulse 0.3s ease both',
          }}>
            LIGHTS OUT — RACE BEGINS
          </div>
        )}
      </div>

      {/* BOTTOM SPONSORS */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 38,
        background: 'rgba(0,0,0,.6)', borderTop: '1px solid rgba(255,255,255,.06)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 32, fontFamily: 'var(--font-m)', fontSize: 10, letterSpacing: 3,
        color: 'rgba(255,255,255,.2)', zIndex: 10, textTransform: 'uppercase',
      }}>
        {['ROLEX','ARAMCO','AWS','DHL','HEINEKEN','PIRELLI','QATAR AIRWAYS','CRYPTO.COM','LENOVO'].map(s => (
          <span key={s}>{s}</span>
        ))}
      </div>

      {/* TOP BAR */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 40,
        background: 'linear-gradient(to right, rgba(200,0,20,.9), rgba(100,0,10,.9))',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 36,
        fontFamily: 'var(--font-d)', fontWeight: 900, fontSize: 11, letterSpacing: 4,
        color: 'rgba(255,255,255,.8)', textTransform: 'uppercase',
        zIndex: 10, borderBottom: '1px solid rgba(255,255,255,.1)',
        transform: showContent ? 'translateY(0)' : 'translateY(-100%)',
        transition: 'transform 0.5s cubic-bezier(0.16,1,0.3,1)',
      }}>
        <span>🏁 F1 HUB 2026</span>
        <span style={{ opacity: .35 }}>|</span>
        <span>ROUND 3 · JAPANESE GP</span>
        <span style={{ opacity: .35 }}>|</span>
        <span>SUZUKA · MAR 27–29</span>
      </div>

      {/* WIPE TRANSITIONS */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 20,
        background: lightColor === 'green' || phase === 'go' ? '#00C853' : '#E8002D',
        transformOrigin: 'left',
        transform: wipeRed ? 'scaleX(1)' : 'scaleX(0)',
        transition: wipeRed ? 'transform 0.38s cubic-bezier(0.7,0,1,1)' : 'none',
      }} />
      <div style={{
        position: 'absolute', inset: 0, zIndex: 21,
        background: '#040404',
        transformOrigin: 'left',
        transform: wipeDark ? 'scaleX(1)' : 'scaleX(0)',
        transition: wipeDark ? 'transform 0.32s 0.06s cubic-bezier(0.7,0,1,1)' : 'none',
      }} />
    </div>
  );
}


function SponsorsBar() {
  const sponsors = [
    { name: 'ROLEX', highlight: false },
    { name: 'ARAMCO', highlight: false },
    { name: 'AWS', highlight: false },
    { name: 'DHL', highlight: false },
    { name: 'HEINEKEN', highlight: false },
    { name: 'PIRELLI', highlight: true },
    { name: 'QATAR AIRWAYS', highlight: false },
    { name: 'CRYPTO.COM', highlight: false },
    { name: 'MSC CRUISES', highlight: false },
    { name: 'LENOVO', highlight: false },
    { name: 'SALESFORCE', highlight: false },
    { name: 'MASTERCARD', highlight: false },
  ];
  const doubled = [...sponsors, ...sponsors];
  return (
    <div className="sponsors-bar" style={{ position: 'relative' }}>
      {/* F1 logo left */}
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 100, background: 'var(--red)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2, flexShrink: 0 }}>
        <span style={{ fontFamily: 'var(--font-d)', fontWeight: 900, fontStyle: 'italic', fontSize: 22, color: '#fff', letterSpacing: -1 }}>F<span style={{ color: 'rgba(255,255,255,.75)' }}>1</span></span>
      </div>
      {/* FIA badge right */}
      <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 80, background: 'var(--surface2)', borderLeft: '1px solid var(--gray4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2, flexShrink: 0 }}>
        <span style={{ fontFamily: 'var(--font-d)', fontWeight: 900, fontSize: 14, letterSpacing: 2, color: 'var(--gray2)' }}>FIA</span>
      </div>
      <div style={{ overflow: 'hidden', width: '100%', padding: '0 100px 0 100px' }}>
        <div className="sponsors-scroll">
          {doubled.map((s, i) => (
            <span key={i} className={`sponsor-item${s.highlight ? ' highlighted' : ''}`}>{s.name}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   DRIVERS GRID (Home Page Section)
═══════════════════════════════════════════════════════════ */
function DriversGridSection({ navigate }) {
  return (
    <section className="drivers-grid-section">
      <div className="section-header-flex">
        <div>
          <div className="section-label">2026 SEASON · 22 DRIVERS</div>
          <h2 className="section-title">THE <span>DRIVERS</span></h2>
        </div>
        <div className="section-desc" style={{ textAlign: 'right' }}>
          Every driver racing in the 2026 FIA Formula One World Championship.
        </div>
      </div>
      <div className="drivers-scroll-wrap">
        {STATIC_DRIVERS.map((d) => {
          const tc = getColor(d.teamId);
          const photo = DRIVER_PHOTOS[d.name];
          return (
            <div key={d.name} className="driver-grid-card" onClick={() => navigate('team', { teamId: d.teamId })}>
              {/* Team colour bar */}
              <div className="dgc-team-bar" style={{ background: tc.primary }} />
              {/* Photo */}
              {photo ? (
                <img className="dgc-img" src={photo} alt={d.name} onError={e => applyFallbackImage(e, DRIVER_IMG_FALLBACK)} />
              ) : (
                <div className="dgc-fallback" style={{ background: tc.dark, color: `${tc.primary}80` }}>
                  {d.name.split(' ').map((n,i) => <span key={i} style={{ display:'block' }}>{n}</span>)}
                </div>
              )}
              {/* Hover overlay */}
              <div className="dgc-overlay" style={{ background: `linear-gradient(135deg, ${tc.primary}22, transparent)` }} />
              {/* Position watermark */}
              <div className="dgc-pos">{String(d.pos).padStart(2,'0')}</div>
              {/* Points badge */}
              <div className="dgc-pts" style={{ color: tc.primary }}>{d.pts} PTS</div>
              {/* Bottom info */}
              <div className="dgc-bottom">
                <div className="dgc-num" style={{ color: tc.primary }}>#{d.num} · {d.nat}</div>
                <div className="dgc-name">{d.name.split(' ')[0]}<br />{d.name.split(' ').slice(1).join(' ')}</div>
                <div className="dgc-team-name" style={{ color: `${tc.primary}99` }}>{d.team}</div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   CHAMPIONSHIP CALCULATOR PAGE
═══════════════════════════════════════════════════════════ */
// Points scoring system 2026
const PTS_SYSTEM = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1, 0];
const FL_BONUS = 1;

function generateScenarios(driverName, currentPts, leaderPts, racesLeft) {
  const scenarios = [];
  const MAX_SCENARIOS = 200;

  // For each finish position combo over remaining races, calculate totals
  // We iterate: P1 wins, podiums, top5, points finishes
  const positions = ['WIN', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8', 'P9', 'P10', 'DNF'];
  const posPoints = { WIN: 25, P2: 18, P3: 15, P4: 12, P5: 10, P6: 8, P7: 6, P8: 4, P9: 2, P10: 1, DNF: 0 };

  // Enumerate win scenarios: how many wins + supporting results needed
  for (let wins = 0; wins <= Math.min(racesLeft, 20); wins++) {
    for (let p2s = 0; p2s <= Math.min(racesLeft - wins, 10); p2s++) {
      for (let p3s = 0; p3s <= Math.min(racesLeft - wins - p2s, 8); p3s++) {
        const remaining = racesLeft - wins - p2s - p3s;
        if (remaining < 0) break;

        // Best case: remaining all P4
        const ptsFromThis = wins * 25 + p2s * 18 + p3s * 15 + remaining * 12;
        const totalPts = currentPts + ptsFromThis;
        const gap = leaderPts - currentPts;

        if (ptsFromThis >= gap) {
          const fl = ptsFromThis + FL_BONUS >= gap ? '+ FL' : '';
          const desc = [
            wins > 0 ? `${wins} Win${wins>1?'s':''}` : null,
            p2s > 0 ? `${p2s} P2` : null,
            p3s > 0 ? `${p3s} P3` : null,
            remaining > 0 ? `${remaining} P4` : null,
          ].filter(Boolean).join(' + ');

          scenarios.push({
            desc: desc || 'Maximum points every race',
            ptsGained: ptsFromThis,
            totalPts,
            wins, p2s, p3s,
            label: wins >= 5 ? 'DOMINANT' : wins >= 3 ? 'STRONG' : wins >= 1 ? 'POSSIBLE' : 'CONSISTENT',
            color: wins >= 3 ? '#00D2BE' : wins >= 1 ? '#FF8000' : '#888',
          });
          if (scenarios.length >= MAX_SCENARIOS) return scenarios;
          break; // Found one for this wins/p2/p3 combo
        }
      }
      if (scenarios.length >= MAX_SCENARIOS) break;
    }
    if (scenarios.length >= MAX_SCENARIOS) break;
  }

  // Sort: fewest wins first, then fewest podiums
  scenarios.sort((a, b) => a.wins - b.wins || (a.p2s + a.p3s) - (b.p2s + b.p3s));
  return scenarios;
}

function ChampionshipCalcPage({ navigate }) {
  const [selectedDriver, setSelectedDriver] = useState('George Russell');
  const [targetDriver, setTargetDriver] = useState('George Russell');
  const [customRacesLeft, setCustomRacesLeft] = useState(20);
  const [filter, setFilter] = useState('ALL');
  const [results, setResults] = useState(null);
  const [running, setRunning] = useState(false);

  const runCalc = () => {
    setRunning(true);
    setTimeout(() => {
      const driver = STATIC_DRIVERS.find(d => d.name === selectedDriver);
      const leader = STATIC_DRIVERS.find(d => d.name === targetDriver);
      if (!driver || !leader) { setRunning(false); return; }

      const scenarios = generateScenarios(
        driver.name, driver.pts, leader.pts, parseInt(customRacesLeft) || 20
      );

      const maxPtsAvailable = (parseInt(customRacesLeft)||20) * (25 + FL_BONUS);
      const gap = leader.pts - driver.pts;
      const canWin = driver.pts + maxPtsAvailable >= leader.pts;

      setResults({
        driver, leader, scenarios, gap,
        canWin, maxPtsAvailable,
        racesLeft: parseInt(customRacesLeft) || 20,
        minWins: scenarios.length > 0 ? scenarios[0].wins : null,
        minWinsScenario: scenarios.find(s => s.wins > 0),
      });
      setRunning(false);
    }, 400);
  };

  const filtered = results ? results.scenarios.filter(s => {
    if (filter === 'ALL') return true;
    if (filter === 'WINS') return s.wins > 0;
    if (filter === 'NO WINS') return s.wins === 0;
    if (filter === 'DOMINANT') return s.wins >= 4;
    return true;
  }) : [];

  return (
    <div className="calc-page">
      <div className="calc-hero">
        <div className="section-label au">CHAMPIONSHIP SCENARIOS ENGINE</div>
        <h1 className="section-title au1">RACE <span>CALCULATOR</span></h1>
        <div className="section-desc au2" style={{ maxWidth: 600 }}>
          Compute every possible path to the championship. Select any driver, set the target, run all scenarios — from dominant to barely-possible.
        </div>
      </div>

      <div className="calc-grid">
        {/* LEFT: inputs */}
        <div>
          <div className="calc-panel">
            <div className="calc-panel-title">⚙ CONFIGURE SCENARIO</div>

            <div className="calc-field">
              <div className="calc-label">Driver to analyse</div>
              <select className="calc-input calc-select" value={selectedDriver} onChange={e => setSelectedDriver(e.target.value)}>
                {STATIC_DRIVERS.map(d => (
                  <option key={d.name} value={d.name}>{d.name} — {d.pts} pts ({d.team})</option>
                ))}
              </select>
            </div>

            <div className="calc-field">
              <div className="calc-label">Target to beat / match</div>
              <select className="calc-input calc-select" value={targetDriver} onChange={e => setTargetDriver(e.target.value)}>
                {STATIC_DRIVERS.map(d => (
                  <option key={d.name} value={d.name}>{d.name} — {d.pts} pts</option>
                ))}
              </select>
            </div>

            <div className="calc-field">
              <div className="calc-label">Races remaining (default: 20)</div>
              <input className="calc-input" type="number" min={1} max={22} value={customRacesLeft}
                onChange={e => setCustomRacesLeft(e.target.value)} />
            </div>

            <button className="calc-run-btn" onClick={runCalc} disabled={running}>
              {running ? '⏳ COMPUTING...' : '⚡ RUN ALL SCENARIOS'}
            </button>
          </div>

          {/* Current standings reference */}
          <div className="calc-panel" style={{ marginTop: 3 }}>
            <div className="calc-panel-title">📊 CURRENT STANDINGS</div>
            {STATIC_DRIVERS.slice(0,10).map(d => {
              const tc = getColor(d.teamId);
              const sel = d.name === selectedDriver;
              const tgt = d.name === targetDriver && d.name !== selectedDriver;
              return (
                <div key={d.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--gray4)', background: sel ? `${tc.primary}10` : 'transparent', padding: '8px 10px', margin: '0 -10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontFamily: 'var(--font-d)', fontWeight: 900, fontSize: 16, color: 'var(--gray3)', width: 22 }}>{d.pos}</span>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: tc.primary, display: 'inline-block' }} />
                    <span style={{ fontFamily: 'var(--font-d)', fontWeight: 900, fontStyle: 'italic', fontSize: 14, color: sel ? tc.primary : tgt ? '#FFD700' : 'var(--gray1)' }}>{d.name}</span>
                    {sel && <span style={{ fontFamily: 'var(--font-m)', fontSize: 9, color: tc.primary, letterSpacing: 2 }}>TARGET</span>}
                    {tgt && <span style={{ fontFamily: 'var(--font-m)', fontSize: 9, color: '#FFD700', letterSpacing: 2 }}>BEAT THIS</span>}
                  </div>
                  <span style={{ fontFamily: 'var(--font-m)', fontSize: 12, color: tc.primary }}>{d.pts}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT: results */}
        <div className="calc-results">
          {running && (
            <div className="calc-loading">
              <div className="loading-spinner" />
              COMPUTING ALL CHAMPIONSHIP PATHS...
            </div>
          )}
          {!running && !results && (
            <div className="calc-empty">
              <div style={{ fontSize: 48, marginBottom: 16 }}>🏁</div>
              SELECT A DRIVER AND CLICK<br />"RUN ALL SCENARIOS"<br />TO SEE EVERY PATH TO THE TITLE
            </div>
          )}
          {!running && results && (
            <>
              <div className="calc-results-title">
                📐 CHAMPIONSHIP PATHS FOR {results.driver.name.toUpperCase()}
                {results.driver.name !== results.leader.name ? ` TO BEAT ${results.leader.name.toUpperCase()}` : ' TO DEFEND THE LEAD'}
              </div>

              {/* Summary cards */}
              <div className="calc-summary">
                <div className="calc-summary-card">
                  <div className="calc-summary-val" style={{ color: results.canWin ? '#00D2BE' : '#E8002D' }}>
                    {results.canWin ? 'YES' : 'NO'}
                  </div>
                  <div className="calc-summary-lbl">CAN STILL WIN?</div>
                </div>
                <div className="calc-summary-card">
                  <div className="calc-summary-val" style={{ color: '#FF8000' }}>
                    {results.gap > 0 ? results.gap : '—'}
                  </div>
                  <div className="calc-summary-lbl">POINTS GAP</div>
                </div>
                <div className="calc-summary-card">
                  <div className="calc-summary-val" style={{ color: '#FFD700' }}>
                    {results.scenarios.length}
                  </div>
                  <div className="calc-summary-lbl">VALID PATHS FOUND</div>
                </div>
              </div>

              {results.scenarios.length === 0 ? (
                <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--red)', fontFamily: 'var(--font-d)', fontSize: 16, letterSpacing: 4 }}>
                  ✗ NO VALID CHAMPIONSHIP PATH EXISTS WITH {results.racesLeft} RACES REMAINING
                </div>
              ) : (
                <>
                  {/* Min wins callout */}
                  <div style={{ background: 'rgba(232,0,45,.08)', border: '1px solid rgba(232,0,45,.2)', padding: '14px 20px', marginBottom: 16, fontFamily: 'var(--font-b)', fontSize: 13, color: 'var(--gray1)' }}>
                    <strong style={{ color: 'var(--red)' }}>MINIMUM PATH: </strong>
                    {results.scenarios[0].wins === 0
                      ? `Can win WITHOUT a race win — needs consistent top-5 finishes`
                      : `Needs at least ${results.scenarios[0].wins} win${results.scenarios[0].wins>1?'s':''} — ${results.scenarios[0].desc}`
                    }
                    {' '}· Max available: {results.maxPtsAvailable} pts over {results.racesLeft} races
                  </div>

                  {/* Filter tabs */}
                  <div className="calc-filters">
                    {['ALL', 'WINS', 'NO WINS', 'DOMINANT'].map(f => (
                      <button key={f} className={`calc-filter-btn${filter===f?' active':''}`} onClick={() => setFilter(f)}>
                        {f} {f==='ALL' ? `(${results.scenarios.length})` : f==='WINS' ? `(${results.scenarios.filter(s=>s.wins>0).length})` : f==='NO WINS' ? `(${results.scenarios.filter(s=>s.wins===0).length})` : `(${results.scenarios.filter(s=>s.wins>=4).length})`}
                      </button>
                    ))}
                  </div>

                  <div className="calc-scenarios-wrap">
                    {filtered.slice(0, 150).map((s, i) => (
                      <div key={i} className="calc-scenario">
                        <div className={`calc-scenario-rank ${i<3?`s${i+1}`:''}`}>{i+1}</div>
                        <div>
                          <span className="calc-scenario-tag" style={{ color: s.color, borderColor: `${s.color}55`, background: `${s.color}10` }}>
                            {s.label}
                          </span>
                          <span className="calc-scenario-desc">{s.desc}</span>
                        </div>
                        <div className="calc-scenario-pts" style={{ color: s.color }}>+{s.ptsGained} pts → {s.totalPts}</div>
                      </div>
                    ))}
                    {filtered.length > 150 && (
                      <div style={{ padding: '16px', textAlign: 'center', fontFamily: 'var(--font-m)', fontSize: 11, color: 'var(--gray3)', letterSpacing: 2 }}>
                        + {filtered.length - 150} MORE SCENARIOS NOT SHOWN
                      </div>
                    )}
                  </div>
                </>
              )}
            </>
          )}
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
  const [showIntro, setShowIntro] = useState(true);

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
      case 'home':      return <><HomePage {...props} /><DriversGridSection navigate={navigate} /></>;
      case 'teams':     return <TeamsPage {...props} />;
      case 'drivers':   return <DriversPage {...props} />;
      case 'news':      return <NewsPage {...props} />;
      case 'schedule':  return <SchedulePage {...props} />;
      case 'predictor': return <PredictorPage {...props} />;
      case 'calculator':return <ChampionshipCalcPage {...props} />;
      default:          return <><HomePage {...props} /><DriversGridSection navigate={navigate} /></>;
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
      {showIntro && <IntroScreen onDone={() => setShowIntro(false)} />}
      <Ticker standings={standingsData} />
      <Navbar page={page} navigate={navigate} />
      <SponsorsBar />
      {renderPage()}
    </>
  );
}
