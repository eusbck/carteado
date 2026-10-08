import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { destroy } from '../../motor/api.ts';

describe('Woe Strider', () => {
  it('cria um Goat; sacrificar outra criatura faz vidência 1', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Swamp'], []], hand: [['Woe Strider'], []], library: [['Island'], []] });
    tg.cast('Woe Strider').resolve().resolveAll();
    expect(tg.all('Goat').length).toBe(1);
    let viu = false;
    tg.script.push((d) => (d.kind === 'arrange' ? (viu = true, { kind: 'arrange', placement: Object.fromEntries(d.items.map((i) => [i.id, 'top'])), order: d.items.map((i) => i.id) }) : null));
    tg.activate('Woe Strider').resolve();
    expect(viu).toBe(true);
    expect(tg.all('Goat').length).toBe(0);
  });
  it('depois de fugir, entra com dois marcadores e volta ao cemitério ao morrer', () => {
    const tg = setup({
      battlefield: [[...Array(5).fill('Swamp')], []], graveyard: [['Woe Strider', 'Island', 'Island', 'Plains', 'Plains'], []], library: [['Island'], []],
    });
    tg.cast('Woe Strider', 'escape').resolve().resolveAll();
    const w = tg.bf('Woe Strider');
    expect(tg.pt(w)).toEqual([5, 4]);
    tg.run(destroy(tg.g, [w]));
    tg.resolveAll();
    expect(tg.names(0, 'graveyard')).toEqual(['Woe Strider']);
  });
});
