import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Anhelo, the Painter';
const BAIXA = 'Pagar: baixa 2 (sacrifique uma criatura com força 2 ou mais)';
const lib = Array(10).fill('Forest');

describe(N, () => {
  it('a primeira instantânea ou feitiço do turno pode sacrificar uma criatura com força 2 ou mais para ser copiada', () => {
    const tg = setup({ battlefield: [[N, 'Indomitable Ancients', 'Island', 'Island'], []], hand: [['Preordain', 'Preordain'], []], library: [lib, lib] });
    expect(hasKw(tg.g, tg.bf(N), 'deathtouch')).toBe(true);
    expect(tg.pt(tg.bf(N))).toEqual([1, 3]);
    tg.choose('custo adicional opcional', [BAIXA]).choose('Sacrifique', ['Indomitable Ancients']);
    tg.cast('Preordain');
    expect(tg.find('Indomitable Ancients')).toBeNull();
    tg.resolve();
    // o gatilho criou a cópia acima da original
    expect(tg.state.zones.stack).toHaveLength(2);
    tg.resolveAll();
    // a cópia e a original compraram uma carta cada
    expect(tg.names(0, 'hand')).toEqual(['Preordain', 'Forest', 'Forest']);
    // a segunda mágica do turno não tem baixa: nenhuma pergunta de custo opcional
    let perguntou = false;
    tg.script.push((d) => { if (d.kind === 'select' && d.prompt.includes('custo adicional opcional')) perguntou = true; return null; });
    tg.cast('Preordain').resolveAll();
    expect(perguntou).toBe(false);
    expect(tg.names(0, 'hand')).toHaveLength(3);
  });

  it('sem pagar a baixa, a mágica não é copiada; no turno seguinte a primeira mágica tem baixa de novo', () => {
    const tg = setup({ battlefield: [[N, 'Indomitable Ancients', 'Island', 'Island'], []], hand: [['Preordain', 'Preordain'], []], library: [lib, lib] });
    tg.choose('custo adicional opcional', ['Não pagar']).cast('Preordain').resolveAll();
    expect(tg.find('Indomitable Ancients')).not.toBeNull();
    expect(tg.names(0, 'hand')).toEqual(['Preordain', 'Forest']);
    tg.passTo('main1', 1);
    tg.passTo('main1', 0);
    tg.choose('custo adicional opcional', [BAIXA]).choose('Sacrifique', ['Indomitable Ancients']);
    tg.cast('Preordain').resolveAll();
    expect(tg.find('Indomitable Ancients')).toBeNull();
  });

  it('mágica de criatura não tem baixa, nem as mágicas do oponente', () => {
    const tg = setup({ battlefield: [[N, 'Indomitable Ancients', 'Forest'], []], hand: [['Elvish Mystic'], []], library: [lib, lib] });
    let perguntou = false;
    tg.script.push((d) => { if (d.kind === 'select' && d.prompt.includes('custo adicional opcional')) perguntou = true; return null; });
    tg.cast('Elvish Mystic').resolveAll();
    expect(perguntou).toBe(false);
    const dele = setup({ active: 1, battlefield: [[N], ['Island', 'Indomitable Ancients']], hand: [[], ['Preordain']], library: [lib, lib] });
    dele.script.push((d) => { if (d.kind === 'select' && d.prompt.includes('custo adicional opcional')) perguntou = true; return null; });
    dele.cast('Preordain').resolveAll();
    expect(perguntou).toBe(false);
  });

  it('sem criatura com força 2 ou mais, a baixa não pode ser paga', () => {
    // Anhelo tem força 1
    const tg = setup({ battlefield: [[N, 'Island'], []], hand: [['Preordain'], []], library: [lib, lib] });
    let desabilitada = false;
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('custo adicional opcional')) return null;
      desabilitada = !!d.items.find((i) => i.id === 'yes')?.disabled;
      return { kind: 'select', ids: ['no'] };
    });
    tg.cast('Preordain').resolveAll();
    expect(desabilitada).toBe(true);
  });
});
