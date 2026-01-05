import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { NotificationContainer } from "@/components/ui/notifications";
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
import Settings from "@/pages/Settings";
import Billing from "@/pages/settings/Billing";
import Members from "@/pages/settings/Members";
import Profile from "@/pages/settings/Profile";
import OrgSettings from "@/pages/settings/OrgSettings";
import Integrations from "@/pages/settings/Integrations";
import IntegrationSettings from "@/pages/settings/IntegrationSettings";
import FinancialSimulation from "@/pages/settings/FinancialSimulation";
import Conversations from "@/pages/Conversations";
import Dashboards from "@/pages/Dashboards";
import Escalations from "@/pages/Escalations";
import NotFound from "@/pages/NotFound";
import Index from "@/pages/Index";
import Pricing from "@/pages/Pricing";
import CustomAgents from "@/pages/CustomAgents";
import WorkflowEditor from "@/pages/WorkflowEditor";
import WorkflowsList from "@/pages/WorkflowsList";
import WorkflowEditorV1 from "@/pages/WorkflowEditorV1";
import SignUp from "@/pages/auth/SignUp";
import ResetPassword from "@/pages/auth/ResetPassword";
import ResetPasswordConfirm from "@/pages/auth/ResetPasswordConfirm";
import Account from "@/pages/auth/Account";
import Login from "@/pages/auth/Login";
import Recruiters from "@/pages/Recruiters";
import Receptionist from "@/pages/Receptionist";
import Scheduler from "@/pages/Scheduler";
import LeadsReviver from "@/pages/LeadsReviver";
import Confirmation from "@/pages/Confirmation";
import BubbleVoice from "@/pages/BubbleVoice";
import WidgetDesignStudio from "@/pages/WidgetDesignStudio";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/Terms";
import AdminLayout from "@/pages/admin/AdminLayout";
import AdminUsers from "@/pages/admin/Users";
import AdminAgents from "@/pages/admin/Agents";
import AdminPayments from "@/pages/admin/Payments";
import AdminConversationSpending from "@/pages/admin/ConversationSpending";
import AdminIntegrations from "@/pages/admin/Integrations";
import AdminCampaigns from "@/pages/admin/Campaigns";
import AdminPhoneNumbers from "@/pages/admin/PhoneNumbers";
import AdminApiKeys from "@/pages/admin/ApiKeys";
import AdminFinancialSimulation from "@/pages/admin/FinancialSimulation";
import AdminTemplates from "@/pages/admin/Templates";
import AdminBehaviours from "@/pages/admin/Behaviours";
import { AdminRoute } from "@/components/AdminRoute";
import Landing from "./pages/Landing";
import Landing2 from "./pages/Landing2";
import Landing3 from "./pages/Landing3";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <NotificationContainer />
        {/* Old toasters hidden - using new notification system */}
        <div style={{ display: 'none' }}>
          <Toaster />
          <Sonner />
        </div>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing2 />} />
              <Route path="/retail-ecommerce" element={<Landing />} />
              <Route path="/recruitment" element={<Landing3 />} />
              <Route path="/sign-up" element={<SignUp />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/reset-password-confirm" element={<ResetPasswordConfirm />} />
              <Route path="/login" element={<Login />} />
              <Route path="/custom-agents" element={<CustomAgents />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/assistants/:id/widget/design" element={<ProtectedRoute><WidgetDesignStudio /></ProtectedRoute>} />
              <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                <Route path="/account" element={<Account />} />
                <Route path="/overview" element={<Overview />} />
                <Route path="/assistants" element={<AssistantsList />} />
                <Route path="/assistants/create" element={<AssistantDetail />} />
                <Route path="/assistants/:id" element={<AssistantDetail />} />
                <Route path="/workflows" element={<WorkflowsList />} />
                <Route path="/workflows/new" element={<WorkflowEditor />} />
                <Route path="/workflows/:id" element={<WorkflowEditor />} />
                <Route path="/workflows-v1/new" element={<WorkflowEditorV1 />} />
                <Route path="/workflows-v1/:id" element={<WorkflowEditorV1 />} />
                <Route path="/phone-numbers" element={<PhoneNumbers />} />
                <Route path="/voice-library" element={<VoiceLibrary />} />
                <Route path="/api-keys" element={<ApiKeys />} />
                <Route path="/files" element={<Files />} />
                <Route path="/outbound" element={<Outbound />} />
                <Route path="/outbound/new" element={<NewCampaign />} />
                <Route path="/conversations" element={<Conversations />} />
                <Route path="/dashboards" element={<Dashboards />} />
                <Route path="/escalations" element={<Escalations />} />
                <Route path="/settings" element={<Settings />}>
                  <Route index element={<SettingsList />} />
                  <Route path="org" element={<OrgSettings />} />
                  <Route path="billing" element={<Billing />} />
                  <Route path="members" element={<Members />} />
                  <Route path="integrations" element={<Integrations />} />
                  <Route path="integrations/:type" element={<IntegrationSettings />} />
                  <Route path="voice-library" element={<VoiceLibrary />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="financial-simulation" element={<FinancialSimulation />} />
                  <Route path="api-keys" element={<ApiKeys />} />
                </Route>
              </Route>
              
              {/* Admin Routes */}
              <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
                <Route index element={<Navigate to="/admin/users" replace />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="agents" element={<AdminAgents />} />
                <Route path="templates" element={<AdminTemplates />} />
                <Route path="behaviours" element={<AdminBehaviours />} />
                <Route path="integrations" element={<AdminIntegrations />} />
                <Route path="campaigns" element={<AdminCampaigns />} />
                <Route path="phone-numbers" element={<AdminPhoneNumbers />} />
                <Route path="api-keys" element={<AdminApiKeys />} />
                <Route path="payments" element={<AdminPayments />} />
                <Route path="conversation-spending" element={<AdminConversationSpending />} />
                <Route path="financial-simulation" element={<AdminFinancialSimulation />} />
              </Route>
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
