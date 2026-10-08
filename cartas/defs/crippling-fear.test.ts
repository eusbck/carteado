import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { addEffect, createTokens } from '../../motor/api.ts';

describe('Crippling Fear', () => {
  it('as criaturas que não são do tipo escolhido recebem -3/-3 até o fim do turno', () => {
    const tg = setup({
      battlefield: [['Swamp', 'Swamp', 'Swamp', 'Swamp', { name: 'Zombie 2/2', token: true }, 'Elvish Mystic'], ['Indomitable Ancients', "Stitcher's Supplier"]],
      hand: [['Crippling Fear'], []], library: [[], ['Island', 'Island', 'Island']],
    });
    tg.choose('escolha um tipo de criatura', ['Zombie']).cast('Crippling Fear').resolve();
    expect(tg.pt(tg.bf('Zombie 2/2'))).toEqual([2, 2]);
    expect(tg.find("Stitcher's Supplier")).not.toBeNull();
    expect(tg.find('Elvish Mystic')).toBeNull();
    expect(tg.pt(tg.bf('Indomitable Ancients'))).toEqual([-1, 7]);
    tg.passUntil((x) => x.state.turn.active === 1);
    expect(tg.pt(tg.bf('Indomitable Ancients'))).toEqual([2, 10]);
  });
  it('o tipo é escolhido na resolução', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Swamp', 'Swamp'], []], hand: [['Crippling Fear'], []] });
    let perguntou = false;
    tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('tipo de criatura') ? (perguntou = true, null) : null));
    tg.cast('Crippling Fear');
    expect(perguntou).toBe(false);
    expect(tg.find('Crippling Fear', 'stack')).not.toBeNull();
    tg.resolve();
    expect(perguntou).toBe(true);
  });
  it('só tipos de criatura existentes aparecem na escolha', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Swamp', 'Swamp'], []], hand: [['Crippling Fear'], []] });
    let opcoes: string[] = [];
    tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('tipo de criatura') ? (opcoes = d.items.map((i) => i.label), { kind: 'select', ids: ['Zombie'] }) : null));
    tg.cast('Crippling Fear').resolve();
    expect(opcoes).toContain('Zombie');
    expect(opcoes).toContain('Elf');
    expect(opcoes).not.toContain('Artifact');
    expect(opcoes).not.toContain('Legendary');
    expect(opcoes).not.toContain('Aura');
    expect(opcoes).not.toContain('Saga');
    expect(opcoes).not.toContain('Swamp');
  });
  it('CR 611.2c: quem entra ou muda de tipo depois não é afetado', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Swamp', 'Swamp', 'Indomitable Ancients'], []], hand: [['Crippling Fear'], []] });
    tg.choose('escolha um tipo de criatura', ['Zombie']).cast('Crippling Fear').resolve();
    const anc = tg.bf('Indomitable Ancients');
    addEffect(tg.g, { source: anc, sourceDef: '', controller: 0, duration: { kind: 'endOfTurn' }, affected: [anc], mods: [{ k: 'addTypes', subtypes: ['Zombie'] }] });
    tg.refresh();
    expect(tg.pt(tg.bf('Indomitable Ancients'))).toEqual([-1, 7]);
    tg.run(createTokens(tg.g, 0, 'Soldier', 1));
    expect(tg.pt(tg.bf('Soldier'))).toEqual([1, 1]);
  });
});
