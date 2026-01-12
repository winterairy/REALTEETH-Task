import { useState, useRef, useEffect, type ReactElement } from "react";
import { useNavigate } from "react-router-dom";

export const SearchBar = (): ReactElement => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

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
    navigate("/");
  };

  const showResults: boolean = isFocused;

  return (
    <>
      {isFocused && (
        <div
          className="fixed inset-0 bg-white bg-opacity-50 z-40"
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
            className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-all"
          />

          {showResults && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto">
              <div className="px-4 py-8 text-center text-gray-500">
                검색어를 입력하세요
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
