import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Clock, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import api from "@/services/api";
import { toast } from "sonner";

interface Solicitacao {
  _id: string;
  id: string;
  homeId: string;
  hostEmail: string; // ✅ NOVO
  requesterName: string;
  requesterEmail: string;
  requesterPhone: string;
  petName: string;
  petType: string;
  petImageUrl?: string;
  startDate?: string;
  status: 'pending' | 'approved' | 'rejected'; // ✅ NOVO
  createdAt: string;
}

const SolicitacoesList = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ✅ PEGAR EMAIL (prioridade: URL > localStorage)
  const loggedUserEmail = 
    searchParams.get("email") || 
    localStorage.getItem("userEmail") || 
    "";

  console.log("👤 Email do usuário:", loggedUserEmail);

  useEffect(() => {
    if (!loggedUserEmail) {
      toast.error("Email não fornecido");
      navigate("/solicitacoes");
      return;
    }

    const fetchSolicitacoes = async () => {
      try {
        setIsLoading(true);
        console.log("🔍 Buscando solicitações para:", loggedUserEmail);

        const response = await api.get(`/solicitacoes/email/${loggedUserEmail}`);

        console.log("✅ Solicitações carregadas:", response.data);

        const solicitacoesData = Array.isArray(response.data)
          ? response.data
          : response.data.data || [];

        setSolicitacoes(solicitacoesData);
      } catch (error: any) {
        console.error("❌ Erro ao carregar solicitações:", error);
        toast.error("Erro ao carregar solicitações");
        setSolicitacoes([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSolicitacoes();
  }, [loggedUserEmail, navigate]);

  // ✅ SEPARAR SOLICITAÇÕES POR STATUS
  const pendingSolicitacoes = solicitacoes.filter((s) => s.status === 'pending');
  const approvedSolicitacoes = solicitacoes.filter((s) => s.status === 'approved');
  const rejectedSolicitacoes = solicitacoes.filter((s) => s.status === 'rejected');

  console.log("📊 Pendentes:", pendingSolicitacoes.length);
  console.log("📊 Aprovadas:", approvedSolicitacoes.length);
  console.log("📊 Negadas:", rejectedSolicitacoes.length);

  const handleVerDetalhes = (id: string) => {
    navigate(`/solicitacoes/${id}?email=${encodeURIComponent(loggedUserEmail)}`);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Data não informada";
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  // ✅ COMPONENTE DE CARD DE SOLICITAÇÃO
  const SolicitacaoCard = ({ solicitacao }: { solicitacao: Solicitacao }) => {
    const isTutor = solicitacao.requesterEmail.toLowerCase() === loggedUserEmail.toLowerCase();
    const isHost = solicitacao.hostEmail.toLowerCase() === loggedUserEmail.toLowerCase();

    return (
      <Card
        className="hover:shadow-lg transition-shadow cursor-pointer"
        onClick={() => handleVerDetalhes(solicitacao.id)}
      >
        <CardContent className="p-6">
          <div className="flex gap-4">
            {/* Imagem do Pet */}
            {solicitacao.petImageUrl && (
              <img
                src={`http://localhost:3335${solicitacao.petImageUrl}`}
                alt={solicitacao.petName}
                className="w-24 h-24 object-cover rounded-lg"
              />
            )}

            {/* Informações */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-xl font-semibold">{solicitacao.petName}</h3>
                  <p className="text-sm text-muted-foreground">
                    {isTutor ? "Você enviou esta solicitação" : `Solicitado por ${solicitacao.requesterName}`}
                  </p>
                </div>
                <Badge variant="secondary">
                  {solicitacao.petType === "dog" ? "Cão" : "Gato"}
                </Badge>
              </div>

              <div className="space-y-1 text-sm text-muted-foreground">
                <p>📧 {solicitacao.requesterEmail}</p>
                <p>📞 {solicitacao.requesterPhone}</p>
                <p>📅 Início: {formatDate(solicitacao.startDate)}</p>
                <p className="text-xs">Enviada em: {formatDate(solicitacao.createdAt)}</p>
              </div>

              <Button
                className="mt-4 w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  handleVerDetalhes(solicitacao.id);
                }}
              >
                Ver Detalhes
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // ✅ COMPONENTE DE SEÇÃO COM TÍTULO E ÍCONE
  const SectionHeader = ({ 
    icon: Icon, 
    title, 
    count, 
    color 
  }: { 
    icon: any; 
    title: string; 
    count: number; 
    color: string;
  }) => (
    <div className="flex items-center gap-3 mb-6">
      <Icon className={`h-6 w-6 ${color}`} />
      <h2 className="text-2xl font-bold">{title}</h2>
      <Badge variant="secondary" className="ml-auto">
        {count} {count === 1 ? "solicitação" : "solicitações"}
      </Badge>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-12">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-4">Carregando solicitações...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <h1 className="text-4xl font-bold">Minhas Solicitações</h1>
          <p className="text-muted-foreground text-lg mt-2">
            Gerencie todas as suas solicitações de estadia
          </p>
        </div>

        {/* Empty State - Nenhuma solicitação */}
        {solicitacoes.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground text-lg mb-4">
                Você ainda não tem solicitações
              </p>
              <Button onClick={() => navigate("/lares-disponiveis")}>
                Ver Lares Disponíveis
              </Button>
            </CardContent>
          </Card>
        )}

        {/* ✅ SEÇÃO 1: AGUARDANDO DECISÃO (PENDING) */}
        {pendingSolicitacoes.length > 0 && (
          <div className="mb-12">
            <SectionHeader
              icon={Clock}
              title="⏳ Aguardando Decisão"
              count={pendingSolicitacoes.length}
              color="text-yellow-600"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pendingSolicitacoes.map((solicitacao) => (
                <SolicitacaoCard key={solicitacao._id} solicitacao={solicitacao} />
              ))}
            </div>
          </div>
        )}

        {/* ✅ SEÇÃO 2: APROVADAS (APPROVED) */}
        {approvedSolicitacoes.length > 0 && (
          <div className="mb-12">
            <SectionHeader
              icon={CheckCircle}
              title="✅ Aprovadas"
              count={approvedSolicitacoes.length}
              color="text-green-600"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {approvedSolicitacoes.map((solicitacao) => (
                <SolicitacaoCard key={solicitacao._id} solicitacao={solicitacao} />
              ))}
            </div>
          </div>
        )}

        {/* ✅ SEÇÃO 3: NEGADAS (REJECTED) */}
        {rejectedSolicitacoes.length > 0 && (
          <div className="mb-12">
            <SectionHeader
              icon={XCircle}
              title="❌ Negadas"
              count={rejectedSolicitacoes.length}
              color="text-red-600"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {rejectedSolicitacoes.map((solicitacao) => (
                <SolicitacaoCard key={solicitacao._id} solicitacao={solicitacao} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SolicitacoesList;
