export interface FavoriteItem {
  id: string;
  originalLocationName: string;
  displayTitle: string;
  latitude: number;
  longitude: number;
  createdAt: number;
}

class FavoritesQueue {
  private readonly MAX_SIZE = 6;
  private readonly STORAGE_KEY = "weather_favorites";

  private loadFromStorage(): FavoriteItem[] {
    try {
      const stored = sessionStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored) as FavoriteItem[];
      }
    } catch (error) {
      console.error("저장소에서 즐겨찾기를 불러오는데 실패했습니다:", error);
    }
    return [];
  }

  private saveToStorage(items: FavoriteItem[]): void {
    try {
      sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error("저장소에 즐겨찾기를 저장하는데 실패했습니다:", error);
    }
  }

  getAll(): FavoriteItem[] {
    return this.loadFromStorage();
  }

  add(
    originalLocationName: string,
    displayTitle: string,
    latitude: number,
    longitude: number
  ): { success: boolean; removedItem?: FavoriteItem } {
    const items = this.loadFromStorage();
    
    const existingItemIndex = items.findIndex(
      (item) =>
        Math.abs(item.latitude - latitude) < 0.0001 &&
        Math.abs(item.longitude - longitude) < 0.0001
    );

    let removedItem: FavoriteItem | undefined;

    if (existingItemIndex !== -1) {
      items.splice(existingItemIndex, 1);
    }

    const id = `${Date.now()}-${Math.random()}`;
    const newItem: FavoriteItem = {
      id,
      originalLocationName,
      displayTitle,
      latitude,
      longitude,
      createdAt: Date.now(),
    };

    if (items.length >= this.MAX_SIZE) {
      const sortedItems = [...items].sort(
        (a, b) => a.createdAt - b.createdAt
      );
      removedItem = sortedItems[0];
      const filteredItems = items.filter(
        (item) => item.id !== removedItem.id
      );
      items.length = 0;
      items.push(...filteredItems);
    }

    items.push(newItem);
    this.saveToStorage(items);

    return { success: true, removedItem };
  }

  remove(id: string): boolean {
    const items = this.loadFromStorage();
    const filteredItems = items.filter((item) => item.id !== id);
    
    if (filteredItems.length === items.length) {
      return false; // 해당 ID가 없음
    }

    this.saveToStorage(filteredItems);
    return true;
  }

  updateTitle(id: string, newTitle: string): boolean {
    const items = this.loadFromStorage();
    const item = items.find((item) => item.id === id);
    
    if (!item) {
      return false;
    }

    item.displayTitle = newTitle;
    this.saveToStorage(items);
    return true;
  }

  getCount(): number {
    return this.loadFromStorage().length;
  }

  isFavorite(latitude: number, longitude: number): boolean {
    const items = this.loadFromStorage();
    return items.some(
      (item) =>
        Math.abs(item.latitude - latitude) < 0.0001 &&
        Math.abs(item.longitude - longitude) < 0.0001
    );
  }

  getFavoriteId(latitude: number, longitude: number): string | null {
    const items = this.loadFromStorage();
    const item = items.find(
      (item) =>
        Math.abs(item.latitude - latitude) < 0.0001 &&
        Math.abs(item.longitude - longitude) < 0.0001
    );
    return item ? item.id : null;
  }
}

export const favoritesQueue = new FavoritesQueue();
