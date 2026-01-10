// 즐겨찾기 타입 정의
export interface FavoriteItem {
  id: string; // 고유 ID (타임스탬프 기반)
  originalLocationName: string; // 원래 장소 이름 (API용)
  displayTitle: string; // 표시용 제목 (수정 가능)
  latitude: number;
  longitude: number;
  createdAt: number; // 생성 시간 (FIFO 정렬용)
}

// Queue 자료구조를 사용한 즐겨찾기 관리
class FavoritesQueue {
  private readonly MAX_SIZE = 6;
  private readonly STORAGE_KEY = "weather_favorites";

  // localStorage에서 즐겨찾기 목록 불러오기
  private loadFromStorage(): FavoriteItem[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored) as FavoriteItem[];
      }
    } catch (error) {
      console.error("Failed to load favorites from storage:", error);
    }
    return [];
  }

  // localStorage에 즐겨찾기 목록 저장하기
  private saveToStorage(items: FavoriteItem[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error("Failed to save favorites to storage:", error);
    }
  }

  // 모든 즐겨찾기 가져오기
  getAll(): FavoriteItem[] {
    return this.loadFromStorage();
  }

  // 즐겨찾기 추가 (FIFO 원칙, 중복 시 삭제 후 재추가)
  add(
    originalLocationName: string,
    displayTitle: string,
    latitude: number,
    longitude: number
  ): { success: boolean; removedItem?: FavoriteItem } {
    const items = this.loadFromStorage();
    
    // 같은 좌표의 기존 항목 찾기
    const existingItemIndex = items.findIndex(
      (item) =>
        Math.abs(item.latitude - latitude) < 0.0001 &&
        Math.abs(item.longitude - longitude) < 0.0001
    );

    let removedItem: FavoriteItem | undefined;

    // 같은 좌표의 항목이 있으면 기존 항목 제거 (삭제 후 재추가)
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

    // 이미 6개가 있으면 가장 오래된 항목 제거 (FIFO)
    if (items.length >= this.MAX_SIZE) {
      // createdAt 기준으로 정렬하여 가장 오래된 항목 찾기
      const sortedItems = [...items].sort(
        (a, b) => a.createdAt - b.createdAt
      );
      removedItem = sortedItems[0];
      // 가장 오래된 항목 제거
      const filteredItems = items.filter(
        (item) => item.id !== removedItem.id
      );
      items.length = 0;
      items.push(...filteredItems);
    }

    // 새 항목 추가
    items.push(newItem);
    this.saveToStorage(items);

    return { success: true, removedItem };
  }

  // 즐겨찾기 제거
  remove(id: string): boolean {
    const items = this.loadFromStorage();
    const filteredItems = items.filter((item) => item.id !== id);
    
    if (filteredItems.length === items.length) {
      return false; // 해당 ID가 없음
    }

    this.saveToStorage(filteredItems);
    return true;
  }

  // 즐겨찾기 제목 업데이트
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

  // 즐겨찾기 개수 확인
  getCount(): number {
    return this.loadFromStorage().length;
  }

  // 특정 좌표가 이미 즐겨찾기에 있는지 확인
  isFavorite(latitude: number, longitude: number): boolean {
    const items = this.loadFromStorage();
    return items.some(
      (item) =>
        Math.abs(item.latitude - latitude) < 0.0001 &&
        Math.abs(item.longitude - longitude) < 0.0001
    );
  }

  // 특정 좌표의 즐겨찾기 ID 가져오기
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

// 싱글톤 인스턴스
export const favoritesQueue = new FavoritesQueue();
