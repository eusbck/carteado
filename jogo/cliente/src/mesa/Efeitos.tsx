// Efeitos que todos veem: o ataque declarado (investida), o dano de combate (golpe: a carta recua, dispara, congela no
// impacto; clarão, onda, risco, lascas e o tranco da mesa), dano e vida (números, tremida e brilho na vida), criaturas
// que saem do campo voando para o cemitério ou o exílio, e os sons de cada coisa. Tudo sai da diferença entre uma vista
// e a seguinte, então vale também para as jogadas dos outros. O plano do combate é golpes.ts; a tela, impacto.ts (com as
// regras de desempenho: só transform e opacity animam, tudo agendado de uma vez numa camada que não treme).

import { useLayoutEffect, useRef } from 'preact/hooks';
import type { GameView } from '../../../motor/view.ts';
import { abafarMusica } from '../musica.ts';
import { preferencias } from '../preferencias.ts';
import { somDaTroca } from '../somTurno.ts';
import { tocar } from '../sons.ts';
import { planejarCombate } from './golpes.ts';
import { efeitosDaVista, fotografar, type Foto } from './impacto.ts';
import './efeitos.css';

const movimentoReduzido = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Liga os efeitos e os sons à vista da partida. `efeitos` desliga só a parte visual (os sons têm
 * as próprias chaves); "reduzir movimento" do sistema tira tremidas e deslocamentos.
 */
export function useEfeitos(v: GameView, eu: number, efeitos: boolean): void {
  const anterior = useRef<GameView | null>(null);
  /** onde estava cada criatura na vista de antes (a que sair voa dali; o atacante que morreu golpeia dali) */
  const fotos = useRef(new Map<number, Foto>());

  useLayoutEffect(() => {
    const a = anterior.current;
    anterior.current = v;
    // só as criaturas e só com os efeitos visuais ligados: medir todas as cartas a cada mensagem forçava o layout da
    // mesa inteira mesmo quando nenhum efeito ia rodar
    const fotografarSeLigado = () => (efeitos && !document.hidden ? fotografar(v) : new Map<number, Foto>());
    if (!a || a === v) { fotos.current = fotografarSeLigado(); return; }

    // troca de turno: o som do seu turno ou o de adversário, decidido pelo assento deste navegador
    const somTurno = somDaTroca(a.turn, v.turn, eu, preferencias().sons);
    if (somTurno) tocar(somTurno === 'meu' ? 'turnoMeu' : 'turnoAdversario');
    // o aviso do seu turno passa por cima da música: ela abaixa por um instante
    if (somTurno === 'meu' && preferencias().volume > 0) abafarMusica();

    const plano = planejarCombate(a, v);
    const antes = fotos.current;
    // as fotos desta vista são lidas junto com as medidas dos efeitos, antes de qualquer elemento novo (um layout só)
    fotos.current = fotografarSeLigado();
    efeitosDaVista(a, v, plano, antes, { eu, reduzir: movimentoReduzido(), leve: preferencias().desempenho, efeitos });
  }, [v]);
}
