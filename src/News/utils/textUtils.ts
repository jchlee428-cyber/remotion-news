/**
 * 텍스트 길이에 맞춰 폰트 크기, 행간, 자간을 자동으로 최적화하는 Auto-Fit 계산 유틸리티
 */

export type AutoFitTextStyle = {
  fontSize: number;
  lineHeight: number;
  letterSpacing: number;
};

/**
 * 메인 헤드라인 제목 텍스트 크기 자동 계산
 */
export const getAutoFitHeadlineSize = (
  text: string = "",
  format: "broadcast" | "shorts" = "broadcast"
): AutoFitTextStyle => {
  const len = text.trim().length;

  if (format === "broadcast") {
    // 16:9 와이드 메인 종합 뉴스 하단 자막바
    if (len <= 28) {
      return { fontSize: 44, lineHeight: 1.25, letterSpacing: -0.5 };
    }
    if (len <= 40) {
      return { fontSize: 38, lineHeight: 1.25, letterSpacing: -0.6 };
    }
    if (len <= 55) {
      return { fontSize: 32, lineHeight: 1.22, letterSpacing: -0.7 };
    }
    return { fontSize: 27, lineHeight: 1.2, letterSpacing: -0.8 };
  }

  // 9:16 모바일 세로 숏폼 (가로 1080px 기준)
  if (len <= 20) {
    return { fontSize: 54, lineHeight: 1.24, letterSpacing: -1.2 };
  }
  if (len <= 32) {
    return { fontSize: 44, lineHeight: 1.24, letterSpacing: -1.0 };
  }
  if (len <= 46) {
    return { fontSize: 36, lineHeight: 1.22, letterSpacing: -0.8 };
  }
  return { fontSize: 30, lineHeight: 1.2, letterSpacing: -0.6 };
};

/**
 * 부제목 / 세부 설명 자막 텍스트 크기 자동 계산
 */
export const getAutoFitSubHeadlineSize = (
  text: string = "",
  format: "broadcast" | "shorts" = "broadcast"
): AutoFitTextStyle => {
  const len = text.trim().length;

  if (format === "broadcast") {
    if (len <= 40) {
      return { fontSize: 26, lineHeight: 1.4, letterSpacing: -0.2 };
    }
    if (len <= 60) {
      return { fontSize: 22, lineHeight: 1.35, letterSpacing: -0.3 };
    }
    return { fontSize: 19, lineHeight: 1.3, letterSpacing: -0.4 };
  }

  // 숏폼용
  if (len <= 32) {
    return { fontSize: 28, lineHeight: 1.35, letterSpacing: -0.5 };
  }
  if (len <= 50) {
    return { fontSize: 24, lineHeight: 1.3, letterSpacing: -0.4 };
  }
  return { fontSize: 20, lineHeight: 1.28, letterSpacing: -0.3 };
};

/**
 * '이번주 뉴스 헤드라인' 리스트 카드 제목 크기 자동 계산
 */
export const getAutoFitListTitleSize = (
  text: string = "",
  format: "broadcast" | "shorts" = "broadcast",
  isActive = false
): number => {
  const len = text.trim().length;

  if (format === "broadcast") {
    if (len <= 18) return isActive ? 24 : 22;
    if (len <= 28) return isActive ? 21 : 19;
    return isActive ? 18 : 16;
  }

  // 숏폼용
  if (len <= 18) return isActive ? 30 : 26;
  if (len <= 28) return isActive ? 25 : 22;
  return isActive ? 21 : 19;
};
