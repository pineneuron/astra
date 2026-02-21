import type { Metadata } from "next";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import Providers from "@/components/Providers";
import MaintenancePage from "@/components/MaintenancePage";
import { Sora, Bebas_Neue } from "next/font/google";
import { getGeneralSettings } from "@/lib/settings";

export const dynamic = 'force-dynamic';

const sora = Sora({ subsets: ["latin"], variable: "--font-sora", display: "swap" });
const bebas = Bebas_Neue({ weight: "400", subsets: ["latin"], variable: "--font-bebas", display: "swap" });

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getGeneralSettings();
  const faviconHref = settings.siteIcon || '/images/favi-icon.svg';

  return {
    title: settings.tagline
      ? `${settings.siteTitle} – ${settings.tagline}`
      : settings.siteTitle,
    description: settings.tagline,
    icons: {
      icon: [{ url: faviconHref, rel: 'icon', type: 'image/svg+xml' }],
      shortcut: [{ url: faviconHref }],
      apple: [{ url: faviconHref }],
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getGeneralSettings();
  const faviconHref = settings.siteIcon || '/images/favi-icon.svg';
  
  // To disable: Set MAINTENANCE_MODE=false in .env.local
  const isMaintenanceMode = process.env.MAINTENANCE_MODE !== 'false';

  return (
    <html lang="en" className={`${sora.variable} ${bebas.variable}`}>
      <head>
        <link rel="icon" href={faviconHref} type="image/svg+xml" />
        <link rel="shortcut icon" href={faviconHref} />
        <link rel="apple-touch-icon" href={faviconHref} />
      </head>
      <body suppressHydrationWarning>
        {isMaintenanceMode ? (
          <MaintenancePage />
        ) : (
          <Providers generalSettings={settings}>
            {children}
          </Providers>
        )}
        {/* <script src="/design/src/assets/js/jquery.js" defer></script>
        <script src="/design/src/assets/js/main.js" defer></script> */}
      </body>
    </html>
  );
}
