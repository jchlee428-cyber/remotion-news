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
        role: "테크 전문 기자",
        location: "판교 R&D 센터",
      },
      imageSrc: staticFile("1001as.jpg"),
      durationInSeconds: 4,
    },
    {
      id: "bigtech-korea-datacenter",
      category: "경제 · 산업",
      badgeType: "exclusive",
      shortTitle: "글로벌 빅테크, 한국형 AI 데이터센터 설립",
      headline: "글로벌 빅테크 기업들, 한국형 AI 클라우드 데이터센터 공동 설립 논의",
      subHeadline: "아시아태평양 핵심 허브 도약... 친환경 수랭식 냉각 및 대규모 전력 인프라 투자",
      reporter: {
        name: "이지원",
        role: "경제부 기자",
        location: "여의도 금융센터",
      },
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
