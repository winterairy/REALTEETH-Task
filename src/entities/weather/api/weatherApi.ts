import { getFormattedDate } from "@/shared/lib/date";
import { toGridPoint } from "@/shared/lib/geoGrid";
import type { WeatherData } from "../model/types";

const BASE_URL =
  "http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst";
const SERVICE_KEY = import.meta.env.VITE_API_KEY as string | undefined;

if (!SERVICE_KEY) {
  console.warn(".env 파일에 VITE_API_KEY가 없습니다");
}

export interface KmaApiItem {
  baseDate: string;
  baseTime: string;
  category: string;
  fcstDate: string;
  fcstTime: string;
  fcstValue: string;
  nx: number;
  ny: number;
}

export interface KmaApiResponse {
  response: {
    header: {
      resultCode: string;
      resultMsg: string;
    };
    body: {
      dataType: string;
      items: {
        item: KmaApiItem[];
      };
      numOfRows: number;
      pageNo: number;
      totalCount: number;
    };
  };
}

export const getVilageFcst = async (
  lat: number,
  lon: number
): Promise<KmaApiResponse> => {
  if (!SERVICE_KEY) {
    throw new Error("공공 날씨 API를 위한 API 키가 없습니다");
  }

  const { x, y } = toGridPoint(lat, lon);

  const queryParams = new URLSearchParams({
    serviceKey: SERVICE_KEY!,
    pageNo: "1",
    numOfRows: "1000",
    dataType: "JSON",
    base_date: getFormattedDate(),
    base_time: "0200",
    nx: String(x),
    ny: String(y),
  });

  return new Promise<KmaApiResponse>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", `${BASE_URL}?${queryParams.toString()}`);

    xhr.onreadystatechange = function () {
      if (this.readyState === 4) {
        if (this.status === 200) {
          try {
            const data = JSON.parse(this.responseText) as KmaApiResponse;
            console.log("KMA getVilageFcst response:", data);

            if (data.response?.header?.resultCode !== "00") {
              const errorMsg =
                data.response?.header?.resultMsg || "알 수 없는 오류";

              if (
                data.response?.header?.resultCode === "03" ||
                data.response?.header?.resultCode === "05" ||
                errorMsg.includes("조회") ||
                errorMsg.includes("데이터") ||
                errorMsg.includes("정보")
              ) {
                reject(new Error("해당 장소의 정보가 제공되지 않습니다."));
              } else {
                reject(
                  new Error(
                    `기상청 API 오류: ${errorMsg} (코드: ${data.response?.header?.resultCode})`
                  )
                );
              }
              return;
            }

            resolve(data);
          } catch (error) {
            reject(
              new Error(
                `JSON 파싱 오류: ${
                  error instanceof Error ? error.message : "알 수 없는 오류"
                }`
              )
            );
          }
        } else {
          reject(new Error(`API 오류: ${this.status} ${this.statusText}`));
        }
      }
    };

    xhr.onerror = function () {
      reject(new Error("네트워크 오류가 발생했습니다."));
    };

    xhr.send("");
  });
};

const getCurrentDateStr = (): string => {
  const currentDate = new Date();
  return (
    currentDate.getFullYear().toString() +
    String(currentDate.getMonth() + 1).padStart(2, "0") +
    String(currentDate.getDate()).padStart(2, "0")
  );
};

const getCurrentTimeSlot = (): string => {
  const currentHour = new Date().getHours();
  return String(currentHour).padStart(2, "0") + "00";
};

const getSortedTempItems = (items: KmaApiItem[]): KmaApiItem[] => {
  return items
    .filter((item) => item.category === "TMP")
    .sort((a, b) => {
      const dateTimeA = a.fcstDate + a.fcstTime;
      const dateTimeB = b.fcstDate + b.fcstTime;
      return dateTimeA.localeCompare(dateTimeB);
    });
};

export const parseWeatherData = (
  apiResponse: KmaApiResponse,
  location: string = "현재 위치"
): WeatherData => {
  if (
    !apiResponse.response?.body?.items?.item ||
    apiResponse.response.body.items.item.length === 0 ||
    apiResponse.response.body.totalCount === 0
  ) {
    throw new Error("해당 장소의 정보가 제공되지 않습니다.");
  }

  const items = apiResponse.response.body.items.item;
  const currentDateStr = getCurrentDateStr();
  const currentTimeSlot = getCurrentTimeSlot();
  const currentHour = new Date().getHours();

  const sortedTempItems = getSortedTempItems(items);

  const currentDateTime = currentDateStr + currentTimeSlot;

  const currentTempItem =
    sortedTempItems.find(
      (item) => item.fcstDate + item.fcstTime >= currentDateTime
    ) || sortedTempItems[0];
  const currentTemp = currentTempItem
    ? parseFloat(currentTempItem.fcstValue)
    : 0;

  const maxTempItem = items.find(
    (item) => item.fcstDate === currentDateStr && item.category === "TMX"
  );
  const maxTemp = maxTempItem ? parseFloat(maxTempItem.fcstValue) : currentTemp;

  const minTempItem = items.find(
    (item) => item.fcstDate === currentDateStr && item.category === "TMN"
  );
  const minTemp = minTempItem ? parseFloat(minTempItem.fcstValue) : currentTemp;

  const currentIndex = sortedTempItems.findIndex(
    (item) => item.fcstDate + item.fcstTime >= currentDateTime
  );
  const startIndex = currentIndex >= 0 ? currentIndex : 0;

  const tempItems = sortedTempItems
    .slice(startIndex, startIndex + 8)
    .map((item) => ({
      time: `${item.fcstTime.slice(0, 2)}:${item.fcstTime.slice(2, 4)}`,
      temp: parseFloat(item.fcstValue),
    }));

  const hourlyTemps = Array.from({ length: 8 }, (_, i) => {
    if (tempItems[i]) {
      return tempItems[i];
    }
    const lastTemp = tempItems[tempItems.length - 1]?.temp ?? currentTemp;
    const lastTime = tempItems[tempItems.length - 1]?.time;
    if (lastTime) {
      const timeMatch = lastTime.match(/^(\d{2}):(\d{2})/);
      if (timeMatch) {
        const lastHour = parseInt(timeMatch[1]);
        const nextHour = (lastHour + (i - tempItems.length + 1)) % 24;
        return {
          time: `${String(nextHour).padStart(2, "0")}:00`,
          temp: lastTemp,
        };
      }
    }
    return {
      time: `${String((currentHour + i) % 24).padStart(2, "0")}:00`,
      temp: lastTemp,
    };
  });

  return {
    location,
    currentTemp,
    maxTemp,
    minTemp,
    hourlyTemps,
  };
};
