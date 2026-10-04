// Auxiliares de teste para padrões comuns de cartas (terrenos, palavras-chave, mana).

import { manaOptions } from '../motor/costs.ts';
import { chars, hasKw } from '../motor/chars.ts';
import { setup, type CardSpec, type TestGame } from './harness.ts';

type Spec = string | CardSpec;

/** alternativas de mana que a carta no campo oferece (ex.: ['R', 'W'] ou ['UU', 'UR', 'RR']) */
export function alternativasDeMana(nome: string, campo: Spec[] = []): string[] {
  const tg = setup({ battlefield: [[nome, ...campo], []] });
  const id = tg.bf(nome);
  const alts = manaOptions(tg.g, 0).filter((o) => o.obj === id).map((o) => o.alt.join(''));
  return [...new Set(alts)].sort();
}

/** joga o terreno da mão (ou conjura a permanente) e diz se entrou virado */
export function entraVirado(nome: string, campo: Spec[] = [], mao: Spec[] = [], revelar = true, campoOponente: Spec[] = []): boolean {
  const tg = setup({ battlefield: [campo, campoOponente], hand: [[nome, ...mao], []] });
  tg.yes('Revelar', revelar);
  tg.play(nome);
  return tg.state.objects[tg.bf(nome, 0)].tapped;
}

export function temPalavrasChave(nome: string, ...kws: string[]): boolean {
  const tg = setup({ battlefield: [[nome], []] });
  const id = tg.bf(nome);
  return kws.every((k) => hasKw(tg.g, id, k));
}

export function forcaResistencia(nome: string): [number | null, number | null] {
  const tg = setup({ battlefield: [[nome], []] });
  const c = chars(tg.g, tg.bf(nome));
  return [c.power, c.toughness];
}

/** joga o terreno e devolve o jogo para inspeção */
export function jogarTerreno(nome: string, opts: { campo?: Spec[]; mao?: Spec[]; grimorio?: Spec[] } = {}): TestGame {
  const tg = setup({ battlefield: [opts.campo ?? [], []], hand: [[nome, ...(opts.mao ?? [])], []], library: [opts.grimorio ?? [], []] });
  tg.play(nome);
  return tg;
}

export { setup };
