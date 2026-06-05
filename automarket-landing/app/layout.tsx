import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/sonner"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://buy.automarket.example.com"),
  applicationName: "AutoMarket",
  title: "AutoMarket - Premium Vehicle Export",
  description: "Premium vehicle export and cross-border automotive solutions",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/AutoMarket.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "AutoMarket",
    title: "AutoMarket - Premium Vehicle Export",
    description: "Premium vehicle export and cross-border automotive solutions",
    images: [
      {
        url: "/AutoMarket.png",
        width: 1200,
        height: 630,
        alt: "AutoMarket - Premium Vehicle Export",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AutoMarket - Premium Vehicle Export",
    description: "Premium vehicle export and cross-border automotive solutions",
    images: ["/AutoMarket.png"],
  },
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
            // Mobil görünüm için düzeltmeler
            document.documentElement.classList.add('js-loaded');
            
            // iOS Safari için viewport yükseklik düzeltmesi
            function setVH() {
              let vh = window.innerHeight * 0.01;
              document.documentElement.style.setProperty('--vh', \`\${vh}px\`);
            }
            
            setVH();
            window.addEventListener('resize', setVH);
            
            // Sayfa yüklendiğinde tüm bölümlerin görünür olmasını sağla
            document.addEventListener('DOMContentLoaded', function() {
              // Animasyonları sıfırla ve görünür yap
              document.querySelectorAll('.motion-safe\\:opacity-0, .motion-safe\\:translate-y-4').forEach(function(el) {
                el.classList.remove('motion-safe:opacity-0', 'motion-safe:translate-y-4');
                el.style.opacity = '1';
                el.style.transform = 'none';
              });
              
              // Framer Motion animasyonlarını düzelt
              setTimeout(function() {
                window.scrollTo(0, 0);
                
                // Tüm bölümleri görünür yap
                document.querySelectorAll('section').forEach(function(section) {
                  section.style.opacity = '1';
                  section.style.transform = 'none';
                  section.style.visibility = 'visible';
                });
              }, 100);
            });
            
            // Mobil cihaz tespiti
            const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth < 768;
            if (isMobile) {
              document.documentElement.classList.add('is-mobile');
              
              // Mobil cihazlarda animasyonları devre dışı bırak veya basitleştir
              document.addEventListener('DOMContentLoaded', function() {
                document.querySelectorAll('[data-animate="true"]').forEach(function(el) {
                  el.setAttribute('data-animate', 'false');
                  el.style.opacity = '1';
                  el.style.transform = 'none';
                });
              });
            }
          `,
          }}
        />
      </head>
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
