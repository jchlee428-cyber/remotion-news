import React from "react";
import { Img, OffthreadVideo, interpolate, useCurrentFrame } from "remotion";

export type NewsMediaProps = {
  src?: string;
  imageSrc?: string;
  /** 최대 5장까지 지원하는 뉴스 사진 목록 (2장 이상 등록 시 자동 슬라이드쇼 재생) */
  images?: string[];
  videoSrc?: string;
  mediaType?: "image" | "video" | "auto";
  style?: React.CSSProperties;
  muted?: boolean;
  volume?: number;
  /** 해당 씬의 전체 재생 프레임 수 */
  durationInFrames?: number;
  /** 씬 내부 기준 현재 프레임 (미전달 시 useCurrentFrame 사용) */
  currentFrame?: number;
};

/**
 * Checks if the media source is a video based on mediaType or file extension (.mp4, .webm, .mov, etc.)
 */
export const isVideoMedia = (
  src?: string,
  mediaType?: "image" | "video" | "auto"
): boolean => {
  if (mediaType === "video") return true;
  if (mediaType === "image") return false;
  if (!src) return false;

  const cleanSrc = src.split("?")[0].split("#")[0].toLowerCase();
  return (
    cleanSrc.endsWith(".mp4") ||
    cleanSrc.endsWith(".webm") ||
    cleanSrc.endsWith(".mov") ||
    cleanSrc.endsWith(".m4v") ||
    cleanSrc.endsWith(".ogv")
  );
};

export const NewsMedia: React.FC<NewsMediaProps> = ({
  src,
  imageSrc,
  images,
  videoSrc,
  mediaType = "auto",
  style,
  muted = true,
  volume = 1,
  durationInFrames = 120,
  currentFrame,
}) => {
  const hookFrame = useCurrentFrame();
  const frame = typeof currentFrame === "number" ? currentFrame : hookFrame;

  const resolvedSrc = videoSrc || src || imageSrc || "";
  const isVideo = isVideoMedia(resolvedSrc, mediaType);

  // 다중 이미지 목록 (최대 5개 제한)
  const imageList =
    images && images.length > 0
      ? images.filter(Boolean).slice(0, 5)
      : resolvedSrc && !isVideo
      ? [resolvedSrc]
      : [];

  if (isVideo && resolvedSrc) {
    return (
      <OffthreadVideo
        src={resolvedSrc}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          ...style,
        }}
        muted={muted}
        volume={muted ? 0 : (volume ?? 1)}
      />
    );
  }

  if (imageList.length === 0) {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "#1e293b",
          ...style,
        }}
      />
    );
  }

  // 1장의 단일 사진일 경우
  if (imageList.length === 1) {
    return (
      <Img
        src={imageList[0]}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          ...style,
        }}
      />
    );
  }

  // 2~5장의 다중 사진 슬라이드쇼
  const count = imageList.length;
  const slotFrames = durationInFrames / count;
  const currentSlotIndex = Math.min(Math.floor(frame / slotFrames), count - 1);
  const frameInSlot = frame - currentSlotIndex * slotFrames;
  const transitionFrames = Math.min(15, Math.floor(slotFrames * 0.25));

  const isTransitioning =
    currentSlotIndex < count - 1 && frameInSlot >= slotFrames - transitionFrames;

  const fadeProgress = isTransitioning
    ? interpolate(
        frameInSlot,
        [slotFrames - transitionFrames, slotFrames],
        [0, 1],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
      )
    : 0;

  // 각 사진별 미세한 켄 번스(Ken Burns) 줌인 효과
  const currentZoom = interpolate(frameInSlot, [0, slotFrames], [1.02, 1.08], {
    extrapolateRight: "clamp",
  });
  const nextZoom = interpolate(
    frameInSlot - (slotFrames - transitionFrames),
    [0, transitionFrames],
    [1.0, 1.02],
    { extrapolateRight: "clamp" }
  );

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        ...style,
      }}
    >
      {/* 현재 표시 중인 사진 */}
      <Img
        src={imageList[currentSlotIndex]}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${currentZoom})`,
        }}
      />

      {/* 다음 사진으로의 부드러운 크로스페이드 전환 */}
      {isTransitioning && currentSlotIndex + 1 < count && (
        <Img
          src={imageList[currentSlotIndex + 1]}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: fadeProgress,
            transform: `scale(${nextZoom})`,
          }}
        />
      )}

      {/* 다중 사진 인디케이터 배지 (예: 📷 1 / 3) */}
      <div
        style={{
          position: "absolute",
          bottom: 16,
          right: 16,
          backgroundColor: "rgba(15, 23, 42, 0.85)",
          backdropFilter: "blur(6px)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          borderRadius: 20,
          padding: "5px 14px",
          display: "flex",
          alignItems: "center",
          gap: 8,
          color: "#ffffff",
          fontSize: 13,
          fontWeight: 800,
          boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
          zIndex: 10,
          pointerEvents: "none",
        }}
      >
        <span style={{ fontSize: 13 }}>📷</span>
        <span>
          {currentSlotIndex + 1} / {count}
        </span>
        <div style={{ display: "flex", gap: 4, marginLeft: 2 }}>
          {imageList.map((_, dotIdx) => (
            <div
              key={dotIdx}
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                backgroundColor:
                  dotIdx === currentSlotIndex
                    ? "#38bdf8"
                    : "rgba(255,255,255,0.35)",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
