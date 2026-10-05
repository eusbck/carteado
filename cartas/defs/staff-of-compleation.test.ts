import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Staff of Compleation', () => {
  it('destrói um permanente seu (não de outro dono) pagando 1 de vida', () => {
    const tg = setup({ battlefield: [['Staff of Compleation', 'Wall of Omens'], ['Elvish Mystic']], library: [['Island'], []] });
    let opcoes: string[] = [];
    tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('você é dono') ? (opcoes = d.items.map((i) => i.label).sort(), { kind: 'select', ids: [d.items.find((i) => i.label === 'Wall of Omens')!.id] }) : null));
    tg.activate('Staff of Compleation', 'Destrua').resolve();
    expect(opcoes).toEqual(['Staff of Compleation', 'Wall of Omens']);
    expect(tg.find('Wall of Omens')).toBeNull();
    expect(tg.life(0)).toBe(39);
  });
  it('compra pagando 4 de vida e desvira por {5}', () => {
    const tg = setup({ battlefield: [['Staff of Compleation', 'Swamp', 'Swamp', 'Swamp', 'Swamp', 'Swamp'], []], library: [['Island', 'Island'], []] });
    tg.activate('Staff of Compleation', 'Compre').resolve();
    expect(tg.names(0, 'hand')).toEqual(['Island']);
    expect(tg.life(0)).toBe(36);
    tg.activate('Staff of Compleation', 'Desvire').resolve();
    expect(tg.state.objects[tg.bf('Staff of Compleation')].tapped).toBe(false);
  });
});
