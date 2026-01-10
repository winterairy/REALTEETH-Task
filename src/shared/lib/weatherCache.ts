/**
 * 날씨 데이터 캐싱 관련 유틸리티
 */

/**
 * 현재 시간 기준 사용할 fcstTime 반환 (HH00 형식)
 * 예: 14:30 → "1500", 14:20 → "1400"
 */
export function getCurrentFcstTime(): string {
  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();
  
  // 30분 이상이면 다음 시간대 사용, 미만이면 현재 시간대 사용
  const fcstHour = minute >= 30 ? hour + 1 : hour;
  return String(fcstHour % 24).padStart(2, '0') + '00';
}

/**
 * fcstTime이 변경되었는지 확인
 * @param lastFcstTime - 이전 fcstTime
 * @returns fcstTime이 변경되었으면 true
 */
export function hasFcstTimeChanged(lastFcstTime: string | null): boolean {
  if (!lastFcstTime) return true;
  const currentFcstTime = getCurrentFcstTime();
  return currentFcstTime !== lastFcstTime;
}

/**
 * 다음 fcstTime 변경까지 남은 시간(밀리초) 계산
 * 예: 14:30 → 다음 변경은 15:30이므로 1시간
 */
export function getTimeUntilNextFcstTimeChange(): number {
  const now = new Date();
  const minute = now.getMinutes();
  
  // 30분 이상이면 다음 시간의 30분까지, 미만이면 현재 시간의 30분까지
  const minutesUntilChange = minute >= 30 
    ? 60 - minute + 30  // 다음 시간의 30분까지
    : 30 - minute;      // 현재 시간의 30분까지
  
  return minutesUntilChange * 60 * 1000; // 밀리초로 변환
}
