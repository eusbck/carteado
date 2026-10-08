import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { manaOptions } from '../../motor/costs.ts';

describe('Channeler Initiate', () => {
  it('entra pondo três -1/-1 nela mesma e vira mana de qualquer cor removendo um', () => {
    const tg = setup({ battlefield: [['Forest', 'Forest'], []], hand: [['Channeler Initiate'], []] });
    tg.choose('criatura alvo que você controla', ['Channeler Initiate']).cast('Channeler Initiate').resolve().resolve();
    const ci = tg.bf('Channeler Initiate');
    expect(tg.pt(ci)).toEqual([0, 1]);
    tg.state.objects[ci].controlledSince = 0;
    tg.refresh();
    expect(manaOptions(tg.g, 0).filter((o) => o.obj === ci).length).toBe(5);
  });
  it('sem marcador, não produz mana', () => {
    const tg = setup({ battlefield: [['Channeler Initiate'], []] });
    expect(manaOptions(tg.g, 0).filter((o) => o.obj === tg.bf('Channeler Initiate')).length).toBe(0);
  });
});
