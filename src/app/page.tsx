import { AppProviders } from "@/context/AppProviders";
import { TypingGame } from "@/components/TypingGame";

/**
 * The route itself stays a Server Component: it ships no JavaScript of its own
 * and simply mounts the client island that owns the game.
 */
export default function HomePage() {
  return (
    <AppProviders defaultLang="en" defaultTheme="dark">
      <TypingGame />
    </AppProviders>
  );
}
