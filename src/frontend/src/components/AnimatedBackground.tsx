import { useTheme } from "../context/ThemeContext";
import { FallingPattern } from "./ui/falling-pattern";

export default function AnimatedBackground() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const bg = isDark ? "#000000" : "#ffffff";
  const fg = isDark ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.45)";

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-0 pointer-events-none overflow-hidden"
      style={{ willChange: "transform", transform: "translateZ(0)" }}
    >
      <FallingPattern
        color={fg}
        backgroundColor={bg}
        duration={150}
        className="absolute inset-0 h-full w-full [mask-image:radial-gradient(ellipse_at_center,transparent_10%,black_80%)]"
      />
    </div>
  );
}
