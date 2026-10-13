import { NewsStudioBg } from "./NewsStudioBg";
import { Composition, Folder } from "remotion";
import { HelloWorld } from "./HelloWorld";
import { Logo } from "./HelloWorld/Logo";
import { Title } from "./HelloWorld/Title";

import { NewsBroadcast } from "./News/NewsBroadcast";
import { NewsShorts } from "./News/NewsShorts";
import { NewsIntro } from "./News/components/NewsIntro";
import { NewsLowerThird } from "./News/components/NewsLowerThird";
import {
  defaultNewsData,
} from "./News/mockData";
import {
  getTotalBroadcastDurationInFrames,
  getTotalShortsDurationInFrames,
} from "./News/types";
import { newsBroadcastSchema } from "./News/schema";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* 1. 영상 뉴스 메인 컴포지션 폴더 */}
      <Folder name="News-Video">
        {/* 16:9 와이드 메인 종합 뉴스 방송 */}
        <Composition
          id="NewsBroadcast"
          component={NewsBroadcast}
          schema={newsBroadcastSchema}
          durationInFrames={getTotalBroadcastDurationInFrames(defaultNewsData, 30)}
          calculateMetadata={({ props }) => ({
            durationInFrames: getTotalBroadcastDurationInFrames(props, 30),
          })}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={defaultNewsData}
        />

        {/* 9:16 모바일 숏폼 / 릴스 / 틱톡 뉴스 */}
        <Composition
          id="NewsShorts"
          component={NewsShorts}
          schema={newsBroadcastSchema}
          durationInFrames={getTotalShortsDurationInFrames(defaultNewsData, 30)}
          calculateMetadata={({ props }) => ({
            durationInFrames: getTotalShortsDurationInFrames(props, 30),
          })}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={defaultNewsData}
        />

        {/* 단독 뉴스 인트로 / 오프닝 */}
        <Composition
          id="NewsIntro"
          component={NewsIntro}
          durationInFrames={90} // 3초 (30fps)
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{
            channelName: "큰빛뉴스",
            badgeText: "WEEKLY NEWS",
            subtitle: "사랑으로 소문난 교회",
            themeColor: "#0b2559",
            accentColor: "#e60000",
          }}
        />

        {/* 단독 뉴스 자막바 (Lower Third) 오버레이 */}
        <Composition
          id="NewsLowerThird"
          component={NewsLowerThird}
          durationInFrames={120} // 4초 (30fps)
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{
            scene: defaultNewsData.scenes[0],
            themeColor: defaultNewsData.themeColor,
            accentColor: defaultNewsData.accentColor,
          }}
        />
      </Folder>

      {/* 2. Remotion 기본 템플릿 예제 (참고용) */}
      <Folder name="Hello-World">
        <Composition
          id="HelloWorld"
          component={HelloWorld}
          durationInFrames={150}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{
            titleText: "Welcome to Remotion",
            titleColor: "#000000",
          }}
        />
        <Composition
          id="Logo"
          component={Logo}
          durationInFrames={150}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{
            logoColor1: "#91EAE4",
            logoColor2: "#86A8E7",
          }}
        />
        <Composition
          id="Title"
          component={Title}
          durationInFrames={115}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{
            titleText: "Welcome to Remotion",
            titleColor: "#000000",
          }}
        />
      </Folder>
      <Composition
        id="NewsStudioBg"
        component={NewsStudioBg}
        durationInFrames={90}
        fps={30}
        width={1376}
        height={768}
      />
    </>
  );
};
