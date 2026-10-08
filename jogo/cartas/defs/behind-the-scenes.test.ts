import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Behind the Scenes', () => {
  it('espreitar só vale na declaração de bloqueadores: criatura de força maior não bloqueia', () => {
    const tg = setup({ battlefield: [['Behind the Scenes', 'Elvish Mystic'], ['Indomitable Ancients', 'Wall of Omens']] });
    let podem: number[] = [];
    tg.script.push((d) => {
      if (d.kind !== 'blockers') return null;
      podem = d.candidates.filter((c) => c.canBlock.length > 0).map((c) => c.obj);
      return { kind: 'blockers', blocks: [] };
    });
    tg.attack([['Elvish Mystic', 1]]).passTo('combatDamage');
    expect(podem).toEqual([tg.bf('Wall of Omens')]);
  });
  it('{4}{W}: +1/+1 até o fim do turno', () => {
    const tg = setup({ battlefield: [['Behind the Scenes', 'Elvish Mystic', 'Plains', 'Plains', 'Plains', 'Plains', 'Plains'], []] });
    tg.activate('Behind the Scenes').resolve();
    expect(tg.pt(tg.bf('Elvish Mystic'))).toEqual([2, 2]);
  });
});
