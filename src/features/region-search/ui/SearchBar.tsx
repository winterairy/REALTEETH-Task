import { useState, useRef, useEffect, useMemo, type ReactElement } from "react";
import { useNavigate } from "react-router-dom";
import { useDebounce } from "@/shared/lib/useDebounce";

// 지역 데이터 더미
const REGIONS: readonly string[] = [
  "서울특별시",
  "부산광역시",
  "대구광역시",
  "인천광역시",
  "광주광역시",
  "대전광역시",
  "울산광역시",
  "세종특별자치시",
  "경기도",
  "강원도",
  "충청북도",
  "충청남도",
  "전라북도",
  "전라남도",
  "경상북도",
  "경상남도",
  "제주특별자치도",
  "서울 강남구",
  "서울 강동구",
  "서울 강북구",
  "서울 강서구",
  "서울 관악구",
  "서울 광진구",
  "서울 구로구",
  "서울 금천구",
  "서울 노원구",
  "서울 도봉구",
  "서울 동대문구",
  "서울 동작구",
  "서울 마포구",
  "서울 서대문구",
  "서울 서초구",
  "서울 성동구",
  "서울 성북구",
  "서울 송파구",
  "서울 양천구",
  "서울 영등포구",
  "서울 용산구",
  "서울 은평구",
  "서울 종로구",
  "서울 중구",
  "서울 중랑구",
];

// 검색 결과 최대 개수 제한 (성능 최적화)
const MAX_SEARCH_RESULTS = 100;

export const SearchBar = (): ReactElement => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // debounce를 적용한 검색어 (300ms 지연)
  const debouncedSearchQuery = useDebounce<string>(searchQuery, 300);

  // 검색어에 따라 지역 필터링 (debounce된 검색어 사용)
  const filteredRegions: string[] = useMemo<string[]>(() => {
    const query = debouncedSearchQuery.trim();

    if (query === "") {
      return [];
    }

    const lowerQuery = query.toLowerCase();
    const results: string[] = [];

    // 최대 결과 개수 제한으로 조기 종료
    for (const region of REGIONS) {
      if (region.toLowerCase().includes(lowerQuery)) {
        results.push(region);
        if (results.length >= MAX_SEARCH_RESULTS) {
          break;
        }
      }
    }

    return results;
  }, [debouncedSearchQuery]);

  // 외부 클릭 시 focus 해제
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return (): void => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchQuery(e.target.value);
  };

  const handleInputFocus = (): void => {
    setIsFocused(true);
  };

  const handleRegionClick = (): void => {
    setSearchQuery("");
    setIsFocused(false);
    // 메인화면으로 이동 (현재는 홈으로 이동)
    navigate("/");
  };

  const inputClassName = isFocused
    ? "w-full px-4 py-3 text-md text-gray-900 border-2 border-blue-500 rounded-full focus:outline-none focus:border-blue-500 transition-all"
    : "w-full px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50";

  const showResults: boolean = isFocused;

  return (
    <>
      {isFocused && (
        <div
          className="fixed inset-0 z-40 bg-white bg-opacity-50"
          onClick={(): void => setIsFocused(false)}
        />
      )}
      <div ref={searchContainerRef} className="relative">
        <div
          className={`relative transition-all duration-300 ${
            isFocused ? "z-50" : "z-10"
          }`}
          style={
            isFocused
              ? ({
                  position: "fixed",
                  top: "2rem",
                  left: "1rem",
                  right: "1rem",
                  width: "calc(100% - 2rem)",
                } as React.CSSProperties)
              : ({} as React.CSSProperties)
          }
        >
          <input
            type="text"
            value={searchQuery}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            placeholder="지역을 검색하세요"
            className={inputClassName}
          />

          {showResults && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white text-gray-900 border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto">
              {searchQuery.trim() === "" ? (
                <div className="px-4 py-8 text-center text-gray-500">
                  검색어를 입력하세요
                </div>
              ) : filteredRegions.length > 0 ? (
                <ul className="py-2">
                  {filteredRegions.map((region: string, index: number) => (
                    <li
                      key={index}
                      onClick={handleRegionClick}
                      className="px-4 py-3 hover:bg-gray-100 cursor-pointer transition-colors"
                    >
                      {region}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="px-4 py-8 text-center text-gray-500">
                  검색 결과가 없습니다
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
