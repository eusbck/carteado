import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Dig Through Time', () => {
  it('delve: só paga genérico e não mais que ele; duas para a mão, o resto no fundo', () => {
    const cem = Array(9).fill('Forest');
    const tg = setup({ battlefield: [['Island', 'Island'], []], hand: [['Dig Through Time'], []], graveyard: [cem, []], library: [['Plains', 'Swamp', 'Mountain', 'Island', 'Forest', 'Wall of Omens', 'Sol Ring', 'Counterspell'], []] });
    expect(tg.canCast('Dig Through Time')).toBe(true);
    let maximo = -1;
    tg.script.push((d) => (d.kind === 'number' && d.prompt.startsWith('Delve') ? (maximo = d.max, { kind: 'number', value: d.max }) : null));
    tg.choose('Delve', Array(6).fill('Forest'));
    tg.choose('duas cartas para a mão', ['Wall of Omens', 'Sol Ring']);
    tg.cast('Dig Through Time').resolve();
    expect(maximo).toBe(6);
    expect(tg.names(0, 'exile').length).toBe(6);
    expect(tg.names(0, 'hand').sort()).toEqual(['Sol Ring', 'Wall of Omens']);
    expect(tg.names(0, 'library')[0]).toBe('Counterspell');
  });
  it('sem cemitério, não dá para pagar', () => {
    const tg = setup({ battlefield: [['Island', 'Island'], []], hand: [['Dig Through Time'], []] });
    expect(tg.canCast('Dig Through Time')).toBe(false);
  });
});
