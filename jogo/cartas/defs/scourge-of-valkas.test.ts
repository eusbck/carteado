import { describe, expect, it } from 'vitest';
import { destroy, putOntoBattlefield } from '../../motor/api.ts';
import { hasKw } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

const S = 'Scourge of Valkas';

describe(S, () => {
  it('voar; ao entrar, causa X de dano a qualquer alvo, X = Dragons que você controla', () => {
    const tg = setup({ battlefield: [[...Array(5).fill('Mountain'), 'Rapacious Dragon'], []], hand: [[S], []] });
    tg.choose('qualquer alvo', ['Bruno']).cast(S).resolveAll();
    expect(hasKw(tg.g, tg.bf(S), 'flying')).toBe(true);
    expect(tg.life(1)).toBe(38);
  });
  it('outro Dragon seu entra: ele causa X de dano; criatura que não é Dragon ou Dragon de oponente não dispara', () => {
    const tg = setup({ battlefield: [[S], []], hand: [['Rapacious Dragon', 'Wall of Omens'], ['Thunderbreak Regent']], library: [['Island'], []] });
    tg.choose('qualquer alvo', ['Bruno']);
    tg.run(putOntoBattlefield(tg.g, [{ id: tg.find('Rapacious Dragon', 'hand')!, controller: 0 }], 'effect'));
    tg.resolveAll();
    expect(tg.life(1)).toBe(38);
    tg.run(putOntoBattlefield(tg.g, [{ id: tg.find('Wall of Omens', 'hand')!, controller: 0 }], 'effect'));
    tg.run(putOntoBattlefield(tg.g, [{ id: tg.find('Thunderbreak Regent', 'hand')!, controller: 1 }], 'effect'));
    tg.resolveAll();
    expect(tg.life(1)).toBe(38);
  });
  it('X é contado na resolução', () => {
    const tg = setup({ battlefield: [[...Array(5).fill('Mountain'), 'Rapacious Dragon'], []], hand: [[S], []] });
    tg.choose('qualquer alvo', ['Bruno']).cast(S).resolve();
    expect(tg.state.zones.stack).toHaveLength(1);
    tg.run(destroy(tg.g, [tg.bf('Rapacious Dragon')]));
    tg.resolveAll();
    expect(tg.life(1)).toBe(39);
  });
  it('o Dragon que entrou causa o dano mesmo fora do campo', () => {
    const tg = setup({ battlefield: [[S], []], hand: [['Rapacious Dragon'], []] });
    tg.choose('qualquer alvo', ['Bruno']);
    tg.run(putOntoBattlefield(tg.g, [{ id: tg.find('Rapacious Dragon', 'hand')!, controller: 0 }], 'effect'));
    tg.settle();
    tg.run(destroy(tg.g, [tg.bf('Rapacious Dragon')]));
    tg.resolveAll();
    expect(tg.life(1)).toBe(39);
  });
  it('{R}: recebe +1/+0 até o fim do turno', () => {
    const tg = setup({ battlefield: [[S, 'Mountain', 'Mountain'], []] });
    tg.activate(S, '+1/+0').resolve().activate(S, '+1/+0').resolve();
    expect(tg.pt(tg.bf(S))).toEqual([6, 4]);
  });
});
