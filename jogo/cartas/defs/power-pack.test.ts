import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Power Pack';
const lib = Array(12).fill('Forest');

describe(N, () => {
  it('voar, vigilância, atropelar e ímpeto', () => {
    const tg = setup({ battlefield: [[N], []] });
    const id = tg.bf(N);
    expect(tg.pt(id)).toEqual([4, 4]);
    for (const kw of ['flying', 'vigilance', 'trample', 'haste']) expect(hasKw(tg.g, id, kw)).toBe(true);
  });

  it('exila uma mágica instantânea ou de feitiço do seu cemitério; na sua próxima manutenção você a conjura de graça e ela é exilada', () => {
    // Cut a Deal é a única candidata; Elvish Mystic no cemitério não conta
    const tg = setup({ battlefield: [[N], []], graveyard: [['Cut a Deal', 'Elvish Mystic'], []], library: [lib, lib] });
    tg.yes('Power Pack', true);
    tg.attack([[N, 1]]).passTo('main2', 0);
    expect(tg.life(1)).toBe(36);
    expect(tg.names(0, 'exile')).toEqual(['Cut a Deal']);
    expect(tg.names(0, 'graveyard')).toEqual(['Elvish Mystic']);
    // não é conjurada na manutenção do oponente
    tg.passTo('main1', 1);
    expect(tg.names(0, 'exile')).toEqual(['Cut a Deal']);
    const mao1 = tg.names(1, 'hand').length;
    tg.passTo('main1', 0);
    // Cut a Deal resolveu: o oponente comprou uma carta
    expect(tg.names(1, 'hand')).toHaveLength(mao1 + 1);
    expect(tg.names(0, 'exile')).toEqual(['Cut a Deal']);
    expect(tg.names(0, 'graveyard')).toEqual(['Elvish Mystic']);
  });

  it('sem mágica instantânea nem de feitiço no cemitério, nada é exilado', () => {
    const tg = setup({ battlefield: [[N], []], graveyard: [['Elvish Mystic'], []], library: [lib, lib] });
    tg.attack([[N, 1]]).passTo('main2', 0);
    expect(tg.names(0, 'exile')).toEqual([]);
  });
});
