import './globals.css';
import '@/public/style.css'
import 'keen-slider/keen-slider.min.css';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { siteMetadata } from '@/app/seoData/metadata';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import { WixAuthProvider } from "@/components/wix-auth-provider"
import Header from '@/components/Header';
import Footer from '@/components/Footer';
// import WhatsAppButton from '@/components/WhatsAppButton';



const inter = Inter({ subsets: ['latin'] });

// Moved viewport to its own export
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata = siteMetadata;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <WixAuthProvider>
   
      <body className={inter.className}>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-55W9Q9F4"
            height="0"
            width="0"
            style={{display: 'none', visibility: 'hidden'}}
          />
        </noscript>
        <Header />
      
         {children}
  
        <Footer />
        {/* <WhatsAppButton /> */}
      </body>
      </WixAuthProvider>
    </html>
  );
}