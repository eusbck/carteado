import { describe, expect, it } from 'vitest';
import { putOntoBattlefield } from '../../motor/api.ts';
import { hasKw } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

const T = 'Terror of Mount Velus';

describe(T, () => {
  it('voar e golpe duplo; ao entrar, as criaturas que você controla ganham golpe duplo até o fim do turno', () => {
    const tg = setup({ battlefield: [['Indomitable Ancients', ...Array(7).fill('Mountain')], ['Wall of Omens']], hand: [[T], []] });
    tg.cast(T).resolveAll();
    const t = tg.bf(T);
    expect(hasKw(tg.g, t, 'flying') && hasKw(tg.g, t, 'double strike')).toBe(true);
    expect(hasKw(tg.g, tg.bf('Indomitable Ancients'), 'double strike')).toBe(true);
    expect(hasKw(tg.g, tg.bf('Wall of Omens'), 'double strike')).toBe(false);
    tg.attack([['Indomitable Ancients', 1]]).passTo('main2');
    expect(tg.life(1)).toBe(36);
    tg.passTo('cleanup');
    expect(hasKw(tg.g, tg.bf('Indomitable Ancients'), 'double strike')).toBe(false);
  });
  it('CR 611.2c: só as criaturas que você controla na resolução ganham golpe duplo', () => {
    const tg = setup({ battlefield: [[], []], hand: [[T, 'Indomitable Ancients'], []] });
    tg.run(putOntoBattlefield(tg.g, [{ id: tg.find(T, 'hand')!, controller: 0 }], 'effect'));
    tg.resolveAll();
    tg.run(putOntoBattlefield(tg.g, [{ id: tg.find('Indomitable Ancients', 'hand')!, controller: 0 }], 'effect'));
    expect(hasKw(tg.g, tg.bf('Indomitable Ancients'), 'double strike')).toBe(false);
  });
  it('CR 702.4e: golpe duplo duas vezes é redundante', () => {
    // um segundo Terror entra: o primeiro (que já tem golpe duplo) ganha outro, e ainda causa dano só duas vezes
    const tg = setup({ battlefield: [[T], []], hand: [[T], []] });
    tg.run(putOntoBattlefield(tg.g, [{ id: tg.find(T, 'hand')!, controller: 0 }], 'effect'));
    tg.resolveAll();
    const primeiro = tg.state.zones.battlefield.find((id) => tg.state.objects[id].def === T && tg.state.objects[id].controlledSince < tg.state.turn.number)!;
    tg.attack([[primeiro, 1]]).passTo('main2');
    expect(tg.life(1)).toBe(30);
  });
});
