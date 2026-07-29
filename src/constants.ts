export interface City {
  name: string;
  timezone: string;
  continent: string;
}

export const CITIES: City[] = [
  { name: "London", timezone: "Europe/London", continent: "Europe" },
  { name: "New York", timezone: "America/New_York", continent: "North America" },
  { name: "Tokyo", timezone: "Asia/Tokyo", continent: "Asia" },
  { name: "Sydney", timezone: "Australia/Sydney", continent: "Oceania" },
  { name: "Cairo", timezone: "Africa/Cairo", continent: "Africa" },
  { name: "São Paulo", timezone: "America/Sao_Paulo", continent: "South America" },
  { name: "Paris", timezone: "Europe/Paris", continent: "Europe" },
  { name: "Los Angeles", timezone: "America/Los_Angeles", continent: "North America" },
  { name: "Dubai", timezone: "Asia/Dubai", continent: "Asia" },
  { name: "Johannesburg", timezone: "Africa/Johannesburg", continent: "Africa" },
  { name: "Buenos Aires", timezone: "America/Argentina/Buenos_Aires", continent: "South America" },
  { name: "Auckland", timezone: "Pacific/Auckland", continent: "Oceania" },
  { name: "Reykjavik", timezone: "Atlantic/Reykjavik", continent: "Europe" },
  { name: "Mumbai", timezone: "Asia/Kolkata", continent: "Asia" },
  { name: "Nairobi", timezone: "Africa/Nairobi", continent: "Africa" },
  { name: "Lima", timezone: "America/Lima", continent: "South America" },
  { name: "Vancouver", timezone: "America/Vancouver", continent: "North America" },
  { name: "Singapore", timezone: "Asia/Singapore", continent: "Asia" },
  { name: "Berlin", timezone: "Europe/Berlin", continent: "Europe" },
  { name: "Casablanca", timezone: "Africa/Casablanca", continent: "Africa" }
];
