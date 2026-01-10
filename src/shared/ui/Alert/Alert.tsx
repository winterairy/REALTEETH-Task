import { useEffect } from "react";
import type { ReactElement } from "react";

interface AlertProps {
  message: string;
  isOpen: boolean;
  onClose: () => void;
  type?: "error" | "warning" | "info" | "success";
  duration?: number; // 자동 닫기 시간 (ms), 0이면 자동 닫기 안 함
}

export const Alert = ({
  message,
  isOpen,
  onClose,
  type = "error",
  duration = 3000,
}: AlertProps): ReactElement | null => {
  useEffect(() => {
    if (isOpen && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);

  if (!isOpen) return null;

  const bgColor =
    type === "error"
      ? "bg-red-500"
      : type === "warning"
        ? "bg-yellow-500"
        : type === "success"
          ? "bg-green-500"
          : "bg-blue-500";

  const overlayStyle = type === "success" 
    ? { backgroundColor: "rgba(255, 255, 255, 0.5)" }
    : { backgroundColor: "rgba(0, 0, 0, 0.5)" };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 배경 오버레이 */}
      <div
        className="fixed inset-0"
        style={overlayStyle}
        onClick={onClose}
      />
      
      {/* 알림 팝업 */}
      <div
        className={`relative ${bgColor} text-white rounded-lg shadow-xl p-6 max-w-md w-full z-10`}
      >
        <div className="flex items-start">
          <div className="flex-1">
            <p className="text-lg font-semibold">{message}</p>
          </div>
          <button
            onClick={onClose}
            className="ml-4 text-white hover:text-gray-200 transition-colors"
            aria-label="닫기"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
