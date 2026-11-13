import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Rhystic Study';

describe(N, () => {
  it('o gatilho resolve antes da mágica que o disparou', () => {
    const tg = setup({ active: 1, battlefield: [[N], ['Forest']], hand: [[], ['Elvish Mystic']], library: [['Ponder'], []] });
    tg.cast('Elvish Mystic');
    expect(tg.state.zones.stack).toHaveLength(2);
    tg.yes('Rhystic Study: comprar', true).resolve();
    expect(tg.names(0, 'hand')).toEqual(['Ponder']);
    expect(tg.find('Elvish Mystic', 'stack')).not.toBeNull();
  });
  it('o oponente decide se paga antes; sem pagamento, você escolhe se compra', () => {
    const tg = setup({ active: 1, battlefield: [[N], ['Forest', 'Forest']], hand: [[], ['Elvish Mystic']], library: [['Ponder'], []] });
    const ordem: string[] = [];
    tg.script.push((d) => { if (d.kind === 'select' && d.prompt.includes('não possa comprar')) { ordem.push(`paga:${d.player}`); return { kind: 'select', ids: ['no'] }; } return null; });
    tg.script.push((d) => { if (d.kind === 'select' && d.prompt.includes('Rhystic Study: comprar')) { ordem.push(`compra:${d.player}`); return { kind: 'select', ids: ['no'] }; } return null; });
    tg.cast('Elvish Mystic').resolveAll();
    expect(ordem).toEqual(['paga:1', 'compra:0']);
    expect(tg.names(0, 'hand')).toEqual([]);
  });
  it('CR 118.12a: o oponente paga {1} e você não compra', () => {
    const tg = setup({ active: 1, battlefield: [[N], ['Forest', 'Forest']], hand: [[], ['Elvish Mystic']], library: [['Ponder'], []] });
    tg.yes('não possa comprar', true);
    let perguntou = false;
    tg.script.push((d) => { if (d.kind === 'select' && d.prompt.includes('Rhystic Study: comprar')) perguntou = true; return null; });
    tg.cast('Elvish Mystic').resolveAll();
    expect(perguntou).toBe(false);
    expect(tg.names(0, 'hand')).toEqual([]);
  });
});
