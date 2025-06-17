import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { AnimatePresence } from "motion/react";
import { useRouter } from "next/router";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  return (
    <AnimatePresence mode="wait">
      <Component key={router.asPath} {...pageProps} />
    </AnimatePresence>
  );
}
