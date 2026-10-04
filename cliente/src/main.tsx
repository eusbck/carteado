import { render } from 'preact';
import { App } from './app.tsx';
import './estilo.css';
import { loja } from './loja.ts';

render(<App />, document.getElementById('app')!);
void loja.iniciar();
