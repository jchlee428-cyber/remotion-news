import React from "react";
import { Audio, interpolate, staticFile, useVideoConfig } from "remotion";
import { NewsScene, getSceneDurationInFrames } from "../types";
import { isVideoMedia } from "./NewsMedia";

export type NewsBgmAudioProps = {
  bgmSrc?: string;
  enableBgm?: boolean;
  baseVolume?: number;
  duckingVolume?: number;
  scenes: NewsScene[];
  introDuration?: number;
};

/**
 * 앵커 BGM & 오디오 덕킹(Audio Ducking) 엔진
 * - 동영상 오디오(찬양대 등)가 재생되는 구간에서는 BGM 볼륨을 자동으로 0.08로 낮추어 음성을 또렷하게 만듭니다.
 * - 사진 보도 구간에서는 BGM이 다시 0.45로 부드럽게 복귀합니다.
 * - 오프닝과 엔딩 구간에는 자연스러운 페이드 인/아웃을 적용합니다.
 */
export const NewsBgmAudio: React.FC<NewsBgmAudioProps> = ({
  bgmSrc,
  enableBgm = true,
  baseVolume = 0.45,
  duckingVolume = 0.08,
  scenes,
  introDuration = 75,
}) => {
  const { durationInFrames, fps } = useVideoConfig();

  if (!enableBgm) return null;

  const audioSource = bgmSrc || staticFile("news_bgm.wav");

  // 동영상 오디오가 켜져 있는 구간(Ducking Intervals) 계산
  let offset = introDuration;
  const duckingIntervals: { start: number; end: number }[] = [];

  for (const scene of scenes) {
    const sceneDuration = getSceneDurationInFrames(scene, fps);
    const mediaSource = scene.videoSrc || scene.mediaSrc || scene.imageSrc;
    const isVideo = isVideoMedia(mediaSource, scene.mediaType);
    const hasAudio = isVideo && scene.videoMuted === false;

    if (hasAudio) {
      duckingIntervals.push({
        start: offset,
        end: offset + sceneDuration,
      });
    }

    offset += sceneDuration;
  }

  // 프레임별 볼륨 계산 (순수 함수)
  const getVolumeAtFrame = (frame: number): number => {
    // 1. 엔딩 페이드아웃 (마지막 30프레임 = 1초)
    if (frame >= durationInFrames - 30) {
      return interpolate(
        frame,
        [durationInFrames - 30, durationInFrames],
        [baseVolume, 0],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
      );
    }

    // 2. 오프닝 인트로 임팩트 (0~75프레임)
    let targetVol = baseVolume;
    if (introDuration > 0 && frame < introDuration) {
      targetVol = interpolate(
        frame,
        [0, 15, 50, introDuration],
        [0.2, 0.65, 0.55, baseVolume],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
      );
    }

    // 3. 오디오 덕킹(Audio Ducking) 인터벌 체크 (15프레임 = 0.5초 부드러운 전환)
    const fadeFrames = 15;

    for (const interval of duckingIntervals) {
      // 씬 시작 직전~직후: BGM 볼륨 감소 (Ducking Down)
      if (
        frame >= interval.start - fadeFrames &&
        frame <= interval.start + fadeFrames
      ) {
        return interpolate(
          frame,
          [interval.start - fadeFrames, interval.start + fadeFrames],
          [baseVolume, duckingVolume],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );
      }

      // 동영상 재생 중: 낮은 볼륨 유지
      if (
        frame > interval.start + fadeFrames &&
        frame < interval.end - fadeFrames
      ) {
        return duckingVolume;
      }

      // 동영상 종료 직전~직후: BGM 볼륨 복귀 (Ducking Up)
      if (
        frame >= interval.end - fadeFrames &&
        frame <= interval.end + fadeFrames
      ) {
        return interpolate(
          frame,
          [interval.end - fadeFrames, interval.end + fadeFrames],
          [duckingVolume, baseVolume],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );
      }
    }

    return targetVol;
  };

  return (
    <Audio
      src={audioSource}
      volume={(frame) => getVolumeAtFrame(frame)}
      loop
    />
  );
};
