import { useEffect, useState, startTransition } from "react";
import { useSearchParams } from "react-router-dom";
import { useWeatherQuery } from "@/entities/weather/api/weatherQuery";
import { getCurrentPosition } from "@/shared/lib/geolocation";
import type { Coordinates } from "@/shared/model/coords";
import { getRegionNameFromCoord } from "@/shared/api/kakaoLocalApi";
import { Alert } from "@/shared/ui";
import { favoritesQueue } from "@/shared/lib/favorites";
import {
  WeatherNavigation,
  WeatherHeader,
  TemperatureRange,
  HourlyForecast,
} from "@/widgets";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import { StarIcon as StarIconOutline } from "@heroicons/react/24/outline";

export const HomePage = () => {
  const [searchParams] = useSearchParams();
  const [locationName, setLocationName] = useState<string | undefined>();
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertType, setAlertType] = useState<"error" | "success">("error");
  const [isFavorite, setIsFavorite] = useState(false);
  const [showAddConfirmModal, setShowAddConfirmModal] = useState(false);
  const [removedItem, setRemovedItem] = useState<{ originalLocationName: string; displayTitle: string } | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const latParam = searchParams.get("lat");
    const lonParam = searchParams.get("lon");
    const locationParam = searchParams.get("location");

    if (latParam && lonParam) {
      const lat = parseFloat(latParam);
      const lon = parseFloat(lonParam);
      
      if (!isNaN(lat) && !isNaN(lon)) {
        startTransition(() => {
          setCoordinates({ latitude: lat, longitude: lon });
          setLocationName(locationParam ? decodeURIComponent(locationParam) : undefined);
        });
      }
    } else {
      const fetchCurrentLocation = async () => {
        try {
          const pos = await getCurrentPosition();
          setCoordinates(pos);

          const regionName = await getRegionNameFromCoord(
            pos.longitude,
            pos.latitude
          );
          setLocationName(regionName);
        } catch (error) {
          console.error("현재 위치를 가져오는데 실패했습니다:", error);
          setLocationName("현재 위치");
        }
      };

      fetchCurrentLocation();
    }
  }, [searchParams]);

  const { data: weatherData, isLoading, error } = useWeatherQuery(
    coordinates,
    locationName
  );

  useEffect(() => {
    if (error) {
      const errorMessage =
        error instanceof Error
          ? error.message === "해당 장소의 정보가 제공되지 않습니다."
            ? "해당 장소의 정보가 제공되지 않습니다."
            : error.message
          : "날씨 데이터를 가져오는데 실패했습니다.";
      startTransition(() => {
        setAlertMessage(errorMessage);
        setAlertType("error");
        setIsAlertOpen(true);
      });
    }
  }, [error]);

  const weatherDataWithLocation = weatherData
    ? { ...weatherData, location: locationName || weatherData.location }
    : weatherData;

  useEffect(() => {
    if (coordinates) {
      const favorite = favoritesQueue.isFavorite(
        coordinates.latitude,
        coordinates.longitude
      );
      startTransition(() => {
        setIsFavorite(favorite);
      });
    }
  }, [coordinates]);

  const handleAddFavorite = () => {
    if (!coordinates || !locationName) {
      setAlertMessage("위치 정보가 없습니다.");
      setAlertType("error");
      setIsAlertOpen(true);
      return;
    }

    const wasFavorite = isFavorite;

    const count = favoritesQueue.getCount();
    const needsConfirmation = count >= 6 && !wasFavorite;
    
    if (needsConfirmation) {
      const result = favoritesQueue.add(
        locationName,
        locationName,
        coordinates.latitude,
        coordinates.longitude
      );
      
      if (result.removedItem) {
        setRemovedItem({
          originalLocationName: result.removedItem.originalLocationName,
          displayTitle: result.removedItem.displayTitle,
        });
        favoritesQueue.remove(result.removedItem.id);
        setShowAddConfirmModal(true);
      }
    } else {
      favoritesQueue.add(
        locationName,
        locationName,
        coordinates.latitude,
        coordinates.longitude
      );
      setIsFavorite(true);
      setAlertMessage("즐겨찾기에 추가되었습니다.");
      setAlertType("success");
      setIsAlertOpen(true);
    }
  };

  const handleConfirmAdd = () => {
    if (!coordinates || !locationName) return;

    favoritesQueue.add(
      locationName,
      locationName,
      coordinates.latitude,
      coordinates.longitude
    );
    setIsFavorite(true);
    setShowAddConfirmModal(false);
    setRemovedItem(null);
    setAlertMessage("즐겨찾기에 추가되었습니다.");
    setAlertType("success");
    setIsAlertOpen(true);
  };

  const handleCancelAdd = () => {
    setShowAddConfirmModal(false);
    setRemovedItem(null);
  };

  const handleRemoveFavorite = () => {
    if (!coordinates) return;

    const favoriteId = favoritesQueue.getFavoriteId(
      coordinates.latitude,
      coordinates.longitude
    );
    if (favoriteId) {
      favoritesQueue.remove(favoriteId);
      setIsFavorite(false);
      setAlertMessage("즐겨찾기에서 제거되었습니다.");
      setAlertType("success");
      setIsAlertOpen(true);
    }
  };

  return (
    <>
      <Alert
        message={alertMessage || "오류가 발생했습니다."}
        isOpen={isAlertOpen}
        onClose={() => setIsAlertOpen(false)}
        type={alertType}
      />
      {showAddConfirmModal && removedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={handleCancelAdd}
          />
          <div className="relative bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              즐겨찾기 추가
            </h3>
            <p className="text-gray-600 mb-6">
              즐겨찾기가 이미 6개입니다. 가장 오래된 즐겨찾기 "{removedItem.displayTitle}"를 제거하고 새로 추가하시겠습니까?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCancelAdd}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleConfirmAdd}
                className="px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="min-h-screen bg-linear-to-br from-blue-400 via-blue-500 to-blue-600 text-white">
        <WeatherNavigation />
        <div className="container mx-auto px-4 pb-8">
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-lg">날씨 데이터를 불러오는 중...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-lg text-yellow-200">
                {error instanceof Error
                  ? error.message === "해당 장소의 정보가 제공되지 않습니다."
                    ? "해당 장소의 정보가 제공되지 않습니다."
                    : error.message
                  : "날씨 데이터를 가져오는데 실패했습니다."}
              </p>
              {error instanceof Error &&
              error.message !== "해당 장소의 정보가 제공되지 않습니다." ? (
                <p className="text-sm mt-2 opacity-75">기본 데이터를 표시합니다.</p>
              ) : null}
            </div>
          ) : weatherDataWithLocation ? (
            <>
              <div className="text-center mb-4">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <button
                    onClick={isFavorite ? handleRemoveFavorite : handleAddFavorite}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    className="p-2 rounded-full transition-colors"
                    aria-label={isFavorite ? "즐겨찾기 제거" : "즐겨찾기 추가"}
                  >
                    {(isFavorite || isHovered) ? (
                      <StarIconSolid className="h-6 w-6 text-yellow-400 hover:cursor-pointer" />
                    ) : (
                      <StarIconOutline className="h-6 w-6 text-white hover:cursor-pointer" />
                    )}
                  </button>
                  <h2 className="text-2xl md:text-3xl font-light">
                    {weatherDataWithLocation.location}
                  </h2>
                </div>
              </div>
              <WeatherHeader weather={weatherDataWithLocation} />
              <TemperatureRange weather={weatherDataWithLocation} />
              <HourlyForecast weather={weatherDataWithLocation} />
            </>
          ) : null}
        </div>
      </div>
    </>
  );
};
