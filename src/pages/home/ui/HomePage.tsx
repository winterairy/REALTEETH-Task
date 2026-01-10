import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useWeatherQuery } from "@/entities/weather/api/weatherQuery";
import { getCurrentPosition } from "@/shared/lib/geolocation";
import { getRegionNameFromCoord } from "@/shared/api/kakaoLocalApi";
import { Alert } from "@/shared/ui";
import {
  WeatherNavigation,
  WeatherHeader,
  TemperatureRange,
  HourlyForecast,
} from "@/widgets";

export const HomePage = () => {
  const [searchParams] = useSearchParams();
  const [locationName, setLocationName] = useState<string | undefined>();
  const [coordinates, setCoordinates] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  // URL 쿼리 파라미터에서 좌표 읽기
  useEffect(() => {
    const latParam = searchParams.get("lat");
    const lonParam = searchParams.get("lon");
    const locationParam = searchParams.get("location");

    if (latParam && lonParam) {
      // URL에서 좌표가 있으면 사용
      const lat = parseFloat(latParam);
      const lon = parseFloat(lonParam);
      
      if (!isNaN(lat) && !isNaN(lon)) {
        setCoordinates({ latitude: lat, longitude: lon });
        setLocationName(locationParam ? decodeURIComponent(locationParam) : undefined);
      }
    } else {
      // URL에 좌표가 없으면 현재 위치 가져오기
      const fetchCurrentLocation = async () => {
        try {
          const pos = await getCurrentPosition();
          setCoordinates(pos);

          // 카카오 API로 장소 이름 가져오기
          const regionName = await getRegionNameFromCoord(
            pos.longitude,
            pos.latitude
          );
          setLocationName(regionName);
        } catch (error) {
          console.error("Failed to get current location:", error);
          setLocationName("현재 위치");
        }
      };

      fetchCurrentLocation();
    }
  }, [searchParams]);

  const { data: weatherData, isLoading, error } = useWeatherQuery(
    coordinates,
    locationName
  );

  // 에러 발생 시 팝업 표시
  useEffect(() => {
    if (error) {
      const errorMessage =
        error instanceof Error
          ? error.message === "해당 장소의 정보가 제공되지 않습니다."
            ? "해당 장소의 정보가 제공되지 않습니다."
            : error.message
          : "날씨 데이터를 가져오는데 실패했습니다.";
      setAlertMessage(errorMessage);
      setIsAlertOpen(true);
    }
  }, [error]);

  // locationName이 업데이트되면 날씨 데이터의 location도 업데이트
  const weatherDataWithLocation = weatherData
    ? { ...weatherData, location: locationName || weatherData.location }
    : weatherData;

  return (
    <>
      <Alert
        message={alertMessage || "오류가 발생했습니다."}
        isOpen={isAlertOpen}
        onClose={() => setIsAlertOpen(false)}
        type="error"
      />
      <div className="min-h-screen bg-linear-to-br from-blue-400 via-blue-500 to-blue-600 text-white">
        <WeatherNavigation />
        <div className="container mx-auto px-4 pb-8">
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-lg">날씨 데이터를 불러오는 중...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-lg text-yellow-200">
                {error instanceof Error
                  ? error.message === "해당 장소의 정보가 제공되지 않습니다."
                    ? "해당 장소의 정보가 제공되지 않습니다."
                    : error.message
                  : "날씨 데이터를 가져오는데 실패했습니다."}
              </p>
              {error instanceof Error &&
              error.message !== "해당 장소의 정보가 제공되지 않습니다." ? (
                <p className="text-sm mt-2 opacity-75">기본 데이터를 표시합니다.</p>
              ) : null}
            </div>
          ) : weatherDataWithLocation ? (
            <>
              <WeatherHeader weather={weatherDataWithLocation} />
              <TemperatureRange weather={weatherDataWithLocation} />
              <HourlyForecast weather={weatherDataWithLocation} />
            </>
          ) : null}
        </div>
      </div>
    </>
  );
};
