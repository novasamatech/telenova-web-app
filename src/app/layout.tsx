import Script from 'next/script';
import { Providers } from './app/providers';
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <Providers>
          <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
          {children}
        </Providers>
      </body>
    </html>
  );
}
