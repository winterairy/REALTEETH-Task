import type { WeatherData } from "./types";

// 더미 날씨 데이터
export const mockWeatherData: WeatherData = {
  location: "서울특별시",
  currentTemp: 15,
  maxTemp: 18,
  minTemp: 8,
  hourlyTemps: [
    { time: "00:00", temp: 10 },
    { time: "03:00", temp: 9 },
    { time: "06:00", temp: 8 },
    { time: "09:00", temp: 12 },
    { time: "12:00", temp: 15 },
    { time: "15:00", temp: 17 },
    { time: "18:00", temp: 16 },
    { time: "21:00", temp: 13 },
  ],
};
