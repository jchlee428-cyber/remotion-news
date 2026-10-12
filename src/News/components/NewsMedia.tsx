import React from "react";
import { Img, OffthreadVideo } from "remotion";

export type NewsMediaProps = {
  src?: string;
  imageSrc?: string;
  videoSrc?: string;
  mediaType?: "image" | "video" | "auto";
  style?: React.CSSProperties;
  muted?: boolean;
  volume?: number;
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
  videoSrc,
  mediaType = "auto",
  style,
  muted = true,
  volume = 1,
}) => {
  const resolvedSrc = videoSrc || src || imageSrc || "";
  const isVideo = isVideoMedia(resolvedSrc, mediaType);

  if (!resolvedSrc) {
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

  if (isVideo) {
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

  return (
    <Img
      src={resolvedSrc}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        ...style,
      }}
    />
  );
};
