import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Maestros Charm';
const terrenos = ['Island', 'Swamp', 'Mountain'];
const OLHAR = 'Olhe as cinco cartas do topo do seu grimório. Ponha uma delas na sua mão e o resto no seu cemitério';
const DRENAR = 'Cada oponente perde 3 de vida e você ganha 3 de vida';
const DANO = 'Maestros Charm causa 5 de dano à criatura ou planeswalker alvo';

describe(N, () => {
  it('primeiro modo: das cinco do topo, uma vai para a mão e as outras para o cemitério', () => {
    const tg = setup({ battlefield: [terrenos, []], hand: [[N], []], library: [['Plains', 'Sol Ring', 'Swamp', 'Forest', 'Mountain', 'Island'], []] });
    tg.choose('modo', [OLHAR]).choose(N, ['Sol Ring']).cast(N).resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Sol Ring']);
    expect(tg.names(0, 'graveyard').sort()).toEqual(['Forest', N, 'Mountain', 'Plains', 'Swamp'].sort());
    expect(tg.names(0, 'library')).toEqual(['Island']);
  });

  it('segundo modo: cada oponente perde 3 de vida e você ganha 3', () => {
    const tg = setup({ players: 3, battlefield: [terrenos, [], []], hand: [[N], [], []] });
    tg.choose('modo', [DRENAR]).cast(N).resolveAll();
    expect([tg.life(0), tg.life(1), tg.life(2)]).toEqual([43, 37, 37]);
  });

  it('terceiro modo: 5 de dano à criatura alvo; é instantânea', () => {
    const tg = setup({ active: 1, battlefield: [terrenos, ['Indomitable Ancients']], hand: [[N], []] });
    tg.pass();
    expect(tg.pending?.player).toBe(0);
    tg.choose('modo', [DANO]).choose('criatura ou planeswalker alvo', ['Indomitable Ancients']).cast(N).resolveAll();
    expect(tg.state.objects[tg.bf('Indomitable Ancients')].damage).toBe(5);
  });
});
