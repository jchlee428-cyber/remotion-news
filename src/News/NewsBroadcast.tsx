import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { NewsBroadcastProps, getSceneDurationInFrames } from "./types";
import { NewsIntro } from "./components/NewsIntro";
import { NewsHeader } from "./components/NewsHeader";
import { NewsStudioScene } from "./components/NewsStudioScene";
import { NewsLowerThird } from "./components/NewsLowerThird";
import { NewsBgmAudio } from "./components/NewsBgmAudio";
import { NewsTransitionSfx } from "./components/NewsTransitionSfx";

export const NewsBroadcast: React.FC<NewsBroadcastProps> = ({
  channelName,
  channelSubtext,
  broadcastDate,
  stockTicker,
  scenes,
  defaultTransitionType,
  themeColor,
  accentColor,
  bgmSrc,
  bgmVolume,
  duckingVolume,
  enableBgm = true,
  transitionSfxSrc,
  enableTransitionSfx = true,
  sfxVolume,
}) => {
  const introDuration = 75; // 2.5초 인트로 (30fps)
  const totalBroadcastFrames = scenes.reduce(
    (sum, s) => sum + getSceneDurationInFrames(s, 30),
    0
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#020617",
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
        introDuration={introDuration}
      />

      {/* 0.1 씬 전환 효과음 (Stinger SFX) */}
      <NewsTransitionSfx
        scenes={scenes}
        introDuration={introDuration}
        enableTransitionSfx={enableTransitionSfx}
        transitionSfxSrc={transitionSfxSrc}
        sfxVolume={sfxVolume}
      />

      {/* 1. 오프닝 인트로 (0 ~ 75 프레임) */}
      <Sequence durationInFrames={introDuration} name="News Intro Opener">
        <NewsIntro
          channelName={channelName}
          subtitle={channelSubtext || "사랑으로 소문난 교회"}
          themeColor={themeColor}
          accentColor={accentColor}
        />
      </Sequence>

      {/* 2. 상단 헤더 (75 프레임부터 방송 종료 시까지 지속) */}
      <Sequence
        from={introDuration}
        durationInFrames={totalBroadcastFrames + 30}
        name="Broadcast Header"
      >
        <NewsHeader
          channelName={channelName}
          broadcastDate={broadcastDate}
          stockTicker={stockTicker}
          accentColor={accentColor}
        />
      </Sequence>

      {/* 3. 뉴스 씬 순차 재생 (1번 -> 2번 -> 3번 ...) 각 씬의 개별 재생시간에 맞춰 자동 정렬 */}
      {(() => {
        let currentOffset = introDuration;

        return scenes.map((scene, index) => {
          const fromFrame = currentOffset;
          const sceneDuration = getSceneDurationInFrames(scene, 30);
          currentOffset += sceneDuration;

          return (
            <Sequence
              key={scene.id || index}
              from={fromFrame}
              durationInFrames={sceneDuration}
              name={`Headline News ${index + 1}`}
            >
              <AbsoluteFill>
                {/* 메인 비주얼 스테이지 (스튜디오 배경, PIP 미디어 화면, 우측 헤드라인 리스트) */}
                <NewsStudioScene
                  scene={scene}
                  allScenes={scenes}
                  activeSceneIndex={index}
                  defaultTransitionType={defaultTransitionType}
                />

                {/* 하단 뉴스 자막바 (Lower Third) */}
                <NewsLowerThird
                  scene={scene}
                  sceneIndex={index}
                  themeColor={themeColor}
                  accentColor={accentColor}
                />
              </AbsoluteFill>
            </Sequence>
          );
        });
      })()}
    </AbsoluteFill>
  );
};
