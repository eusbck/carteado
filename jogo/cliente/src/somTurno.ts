// Qual som de troca de turno toca neste navegador: "seu turno" (chama atenção) quando o novo turno é
// de quem está nesta cadeira, "turno de um adversário" (discreto) quando é de outro jogador, humano
// ou bot. Cada navegador decide pelo próprio assento. Função pura (sem áudio nem DOM), testada em
// testes/fase9-sons.test.ts.

export type SomTurno = 'meu' | 'adversario';

export interface TurnoVisto {
  /** número do turno (0 durante a mão inicial) */
  number: number;
  /** jogador do turno */
  active: number;
}

/**
 * O som da troca entre a vista anterior e a nova, do ponto de vista de `eu`; null se não começou
 * um turno novo (a primeira vista ao entrar ou reconectar não toca nada) ou se o som está desligado
 * nas Configurações. Um turno extra do mesmo jogador também conta como turno novo.
 */
export function somDaTroca(anterior: TurnoVisto | null, novo: TurnoVisto, eu: number | null, sons: { turnoMeu: boolean; turnoAdversario: boolean }): SomTurno | null {
  if (!anterior || novo.number <= anterior.number || novo.number < 1) return null;
  if (eu !== null && novo.active === eu) return sons.turnoMeu ? 'meu' : null;
  return sons.turnoAdversario ? 'adversario' : null;
}
