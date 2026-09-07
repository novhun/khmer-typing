"use client";

/**
 * PWA Context: Service Worker registration, install prompt handling,
 * and online/offline status monitoring.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { useApp } from "./AppProviders";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PwaContextValue {
  isInstallable: boolean;
  isInstalled: boolean;
  isOffline: boolean;
  installApp: () => Promise<void>;
}

const PwaContext = createContext<PwaContextValue | null>(null);

export function PwaProvider({ children }: { children: ReactNode }) {
  const { t } = useApp();
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [showOnlineToast, setShowOnlineToast] = useState(false);

  // Register service worker and listen for PWA install & network status
  useEffect(() => {
    // 1. Initial online status
    if (typeof navigator !== "undefined") {
      setIsOffline(!navigator.onLine);
    }

    const handleOnline = () => {
      setIsOffline(false);
      setShowOnlineToast(true);
      const timer = setTimeout(() => setShowOnlineToast(false), 4000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOffline(true);
      setShowOnlineToast(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // 2. Service Worker registration
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js", { scope: "/" })
          .then((reg) => {
            // Check for updates
            reg.onupdatefound = () => {
              const installingWorker = reg.installing;
              if (!installingWorker) return;
              installingWorker.onstatechange = () => {
                if (
                  installingWorker.state === "installed" &&
                  navigator.serviceWorker.controller
                ) {
                  // New update is ready
                  console.info("[PWA] New version installed and ready.");
                }
              };
            };
          })
          .catch((err) => {
            console.warn("[PWA] ServiceWorker registration skipped:", err);
          });
      });
    }

    // 3. Detect standalone launch mode
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone ===
        true;
    if (isStandalone) {
      setIsInstalled(true);
    }

    // 4. Capture beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener(
      "beforeinstallprompt",
      handleBeforeInstallPrompt as EventListener,
    );
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt as EventListener,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const installApp = useCallback(async () => {
    if (!deferredPrompt) {
      // iOS Safari fallback tip
      const isIos =
        /iPad|iPhone|iPod/.test(navigator.userAgent) &&
        !(window as unknown as { MSStream?: unknown }).MSStream;
      if (isIos) {
        alert(t("pwa.iosPrompt"));
      }
      return;
    }
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === "accepted") {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  }, [deferredPrompt, t]);

  const value = useMemo<PwaContextValue>(
    () => ({
      isInstallable: !!deferredPrompt && !isInstalled,
      isInstalled,
      isOffline,
      installApp,
    }),
    [deferredPrompt, isInstalled, isOffline, installApp],
  );

  return (
    <PwaContext.Provider value={value}>
      {/* Offline Status Alert Banner */}
      {isOffline && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-lg rounded-md border-2 border-[var(--coin)] bg-[#131a3a] p-3 shadow-2xl transition-all"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-[var(--coin)] font-retro text-sm text-[#7d3f14]">
              ⚡
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-retro text-[10px] text-[var(--coin)] sm:text-[11px]">
                {t("pwa.offlineBanner")}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Online Toast */}
      {showOnlineToast && !isOffline && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md rounded-md border-2 border-emerald-500 bg-[#0f291e] p-2.5 text-center shadow-xl"
        >
          <p className="font-retro text-[10px] text-emerald-300">
            ✓ {t("pwa.onlineBanner")}
          </p>
        </div>
      )}

      {children}
    </PwaContext.Provider>
  );
}

export function usePwa(): PwaContextValue {
  const ctx = useContext(PwaContext);
  if (!ctx) throw new Error("usePwa must be used inside <PwaProvider>");
  return ctx;
}
