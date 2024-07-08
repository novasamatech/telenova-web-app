/// <reference types="vite/client" />

declare namespace NodeJS {
  export interface ProcessEnv {
    readonly PUBLIC_WIDGET_SECRET: string;
    readonly PUBLIC_WIDGET_ID: string;
    readonly PUBLIC_BOT_ADDRESS: string;
    readonly PUBLIC_BOT_API_URL: string;
    readonly PUBLIC_WEB_APP_ADDRESS: string;
    readonly PUBLIC_APP_VERSION: string;
  }
}

declare module '*.css' {
  const content: string;
  export default content;
}

declare module '*.jpeg' {
  const content: string;
  export default content;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.webp' {
  const content: string;
  export default content;
}

declare module '*.webm' {
  const content: string;
  export default content;
}

declare module '*.mp4' {
  const content: string;
  export default content;
}

declare module '*.svg' {
  import type React from 'react';
  const content: React.SVGProps<SVGSVGElement>;
  export default content;
}
