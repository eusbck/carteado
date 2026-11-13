import { describe, expect, it } from 'vitest';
import { isLand } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

describe('Planar Engineering', () => {
  it('sacrifica dois terrenos e busca quatro básicos virados', () => {
    const tg = setup({ battlefield: [['Forest', 'Forest', 'Forest', 'Mountain', 'Swamp'], []], hand: [['Planar Engineering'], []], library: [['Island', 'Island', 'Plains', 'Plains', 'Plains'], []] });
    tg.choose('Sacrifique', ['Mountain', 'Swamp']).choose('terreno básico', ['Island', 'Island', 'Plains', 'Plains']).cast('Planar Engineering').resolve();
    expect(tg.find('Mountain')).toBeNull();
    expect(tg.find('Swamp')).toBeNull();
    expect(tg.state.zones.battlefield.filter((id) => isLand(tg.g, id)).length).toBe(7);
    expect(tg.names(0, 'library')).toEqual(['Plains']);
  });
});
