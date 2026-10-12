import React from "react";
import { useCurrentFrame } from "remotion";

export interface NewsTickerProps {
  items: string[];
  accentColor?: string;
}

export const NewsTicker: React.FC<NewsTickerProps> = ({
  items,
  accentColor = "#e60000",
}) => {
  const frame = useCurrentFrame();

  // Combine items into a long seamless string repeated for infinite feel
  const combinedText = items.join("   ■   ") + "   ■   ";
  const tickerString = `${combinedText}${combinedText}${combinedText}`;

  // Pixel speed per frame (e.g. 3.5px per frame = 105px/sec at 30fps)
  const offset = (frame * 3.8) % 3600;

  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 64,
        backgroundColor: "#030712",
        borderTop: "3px solid #1d4ed8",
        display: "flex",
        alignItems: "center",
        zIndex: 50,
        overflow: "hidden",
        fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* Left fixed Breaking News Tag */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          backgroundColor: accentColor,
          height: "100%",
          padding: "0 34px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          fontWeight: 900,
          fontSize: 24,
          color: "#ffffff",
          letterSpacing: 3,
          boxShadow: `5px 0 15px rgba(0,0,0,0.6)`,
          flexShrink: 0,
        }}
      >
        <span
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            backgroundColor: "#ffffff",
            boxShadow: "0 0 10px #ffffff",
          }}
        />
        속 보
        {/* Slanted edge */}
        <div
          style={{
            position: "absolute",
            right: -18,
            top: 0,
            bottom: 0,
            width: 18,
            background: `linear-gradient(to top right, ${accentColor} 50%, transparent 51%)`,
          }}
        />
      </div>

      {/* Scrolling Text Track */}
      <div
        style={{
          flex: 1,
          overflow: "hidden",
          whiteSpace: "nowrap",
          display: "flex",
          alignItems: "center",
          paddingLeft: 28,
        }}
      >
        <div
          style={{
            display: "inline-block",
            transform: `translateX(-${offset}px)`,
            fontSize: 24,
            fontWeight: 700,
            color: "#ffffff",
            letterSpacing: 0.8,
          }}
        >
          {tickerString}
        </div>
      </div>
    </div>
  );
};
