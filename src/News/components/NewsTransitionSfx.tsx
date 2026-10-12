import React from "react";
import { Audio, Sequence, staticFile, useVideoConfig } from "remotion";
import { NewsScene, getSceneDurationInFrames } from "../types";

export type NewsTransitionSfxProps = {
  scenes: NewsScene[];
  introDuration?: number;
  enableTransitionSfx?: boolean;
  transitionSfxSrc?: string;
  sfxVolume?: number;
};

/**
 * 씬 전환 효과음(Stinger Sound Effect) 엔진
 * - 뉴스가 1번에서 2번, 2번에서 3번으로 넘어가는 정확한 타이밍마다
 *   세련된 입체 스우시/차임 효과음(0.8s)을 재생하여 생동감과 몰입감을 부여합니다.
 */
export const NewsTransitionSfx: React.FC<NewsTransitionSfxProps> = ({
  scenes,
  introDuration = 75,
  enableTransitionSfx = true,
  transitionSfxSrc,
  sfxVolume = 0.6,
}) => {
  const { fps } = useVideoConfig();

  if (!enableTransitionSfx) return null;

  const sfxSource = transitionSfxSrc || staticFile("transition_whoosh.wav");

  // 각 씬의 전환 시점(시작 프레임) 계산
  let currentOffset = introDuration;
  const transitionPoints: number[] = [];

  scenes.forEach((scene) => {
    transitionPoints.push(currentOffset);
    currentOffset += getSceneDurationInFrames(scene, fps);
  });

  return (
    <>
      {transitionPoints.map((framePoint, idx) => (
        <Sequence
          key={`sfx-transition-${idx}`}
          from={framePoint}
          durationInFrames={30} // 효과음 길이 (약 1초 미만)
          name={`Transition SFX ${idx + 1}`}
        >
          <Audio src={sfxSource} volume={sfxVolume} />
        </Sequence>
      ))}
    </>
  );
};
