import { mockWeatherData } from "@/entities/weather";
import {
  WeatherNavigation,
  WeatherHeader,
  TemperatureRange,
  HourlyForecast,
} from "@/widgets";

export const HomePage = () => {
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-400 via-blue-500 to-blue-600 text-white">
      <WeatherNavigation />
      <div className="container mx-auto px-4 pb-8">
        <WeatherHeader weather={mockWeatherData} />
        <TemperatureRange weather={mockWeatherData} />
        <HourlyForecast weather={mockWeatherData} />
      </div>
    </div>
  );
};
