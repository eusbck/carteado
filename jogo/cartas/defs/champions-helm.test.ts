import { describe, expect, it } from 'vitest';
import { attach, isLegalTarget, t } from '../../motor/api.ts';
import { fixture as setup } from '../../testes/artefatos.ts';
import type { TestGame } from '../../testes/harness.ts';

const N = "Champion's Helm";

/** o Lightning Bolt do jogador `p` poderia mirar a criatura? */
function miravel(tg: TestGame, p: number, criatura: string): boolean {
  const raio = tg.find('Lightning Bolt', 'hand', p)!;
  return isLegalTarget(tg.g, t.any(), { kind: 'obj', id: tg.bf(criatura) }, p, raio);
}

describe(N, () => {
  it('CR 702.11b: +2/+2; a criatura lendária equipada tem resistência a magia, a não lendária não', () => {
    const tg = setup({ battlefield: [['Plains', N, 'Elvish Mystic', 'Zetalpa, Primal Dawn'], []], hand: [[], ['Lightning Bolt']] });
    tg.choose('criatura alvo', ['Elvish Mystic']).activate(N, 'Equipar').resolve();
    expect(tg.pt(tg.bf('Elvish Mystic'))).toEqual([3, 3]);
    expect(miravel(tg, 1, 'Elvish Mystic')).toBe(true);
    attach(tg.g, tg.bf(N), tg.bf('Zetalpa, Primal Dawn'));
    tg.refresh();
    expect(tg.pt(tg.bf('Zetalpa, Primal Dawn'))).toEqual([6, 10]);
    expect(tg.pt(tg.bf('Elvish Mystic'))).toEqual([1, 1]);
    expect(miravel(tg, 1, 'Zetalpa, Primal Dawn')).toBe(false);
  });

  it('anexado à criatura lendária de um oponente, você é quem não pode escolhê-la como alvo', () => {
    const tg = setup({ battlefield: [[N], ['Zetalpa, Primal Dawn']], hand: [['Lightning Bolt'], ['Lightning Bolt']] });
    attach(tg.g, tg.bf(N), tg.bf('Zetalpa, Primal Dawn'));
    tg.refresh();
    expect(miravel(tg, 0, 'Zetalpa, Primal Dawn')).toBe(false);
    expect(miravel(tg, 1, 'Zetalpa, Primal Dawn')).toBe(true);
  });
});
