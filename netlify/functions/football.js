const fetch = require("node-fetch");

const BASE = "https://api.football-data.org/v2";
const TEAM_ID = process.env.MC_TEAM_ID || "65"; // 65 = Manchester City
const API_KEY = process.env.FOOTBALL_DATA_API_KEY;

exports.handler = async (event, context) => {
  const type = event.queryStringParameters.type;

  let url = "";
  if (type === "table") {
    url = `${BASE}/competitions/PL/standings`;
  } else if (type === "matches") {
    url = `${BASE}/teams/${TEAM_ID}/matches?status=FINISHED,LIVE,SCHEDULED&limit=2`;
  } else {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid type parameter" }),
    };
  }

  try {
    const response = await fetch(url, {
      headers: { "X-Auth-Token": API_KEY },
    });

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: "API request failed" }),
      };
    }

    const data = await response.json();
    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal server error", details: err.message }),
    };
  }
};
