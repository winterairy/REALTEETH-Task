import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { CardList } from "@/widgets/card-list";
import { mockWeatherData } from "@/entities/weather";

export const FavoritesPage = () => {
  const navigate = useNavigate();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [cardToRemove, setCardToRemove] = useState<string | number | null>(
    null
  );

  const handleCloseClick = () => {
    navigate("/");
  };

  // 임시 데이터 - 나중에 API나 상태 관리로 대체 가능
  const [favoriteCards, setFavoriteCards] = useState([
    {
      id: 1,
      title: "서울특별시",
      description: "",
      href: "/",
      weather: {
        ...mockWeatherData,
        location: "서울특별시",
        currentTemp: 15,
        maxTemp: 18,
        minTemp: 8,
      },
    },
    {
      id: 2,
      title: "부산광역시",
      description: "",
      href: "/",
      weather: {
        ...mockWeatherData,
        location: "부산광역시",
        currentTemp: 17,
        maxTemp: 20,
        minTemp: 12,
      },
    },
    {
      id: 3,
      title: "대구광역시",
      description: "",
      href: "/",
      weather: {
        ...mockWeatherData,
        location: "대구광역시",
        currentTemp: 16,
        maxTemp: 19,
        minTemp: 10,
      },
    },
    {
      id: 4,
      title: "인천광역시",
      description: "",
      href: "/",
      weather: {
        ...mockWeatherData,
        location: "인천광역시",
        currentTemp: 14,
        maxTemp: 17,
        minTemp: 9,
      },
    },
    {
      id: 5,
      title: "광주광역시",
      description: "",
      href: "/",
      weather: {
        ...mockWeatherData,
        location: "광주광역시",
        currentTemp: 18,
        maxTemp: 21,
        minTemp: 13,
      },
    },
    {
      id: 6,
      title: "대전광역시",
      description: "",
      href: "/",
      weather: {
        ...mockWeatherData,
        location: "대전광역시",
        currentTemp: 16,
        maxTemp: 19,
        minTemp: 11,
      },
    },
  ]);

  const unfavorite = (cardId: string | number) => {
    setCardToRemove(cardId);
    setShowConfirmModal(true);
  };

  const confirmUnfavorite = () => {
    if (cardToRemove !== null) {
      setFavoriteCards(
        favoriteCards.filter((card) => card.id !== cardToRemove)
      );
      setShowConfirmModal(false);
      setCardToRemove(null);
    }
  };

  const cancelUnfavorite = () => {
    setShowConfirmModal(false);
    setCardToRemove(null);
  };

  const handleTitleUpdate = (cardId: string | number, newTitle: string) => {
    setFavoriteCards(
      favoriteCards.map((card) =>
        card.id === cardId ? { ...card, title: newTitle } : card
      )
    );
  };

  const selectedCard = favoriteCards.find((card) => card.id === cardToRemove);

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="mx-[15px]">
          <div className="mb-8 flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                즐겨찾기
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                즐겨찾기한 항목들을 확인하세요
              </p>
            </div>
            <button
              onClick={handleCloseClick}
              className="p-2 rounded-full transition-colors hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"
              aria-label="닫기"
            >
              <XMarkIcon className="h-6 w-6 text-gray-900 dark:text-white" />
            </button>
          </div>

          {favoriteCards.length > 0 ? (
            <CardList
              cards={favoriteCards}
              onFavoriteClick={unfavorite}
              showFavoriteButton={true}
              onTitleUpdate={handleTitleUpdate}
              showEditButton={true}
            />
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">
                즐겨찾기한 항목이 없습니다.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 즐겨찾기 해제 팝업 모달*/}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={cancelUnfavorite}
          />
          <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              즐겨찾기 해제
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              "{selectedCard?.title}" 항목을 즐겨찾기에서 해제하시겠습니까?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelUnfavorite}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                취소
              </button>
              <button
                onClick={confirmUnfavorite}
                className="px-4 py-2 text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
              >
                해제
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
