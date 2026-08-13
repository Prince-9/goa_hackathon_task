import "./globals.css";
// Self-hosted (npm-bundled) brand fonts — matched to the real hhgoa.com site.
// Loaded from node_modules rather than Google Fonts so there's no external
// network dependency at build or run time.
import "@fontsource/imbue/700.css";
import "@fontsource/imbue/900.css";
import "@fontsource/victor-mono/400.css";
import "@fontsource/victor-mono/500.css";
import "@fontsource/victor-mono/600.css";
import "@fontsource/victor-mono/700.css";
import "@fontsource/victor-mono/500-italic.css";

export const metadata = {
  title: "HH Goa 2026 — Frame in Goa",
  description:
    "Turn your photo into an on-brand HH Goa 2026 profile frame or Builder ID card, in seconds. #FrameInGoa",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#0B6839] text-[#FFFBE8]">
        {children}
      </body>
    </html>
  );
}
