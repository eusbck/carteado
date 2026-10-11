import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Master Warcraft';
const terrenos = ['Mountain', 'Mountain', 'Plains', 'Plains'];

describe(N, () => {
  it('no turno do oponente, você escolhe quais criaturas dele atacam', () => {
    const tg = setup({ active: 1, battlefield: [terrenos, ['Indomitable Ancients', 'Silver Myr']], hand: [[N], []] });
    tg.pass();
    expect(tg.pending?.player).toBe(0);
    tg.cast(N).resolveAll();
    let quem = -1;
    tg.script.push((d) => {
      if (d.kind !== 'attackers') return null;
      quem = d.player;
      // só Silver Myr ataca
      return { kind: 'attackers', attacks: [[tg.bf('Silver Myr'), { kind: 'player', id: 0 }]] };
    });
    tg.passTo('main2', 1);
    expect(quem).toBe(0);
    expect(tg.life(0)).toBe(39);
    expect(tg.state.objects[tg.bf('Indomitable Ancients')].tapped).toBe(false);
  });

  it('no seu turno, você escolhe os bloqueios do oponente', () => {
    const tg = setup({ battlefield: [[...terrenos, 'Indomitable Ancients'], ['Silver Myr', 'Elvish Mystic']], hand: [[N], []] });
    tg.cast(N).resolveAll();
    let quem = -1;
    tg.script.push((d) => {
      if (d.kind !== 'blockers') return null;
      quem = d.player;
      return { kind: 'blockers', blocks: [[tg.bf('Silver Myr'), tg.bf('Indomitable Ancients')]] };
    });
    tg.attack([['Indomitable Ancients', 1]]).passTo('main2', 0);
    expect(quem).toBe(0);
    expect(tg.find('Silver Myr')).toBeNull();
    expect(tg.life(1)).toBe(40);
    // o efeito acaba no fim do turno
    tg.passTo('upkeep', 1);
    expect(tg.state.effects.some((e) => e.mods.some((m) => m.k === 'rule' && m.id === 'rule:combatChooser'))).toBe(false);
  });

  it('só pode ser conjurada antes de os atacantes serem declarados', () => {
    const tg = setup({ battlefield: [[...terrenos, 'Indomitable Ancients'], []], hand: [[N], []] });
    expect(tg.canCast(N)).toBe(true);
    tg.passTo('beginCombat', 0);
    expect(tg.canCast(N)).toBe(true);
    tg.attack([['Indomitable Ancients', 1]]).passTo('declareBlockers');
    expect(tg.canCast(N)).toBe(false);
    tg.passTo('main2', 0);
    expect(tg.canCast(N)).toBe(false);
  });
});