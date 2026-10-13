import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export type NewsIntroProps = {
  channelName?: string;
  badgeText?: string;
  subtitle?: string;
  themeColor?: string;
  accentColor?: string;
};

export const NewsIntro: React.FC<NewsIntroProps> = ({
  channelName = "큰빛뉴스",
  badgeText = "WEEKLY NEWS",
  subtitle = "사랑으로 소문난 교회",
  themeColor = "#0b2559",
  accentColor = "#e60000",
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Entrance spring for main title
  const titleSpring = spring({
    frame,
    fps,
    config: { damping: 14, mass: 0.8, stiffness: 120 },
  });

  // Scale & Opacity dynamics
  const titleScale = interpolate(titleSpring, [0, 1], [2.2, 1]);
  const titleOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Flare sweep effect
  const flarePosition = interpolate(frame, [15, 60], [-100, 200], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Outro fade out into studio
  const outroOpacity = interpolate(
    frame,
    [durationInFrames - 15, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Background radar rotation
  const rotation = interpolate(frame, [0, 120], [0, 360]);
  const pulseScale = interpolate(
    Math.sin((frame / fps) * Math.PI * 3),
    [-1, 1],
    [0.95, 1.05]
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#030b1e",
        opacity: outroOpacity,
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* Dynamic Digital Grid & Radial Glow */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `
            radial-gradient(circle at 50% 50%, ${themeColor} 0%, #061129 60%, #020712 100%)
          `,
        }}
      />

      {/* Grid overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
          perspective: 600,
          transform: "rotateX(60deg) translateY(100px)",
          opacity: 0.4,
        }}
      />

      {/* Rotating Radar / Globe Ring Graphic */}
      <div
        style={{
          position: "absolute",
          width: 800,
          height: 800,
          borderRadius: "50%",
          border: "2px dashed rgba(64, 150, 255, 0.3)",
          transform: `scale(${pulseScale}) rotate(${rotation}deg)`,
          boxShadow: "0 0 80px rgba(0, 122, 255, 0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 600,
            height: 600,
            borderRadius: "50%",
            border: "1px solid rgba(255, 255, 255, 0.15)",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 400,
            height: 400,
            borderRadius: "50%",
            border: "2px solid rgba(230, 0, 0, 0.4)",
          }}
        />
      </div>

      {/* Floating Particles / News Rings */}
      <div
        style={{
          position: "absolute",
          width: 900,
          height: 2,
          background: `linear-gradient(90deg, transparent, ${accentColor}, #ffffff, ${accentColor}, transparent)`,
          top: "42%",
          opacity: interpolate(frame, [10, 30], [0, 0.8], {
            extrapolateRight: "clamp",
          }),
        }}
      />

      {/* Central Title Cluster */}
      <div
        style={{
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          transform: `scale(${titleScale})`,
          opacity: titleOpacity,
        }}
      >
        {/* Top Tag: BREAKING NEWS */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            backgroundColor: accentColor,
            color: "#ffffff",
            padding: "10px 34px",
            borderRadius: 6,
            fontSize: 28,
            fontWeight: 900,
            letterSpacing: 5,
            boxShadow: `0 0 30px ${accentColor}aa`,
            marginBottom: 24,
          }}
        >
          <span
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              backgroundColor: "#ffffff",
              boxShadow: "0 0 12px #ffffff",
            }}
          />
          {badgeText}
        </div>

        {/* Main Channel Branding */}
        <div
          style={{
            position: "relative",
            fontSize: 112,
            fontWeight: 900,
            letterSpacing: 8,
            color: "#ffffff",
            textTransform: "uppercase",
            textShadow: "0 10px 30px rgba(0,0,0,0.8), 0 0 60px rgba(0, 122, 255, 0.7)",
            lineHeight: 1,
            marginBottom: 20,
          }}
        >
          {channelName}
          {/* Shimmer light sweep */}
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: `${flarePosition}%`,
              width: 140,
              background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.85), transparent)",
              transform: "skewX(-25deg)",
              pointerEvents: "none",
            }}
          />
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 36,
            fontWeight: 700,
            color: "#a0c4ff",
            letterSpacing: 10,
            textShadow: "0 2px 10px rgba(0,0,0,0.6)",
          }}
        >
          {subtitle}
        </div>
      </div>

      {/* Bottom Progress Accent */}
      <div
        style={{
          position: "absolute",
          bottom: 40,
          display: "flex",
          gap: 8,
          alignItems: "center",
        }}
      >
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            style={{
              width: 40,
              height: 4,
              backgroundColor: frame > i * 15 ? "#00c3ff" : "rgba(255,255,255,0.2)",
              borderRadius: 2,
            }}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};
