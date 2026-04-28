// Server-only forecast fetcher. Mirrors lib/ingestion/enrich-weather.ts but
// hits the forecast endpoint and is intended for render-time use with ISR
// rather than ingestion-time JSON enrichment.
//
// Returns undefined when the date is beyond the 16-day forecast horizon or
// on any fetch / parse failure. Callers render "—" in that case.

import type { Weather } from "@/lib/data";

const LAT = 47.5721;
const LON = -122.4064;
const TZ = "America/Los_Angeles";

// Open-Meteo's free forecast endpoint reliably returns 16 days ahead.
const FORECAST_HORIZON_DAYS = 16;

// Six-hour ISR. Forecasts shift slowly; this avoids hammering the upstream
// while still keeping the page reasonably fresh between deploys.
const REVALIDATE_SECONDS = 60 * 60 * 6;

type ForecastResponse = {
  hourly: {
    time: string[];
    temperature_2m: number[];
    weather_code: number[];
    wind_speed_10m: number[];
  };
};

function describeWeatherCode(code: number): string {
  if (code === 0) return "Clear";
  if (code >= 1 && code <= 3) {
    return code === 1 ? "Mostly clear" : code === 2 ? "Partly cloudy" : "Overcast";
  }
  if (code === 45 || code === 48) return "Fog";
  if (code >= 51 && code <= 67) return "Rain";
  if (code >= 71 && code <= 77) return "Snow";
  if (code >= 80 && code <= 82) return "Rain showers";
  if (code === 85 || code === 86) return "Snow showers";
  if (code >= 95 && code <= 99) return "Thunderstorm";
  return "Unknown";
}

function cToF(c: number): number {
  return Math.round((c * 9) / 5 + 32);
}

function kmhToMph(kmh: number): number {
  return Math.round(kmh / 1.609344);
}

function targetHour(startTime: string): number {
  const m = /^(\d{1,2}):(\d{2})\s*(am|pm)$/i.exec(startTime.trim());
  if (!m) return 12;
  let h = parseInt(m[1], 10);
  const ampm = m[3].toLowerCase();
  if (ampm === "pm" && h !== 12) h += 12;
  if (ampm === "am" && h === 12) h = 0;
  return h;
}

function daysFromToday(dateIso: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(`${dateIso}T00:00:00`);
  const ms = target.getTime() - today.getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

export async function getForecast(
  dateIso: string,
  startTime: string,
): Promise<Weather | undefined> {
  const days = daysFromToday(dateIso);
  if (days < 0 || days > FORECAST_HORIZON_DAYS) return undefined;

  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(LAT));
  url.searchParams.set("longitude", String(LON));
  url.searchParams.set("start_date", dateIso);
  url.searchParams.set("end_date", dateIso);
  url.searchParams.set(
    "hourly",
    "temperature_2m,weather_code,wind_speed_10m",
  );
  url.searchParams.set("timezone", TZ);

  try {
    const res = await fetch(url, {
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) return undefined;
    const body = (await res.json()) as ForecastResponse;
    const hour = targetHour(startTime);
    const idx = body.hourly.time.findIndex((t) => {
      const h = parseInt(t.split("T")[1].split(":")[0], 10);
      return h === hour;
    });
    if (idx === -1) return undefined;

    const tempC = body.hourly.temperature_2m[idx];
    const code = body.hourly.weather_code[idx];
    const windKmh = body.hourly.wind_speed_10m[idx];
    if (tempC == null || code == null) return undefined;

    const tempF = cToF(tempC);
    const conditions = describeWeatherCode(code);
    const windMph = kmhToMph(windKmh ?? 0);

    let summary = `${tempF}°F · ${conditions}`;
    if (windMph >= 5) summary += ` · ${windMph} mph wind`;

    const weather: Weather = { tempF, conditions, summary };
    if (windMph >= 5) weather.windMph = windMph;
    return weather;
  } catch {
    return undefined;
  }
}
