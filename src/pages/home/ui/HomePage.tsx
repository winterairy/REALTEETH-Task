import { useWeatherQuery } from "@/entities/weather/api/weatherQuery";
import {
  WeatherNavigation,
  WeatherHeader,
  TemperatureRange,
  HourlyForecast,
} from "@/widgets";

export const HomePage = () => {
  const { data: weatherData, isLoading, error } = useWeatherQuery();

  return (
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
                ? error.message
                : "날씨 데이터를 가져오는데 실패했습니다."}
            </p>
            <p className="text-sm mt-2 opacity-75">기본 데이터를 표시합니다.</p>
          </div>
        ) : weatherData ? (
          <>
            <WeatherHeader weather={weatherData} />
            <TemperatureRange weather={weatherData} />
            <HourlyForecast weather={weatherData} />
          </>
        ) : null}
      </div>
    </div>
  );
};
