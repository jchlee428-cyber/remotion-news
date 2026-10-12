import React from "react";
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { NewsScene } from "../types";
import {
  getAutoFitHeadlineSize,
  getAutoFitSubHeadlineSize,
} from "../utils/textUtils";

export type NewsLowerThirdProps = {
  scene: NewsScene;
  sceneIndex?: number;
  themeColor?: string;
  accentColor?: string;
};

export const NewsLowerThird: React.FC<NewsLowerThirdProps> = ({
  scene,
  sceneIndex,
  themeColor = "#003b8e",
  accentColor = "#e60000",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headlineStyle = getAutoFitHeadlineSize(scene.headline, "broadcast");
  const subHeadlineStyle = getAutoFitSubHeadlineSize(scene.subHeadline, "broadcast");

  // Entrance spring animation for the whole lower third container
  const containerSpring = spring({
    frame: frame - 5,
    fps,
    config: { damping: 15, mass: 0.8, stiffness: 100 },
  });

  const translateY = interpolate(containerSpring, [0, 1], [150, 0]);
  const opacity = interpolate(containerSpring, [0, 1], [0, 1]);

  // Subtitle delayed slide-in
  const subSpring = spring({
    frame: frame - 20,
    fps,
    config: { damping: 14, stiffness: 90 },
  });
  const subTranslateX = interpolate(subSpring, [0, 1], [-80, 0]);
  const subOpacity = interpolate(subSpring, [0, 1], [0, 1]);

  // Reporter tag delayed slide-in
  const reporterSpring = spring({
    frame: frame - 30,
    fps,
    config: { damping: 14, stiffness: 90 },
  });
  const reporterTranslateY = interpolate(reporterSpring, [0, 1], [30, 0]);

  return (
    <div
      style={{
        position: "absolute",
        bottom: 48,
        left: 48,
        right: 48,
        zIndex: 40,
        transform: `translateY(${translateY}px)`,
        opacity,
        fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", maxWidth: 1480 }}>
        {/* Category & Badge Row */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 6 }}>
          {/* Main Badge */}
          <div
            style={{
              backgroundColor: accentColor,
              color: "#ffffff",
              fontWeight: 900,
              fontSize: 20,
              letterSpacing: 2,
              padding: "7px 20px",
              borderRadius: "6px 6px 0 0",
              boxShadow: `0 4px 15px ${accentColor}66`,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: "#ffffff",
              }}
            />
            {sceneIndex !== undefined ? `${sceneIndex + 1}번 뉴스` : (scene.badgeType === "breaking" ? "속보 (BREAKING)" : "주요 뉴스")}
          </div>

          {/* Category Pill */}
          <div
            style={{
              backgroundColor: "rgba(11, 37, 89, 0.9)",
              color: "#90caf9",
              fontWeight: 800,
              fontSize: 20,
              padding: "6px 18px",
              borderRadius: "6px 6px 0 0",
              border: "1px solid rgba(144, 202, 249, 0.3)",
              borderBottom: "none",
            }}
          >
            {scene.category}
          </div>

          {/* Reporter Tag (if available) */}
          {scene.reporter && (
            <div
              style={{
                marginLeft: "auto",
                backgroundColor: "rgba(0, 0, 0, 0.8)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                borderRadius: 6,
                padding: "6px 18px",
                display: "flex",
                alignItems: "center",
                gap: 10,
                color: "#f8fafc",
                fontSize: 18,
                fontWeight: 700,
                transform: `translateY(${reporterTranslateY}px)`,
                opacity: reporterSpring,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2.5">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="22" />
              </svg>
              <span>{scene.reporter.name} {scene.reporter.role}</span>
              <span style={{ color: "#64748b" }}>│</span>
              <span style={{ color: "#cbd5e1" }}>{scene.reporter.location}</span>
            </div>
          )}
        </div>

        {/* Primary Headline Box */}
        <div
          style={{
            position: "relative",
            background: `linear-gradient(90deg, #091e42 0%, ${themeColor} 50%, #08214d 100%)`,
            borderLeft: `10px solid ${accentColor}`,
            borderTop: "1px solid rgba(255, 255, 255, 0.2)",
            borderRight: "1px solid rgba(255, 255, 255, 0.1)",
            padding: "20px 32px",
            boxShadow: "0 15px 35px rgba(0, 0, 0, 0.6)",
            borderRadius: "0 10px 0 0",
          }}
        >
          <div
            style={{
              color: "#ffffff",
              fontSize: headlineStyle.fontSize,
              fontWeight: 900,
              letterSpacing: headlineStyle.letterSpacing,
              lineHeight: headlineStyle.lineHeight,
              textShadow: "0 2px 5px rgba(0,0,0,0.8)",
              wordBreak: "keep-all",
              overflowWrap: "break-word",
            }}
          >
            {scene.headline}
          </div>
        </div>

        {/* Secondary Sub-Headline Box */}
        <div
          style={{
            background: "rgba(2, 6, 23, 0.92)",
            backdropFilter: "blur(12px)",
            borderLeft: "10px solid #38bdf8",
            borderBottom: "1px solid rgba(255, 255, 255, 0.15)",
            borderRight: "1px solid rgba(255, 255, 255, 0.1)",
            padding: "14px 28px",
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.4)",
            borderRadius: "0 0 10px 10px",
            transform: `translateX(${subTranslateX}px)`,
            opacity: subOpacity,
          }}
        >
          <div
            style={{
              color: "#e2e8f0",
              fontSize: subHeadlineStyle.fontSize,
              fontWeight: 600,
              lineHeight: subHeadlineStyle.lineHeight,
              letterSpacing: subHeadlineStyle.letterSpacing,
              wordBreak: "keep-all",
              overflowWrap: "break-word",
            }}
          >
            {scene.subHeadline}
          </div>
        </div>
      </div>
    </div>
  );
};
