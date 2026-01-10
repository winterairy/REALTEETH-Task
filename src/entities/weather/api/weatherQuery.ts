import { useQuery } from "@tanstack/react-query";
import { getCurrentPosition } from "@/shared/lib/geolocation";
import { getVilageFcst, parseWeatherData } from "./weatherApi";
import { mockWeatherData } from "../model/mock-data";
import type { WeatherData } from "../model/types";

/**
 * 현재 위치 기반 날씨 데이터를 가져오는 Query Key
 */
export const weatherQueryKeys = {
  all: ["weather"] as const,
  current: () => [...weatherQueryKeys.all, "current"] as const,
};

/**
 * 현재 위치의 날씨 데이터를 가져오는 함수
 */
const fetchWeatherData = async (): Promise<WeatherData> => {
  try {
    // 현재 위치 가져오기
    const { latitude, longitude } = await getCurrentPosition();

    // 날씨 데이터 가져오기
    const apiResponse = await getVilageFcst(latitude, longitude);

    // API 응답을 WeatherData 형식으로 변환
    return parseWeatherData(apiResponse, "현재 위치");
  } catch (error) {
    console.error("Failed to fetch weather data:", error);
    // 에러 발생 시 mock 데이터 반환
    return mockWeatherData;
  }
};

/**
 * 현재 위치의 날씨 데이터를 가져오는 useQuery 훅
 */
export const useWeatherQuery = () => {
  return useQuery({
    queryKey: weatherQueryKeys.current(),
    queryFn: fetchWeatherData,
    staleTime: 1000 * 60 * 5, // 5분간 fresh 상태 유지
    gcTime: 1000 * 60 * 10, // 10분간 캐시 유지
  });
};
