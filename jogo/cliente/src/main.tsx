import { render } from 'preact';
import { instalarDiagnostico } from './relato/diagnostico.ts';
import { App } from './app.tsx';
import './estilo.css';
import './relato/relato.css';
import { loja } from './loja.ts';

const raiz = document.getElementById('app')!;
if (location.pathname === '/dev' || location.pathname.startsWith('/dev/')) {
  // área do desenvolvedor: pacote à parte (quem joga nunca baixa), sem a conexão da mesa
  void import('./dev/Dev.tsx').then(({ Dev }) => render(<Dev />, raiz));
} else {
  // antes de desenhar: os erros da página desde o começo vão junto de um relato de erro (e para a área do desenvolvedor)
  instalarDiagnostico({ enviarErros: true, tela: () => loja.e.fase === 'sala' && loja.e.vista ? 'mesa' : loja.e.fase === 'sala' ? 'saguao' : loja.e.fase });
  render(<App />, raiz);
  void loja.iniciar();
}
