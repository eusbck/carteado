import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Aerial Surveyor';

describe(N, () => {
  it('atacando quem tem mais terrenos, busca uma Plains virada; com terrenos iguais, não', () => {
    const tg = setup({ battlefield: [[N, 'Ripjaw Raptor', 'Island'], ['Forest', 'Forest']], library: [['Island', 'Plains', 'Swamp'], []] });
    tg.choose('Tripular:', ['Ripjaw Raptor']).choose('Tripular:', ['done']).activate(N, 'Tripular').resolveAll();
    tg.choose('Plains', ['Plains']);
    tg.attack([[N, 1]]).passTo('declareBlockers');
    expect(tg.state.objects[tg.bf('Plains')].tapped).toBe(true);
    expect(tg.state.zones.library[0]).toHaveLength(2);

    const igual = setup({ battlefield: [[N, 'Ripjaw Raptor', 'Island', 'Island'], ['Forest', 'Forest']], library: [['Plains'], []] });
    igual.choose('Tripular:', ['Ripjaw Raptor']).choose('Tripular:', ['done']).activate(N, 'Tripular').resolveAll();
    igual.attack([[N, 1]]).passTo('declareBlockers');
    expect(igual.find('Plains')).toBeNull();
  });
});
