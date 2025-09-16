const fetch = require('node-fetch');

const BASE = 'https://api.football-data.org/v2';
const TEAM_ID = process.env.MC_TEAM_ID || '65'; // 65 = Manchester City
const API_KEY = process.env.FOOTBALL_DATA_API_KEY;

let cache = { table: { ts: 0, data: null }, last: { ts: 0, data: null }, next: { ts: 0, data: null } };
const TTL = 30 * 1000; // cache 30 sekund

exports.handler = async function(event) {
  if (!API_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Missing FOOTBALL_DATA_API_KEY' }) };
  }

  const type = (event.queryStringParameters && event.queryStringParameters.type) || 'table';

  if (cache[type] && (Date.now() - cache[type].ts) < TTL) {
    return { statusCode: 200, body: JSON.stringify(cache[type].data) };
  }

  const headers = { 'X-Auth-Token': API_KEY };

  try {
    if (type === 'table') {
      const res = await fetch(`${BASE}/competitions/PL/standings`, { headers });
      const json = await res.json();
      const standings = json.standings.find(s => s.type === 'TOTAL');
      const table = standings.table.map(r => ({
        pos: r.position,
        team: r.team.name,
        pts: r.points,
        played: r.playedGames,
        gd: r.goalDifference
      }));
      cache.table = { ts: Date.now(), data: table };
      return { statusCode: 200, body: JSON.stringify(table) };
    }

    if (type === 'last') {
      const res = await fetch(`${BASE}/teams/${TEAM_ID}/matches?status=FINISHED&limit=1`, { headers });
      const json = await res.json();
      const m = json.matches[0];
      const out = {
        date: m.utcDate,
        home: m.homeTeam.name,
        away: m.awayTeam.name,
        score: `${m.score.fullTime.homeTeam}–${m.score.fullTime.awayTeam}`,
        comp: m.competition.name
      };
      cache.last = { ts: Date.now(), data: out };
      return { statusCode: 200, body: JSON.stringify(out) };
    }

    if (type === 'next') {
      const res = await fetch(`${BASE}/teams/${TEAM_ID}/matches?status=SCHEDULED&limit=1`, { headers });
      const json = await res.json();
      const m = json.matches[0];
      const out = {
        date: m.utcDate,
        home: m.homeTeam.name,
        away: m.awayTeam.name,
        comp: m.competition.name
      };
      cache.next = { ts: Date.now(), data: out };
      return { statusCode: 200, body: JSON.stringify(out) };
    }

    return { statusCode: 400, body: JSON.stringify({ error: 'Unknown type' }) };

  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: String(err) }) };
  }
};
