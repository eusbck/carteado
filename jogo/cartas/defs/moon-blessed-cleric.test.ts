import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Moon-Blessed Cleric', () => {
  it('ao entrar, pode buscar uma carta de encantamento e pô-la no topo depois de embaralhar', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains', 'Plains'], []], hand: [['Moon-Blessed Cleric'], []], library: [['Island', 'Forest', 'Ghostly Prison', 'Swamp'], []] });
    tg.yes('procurar uma carta de encantamento', true).choose('Procure uma carta de encantamento', ['Ghostly Prison']);
    tg.cast('Moon-Blessed Cleric').resolve().resolve();
    expect(tg.names(0, 'library')[0]).toBe('Ghostly Prison');
    expect(tg.names(0, 'library')).toHaveLength(4);
  });
});
