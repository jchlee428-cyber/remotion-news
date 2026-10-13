import { staticFile } from "remotion";
import { NewsBroadcastProps } from "./types";

export const defaultNewsData: NewsBroadcastProps = {
  channelName: "큰빛뉴스",
  channelSubtext: "사랑으로 소문난 교회",
  broadcastDate: "2026. 10. 12 (주일)",
  stockTicker: "사랑으로 소문난 큰빛교회",
  scenes: [
    {
      id: "ai-quantum-breakthrough",
      category: "목장주일",
      badgeType: "breaking",
      shortTitle: "오늘은 목장주일입니다.",
      headline: "오늘은 목장주일입니다.모든 목원들은 목장주일에 참여해 주시기 바랍니다.",
      subHeadline: "오늘은 목장주일로 점심식사를 제공하지 않습니다.",
      reporter: {
        name: "김태영",
        role: "방송사역자",
        location: "큰빛교회 목장",
      },
      images: [
        staticFile("1001as.jpg"),
        staticFile("1002as.jpg"),
      ],
      imageSrc: staticFile("1001as.jpg"),
      durationInSeconds: 4,
    },
    {
      id: "bigtech-korea-datacenter",
      category: "갈렙교회",
      badgeType: "exclusive",
      shortTitle: "이번주 14일 갈렙교회 소풍이 강원도 속초에서 진행됩니다.",
      headline: "14일 수요일 갈렙교회 소풍 강원도 속초에서 진행",
      subHeadline: "어르신들에게 위로가 되며,안전하고 행복한 일정이 되도록 기도해주시기 바랍니다.",
      reporter: {
        name: "이지원",
        role: "갈렙교회에서",
        location: "갈렙교회",
      },
      images: [
        staticFile("1001as.jpg"),
        staticFile("1002as.jpg"),
      ],
      imageSrc: staticFile("1003as.jpg"),
      durationInSeconds: 4,
    },
    {
      id: "space-deep-exploration",
      category: "찬양대",
      badgeType: "tech",
      shortTitle: "할렐루야 찬양대 은혜로운 찬양 헌신",
      headline: "할렐루야 찬양대 은혜로운 찬양 헌신",
      subHeadline: "성도들에게 큰 감동과 은혜를 선사하는 주일 찬양",
      reporter: {
        name: "김찬양",
        role: "성가대",
        location: "대예배실",
      },
      videoSrc: staticFile("1005as.mp4"),
      videoMuted: false,
      videoVolume: 1,
      durationInSeconds: 5,
    }
  ],
  defaultTransitionType: "none",
  themeColor: "#0052cc",
  accentColor: "#e60000",
  // 🎵 배경 음악(BGM) 및 스마트 오디오 덕킹 설정
  enableBgm: true,
  bgmVolume: 0.45,
  duckingVolume: 0.08,
  // ⚡ 씬 전환 효과음(Stinger SFX) 설정
  enableTransitionSfx: true,
  sfxVolume: 0.6
};
