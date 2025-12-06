import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import Overview from "@/pages/Overview";
import Assistants from "@/pages/Assistants";
import VoiceLibrary from "@/pages/VoiceLibrary";
import PhoneNumbers from "@/pages/PhoneNumbers";
import ApiKeys from "@/pages/ApiKeys";
import Outbound from "@/pages/Outbound";
import NewCampaign from "@/pages/NewCampaign";
import Files from "@/pages/Files";
import Settings from "@/pages/Settings";
import Billing from "@/pages/settings/Billing";
import Members from "@/pages/settings/Members";
import Profile from "@/pages/settings/Profile";
import OrgSettings from "@/pages/settings/OrgSettings";
import Integrations from "@/pages/settings/Integrations";
import ElevenLabsIntegration from "@/pages/settings/ElevenLabsIntegration";
import Conversations from "@/pages/Conversations";
import NotFound from "@/pages/NotFound";
import Index from "@/pages/Index";
import Pricing from "@/pages/Pricing";
import CustomAgents from "@/pages/CustomAgents";
import SignUp from "@/pages/auth/SignUp";
import ResetPassword from "@/pages/auth/ResetPassword";
import Account from "@/pages/auth/Account";
import Login from "@/pages/auth/Login";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/login" element={<Login />} />
          <Route path="/custom-agents" element={<CustomAgents />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route element={<DashboardLayout />}>
            <Route path="/account" element={<Account />} />
            <Route path="/overview" element={<Overview />} />
            <Route path="/assistants" element={<Assistants />} />
            <Route path="/phone-numbers" element={<PhoneNumbers />} />
            <Route path="/voice-library" element={<VoiceLibrary />} />
            <Route path="/api-keys" element={<ApiKeys />} />
            <Route path="/files" element={<Files />} />
            <Route path="/outbound" element={<Outbound />} />
            <Route path="/outbound/new" element={<NewCampaign />} />
            <Route path="/conversations" element={<Conversations />} />
            <Route path="/settings" element={<Settings />}>
              <Route index element={<Navigate to="/settings/billing" replace />} />
              <Route path="org" element={<OrgSettings />} />
              <Route path="billing" element={<Billing />} />
              <Route path="members" element={<Members />} />
              <Route path="integrations" element={<Integrations />} />
              <Route path="integrations/elevenlabs" element={<ElevenLabsIntegration />} />
              <Route path="voice-library" element={<VoiceLibrary />} />
              <Route path="profile" element={<Profile />} />
            </Route>
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
