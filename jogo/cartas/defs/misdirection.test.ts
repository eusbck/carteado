import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Misdirection';

describe(N, () => {
  it('muda o alvo de uma mágica do oponente para outra criatura (exilando uma carta azul da mão)', () => {
    const tg = setup({ active: 1, battlefield: [['Spellseeker'], ['Mountain', 'Elvish Mystic']], hand: [[N, 'Opt'], ['Lightning Bolt']] });
    tg.choose('qualquer alvo', ['Spellseeker']).cast('Lightning Bolt').pass();
    let novos: string[] = [];
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('Mudar os alvos')) return null;
      novos = d.items.map((i) => i.label);
      return { kind: 'select', ids: [d.items.find((i) => i.label === 'Elvish Mystic')!.id] };
    });
    tg.cast(N, 'desvio').resolveAll();
    expect(novos).not.toContain('Spellseeker');
    expect(tg.find('Spellseeker')).not.toBeNull();
    expect(tg.find('Elvish Mystic')).toBeNull();
    expect(tg.names(0, 'exile')).toEqual(['Opt']);
  });
  it('a mágica que mira mágica pode passar a mirar a própria Misdirection', () => {
    const tg = setup({ battlefield: [['Island', ...Array(5).fill('Island')], ['Island', 'Island']], hand: [[N, 'Opt'], ['Counterspell']], library: [['Ponder', 'Forest'], []] });
    tg.cast('Opt').pass().cast('Counterspell').pass();
    const misdir = () => tg.find(N, 'stack');
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('Mudar os alvos')) return null;
      return { kind: 'select', ids: [d.items.find((i) => i.obj === misdir())!.id] };
    });
    tg.cast(N, 'hand').resolve();
    // Misdirection resolveu; o Counterspell mira uma mágica que já saiu da pilha e não resolve; o Opt resolve
    tg.resolveAll();
    expect(tg.names(0, 'graveyard').sort()).toEqual([N, 'Opt'].sort());
    expect(tg.names(0, 'hand')).toEqual(['Ponder']);
  });
  it('sem outro alvo legal, o alvo não muda', () => {
    const tg = setup({ battlefield: [['Forest', ...Array(5).fill('Island')], ['Island']], hand: [[N, 'Elvish Mystic'], ['Strix Serenade']] });
    tg.cast('Elvish Mystic').pass().cast('Strix Serenade').pass();
    let perguntou = false;
    tg.script.push((d) => { if (d.kind === 'select' && d.prompt.includes('Mudar os alvos')) perguntou = true; return null; });
    tg.cast(N, 'hand').resolve();
    expect(perguntou).toBe(false);
    tg.resolveAll();
    expect(tg.names(0, 'graveyard')).toContain('Elvish Mystic');
  });
  it('só mira mágica com exatamente um alvo', () => {
    const tg = setup({ active: 1, battlefield: [[...Array(5).fill('Island'), 'Spellseeker'], [...Array(5).fill('Island'), 'Elvish Mystic']], hand: [[N], ['Step Through']] });
    tg.choose('duas criaturas alvo', ['Spellseeker', 'Elvish Mystic']).cast('Step Through').pass();
    expect(tg.canCast(N)).toBe(false);
  });
});
