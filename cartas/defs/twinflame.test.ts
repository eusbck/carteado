import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { hasKw } from '../../motor/chars.ts';

describe('Twinflame', () => {
  it('dois alvos custam {2}{R} a mais; as cópias têm ímpeto e são exiladas na etapa final', () => {
    const tg = setup({
      battlefield: [[...Array(5).fill('Mountain'), 'Wall of Omens', 'Elvish Mystic'], []], hand: [['Twinflame'], []], library: [Array(4).fill('Island'), ['Island']],
    });
    tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('criaturas alvo que você controla') ? { kind: 'select', ids: d.items.map((i) => i.id) } : null));
    tg.cast('Twinflame').resolve().resolveAll();
    expect(tg.state.zones.battlefield.filter((id) => tg.state.objects[id].def === 'Mountain' && !tg.state.objects[id].tapped).length).toBe(0);
    const fichas = tg.state.zones.battlefield.filter((id) => tg.state.objects[id].isToken);
    expect(fichas.length).toBe(2);
    expect(fichas.every((id) => hasKw(tg.g, id, 'haste'))).toBe(true);
    tg.passTo('end').resolveAll();
    expect(tg.state.zones.battlefield.filter((id) => tg.state.objects[id].isToken).length).toBe(0);
  });
  it('com quatro Mountains não dá para dois alvos', () => {
    const tg = setup({ battlefield: [[...Array(4).fill('Mountain'), 'Wall of Omens', 'Gau, Feral Youth'], []], hand: [['Twinflame'], []] });
    let recusou = false;
    tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('criaturas alvo que você controla') ? { kind: 'select', ids: d.items.map((i) => i.id) } : null));
    try { tg.cast('Twinflame'); } catch { recusou = true; }
    expect(recusou || tg.names(0, 'hand').includes('Twinflame')).toBe(true);
  });
});
