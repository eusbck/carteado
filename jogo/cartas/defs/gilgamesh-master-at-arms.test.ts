import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Gilgamesh, Master-at-Arms';

describe(N, () => {
  it('põe os Equipamentos escolhidos no campo, o resto vai para o fundo; o gatilho reflexivo anexa um a um Samurai', () => {
    const tg = setup({
      battlefield: [[N], []],
      library: [['Island', 'Lightning Greaves', 'Plains', 'Loxodon Warhammer', 'Swamp', 'Swiftfoot Boots', 'Wall of Omens'], []],
      step: 'beginCombat',
    });
    tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('quantos Equipamentos') ? { kind: 'select', ids: d.items.filter((i) => ['Lightning Greaves', 'Loxodon Warhammer'].includes(i.label)).map((i) => i.id) } : null));
    tg.choose('anexar um dos Equipamentos', ['Loxodon Warhammer em Gilgamesh, Master-at-Arms']);
    tg.attack([[N, 1]]).passTo('declareBlockers');
    expect(tg.find('Lightning Greaves', 'battlefield', 0)).not.toBeNull();
    expect(tg.state.objects[tg.bf('Loxodon Warhammer')].attachedTo).toBe(tg.bf(N));
    expect(tg.state.objects[tg.bf('Lightning Greaves')].attachedTo).toBeNull();
    expect(tg.names(0, 'library')[0]).toBe('Wall of Omens');
    expect(tg.names(0, 'library').slice(1).sort()).toEqual(['Island', 'Plains', 'Swamp', 'Swiftfoot Boots']);
  });
});
