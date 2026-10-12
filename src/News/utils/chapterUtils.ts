import { NewsBroadcastProps, getSceneDurationInFrames } from "../types";

export type ChapterItem = {
  timeFormatted: string;
  seconds: number;
  frame: number;
  title: string;
};

/**
 * 프레임 번호를 MM:SS 또는 HH:MM:SS 형식의 타임스탬프로 변환합니다.
 */
export const formatTimeFromFrames = (frame: number, fps = 30): string => {
  const totalSeconds = Math.floor(frame / fps);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }

  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};

/**
 * 뉴스 방송 데이터로부터 유튜브 챕터 목록과 설명란용 텍스트를 자동 생성합니다.
 */
export const generateYouTubeChapters = (
  props: NewsBroadcastProps,
  format: "broadcast" | "shorts" = "broadcast",
  fps = 30
): { chapters: ChapterItem[]; text: string } => {
  const chapters: ChapterItem[] = [];
  const introDuration = format === "broadcast" ? 75 : 0;

  if (format === "broadcast") {
    chapters.push({
      timeFormatted: "00:00",
      seconds: 0,
      frame: 0,
      title: `${props.channelName} 오프닝 인트로`,
    });
  }

  let currentOffset = introDuration;

  (props.scenes || []).forEach((scene, index) => {
    const timeFormatted = formatTimeFromFrames(currentOffset, fps);
    const sceneTitle = scene.shortTitle || scene.headline;
    const categoryTag = scene.category ? `[${scene.category}] ` : "";

    chapters.push({
      timeFormatted,
      seconds: Math.floor(currentOffset / fps),
      frame: currentOffset,
      title: `${index + 1}번 뉴스: ${categoryTag}${sceneTitle}`,
    });

    currentOffset += getSceneDurationInFrames(scene, fps);
  });

  const titlePrefix = format === "broadcast" ? "16:9 와이드 종합 뉴스" : "9:16 모바일 숏폼";
  const header = `📺 ${props.channelName} (${titlePrefix}) - ${props.broadcastDate}\n📌 유튜브 챕터 타임스탬프 (유튜브 영상 설명란에 복사-붙여넣기 하세요):\n`;
  const chapterLines = chapters
    .map((c) => `${c.timeFormatted} ${c.title}`)
    .join("\n");
  const footer = `\n⏱️ 전체 러닝타임: ${formatTimeFromFrames(currentOffset, fps)}`;

  const text = `${header}\n${chapterLines}\n${footer}`;

  return { chapters, text };
};
