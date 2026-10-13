import { TransitionType } from "./utils/transitionEffects";
export type { TransitionType };

export const AVAILABLE_PHOTO_OPTIONS = [
  "none",
  "1001as.jpg",
  "1002as.jpg",
  "1003as.jpg",
  "1004as.jpg",
  "1005as.mp4",
  "ai_tech_news.jpg",
  "datacenter_tech.jpg",
  "news_studio_bg.jpg",
  "space_launch_tech.jpg",
] as const;

export type AvailablePhotoOption = (typeof AVAILABLE_PHOTO_OPTIONS)[number];

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
  /** 뉴스 사진 목록 (최대 5장까지 선택 가능, 2장 이상 시 자동 슬라이드쇼 재생) */
  images?: string[];
  /** 드롭다운 사진 선택 슬롯 1~5 */
  photo1?: AvailablePhotoOption;
  photo2?: AvailablePhotoOption;
  photo3?: AvailablePhotoOption;
  photo4?: AvailablePhotoOption;
  photo5?: AvailablePhotoOption;
  videoSrc?: string;
  mediaSrc?: string;
  mediaType?: "image" | "video" | "auto";
  videoMuted?: boolean;
  videoVolume?: number;
  keyPoints?: string[];
  /** 재생시간 길이: 프레임 단위 (30fps 기준: 600 = 20초) */
  durationInFrames?: number;
  /** 재생시간 길이: 초 단위 (기본값: 20초) */
  durationInSeconds?: number;
  /** 뉴스 씬 전환 효과 (기본값: none) */
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
  /** 전체 뉴스 기본 전환 효과 (개별 씬 미설정 시 적용, 기본값: none) */
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
  if (!scene) return 600; // 기본 20초 (600프레임)
  if (typeof scene.durationInSeconds === "number" && scene.durationInSeconds > 0) {
    return Math.round(scene.durationInSeconds * fps);
  }
  if (typeof scene.durationInFrames === "number" && scene.durationInFrames > 0) {
    return scene.durationInFrames;
  }
  return 600; // 앞선 씬들과 동일하게 기본 20초 (600프레임) 유지
};

/**
 * 씬에 등록된 사진 목록을 안전하게 추출합니다.
 * photo1~5 드롭다운 선택값, images 배열, imageSrc 단일값을 모두 통합 처리하며,
 * 비어있을 경우 안전한 기본 사진("1001as.jpg")을 제공하여 빈 화면을 방지합니다.
 */
export const getSceneImages = (scene?: Partial<NewsScene>): string[] => {
  if (!scene) return ["1001as.jpg"];

  const directPhotos = [
    scene.photo1,
    scene.photo2,
    scene.photo3,
    scene.photo4,
    scene.photo5,
  ].filter((p): p is AvailablePhotoOption => Boolean(p && p !== "none" && p.trim() !== ""));

  if (directPhotos.length > 0) {
    return directPhotos.slice(0, 5);
  }

  if (Array.isArray(scene.images) && scene.images.length > 0) {
    const valid = scene.images.filter(Boolean);
    if (valid.length > 0) return valid.slice(0, 5);
  }

  if (scene.imageSrc && scene.imageSrc.trim() !== "") {
    return [scene.imageSrc];
  }

  // 동영상이 설정되어 있지 않다면 기본 사진 제공
  if (!scene.videoSrc) {
    return ["1001as.jpg"];
  }

  return [];
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
