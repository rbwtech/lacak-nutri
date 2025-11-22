import { useEffect } from "react";

export default function SuccessModal({
  isOpen,
  onClose,
  title = "Berhasil!",
  message = "Operasi berhasil dilakukan",
  type = "success",
}) {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const icons = {
    success: (
      <svg
        className="w-16 h-16 text-[#4CAF50]"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 13l4 4L19 7"
        />
      </svg>
    ),
    favorite: (
      <svg
        className="w-16 h-16 text-[#FF9966]"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>
    ),
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-bg-surface rounded-xl p-8 max-w-sm w-full mx-4 shadow-lg animate-scale-in">
        <div className="flex flex-col items-center text-center gap-4">
          {icons[type]}
          <div>
            <h3 className="text-xl font-semibold text-[#333333] dark:text-white mb-2">
              {title}
            </h3>
            <p className="text-[#8C8C8C]">{message}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
