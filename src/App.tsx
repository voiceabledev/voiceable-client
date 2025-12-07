import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Overview from "@/pages/Overview";
import AssistantsList from "@/pages/AssistantsList";
import AssistantDetail from "@/pages/AssistantDetail";
import VoiceLibrary from "@/pages/VoiceLibrary";
import PhoneNumbers from "@/pages/PhoneNumbers";
import ApiKeys from "@/pages/ApiKeys";
import Outbound from "@/pages/Outbound";
import NewCampaign from "@/pages/NewCampaign";
import Files from "@/pages/Files";
import SettingsList from "@/pages/SettingsList";
import Billing from "@/pages/settings/Billing";
import Members from "@/pages/settings/Members";
import Profile from "@/pages/settings/Profile";
import OrgSettings from "@/pages/settings/OrgSettings";
import Integrations from "@/pages/settings/Integrations";
import IntegrationSettings from "@/pages/settings/IntegrationSettings";
import Conversations from "@/pages/Conversations";
import NotFound from "@/pages/NotFound";
import Index from "@/pages/Index";
import Pricing from "@/pages/Pricing";
import CustomAgents from "@/pages/CustomAgents";
import SignUp from "@/pages/auth/SignUp";
import ResetPassword from "@/pages/auth/ResetPassword";
import ResetPasswordConfirm from "@/pages/auth/ResetPasswordConfirm";
import Account from "@/pages/auth/Account";
import Login from "@/pages/auth/Login";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/sign-up" element={<SignUp />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/reset-password-confirm" element={<ResetPasswordConfirm />} />
              <Route path="/login" element={<Login />} />
              <Route path="/custom-agents" element={<CustomAgents />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                <Route path="/account" element={<Account />} />
                <Route path="/overview" element={<Overview />} />
                <Route path="/assistants" element={<AssistantsList />} />
                <Route path="/assistants/new" element={<AssistantDetail />} />
                <Route path="/assistants/:id" element={<AssistantDetail />} />
                <Route path="/phone-numbers" element={<PhoneNumbers />} />
                <Route path="/voice-library" element={<VoiceLibrary />} />
                <Route path="/api-keys" element={<ApiKeys />} />
                <Route path="/files" element={<Files />} />
                <Route path="/outbound" element={<Outbound />} />
                <Route path="/outbound/new" element={<NewCampaign />} />
                <Route path="/conversations" element={<Conversations />} />
                <Route path="/settings" element={<SettingsList />} />
                <Route path="/settings/org" element={<OrgSettings />} />
                <Route path="/settings/billing" element={<Billing />} />
                <Route path="/settings/members" element={<Members />} />
                <Route path="/settings/integrations" element={<Integrations />} />
                <Route path="/settings/integrations/:type" element={<IntegrationSettings />} />
                <Route path="/settings/voice-library" element={<VoiceLibrary />} />
                <Route path="/settings/profile" element={<Profile />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
