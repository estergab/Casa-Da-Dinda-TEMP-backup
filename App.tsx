import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import RegisterHome from "./pages/RegisterHome";
import HomesList from "./pages/HomesList";
import HomeDetails from "./pages/HomeDetails";
import RequestStay from "./pages/RequestStay";
import SolicitacoesLogin from "./pages/SolicitacoesLogin";
import SolicitacoesList from "./pages/SolicitacoesList";
import SolicitacoesDetalhes from "./pages/SolicitacoesDetalhes";
import AumigosList from "./pages/AumigosList"; // ✅ NOVO
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/cadastrar-lar" element={<RegisterHome />} />
          <Route path="/lares-disponiveis" element={<HomesList />} />
          <Route path="/lar/:id" element={<HomeDetails />} />
          <Route path="/solicitar-hospedagem/:homeId" element={<RequestStay />} />
          <Route path="/solicitacoes" element={<SolicitacoesLogin />} />
          <Route path="/solicitacoes/lista" element={<SolicitacoesList />} />
          <Route path="/solicitacoes/:id" element={<SolicitacoesDetalhes />} />
          
          {/* ✅ NOVA ROTA AUMIGOS */}
          <Route path="/aumigos" element={<AumigosList />} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
