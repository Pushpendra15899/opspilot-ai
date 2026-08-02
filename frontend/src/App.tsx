import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { DashboardPage } from "@/pages/DashboardPage";
import { IncidentsPage } from "@/pages/IncidentsPage";
import { ObservabilityPage } from "@/pages/ObservabilityPage";
import { ApiDocsPage } from "@/pages/ApiDocsPage";
import { AiAssistantPage } from "@/pages/AiAssistantPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 10_000,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppShell>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/incidents" element={<IncidentsPage />} />
            <Route path="/observability" element={<ObservabilityPage />} />
            <Route path="/docs" element={<ApiDocsPage />} />
            <Route path="/assistant" element={<AiAssistantPage />} />
          </Routes>
        </AppShell>
      </BrowserRouter>
    </QueryClientProvider>
  );
}