import { describe, expect, it } from 'vitest';
import { alternativasDeMana, setup } from '../../testes/padroes.ts';
import { chars, hasKw } from '../../motor/api.ts';

const NOME = 'The Great Mound';

describe(NOME, () => {
  it('CR 605: mana que produz', () => expect(alternativasDeMana(NOME)).toEqual(['C']));
  it('{3}, {T}: cria uma ficha de Vibranium virada (artefato indestrutível)', () => {
    const tg = setup({ battlefield: [[NOME, 'Sol Ring', 'Island'], []] });
    tg.activate(NOME, 'Vibranium').resolve();
    const v = tg.bf('Vibranium');
    expect(tg.state.objects[v].isToken).toBe(true);
    expect(tg.state.objects[v].tapped).toBe(true);
    expect(chars(tg.g, v).types).toEqual(['Artifact']);
    expect(hasKw(tg.g, v, 'indestructible')).toBe(true);
  });
  it('a mana do Vibranium paga mágica de artefato, mas não outras mágicas', () => {
    const tg = setup({ battlefield: [[{ name: 'Vibranium', token: true }], []], hand: [['Sol Ring', 'Wall of Omens'], []] });
    expect(tg.canCast('Sol Ring')).toBe(true);
    // Wall of Omens custa {1}{W}: mesmo com uma Plains, o {1} não pode vir do Vibranium
    const t2 = setup({ battlefield: [[{ name: 'Vibranium', token: true }, 'Plains'], []], hand: [['Wall of Omens'], []] });
    expect(t2.canCast('Wall of Omens')).toBe(false);
  });
  it('{6}, {T}: compre uma carta', () => {
    const tg = setup({ battlefield: [[NOME, 'Sol Ring', 'Sol Ring', 'Sol Ring'], []], library: [['Island'], []] });
    tg.activate(NOME, 'Compre').resolve();
    expect(tg.names(0, 'hand')).toEqual(['Island']);
  });
});
