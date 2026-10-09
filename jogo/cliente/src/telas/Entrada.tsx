// Entrada no servidor: a boas-vindas aos feiticeiros. Uma abertura em sequência (o M em brasa surge com um brilho
// que respira, o nome em letras de inscrição, as cinco joias de mana do verso da carta acendendo uma a uma, o texto
// e por fim a senha), por cima dos wallpapers e da atmosfera (Atmosfera.tsx). Animações em estilo.css ("entrada
// épica"); com "reduzir movimento", tudo aparece de uma vez.

import { useEffect, useRef, useState } from 'preact/hooks';
import logoM from '../imagens/logo-m.png?url';
import { loja } from '../loja.ts';

const MANA = ['w', 'u', 'b', 'r', 'g'] as const;

export function Entrada() {
  const [senha, setSenha] = useState('');
  const campo = useRef<HTMLInputElement>(null);
  // um envio por vez: Enter e clique juntos (ou dois Enter) entravam duas vezes e abriam dois WebSockets. Só a
  // trava, sem mudar o botão (o cinza de desativado piscava a cada entrada)
  const enviando = useRef(false);
  // o foco vai para a senha quando o formulário termina de entrar
  useEffect(() => { const t = setTimeout(() => campo.current?.focus({ preventScroll: true }), 1900); return () => clearTimeout(t); }, []);
  const enviar = async (ev: Event) => {
    ev.preventDefault();
    if (!senha || enviando.current) return;
    enviando.current = true;
    try {
      await loja.entrar(senha);
    } catch {
      loja.erro('Não foi possível falar com o servidor');
    } finally {
      // senha certa: a tela já saiu; errada (ou sem rede): dá para tentar de novo
      enviando.current = false;
    }
  };
  return (
    <div class="tela-fundo tela-epica">
      <main class="entrada-epica">
        <div class="entrada-brasao" aria-hidden="true"><span class="entrada-halo" /><img src={logoM} alt="" draggable={false} /></div>
        <h1 class="entrada-titulo"><span>Magic</span> Commander</h1>
        <div class="orbes" aria-hidden="true">{MANA.map((c, i) => <span key={c} class={`orbe orbe-${c}`} style={{ '--i': i }} />)}</div>
        <p class="entrada-saudacao">Bem-vindo, feiticeiro.</p>
        <form class="entrada-form" onSubmit={enviar}>
          <label>
            Senha do servidor
            <input ref={campo} type="password" autocomplete="current-password" value={senha} placeholder="A palavra que abre o portal" onInput={(e) => setSenha((e.target as HTMLInputElement).value)} />
          </label>
          <button class="botao cheio grande" type="submit" disabled={!senha}>Entrar</button>
        </form>
        <p class="entrada-rodape">Mesa privada do grupo</p>
      </main>
    </div>
  );
}
