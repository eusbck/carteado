import { describe, expect, it } from 'vitest';
import { createTokens, destroy, putOntoBattlefield } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

const W = 'Warstorm Surge';

describe(W, () => {
  it('criatura sua entra: causa dano igual à força dela a qualquer alvo', () => {
    const tg = setup({ battlefield: [[W], ['Wall of Omens']], hand: [['Indomitable Ancients'], []] });
    tg.choose('qualquer alvo', ['Bruno']);
    tg.run(putOntoBattlefield(tg.g, [{ id: tg.find('Indomitable Ancients', 'hand')!, controller: 0 }], 'effect'));
    tg.resolveAll();
    expect(tg.life(1)).toBe(38);
  });
  it('criatura de oponente e criatura de força 0 não causam dano', () => {
    const tg = setup({ battlefield: [[W], []], hand: [['Wall of Omens'], ['Indomitable Ancients']], library: [['Island'], []] });
    tg.run(putOntoBattlefield(tg.g, [{ id: tg.find('Indomitable Ancients', 'hand')!, controller: 1 }], 'effect'));
    tg.settle();
    expect(tg.state.zones.stack).toHaveLength(0);
    tg.choose('qualquer alvo', ['Bruno']);
    tg.run(putOntoBattlefield(tg.g, [{ id: tg.find('Wall of Omens', 'hand')!, controller: 0 }], 'effect'));
    tg.resolveAll();
    expect(tg.life(1)).toBe(40);
  });
  it('a criatura é a fonte do dano: vínculo com a vida conta mesmo fora do campo', () => {
    const tg = setup({ battlefield: [[W], []] });
    tg.choose('qualquer alvo', ['Bruno']);
    tg.run(createTokens(tg.g, 0, 'Moogle', 1));
    tg.settle();
    tg.run(destroy(tg.g, [tg.bf('Moogle')]));
    tg.resolveAll();
    expect(tg.life(1)).toBe(39);
    expect(tg.life(0)).toBe(41);
  });
  it('fora do campo, usa a última força conhecida', () => {
    const tg = setup({ battlefield: [[W], []], hand: [['Indomitable Ancients'], []] });
    tg.choose('qualquer alvo', ['Bruno']);
    tg.run(putOntoBattlefield(tg.g, [{ id: tg.find('Indomitable Ancients', 'hand')!, controller: 0 }], 'effect'));
    tg.settle();
    tg.run(destroy(tg.g, [tg.bf('Indomitable Ancients')]));
    tg.resolveAll();
    expect(tg.life(1)).toBe(38);
  });
});
