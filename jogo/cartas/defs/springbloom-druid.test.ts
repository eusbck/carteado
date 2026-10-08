import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Springbloom Druid', () => {
  it('sacrifica um terreno só e busca até dois', () => {
    const tg = setup({ battlefield: [['Forest', 'Forest', 'Forest'], []], hand: [['Springbloom Druid'], []], library: [['Plains', 'Island', 'Swamp'], []] });
    tg.yes('sacrificar um terreno', true).choose('Procure até duas', ['Plains', 'Island']).cast('Springbloom Druid').resolve().resolve();
    expect(tg.names(0, 'graveyard')).toEqual(['Forest']);
    expect(tg.state.objects[tg.bf('Plains')].tapped).toBe(true);
    expect(tg.state.objects[tg.bf('Island')].tapped).toBe(true);
    expect(tg.names(0, 'library')).toEqual(['Swamp']);
  });
  it('sem sacrificar, nada acontece', () => {
    const tg = setup({ battlefield: [['Forest', 'Forest', 'Forest'], []], hand: [['Springbloom Druid'], []], library: [['Plains'], []] });
    tg.yes('sacrificar um terreno', false).cast('Springbloom Druid').resolve().resolve();
    expect(tg.names(0, 'library')).toEqual(['Plains']);
    expect(tg.names(0, 'graveyard')).toEqual([]);
  });
});
