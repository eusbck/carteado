import { useState } from 'preact/hooks';
import { loja } from '../loja.ts';

export function Entrada() {
  const [senha, setSenha] = useState('');
  const enviar = (ev: Event) => {
    ev.preventDefault();
    if (senha) void loja.entrar(senha);
  };
  return (
    <main class="tela-estreita">
      <h1 class="titulo">Commander da Mesa</h1>
      <p class="suave">Mesa privada. Entre com a senha do servidor.</p>
      <form class="formulario" onSubmit={enviar}>
        <label>
          Senha do servidor
          <input type="password" autocomplete="current-password" value={senha} onInput={(e) => setSenha((e.target as HTMLInputElement).value)} autofocus />
        </label>
        <button class="botao principal" type="submit">Entrar</button>
      </form>
    </main>
  );
}
