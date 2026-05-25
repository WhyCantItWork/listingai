import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/lib/theme-context"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Toaster } from "sonner"
import "./globals.css"
import { SpeedInsights } from "@vercel/speed-insights/next"

const geistSans = Geist({ subsets: ["latin"], variable: "--font-geist-sans" })
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" })

export const metadata: Metadata = {
  metadataBase: new URL("https://www.tenancy.it.com"),
  title: "Tenancy — AI Property Listings for UK Letting Agents",
  description: "AI-powered property listing descriptions and Material Information packs for UK letting agents. Generate compliant, professional listings in seconds.",
  keywords: ["UK letting agents", "property listings", "Material Information", "AI", "lettings", "tenancy", "Rightmove", "Zoopla"],
  authors: [{ name: "Tenancy" }],
  openGraph: {
    title: "Tenancy — AI Property Listings for UK Letting Agents",
    description: "Generate compliant UK property listings in seconds. Material Information packs, compliance scanning, and Rightmove-ready descriptions.",
    url: "https://www.tenancy.it.com",
    siteName: "Tenancy",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Tenancy — AI Listings for UK Letting Agents",
      },
    ],
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tenancy — AI Property Listings for UK Letting Agents",
    description: "Generate compliant UK property listings in seconds.",
    images: ["/og-image.jpg"],
  },
}


export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en-GB" className="bg-background" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <ThemeProvider>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </ThemeProvider>
        <Toaster richColors position="top-right" />
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  )
}
