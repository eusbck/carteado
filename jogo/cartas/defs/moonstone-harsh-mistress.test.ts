import { describe, expect, it } from 'vitest';
import { discard } from '../../motor/api.ts';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup, runEffect } from '../../testes/artefatos.ts';

const N = 'Moonstone, Harsh Mistress';
const lib = Array(10).fill('Island');
const podeJogar = (tg: ReturnType<typeof setup>, id: number) => tg.actionIds().some((a) => /^(cast|play):/.test(a) && a.split(':').includes(String(id)));

describe(N, () => {
  it('voar; a carta descartada pode ser exilada e jogada até o fim do seu próximo turno', () => {
    const tg = setup({ battlefield: [[N, 'Island'], []], hand: [['Sol Ring'], []], library: [lib, lib] });
    const id = tg.bf(N);
    expect(tg.pt(id)).toEqual([2, 4]);
    expect(hasKw(tg.g, id, 'flying')).toBe(true);
    tg.yes('Moonstone', true);
    runEffect(tg, discard(tg.g, 0, 1));
    tg.resolveAll();
    expect(tg.names(0, 'exile')).toEqual(['Sol Ring']);
    const anel = tg.state.zones.exile[0];
    expect(podeJogar(tg, anel)).toBe(true);
    // ainda vale no seu próximo turno
    tg.passTo('main1', 1);
    tg.passTo('main1', 0);
    expect(podeJogar(tg, anel)).toBe(true);
    // e acaba depois dele
    tg.passTo('main1', 1);
    tg.passTo('main1', 0);
    expect(podeJogar(tg, anel)).toBe(false);
  });

  it('é opcional: recusando, a carta fica no cemitério', () => {
    const tg = setup({ battlefield: [[N], []], hand: [['Sol Ring'], []], library: [lib, lib] });
    tg.yes('Moonstone', false);
    runEffect(tg, discard(tg.g, 0, 1));
    tg.resolveAll();
    expect(tg.names(0, 'graveyard')).toEqual(['Sol Ring']);
  });
});
