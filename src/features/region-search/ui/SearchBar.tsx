import { useState, useRef, useEffect, useMemo, type ReactElement } from "react";
import { useNavigate } from "react-router-dom";
import { useDebounce } from "@/shared/lib/useDebounce";
import { addressToCoord } from "@/shared/api/kakaoLocalApi";
import { Alert } from "@/shared/ui";
import koreaDistricts from "@/assets/korea_districts.json";

const MAX_SEARCH_RESULTS = 100;

export const SearchBar = (): ReactElement => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const debouncedSearchQuery = useDebounce<string>(searchQuery, 300);

  const filteredRegions: string[] = useMemo<string[]>(() => {
    const query = debouncedSearchQuery.trim();

    if (query === "") {
      return [];
    }

    const lowerQuery = query.toLowerCase();
    const results: string[] = [];

    for (const region of koreaDistricts) {
      if (region.toLowerCase().includes(lowerQuery)) {
        results.push(region);
        if (results.length >= MAX_SEARCH_RESULTS) {
          break;
        }
      }
    }

    return results;
  }, [debouncedSearchQuery]);

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

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape" && isFocused) {
        setIsFocused(false);
        if (searchContainerRef.current) {
          const input = searchContainerRef.current.querySelector("input");
          if (input) {
            input.blur();
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return (): void => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isFocused]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchQuery(e.target.value);
  };

  const handleInputFocus = (): void => {
    setIsFocused(true);
  };

  const handleRegionClick = async (region: string): Promise<void> => {
    try {
      setSearchQuery("");
      setIsFocused(false);

      const response = await addressToCoord(region);
      
      if (response.documents.length > 0) {
        const firstResult = response.documents[0];
        const longitude = parseFloat(firstResult.x);
        const latitude = parseFloat(firstResult.y);

        navigate(`/?lat=${latitude}&lon=${longitude}&location=${encodeURIComponent(region)}`);
      } else {
        setAlertMessage("해당 장소의 정보가 제공되지 않습니다.");
        setIsAlertOpen(true);
      }
    } catch (error) {
      console.error("좌표를 가져오는데 실패했습니다:", error);
      const errorMessage =
        error instanceof Error
          ? error.message === "검색 결과가 없습니다." ||
            error.message.includes("정보가 제공되지 않습니다")
            ? "해당 장소의 정보가 제공되지 않습니다."
            : error.message
          : "좌표를 가져오는데 실패했습니다.";
      setAlertMessage(errorMessage);
      setIsAlertOpen(true);
    }
  };

  const inputClassName = isFocused
    ? "w-full px-4 py-3 text-md text-gray-900 border-2 border-blue-500 rounded-full focus:outline-none focus:border-blue-500 transition-all"
    : "w-full px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50";

  const showResults: boolean = isFocused;

  return (
    <>
      <Alert
        message={alertMessage || "오류가 발생했습니다."}
        isOpen={isAlertOpen}
        onClose={() => setIsAlertOpen(false)}
        type="error"
      />
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
                      onClick={() => handleRegionClick(region)}
                      className="px-4 py-3 hover:bg-gray-100 cursor-pointer transition-colors"
                    >
                      {region}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="px-4 py-8 text-center text-gray-500">
                  해당 장소의 정보가 제공되지 않습니다.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
