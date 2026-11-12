import { render } from 'preact';
import { instalarDiagnostico } from './relato/diagnostico.ts';
import { App } from './app.tsx';
import './estilo.css';
import './relato/relato.css';
import { loja } from './loja.ts';

// antes de desenhar: os erros da página desde o começo vão junto de um relato de erro
instalarDiagnostico();
render(<App />, document.getElementById('app')!);
void loja.iniciar();
