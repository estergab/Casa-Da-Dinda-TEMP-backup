import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Home as HomeIcon, Users, Check, Mail, Phone, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import { TemporaryHome } from "@/lib/mockData";
import api from "@/services/api";
import { toast } from "sonner";

const HomeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [home, setHome] = useState<TemporaryHome | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Buscar lar específico do banco
  useEffect(() => {
    const fetchHome = async () => {
      if (!id) {
        toast.error("ID do lar não fornecido");
        navigate("/lares-disponiveis");
        return;
      }

      try {
        setIsLoading(true);
        console.log("🔍 Buscando lar com ID:", id);
        
        const response = await api.get(`/lares/${id}`);
        console.log("✅ Lar carregado:", response.data);
        
        const larData = response.data.data || response.data;
        
        // Parse do availableFor se vier como string JSON
        let availableForArray: string[] = [];
        if (typeof larData.availableFor === 'string') {
          try {
            availableForArray = JSON.parse(larData.availableFor);
          } catch {
            availableForArray = [larData.availableFor];
          }
        } else if (Array.isArray(larData.availableFor)) {
          availableForArray = larData.availableFor;
        }
        
        const homeFormatted: TemporaryHome = {
          id: larData._id || larData.id,
          hostName: larData.hostName || "",
          email: larData.email || "",
          phone: larData.phone || "",
          city: larData.city || "",
          state: larData.state || "",
          address: larData.address || "",
          capacity: larData.capacity || 0,
          hasYard: larData.hasYard || false,
          hasFence: larData.hasFence || false,
          experience: larData.experience || "",
          availableFor: availableForArray,
          description: larData.description || "",
          imageUrl: larData.imageUrl 
            ? `http://localhost:3335${larData.imageUrl}` 
            : "/placeholder.svg",
          createdAt: larData.createdAt ? new Date(larData.createdAt) : new Date(),
        };
        
        setHome(homeFormatted);
      } catch (error: any) {
        console.error("❌ Erro ao carregar lar:", error);
        toast.error("Erro ao carregar detalhes do lar");
        navigate("/lares-disponiveis");
      } finally {
        setIsLoading(false);
      }
    };

    fetchHome();
  }, [id, navigate]);

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-12">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-4">Carregando detalhes...</p>
          </div>
        </div>
      </div>
    );
  }

  // Not Found State
  if (!home) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-12">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground text-lg mb-4">
                Lar não encontrado.
              </p>
              <Button onClick={() => navigate("/lares-disponiveis")}>
                Voltar para Lista
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12">
        {/* Botão Voltar */}
        <Button
          variant="ghost"
          onClick={() => navigate("/lares-disponiveis")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Imagem */}
          <div className="relative h-96 lg:h-[600px] rounded-lg overflow-hidden">
            <img
              src={home.imageUrl}
              alt={`Lar de ${home.hostName}`}
              className="w-full h-full object-cover"
            />
            {home.hasYard && (
              <Badge className="absolute top-4 right-4 bg-green-500 hover:bg-green-600">
                Com Quintal
              </Badge>
            )}
          </div>

          {/* Informações */}
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                <HomeIcon className="h-8 w-8 text-primary" />
                Casa de {home.hostName}
              </h1>
              <p className="text-muted-foreground text-lg flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                {home.address}, {home.city} - {home.state}
              </p>
            </div>

            {/* Card de Informações Principais */}
            <Card>
              <CardHeader>
                <CardTitle>Informações do Lar</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Capacidade */}
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <span>Capacidade: <strong>{home.capacity} pets</strong></span>
                </div>

                {/* Características */}
                <div className="flex gap-2 flex-wrap">
                  {home.hasYard && (
                    <Badge variant="secondary" className="gap-1">
                      <Check className="h-3 w-3" />
                      Quintal
                    </Badge>
                  )}
                  {home.hasFence && (
                    <Badge variant="secondary" className="gap-1">
                      <Check className="h-3 w-3" />
                      Cercado
                    </Badge>
                  )}
                  {!home.hasYard && !home.hasFence && (
                    <Badge variant="outline">
                      Sem características especiais
                    </Badge>
                  )}
                </div>

                {/* Aceita */}
                <div>
                  <p className="text-sm font-medium mb-2">Aceita:</p>
                  <div className="flex gap-2 flex-wrap">
                    {home.availableFor && home.availableFor.length > 0 ? (
                      home.availableFor.map((type, index) => (
                        <Badge key={index} variant="default">
                          {type}
                        </Badge>
                      ))
                    ) : (
                      <Badge variant="outline">Não especificado</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Descrição */}
            {home.description && (
              <Card>
                <CardHeader>
                  <CardTitle>Sobre o Lar</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {home.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Experiência */}
            {home.experience && (
              <Card>
                <CardHeader>
                  <CardTitle>Experiência com Pets</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {home.experience}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Contato */}
            <Card>
              <CardHeader>
                <CardTitle>Informações de Contato</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <a 
                    href={`mailto:${home.email}`}
                    className="text-primary hover:underline"
                  >
                    {home.email}
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <a 
                    href={`tel:${home.phone}`}
                    className="text-primary hover:underline"
                  >
                    {home.phone}
                  </a>
                </div>
                <p className="text-sm text-muted-foreground">
                  Anfitrião: <strong>{home.hostName}</strong>
                </p>
              </CardContent>
            </Card>

            {/* Botão de Ação */}
            <Button 
              size="lg" 
              className="w-full gradient-primary"
              onClick={() => navigate(`/solicitar-hospedagem/${home.id}`)} // ✅ REDIRECIONA
            >
              Solicitar Hospedagem
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeDetails;
