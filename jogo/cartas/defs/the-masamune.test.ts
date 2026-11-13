import { describe, expect, it } from 'vitest';
import { createEmblem, destroy, hasKw, sacrifice } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';
import { EMBLEMA_SEPHIROTH } from '../sephiroth.ts';

const NOME = 'The Masamune';
const SEPHIROTH = 'Sephiroth, Fabled SOLDIER // Sephiroth, One-Winged Angel';

describe(NOME, () => {
  it('os gatilhos da criatura equipada e do emblema disparam uma vez a mais quando uma criatura morre', () => {
    const tg = setup({ battlefield: [[SEPHIROTH, { name: NOME, attachTo: SEPHIROTH }, 'Wall of Omens'], []] });
    createEmblem(tg.g, 0, EMBLEMA_SEPHIROTH);
    tg.refresh();
    tg.run(destroy(tg.g, [tg.bf('Wall of Omens')]));
    tg.resolveAll();
    // Sephiroth 2× e o emblema 2×
    expect(tg.life(1)).toBe(36);
    expect(tg.life(0)).toBe(44);
  });

  it('a própria criatura equipada morrendo dispara o gatilho dela duas vezes', () => {
    const tg = setup({ battlefield: [['Venerated Stormsinger', { name: NOME, attachTo: 'Venerated Stormsinger' }], []] });
    tg.run(destroy(tg.g, [tg.bf('Venerated Stormsinger')]));
    tg.resolveAll();
    expect(tg.life(1)).toBe(38);
  });

  it('"sempre que você sacrifica" não dispara a mais', () => {
    const tg = setup({ battlefield: [['Dina, Essence Brewer', { name: NOME, attachTo: 'Dina, Essence Brewer' }, 'Wall of Omens'], []], library: [['Island', 'Island', 'Island'], []] });
    tg.run(sacrifice(tg.g, [tg.bf('Wall of Omens')]));
    tg.resolveAll();
    expect(tg.names(0, 'hand')).toHaveLength(1);
  });

  it('atacando, a criatura equipada tem iniciativa e precisa ser bloqueada se possível', () => {
    const tg = setup({ step: 'beginCombat', battlefield: [['Indomitable Ancients', { name: NOME, attachTo: 'Indomitable Ancients' }], ['Wall of Omens']] });
    const atacante = tg.bf('Indomitable Ancients');
    expect(hasKw(tg.g, atacante, 'first strike')).toBe(false);
    tg.attack([['Indomitable Ancients', 1]]);
    tg.script.push((d) => (d.kind === 'blockers' ? { kind: 'blockers', blocks: [] } : null));
    expect(() => tg.passTo('declareBlockers')).toThrow(/bloqueada se possível/);
  });

  it('sem bloqueio declarado, a resposta padrão bloqueia a criatura equipada', () => {
    const tg = setup({ step: 'beginCombat', battlefield: [['Indomitable Ancients', { name: NOME, attachTo: 'Indomitable Ancients' }], ['Wall of Omens']] });
    tg.attack([['Indomitable Ancients', 1]]).passTo('combatDamage');
    const atacante = tg.bf('Indomitable Ancients');
    expect(hasKw(tg.g, atacante, 'first strike')).toBe(true);
    expect(tg.state.combat?.attackers.find((a) => a.id === atacante)?.blocked).toBe(true);
  });
});
