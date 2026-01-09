import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input, FavoritesButton } from "@/shared/ui";

export const WeatherNavigation = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleFavoritesClick = () => {
    navigate("/favorites");
  };

  return (
    <nav className="flex items-center justify-between p-4 md:p-6">
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <Input
          type="text"
          placeholder="도시 검색..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
      </div>
      <FavoritesButton aria-label="즐겨찾기" onClick={handleFavoritesClick} />
    </nav>
  );
};
