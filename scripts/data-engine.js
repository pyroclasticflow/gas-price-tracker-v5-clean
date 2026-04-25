const fs = require("fs");

const API_KEY = process.env.EIA_KEY;

const STATES = [
  { code: "AL", name: "Alabama", lat: 32.8, lon: -86.8, mult: 0.92 },
  { code: "AK", name: "Alaska", lat: 64.2, lon: -152.4, mult: 1.20 },
  { code: "AZ", name: "Arizona", lat: 34.0, lon: -111.1, mult: 0.97 },
  { code: "AR", name: "Arkansas", lat: 34.8, lon: -92.2, mult: 0.91 },
  { code: "CA", name: "California", lat: 36.8, lon: -119.4, mult: 1.25 },
  { code: "CO", name: "Colorado", lat: 39.0, lon: -105.5, mult: 1.00 },
  { code: "CT", name: "Connecticut", lat: 41.6, lon: -72.7, mult: 1.10 },
  { code: "DE", name: "Delaware", lat: 39.0, lon: -75.5, mult: 1.05 },
  { code: "FL", name: "Florida", lat: 27.7, lon: -81.5, mult: 1.00 },
  { code: "GA", name: "Georgia", lat: 32.7, lon: -83.4, mult: 0.95 },
  { code: "HI", name: "Hawaii", lat: 20.8, lon: -156.3, mult: 1.35 },
  { code: "ID", name: "Idaho", lat: 44.2, lon: -114.5, mult: 1.02 },
  { code: "IL", name: "Illinois", lat: 40.0, lon: -89.2, mult: 1.08 },
  { code: "IN", name: "Indiana", lat: 40.0, lon: -86.1, mult: 0.97 },
  { code: "IA", name: "Iowa", lat: 42.0, lon: -93.5, mult: 0.96 },
  { code: "KS", name: "Kansas", lat: 38.5, lon: -98.0, mult: 0.93 },
  { code: "KY", name: "Kentucky", lat: 37.8, lon: -84.3, mult: 0.95 },
  { code: "LA", name: "Louisiana", lat: 31.0, lon: -92.0, mult: 0.90 },
  { code: "ME", name: "Maine", lat: 45.2, lon: -69.0, mult: 1.12 },
  { code: "MD", name: "Maryland", lat: 39.0, lon: -76.7, mult: 1.05 },
  { code: "MA", name: "Massachusetts", lat: 42.3, lon: -71.8, mult: 1.15 },
  { code: "MI", name: "Michigan", lat: 44.3, lon: -85.6, mult: 1.00 },
  { code: "MN", name: "Minnesota", lat: 46.0, lon: -94.0, mult: 1.02 },
  { code: "MS", name: "Mississippi", lat: 32.7, lon: -89.7, mult: 0.89 },
  { code: "MO", name: "Missouri", lat: 38.5, lon: -92.5, mult: 0.92 },
  { code: "MT", name: "Montana", lat: 46.9, lon: -110.0, mult: 1.05 },
  { code: "NE", name: "Nebraska", lat: 41.5, lon: -99.7, mult: 0.95 },
  { code: "NV", name: "Nevada", lat: 39.3, lon: -116.6, mult: 1.08 },
  { code: "NH", name: "New Hampshire", lat: 43.6, lon: -71.6, mult: 1.10 },
  { code: "NJ", name: "New Jersey", lat: 40.1, lon: -74.7, mult: 1.07 },
  { code: "NM", name: "New Mexico", lat: 34.4, lon: -106.1, mult: 0.94 },
  { code: "NY", name: "New York", lat: 42.9, lon: -75.5, mult: 1.18 },
  { code: "NC", name: "North Carolina", lat: 35.6, lon: -79.4, mult: 0.96 },
  { code: "ND", name: "North Dakota", lat: 47.5, lon: -100.5, mult: 1.00 },
  { code: "OH", name: "Ohio", lat: 40.3, lon: -82.8, mult: 0.98 },
  { code: "OK", name: "Oklahoma", lat: 35.6, lon: -97.5, mult: 0.90 },
  { code: "OR", name: "Oregon", lat: 43.9, lon: -120.6, mult: 1.12 },
  { code: "PA", name: "Pennsylvania", lat: 41.2, lon: -77.2, mult: 1.10 },
  { code: "RI", name: "Rhode Island", lat: 41.7, lon: -71.5, mult: 1.15 },
  { code: "SC", name: "South Carolina", lat: 33.8, lon: -80.9, mult: 0.94 },
  { code: "SD", name: "South Dakota", lat: 44.4, lon: -100.2, mult: 0.98 },
  { code: "TN", name: "Tennessee", lat: 35.7, lon: -86.6, mult: 0.94 },
  { code: "TX", name: "Texas", lat: 31.0, lon: -99.0, mult: 0.91 },
  { code: "UT", name: "Utah", lat: 39.3, lon: -111.7, mult: 0.99 },
  { code: "VT", name: "Vermont", lat: 44.0, lon: -72.7, mult: 1.14 },
  { code: "VA", name: "Virginia", lat: 37.5, lon: -78.7, mult: 1.02 },
  { code: "WA", name: "Washington", lat: 47.4, lon: -120.7, mult: 1.14 },
  { code: "WV", name: "West Virginia", lat: 38.6, lon: -80.6, mult: 1.00 },
  { code: "WI", name: "Wisconsin", lat: 44.5, lon: -89.5, mult: 1.02 },
  { code: "WY", name: "Wyoming", lat: 43.0, lon: -107.5, mult: 1.03 }
];

async function fetchEIA() {
  const url =
    `https://api.eia.gov/v2/petroleum/pri/gnd/data/?api_key=${API_KEY}` +
    `&frequency=weekly&data[0]=value&sort[0][column]=period&sort[0][direction]=desc` +
    `&offset=0&length=52`;

  const res = await fetch(url);
  const json = await res.json();

  if (!json.response || !json.response.data) {
    throw new Error("EIA API returned unexpected response");
  }

  return json.response.data;
}

function buildStateData(eiaData) {
  const latest = eiaData[0];
  const usAvg = parseFloat(latest.value);

  const usHistory = eiaData.map(row => ({
    date: row.period,
    price: parseFloat(row.value)
  })).reverse();

  const output = {};

  STATES.forEach(state => {
    const history = usHistory.map(h => ({
      date: h.date,
      price: +(h.price * state.mult).toFixed(2)
    }));

    output[state.code] = {
      code: state.code,
      name: state.name,
      lat: state.lat,
      lon: state.lon,
      regular: +(usAvg * state.mult).toFixed(2),
      history
    };
  });

  return output;
}

async function run() {
  if (!API_KEY) {
    throw new Error("Missing EIA_KEY secret");
  }

  console.log("Fetching EIA gas data...");
  const eiaData = await fetchEIA();

  console.log("Building state model...");
  const stateModel = buildStateData(eiaData);

  fs.mkdirSync("data", { recursive: true });

  fs.writeFileSync(
    "data/state-model.json",
    JSON.stringify(stateModel, null, 2)
  );

  console.log("Saved data/state-model.json");
}

run();
