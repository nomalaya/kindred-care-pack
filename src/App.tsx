import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import CauseSelection from "./pages/CauseSelection";
import SituationSelection from "./pages/SituationSelection";
import BeneficiarySelection from "./pages/BeneficiarySelection";
import DonationFlow from "./pages/DonationFlow";
import CheckoutFlow from "./components/checkout/CheckoutFlow";
import UpsellDonation from "./pages/UpsellDonation";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import HowItWorks from "./pages/HowItWorks";
import ThemeShowcase from "./pages/ThemeShowcase";
import TimelineShowcase from "./pages/TimelineShowcase";
import TaxShowcase from "./pages/TaxShowcase";
import TaxAdvantage from "./pages/TaxAdvantage";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/causes" element={<CauseSelection />} />
            <Route path="/causes/:causeId/situations" element={<SituationSelection />} />
            <Route path="/situations/:situationId/beneficiaries" element={<BeneficiarySelection />} />
            <Route path="/donate/:beneficiaryId" element={<DonationFlow />} />
            <Route path="/checkout/:beneficiaryId" element={<CheckoutFlow />} />
            <Route path="/upsell/:beneficiaryId" element={<UpsellDonation />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/themes" element={<ThemeShowcase />} />
            <Route path="/timeline-showcase" element={<TimelineShowcase />} />
            <Route path="/tax-showcase" element={<TaxShowcase />} />
            <Route path="/avantage-fiscal" element={<TaxAdvantage />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
