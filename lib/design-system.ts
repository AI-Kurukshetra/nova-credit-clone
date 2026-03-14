export const designSystem = {
  typography: {
    display:
      'var(--font-sora), "Segoe UI", "Helvetica Neue", Arial, sans-serif',
    body:
      'var(--font-manrope), "Segoe UI", "Helvetica Neue", Arial, sans-serif',
    eyebrowLetterSpacing: "0.24em",
    bodyLineHeight: 1.7,
  },
  colors: {
    canvasTop: "#031125",
    canvasMid: "#04142f",
    canvasBottom: "#030b1b",
    ink: "#f8fafc",
    copy: "rgb(239 248 255 / 0.94)",
    mutedCopy: "rgb(207 225 243 / 0.84)",
    line: "rgb(191 219 254 / 0.22)",
    accentCyan: "#67e8f9",
    accentTeal: "#34d399",
    accentGold: "#fde68a",
    accentSky: "#38bdf8",
    accentRose: "#fb7185",
  },
  gradients: {
    canvas:
      "radial-gradient(circle at 10% 10%, rgb(34 211 238 / 20%), transparent 40%), radial-gradient(circle at 85% 20%, rgb(52 211 153 / 20%), transparent 36%), radial-gradient(circle at 45% 85%, rgb(251 191 36 / 12%), transparent 30%), linear-gradient(180deg, #031125 0%, #04142f 52%, #030b1b 100%)",
    surface:
      "linear-gradient(155deg, rgb(7 18 44 / 0.94), rgb(7 24 54 / 0.78)), linear-gradient(180deg, rgb(255 255 255 / 0.04), transparent)",
    card:
      "linear-gradient(180deg, rgb(8 19 45 / 0.96), rgb(5 14 35 / 0.92)), linear-gradient(120deg, rgb(103 232 249 / 0.04), transparent 40%)",
    primaryButton:
      "linear-gradient(100deg, #34d399, #67e8f9 44%, #fde68a 100%)",
    outlineSurface:
      "linear-gradient(180deg, rgb(10 24 52 / 0.92), rgb(6 15 34 / 0.9))",
    inputSurface:
      "linear-gradient(180deg, rgb(7 16 38 / 0.98), rgb(4 11 27 / 0.96)), rgb(15 23 42 / 0.84)",
  },
  spacing: {
    xs: "0.35rem",
    sm: "0.75rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem",
    "2xl": "3rem",
    "3xl": "4rem",
  },
  radius: {
    pill: "999px",
    sm: "0.75rem",
    md: "1rem",
    lg: "1.15rem",
    xl: "1.25rem",
    mark: "1.1rem",
  },
  shadows: {
    surface:
      "0 30px 80px -34px rgb(15 23 42 / 0.96), inset 0 1px 0 rgb(255 255 255 / 0.14)",
    card: "0 16px 48px -30px rgb(15 23 42 / 0.92)",
    hover:
      "0 22px 52px -22px rgb(8 47 73 / 0.72), 0 0 0 1px rgb(6 182 212 / 0.22)",
    button: "0 16px 40px -24px rgb(45 212 191 / 80%)",
    input:
      "inset 0 1px 0 rgb(255 255 255 / 0.05), 0 10px 24px -18px rgb(15 23 42 / 0.9)",
  },
  animation: {
    reveal: "landing-fade-up 620ms ease forwards",
    floatPrimary: "landing-float 9s ease-in-out infinite",
    floatSecondary: "landing-float 11s ease-in-out infinite reverse",
    drift: "landing-drift 18s ease-in-out infinite alternate",
    breathe: "landing-breathe 8s ease-in-out infinite",
    sheen: "landing-sheen 6s linear infinite",
  },
} as const;

export type DesignSystem = typeof designSystem;
