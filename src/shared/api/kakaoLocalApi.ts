const KAKAO_API_KEY = import.meta.env.VITE_KAKAO_API_KEY as string | undefined;
const KAKAO_BASE_URL = "https://dapi.kakao.com/v2/local";

if (!KAKAO_API_KEY) {
  console.warn(".env 파일에 VITE_KAKAO_API_KEY가 없습니다");
}

const getHeaders = () => ({
  Authorization: `KakaoAK ${KAKAO_API_KEY}`,
});

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

export const addressToCoord = async (
  query: string
): Promise<AddressToCoordResponse> => {
  if (!KAKAO_API_KEY) {
    throw new Error("카카오 API 키가 없습니다");
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

export const coordToRegion = async (
  longitude: number,
  latitude: number
): Promise<CoordToRegionResponse> => {
  if (!KAKAO_API_KEY) {
    throw new Error("카카오 API 키가 없습니다");
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

export const coordToAddress = async (
  longitude: number,
  latitude: number
): Promise<CoordToAddressResponse> => {
  if (!KAKAO_API_KEY) {
    throw new Error("카카오 API 키가 없습니다");
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

export const getRegionNameFromCoord = async (
  longitude: number,
  latitude: number
): Promise<string> => {
  try {
    const regionData = await coordToRegion(longitude, latitude);
    
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

    const addressData = await coordToAddress(longitude, latitude);
    if (addressData.documents[0]?.address?.address_name) {
      return addressData.documents[0].address.address_name;
    }
    if (addressData.documents[0]?.road_address?.address_name) {
      return addressData.documents[0].road_address.address_name;
    }

    return "알 수 없는 위치";
  } catch (error) {
    console.error("좌표로부터 지역명을 가져오는데 실패했습니다:", error);
    return "알 수 없는 위치";
  }
};
