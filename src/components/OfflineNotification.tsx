
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { WifiOff, Wifi } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function OfflineNotification() {
  const isOnline = useOnlineStatus();
  const [showOffline, setShowOffline] = useState(false);
  const [showReconnected, setShowReconnected] = useState(false);

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
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-[90%] max-w-sm">
      {showOffline && (
        <Alert variant="destructive" className="shadow-lg animate-fade-in">
          <WifiOff className="h-4 w-4" />
          <AlertTitle>Sem conexão</AlertTitle>
          <AlertDescription>
            Você está offline. Algumas funcionalidades podem estar limitadas.
          </AlertDescription>
        </Alert>
      )}
      
      {showReconnected && (
        <Alert variant="default" className="bg-green-100 dark:bg-green-900 shadow-lg animate-fade-in">
          <Wifi className="h-4 w-4" />
          <AlertTitle>Conectado</AlertTitle>
          <AlertDescription>
            Sua conexão foi restabelecida.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
