import { describe, expect, it } from 'vitest';
import { setup, type TestGame } from '../../testes/harness.ts';

const H = "Herald's Horn";
/** a trombeta já no campo com o tipo escolhido (null = sem tipo) */
function comTipo(tg: TestGame, tipo: string | null): TestGame {
  if (tipo) tg.state.objects[tg.bf(H)].choices.creatureType = tipo;
  return tg.refresh();
}
const ateManutencao = (tg: TestGame) => tg.passUntil((x) => x.state.turn.active === 0 && x.state.turn.step === 'upkeep');

describe(H, () => {
  it('só tipos de criatura existentes aparecem na escolha, um de cada vez', () => {
    const tg = setup({ battlefield: [['Sol Ring', 'Plains'], []], hand: [[H], []] });
    let labels: string[] = [];
    let max = 0;
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('tipo de criatura')) return null;
      labels = d.items.map((i) => i.label);
      max = d.max;
      return { kind: 'select', ids: ['Wall'] };
    });
    tg.cast(H).resolve();
    expect(labels).toContain('Wall');
    expect(labels).not.toContain('Artifact');
    expect(labels).not.toContain('Cat Warrior');
    expect(max).toBe(1);
    expect(tg.state.objects[tg.bf(H)].choices.creatureType).toBe('Wall');
  });
  it('mágicas de criatura do tipo escolhido custam {1} a menos', () => {
    const tg = comTipo(setup({ battlefield: [[H, 'Plains'], []], hand: [['Wall of Omens'], []], library: [['Island'], []] }), 'Wall');
    tg.cast('Wall of Omens').resolveAll();
    expect(tg.find('Wall of Omens')).not.toBeNull();
  });
  it('só reduz a parte genérica do custo', () => {
    // Elvish Mystic custa {G}: sem mana genérica, não fica de graça
    const tg = comTipo(setup({ battlefield: [[H], []], hand: [['Elvish Mystic'], []] }), 'Elf');
    expect(tg.canCast('Elvish Mystic')).toBe(false);
  });
  it('criatura de outro tipo e mágica de oponente não ficam mais baratas', () => {
    const tg = comTipo(setup({ battlefield: [[H, 'Plains'], []], hand: [['Wall of Omens'], []] }), 'Elf');
    expect(tg.canCast('Wall of Omens')).toBe(false);
    const tg2 = comTipo(setup({ active: 1, battlefield: [[H], ['Plains']], hand: [[], ['Wall of Omens']] }), 'Wall');
    expect(tg2.canCast('Wall of Omens')).toBe(false);
  });
  it('na manutenção: criatura do tipo escolhido no topo pode ser revelada e ir para a mão', () => {
    const tg = comTipo(setup({ step: 'end', active: 1, battlefield: [[H], []], library: [['Wall of Omens', 'Island'], ['Island', 'Island']] }), 'Wall');
    tg.yes("Herald's Horn: revelar", true);
    ateManutencao(tg).resolve();
    expect(tg.names(0, 'hand')).toEqual(['Wall of Omens']);
    expect(tg.names(0, 'library')).toEqual(['Island']);
  });
  it('sem pôr na mão, a carta fica no topo e é comprada na etapa de compra', () => {
    const tg = comTipo(setup({ step: 'end', active: 1, battlefield: [[H], []], library: [['Wall of Omens', 'Island'], ['Island', 'Island']] }), 'Wall');
    tg.yes("Herald's Horn: revelar", false);
    ateManutencao(tg).resolve();
    expect(tg.names(0, 'library')).toEqual(['Wall of Omens', 'Island']);
    tg.passTo('main1');
    expect(tg.names(0, 'hand')).toEqual(['Wall of Omens']);
  });
  it('carta do topo de outro tipo (ou que não é criatura) não é oferecida', () => {
    const tg = comTipo(setup({ step: 'end', active: 1, battlefield: [[H], []], library: [['Elvish Mystic', 'Island'], ['Island', 'Island']] }), 'Wall');
    let perguntou = false;
    tg.script.push((d) => { if (d.kind === 'select' && d.prompt.includes('revelar')) perguntou = true; return null; });
    ateManutencao(tg).resolve();
    expect(perguntou).toBe(false);
    expect(tg.names(0, 'library')).toEqual(['Elvish Mystic', 'Island']);
  });
  it('sem tipo escolhido, nada fica mais barato e nada vai para a mão', () => {
    const tg = comTipo(setup({ battlefield: [[H, 'Plains'], []], hand: [['Wall of Omens'], []] }), null);
    expect(tg.canCast('Wall of Omens')).toBe(false);
    const tg2 = comTipo(setup({ step: 'end', active: 1, battlefield: [[H], []], library: [['Wall of Omens', 'Island'], ['Island', 'Island']] }), null);
    let perguntou = false;
    tg2.script.push((d) => { if (d.kind === 'select' && d.prompt.includes('revelar')) perguntou = true; return null; });
    ateManutencao(tg2).resolve();
    expect(perguntou).toBe(false);
    expect(tg2.names(0, 'library')).toEqual(['Wall of Omens', 'Island']);
  });
});
