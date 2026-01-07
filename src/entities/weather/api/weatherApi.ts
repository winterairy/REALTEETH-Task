import { apiClient } from "@/shared/api";
import type { WeatherData } from "../model/types";

const API_KEY = import.meta.env.VITE_API_KEY;

if (!API_KEY) {
  console.warn("VITE_API_KEY가 .env 파일에 없습니다.");
}

/**
 * 현재 위치의 날씨 정보를 가져옵니다.
 * @param lat - 위도
 * @param lon - 경도
 * @returns Promise<WeatherData> - 날씨 데이터
 */
export const getWeatherByCoordinates = async (
  lat: number,
  lon: number
): Promise<WeatherData> => {
  if (!API_KEY) {
    throw new Error("OpenWeatherMap API key가 없습니다.");
  }

  return apiClient.get<WeatherData>(
    `/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}`
  );
};
