// 날씨 엔티티 타입 정의

export interface HourlyTemperature {
  time: string;
  temp: number;
}

export type WeatherData = {
  location: string;
  currentTemp: number;
  maxTemp: number;
  minTemp: number;
  hourlyTemps: HourlyTemperature[];
};
