import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { NewsScene, getSceneDurationInFrames } from "../types";
import { NewsMedia, isVideoMedia } from "./NewsMedia";
import { getAutoFitListTitleSize } from "../utils/textUtils";
import { getTransitionStyle, TransitionType } from "../utils/transitionEffects";

export type NewsStudioSceneProps = {
  scene: NewsScene;
  allScenes?: NewsScene[];
  activeSceneIndex?: number;
  defaultTransitionType?: TransitionType;
};

export const NewsStudioScene: React.FC<NewsStudioSceneProps> = ({
  scene,
  allScenes,
  activeSceneIndex = 0,
  defaultTransitionType,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const sceneDuration = getSceneDurationInFrames(scene, fps);

  // Subtle studio camera push-in dynamically matching scene duration
  const cameraScale = interpolate(frame, [0, sceneDuration], [1.0, 1.05], {
    extrapolateRight: "clamp",
  });
  const cameraPanY = interpolate(frame, [0, sceneDuration], [0, -10], {
    extrapolateRight: "clamp",
  });

  // 전환 효과 동적 계산 (기본값: 효과 없음 'none')
  const transitionType = scene.transitionType || defaultTransitionType || "none";
  const { style: transitionStyle, flashOverlayOpacity } = getTransitionStyle(
    transitionType,
    frame,
    fps,
    6
  );

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {/* 1. Main Studio Background with Camera Movement */}
      <div
        style={{
          position: "absolute",
          inset: -30,
          transform: `scale(${cameraScale}) translateY(${cameraPanY}px)`,
        }}
      >
        {/* Cinematic Vignette */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(ellipse at center, transparent 40%, rgba(3, 7, 18, 0.75) 100%)",
          }}
        />
      </div>

      {/* 2. Broadcast Graphics: Live Audio Waveform (Top-Right under header) */}
      <div
        style={{
          position: "absolute",
          top: 95,
          right: 48,
          display: "flex",
          alignItems: "flex-end",
          gap: 5,
          height: 30,
          padding: "6px 14px",
          backgroundColor: "rgba(0, 0, 0, 0.6)",
          borderRadius: 6,
          border: "1px solid rgba(255, 255, 255, 0.15)",
        }}
      >
        <span style={{ color: "#94a3b8", fontSize: 14, fontWeight: 800, marginRight: 6 }}>
          AUDIO
        </span>
        {[16, 26, 12, 22, 28, 10, 20, 24].map((baseHeight, idx) => {
          const wave = interpolate(
            Math.sin((frame / 4) + idx * 1.5),
            [-1, 1],
            [6, baseHeight]
          );
          return (
            <div
              key={idx}
              style={{
                width: 4,
                height: wave,
                backgroundColor: wave > 22 ? "#ef4444" : wave > 15 ? "#eab308" : "#22c55e",
                borderRadius: 2,
              }}
            />
          );
        })}
      </div>

      {/* 3. Main Center/Right Feature Stage: PIP News Visual & Key Highlights */}
      <div
        style={{
          position: "absolute",
          top: 110,
          left: 60,
          right: 60,
          bottom: 250,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 40,
          zIndex: 20,
        }}
      >
        {/* Left/Center: Main News Visual Frame */}
        <div
          style={{
            flex: "1 1 56%",
            height: "100%",
            maxHeight: 560,
            borderRadius: 16,
            overflow: "hidden",
            boxShadow: "0 25px 60px rgba(0, 0, 0, 0.75), 0 0 30px rgba(0, 102, 255, 0.25)",
            border: "2px solid rgba(255, 255, 255, 0.2)",
            position: "relative",
            ...transitionStyle,
          }}
        >
          {/* Flash Effect Whiteout Overlay */}
          {flashOverlayOpacity > 0.01 && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundColor: "#ffffff",
                opacity: flashOverlayOpacity,
                pointerEvents: "none",
                zIndex: 30,
              }}
            />
          )}
          {/* Main Topic Photo/Video with NewsMedia */}
          {(() => {
            const mediaSource = scene.videoSrc || scene.mediaSrc || scene.imageSrc;
            const isVideo = isVideoMedia(mediaSource, scene.mediaType);
            const hasMultipleImages = !!(scene.images && scene.images.length > 1);

            return (
              <>
                <NewsMedia
                  src={mediaSource}
                  imageSrc={scene.imageSrc}
                  images={scene.images}
                  mediaType={scene.mediaType}
                  muted={scene.videoMuted ?? true}
                  volume={scene.videoVolume ?? 1}
                  durationInFrames={sceneDuration}
                  currentFrame={frame}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transform: isVideo || hasMultipleImages
                      ? undefined
                      : `scale(${interpolate(frame, [0, sceneDuration], [1.02, 1.08], { extrapolateRight: "clamp" })}) translate(${interpolate(frame, [0, sceneDuration], [0, -6], { extrapolateRight: "clamp" })}px, ${interpolate(frame, [0, sceneDuration], [0, 4], { extrapolateRight: "clamp" })}px)`,
                  }}
                />

                {/* Broadcast Frame Badge */}
                <div
                  style={{
                    position: "absolute",
                    top: 18,
                    left: 18,
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    backgroundColor: "rgba(15, 23, 42, 0.9)",
                    backdropFilter: "blur(8px)",
                    padding: "8px 18px",
                    borderRadius: 8,
                    border: "1px solid rgba(255, 255, 255, 0.25)",
                    color: "#38bdf8",
                    fontSize: 16,
                    fontWeight: 900,
                    letterSpacing: 1.5,
                  }}
                >
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      backgroundColor: "#ef4444",
                      boxShadow: "0 0 10px #ef4444",
                    }}
                  />
                  {isVideo
                    ? "현장 보도 영상"
                    : hasMultipleImages
                    ? `현장 사진 (${scene.images!.length}장)`
                    : "현장 보도 자료"}
                </div>
              </>
            );
          })()}
        </div>

        {/* Right: Persistent Headline News List Section (이번주 뉴스 헤드라인) */}
        {((allScenes && allScenes.length > 0) || (scene.keyPoints && scene.keyPoints.length > 0)) && (
          <div
            style={{
              flex: "0 0 42%",
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            <div
              style={{
                color: "#60a5fa",
                fontSize: 24,
                fontWeight: 900,
                letterSpacing: 2,
                textTransform: "uppercase",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span
                  style={{
                    width: 5,
                    height: 24,
                    backgroundColor: "#3b82f6",
                    borderRadius: 2,
                  }}
                />
                이번주 뉴스 헤드라인
              </div>
              {allScenes && (
                <div style={{ fontSize: 16, color: "#94a3b8", fontWeight: 700 }}>
                  {activeSceneIndex + 1} / {allScenes.length}
                </div>
              )}
            </div>

            {/* List items with active highlighting */}
            {(allScenes || scene.keyPoints || []).map((item, index) => {
              const titleText = typeof item === "string" ? item : (item.shortTitle || item.headline);
              const isActive = allScenes ? index === activeSceneIndex : false;
              const isDone = allScenes ? index < activeSceneIndex : false;

              return (
                <div
                  key={index}
                  style={{
                    backgroundColor: isActive
                      ? "rgba(29, 78, 216, 0.95)" // Glowing active blue
                      : isDone
                      ? "rgba(15, 23, 42, 0.75)" // Past item
                      : "rgba(10, 25, 55, 0.65)", // Upcoming item
                    backdropFilter: "blur(12px)",
                    border: isActive
                      ? "2px solid #60a5fa"
                      : "1px solid rgba(255, 255, 255, 0.12)",
                    borderLeft: isActive
                      ? "8px solid #ef4444"
                      : isDone
                      ? "6px solid #475569"
                      : "6px solid #2563eb",
                    borderRadius: 10,
                    padding: "18px 22px",
                    boxShadow: isActive
                      ? "0 0 30px rgba(59, 130, 246, 0.6), 0 10px 25px rgba(0, 0, 0, 0.5)"
                      : "0 6px 16px rgba(0, 0, 0, 0.3)",
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    transform: isActive ? "scale(1.02)" : "scale(1)",
                  }}
                >
                  {/* Order Number / Status Badge */}
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      backgroundColor: isActive
                        ? "#ef4444"
                        : isDone
                        ? "#334155"
                        : "#1e40af",
                      color: "#ffffff",
                      fontSize: 18,
                      fontWeight: 900,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      boxShadow: isActive ? "0 0 12px #ef4444" : "none",
                    }}
                  >
                    {isDone ? "✓" : index + 1}
                  </div>

                  {/* Headline Title */}
                  <div
                    style={{
                      flex: 1,
                      color: isActive ? "#ffffff" : isDone ? "#94a3b8" : "#e2e8f0",
                      fontSize: getAutoFitListTitleSize(titleText, "broadcast", isActive),
                      fontWeight: isActive ? 900 : 700,
                      lineHeight: 1.35,
                      letterSpacing: -0.3,
                      textShadow: isActive ? "0 2px 6px rgba(0,0,0,0.6)" : "none",
                      wordBreak: "keep-all",
                      overflowWrap: "break-word",
                    }}
                  >
                    {titleText}
                  </div>

                  {/* Active ON AIR Tag */}
                  {isActive && (
                    <div
                      style={{
                        backgroundColor: "#ffffff",
                        color: "#ef4444",
                        fontSize: 13,
                        fontWeight: 900,
                        padding: "3px 10px",
                        borderRadius: 12,
                        letterSpacing: 1,
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                        flexShrink: 0,
                        boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
                      }}
                    >
                      <span
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          backgroundColor: "#ef4444",
                        }}
                      />
                      보도중
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
