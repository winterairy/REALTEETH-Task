import { Routes, Route, Navigate } from 'react-router-dom';
import { HomePage } from '@/pages/home';
import { FavoritesPage } from '@/pages/favorites';

export const Routing = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/favorites" element={<FavoritesPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

