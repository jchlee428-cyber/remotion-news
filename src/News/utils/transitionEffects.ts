import { interpolate, spring } from "remotion";

/**
 * 16가지 고품질 방송용 뉴스 전환 효과 타입
 */
export type TransitionType =
  | "zoom-in"      // 1. 줌인 (기본: 중앙에서 확대 등장)
  | "zoom-out"     // 2. 줌아웃 (원거리에서 축소 안착)
  | "fade"         // 3. 크로스 페이드 (부드러운 디졸브)
  | "slide-left"   // 4. 슬라이드 좌 (우측에서 좌측으로 이동)
  | "slide-right"  // 5. 슬라이드 우 (좌측에서 우측으로 이동)
  | "slide-up"     // 6. 슬라이드 상 (하단에서 상단으로 상승)
  | "slide-down"   // 7. 슬라이드 하 (상단에서 하단으로 하강)
  | "wipe-left"    // 8. 와이프 좌 (좌측으로 커튼 리빌)
  | "wipe-right"   // 9. 와이프 우 (우측으로 커튼 리빌)
  | "wipe-circle"  // 10. 원형 아이리스 (중앙에서 원형 확장)
  | "flip-x"       // 11. 3D 수평 플립 (Y축 3D 회전 안착)
  | "flip-y"       // 12. 3D 수직 플립 (X축 3D 회전 안착)
  | "blur"         // 13. 시네마틱 블러 (포커스 아웃에서 인)
  | "flash"        // 14. 뉴스 속보 플래시 (화이트아웃 카메라 플래시)
  | "bounce"       // 15. 탄성 바운스 팝 (통통 튀며 안착)
  | "spin";        // 16. 스핀 줌 (회전하며 줌인)

export interface TransitionOption {
  value: TransitionType;
  label: string;
  description: string;
}

export const TRANSITION_OPTIONS: TransitionOption[] = [
  { value: "zoom-in", label: "줌인 (Zoom In)", description: "중앙에서 확대되며 시원하게 등장 (기본)" },
  { value: "zoom-out", label: "줌아웃 (Zoom Out)", description: "원거리에서 축소되며 안정감 있게 안착" },
  { value: "fade", label: "페이드 (Cross Fade)", description: "부드럽고 자연스러운 디졸브 전환" },
  { value: "slide-left", label: "슬라이드 좌 (Slide Left)", description: "화면 우측에서 좌측으로 미끄러져 등장" },
  { value: "slide-right", label: "슬라이드 우 (Slide Right)", description: "화면 좌측에서 우측으로 미끄러져 등장" },
  { value: "slide-up", label: "슬라이드 상 (Slide Up)", description: "화면 하단에서 상단으로 상승 등장" },
  { value: "slide-down", label: "슬라이드 하 (Slide Down)", description: "화면 상단에서 하단으로 하강 등장" },
  { value: "wipe-left", label: "와이프 좌 (Wipe Left)", description: "좌측에서 우측으로 커튼이 열리듯 리빌" },
  { value: "wipe-right", label: "와이프 우 (Wipe Right)", description: "우측에서 좌측으로 커튼이 열리듯 리빌" },
  { value: "wipe-circle", label: "원형 아이리스 (Iris Circle)", description: "중앙에서 원형으로 번져 나가며 등장" },
  { value: "flip-x", label: "3D 수평 플립 (Flip Horizontal)", description: "3D 카드처럼 Y축으로 회전하며 안착" },
  { value: "flip-y", label: "3D 수직 플립 (Flip Vertical)", description: "3D 카드처럼 X축으로 회전하며 안착" },
  { value: "blur", label: "시네마틱 블러 (Cinematic Blur)", description: "초점이 흐려졌다가 선명하게 맞춰지며 등장" },
  { value: "flash", label: "뉴스 플래시 (News Flash)", description: "화이트아웃 카메라 플래시 터지며 강렬한 등장" },
  { value: "bounce", label: "탄성 바운스 (Bounce Pop)", description: "통통 튀는 탄력으로 생동감 넘치게 안착" },
  { value: "spin", label: "스핀 줌 (Spin Zoom)", description: "가벼운 회전과 함께 줌인되며 등장" },
];

export interface TransitionResult {
  style: React.CSSProperties;
  flashOverlayOpacity: number;
}

/**
 * 프레임 기반 씬 전환 스타일 계산 유틸리티
 */
export const getTransitionStyle = (
  type: TransitionType = "zoom-in",
  frame: number,
  fps = 30,
  delay = 6
): TransitionResult => {
  const currentFrame = Math.max(0, frame - delay);

  // 부드러운 표준 스프링 애니메이션
  const spr = spring({
    frame: currentFrame,
    fps,
    config: { damping: 14, mass: 0.9, stiffness: 100 },
  });

  // 생동감 넘치는 바운스 스프링 애니메이션
  const bounceSpr = spring({
    frame: currentFrame,
    fps,
    config: { damping: 8, mass: 0.8, stiffness: 130 },
  });

  let style: React.CSSProperties = {};
  let flashOverlayOpacity = 0;

  switch (type) {
    case "zoom-out": {
      const scale = interpolate(spr, [0, 1], [1.35, 1]);
      const opacity = interpolate(spr, [0, 1], [0, 1]);
      style = {
        transform: `scale(${scale})`,
        opacity,
      };
      break;
    }

    case "fade": {
      const opacity = interpolate(currentFrame, [0, 16], [0, 1], {
        extrapolateRight: "clamp",
      });
      style = { opacity };
      break;
    }

    case "slide-left": {
      const x = interpolate(spr, [0, 1], [180, 0]);
      const opacity = interpolate(spr, [0, 1], [0, 1]);
      style = {
        transform: `translateX(${x}px)`,
        opacity,
      };
      break;
    }

    case "slide-right": {
      const x = interpolate(spr, [0, 1], [-180, 0]);
      const opacity = interpolate(spr, [0, 1], [0, 1]);
      style = {
        transform: `translateX(${x}px)`,
        opacity,
      };
      break;
    }

    case "slide-up": {
      const y = interpolate(spr, [0, 1], [150, 0]);
      const opacity = interpolate(spr, [0, 1], [0, 1]);
      style = {
        transform: `translateY(${y}px)`,
        opacity,
      };
      break;
    }

    case "slide-down": {
      const y = interpolate(spr, [0, 1], [-150, 0]);
      const opacity = interpolate(spr, [0, 1], [0, 1]);
      style = {
        transform: `translateY(${y}px)`,
        opacity,
      };
      break;
    }

    case "wipe-left": {
      const cut = interpolate(spr, [0, 1], [100, 0]);
      style = {
        clipPath: `inset(0 0 0 ${cut}%)`,
      };
      break;
    }

    case "wipe-right": {
      const cut = interpolate(spr, [0, 1], [100, 0]);
      style = {
        clipPath: `inset(0 ${cut}% 0 0)`,
      };
      break;
    }

    case "wipe-circle": {
      const radius = interpolate(spr, [0, 1], [0, 150]);
      style = {
        clipPath: `circle(${radius}% at center)`,
      };
      break;
    }

    case "flip-x": {
      const rotY = interpolate(spr, [0, 1], [-90, 0]);
      const opacity = interpolate(spr, [0, 1], [0, 1]);
      style = {
        transform: `perspective(1200px) rotateY(${rotY}deg)`,
        opacity,
      };
      break;
    }

    case "flip-y": {
      const rotX = interpolate(spr, [0, 1], [90, 0]);
      const opacity = interpolate(spr, [0, 1], [0, 1]);
      style = {
        transform: `perspective(1200px) rotateX(${rotX}deg)`,
        opacity,
      };
      break;
    }

    case "blur": {
      const blurVal = interpolate(spr, [0, 1], [24, 0]);
      const opacity = interpolate(spr, [0, 1], [0, 1]);
      style = {
        filter: `blur(${blurVal}px)`,
        opacity,
      };
      break;
    }

    case "flash": {
      const brightness = interpolate(currentFrame, [0, 3, 14], [1.2, 2.5, 1], {
        extrapolateRight: "clamp",
      });
      const opacity = interpolate(currentFrame, [0, 6], [0, 1], {
        extrapolateRight: "clamp",
      });
      flashOverlayOpacity = interpolate(currentFrame, [0, 2, 14], [0.85, 1, 0], {
        extrapolateRight: "clamp",
      });
      style = {
        filter: `brightness(${brightness})`,
        opacity,
      };
      break;
    }

    case "bounce": {
      const scale = interpolate(bounceSpr, [0, 1], [0.45, 1]);
      const opacity = interpolate(spr, [0, 1], [0, 1]);
      style = {
        transform: `scale(${scale})`,
        opacity,
      };
      break;
    }

    case "spin": {
      const rot = interpolate(spr, [0, 1], [-25, 0]);
      const scale = interpolate(spr, [0, 1], [0.65, 1]);
      const opacity = interpolate(spr, [0, 1], [0, 1]);
      style = {
        transform: `scale(${scale}) rotate(${rot}deg)`,
        opacity,
      };
      break;
    }

    case "zoom-in":
    default: {
      const scale = interpolate(spr, [0, 1], [0.75, 1]);
      const opacity = interpolate(spr, [0, 1], [0, 1]);
      style = {
        transform: `scale(${scale})`,
        opacity,
      };
      break;
    }
  }

  return { style, flashOverlayOpacity };
};
