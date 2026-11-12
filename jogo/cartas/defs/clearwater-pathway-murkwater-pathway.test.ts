import { describe, expect, it } from 'vitest';
import { manaOptions } from '../../motor/costs.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Clearwater Pathway // Murkwater Pathway';

function joga(face: string): string[] {
  const tg = setup({ hand: [[N], []] });
  tg.settle();
  const d = tg.pending!;
  if (d.kind !== 'priority') throw new Error('sem prioridade');
  const acao = d.actions.find((a) => a.label === `Jogar ${face}`)!;
  tg.answer({ kind: 'priority', action: acao.id });
  tg.settle();
  const id = tg.bf(N);
  expect(tg.state.objects[id].tapped).toBe(false);
  return manaOptions(tg.g, 0).filter((o) => o.obj === id).map((o) => o.alt.join(''));
}

describe(N, () => {
  it('CR 712.11c — jogar olha só a face escolhida: frente dá {U}, verso dá {B}', () => {
    expect(joga('Clearwater Pathway')).toEqual(['U']);
    expect(joga('Murkwater Pathway')).toEqual(['B']);
  });
});
