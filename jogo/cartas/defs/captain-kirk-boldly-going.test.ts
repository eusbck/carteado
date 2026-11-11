import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Captain Kirk, Boldly Going';
const terrenos = ['Forest', 'Plains', 'Island', 'Island'];

describe(N, () => {
  it('ao entrar, procura no grimório um terreno básico e põe na mão', () => {
    const tg = setup({ battlefield: [terrenos, []], hand: [[N], []], library: [['Sol Ring', 'Plains', 'Hinterland Harbor'], []] });
    tg.choose('Procure uma carta', ['Plains']).cast(N).resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Plains']);
    expect(tg.state.zones.library[0].length).toBe(2);
  });
  it('ao atacar, pode pegar a Starship Enterprise do cemitério', () => {
    const tg = setup({ battlefield: [[N], ['Indomitable Ancients']], graveyard: [['Starship Enterprise'], []], library: [['Forest'], []] });
    tg.choose('Captain Kirk', ['Starship Enterprise (cemitério)']);
    tg.attack([[N, 1]]).passTo('declareBlockers');
    tg.resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Starship Enterprise']);
    expect(tg.names(0, 'library')).toEqual(['Forest']);
  });
});
