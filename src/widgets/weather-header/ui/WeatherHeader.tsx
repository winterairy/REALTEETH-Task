import type { WeatherData } from "@/entities/weather";

interface WeatherHeaderProps {
  weather: WeatherData;
}

export const WeatherHeader = ({ weather }: WeatherHeaderProps) => {
  return (
    <div className="text-center mb-8">
      <h2 className="text-2xl md:text-3xl font-light mb-2">
        {weather.location}
      </h2>
      <div className="text-7xl md:text-9xl font-thin mb-4">
        {weather.currentTemp}°
      </div>
    </div>
  );
};
