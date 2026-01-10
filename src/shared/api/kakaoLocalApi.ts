/**
 * 카카오 Local API 클라이언트
 * https://developers.kakao.com/docs/latest/ko/local/dev-guide
 */

const KAKAO_API_KEY = import.meta.env.VITE_KAKAO_API_KEY as string | undefined;
const KAKAO_BASE_URL = "https://dapi.kakao.com/v2/local";

if (!KAKAO_API_KEY) {
  console.warn("VITE_KAKAO_API_KEY is missing in .env");
}

/**
 * 카카오 API 요청 헤더
 */
const getHeaders = () => ({
  Authorization: `KakaoAK ${KAKAO_API_KEY}`,
});

/**
 * 주소로 좌표 변환 API 응답 타입
 */
export interface AddressToCoordResponse {
  meta: {
    total_count: number;
    pageable_count: number;
    is_end: boolean;
  };
  documents: Array<{
    address_name: string;
    address_type: string;
    x: string; // 경도 (longitude)
    y: string; // 위도 (latitude)
    address?: {
      address_name: string;
      region_1depth_name: string;
      region_2depth_name: string;
      region_3depth_name: string;
      x: string;
      y: string;
    };
    road_address?: {
      address_name: string;
      region_1depth_name: string;
      region_2depth_name: string;
      region_3depth_name: string;
      road_name: string;
      x: string;
      y: string;
    };
  }>;
}

/**
 * 좌표로 행정구역정보 변환 API 응답 타입
 */
export interface CoordToRegionResponse {
  meta: {
    total_count: number;
  };
  documents: Array<{
    region_type: "H" | "B"; // H: 행정동, B: 법정동
    address_name: string;
    region_1depth_name: string;
    region_2depth_name: string;
    region_3depth_name: string;
    region_4depth_name: string;
    code: string;
    x: number;
    y: number;
  }>;
}

/**
 * 좌표로 주소 변환 API 응답 타입
 */
export interface CoordToAddressResponse {
  meta: {
    total_count: number;
  };
  documents: Array<{
    address?: {
      address_name: string;
      region_1depth_name: string;
      region_2depth_name: string;
      region_3depth_name: string;
      mountain_yn: string;
      main_address_no: string;
      sub_address_no: string;
    };
    road_address?: {
      address_name: string;
      region_1depth_name: string;
      region_2depth_name: string;
      region_3depth_name: string;
      road_name: string;
      underground_yn: string;
      main_building_no: string;
      sub_building_no: string;
      building_name: string;
      zone_no: string;
    };
  }>;
}

/**
 * 주소로 좌표 변환
 * @param query - 검색할 주소
 * @returns Promise<AddressToCoordResponse>
 */
export const addressToCoord = async (
  query: string
): Promise<AddressToCoordResponse> => {
  if (!KAKAO_API_KEY) {
    throw new Error("VITE_KAKAO_API_KEY is missing");
  }

  const params = new URLSearchParams({
    query,
    analyze_type: "similar", // 유사 매칭 허용
  });

  const response = await fetch(
    `${KAKAO_BASE_URL}/search/address.json?${params.toString()}`,
    {
      headers: getHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error(
      `카카오 Local API 오류: ${response.status} ${response.statusText}`
    );
  }

  const data = (await response.json()) as AddressToCoordResponse;

  if (data.meta.total_count === 0) {
    throw new Error("검색 결과가 없습니다.");
  }

  return data;
};

/**
 * 좌표로 행정구역정보 변환 (법정동 우선)
 * @param longitude - 경도
 * @param latitude - 위도
 * @returns Promise<CoordToRegionResponse>
 */
export const coordToRegion = async (
  longitude: number,
  latitude: number
): Promise<CoordToRegionResponse> => {
  if (!KAKAO_API_KEY) {
    throw new Error("VITE_KAKAO_API_KEY is missing");
  }

  const params = new URLSearchParams({
    x: String(longitude),
    y: String(latitude),
    input_coord: "WGS84",
    output_coord: "WGS84",
  });

  const response = await fetch(
    `${KAKAO_BASE_URL}/geo/coord2regioncode.json?${params.toString()}`,
    {
      headers: getHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error(
      `카카오 Local API 오류: ${response.status} ${response.statusText}`
    );
  }

  const data = (await response.json()) as CoordToRegionResponse;

  return data;
};

/**
 * 좌표로 주소 변환
 * @param longitude - 경도
 * @param latitude - 위도
 * @returns Promise<CoordToAddressResponse>
 */
export const coordToAddress = async (
  longitude: number,
  latitude: number
): Promise<CoordToAddressResponse> => {
  if (!KAKAO_API_KEY) {
    throw new Error("VITE_KAKAO_API_KEY is missing");
  }

  const params = new URLSearchParams({
    x: String(longitude),
    y: String(latitude),
    input_coord: "WGS84",
  });

  const response = await fetch(
    `${KAKAO_BASE_URL}/geo/coord2address.json?${params.toString()}`,
    {
      headers: getHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error(
      `카카오 Local API 오류: ${response.status} ${response.statusText}`
    );
  }

  const data = (await response.json()) as CoordToAddressResponse;

  return data;
};

/**
 * 좌표로 법정동 이름 가져오기
 * @param longitude - 경도
 * @param latitude - 위도
 * @returns Promise<string> - 법정동 주소명
 */
export const getRegionNameFromCoord = async (
  longitude: number,
  latitude: number
): Promise<string> => {
  try {
    const regionData = await coordToRegion(longitude, latitude);
    
    // 법정동(B) 우선, 없으면 행정동(H) 사용
    const legalDistrict = regionData.documents.find(
      (doc) => doc.region_type === "B"
    );
    const administrativeDistrict = regionData.documents.find(
      (doc) => doc.region_type === "H"
    );

    const district = legalDistrict || administrativeDistrict;
    
    if (district) {
      return district.address_name;
    }

    // 행정구역 정보가 없으면 주소 변환 API 사용
    const addressData = await coordToAddress(longitude, latitude);
    if (addressData.documents[0]?.address?.address_name) {
      return addressData.documents[0].address.address_name;
    }
    if (addressData.documents[0]?.road_address?.address_name) {
      return addressData.documents[0].road_address.address_name;
    }

    return "알 수 없는 위치";
  } catch (error) {
    console.error("Failed to get region name from coord:", error);
    return "알 수 없는 위치";
  }
};
