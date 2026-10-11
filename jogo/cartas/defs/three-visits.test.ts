import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = "Three Visits";

describe(N, () => {
  it('procura uma carta de Forest e a coloca no campo desvirada', () => {
    const tg = setup({ battlefield: [['Forest', 'Forest'], []], hand: [[N], []], library: [['Island', 'Forest', 'Swamp'], []] });
    tg.choose('Procure uma carta de Forest', ['Forest']);
    tg.cast(N).resolve();
    expect(tg.names(0, 'battlefield').filter((x) => x === 'Forest')).toHaveLength(3);
    // as duas Forests pagaram a mágica; a nova entra desvirada
    expect(tg.all('Forest').filter((id) => !tg.state.objects[id].tapped)).toHaveLength(1);
    expect(tg.names(0, 'library').sort()).toEqual(['Island', 'Swamp']);
  });
  it('acha terreno não básico com o tipo Forest', () => {
    const tg = setup({ battlefield: [['Forest', 'Forest'], []], hand: [[N], []], library: [['Island', 'Canopy Vista'], []] });
    tg.choose('Forest', ['Canopy Vista']);
    tg.cast(N).resolveAll();
    expect(tg.find('Canopy Vista')).not.toBeNull();
  });
  it('não acha um terreno sem o tipo Forest; pode não achar a carta', () => {
    const tg = setup({ battlefield: [['Forest', 'Forest'], []], hand: [[N], []], library: [['Island', 'Forest'], []] });
    let opcoes: string[] = [];
    tg.script.push((d) => { if (d.kind === 'select' && d.prompt.includes('Forest')) { opcoes = d.items.filter((i) => !i.disabled).map((i) => i.label); return { kind: 'select', ids: [] }; } return null; });
    tg.cast(N).resolve();
    expect(opcoes).toEqual(['Forest']);
    expect(tg.names(0, 'library').sort()).toEqual(['Forest', 'Island']);
  });
});
