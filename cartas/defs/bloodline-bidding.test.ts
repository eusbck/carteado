import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const BB = 'Bloodline Bidding';
const SUP = "Stitcher's Supplier";
const swamps = (n: number) => Array.from({ length: n }, () => 'Swamp');

describe('Bloodline Bidding', () => {
  it('devolve ao campo todas as cartas de criatura do tipo escolhido do seu cemitério', () => {
    const tg = setup({ battlefield: [swamps(8), []], hand: [[BB], []], graveyard: [['Fleshbag Marauder', 'Wall of Limbs', 'Wall of Omens', 'Sol Ring'], ['Stitcher\'s Supplier']] });
    tg.choose('tipo de criatura', ['Zombie']).cast(BB).resolve();
    expect(tg.find('Fleshbag Marauder')).not.toBeNull();
    expect(tg.find('Wall of Limbs')).not.toBeNull();
    expect(tg.find('Wall of Omens')).toBeNull();
    // só do seu cemitério
    expect(tg.names(1, 'graveyard')).toEqual([SUP]);
  });

  it('o tipo de criatura é escolhido na resolução', () => {
    const tg = setup({ battlefield: [swamps(8), []], hand: [[BB], []], graveyard: [['Wall of Omens'], []] });
    let quando = '';
    tg.script.push((d) => { if (d.kind === 'select' && d.prompt.includes('tipo de criatura')) quando = tg.state.zones.stack.length ? 'resolução' : 'conjuração'; return null; });
    tg.choose('tipo de criatura', ['Wall']).cast(BB);
    expect(quando).toBe('');
    tg.resolve();
    expect(quando).toBe('resolução');
    expect(tg.find('Wall of Omens')).not.toBeNull();
  });

  it('CR 702.51a: convoke — criaturas pretas pagam {B}{B} e outras pagam o genérico', () => {
    // só Ilhas: sem as criaturas pretas, não daria para pagar {B}{B}
    const tg = setup({ battlefield: [[...Array.from({ length: 4 }, () => 'Island'), SUP, SUP, 'Wall of Omens', 'Indomitable Ancients'], []], hand: [[BB], []], graveyard: [['Fleshbag Marauder'], []] });
    expect(tg.canCast(BB)).toBe(true);
    tg.choose('Convocar', [SUP, SUP, 'Wall of Omens', 'Indomitable Ancients']).choose('tipo de criatura', ['Zombie']).cast(BB).resolve();
    expect(tg.find('Fleshbag Marauder')).not.toBeNull();
    for (const id of tg.state.zones.battlefield) if (tg.state.objects[id].def !== 'Fleshbag Marauder') expect(tg.state.objects[id].tapped).toBe(true);
  });

  it('só com criaturas, sem terrenos', () => {
    const tg = setup({ battlefield: [Array.from({ length: 8 }, () => SUP), []], hand: [[BB], []] });
    expect(tg.canCast(BB)).toBe(true);
    tg.choose('Convocar', Array.from({ length: 8 }, () => SUP)).choose('tipo de criatura', ['Zombie']).cast(BB).resolve();
    expect(tg.names(0, 'graveyard')).toEqual([BB]);
  });

  it('criatura com enjoo de invocação também ajuda no convoke', () => {
    const tg = setup({ battlefield: [[...swamps(6), { name: SUP, ready: false }, { name: SUP, ready: false }], []], hand: [[BB], []] });
    expect(tg.canCast(BB)).toBe(true);
    tg.choose('Convocar', [SUP, SUP]).choose('tipo de criatura', ['Zombie']).cast(BB).resolve();
    expect(tg.names(0, 'graveyard')).toEqual([BB]);
  });

  it('criatura já virada (por mana ou outra coisa) não ajuda no convoke', () => {
    const tg = setup({ battlefield: [[...swamps(6), { name: SUP, tapped: true }, SUP], []], hand: [[BB], []] });
    expect(tg.canCast(BB)).toBe(false);
  });

  it('sem convocar, paga tudo com mana', () => {
    const tg = setup({ battlefield: [[...swamps(8), SUP], []], hand: [[BB], []] });
    tg.choose('Convocar', []).choose('tipo de criatura', ['Zombie']).cast(BB).resolve();
    expect(tg.state.objects[tg.bf(SUP)].tapped).toBe(false);
    expect(tg.names(0, 'graveyard')).toEqual([BB]);
  });
});
