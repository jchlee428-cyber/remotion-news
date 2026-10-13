import { z } from "zod";
import { zColor } from "@remotion/zod-types";

/**
 * 개별 뉴스 씬(Scene) 입력 스키마
 */
export const newsSceneSchema = z.object({
  id: z.string().describe("씬 고유 식별자 (예: church-news-1)"),
  category: z.string().describe("뉴스 분류 카테고리 (예: 목장주일, 예배안내, 찬양대)"),
  badgeType: z
    .enum(["breaking", "exclusive", "live", "economy", "tech"])
    .optional()
    .describe("자막 상단 배지 스타일"),
  shortTitle: z.string().optional().describe("헤드라인 리스트 요약 제목 (미입력시 헤드라인 사용)"),
  headline: z.string().describe("메인 뉴스 헤드라인 제목"),
  subHeadline: z.string().describe("부제목 / 세부 공지 설명 문구"),
  reporter: z
    .object({
      name: z.string().describe("취재 기자 / 보고자 성명"),
      role: z.string().describe("직책 (예: 담당자, 방송팀, 리포터)"),
      location: z.string().describe("취재 장소 (예: 본당 대예배실, 교육관)"),
    })
    .optional()
    .describe("현장 취재 담당자 정보"),
  imageSrc: z.string().optional().describe("사진 이미지 파일 경로 (staticFile)"),
  images: z
    .array(z.string())
    .max(5)
    .optional()
    .describe("뉴스 사진 목록 (최대 5장까지 선택 가능, 자동 슬라이드쇼 재생)"),
  videoSrc: z.string().optional().describe("동영상 파일 경로 (MP4 등)"),
  mediaSrc: z.string().optional().describe("통합 미디어 경로"),
  mediaType: z.enum(["image", "video", "auto"]).optional().describe("미디어 유형"),
  videoMuted: z.boolean().optional().describe("동영상 음소거 여부 (false면 소리 켜짐)"),
  videoVolume: z.number().min(0).max(1).step(0.05).optional().describe("동영상 볼륨 크기 (0.0 ~ 1.0)"),
  keyPoints: z.array(z.string()).optional().describe("핵심 포인트 목록"),
  durationInSeconds: z
    .number()
    .min(1)
    .max(60)
    .step(0.5)
    .optional()
    .describe("재생시간 길이 (초 단위, 예: 4, 5, 10초)"),
  durationInFrames: z.number().min(30).max(1800).optional().describe("재생시간 길이 (프레임 단위)"),
  transitionType: z
    .enum([
      "none",
      "zoom-in",
      "zoom-out",
      "fade",
      "slide-left",
      "slide-right",
      "slide-up",
      "slide-down",
      "wipe-left",
      "wipe-right",
      "wipe-circle",
      "flip-x",
      "flip-y",
      "blur",
      "flash",
      "bounce",
      "spin",
    ])
    .optional()
    .describe("뉴스 전환 효과 (줌인, 줌아웃, 페이드, 슬라이드 4종, 와이프 3종, 3D플립 2종, 블러, 플래시, 바운스, 스핀)"),
});

/**
 * 종합 뉴스 방송 메인 입력 스키마 (Remotion Studio GUI 속성창 연동)
 */
export const newsBroadcastSchema = z.object({
  channelName: z.string().describe("방송국 / 교회 명칭 (예: 큰빛뉴스)"),
  channelSubtext: z.string().describe("채널 슬로건 / 부제 (예: 사랑으로 소문난 큰빛교회)"),
  broadcastDate: z.string().describe("방송 송출 일자 (예: 2026. 10. 12 (주일))"),
  breakingNewsList: z.array(z.string()).optional().describe("하단 속보 목록"),
  stockTicker: z.string().optional().describe("상단 표어 안내 문구"),
  scenes: z.array(newsSceneSchema).describe("뉴스 씬 목록 (순서대로 순차 방송)"),
  defaultTransitionType: z
    .enum([
      "none",
      "zoom-in",
      "zoom-out",
      "fade",
      "slide-left",
      "slide-right",
      "slide-up",
      "slide-down",
      "wipe-left",
      "wipe-right",
      "wipe-circle",
      "flip-x",
      "flip-y",
      "blur",
      "flash",
      "bounce",
      "spin",
    ])
    .optional()
    .describe("전체 뉴스 기본 전환 효과 (개별 씬 미설정 시 적용)"),
  themeColor: zColor().describe("메인 테마 컬러 (브랜드 색상)"),
  accentColor: zColor().describe("강조 포인트 컬러 (배지, 하이라이트)"),
  bgmSrc: z.string().optional().describe("BGM 오디오 파일 경로"),
  enableBgm: z.boolean().optional().describe("배경 음악(BGM) 활성화 여부"),
  bgmVolume: z.number().min(0).max(1).step(0.05).optional().describe("평상시 BGM 볼륨 (0.0 ~ 1.0)"),
  duckingVolume: z
    .number()
    .min(0)
    .max(1)
    .step(0.05)
    .optional()
    .describe("동영상 소리 재생 시 BGM 감소(덕킹) 볼륨"),
  transitionSfxSrc: z.string().optional().describe("씬 전환 효과음 오디오 경로"),
  enableTransitionSfx: z.boolean().optional().describe("씬 전환 스우시 효과음 켜기/끄기"),
  sfxVolume: z.number().min(0).max(1).step(0.05).optional().describe("효과음 볼륨 크기 (0.0 ~ 1.0)"),
});

export type NewsBroadcastSchemaType = z.infer<typeof newsBroadcastSchema>;

