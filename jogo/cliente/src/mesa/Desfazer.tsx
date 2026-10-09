// Pedido de desfazer: todos veem o que vai voltar, quem já aceitou e o tempo que falta. Quem
// precisa responder aceita ou recusa; quem pediu pode cancelar.

import { useEffect, useState } from 'preact/hooks';
import type { PedidoDesfazer as Pedido } from '../../../servidor/protocolo.ts';
import { IconeDesfazer } from '../icones.tsx';
import { loja } from '../loja.ts';
import { traduzir } from '../cartas.ts';

const OK = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg>;

export function PedidoDesfazer({ p, eu, nomes, cor }: { p: Pedido & { ate: number }; eu: number; nomes: string[]; cor: (j: number) => string }) {
  const [, tique] = useState(0);
  useEffect(() => { const t = setInterval(() => tique((x) => x + 1), 250); return () => clearInterval(t); }, []);
  const resta = Math.max(0, p.ate - Date.now());
  const meu = p.de === eu;
  const devo = p.faltam.includes(eu);
  // o nome de quem fez cada coisa aparece na cor dele
  const linha = (texto: string) => {
    const t = traduzir(texto);
    const k = nomes.findIndex((n) => t.startsWith(`${n} `) || t.startsWith(`${n}:`));
    return k < 0 ? t : <><b style={{ color: cor(k) }}>{nomes[k]}</b>{t.slice(nomes[k].length)}</>;
  };
  return (
    <div class="pedido-desfazer" role="alertdialog" aria-label="Pedido de desfazer" style={{ '--cor': cor(p.de) }}>
      <div class="pedido-topo">
        <IconeDesfazer />
        <p>{meu ? 'Você pediu para desfazer a última jogada' : <><b>{nomes[p.de]}</b> pede para desfazer a última jogada</>}</p>
      </div>
      {p.linhas.length > 0 && <ol>{p.linhas.map((l, i) => <li key={i} class={l.outro ? 'outro' : ''}>{linha(l.texto)}</li>)}</ol>}
      {!meu && <p class="pedido-sub">Volta para antes dessa jogada, neste turno. Tudo o que veio depois volta junto.</p>}
      <div class="pedido-quem">
        {p.aceitaram.map((i) => <span key={`s${i}`} class="sim">{OK}{nomes[i]} aceitou</span>)}
        {p.faltam.map((i) => <span key={`f${i}`}>{i === eu ? 'Você' : nomes[i]}</span>)}
      </div>
      <div class="pedido-tempo" aria-hidden="true"><span style={{ width: `${Math.min(100, (resta / Math.max(1, p.totalMs)) * 100)}%` }} /></div>
      <div class="botoes-linha">
        {devo && <>
          <button class="botao positivo" onClick={() => loja.enviar({ t: 'desfazerResposta', aceitar: true })}>Aceitar</button>
          <button class="botao perigo" onClick={() => loja.enviar({ t: 'desfazerResposta', aceitar: false })}>Recusar</button>
        </>}
        {meu && <>
          <span class="suave">Esperando a mesa…</span>
          <button class="botao" onClick={() => loja.enviar({ t: 'desfazerCancelar' })}>Cancelar pedido</button>
        </>}
        {!meu && !devo && <span class="suave">Você aceitou. Esperando os outros…</span>}
        <span class="pedido-segundos">{Math.ceil(resta / 1000)} s</span>
      </div>
    </div>
  );
}
