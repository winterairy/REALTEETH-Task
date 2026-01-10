import { formattedDate } from "@/shared/lib/date";
import { toGridPoint } from "@/shared/lib/geoGrid";
import type { WeatherData } from "../model/types";

const BASE_URL =
  "http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst";
const SERVICE_KEY = import.meta.env.VITE_API_KEY as string | undefined;

if (!SERVICE_KEY) {
  console.warn("VITE_API_KEY is missing in .env.");
}

// 기상청 단기예보 API 응답 타입 정의
interface KmaApiItem {
  baseDate: string;
  baseTime: string;
  category: string;
  fcstDate: string;
  fcstTime: string;
  fcstValue: string;
  nx: number;
  ny: number;
}

interface KmaApiResponse {
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

/**
 * 단기예보 API를 호출합니다.
 * @param lat - 위도
 * @param lon - 경도
 * @returns Promise<KmaApiResponse> - API 응답 데이터
 */
export const getVilageFcst = async (
  lat: number,
  lon: number
): Promise<KmaApiResponse> => {
  if (!SERVICE_KEY) {
    throw new Error("Missing VITE_API_KEY for public weather API.");
  }

  const { x, y } = toGridPoint(lat, lon);

  // 샘플 코드와 동일한 방식으로 쿼리 파라미터 구성
  const url = BASE_URL;
  let queryParams =
    "?" +
    encodeURIComponent("serviceKey") +
    "=" +
    encodeURIComponent(SERVICE_KEY);
  queryParams +=
    "&" + encodeURIComponent("pageNo") + "=" + encodeURIComponent("1");
  queryParams +=
    "&" + encodeURIComponent("numOfRows") + "=" + encodeURIComponent("1000");
  queryParams +=
    "&" + encodeURIComponent("dataType") + "=" + encodeURIComponent("JSON");
  queryParams +=
    "&" +
    encodeURIComponent("base_date") +
    "=" +
    encodeURIComponent(formattedDate);
  queryParams +=
    "&" + encodeURIComponent("base_time") + "=" + encodeURIComponent("0200");
  queryParams +=
    "&" + encodeURIComponent("nx") + "=" + encodeURIComponent(String(x));
  queryParams +=
    "&" + encodeURIComponent("ny") + "=" + encodeURIComponent(String(y));

  return new Promise<KmaApiResponse>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", url + queryParams);

    xhr.onreadystatechange = function () {
      if (this.readyState === 4) {
        if (this.status === 200) {
          try {
            const data = JSON.parse(this.responseText) as KmaApiResponse;
            console.log("KMA getVilageFcst response:", data);

            // 기상청 API는 HTTP 200이어도 body에 에러 코드를 포함할 수 있음
            if (data.response?.header?.resultCode !== "00") {
              const errorMsg =
                data.response?.header?.resultMsg || "알 수 없는 오류";
              reject(
                new Error(
                  `기상청 API 오류: ${errorMsg} (코드: ${data.response?.header?.resultCode})`
                )
              );
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
          reject(new Error(`API Error: ${this.status} ${this.statusText}`));
        }
      }
    };

    xhr.onerror = function () {
      reject(new Error("네트워크 오류가 발생했습니다."));
    };

    xhr.send("");
  });
};

/**
 * 기상청 API 응답을 WeatherData 형식으로 변환합니다.
 * @param apiResponse - 기상청 API 응답 데이터
 * @param location - 지역명 (선택사항)
 * @returns WeatherData - 변환된 날씨 데이터
 */
export const parseWeatherData = (
  apiResponse: KmaApiResponse,
  location: string = "현재 위치"
): WeatherData => {
  const items = apiResponse.response.body.items.item;

  // 현재 날짜와 시간을 YYYYMMDD, HHmm 형식으로 가져오기
  const currentDate = new Date();
  const currentDateStr =
    currentDate.getFullYear().toString() +
    String(currentDate.getMonth() + 1).padStart(2, "0") +
    String(currentDate.getDate()).padStart(2, "0");

  // 현재 시간을 시간 단위로 가져오기 (예: 15:30 → 15)
  const currentHour = currentDate.getHours();
  // 현재 시간이 포함된 시간대를 HH00 형식으로 변환 (예: 15:30 → "1500")
  const currentTimeSlot = String(currentHour).padStart(2, "0") + "00";

  // 1. 현재 기온: 현재 날짜와 현재 시간이 포함된 시간대에 해당하는 category가 "TMP"인 item의 fcstValue
  // 현재 시간보다 크거나 같은 가장 가까운 시간대를 찾음
  const tempItemsForCurrent = items
    .filter(
      (item) => item.fcstDate === currentDateStr && item.category === "TMP"
    )
    .sort((a, b) => {
      const timeA = parseInt(a.fcstTime);
      const timeB = parseInt(b.fcstTime);
      return timeA - timeB;
    });

  // 현재 시간보다 크거나 같은 가장 가까운 시간대 찾기
  const currentTempItem =
    tempItemsForCurrent.find(
      (item) => parseInt(item.fcstTime) >= parseInt(currentTimeSlot)
    ) || tempItemsForCurrent[0]; // 없으면 가장 첫 번째 항목 사용

  const currentTemp = currentTempItem
    ? parseFloat(currentTempItem.fcstValue)
    : 0;

  // 2. 최고기온: fcstDate가 현재 날짜이고 category가 "TMX"인 item의 fcstValue
  const maxTempItem = items.find(
    (item) => item.fcstDate === currentDateStr && item.category === "TMX"
  );
  const maxTemp = maxTempItem ? parseFloat(maxTempItem.fcstValue) : currentTemp;

  // 3. 최저기온: fcstDate가 현재 날짜이고 category가 "TMN"인 item의 fcstValue
  const minTempItem = items.find(
    (item) => item.fcstDate === currentDateStr && item.category === "TMN"
  );
  const minTemp = minTempItem ? parseFloat(minTempItem.fcstValue) : currentTemp;

  // 4. 시간대별 기온: 현재 시간부터 시작해서 category가 "TMP"인 데이터를 8개 가져오기
  const allTempItems = items
    .filter(
      (item) => item.fcstDate === currentDateStr && item.category === "TMP"
    )
    .sort((a, b) => {
      const timeA = parseInt(a.fcstTime);
      const timeB = parseInt(b.fcstTime);
      return timeA - timeB;
    });

  // 현재 시간부터 시작하는 항목들의 인덱스 찾기
  const currentIndex = allTempItems.findIndex(
    (item) => parseInt(item.fcstTime) >= parseInt(currentTimeSlot)
  );
  const startIndex = currentIndex >= 0 ? currentIndex : 0;

  // 현재 시간부터 시작해서 8개 가져오기
  const tempItems = allTempItems
    .slice(startIndex, startIndex + 8)
    .map((item) => ({
      time: `${item.fcstTime.slice(0, 2)}:${item.fcstTime.slice(2, 4)}`,
      temp: parseFloat(item.fcstValue),
    }));

  // 8개가 안 되면 나머지를 마지막 온도로 채우기
  const hourlyTemps = Array.from({ length: 8 }, (_, i) => {
    if (tempItems[i]) {
      return tempItems[i];
    }
    // 마지막 온도 값 사용하거나 현재 온도 사용
    const lastTemp = tempItems[tempItems.length - 1]?.temp ?? currentTemp;
    const lastTime = tempItems[tempItems.length - 1]?.time;
    if (lastTime) {
      const [lastHour] = lastTime.split(":").map(Number);
      const nextHour = (lastHour + (i - tempItems.length + 1)) % 24;
      return {
        time: `${String(nextHour).padStart(2, "0")}:00`,
        temp: lastTemp,
      };
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
