import { useState } from "react";
import { Card } from "@/shared/ui";
import { StarIcon } from "@heroicons/react/24/solid";
import { PencilIcon, CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";
import styles from "./CardList.module.css";

interface CardItem {
  id: string | number;
  title: string;
  description: string;
  href?: string;
}

interface CardListProps {
  cards: CardItem[];
  className?: string;
  onFavoriteClick?: (cardId: string | number) => void;
  showFavoriteButton?: boolean;
  onTitleUpdate?: (cardId: string | number, newTitle: string) => void;
  showEditButton?: boolean;
}

export const CardList = ({
  cards,
  className = "",
  onFavoriteClick,
  showFavoriteButton = false,
  onTitleUpdate,
  showEditButton = false,
}: CardListProps) => {
  const [editingCardId, setEditingCardId] = useState<string | number | null>(
    null
  );
  const [editTitle, setEditTitle] = useState("");

  const handleFavoriteClick = (
    e: React.MouseEvent,
    cardId: string | number
  ) => {
    e.preventDefault();
    e.stopPropagation();
    onFavoriteClick?.(cardId);
  };

  const handleEditClick = (
    e: React.MouseEvent,
    cardId: string | number,
    currentTitle: string
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingCardId(cardId);
    setEditTitle(currentTitle);
  };

  const handleSaveClick = (e: React.MouseEvent, cardId: string | number) => {
    e.preventDefault();
    e.stopPropagation();
    if (editTitle.trim() && onTitleUpdate) {
      onTitleUpdate(cardId, editTitle.trim());
    }
    setEditingCardId(null);
    setEditTitle("");
  };

  const handleCancelEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingCardId(null);
    setEditTitle("");
  };

  return (
    <div className={`${styles.cardList} ${className}`}>
      {cards.map((card) => {
        const isEditing = editingCardId === card.id;
        const titleContent = isEditing ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (editTitle.trim() && onTitleUpdate) {
                    onTitleUpdate(card.id, editTitle.trim());
                    setEditingCardId(null);
                    setEditTitle("");
                  }
                } else if (e.key === "Escape") {
                  e.preventDefault();
                  setEditingCardId(null);
                  setEditTitle("");
                }
              }}
              className="flex-1 text-lg font-semibold text-gray-900 dark:text-white leading-tight px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <div className="flex gap-1">
              <button
                onClick={(e) => handleSaveClick(e, card.id)}
                className="p-1.5 rounded-full transition-colors"
                aria-label="저장"
              >
                <CheckIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
              </button>
              <button
                onClick={(e) => handleCancelEdit(e)}
                className="p-1.5 rounded-full transition-colors"
                aria-label="취소"
              >
                <XMarkIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>
        ) : (
          card.title
        );

        return (
          <div key={card.id} className="relative">
            <Card
              title={titleContent}
              description={card.description}
              href={card.href}
              className={showFavoriteButton || showEditButton ? "relative" : ""}
            >
              <div className="absolute top-4 right-4 flex gap-2 z-10">
                {showEditButton && !isEditing && (
                  <button
                    onClick={(e) => handleEditClick(e, card.id, card.title)}
                    className="p-2 rounded-full transition-colors cursor-pointer"
                    aria-label="제목 수정"
                  >
                    <PencilIcon className="h-5 w-5 text-gray-600 " />
                  </button>
                )}
                {showFavoriteButton && !isEditing && (
                  <button
                    onClick={(e) => handleFavoriteClick(e, card.id)}
                    className="p-2 rounded-full transition-colors cursor-pointer"
                    aria-label="즐겨찾기 해제"
                  >
                    <StarIcon className="h-5 w-5 text-yellow-500 " />
                  </button>
                )}
              </div>
            </Card>
          </div>
        );
      })}
    </div>
  );
};
