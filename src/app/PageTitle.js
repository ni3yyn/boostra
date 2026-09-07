"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const TITLES = {
  "/": "Boostra Agency | الرئيسية",
  "/gifts": "Boostra Agency |  المتجر",
  "/gallery": "Boostra Agency | معرض النتائج",
};

export default function PageTitle() {
  const pathname = usePathname();
  const title = TITLES[pathname] || "Boostra Agency | وكالة الميديا باينغ";

  useEffect(() => {
    if (pathname === "/admin") return undefined;

    const setTitle = () => {
      if (document.title !== title) document.title = title;
    };

    setTitle();
    const observer = new MutationObserver(setTitle);
    const titleElement = document.querySelector("title");

    if (titleElement) {
      observer.observe(titleElement, { childList: true });
    }

    return () => observer.disconnect();
  }, [pathname, title]);

  return null;
}
