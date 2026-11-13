import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Fear of Impostors';
const ilhas = ['Island', 'Island', 'Island'];

describe(N, () => {
  it('quem controlava a mágica manifesta uma das duas do topo e põe a outra no cemitério', () => {
    const tg = setup({ active: 1, battlefield: [ilhas, ['Forest']], hand: [[N], ['Elvish Mystic']], library: [[], ['Spellseeker', 'Opt', 'Forest']] });
    tg.cast('Elvish Mystic').pass().choose('Manifestar o pavor', ['Spellseeker']).cast(N).resolveAll();
    expect(tg.names(1, 'graveyard').sort()).toEqual(['Elvish Mystic', 'Opt']);
    const virada = tg.state.zones.battlefield.find((id) => tg.state.objects[id].faceDown);
    expect(virada).toBeDefined();
    expect(tg.state.objects[virada!].controller).toBe(1);
    expect(tg.pt(virada!)).toEqual([2, 2]);
  });
  it('a mágica que não pode ser anulada continua, mas quem a controla manifesta o pavor', () => {
    const tg = setup({ active: 1, battlefield: [ilhas, Array(6).fill('Forest')], hand: [[N], ['Carnage Tyrant']], library: [[], ['Opt', 'Forest']] });
    tg.cast('Carnage Tyrant').pass().cast(N).resolve().resolve();
    expect(tg.find('Carnage Tyrant', 'stack')).not.toBeNull();
    expect(tg.state.zones.battlefield.some((id) => tg.state.objects[id].faceDown)).toBe(true);
  });
});
