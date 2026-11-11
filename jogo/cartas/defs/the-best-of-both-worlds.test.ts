import { describe, expect, it } from 'vitest';
import { chars, controllerOf } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'The Best of Both Worlds';

describe(N, () => {
  it('I: assimila a criatura que não é artefato de um oponente (controle, +1/+1, Borg artefato)', () => {
    const tg = setup({ battlefield: [[...Array(4).fill('Plains'), 'Island', 'Island'], ['Zetalpa, Primal Dawn', 'Steel Overseer']], hand: [[N], []] });
    tg.choose('criatura que não é artefato alvo', ['Zetalpa, Primal Dawn']).cast(N).resolveAll();
    const z = tg.bf('Zetalpa, Primal Dawn');
    expect(controllerOf(tg.g, z)).toBe(0);
    expect(tg.state.objects[z].counters['+1/+1']).toBe(1);
    const ch = chars(tg.g, z);
    expect(ch.types).toEqual(expect.arrayContaining(['Artifact', 'Creature']));
    expect(ch.subtypes).toEqual(['Borg']);
  });

  it('II dá +2/+2 às criaturas artefato até o fim do turno; III exila o Borg assimilado e o devolve ao dono', () => {
    const tg = setup({ battlefield: [[...Array(4).fill('Plains'), 'Island', 'Island', { name: 'Borg', token: true }], ['Zetalpa, Primal Dawn']], hand: [[N], []] });
    tg.choose('criatura que não é artefato alvo', ['Zetalpa, Primal Dawn']).cast(N).resolveAll();
    // capítulo II, no turno seguinte de Ana
    tg.passTo('main1', 1);
    tg.passTo('main1', 0);
    tg.resolveAll();
    expect(tg.pt(tg.bf('Borg'))).toEqual([3, 3]);
    expect(tg.pt(tg.bf('Zetalpa, Primal Dawn'))).toEqual([4 + 1 + 2, 8 + 1 + 2]);
    // capítulo III
    tg.passTo('main1', 1);
    tg.passTo('main1', 0);
    tg.resolveAll();
    const z = tg.bf('Zetalpa, Primal Dawn');
    expect(controllerOf(tg.g, z)).toBe(1);
    expect(chars(tg.g, z).types).not.toContain('Artifact');
    expect(tg.state.objects[z].counters['+1/+1'] ?? 0).toBe(0);
    expect(tg.find(N)).toBeNull();
  });
});
