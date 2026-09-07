// src/components/SmoothScroll.js (أو app/components/SmoothScroll.js)
"use client";

import { ReactLenis } from "lenis/react";

export default function SmoothScroll({ children }) {
  return (
    <ReactLenis
      root
      options={{
        lerp: 0.09,          // معدل النعومة (بين 0.05 إلى 0.1 يعطي شعورا فخما)
        duration: 1.2,       // مدة استجابة التمرير بالثواني
        smoothWheel: true,   // تفعيل النعومة لعجلة الماوس
        syncTouch: false,    // ترك التمرير الطبيعي في شاشات اللمس لمنع أي ثقل على الموبايل
      }}
    >
      {children}
    </ReactLenis>
  );
}