import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { favoritesQueue, type FavoriteItem } from "@/shared/lib/favorites";
import { FavoriteCard } from "./FavoriteCard";
import styles from "@/widgets/card-list/ui/CardList.module.css";

export const FavoritesPage = () => {
  const navigate = useNavigate();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [cardToRemove, setCardToRemove] = useState<string | null>(null);
  const [favoriteItems, setFavoriteItems] = useState<FavoriteItem[]>([]);
  const [removingItemTitle, setRemovingItemTitle] = useState<string>("");

  useEffect(() => {
    const loadFavorites = () => {
      const items = favoritesQueue.getAll();
      setFavoriteItems(items);
    };
    loadFavorites();
  }, []);

  const handleCloseClick = () => {
    navigate("/");
  };

  const handleRemove = (id: string) => {
    const item = favoriteItems.find((item) => item.id === id);
    if (item) {
      setRemovingItemTitle(item.displayTitle);
      setCardToRemove(id);
      setShowConfirmModal(true);
    }
  };

  const confirmUnfavorite = () => {
    if (cardToRemove !== null) {
      favoritesQueue.remove(cardToRemove);
      const updatedItems = favoritesQueue.getAll();
      setFavoriteItems(updatedItems);
      setShowConfirmModal(false);
      setCardToRemove(null);
      setRemovingItemTitle("");
    }
  };

  const cancelUnfavorite = () => {
    setShowConfirmModal(false);
    setCardToRemove(null);
    setRemovingItemTitle("");
  };

  const handleTitleUpdate = (id: string, newTitle: string) => {
    favoritesQueue.updateTitle(id, newTitle);
    const updatedItems = favoritesQueue.getAll();
    setFavoriteItems(updatedItems);
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="mx-[15px]">
          <div className="mb-8 flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                즐겨찾기
              </h1>
              <p className="text-gray-600">
                즐겨찾기한 항목들을 확인하세요
              </p>
            </div>
            <button
              onClick={handleCloseClick}
              className="p-2 rounded-full transition-colors hover:bg-gray-200 cursor-pointer"
              aria-label="닫기"
            >
              <XMarkIcon className="h-6 w-6 text-gray-900" />
            </button>
          </div>

          {favoriteItems.length > 0 ? (
            <div className={styles.cardList}>
              {favoriteItems.map((item) => (
                <FavoriteCard
                  key={item.id}
                  favoriteItem={item}
                  onRemove={handleRemove}
                  onTitleUpdate={handleTitleUpdate}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">
                즐겨찾기한 항목이 없습니다.
              </p>
            </div>
          )}
        </div>
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={cancelUnfavorite}
          />
          <div className="relative bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              즐겨찾기 해제
            </h3>
            <p className="text-gray-600 mb-6">
              "{removingItemTitle}" 항목을 즐겨찾기에서 해제하시겠습니까?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelUnfavorite}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
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
