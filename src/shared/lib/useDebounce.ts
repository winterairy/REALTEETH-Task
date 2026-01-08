import { useState, useEffect } from "react";

/**
 * 입력값을 debounce하는 커스텀 훅
 * @param value - debounce할 값
 * @param delay - 지연 시간 (밀리초)
 * @returns debounce된 값
 */
export const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return (): void => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

