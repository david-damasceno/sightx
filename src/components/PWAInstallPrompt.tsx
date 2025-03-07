
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function PWAInstallPrompt() {
  const [installPromptEvent, setInstallPromptEvent] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Previne o comportamento padrão do navegador
      e.preventDefault();
      // Armazena o evento para uso posterior
      setInstallPromptEvent(e);
      // Verifica se o usuário já fechou o prompt antes
      const hasClosedPrompt = localStorage.getItem('pwaPromptClosed');
      if (!hasClosedPrompt) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = () => {
    if (!installPromptEvent) {
      return;
    }

    // Mostra o prompt de instalação
    installPromptEvent.prompt();

    // Espera pela resposta do usuário
    installPromptEvent.userChoice.then((choiceResult: { outcome: string }) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('Usuário aceitou a instalação do PWA');
      } else {
        console.log('Usuário recusou a instalação do PWA');
      }
      // Limpa o evento salvo, ele não pode ser usado duas vezes
      setInstallPromptEvent(null);
      setShowPrompt(false);
    });
  };

  const handleClose = () => {
    setShowPrompt(false);
    // Salva que o usuário fechou o prompt para não mostrar novamente
    localStorage.setItem('pwaPromptClosed', 'true');
  };

  if (!showPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <Card>
        <CardHeader>
          <CardTitle>Instalar SightX</CardTitle>
          <CardDescription>
            Instale nosso aplicativo para uso offline e experiência aprimorada
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Adicione o SightX à tela inicial do seu dispositivo para acesso rápido e recursos offline.
          </p>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handleClose}>
            Não agora
          </Button>
          <Button onClick={handleInstallClick}>
            Instalar
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
