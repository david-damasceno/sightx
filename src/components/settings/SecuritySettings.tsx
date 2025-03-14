
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ShieldCheck, AlertTriangle, Key, FileDigit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Translate } from "@/components/Translate";
import { useLocalization } from "@/hooks/use-localization";

interface SecuritySettings {
  ipWhitelisting: boolean;
  auditLogging: boolean;
  twoFactorAuth: boolean;
  apiKeySet: boolean;
}

export function SecuritySettings() {
  const { addToast } = useToast();
  const { t } = useLocalization();
  const [settings, setSettings] = useState<SecuritySettings>({
    ipWhitelisting: false,
    auditLogging: true,
    twoFactorAuth: false,
    apiKeySet: false
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('profiles')
          .select('settings')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        if (data?.settings) {
          // Verificar se settings existe e se security existe dentro de settings
          const securitySettings = typeof data.settings === 'object' && 
                                   data.settings !== null && 
                                   'security' in data.settings ? 
                                   data.settings.security as SecuritySettings : 
                                   null;
          
          if (securitySettings) {
            setSettings(securitySettings);
          }
        }
      } catch (error) {
        console.error("Erro ao carregar configurações de segurança:", error);
      }
    }

    loadSettings();
  }, []);

  const saveSettings = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      // Obter configurações atuais primeiro
      const { data: currentProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('settings')
        .eq('id', user.id)
        .single();

      if (fetchError) throw fetchError;

      // Mesclar configurações atuais com novas configurações de segurança
      const currentSettings = typeof currentProfile?.settings === 'object' ? 
                             currentProfile?.settings || {} : 
                             {};
                             
      const updatedSettings = {
        ...currentSettings,
        security: settings
      };

      const { error } = await supabase
        .from('profiles')
        .update({
          settings: updatedSettings
        })
        .eq('id', user.id);

      if (error) throw error;

      addToast({
        title: t("Configurações salvas"),
        description: t("Configurações de segurança atualizadas com sucesso"),
        variant: "default",
      });
    } catch (error) {
      console.error("Erro ao salvar configurações de segurança:", error);
      addToast({
        title: t("Erro"),
        description: t("Não foi possível salvar as configurações"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium"><Translate text="Segurança" /></h2>
        <p className="text-sm text-muted-foreground">
          <Translate text="Configure as medidas de segurança para sua conta" />
        </p>
      </div>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle><Translate text="Proteção de Conta" /></AlertTitle>
        <AlertDescription>
          <Translate text="Recomendamos habilitar a autenticação de dois fatores para maior segurança. Isso ajuda a proteger sua conta mesmo se suas credenciais forem comprometidas." />
        </AlertDescription>
      </Alert>

      <Card className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <div>
              <h3 className="font-medium"><Translate text="Lista de IPs permitidos" /></h3>
              <p className="text-sm text-muted-foreground">
                <Translate text="Restrinja acesso apenas a IPs específicos" />
              </p>
            </div>
          </div>
          <Switch 
            checked={settings.ipWhitelisting}
            onCheckedChange={(checked) => setSettings({...settings, ipWhitelisting: checked})}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <FileDigit className="h-5 w-5 text-primary" />
            <div>
              <h3 className="font-medium"><Translate text="Registro de auditoria" /></h3>
              <p className="text-sm text-muted-foreground">
                <Translate text="Mantenha registros detalhados de todas as atividades" />
              </p>
            </div>
          </div>
          <Switch 
            checked={settings.auditLogging}
            onCheckedChange={(checked) => setSettings({...settings, auditLogging: checked})}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <div>
              <h3 className="font-medium"><Translate text="Autenticação de dois fatores" /></h3>
              <p className="text-sm text-muted-foreground">
                <Translate text="Adicione uma camada extra de segurança ao seu login" />
              </p>
            </div>
          </div>
          <Switch 
            checked={settings.twoFactorAuth}
            onCheckedChange={(checked) => setSettings({...settings, twoFactorAuth: checked})}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Key className="h-5 w-5 text-primary" />
            <div>
              <h3 className="font-medium"><Translate text="Chaves de API" /></h3>
              <p className="text-sm text-muted-foreground">
                <Translate text="Gerencie chaves de API para integração com outros sistemas" />
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm">
            <Translate text={settings.apiKeySet ? "Gerenciar Chaves" : "Gerar Chave"} />
          </Button>
        </div>

        <Button 
          onClick={saveSettings} 
          disabled={loading}
          className="w-full sm:w-auto mt-4"
        >
          {loading ? <Translate text="Salvando..." /> : <Translate text="Salvar Configurações" />}
        </Button>
      </Card>
    </div>
  );
}
