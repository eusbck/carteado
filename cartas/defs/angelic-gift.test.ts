import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { hasKw } from '../../motor/chars.ts';

describe('Angelic Gift', () => {
  it('encanta uma criatura, compra uma carta e dá voar', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains', 'Indomitable Ancients'], []], hand: [['Angelic Gift'], []], library: [['Island'], []] });
    tg.choose('criatura', ['Indomitable Ancients']).cast('Angelic Gift').resolve().resolve();
    expect(tg.state.objects[tg.bf('Angelic Gift')].attachedTo).toBe(tg.bf('Indomitable Ancients'));
    expect(hasKw(tg.g, tg.bf('Indomitable Ancients'), 'flying')).toBe(true);
    expect(tg.names(0, 'hand')).toEqual(['Island']);
  });
  it('CR 608.3b: com o alvo ilegal, não entra e o gatilho de entrar não acontece', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains', 'Indomitable Ancients'], ['Swamp', 'Swamp']], hand: [['Angelic Gift'], ['Infernal Grasp']], library: [['Island'], []] });
    tg.choose('criatura', ['Indomitable Ancients']).cast('Angelic Gift').pass();
    tg.choose('criatura alvo', ['Indomitable Ancients']).cast('Infernal Grasp').resolve().resolve();
    expect(tg.names(0, 'graveyard')).toContain('Angelic Gift');
    expect(tg.state.zones.hand[0].length).toBe(0);
  });
});
