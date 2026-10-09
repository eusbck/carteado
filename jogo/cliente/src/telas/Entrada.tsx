import { useState } from 'preact/hooks';
import { Marca } from '../icones.tsx';
import { loja } from '../loja.ts';

export function Entrada() {
  const [senha, setSenha] = useState('');
  const enviar = (ev: Event) => {
    ev.preventDefault();
    if (senha) void loja.entrar(senha);
  };
  return (
    <div class="tela-fundo">
      <main class="janela tela-estreita mini">
        <div class="marca-jogo"><Marca /><span>MAGIC COMMANDER</span></div>
        <div>
          <h1 class="titulo">Mesa privada</h1>
          <p class="suave">Entre com a senha do servidor.</p>
        </div>
        <form class="formulario" onSubmit={enviar}>
          <label>
            Senha do servidor
            <input type="password" autocomplete="current-password" value={senha} onInput={(e) => setSenha((e.target as HTMLInputElement).value)} autofocus />
          </label>
          <button class="botao principal grande" type="submit">Entrar</button>
        </form>
      </main>
    </div>
  );
}
