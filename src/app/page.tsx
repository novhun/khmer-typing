import { AppProviders } from "@/context/AppProviders";
import Home from "./home";

/**
 * The route itself stays a Server Component: it ships no JavaScript of its own
 * and mounts the client island that owns the welcome page & program selection hub.
 */
export default function HomePage() {
  return (
    <AppProviders defaultLang="en" defaultTheme="dark">
      <Home />
    </AppProviders>
  );
}
