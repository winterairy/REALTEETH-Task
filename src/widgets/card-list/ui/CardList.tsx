import { Card } from '@/shared/ui';
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
}

export const CardList = ({ cards, className = '' }: CardListProps) => {
  return (
    <div className={`${styles.cardList} ${className}`}>
      {cards.map((card) => (
        <Card
          key={card.id}
          title={card.title}
          description={card.description}
          href={card.href}
        />
      ))}
    </div>
  );
};
