import type { WeatherData } from "./types";

// 더미 날씨 데이터 (에러 표시용 - 모든 수치가 0)
export const mockWeatherData: WeatherData = {
  location: "서울특별시",
  currentTemp: 0,
  maxTemp: 0,
  minTemp: 0,
  hourlyTemps: [
    { time: "00:00", temp: 0 },
    { time: "03:00", temp: 0 },
    { time: "06:00", temp: 0 },
    { time: "09:00", temp: 0 },
    { time: "12:00", temp: 0 },
    { time: "15:00", temp: 0 },
    { time: "18:00", temp: 0 },
    { time: "21:00", temp: 0 },
  ],
};
