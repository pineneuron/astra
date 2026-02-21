"use client";

import { SessionProvider } from "next-auth/react";
import { CartProvider } from "@/context/CartContext";
import { GeneralSettingsProvider } from "@/context/GeneralSettingsContext";
import type { GeneralSettings } from "@/lib/settings";

type ProvidersProps = {
  children: React.ReactNode;
  generalSettings: GeneralSettings;
};

export default function Providers({ children, generalSettings }: ProvidersProps) {
  return (
    <SessionProvider>
      <CartProvider>
        <GeneralSettingsProvider value={generalSettings}>
          {children}
        </GeneralSettingsProvider>
      </CartProvider>
    </SessionProvider>
  );
}
