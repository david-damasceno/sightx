
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
import { Download, X } from 'lucide-react';

export default function PWAInstallPrompt() {
  const [installPromptEvent, setInstallPromptEvent] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detecta se é iOS para mostrar instruções específicas
    const ua = navigator.userAgent;
    setIsIOS(/iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream);

    // Para dispositivos que não são iOS
    const handleBeforeInstallPrompt = (e: Event) => {
      // Previne o comportamento padrão do navegador
      e.preventDefault();
      // Armazena o evento para uso posterior
      setInstallPromptEvent(e);
      // Verifica se o usuário já fechou o prompt antes
      const hasClosedPrompt = localStorage.getItem('pwaPromptClosed');
      // Só mostra se o usuário não fechou antes ou se faz mais de 7 dias
      const lastClosed = parseInt(localStorage.getItem('pwaPromptClosedTime') || '0');
      const now = Date.now();
      const daysSinceLastClosed = (now - lastClosed) / (1000 * 60 * 60 * 24);
      
      if (!hasClosedPrompt || daysSinceLastClosed > 7) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Verifica se a aplicação já está instalada
    const checkIfInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        // Já está instalado, não precisa mostrar o prompt
        setShowPrompt(false);
      } else if (isIOS) {
        // Em iOS, verificamos se o usuário já viu o prompt recentemente
        const hasClosedPrompt = localStorage.getItem('pwaPromptClosedIOS');
        const lastClosed = parseInt(localStorage.getItem('pwaPromptClosedTimeIOS') || '0');
        const now = Date.now();
        const daysSinceLastClosed = (now - lastClosed) / (1000 * 60 * 60 * 24);
        
        if (!hasClosedPrompt || daysSinceLastClosed > 7) {
          // Mostra prompt para iOS após 5 segundos de navegação
          setTimeout(() => {
            setShowPrompt(true);
          }, 5000);
        }
      }
    };

    checkIfInstalled();

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [isIOS]);

  const handleInstallClick = () => {
    if (isIOS) {
      // Para iOS apenas fechamos o prompt, as instruções já são mostradas
      setShowPrompt(false);
      localStorage.setItem('pwaPromptClosedIOS', 'true');
      localStorage.setItem('pwaPromptClosedTimeIOS', Date.now().toString());
      return;
    }

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
    if (isIOS) {
      localStorage.setItem('pwaPromptClosedIOS', 'true');
      localStorage.setItem('pwaPromptClosedTimeIOS', Date.now().toString());
    } else {
      localStorage.setItem('pwaPromptClosed', 'true');
      localStorage.setItem('pwaPromptClosedTime', Date.now().toString());
    }
  };

  if (!showPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 w-[90%] max-w-sm">
      <Card className="relative shadow-lg animate-fade-in border-primary/20">
        <button 
          onClick={handleClose}
          className="absolute top-2 right-2 h-6 w-6 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          aria-label="Fechar"
        >
          <X size={16} />
        </button>
        <CardHeader className="pb-2">
          <CardTitle className="text-center text-primary">
            Instalar SightX
          </CardTitle>
          <CardDescription className="text-center">
            Acesse os recursos offline e tenha uma experiência completa
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-3">
          {isIOS ? (
            <div className="space-y-2 text-sm">
              <p>Para instalar o SightX em seu dispositivo iOS:</p>
              <ol className="list-decimal pl-5 space-y-1">
                <li>Toque no botão de compartilhamento <span className="rounded-md bg-gray-200 dark:bg-gray-700 px-2 py-0.5">
                  <svg className="inline-block h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                </span></li>
                <li>Role para baixo e toque em "Adicionar à Tela de Início"</li>
                <li>Confirme tocando em "Adicionar"</li>
              </ol>
            </div>
          ) : (
            <p className="text-sm text-center">
              Adicione o SightX à tela inicial do seu dispositivo para acesso rápido e recursos offline.
            </p>
          )}
        </CardContent>
        <CardFooter className="flex justify-center pt-0">
          {isIOS ? (
            <Button onClick={handleClose} variant="default" className="w-full">
              Entendi
            </Button>
          ) : (
            <Button onClick={handleInstallClick} className="w-full">
              <Download className="mr-2 h-4 w-4" /> Instalar
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
