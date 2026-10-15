import { describe, expect, it } from 'vitest';
import { isType } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

const SALA = 'Secret Arcade // Dusty Parlor';
const abre = (porta: number) => (t: ReturnType<typeof setup>) => { const id = t.bf(SALA); t.state.objects[id].face = porta; t.g.bump(); t.refresh(); };

describe(SALA, () => {
  it('Secret Arcade: as suas permanentes não terreno e as suas mágicas de permanente são encantamentos', () => {
    const tg = setup({ battlefield: [[SALA, 'Wall of Omens', 'Plains', 'Sol Ring'], ['Indomitable Ancients']], hand: [['Burnished Hart'], []], library: [['Island'], []], onStart: abre(0) });
    expect(isType(tg.g, tg.bf('Wall of Omens'), 'Enchantment')).toBe(true);
    expect(isType(tg.g, tg.bf('Wall of Omens'), 'Creature')).toBe(true);
    expect(isType(tg.g, tg.bf('Plains'), 'Enchantment')).toBe(false);
    expect(isType(tg.g, tg.bf('Indomitable Ancients'), 'Enchantment')).toBe(false);
    tg.cast('Burnished Hart');
    expect(isType(tg.g, tg.find('Burnished Hart', 'stack')!, 'Enchantment')).toBe(true);
  });

  it('Dusty Parlor: conjurar um encantamento põe marcadores iguais ao valor de mana dele', () => {
    const tg = setup({ battlefield: [[SALA, 'Wall of Omens', 'Plains', 'Plains', 'Plains'], []], hand: [['Ghostly Prison'], []], onStart: abre(1) });
    tg.choose('criatura alvo', ['Wall of Omens']);
    tg.cast('Ghostly Prison').resolve();
    expect(tg.state.objects[tg.bf('Wall of Omens')].counters['+1/+1']).toBe(3);
  });

  it('com as duas portas, a mágica de criatura vira mágica de encantamento e dispara Dusty Parlor', () => {
    const tg = setup({ battlefield: [[SALA, 'Indomitable Ancients', 'Sol Ring', 'Plains'], []], hand: [['Burnished Hart'], []], onStart: abre(2) });
    tg.choose('criatura alvo', ['Indomitable Ancients']);
    tg.cast('Burnished Hart').resolve();
    expect(tg.state.objects[tg.bf('Indomitable Ancients')].counters['+1/+1']).toBe(3);
  });
});
