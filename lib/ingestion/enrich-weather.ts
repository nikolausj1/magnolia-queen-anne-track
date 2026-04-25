import { readFile, writeFile } from "node:fs/promises";
import type { Meet, Weather } from "@/lib/data";

const MEETS_JSON = "data/meets.json";
const LAT = 47.5721;
const LON = -122.4064;
const TZ = "America/Los_Angeles";

type ArchiveResponse = {
  hourly: {
    time: string[];
    temperature_2m: number[];
    precipitation: number[];
    weather_code: number[];
    wind_speed_10m: number[];
  };
};

function describeWeatherCode(code: number): string {
  if (code === 0) return "Clear";
  if (code >= 1 && code <= 3) return code === 1 ? "Mostly clear" : code === 2 ? "Partly cloudy" : "Overcast";
  if (code === 45 || code === 48) return "Fog";
  if (code >= 51 && code <= 67) return "Rain";
  if (code >= 71 && code <= 77) return "Snow";
  if (code >= 80 && code <= 82) return "Rain showers";
  if (code === 85 || code === 86) return "Snow showers";
  if (code >= 95 && code <= 99) return "Thunderstorm";
  return "Unknown";
}

function cToF(c: number): number {
  return Math.round(c * 9 / 5 + 32);
}

function kmhToMph(kmh: number): number {
  return Math.round(kmh / 1.609344);
}

function targetHour(startTime: string): number {
  // accepts "10:00 am" / "1:30 pm"
  const m = /^(\d{1,2}):(\d{2})\s*(am|pm)$/i.exec(startTime.trim());
  if (!m) return 12;
  let h = parseInt(m[1], 10);
  const ampm = m[3].toLowerCase();
  if (ampm === "pm" && h !== 12) h += 12;
  if (ampm === "am" && h === 12) h = 0;
  return h;
}

async function fetchWeather(meet: Meet): Promise<Weather | undefined> {
  const url = new URL("https://archive-api.open-meteo.com/v1/archive");
  url.searchParams.set("latitude", String(LAT));
  url.searchParams.set("longitude", String(LON));
  url.searchParams.set("start_date", meet.date);
  url.searchParams.set("end_date", meet.date);
  url.searchParams.set(
    "hourly",
    "temperature_2m,precipitation,weather_code,wind_speed_10m",
  );
  url.searchParams.set("timezone", TZ);

  const res = await fetch(url);
  if (!res.ok) {
    console.error(
      `  weather lookup failed for ${meet.id}: HTTP ${res.status}`,
    );
    return undefined;
  }
  const body = (await res.json()) as ArchiveResponse;
  const hour = targetHour(meet.startTime);
  const idx = body.hourly.time.findIndex((t) => {
    const h = parseInt(t.split("T")[1].split(":")[0], 10);
    return h === hour;
  });
  if (idx === -1) {
    console.error(`  weather: no hour ${hour} entry for ${meet.id}`);
    return undefined;
  }

  const tempC = body.hourly.temperature_2m[idx];
  const code = body.hourly.weather_code[idx];
  const windKmh = body.hourly.wind_speed_10m[idx];

  if (
    tempC === null ||
    tempC === undefined ||
    code === null ||
    code === undefined
  ) {
    console.error(`  weather: missing fields for ${meet.id}`);
    return undefined;
  }

  const tempF = cToF(tempC);
  const conditions = describeWeatherCode(code);
  const windMph = kmhToMph(windKmh ?? 0);

  let summary = `${tempF}°F · ${conditions}`;
  if (windMph >= 5) summary += ` · ${windMph} mph wind`;

  const weather: Weather = { tempF, conditions, summary };
  if (windMph >= 5) weather.windMph = windMph;
  return weather;
}

async function main() {
  const args = new Set(process.argv.slice(2));
  const force = args.has("--force");
  const onlyArg = process.argv.find((a) => a.startsWith("--only="));
  const onlyId = onlyArg?.split("=", 2)[1];

  const today = new Date().toISOString().slice(0, 10);
  const meets = JSON.parse(await readFile(MEETS_JSON, "utf8")) as Meet[];

  let updated = 0;
  for (const meet of meets) {
    if (onlyId && meet.id !== onlyId) continue;
    if (meet.weather && !force) {
      console.error(`  ${meet.id}: already has weather (use --force to refetch)`);
      continue;
    }
    if (meet.date > today) {
      console.error(`  ${meet.id}: in the future, skipping`);
      continue;
    }
    console.error(`→ ${meet.id} (${meet.date} @ ${meet.startTime})`);
    const weather = await fetchWeather(meet);
    if (weather) {
      meet.weather = weather;
      updated++;
      console.error(`  ✓ ${weather.summary}`);
    }
  }

  if (updated > 0) {
    await writeFile(MEETS_JSON, JSON.stringify(meets, null, 2) + "\n");
    console.error(`✓ Updated ${updated} meet(s) in ${MEETS_JSON}`);
  } else {
    console.error("(no updates)");
  }
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
