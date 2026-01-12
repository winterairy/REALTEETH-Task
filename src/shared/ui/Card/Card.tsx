import type { ReactNode } from 'react';
import styles from './Card.module.css';

interface CardProps {
  title: string | ReactNode;
  description: string;
  href?: string;
  className?: string;
  children?: ReactNode;
}

export const Card = ({ title, description, href, className = '', children }: CardProps) => {
  return (
    <a
      href={href || '#'}
      className={`${styles.card} ${className}`}
    >
      <div className="space-y-2">
        {typeof title === 'string' ? (
          <h3 className="text-lg font-semibold text-gray-900 leading-tight">
            {title}
          </h3>
        ) : (
          title
        )}
        <p className="text-gray-600 text-sm leading-relaxed">
          {description}
        </p>
      </div>

      {children ? <div className="mt-4">{children}</div> : null}
    </a>
  );
};
