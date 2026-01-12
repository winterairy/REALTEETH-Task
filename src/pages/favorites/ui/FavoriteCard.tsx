import { useWeatherQuery } from "@/entities/weather/api/weatherQuery";
import { Card } from "@/shared/ui";
import { StarIcon } from "@heroicons/react/24/solid";
import { PencilIcon, CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useState, useEffect, useRef } from "react";
import type { FavoriteItem } from "@/shared/lib/favorites";
import {
  getCurrentFcstTime,
  hasFcstTimeChanged,
  getTimeUntilNextFcstTimeChange,
} from "@/shared/lib/weatherCache";

interface FavoriteCardProps {
  favoriteItem: FavoriteItem;
  onRemove: (id: string) => void;
  onTitleUpdate: (id: string, newTitle: string) => void;
}

export const FavoriteCard = ({
  favoriteItem,
  onRemove,
  onTitleUpdate,
}: FavoriteCardProps) => {
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(favoriteItem.displayTitle);
  const lastFcstTimeRef = useRef<string | null>(null);

  const { data: weatherData, error, refetch } = useWeatherQuery(
    {
      latitude: favoriteItem.latitude,
      longitude: favoriteItem.longitude,
    },
    favoriteItem.originalLocationName,
    {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
      gcTime: Infinity,
      staleTime: Infinity,
    }
  );

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    let cancelled = false;

    const scheduleNextCheck = () => {
      if (cancelled) return;
      const timeUntilNextChange = getTimeUntilNextFcstTimeChange();
      timer = setTimeout(() => {
        if (cancelled) return;
        const newFcstTime = getCurrentFcstTime();
        if (newFcstTime !== lastFcstTimeRef.current) {
          lastFcstTimeRef.current = newFcstTime;
          refetch();
        }
        scheduleNextCheck();
      }, timeUntilNextChange);
    };

    const currentFcstTime = getCurrentFcstTime();

    if (!lastFcstTimeRef.current) {
      lastFcstTimeRef.current = currentFcstTime;
    } else if (hasFcstTimeChanged(lastFcstTimeRef.current)) {
      lastFcstTimeRef.current = currentFcstTime;
      refetch();
    }

    scheduleNextCheck();

    return () => {
      cancelled = true;
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [refetch]);

  let description = "날씨 정보를 불러오는 중...";
  if (weatherData) {
    description = `현재 ${weatherData.currentTemp}°C | 최고 ${weatherData.maxTemp}°C | 최저 ${weatherData.minTemp}°C`;
  } else if (error) {
    description = "날씨 정보를 불러올 수 없습니다.";
  }

  const href = `/?lat=${favoriteItem.latitude}&lon=${favoriteItem.longitude}&location=${encodeURIComponent(favoriteItem.originalLocationName)}`;

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditing(true);
    setEditTitle(favoriteItem.displayTitle);
  };

  const handleSaveClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (editTitle.trim()) {
      onTitleUpdate(favoriteItem.id, editTitle.trim());
    }
    setEditing(false);
  };

  const handleCancelEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditing(false);
    setEditTitle(favoriteItem.displayTitle);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onRemove(favoriteItem.id);
  };

  const titleContent = editing ? (
    <div className="flex items-center gap-2">
      <input
        type="text"
        value={editTitle}
        onChange={(e) => setEditTitle(e.target.value)}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            if (editTitle.trim()) {
              onTitleUpdate(favoriteItem.id, editTitle.trim());
              setEditing(false);
            }
          } else if (e.key === "Escape") {
            e.preventDefault();
            setEditing(false);
            setEditTitle(favoriteItem.displayTitle);
          }
        }}
        className="flex-1 text-lg font-semibold text-gray-900 leading-tight px-2 py-1 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        autoFocus
      />
      <div className="flex gap-1">
        <button
          onClick={handleSaveClick}
          className="p-1.5 rounded-full transition-colors"
          aria-label="저장"
        >
          <CheckIcon className="h-5 w-5 text-green-600" />
        </button>
        <button
          onClick={handleCancelEdit}
          className="p-1.5 rounded-full transition-colors"
          aria-label="취소"
        >
          <XMarkIcon className="h-5 w-5 text-gray-600" />
        </button>
      </div>
    </div>
  ) : (
    favoriteItem.displayTitle
  );

  return (
    <div className="relative">
      <Card title={titleContent} description={description} href={href} className="relative">
        <div className="absolute top-4 right-4 flex gap-2 z-10">
          {!editing && (
            <>
              <button
                onClick={handleEditClick}
                className="p-2 rounded-full transition-colors cursor-pointer"
                aria-label="제목 수정"
              >
                <PencilIcon className="h-5 w-5 text-gray-600" />
              </button>
              <button
                onClick={handleFavoriteClick}
                className="p-2 rounded-full transition-colors cursor-pointer"
                aria-label="즐겨찾기 해제"
              >
                <StarIcon className="h-5 w-5 text-yellow-500" />
              </button>
            </>
          )}
        </div>
      </Card>
    </div>
  );
};
