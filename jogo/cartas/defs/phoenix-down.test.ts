import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Phoenix Down', () => {
  it('devolve criatura de valor 4 ou menos virada', () => {
    const tg = setup({ battlefield: [['Phoenix Down', 'Plains', 'Plains'], []], graveyard: [['Wall of Omens'], []], library: [['Island'], []] });
    tg.choose('modo', ['Devolva a carta de criatura alvo com valor de mana 4 ou menos do seu cemitério ao campo virada']).choose('valor de mana 4 ou menos', ['Wall of Omens']);
    tg.activate('Phoenix Down').resolveAll();
    expect(tg.state.objects[tg.bf('Wall of Omens')].tapped).toBe(true);
    expect(tg.names(0, 'exile')).toEqual(['Phoenix Down']);
  });
  it('exila um Spirit', () => {
    const tg = setup({ battlefield: [['Phoenix Down', 'Plains', 'Plains'], ['Nether Traitor']] });
    tg.choose('modo', ['Exile o Skeleton, Spirit ou Zombie alvo']).choose('Skeleton, Spirit ou Zombie alvo', ['Nether Traitor']);
    tg.activate('Phoenix Down').resolve();
    expect(tg.names(1, 'exile')).toEqual(['Nether Traitor']);
  });
});
