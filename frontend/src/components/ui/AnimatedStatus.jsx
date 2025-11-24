import { useEffect, useState } from "react";

const AnimatedStatus = ({ type = "success" }) => {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setTimeout(() => setAnimate(true), 100);
  }, []);

  const isSuccess = type === "success";
  const colorClass = isSuccess ? "text-success" : "text-error";
  const bgClass = isSuccess ? "bg-success/10" : "bg-error/10";
  const borderColor = isSuccess ? "#4CAF50" : "#EF5350";

  return (
    <div
      className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-white shadow-card ${bgClass} relative overflow-hidden`}
    >
      <svg
        className={`w-14 h-14 ${colorClass}`}
        viewBox="0 0 52 52"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {isSuccess ? (
          // Animasi Centang
          <path
            d="M14.1 27.2l7.1 7.2 16.7-16.8"
            stroke={borderColor}
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              strokeDasharray: 48,
              strokeDashoffset: animate ? 0 : 48,
              transition: "stroke-dashoffset 0.6s ease-in-out",
            }}
          />
        ) : (
          // Animasi Silang
          <>
            <path
              d="M16 16L36 36"
              stroke={borderColor}
              strokeWidth="5"
              strokeLinecap="round"
              style={{
                strokeDasharray: 30,
                strokeDashoffset: animate ? 0 : 30,
                transition: "stroke-dashoffset 0.4s ease-in-out 0.2s",
              }}
            />
            <path
              d="M36 16L16 36"
              stroke={borderColor}
              strokeWidth="5"
              strokeLinecap="round"
              style={{
                strokeDasharray: 30,
                strokeDashoffset: animate ? 0 : 30,
                transition: "stroke-dashoffset 0.4s ease-in-out",
              }}
            />
          </>
        )}
      </svg>

      {/* Efek Ring Scale */}
      <div
        className={`absolute inset-0 rounded-full border-4 ${
          isSuccess ? "border-success" : "border-error"
        } opacity-20`}
        style={{
          transform: animate ? "scale(1.1)" : "scale(0.5)",
          opacity: animate ? 0 : 0.5,
          transition: "all 0.8s ease-out",
        }}
      ></div>
    </div>
  );
};

export default AnimatedStatus;
