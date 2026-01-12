import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useWeatherQuery } from "@/entities/weather/api/weatherQuery";
import { getCurrentPosition } from "@/shared/lib/geolocation";
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
  const [coordinates, setCoordinates] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertType, setAlertType] = useState<"error" | "success">("error");
  const [isFavorite, setIsFavorite] = useState(false);
  const [showAddConfirmModal, setShowAddConfirmModal] = useState(false);
  const [removedItem, setRemovedItem] = useState<{ originalLocationName: string; displayTitle: string } | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  // URL 쿼리 파라미터에서 좌표 읽기
  useEffect(() => {
    const latParam = searchParams.get("lat");
    const lonParam = searchParams.get("lon");
    const locationParam = searchParams.get("location");

    if (latParam && lonParam) {
      // URL에서 좌표가 있으면 사용
      const lat = parseFloat(latParam);
      const lon = parseFloat(lonParam);
      
      if (!isNaN(lat) && !isNaN(lon)) {
        setCoordinates({ latitude: lat, longitude: lon });
        setLocationName(locationParam ? decodeURIComponent(locationParam) : undefined);
      }
    } else {
      // URL에 좌표가 없으면 현재 위치 가져오기
      const fetchCurrentLocation = async () => {
        try {
          const pos = await getCurrentPosition();
          setCoordinates(pos);

          // 카카오 API로 장소 이름 가져오기
          const regionName = await getRegionNameFromCoord(
            pos.longitude,
            pos.latitude
          );
          setLocationName(regionName);
        } catch (error) {
          console.error("Failed to get current location:", error);
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

  // 에러 발생 시 팝업 표시
  useEffect(() => {
    if (error) {
      const errorMessage =
        error instanceof Error
          ? error.message === "해당 장소의 정보가 제공되지 않습니다."
            ? "해당 장소의 정보가 제공되지 않습니다."
            : error.message
          : "날씨 데이터를 가져오는데 실패했습니다.";
      setAlertMessage(errorMessage);
      setAlertType("error");
      setIsAlertOpen(true);
    }
  }, [error]);

  // locationName이 업데이트되면 날씨 데이터의 location도 업데이트
  const weatherDataWithLocation = weatherData
    ? { ...weatherData, location: locationName || weatherData.location }
    : weatherData;

  // 즐겨찾기 상태 확인
  useEffect(() => {
    if (coordinates) {
      const favorite = favoritesQueue.isFavorite(
        coordinates.latitude,
        coordinates.longitude
      );
      setIsFavorite(favorite);
    }
  }, [coordinates]);

  // 즐겨찾기 추가 핸들러
  const handleAddFavorite = () => {
    if (!coordinates || !locationName) {
      setAlertMessage("위치 정보가 없습니다.");
      setAlertType("error");
      setIsAlertOpen(true);
      return;
    }

    // 같은 지역이 이미 즐겨찾기에 있는지 확인 (최신화를 위해 체크만 하고 진행)
    const wasFavorite = isFavorite;

    // 6개가 이미 있는지 확인 (같은 지역이 아닌 경우에만)
    const count = favoritesQueue.getCount();
    const needsConfirmation = count >= 6 && !wasFavorite;
    
    if (needsConfirmation) {
      // 가장 오래된 항목 정보를 미리 가져오기 위해 임시로 추가해보고 제거
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
        // 다시 제거 (확인 모달을 띄우기 위해)
        favoritesQueue.remove(result.removedItem.id);
        setShowAddConfirmModal(true);
      }
    } else {
      // 바로 추가 (같은 지역이면 삭제 후 재추가)
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

  // 확인 모달에서 확인 클릭
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

  // 확인 모달에서 취소 클릭
  const handleCancelAdd = () => {
    setShowAddConfirmModal(false);
    setRemovedItem(null);
  };

  // 즐겨찾기 제거 핸들러
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
      {/* 즐겨찾기 추가 확인 모달 */}
      {showAddConfirmModal && removedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={handleCancelAdd}
          />
          <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              즐겨찾기 추가
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              즐겨찾기가 이미 6개입니다. 가장 오래된 즐겨찾기 "{removedItem.displayTitle}"를 제거하고 새로 추가하시겠습니까?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCancelAdd}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
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
