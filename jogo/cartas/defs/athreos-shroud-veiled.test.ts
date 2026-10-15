import { describe, expect, it } from 'vitest';
import { chars, destroy, isCreature } from '../../motor/api.ts';
import { runEffect } from '../../testes/artefatos.ts';
import { setup } from '../../testes/harness.ts';

const ATHREOS = 'Athreos, Shroud-Veiled';

describe(ATHREOS, () => {
  it('com devoção menor que sete, Athreos é encantamento lendário sem o tipo God', () => {
    const tg = setup({ battlefield: [[ATHREOS, 'Mesa Enchantress'], []] });
    const c = chars(tg.g, tg.bf(ATHREOS));
    expect(c.types).toEqual(['Enchantment']);
    expect(c.supertypes).toContain('Legendary');
    expect(c.subtypes).toEqual([]);
  });

  it('com devoção sete ao branco e ao preto, Athreos é criatura', () => {
    // Athreos (2) + Mesa Enchantress (2) + Auramancer (1) + Nightmare Shepherd (2) = 7
    const tg = setup({ battlefield: [[ATHREOS, 'Mesa Enchantress', 'Auramancer', 'Nightmare Shepherd'], []] });
    const id = tg.bf(ATHREOS);
    expect(isCreature(tg.g, id)).toBe(true);
    expect(chars(tg.g, id).subtypes).toEqual(['God']);
  });

  it('a criatura do oponente com marcador de moeda que morre volta sob o seu controle, sem o marcador', () => {
    const tg = setup({ step: 'main2', battlefield: [[ATHREOS], ['Indomitable Ancients']], library: [['Island'], ['Island']] });
    tg.choose('outra criatura alvo', ['Indomitable Ancients']);
    tg.passTo('end');
    tg.resolve();
    const id = tg.bf('Indomitable Ancients');
    expect(tg.state.objects[id].counters.coin).toBe(1);
    runEffect(tg, destroy(tg.g, [id]));
    tg.resolve();
    const nova = tg.find('Indomitable Ancients', 'battlefield', 0)!;
    expect(nova).not.toBeNull();
    expect(tg.state.objects[nova].counters.coin ?? 0).toBe(0);
  });

  it('ficha com marcador de moeda dispara, mas não volta', () => {
    const tg = setup({ battlefield: [[ATHREOS], [{ name: 'Angel', token: true, counters: { coin: 1 } }]] });
    runEffect(tg, destroy(tg.g, [tg.bf('Angel')]));
    expect(tg.state.zones.stack).toHaveLength(1);
    tg.resolve();
    expect(tg.find('Angel')).toBeNull();
  });
});
