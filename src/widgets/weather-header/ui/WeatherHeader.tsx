import type { WeatherData } from "@/entities/weather";

interface WeatherHeaderProps {
  weather: WeatherData;
}

export const WeatherHeader = ({ weather }: WeatherHeaderProps) => {
  return (
    <div className="text-center mb-8">
      <div className="text-7xl md:text-9xl font-thin mb-4">
        {weather.currentTemp}°
      </div>
    </div>
  );
};
