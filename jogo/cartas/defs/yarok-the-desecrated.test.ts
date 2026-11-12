import { describe, expect, it } from 'vitest';
import { putOntoBattlefield } from '../../motor/api.ts';
import { runEffect } from '../../testes/artefatos.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Yarok, the Desecrated';

describe(N, () => {
  it('o gatilho de entrar de uma criatura sua dispara duas vezes', () => {
    const tg = setup({ battlefield: [[N, 'Plains', 'Plains'], []], hand: [['Wall of Omens'], []], library: [['Hex', 'Hex', 'Hex'], []] });
    tg.cast('Wall of Omens').resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Hex', 'Hex']);
  });
  it('com outro efeito igual (Ancient Greenwarden), o gatilho dispara três vezes', () => {
    const tg = setup({ battlefield: [[N, 'Ancient Greenwarden', 'Tatyova, Benthic Druid'], []], hand: [['Forest'], []], library: [['Hex', 'Hex', 'Hex'], []] });
    tg.play('Forest').resolveAll();
    expect(tg.life(0)).toBe(43);
    expect(tg.names(0, 'hand')).toEqual(['Hex', 'Hex', 'Hex']);
  });
  it('a aterragem dispara a mais; o permanente que entra pode ser de qualquer jogador, basta o gatilho ser seu', () => {
    const tg = setup({ battlefield: [[N, 'Tatyova, Benthic Druid'], []], hand: [['Forest'], []], library: [['Hex', 'Hex', 'Hex'], []] });
    tg.play('Forest').resolveAll();
    expect(tg.life(0)).toBe(42);
    expect(tg.names(0, 'hand')).toEqual(['Hex', 'Hex']);
  });
  it('um permanente que entra junto com Yarok também dispara a mais', () => {
    const tg = setup({ hand: [[N, 'Wall of Omens'], []], library: [['Hex', 'Hex', 'Hex'], []] });
    const ids = [N, 'Wall of Omens'].map((n) => tg.find(n, 'hand')!);
    runEffect(tg, putOntoBattlefield(tg.g, ids.map((id) => ({ id, controller: 0 })), 'effect'));
    tg.resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Hex', 'Hex']);
  });
});
