import type { Coordinates } from "@/shared/model/coords";

export type { Coordinates } from "@/shared/model/coords";

export interface GeolocationError {
  code: number;
  message: string;
}

export const getCurrentPosition = (): Promise<Coordinates> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject({
        code: 0,
        message: "위치를 확인할 수 없습니다.",
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        reject({
          code: error.code,
          message: error.message,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0,
      }
    );
  });
};
