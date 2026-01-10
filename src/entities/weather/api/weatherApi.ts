import { formattedDate, formattedTime } from "@/shared/lib/date";
import { toGridPoint } from "@/shared/lib/geoGrid";
import type { WeatherData } from "../model/types";

const BASE_URL =
  "http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst";
const SERVICE_KEY = import.meta.env.VITE_API_KEY as string | undefined;

if (!SERVICE_KEY) {
  console.warn("VITE_API_KEY is missing in .env.");
}

// 기상청 API 응답 타입 정의
interface KmaApiItem {
  baseDate: string;
  baseTime: string;
  category: string;
  nx: number;
  ny: number;
  obsValue: string;
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
 * 초단기실황조회 API를 호출합니다.
 * @param lat - 위도
 * @param lon - 경도
 * @returns Promise<KmaApiResponse> - API 응답 데이터
 */
export const getUltraSrtNcst = async (
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
    "&" +
    encodeURIComponent("base_time") +
    "=" +
    encodeURIComponent(formattedTime);
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
            console.log("KMA getUltraSrtNcst response:", data);

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

  // 카테고리별로 데이터 추출
  const getValue = (category: string): number | null => {
    const item = items.find((i) => i.category === category);
    return item ? parseFloat(item.obsValue) : null;
  };

  // TMP: 기온 (℃)
  const currentTemp = getValue("TMP") ?? 0;

  // 초단기실황조회는 현재 시점 데이터만 제공하므로,
  // 시간별 데이터는 현재 온도만 반복하여 표시
  const now = new Date();
  const hourlyTemps = Array.from({ length: 8 }, (_, i) => {
    const hour = (now.getHours() + i) % 24;
    return {
      time: `${String(hour).padStart(2, "0")}:00`,
      temp: currentTemp, // 현재 온도 사용 (실제로는 예보 API 필요)
    };
  });

  return {
    location,
    currentTemp,
    maxTemp: currentTemp + 5, // 임시값 (실제로는 예보 API 필요)
    minTemp: currentTemp - 5, // 임시값 (실제로는 예보 API 필요)
    hourlyTemps,
  };
};
