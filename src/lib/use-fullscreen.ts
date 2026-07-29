"use client";

import { useEffect, useRef, useState } from "react";

/** 특정 컨테이너 엘리먼트를 브라우저 전체화면으로 전환하는 훅. */
export function useFullscreen<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    function onChange() {
      setIsFullscreen(document.fullscreenElement === ref.current);
    }
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  async function toggle() {
    if (!ref.current) return;
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await ref.current.requestFullscreen();
      }
    } catch {
      // 브라우저가 전체화면 요청을 거부한 경우 - 조용히 무시
    }
  }

  return { ref, isFullscreen, toggle };
}
