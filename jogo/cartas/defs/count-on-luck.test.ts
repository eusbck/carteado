import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Count on Luck';
const forests = Array(10).fill('Forest');

describe(N, () => {
  it('exila o topo na manutenção e a carta pode ser jogada neste turno, pagando o custo e no tempo normal', () => {
    const tg = setup({ active: 1, battlefield: [[N, 'Mountain'], []], library: [['Sol Ring', 'Plains', 'Plains', 'Plains'], forests] });
    tg.passTo('upkeep', 0).resolveAll();
    expect(tg.names(0, 'exile')).toEqual(['Sol Ring']);
    // na manutenção ainda não é hora de conjurar um artefato
    expect(tg.canCast('Sol Ring')).toBe(false);
    tg.passTo('main1', 0);
    expect(tg.canCast('Sol Ring')).toBe(true);
    tg.cast('Sol Ring', '*').resolveAll();
    expect(tg.find('Sol Ring')).not.toBeNull();
    // pagou o custo: a Mountain foi virada
    expect(tg.state.objects[tg.bf('Mountain')].tapped).toBe(true);
  });

  it('terreno exilado é jogado como a jogada de terreno do turno; sem jogar, a permissão acaba no fim do turno', () => {
    const tg = setup({ active: 1, battlefield: [[N], []], library: [['Island', 'Plains', 'Plains', 'Plains', 'Plains', 'Plains'], forests] });
    tg.passTo('upkeep', 0).resolveAll();
    expect(tg.names(0, 'exile')).toEqual(['Island']);
    tg.passTo('main1', 0).play('Island');
    expect(tg.find('Island')).not.toBeNull();

    const outra = setup({ active: 1, battlefield: [[N, 'Mountain'], []], library: [['Sol Ring', 'Plains', 'Plains', 'Plains', 'Plains', 'Plains'], forests] });
    outra.passTo('upkeep', 0).resolveAll();
    outra.passTo('main1', 1);
    expect(outra.find('Sol Ring', 'exile')).not.toBeNull();
    outra.passTo('upkeep', 0).resolveAll();
    outra.passTo('main1', 0);
    // a carta do turno anterior continua exilada e não pode mais ser jogada; a nova pode
    expect(outra.names(0, 'exile')).toEqual(['Sol Ring', 'Plains']);
    expect(outra.canCast('Sol Ring')).toBe(false);
  });
});
