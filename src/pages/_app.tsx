// src/pages/_app.tsx
import "../app/globals.css"; // styles가 아닌 app 폴더의 globals.css
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
