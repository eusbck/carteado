import { useState } from 'preact/hooks';
import { loja } from '../loja.ts';
import type { Modo } from '../../../servidor/protocolo.ts';

const NOME = 'commander-da-mesa:nome';
function nomeGuardado(): string {
  try { return localStorage.getItem(NOME) ?? ''; } catch { return ''; }
}
function guardarNome(n: string): void {
  try { localStorage.setItem(NOME, n); } catch { /* sem armazenamento */ }
}

export function Inicio() {
  const [nome, setNome] = useState(nomeGuardado());
  const [modo, setModo] = useState<Modo>('4p');
  const [senhaNova, setSenhaNova] = useState('');
  const [codigo, setCodigo] = useState('');
  const [senha, setSenha] = useState('');
  const val = (f: (s: string) => void) => (e: Event) => f((e.target as HTMLInputElement).value);

  const criar = (ev: Event) => {
    ev.preventDefault();
    guardarNome(nome);
    loja.enviar({ t: 'criar', nome, senhaSala: senhaNova, modo });
  };
  const entrar = (ev: Event) => {
    ev.preventDefault();
    guardarNome(nome);
    loja.enviar({ t: 'entrar', codigo, senhaSala: senha, nome });
  };

  return (
    <main class="tela-estreita">
      <h1 class="titulo">Commander da Mesa</h1>
      <label class="campo-nome">
        Seu nome na mesa
        <input value={nome} maxLength={24} onInput={val(setNome)} placeholder="Como os outros vão te ver" />
      </label>
      <div class="duas-colunas">
        <form class="formulario bloco" onSubmit={criar}>
          <h2>Criar sala</h2>
          <fieldset class="escolha">
            <legend>Formato</legend>
            <button type="button" class={`botao ${modo === '4p' ? 'ativo' : ''}`} onClick={() => setModo('4p')}>Quatro jogadores</button>
            <button type="button" class={`botao ${modo === '1v1' ? 'ativo' : ''}`} onClick={() => setModo('1v1')}>Um contra um</button>
          </fieldset>
          <label>
            Senha da sala
            <input type="password" value={senhaNova} onInput={val(setSenhaNova)} minLength={3} maxLength={64} />
          </label>
          <button class="botao principal" type="submit" disabled={!nome || senhaNova.length < 3}>Criar</button>
        </form>
        <form class="formulario bloco" onSubmit={entrar}>
          <h2>Entrar numa sala</h2>
          <label>
            Código
            <input value={codigo} onInput={(e) => setCodigo((e.target as HTMLInputElement).value.toUpperCase())} maxLength={5} autocapitalize="characters" />
          </label>
          <label>
            Senha da sala
            <input type="password" value={senha} onInput={val(setSenha)} />
          </label>
          <button class="botao principal" type="submit" disabled={!nome || codigo.length !== 5 || !senha}>Entrar</button>
        </form>
      </div>
    </main>
  );
}
