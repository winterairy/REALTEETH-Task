import { useNavigate } from "react-router-dom";
import { FavoritesButton } from "@/shared/ui";
import { SearchBar } from "@/features/region-search";

export const WeatherNavigation = () => {
  const navigate = useNavigate();

  const handleFavoritesClick = () => {
    navigate("/favorites");
  };

  return (
    <nav className="flex items-center justify-between p-4 md:p-6">
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <div className="flex-1">
          <SearchBar />
        </div>
      </div>
      <FavoritesButton aria-label="즐겨찾기" onClick={handleFavoritesClick} />
    </nav>
  );
};
