import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { exile } from '../../motor/api.ts';

describe('Laelia, the Blade Reforged', () => {
  it('o ataque exila uma carta e Laelia ganha um marcador', () => {
    const tg = setup({ battlefield: [['Laelia, the Blade Reforged'], []], library: [['Plains', 'Island'], ['Island']] });
    tg.attack([['Laelia, the Blade Reforged', 1]]).passTo('declareAttackers').resolveAll();
    expect(tg.names(0, 'exile')).toEqual(['Plains']);
    expect(tg.pt(tg.bf('Laelia, the Blade Reforged'))).toEqual([3, 3]);
    tg.passTo('main2').play('Plains');
    expect(tg.find('Plains')).not.toBeNull();
  });
  it('exílio do cemitério por outro jogador também conta', () => {
    const tg = setup({ battlefield: [['Laelia, the Blade Reforged'], []], graveyard: [['Island', 'Swamp'], []] });
    tg.run(exile(tg.g, [...tg.state.zones.graveyard[0]]));
    tg.resolveAll();
    expect(tg.state.objects[tg.bf('Laelia, the Blade Reforged')].counters['+1/+1']).toBe(1);
  });
});
