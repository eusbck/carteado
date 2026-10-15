import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Burnished Hart', () => {
  it('{3}, sacrifique: busca até dois terrenos básicos, que entram virados', () => {
    const tg = setup({ battlefield: [['Burnished Hart', 'Sol Ring', 'Island'], []], library: [['Wall of Omens', 'Forest', 'Swamp', 'Plains'], []] });
    tg.choose('Procure até duas', ['Forest', 'Plains']);
    tg.activate('Burnished Hart').resolve();
    expect(tg.find('Burnished Hart')).toBeNull();
    expect(tg.state.objects[tg.bf('Forest')].tapped).toBe(true);
    expect(tg.state.objects[tg.bf('Plains')].tapped).toBe(true);
    expect(tg.names(0, 'library').sort()).toEqual(['Swamp', 'Wall of Omens']);
  });
});
