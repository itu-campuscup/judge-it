import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/AuthContext";
import ThemeRegistry from "@/ThemeRegistry";
import { ConvexClientProvider } from "@/ConvexClientProvider";
import { ClerkProvider } from "@clerk/nextjs";
import { ReactNode } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable}`}
          suppressHydrationWarning
        >
          <ConvexClientProvider>
            <ThemeRegistry options={{ key: "mui" }}>
              <AuthProvider>{children}</AuthProvider>
            </ThemeRegistry>
          </ConvexClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
