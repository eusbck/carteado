// Janela por cima de tudo: centralizada na tela, fecha pelo X, pelo Esc e pelo clique fora, e
// rola por dentro quando é mais alta que a tela. É desenhada direto no <body> (portal): dentro de um painel com
// backdrop-filter (os painéis translúcidos das telas de fora da mesa) o fundo fixo ficava preso ao painel e a
// janela saía cortada.

import type { ComponentChildren } from 'preact';
import { createPortal } from 'preact/compat';
import { useEffect, useId, useRef } from 'preact/hooks';
import { IconeFechar } from './icones.tsx';

/** janelas abertas, da mais antiga para a mais nova: o Esc fecha só a de cima */
const abertas: symbol[] = [];

export interface JanelaProps {
  titulo: ComponentChildren;
  /** nome para leitores de tela, quando o título não é texto simples */
  rotulo?: string;
  fechar: () => void;
  children: ComponentChildren;
  larga?: boolean;
  classe?: string;
  /** some sem perder o que já foi preenchido (ex.: enquanto você escolhe uma carta na mesa) */
  escondida?: boolean;
}

export function Janela({ titulo, rotulo, fechar, children, larga, classe, escondida }: JanelaProps) {
  const id = useId();
  const caixa = useRef<HTMLDivElement>(null);
  const eu = useRef(Symbol('janela'));
  const fecharAtual = useRef(fechar);
  fecharAtual.current = fechar;
  // o clique só fecha se começou e terminou fora da caixa (arrastar uma seleção não fecha)
  const comecouFora = useRef(false);

  useEffect(() => {
    if (escondida) return;
    const marca = eu.current;
    abertas.push(marca);
    const antes = document.activeElement as HTMLElement | null;
    caixa.current?.focus({ preventScroll: true });
    const tecla = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || abertas[abertas.length - 1] !== marca) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      fecharAtual.current();
    };
    addEventListener('keydown', tecla, true);
    return () => {
      removeEventListener('keydown', tecla, true);
      abertas.splice(abertas.indexOf(marca), 1);
      if (antes?.isConnected) antes.focus({ preventScroll: true });
    };
  }, [escondida]);

  return createPortal(
    <div class={`janela-fundo ${escondida ? 'escondido' : ''}`}
      onPointerDown={(e) => { comecouFora.current = e.target === e.currentTarget; }}
      onClick={(e) => { if (comecouFora.current && e.target === e.currentTarget) fechar(); comecouFora.current = false; }}>
      <div ref={caixa} class={`janela-caixa ${larga ? 'larga' : ''} ${classe ?? ''}`} role="dialog" aria-modal="true"
        aria-labelledby={rotulo ? undefined : id} aria-label={rotulo} tabIndex={-1}>
        <header class="janela-topo">
          <h2 id={id}>{titulo}</h2>
          <button type="button" class="botao icone fantasma janela-x" aria-label="Fechar" title="Fechar (Esc)" onClick={fechar}><IconeFechar /></button>
        </header>
        <div class="janela-corpo">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
