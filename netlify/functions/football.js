const fetch = require('node-fetch'); // jeśli używasz fetch w Node.js

const BASE = 'https://api.football-data.org/v2';
const TEAM_ID = process.env.MC_TEAM_ID || '65';
const API_KEY = process.env.FOOTBALL_DATA_API_KEY;

module.exports.handler = async function(event, context) {
  try {
    const res = await fetch(`${BASE}/teams/${TEAM_ID}`, {
      headers: { 'X-Auth-Token': API_KEY }
    });
    const data = await res.json();
    return {
      statusCode: 200,
      body: JSON.stringify(data)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
