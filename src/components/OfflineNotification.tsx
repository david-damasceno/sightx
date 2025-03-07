
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { WifiOff, Wifi } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function OfflineNotification() {
  const isOnline = useOnlineStatus();
  const [showOffline, setShowOffline] = useState(false);
  const [showReconnected, setShowReconnected] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Detectar se está em dispositivo móvel
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!isOnline) {
      setShowOffline(true);
    } else if (showOffline) {
      // Se estava offline e agora está online, mostrar mensagem de reconexão
      setShowOffline(false);
      setShowReconnected(true);
      
      // Esconder a mensagem de reconexão após 3 segundos
      const timer = setTimeout(() => {
        setShowReconnected(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isOnline, showOffline]);

  if (!showOffline && !showReconnected) return null;

  return (
    <div className={`fixed ${isMobile ? 'top-2 right-2 left-2 z-50' : 'top-4 right-4 z-50 max-w-sm'}`}>
      {showOffline && (
        <Alert variant="destructive" className="shadow-lg animate-fade-in">
          <WifiOff className="h-4 w-4" />
          <AlertTitle className={isMobile ? 'text-base' : ''}>Sem conexão</AlertTitle>
          <AlertDescription className={isMobile ? 'text-sm' : ''}>
            Você está offline. Algumas funcionalidades podem estar limitadas.
          </AlertDescription>
        </Alert>
      )}
      
      {showReconnected && (
        <Alert variant="default" className="bg-green-100 dark:bg-green-900 shadow-lg animate-fade-in">
          <Wifi className="h-4 w-4" />
          <AlertTitle className={isMobile ? 'text-base' : ''}>Conectado</AlertTitle>
          <AlertDescription className={isMobile ? 'text-sm' : ''}>
            Sua conexão foi restabelecida.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
