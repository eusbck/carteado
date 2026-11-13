// A faixa da troca de turno (N7): "Vez de Ana · Rodada 5" atravessa a mesa por cerca de 1,2 s quando o turno muda,
// sem parar o jogo (não pega clique). Só transform e opacity animam (turno.css). No modo Desempenho, um fade curto;
// com "reduzir movimento" do sistema, nada. A primeira vista que a mesa mostra (entrar, voltar) não tem faixa.
// Na fila de cenas (eventos-4) ela vira o passo "turno".

import { useEffect, useRef, useState } from 'preact/hooks';
import { preferencias } from '../preferencias.ts';
import './turno.css';

/** quanto a faixa fica na tela (a animação de turno.css dura isso) */
export const FAIXA_TURNO_MS = 1200;
/** no modo Desempenho, só o fade */
const FAIXA_LEVE_MS = 700;

interface Faixa { chave: number; nome: string | null; rodada: number; cor: string; leve: boolean }

/** `nome`: de quem é a vez (null: a sua, "Sua vez") */
export function FaixaTurno({ turno, rodada, nome, cor }: { turno: number; rodada: number; nome: string | null; cor: string }) {
  const [faixa, setFaixa] = useState<Faixa | null>(null);
  const antes = useRef(turno);
  useEffect(() => {
    const anterior = antes.current;
    antes.current = turno;
    // só quando o turno anda (antes da 1ª rodada, na volta de um desfazer ou na mesma vista, nada); a faixa que estava
    // na tela sai junto (o relógio dela foi cancelado na troca)
    const reduzir = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (turno <= anterior || turno === 0 || reduzir || (typeof document !== 'undefined' && document.hidden)) { setFaixa(null); return; }
    const leve = preferencias().desempenho;
    setFaixa({ chave: turno, nome, rodada, cor, leve });
    // sai no animationend da fita; o relógio (com folga) é só a rede, se a animação não terminar (aba escondida…)
    const t = setTimeout(() => setFaixa((f) => (f?.chave === turno ? null : f)), (leve ? FAIXA_LEVE_MS : FAIXA_TURNO_MS) + 400);
    return () => clearTimeout(t);
  }, [turno]);
  if (!faixa) return null;
  return (
    <div key={faixa.chave} class={`faixa-turno ${faixa.leve ? 'leve' : ''}`} onAnimationEnd={() => setFaixa((f) => (f?.chave === faixa.chave ? null : f))} style={{ '--cor': faixa.cor }} role="status" aria-live="polite">
      <div class="faixa-turno-fita">
        {faixa.nome === null ? <span><b>Sua vez</b></span> : <span>Vez de <b>{faixa.nome}</b></span>}<span class="faixa-turno-ponto" aria-hidden="true">·</span><span>Rodada {faixa.rodada}</span>
      </div>
    </div>
  );
}
