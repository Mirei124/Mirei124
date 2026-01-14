import { FaSun, FaMoon, FaAdjust } from "react-icons/fa";
import { useEffect, useState } from "react";

const AVAIL_THEMES = ["auto", "dark", "light"];

export default function ThemeToggler() {
  const [curTheme, setCurTheme] = useState(0);

  useEffect(() => {
    const localStorageTheme = localStorage.getItem("theme") ?? "auto";
    const curThemeIdx = AVAIL_THEMES.indexOf(localStorageTheme);
    setCurTheme(curThemeIdx);
  }, []);

  const setDocumentTheme = (targetTheme: string) => {
    let effectiveTheme = targetTheme;
    if (targetTheme === "auto") {
      effectiveTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }

    if (effectiveTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const toggleTheme = () => {
    const nextThemeIdx = (curTheme + 1) % AVAIL_THEMES.length;
    setCurTheme(nextThemeIdx);
    setDocumentTheme(AVAIL_THEMES[nextThemeIdx]);
    localStorage.setItem("theme", AVAIL_THEMES[nextThemeIdx]);
  };

  const className =
    "icon h-10 w-10 rounded p-2 text-2xl hover:bg-[var(--lighten-color)]";

  if (curTheme === 0) {
    return <FaAdjust onClick={toggleTheme} className={className} />;
  } else if (curTheme === 1) {
    return <FaMoon onClick={toggleTheme} className={className} />;
  } else {
    return <FaSun onClick={toggleTheme} className={className} />;
  }
}
