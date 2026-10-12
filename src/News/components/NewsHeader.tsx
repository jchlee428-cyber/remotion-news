import React from "react";
import { interpolate, useCurrentFrame } from "remotion";

export interface NewsHeaderProps {
  channelName: string;
  broadcastDate: string;
  stockTicker?: string;
  accentColor?: string;
}

export const NewsHeader: React.FC<NewsHeaderProps> = ({
  channelName,
  broadcastDate,
  stockTicker,
  accentColor = "#e60000",
}) => {
  const frame = useCurrentFrame();

  // Pulsing animation for the LIVE red dot
  const livePulse = interpolate(
    Math.sin((frame / 30) * Math.PI * 2),
    [-1, 1],
    [0.4, 1]
  );

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 82,
        background: "linear-gradient(180deg, rgba(3, 11, 30, 0.95) 0%, rgba(3, 11, 30, 0.75) 75%, transparent 100%)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 48px",
        zIndex: 50,
        borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* Left: Channel Brand & LIVE Badge */}
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            backgroundColor: "#0d3b66",
            padding: "8px 18px",
            borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.2)",
            boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#64b5f6" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
          <span
            style={{
              color: "#ffffff",
              fontSize: 25,
              fontWeight: 900,
              letterSpacing: 1.5,
            }}
          >
            {channelName}
          </span>
        </div>

        {/* LIVE Indicator */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            backgroundColor: accentColor,
            padding: "6px 16px",
            borderRadius: 6,
            fontWeight: 900,
            fontSize: 18,
            color: "#ffffff",
            letterSpacing: 2,
            boxShadow: `0 0 15px ${accentColor}`,
          }}
        >
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              backgroundColor: "#ffffff",
              opacity: livePulse,
            }}
          />
          LIVE
        </div>
      </div>

      {/* Center: Market / Stock Mini Ticker */}
      {stockTicker && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            padding: "8px 22px",
            borderRadius: 24,
            border: "1px solid rgba(255, 255, 255, 0.15)",
            color: "#f1f5f9",
            fontSize: 17,
            fontWeight: 600,
            letterSpacing: 0.5,
          }}
        >
          <span style={{ color: "#ffd166", fontWeight: 800 }}>표어</span>
          <span>{stockTicker}</span>
        </div>
      )}

      {/* Right: Broadcast Date & Realtime Clock */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          color: "#e2e8f0",
          fontSize: 19,
          fontWeight: 700,
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        <span>{broadcastDate}</span>
      </div>
    </div>
  );
};
