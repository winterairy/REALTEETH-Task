export function getCurrentFcstTime(): string {
  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();
  
  const fcstHour = minute >= 30 ? hour + 1 : hour;
  return String(fcstHour % 24).padStart(2, '0') + '00';
}

export function hasFcstTimeChanged(lastFcstTime: string | null): boolean {
  if (!lastFcstTime) return true;
  const currentFcstTime = getCurrentFcstTime();
  return currentFcstTime !== lastFcstTime;
}

export function getTimeUntilNextFcstTimeChange(): number {
  const now = new Date();
  const minute = now.getMinutes();
  
  const minutesUntilChange = minute >= 30 
    ? 60 - minute + 30
    : 30 - minute;
  
  return minutesUntilChange * 60 * 1000;
}
