import { lazy, Suspense } from "react";
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
import { AdminRoute } from "@/components/AdminRoute";

// Critical routes - keep as static imports for faster initial load
import Landing2 from "./pages/Landing2";
import Landing from "./pages/Landing";
import Landing3 from "./pages/Landing3";
import Login from "@/pages/auth/Login";
import SignUp from "@/pages/auth/SignUp";
import NotFound from "@/pages/NotFound";

// Lazy load routes for code splitting
const Overview = lazy(() => import("@/pages/Overview"));
const AssistantsList = lazy(() => import("@/pages/AssistantsList"));
const AssistantDetail = lazy(() => import("@/pages/AssistantDetail"));
const VoiceLibrary = lazy(() => import("@/pages/VoiceLibrary"));
const PhoneNumbers = lazy(() => import("@/pages/PhoneNumbers"));
const ApiKeys = lazy(() => import("@/pages/ApiKeys"));
const Outbound = lazy(() => import("@/pages/Outbound"));
const NewCampaign = lazy(() => import("@/pages/NewCampaign"));
const Files = lazy(() => import("@/pages/Files"));
const SettingsList = lazy(() => import("@/pages/SettingsList"));
const Settings = lazy(() => import("@/pages/Settings"));
const Billing = lazy(() => import("@/pages/settings/Billing"));
const Members = lazy(() => import("@/pages/settings/Members"));
const Profile = lazy(() => import("@/pages/settings/Profile"));
const OrgSettings = lazy(() => import("@/pages/settings/OrgSettings"));
const Integrations = lazy(() => import("@/pages/settings/Integrations"));
const IntegrationSettings = lazy(() => import("@/pages/settings/IntegrationSettings"));
const FinancialSimulation = lazy(() => import("@/pages/settings/FinancialSimulation"));
const Conversations = lazy(() => import("@/pages/Conversations"));
const Dashboards = lazy(() => import("@/pages/Dashboards"));
const Escalations = lazy(() => import("@/pages/Escalations"));
const Pricing = lazy(() => import("@/pages/Pricing"));
const CustomAgents = lazy(() => import("@/pages/CustomAgents"));
const WorkflowEditor = lazy(() => import("@/pages/WorkflowEditor"));
const WorkflowsList = lazy(() => import("@/pages/WorkflowsList"));
const WorkflowEditorV1 = lazy(() => import("@/pages/WorkflowEditorV1"));
const ResetPassword = lazy(() => import("@/pages/auth/ResetPassword"));
const ResetPasswordConfirm = lazy(() => import("@/pages/auth/ResetPasswordConfirm"));
const Account = lazy(() => import("@/pages/auth/Account"));
const WidgetDesignStudio = lazy(() => import("@/pages/WidgetDesignStudio"));
const Privacy = lazy(() => import("@/pages/Privacy"));
const Terms = lazy(() => import("@/pages/Terms"));
const AdminLayout = lazy(() => import("@/pages/admin/AdminLayout"));
const AdminUsers = lazy(() => import("@/pages/admin/Users"));
const AdminAgents = lazy(() => import("@/pages/admin/Agents"));
const AdminPayments = lazy(() => import("@/pages/admin/Payments"));
const AdminConversationSpending = lazy(() => import("@/pages/admin/ConversationSpending"));
const AdminIntegrations = lazy(() => import("@/pages/admin/Integrations"));
const AdminCampaigns = lazy(() => import("@/pages/admin/Campaigns"));
const AdminPhoneNumbers = lazy(() => import("@/pages/admin/PhoneNumbers"));
const AdminApiKeys = lazy(() => import("@/pages/admin/ApiKeys"));
const AdminFinancialSimulation = lazy(() => import("@/pages/admin/FinancialSimulation"));
const AdminTemplates = lazy(() => import("@/pages/admin/Templates"));
const AdminBehaviours = lazy(() => import("@/pages/admin/Behaviours"));

// Loading component for lazy routes
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

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
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                <Route path="/" element={<Landing2 />} />
                <Route path="/retail-ecommerce" element={<Landing />} />
                <Route path="/recruitment" element={<Landing3 />} />
                <Route path="/sign-up" element={<SignUp />} />
                <Route path="/reset-password" element={<Suspense fallback={<LoadingFallback />}><ResetPassword /></Suspense>} />
                <Route path="/reset-password-confirm" element={<Suspense fallback={<LoadingFallback />}><ResetPasswordConfirm /></Suspense>} />
                <Route path="/login" element={<Login />} />
                <Route path="/custom-agents" element={<Suspense fallback={<LoadingFallback />}><CustomAgents /></Suspense>} />
                <Route path="/pricing" element={<Suspense fallback={<LoadingFallback />}><Pricing /></Suspense>} />
                <Route path="/privacy" element={<Suspense fallback={<LoadingFallback />}><Privacy /></Suspense>} />
                <Route path="/terms" element={<Suspense fallback={<LoadingFallback />}><Terms /></Suspense>} />
                <Route path="/assistants/:id/widget/design" element={<ProtectedRoute><Suspense fallback={<LoadingFallback />}><WidgetDesignStudio /></Suspense></ProtectedRoute>} />
                <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                  <Route path="/account" element={<Suspense fallback={<LoadingFallback />}><Account /></Suspense>} />
                  <Route path="/overview" element={<Suspense fallback={<LoadingFallback />}><Overview /></Suspense>} />
                  <Route path="/assistants" element={<Suspense fallback={<LoadingFallback />}><AssistantsList /></Suspense>} />
                  <Route path="/assistants/create" element={<Suspense fallback={<LoadingFallback />}><AssistantDetail /></Suspense>} />
                  <Route path="/assistants/:id" element={<Suspense fallback={<LoadingFallback />}><AssistantDetail /></Suspense>} />
                  <Route path="/workflows" element={<Suspense fallback={<LoadingFallback />}><WorkflowsList /></Suspense>} />
                  <Route path="/workflows/new" element={<Suspense fallback={<LoadingFallback />}><WorkflowEditor /></Suspense>} />
                  <Route path="/workflows/:id" element={<Suspense fallback={<LoadingFallback />}><WorkflowEditor /></Suspense>} />
                  <Route path="/workflows-v1/new" element={<Suspense fallback={<LoadingFallback />}><WorkflowEditorV1 /></Suspense>} />
                  <Route path="/workflows-v1/:id" element={<Suspense fallback={<LoadingFallback />}><WorkflowEditorV1 /></Suspense>} />
                  <Route path="/phone-numbers" element={<Suspense fallback={<LoadingFallback />}><PhoneNumbers /></Suspense>} />
                  <Route path="/voice-library" element={<Suspense fallback={<LoadingFallback />}><VoiceLibrary /></Suspense>} />
                  <Route path="/api-keys" element={<Suspense fallback={<LoadingFallback />}><ApiKeys /></Suspense>} />
                  <Route path="/files" element={<Suspense fallback={<LoadingFallback />}><Files /></Suspense>} />
                  <Route path="/outbound" element={<Suspense fallback={<LoadingFallback />}><Outbound /></Suspense>} />
                  <Route path="/outbound/new" element={<Suspense fallback={<LoadingFallback />}><NewCampaign /></Suspense>} />
                  <Route path="/conversations" element={<Suspense fallback={<LoadingFallback />}><Conversations /></Suspense>} />
                  <Route path="/dashboards" element={<Suspense fallback={<LoadingFallback />}><Dashboards /></Suspense>} />
                  <Route path="/escalations" element={<Suspense fallback={<LoadingFallback />}><Escalations /></Suspense>} />
                  <Route path="/settings" element={<Suspense fallback={<LoadingFallback />}><Settings /></Suspense>}>
                    <Route index element={<Suspense fallback={<LoadingFallback />}><SettingsList /></Suspense>} />
                    <Route path="org" element={<Suspense fallback={<LoadingFallback />}><OrgSettings /></Suspense>} />
                    <Route path="billing" element={<Suspense fallback={<LoadingFallback />}><Billing /></Suspense>} />
                    <Route path="members" element={<Suspense fallback={<LoadingFallback />}><Members /></Suspense>} />
                    <Route path="integrations" element={<Suspense fallback={<LoadingFallback />}><Integrations /></Suspense>} />
                    <Route path="integrations/:type" element={<Suspense fallback={<LoadingFallback />}><IntegrationSettings /></Suspense>} />
                    <Route path="voice-library" element={<Suspense fallback={<LoadingFallback />}><VoiceLibrary /></Suspense>} />
                    <Route path="profile" element={<Suspense fallback={<LoadingFallback />}><Profile /></Suspense>} />
                    <Route path="financial-simulation" element={<Suspense fallback={<LoadingFallback />}><FinancialSimulation /></Suspense>} />
                    <Route path="api-keys" element={<Suspense fallback={<LoadingFallback />}><ApiKeys /></Suspense>} />
                  </Route>
                </Route>
                
                {/* Admin Routes */}
                <Route path="/admin" element={<AdminRoute><Suspense fallback={<LoadingFallback />}><AdminLayout /></Suspense></AdminRoute>}>
                  <Route index element={<Navigate to="/admin/users" replace />} />
                  <Route path="users" element={<Suspense fallback={<LoadingFallback />}><AdminUsers /></Suspense>} />
                  <Route path="agents" element={<Suspense fallback={<LoadingFallback />}><AdminAgents /></Suspense>} />
                  <Route path="templates" element={<Suspense fallback={<LoadingFallback />}><AdminTemplates /></Suspense>} />
                  <Route path="behaviours" element={<Suspense fallback={<LoadingFallback />}><AdminBehaviours /></Suspense>} />
                  <Route path="integrations" element={<Suspense fallback={<LoadingFallback />}><AdminIntegrations /></Suspense>} />
                  <Route path="campaigns" element={<Suspense fallback={<LoadingFallback />}><AdminCampaigns /></Suspense>} />
                  <Route path="phone-numbers" element={<Suspense fallback={<LoadingFallback />}><AdminPhoneNumbers /></Suspense>} />
                  <Route path="api-keys" element={<Suspense fallback={<LoadingFallback />}><AdminApiKeys /></Suspense>} />
                  <Route path="payments" element={<Suspense fallback={<LoadingFallback />}><AdminPayments /></Suspense>} />
                  <Route path="conversation-spending" element={<Suspense fallback={<LoadingFallback />}><AdminConversationSpending /></Suspense>} />
                  <Route path="financial-simulation" element={<Suspense fallback={<LoadingFallback />}><AdminFinancialSimulation /></Suspense>} />
                </Route>
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
