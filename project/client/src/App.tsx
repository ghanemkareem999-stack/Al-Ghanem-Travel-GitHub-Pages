import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import LanguageChooser from "@/components/LanguageChooser";
import MarketingConsent from "@/components/MarketingConsent";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useParams } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { LocaleProvider } from "./contexts/LocaleContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import CorporateInquiry from "./pages/CorporateInquiry";
import Home from "./pages/Home";
import HotelDetail from "./pages/HotelDetail";
import HotelPortfolio from "./pages/HotelPortfolio";
import Reviews from "./pages/Reviews";
import ReviewModeration from "./pages/ReviewModeration";
import HotelContentAdmin from "./pages/HotelContentAdmin";
import GeneralSettingsAdmin from "./pages/GeneralSettingsAdmin";
import AdminLogin from "./pages/AdminLogin";
import InformationPage from "./pages/InformationPage";
import type { Locale } from "@/lib/i18n";
import { isLocale } from "@/lib/localePaths";
import type { ComponentType } from "react";

function LocalizedPage({ component: Component }: { component: ComponentType }) {
  const { locale } = useParams<{ locale: string }>();
  return isLocale(locale) ? <Component /> : <NotFound />;
}

function Router() {
  return (
    <Switch>
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin/reviews" component={ReviewModeration} />
      <Route path="/admin/hotels" component={HotelContentAdmin} />
      <Route path="/admin/settings" component={GeneralSettingsAdmin} />
      <Route path="/:locale/hotels/:slug" component={() => <LocalizedPage component={HotelDetail} />} />
      <Route path="/:locale/hotels" component={() => <LocalizedPage component={HotelPortfolio} />} />
      <Route path="/:locale/inquiry" component={() => <LocalizedPage component={CorporateInquiry} />} />
      <Route path="/:locale/reviews" component={() => <LocalizedPage component={Reviews} />} />
      <Route path="/:locale/about" component={() => <LocalizedPage component={() => <InformationPage kind="about" />} />} />
      <Route path="/:locale/contact" component={() => <LocalizedPage component={() => <InformationPage kind="contact" />} />} />
      <Route path="/:locale/privacy" component={() => <LocalizedPage component={() => <InformationPage kind="privacy" />} />} />
      <Route path="/:locale/terms" component={() => <LocalizedPage component={() => <InformationPage kind="terms" />} />} />
      <Route path="/hotels" component={HotelPortfolio} />
      <Route path="/hotels/:slug" component={HotelDetail} />
      <Route path="/inquiry" component={CorporateInquiry} />
      <Route path="/reviews" component={Reviews} />
      <Route path="/about" component={() => <InformationPage kind="about" />} />
      <Route path="/contact" component={() => <InformationPage kind="contact" />} />
      <Route path="/privacy" component={() => <InformationPage kind="privacy" />} />
      <Route path="/terms" component={() => <InformationPage kind="terms" />} />
      <Route path="/:locale" component={() => <LocalizedPage component={Home} />} />
      <Route path="/" component={Home} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App({ initialLocale = "en" }: { initialLocale?: Locale }) {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <LocaleProvider initialLocale={initialLocale}>
            <Toaster />
            <Router />
            <LanguageChooser />
            <MarketingConsent />
          </LocaleProvider>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
