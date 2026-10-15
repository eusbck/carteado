import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const SALA = 'Bottomless Pool // Locker Room';

describe(SALA, () => {
  it('Bottomless Pool: conjurada, a porta entra destrancada e devolve até uma criatura alvo para a mão do dono', () => {
    const tg = setup({ battlefield: [['Island'], ['Wall of Omens']], hand: [[SALA], []] });
    tg.choose('criatura', ['Wall of Omens']);
    tg.cast(SALA, 'hand').resolve();
    expect(tg.state.zones.stack).toHaveLength(1);
    tg.resolve();
    expect(tg.names(1, 'hand')).toEqual(['Wall of Omens']);
  });

  it('destrancar Bottomless Pool depois também dispara', () => {
    const tg = setup({ battlefield: [['Island', 'Island', 'Island', 'Island', 'Island', 'Island'], ['Wall of Omens']], hand: [[SALA], []] });
    tg.cast(SALA, 'hand@1').resolve();
    expect(tg.state.zones.stack).toHaveLength(0);
    const sala = tg.bf(SALA);
    tg.choose('criatura', ['Wall of Omens']);
    tg.answer({ kind: 'priority', action: tg.actionIds().find((a) => a.startsWith(`unlock:${sala}:0`))! });
    tg.settle();
    tg.resolve();
    expect(tg.names(1, 'hand')).toEqual(['Wall of Omens']);
  });

  it('Locker Room: com dano de combate a dois jogadores, compra duas cartas', () => {
    const tg = setup({
      players: 3, step: 'beginCombat',
      battlefield: [[{ name: SALA }, 'Burnished Hart', 'Indomitable Ancients'], [], []],
      library: [['Island', 'Forest', 'Swamp'], ['Island'], ['Island']],
      onStart: (t) => { const id = t.bf(SALA); t.state.objects[id].face = 1; t.g.bump(); t.refresh(); },
    });
    tg.attack([['Indomitable Ancients', 1], ['Burnished Hart', 2]]).passTo('combatDamage');
    tg.resolveAll();
    expect(tg.names(0, 'hand')).toHaveLength(2);
  });
});
