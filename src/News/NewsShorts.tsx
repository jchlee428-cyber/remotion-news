import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { NewsBroadcastProps, getSceneDurationInFrames } from "./types";
import { NewsMedia, isVideoMedia } from "./components/NewsMedia";
import { NewsBgmAudio } from "./components/NewsBgmAudio";
import { NewsTransitionSfx } from "./components/NewsTransitionSfx";
import {
  getAutoFitHeadlineSize,
  getAutoFitSubHeadlineSize,
  getAutoFitListTitleSize,
} from "./utils/textUtils";
import { getTransitionStyle } from "./utils/transitionEffects";

export const NewsShorts: React.FC<NewsBroadcastProps> = ({
  channelName,
  broadcastDate,
  scenes,
  defaultTransitionType = "none",
  accentColor = "#e60000",
  bgmSrc,
  bgmVolume,
  duckingVolume,
  enableBgm = true,
  transitionSfxSrc,
  enableTransitionSfx = true,
  sfxVolume,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 1. Calculate active scene index based on dynamic frame progress
  let accumulatedFrames = 0;
  let activeSceneIndex = 0;
  let sceneProgressFrame = 0;

  for (let i = 0; i < scenes.length; i++) {
    const sceneDuration = getSceneDurationInFrames(scenes[i], fps);
    if (frame >= accumulatedFrames && frame < accumulatedFrames + sceneDuration) {
      activeSceneIndex = i;
      sceneProgressFrame = frame - accumulatedFrames;
      break;
    }
    accumulatedFrames += sceneDuration;
    if (i === scenes.length - 1 && frame >= accumulatedFrames) {
      activeSceneIndex = i;
      sceneProgressFrame = sceneDuration - 1;
    }
  }

  const activeScene = scenes[activeSceneIndex] || scenes[0];

  const headlineStyle = getAutoFitHeadlineSize(activeScene.headline, "shorts");
  const subHeadlineStyle = getAutoFitSubHeadlineSize(activeScene.subHeadline, "shorts");

  // Transition spring whenever activeScene changes
  const transitionSpring = spring({
    frame: sceneProgressFrame,
    fps,
    config: { damping: 14, stiffness: 100 },
  });
  const titleY = interpolate(transitionSpring, [0, 1], [40, 0]);
  const titleOpacity = interpolate(transitionSpring, [0, 1], [0, 1]);


  // Subtle pulsing dot for status indicators
  const livePulse = interpolate(
    Math.sin((frame / 20) * Math.PI * 2),
    [-1, 1],
    [0.4, 1]
  );

  // 전환 효과 계산 (기본값: 효과 없음 'none')
  const shortsTransition = getTransitionStyle(
    activeScene.transitionType || defaultTransitionType || "none",
    sceneProgressFrame,
    fps,
    0
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#030712",
        overflow: "hidden",
        fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* 0. 앵커 BGM & 스마트 오디오 덕킹 */}
      <NewsBgmAudio
        bgmSrc={bgmSrc}
        enableBgm={enableBgm}
        baseVolume={bgmVolume}
        duckingVolume={duckingVolume}
        scenes={scenes}
        introDuration={0}
      />

      {/* 0.1 씬 전환 효과음 (Stinger SFX) */}
      <NewsTransitionSfx
        scenes={scenes}
        introDuration={0}
        enableTransitionSfx={enableTransitionSfx}
        transitionSfxSrc={transitionSfxSrc}
        sfxVolume={sfxVolume}
      />

      {/* Background with Ambient Dark Studio Lighting */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(circle at 50% 20%, #0d2856 0%, #030a1b 50%, #020617 100%)",
        }}
      />

      {/* Top Header Row (Channel branding & LIVE status) */}
      <div
        style={{
          position: "absolute",
          top: 70,
          left: 40,
          right: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          zIndex: 30,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              backgroundColor: "#1e3a8a",
              color: "#ffffff",
              padding: "10px 22px",
              borderRadius: 10,
              fontSize: 28,
              fontWeight: 900,
              letterSpacing: 1.5,
              border: "1px solid rgba(255,255,255,0.25)",
            }}
          >
            {channelName}
          </div>
        </div>

        <div style={{ color: "#cbd5e1", fontSize: 24, fontWeight: 700 }}>
          {broadcastDate}
        </div>
      </div>

      {/* Dynamic Headline Sequence Tag Row */}
      <div
        style={{
          position: "absolute",
          top: 155,
          left: 40,
          display: "flex",
          alignItems: "center",
          gap: 12,
          zIndex: 25,
        }}
      >
        {/* Active Headline Order Badge */}
        <div
          style={{
            backgroundColor: accentColor,
            color: "#ffffff",
            padding: "6px 18px",
            borderRadius: 6,
            fontSize: 22,
            fontWeight: 900,
            letterSpacing: 1,
            display: "flex",
            alignItems: "center",
            gap: 8,
            boxShadow: `0 0 15px ${accentColor}88`,
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor: "#ffffff",
              opacity: livePulse,
            }}
          />
          {activeSceneIndex + 1}번 뉴스
        </div>

        {/* Category Tag */}
        <div
          style={{
            backgroundColor: "rgba(11, 37, 89, 0.9)",
            color: "#38bdf8",
            padding: "6px 16px",
            borderRadius: 6,
            fontSize: 22,
            fontWeight: 800,
            border: "1px solid rgba(56, 189, 248, 0.3)",
          }}
        >
          {activeScene.category}
        </div>
      </div>

      {/* Main Headline (Top 1/3) - Dynamically changes per news index */}
      <div
        style={{
          position: "absolute",
          top: 215,
          left: 40,
          right: 40,
          transform: `translateY(${titleY}px)`,
          opacity: titleOpacity,
          zIndex: 25,
        }}
      >
        <div
          style={{
            fontSize: headlineStyle.fontSize,
            fontWeight: 900,
            color: "#ffffff",
            lineHeight: headlineStyle.lineHeight,
            letterSpacing: headlineStyle.letterSpacing,
            textShadow: "0 4px 18px rgba(0,0,0,0.85)",
            marginBottom: 12,
            wordBreak: "keep-all",
            overflowWrap: "break-word",
          }}
        >
          {activeScene.headline}
        </div>
        <div
          style={{
            fontSize: subHeadlineStyle.fontSize,
            fontWeight: 600,
            color: "#cbd5e1",
            lineHeight: subHeadlineStyle.lineHeight,
            letterSpacing: subHeadlineStyle.letterSpacing,
            wordBreak: "keep-all",
            overflowWrap: "break-word",
          }}
        >
          {activeScene.subHeadline}
        </div>
      </div>

      {/* Center News Media Frame (Middle 1/3) - Switches per active news story */}
      <div
        style={{
          position: "absolute",
          top: 520,
          left: 40,
          right: 40,
          height: 560,
          borderRadius: 24,
          overflow: "hidden",
          border: "2px solid rgba(255, 255, 255, 0.25)",
          boxShadow: "0 25px 50px rgba(0, 0, 0, 0.7), 0 0 40px rgba(14, 165, 233, 0.25)",
          zIndex: 20,
          ...shortsTransition.style,
        }}
      >
        {/* Flash Whiteout Overlay */}
        {shortsTransition.flashOverlayOpacity > 0.01 && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundColor: "#ffffff",
              opacity: shortsTransition.flashOverlayOpacity,
              pointerEvents: "none",
              zIndex: 30,
            }}
          />
        )}
        {(() => {
          const mediaSource = activeScene.videoSrc || activeScene.mediaSrc || activeScene.imageSrc;
          const isVideo = isVideoMedia(mediaSource, activeScene.mediaType);

          return (
            <NewsMedia
              src={mediaSource}
              mediaType={activeScene.mediaType}
              muted={activeScene.videoMuted ?? true}
              volume={activeScene.videoVolume ?? 1}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transform: isVideo
                  ? undefined
                  : `scale(${interpolate(sceneProgressFrame, [0, 150], [1.02, 1.1])})`,
              }}
            />
          );
        })()}
        <div
          style={{
            position: "absolute",
            bottom: 20,
            left: 20,
            backgroundColor: "rgba(0, 0, 0, 0.85)",
            backdropFilter: "blur(8px)",
            padding: "10px 22px",
            borderRadius: 8,
            color: "#f8fafc",
            fontSize: 22,
            fontWeight: 800,
          }}
        >
          {activeScene.reporter
            ? `${activeScene.reporter.name} 기자 (${activeScene.reporter.location})`
            : "현장 보도"}
        </div>
      </div>

      {/* Persistent Headline News List Section (하단 고정 헤드라인 리스트) */}
      {/* 뉴스가 모두 끝날 때까지 사라지지 않고 유지되며, 현재 순서의 제목이 명확히 강조됨 */}
      <div
        style={{
          position: "absolute",
          top: 1120,
          left: 40,
          right: 40,
          display: "flex",
          flexDirection: "column",
          gap: 16,
          zIndex: 25,
        }}
      >
        <div
          style={{
            color: "#60a5fa",
            fontSize: 28,
            fontWeight: 900,
            letterSpacing: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              style={{
                width: 6,
                height: 26,
                backgroundColor: "#3b82f6",
                borderRadius: 3,
              }}
            />
            이번주 뉴스 헤드라인
          </div>
          <div style={{ fontSize: 20, color: "#94a3b8", fontWeight: 700 }}>
            {activeSceneIndex + 1} / {scenes.length}
          </div>
        </div>

        {/* 1번, 2번, 3번 헤드라인 항목들 */}
        {scenes.map((scene, idx) => {
          const isActive = idx === activeSceneIndex;
          const isDone = idx < activeSceneIndex;

          return (
            <div
              key={scene.id || idx}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 18,
                padding: "20px 24px",
                borderRadius: 14,
                backgroundColor: isActive
                  ? "rgba(29, 78, 216, 0.95)" // Active glowing bright blue
                  : isDone
                  ? "rgba(15, 23, 42, 0.75)" // Past story
                  : "rgba(10, 25, 55, 0.55)", // Upcoming story
                border: isActive
                  ? "2px solid #60a5fa"
                  : "1px solid rgba(255, 255, 255, 0.12)",
                boxShadow: isActive
                  ? "0 0 30px rgba(59, 130, 246, 0.6), 0 8px 20px rgba(0,0,0,0.4)"
                  : "0 4px 12px rgba(0,0,0,0.25)",
                transform: isActive ? "scale(1.02)" : "scale(1)",
              }}
            >
              {/* Order Number Badge */}
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  backgroundColor: isActive
                    ? accentColor
                    : isDone
                    ? "#334155"
                    : "#1e3a8a",
                  color: "#ffffff",
                  fontSize: 24,
                  fontWeight: 900,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  boxShadow: isActive ? `0 0 15px ${accentColor}` : "none",
                }}
              >
                {isDone ? "✓" : idx + 1}
              </div>

              {/* Title Text */}
              <div
                style={{
                  flex: 1,
                  color: isActive ? "#ffffff" : isDone ? "#94a3b8" : "#cbd5e1",
                  fontSize: getAutoFitListTitleSize(
                    scene.shortTitle || scene.headline,
                    "shorts",
                    isActive
                  ),
                  fontWeight: isActive ? 900 : 700,
                  letterSpacing: -0.5,
                  textShadow: isActive ? "0 2px 8px rgba(0,0,0,0.6)" : "none",
                  wordBreak: "keep-all",
                  overflowWrap: "break-word",
                }}
              >
                {scene.shortTitle || scene.headline}
              </div>

              {/* ON AIR Indicator Badge for the currently playing news */}
              {isActive && (
                <div
                  style={{
                    backgroundColor: "#ffffff",
                    color: accentColor,
                    fontSize: 16,
                    fontWeight: 900,
                    padding: "4px 12px",
                    borderRadius: 20,
                    letterSpacing: 1,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                    flexShrink: 0,
                  }}
                >
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      backgroundColor: accentColor,
                      opacity: livePulse,
                    }}
                  />
                  보도중
                </div>
              )}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
