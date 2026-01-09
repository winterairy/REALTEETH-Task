import type { WeatherData } from "@/entities/weather";
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from "@heroicons/react/24/outline";

interface TemperatureRangeProps {
  weather: WeatherData;
}

export const TemperatureRange = ({ weather }: TemperatureRangeProps) => {
  return (
    <div className="flex justify-center items-center gap-4 mb-8">
      <div className="flex items-center gap-2">
        <ArrowTrendingUpIcon className="h-5 w-5" />
        <span className="text-xl font-medium">최고 {weather.maxTemp}°</span>
      </div>
      <div className="w-px h-6 bg-white/30"></div>
      <div className="flex items-center gap-2">
        <ArrowTrendingDownIcon className="h-5 w-5" />
        <span className="text-xl font-medium">최저 {weather.minTemp}°</span>
      </div>
    </div>
  );
};
