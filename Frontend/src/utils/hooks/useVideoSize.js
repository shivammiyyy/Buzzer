import { useEffect, useState } from "react";
import { getVideoBoxSize } from "../getVideoBoxSize";

const TOP_BAR_HEIGHT = 40;

const useVideoSize = (N = 1, AR = 1) => {
  const [size, setSize] = useState({});
  const [isMobile, setIsMobile] = useState(
    window.matchMedia("(max-width: 480px)").matches
  );

  useEffect(() => {
    const listener = (e) => {
      if (e.matches) {
        setIsMobile(true);
      } else {
        setIsMobile(false);
      }
    };
    const mediaQuery = window.matchMedia("(max-width: 480px)");
    mediaQuery.addEventListener("change", listener);

    return () => {
      mediaQuery.removeEventListener("change", listener);
    };
  }, []);

  useEffect(() => {
    const listener = () => {
      if (isMobile) return;

      const Y = window.innerHeight - TOP_BAR_HEIGHT;
      const X = window.innerWidth;
      setSize({ X, Y });
    };

    const Y = window.innerHeight - TOP_BAR_HEIGHT;
    const X = window.innerWidth;
    setSize({ X, Y });

    window.addEventListener("resize", listener);
    return () => {
      window.removeEventListener("resize", listener);
    };
  }, [isMobile]);

  const { X = 500, Y = 800 } = size; // fallback defaults
  const { x, y } = getVideoBoxSize(X, Y, N, AR);

  return { x, y, X, Y };
};

export default useVideoSize;
