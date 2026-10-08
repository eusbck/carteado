import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Volcanic Salvo', () => {
  it('a redução pela força total; 6 de dano em até dois alvos', () => {
    const tg = setup({
      battlefield: [['Mountain', 'Mountain', 'Archfiend of Depravity', 'Glissa Sunslayer', 'Gau, Feral Youth'], ['Village Pillagers', 'Wall of Omens']], hand: [['Volcanic Salvo'], []],
    });
    // força total 5 + 3 + 2 = 10: custa {R}{R}
    tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('até duas criaturas') ? { kind: 'select', ids: d.items.filter((i) => i.label === 'Village Pillagers' || i.label === 'Wall of Omens').map((i) => i.id) } : null));
    tg.cast('Volcanic Salvo').resolve();
    expect(tg.find('Village Pillagers')).toBeNull();
    expect(tg.find('Wall of Omens')).toBeNull();
  });
  it('a redução não paga {R}{R}', () => {
    const tg = setup({ battlefield: [['Mountain', 'Archfiend of Depravity', 'Glissa Sunslayer', 'Gau, Feral Youth'], []], hand: [['Volcanic Salvo'], []] });
    expect(tg.canCast('Volcanic Salvo')).toBe(false);
  });
  it('força negativa subtrai do total', () => {
    const tg = setup({ battlefield: [['Mountain', 'Mountain', 'Archfiend of Depravity', 'Glissa Sunslayer', 'Gau, Feral Youth', { name: 'Wall of Omens', counters: { '-1/-1': 1 } }], []], hand: [['Volcanic Salvo'], []] });
    expect(tg.canCast('Volcanic Salvo')).toBe(false); // 5 + 3 + 2 - 1 = 9: falta um
  });
});
