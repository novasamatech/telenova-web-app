import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html>
      <Head>
        <script defer src="https://telegram.org/js/telegram-web-app.js" />
        <script src="https://widget.mercuryo.io/embed.2.0.js"></script>
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
