
import { useEffect } from 'react'

interface FacebookSDKProps {
  appId: string;
  onSDKLoaded?: () => void;
}

declare global {
  interface Window {
    fbAsyncInit: () => void;
    FB: any;
  }
}

export function FacebookSDK({ appId, onSDKLoaded }: FacebookSDKProps) {
  useEffect(() => {
    // Verificar se o script já foi carregado
    if (document.getElementById('facebook-jssdk')) {
      if (onSDKLoaded) onSDKLoaded();
      return;
    }

    // Configurar o callback de inicialização do SDK
    window.fbAsyncInit = function() {
      window.FB.init({
        appId: appId,
        cookie: true,
        xfbml: true,
        version: 'v18.0'
      });
      
      window.FB.AppEvents.logPageView();
      
      if (onSDKLoaded) onSDKLoaded();
    };

    // Carregar o SDK do Facebook de forma assíncrona
    (function(d, s, id) {
      let js, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) return;
      js = d.createElement(s);
      js.id = id;
      js.src = "https://connect.facebook.net/pt_BR/sdk.js";
      if (fjs && fjs.parentNode) {
        fjs.parentNode.insertBefore(js, fjs);
      }
    }(document, 'script', 'facebook-jssdk'));

    // Cleanup function
    return () => {
      // Não precisamos remover o script quando o componente for desmontado
      // pois o SDK deve permanecer disponível em toda a aplicação
    };
  }, [appId, onSDKLoaded]);

  return null; // Este componente não renderiza nada, apenas carrega o SDK
}
