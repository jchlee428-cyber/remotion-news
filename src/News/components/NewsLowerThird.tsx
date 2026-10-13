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

  const isFirstScene = (sceneIndex ?? 0) === 0;
  const sceneDuration = (scene.durationInSeconds || 4) * fps;

  // 첫 번째 씬에서는 하단에서 우아하게 올라오고, 이후 씬에서는 자막바 틀이 고정되어 덜컹거리지 않음
  const containerSpring = spring({
    frame: frame - 5,
    fps,
    config: { damping: 15, mass: 0.8, stiffness: 100 },
  });

  const translateY = isFirstScene ? interpolate(containerSpring, [0, 1], [150, 0]) : 0;
  const containerOpacity = isFirstScene ? interpolate(containerSpring, [0, 1], [0, 1]) : 1;

  // 씬 전환 시 텍스트 내용의 부드러운 디졸브 페이드인/아웃 (방송국 텍스트 모핑)
  const textEnterOpacity = isFirstScene
    ? 1
    : interpolate(frame, [0, 14], [0, 1], { extrapolateRight: "clamp" });
  const textEnterTranslateY = isFirstScene
    ? 0
    : interpolate(frame, [0, 14], [10, 0], { extrapolateRight: "clamp" });

  // 씬 종료 10프레임 전 부드러운 아웃 디졸브 완충
  const textExitOpacity = interpolate(
    frame,
    [sceneDuration - 10, sceneDuration],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const textOpacity = textEnterOpacity * textExitOpacity;

  // Subtitle 애니메이션 (첫 씬은 지연 슬라이드, 이후 씬은 부드러운 페이드)
  const subSpring = spring({
    frame: frame - 20,
    fps,
    config: { damping: 14, stiffness: 90 },
  });
  const subTranslateX = isFirstScene ? interpolate(subSpring, [0, 1], [-80, 0]) : 0;
  const subOpacity = (isFirstScene ? interpolate(subSpring, [0, 1], [0, 1]) : textEnterOpacity) * textExitOpacity;

  // Reporter tag 애니메이션
  const reporterSpring = spring({
    frame: frame - 30,
    fps,
    config: { damping: 14, stiffness: 90 },
  });
  const reporterTranslateY = isFirstScene ? interpolate(reporterSpring, [0, 1], [30, 0]) : 0;
  const reporterOpacity = (isFirstScene ? reporterSpring : textEnterOpacity) * textExitOpacity;

  return (
    <div
      style={{
        position: "absolute",
        bottom: 48,
        left: 48,
        right: 48,
        zIndex: 40,
        transform: `translateY(${translateY}px)`,
        opacity: containerOpacity,
        fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", maxWidth: 1480 }}>
        {/* Category & Badge Row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginBottom: 6,
            opacity: textOpacity,
            transform: `translateY(${textEnterTranslateY}px)`,
          }}
        >
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
                opacity: reporterOpacity,
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
            overflow: "hidden",
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
              opacity: textOpacity,
              transform: `translateY(${textEnterTranslateY}px)`,
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
