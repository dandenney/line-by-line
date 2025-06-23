import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { motion, AnimatePresence } from "motion/react";
import { useRouter } from "next/router";
import { fontVariables } from "@/lib/fonts";
import { AuthProvider } from "@/lib/auth-context";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  return (
    <AuthProvider>
      <div className={`min-h-screen bg-[#F5F3EE] ${fontVariables}`}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={router.pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.3,
              ease: [0.4, 0.0, 0.2, 1], // Custom easing for smooth fade
            }}
          >
            <Component {...pageProps} />
          </motion.div>
        </AnimatePresence>
      </div>
    </AuthProvider>
  );
}
