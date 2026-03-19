// pages/api/news.js
// Fetches real-time F1 news from free RSS feeds
// No API key required

import { XMLParser } from 'fast-xml-parser';

const RSS_FEEDS = [
  { url: 'https://www.autosport.com/rss/f1/news/', source: 'Autosport', category: 'RACE REPORT' },
  { url: 'https://www.motorsport.com/rss/f1/news/', source: 'Motorsport', category: 'LATEST' },
  { url: 'https://www.racefans.net/feed/', source: 'RaceFans', category: 'ANALYSIS' },
];

const FALLBACK_NEWS = [
  {
    id: '1',
    title: 'ANTONELLI CLAIMS MAIDEN F1 VICTORY AT CHINESE GRAND PRIX',
    summary: 'Kimi Antonelli delivered a masterful drive to claim his first Formula 1 victory at the Shanghai International Circuit, beating Ferrari\'s Charles Leclerc and teammate George Russell.',
    category: 'RACE REPORT',
    source: 'F1 Hub',
    date: 'Mar 23, 2026',
    link: '#',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
  },
  {
    id: '2',
    title: 'RUSSELL EXTENDS CHAMPIONSHIP LEAD DESPITE SECOND PLACE FINISH',
    summary: 'George Russell maintains a 4-point advantage over Kimi Antonelli in the World Drivers Championship despite finishing third in China.',
    category: 'CHAMPIONSHIP',
    source: 'F1 Hub',
    date: 'Mar 23, 2026',
    link: '#',
    image: 'https://images.unsplash.com/photo-1600710575219-c9cb0eda4d60?w=800&q=80',
  },
  {
    id: '3',
    title: 'VERSTAPPEN STRUGGLES AS RED BULL FACE NEW-ERA REGULATION CHALLENGE',
    summary: 'Max Verstappen could only manage P7 in China as Red Bull continue to search for answers with the RB22 under the 2026 technical regulations.',
    category: 'TECHNICAL',
    source: 'F1 Hub',
    date: 'Mar 22, 2026',
    link: '#',
    image: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&q=80',
  },
  {
    id: '4',
    title: 'BEARMAN IMPRESSES WITH BACK-TO-BACK P5 FINISHES FOR HAAS',
    summary: 'Oliver Bearman has scored points in both races this season for the MoneyGram Haas team, proving himself as one of the standout performers of the 2026 campaign.',
    category: 'DRIVER',
    source: 'F1 Hub',
    date: 'Mar 23, 2026',
    link: '#',
    image: 'https://images.unsplash.com/photo-1560253023-3ec5d502959f?w=800&q=80',
  },
  {
    id: '5',
    title: 'SUZUKA PREVIEW: CAN FERRARI CLOSE THE GAP TO MERCEDES?',
    summary: 'All eyes turn to the Japanese Grand Prix as Ferrari look to convert their China pace into a race victory at the technical Suzuka circuit.',
    category: 'PREVIEW',
    source: 'F1 Hub',
    date: 'Mar 24, 2026',
    link: '#',
    image: 'https://images.unsplash.com/photo-1593280405106-e438ebe93f5a?w=800&q=80',
  },
];

const CATEGORIES = ['RACE REPORT', 'CHAMPIONSHIP', 'TECHNICAL', 'DRIVER', 'TEAM', 'PREVIEW', 'ANALYSIS'];

function guessCat(title) {
  const t = title.toLowerCase();
  if (t.includes('preview') || t.includes('preview')) return 'PREVIEW';
  if (t.includes('race') || t.includes('gp') || t.includes('grand prix')) return 'RACE REPORT';
  if (t.includes('champion')) return 'CHAMPIONSHIP';
  if (t.includes('technical') || t.includes('engine') || t.includes('car') || t.includes('aero')) return 'TECHNICAL';
  if (t.includes('driver') || t.includes('contract') || t.includes('seat')) return 'DRIVER';
  if (t.includes('team') || t.includes('constructor')) return 'TEAM';
  return CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
}

function formatDate(dateStr) {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch { return dateStr; }
}

function stripHtml(html) {
  return (html || '').replace(/<[^>]*>/g, '').replace(/&[a-z]+;/gi, ' ').trim().slice(0, 200);
}

async function fetchRSS(feed) {
  const res = await fetch(feed.url, {
    headers: { 'Accept': 'application/rss+xml, application/xml, text/xml', 'User-Agent': 'F1Hub/1.0' },
    signal: AbortSignal.timeout(6000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const xml = await res.text();

  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });
  const parsed = parser.parse(xml);
  const items = parsed?.rss?.channel?.item || parsed?.feed?.entry || [];
  const arr = Array.isArray(items) ? items : [items];

  return arr.slice(0, 8).map((item, i) => {
    const title = item.title?.['#text'] || item.title || 'Untitled';
    const desc = item.description?.['#text'] || item.description || item.summary?.['#text'] || item.summary || '';
    const link = item.link?.['@_href'] || (typeof item.link === 'string' ? item.link : '#');
    const pubDate = item.pubDate || item.published || item.updated || '';
    const encImg = item.enclosure?.['@_url'] || item['media:content']?.['@_url'] || '';

    return {
      id: `${feed.source}-${i}-${Date.now()}`,
      title: stripHtml(typeof title === 'string' ? title : JSON.stringify(title)).toUpperCase(),
      summary: stripHtml(desc),
      category: guessCat(title),
      source: feed.source,
      date: formatDate(pubDate),
      link,
      image: encImg || `https://images.unsplash.com/photo-${1558618666 + i}?w=800&q=80`,
    };
  });
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=1200');

  const results = await Promise.allSettled(RSS_FEEDS.map(feed => fetchRSS(feed)));
  const articles = results
    .filter(r => r.status === 'fulfilled')
    .flatMap(r => r.value)
    .filter(a => a.title && a.title.length > 5);

  if (articles.length >= 3) {
    // Deduplicate by similar titles
    const seen = new Set();
    const unique = articles.filter(a => {
      const key = a.title.slice(0, 40);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return res.status(200).json({
      source: 'rss',
      lastUpdated: new Date().toISOString(),
      articles: unique.slice(0, 12),
    });
  }

  // Fallback
  res.status(200).json({
    source: 'static',
    lastUpdated: new Date().toISOString(),
    articles: FALLBACK_NEWS,
  });
}
