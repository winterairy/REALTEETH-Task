import type { WeatherData } from "@/entities/weather";

interface HourlyForecastProps {
  weather: WeatherData;
}

export const HourlyForecast = ({ weather }: HourlyForecastProps) => {
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-xl">
      <h3 className="text-lg font-medium mb-4">시간대별 기온</h3>
      <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
        {weather.hourlyTemps.map((hour, index) => (
          <div
            key={index}
            className="flex flex-col items-center gap-2 p-3 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            <span className="text-sm text-white/80">{hour.time}</span>
            <span className="text-xl font-semibold">{hour.temp}°</span>
          </div>
        ))}
      </div>
    </div>
  );
};
