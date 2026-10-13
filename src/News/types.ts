import { TransitionType } from "./utils/transitionEffects";
export type { TransitionType };

export type NewsScene = {
  id: string;
  category: string;
  badgeType?: "breaking" | "exclusive" | "live" | "economy" | "tech";
  headline: string;
  subHeadline: string;
  shortTitle?: string;
  reporter?: {
    name: string;
    role: string;
    location: string;
  };
  imageSrc?: string;
  videoSrc?: string;
  mediaSrc?: string;
  mediaType?: "image" | "video" | "auto";
  videoMuted?: boolean;
  videoVolume?: number;
  keyPoints?: string[];
  /** 재생시간 길이: 프레임 단위 (30fps 기준: 30 = 1초, 120 = 4초, 300 = 10초) */
  durationInFrames?: number;
  /** 재생시간 길이: 초 단위 (예: 5 = 5초, 8.5 = 8.5초, 15 = 15초) */
  durationInSeconds?: number;
  /** 뉴스 씬 전환 효과 (기본값: zoom-in) */
  transitionType?: TransitionType;
};

export type NewsBroadcastProps = {
  channelName: string;
  channelSubtext: string;
  broadcastDate: string;
  breakingNewsList?: string[];
  stockTicker?: string;
  scenes: NewsScene[];
  themeColor: string;
  accentColor: string;
  /** 전체 뉴스 기본 전환 효과 (개별 씬 미설정 시 적용, 기본값: zoom-in) */
  defaultTransitionType?: TransitionType;
  /** 배경음악(BGM) 오디오 파일 경로 (기본값: staticFile("news_bgm.wav")) */
  bgmSrc?: string;
  /** 기본 BGM 볼륨 크기 (0.0 ~ 1.0, 기본값: 0.45) */
  bgmVolume?: number;
  /** 동영상 소리 재생 시 BGM 감소(Ducking) 볼륨 (0.0 ~ 1.0, 기본값: 0.08) */
  duckingVolume?: number;
  /** BGM 재생 여부 (기본값: true) */
  enableBgm?: boolean;
  /** 씬 전환 효과음(Stinger SFX) 오디오 파일 경로 (기본값: staticFile("transition_whoosh.wav")) */
  transitionSfxSrc?: string;
  /** 씬 전환 효과음 활성화 여부 (기본값: true) */
  enableTransitionSfx?: boolean;
  /** 씬 전환 효과음 볼륨 (0.0 ~ 1.0, 기본값: 0.6) */
  sfxVolume?: number;
};

/**
 * 특정 씬의 재생시간(프레임)을 계산합니다.
 * durationInSeconds(초) 또는 durationInFrames(프레임) 중 하나를 사용하며,
 * 둘 다 없을 경우 기본 120프레임(4초)을 적용합니다.
 */
export const getSceneDurationInFrames = (scene?: Partial<NewsScene>, fps = 30): number => {
  if (!scene) return 120;
  if (typeof scene.durationInSeconds === "number" && scene.durationInSeconds > 0) {
    return Math.round(scene.durationInSeconds * fps);
  }
  if (typeof scene.durationInFrames === "number" && scene.durationInFrames > 0) {
    return scene.durationInFrames;
  }
  return 120; // 기본 4초 (120프레임)
};

/**
 * 16:9 와이드 메인 종합 뉴스의 전체 러닝타임을 계산합니다. (오프닝 인트로 75프레임 + 모든 씬 + 여유 10프레임)
 */
export const getTotalBroadcastDurationInFrames = (
  props: Partial<NewsBroadcastProps>,
  fps = 30
): number => {
  const introDuration = 75; // 2.5초 인트로
  const scenes = props.scenes || [];
  const scenesTotal = scenes.reduce(
    (sum, scene) => sum + getSceneDurationInFrames(scene, fps),
    0
  );
  return Math.max(introDuration + scenesTotal + 10, 90);
};

/**
 * 9:16 모바일 숏폼 뉴스의 전체 러닝타임을 계산합니다.
 */
export const getTotalShortsDurationInFrames = (
  props: Partial<NewsBroadcastProps>,
  fps = 30
): number => {
  const scenes = props.scenes || [];
  const scenesTotal = scenes.reduce(
    (sum, scene) => sum + getSceneDurationInFrames(scene, fps),
    0
  );
  return Math.max(scenesTotal, 60);
};
