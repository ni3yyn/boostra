// app/layout.js
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import { ReactLenis } from "lenis/react";
import PageTitle from "./PageTitle";
import "./globals.css";
import "lenis/dist/lenis.css"; // تنسيقات Lenis الأساسية لضمان نعومة التمرير

// 1. استضافة خط IBM Plex Sans Arabic ذاتيا لسرعة تحميل قصوى
const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// 2. تلوين شريط المتصفح في الهواتف بلون البراند
export const viewport = {
  themeColor: "#0000FF",
  width: "device-width",
  initialScale: 1,
};

// 3. بيانات الميتا الرسمية وهوية الوكالة وربط الـ Favicon
export const metadata = {
  title: "Boostra Agency | الرئيسية",
  description:
    "وكالة ميديا باينغ متخصصة في إدارة وتحجيم الحملات الإعلانية الممولة (Meta, TikTok, Google) للمتاجر والبراندات لخفض تكلفة الاستحواذ على الزبون ومضاعفة المبيعات.",
  keywords: ["ميديا باينغ", "إعلانات ممولة", "Meta Ads", "Google Ads", "نمو المتاجر"],
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  openGraph: {
    title: "Boostra Agency | الرئيسية",
    description: "إدارة وتحجيم الحملات الإعلانية الممولة لخفض تكلفة الاستحواذ وزيادة مبيعات المتاجر.",
    siteName: "Boostra Agency",
    locale: "ar_DZ",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl" className={ibmPlexArabic.className}>
      <body>
        <PageTitle />
        {/* تغليف الموقع بـ Lenis للحصول على تمرير انسيابي عالمي */}
        <ReactLenis 
          root 
          options={{
            lerp: 0.085,       // معدل النعومة (قيمة مثالية تعطي حركة زبدة راقية)
            duration: 1.2,     // زمن انسياب التمرير
            smoothWheel: true, // تفعيل التمرير الانسيابي لعجلة الفأرة
          }}
        >
          {children}
        </ReactLenis>
      </body>
    </html>
  );
}