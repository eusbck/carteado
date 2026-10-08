import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Viscera Seer', () => {
  it('sacrifica uma criatura: vidência 1', () => {
    const tg = setup({ battlefield: [['Viscera Seer', 'Wall of Omens'], []], library: [['Island', 'Forest'], []] });
    tg.script.push((d) => (d.kind === 'arrange' ? { kind: 'arrange', placement: Object.fromEntries(d.items.map((i) => [i.id, 'bottom'])), order: d.items.map((i) => i.id) } : null));
    tg.choose('Sacrifique', ['Wall of Omens']).activate('Viscera Seer').resolve();
    expect(tg.names(0, 'library')).toEqual(['Forest', 'Island']);
  });
  it('pode sacrificar a si mesmo para a própria habilidade', () => {
    const tg = setup({ battlefield: [['Viscera Seer'], []], library: [['Island'], []] });
    tg.choose('Sacrifique', ['Viscera Seer']).activate('Viscera Seer').resolve();
    expect(tg.names(0, 'graveyard')).toEqual(['Viscera Seer']);
  });
  it('CR 506.4: criatura atacante sacrificada antes do dano não causa dano', () => {
    const tg = setup({ step: 'beginCombat', battlefield: [['Viscera Seer', 'Indomitable Ancients'], []], library: [['Island'], []] });
    tg.attack([['Indomitable Ancients', 1]]);
    tg.passTo('declareAttackers');
    tg.choose('Sacrifique', ['Indomitable Ancients']).activate('Viscera Seer').resolve();
    tg.passTo('main2');
    expect(tg.life(1)).toBe(40);
  });
});
