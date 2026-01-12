import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { getCurrentPosition } from "@/shared/lib/geolocation";
import { getVilageFcst, parseWeatherData } from "./weatherApi";
import { mockWeatherData } from "../model/mock-data";
import type { WeatherData } from "../model/types";

export interface Coordinates {
  latitude: number;
  longitude: number;
}

type WeatherQueryOptions = Omit<
  UseQueryOptions<WeatherData, Error>,
  "queryKey" | "queryFn"
>;

/**
 * 날씨 데이터를 가져오는 Query Key
 */
export const weatherQueryKeys = {
  all: ["weather"] as const,
  current: () => [...weatherQueryKeys.all, "current"] as const,
  byCoordinates: (lat: number, lon: number) =>
    [...weatherQueryKeys.all, "coordinates", lat, lon] as const,
};

/**
 * 좌표 기반 날씨 데이터를 가져오는 함수
 */
const fetchWeatherDataByCoordinates = async (
  coordinates: Coordinates | null,
  locationName?: string
): Promise<WeatherData> => {
  let lat: number;
  let lon: number;
  const location: string = locationName || "현재 위치";

  if (coordinates) {
    lat = coordinates.latitude;
    lon = coordinates.longitude;
  } else {
    // 좌표가 없으면 현재 위치 가져오기
    const currentPos = await getCurrentPosition();
    lat = currentPos.latitude;
    lon = currentPos.longitude;
  }

  try {
    // 날씨 데이터 가져오기
    const apiResponse = await getVilageFcst(lat, lon);

    // API 응답을 WeatherData 형식으로 변환
    return parseWeatherData(apiResponse, location);
  } catch (error) {
    console.error("Failed to fetch weather data:", error);

    // 날씨 데이터가 없는 경우 에러를 다시 던져서 UI에서 처리하도록 함
    if (
      error instanceof Error &&
      error.message === "해당 장소의 정보가 제공되지 않습니다."
    ) {
      throw error;
    }

    // 다른 에러의 경우 mock 데이터 반환
    return mockWeatherData;
  }
};

/**
 * 날씨 데이터를 가져오는 useQuery 훅
 * @param coordinates - 선택적 좌표 (없으면 현재 위치 사용)
 * @param locationName - 선택적 위치명
 */
export const useWeatherQuery = (
  coordinates?: Coordinates | null,
  locationName?: string,
  options?: WeatherQueryOptions
) => {
  return useQuery({
    queryKey: coordinates
      ? weatherQueryKeys.byCoordinates(
          coordinates.latitude,
          coordinates.longitude
        )
      : weatherQueryKeys.current(),
    queryFn: () =>
      fetchWeatherDataByCoordinates(coordinates || null, locationName),
    enabled: !!coordinates, // coordinates가 설정될 때까지 비활성화
    staleTime: 1000 * 60 * 5, // 5분간 fresh 상태 유지
    gcTime: 1000 * 60 * 10, // 10분간 캐시 유지
    ...options,
  });
};
