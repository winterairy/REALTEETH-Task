import { Card } from '@/shared/ui';
import { StarIcon } from '@heroicons/react/24/solid';
import styles from './CardList.module.css';

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
}

export const CardList = ({ 
  cards, 
  className = '', 
  onFavoriteClick,
  showFavoriteButton = false 
}: CardListProps) => {
  const handleFavoriteClick = (e: React.MouseEvent, cardId: string | number) => {
    e.preventDefault();
    e.stopPropagation();
    onFavoriteClick?.(cardId);
  };

  return (
    <div className={`${styles.cardList} ${className}`}>
      {cards.map((card) => (
        <div key={card.id} className="relative">
          <Card
            title={card.title}
            description={card.description}
            href={card.href}
            className={showFavoriteButton ? "relative" : ""}
          >
            {showFavoriteButton && (
              <button
                onClick={(e) => handleFavoriteClick(e, card.id)}
                className="absolute top-4 right-4 p-2 rounded-full bg-yellow-100 dark:bg-yellow-900/30 hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition-colors cursor-pointer z-10"
                aria-label="즐겨찾기 해제"
              >
                <StarIcon className="h-5 w-5 text-yellow-500 dark:text-yellow-400" />
              </button>
            )}
          </Card>
        </div>
      ))}
    </div>
  );
};
