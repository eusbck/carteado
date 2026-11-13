import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Roiling Regrowth', () => {
  it('sacrifica um terreno e busca até dois básicos virados', () => {
    const tg = setup({ battlefield: [['Forest', 'Forest', 'Mountain'], []], hand: [['Roiling Regrowth'], []], library: [['Island', 'Swamp', 'Plains'], []] });
    tg.choose('Sacrifique', ['Mountain']).choose('terreno básico', ['Island', 'Swamp']).cast('Roiling Regrowth').resolve();
    expect(tg.find('Mountain')).toBeNull();
    expect(tg.state.objects[tg.bf('Island')].tapped).toBe(true);
    expect(tg.state.objects[tg.bf('Swamp')].tapped).toBe(true);
    expect(tg.names(0, 'library')).toEqual(['Plains']);
  });
});
