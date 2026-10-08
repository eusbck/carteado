import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { controllerOf, destroy, exile, gainControl } from '../../motor/api.ts';

describe('Avacyn, Angel of Horror', () => {
  it('outra criatura sua que morre volta ao campo no início da próxima etapa final', () => {
    const tg = setup({ battlefield: [['Avacyn, Angel of Horror', 'Wall of Omens'], []], library: [['Island', 'Island'], ['Island']] });
    tg.run(destroy(tg.g, [tg.bf('Wall of Omens')]));
    tg.resolveAll();
    expect(tg.names(0, 'graveyard')).toEqual(['Wall of Omens']);
    tg.passTo('main2');
    expect(tg.names(0, 'graveyard')).toEqual(['Wall of Omens']); // ainda não
    tg.passTo('end').resolveAll();
    expect(tg.find('Wall of Omens', 'battlefield', 0)).not.toBeNull();
    expect(tg.names(0, 'hand')).toEqual(['Island']); // entrou de novo: gatilho de entrar do Wall
  });

  it('ruling 1 — Avacyn e outra criatura morrendo juntas disparam uma vez cada e as duas voltam', () => {
    const tg = setup({ battlefield: [['Avacyn, Angel of Horror', 'Wall of Omens'], []], library: [['Island', 'Island'], ['Island']] });
    tg.run(destroy(tg.g, [tg.bf('Avacyn, Angel of Horror'), tg.bf('Wall of Omens')]));
    tg.resolveAll();
    expect(tg.state.delayedTriggers.length).toBe(2);
    tg.passTo('end').resolveAll();
    expect(tg.names(0, 'battlefield').sort()).toEqual(['Avacyn, Angel of Horror', 'Wall of Omens']);
  });

  it('fichas, criaturas de oponentes e cartas que saíram do cemitério não voltam (CR 400.7)', () => {
    const tg = setup({
      battlefield: [['Avacyn, Angel of Horror', 'Elvish Mystic', { name: 'Goblin', token: true }], ['Wall of Omens']],
      library: [['Island', 'Island'], ['Island']],
    });
    tg.run(destroy(tg.g, [tg.bf('Elvish Mystic'), tg.bf('Goblin'), tg.bf('Wall of Omens')]));
    tg.resolveAll();
    expect(tg.state.delayedTriggers.length).toBe(1); // só a Elvish Mystic
    tg.run(exile(tg.g, [tg.find('Elvish Mystic', 'graveyard')!]));
    tg.passTo('end').resolveAll();
    expect(tg.find('Elvish Mystic')).toBeNull();
    expect(tg.names(0, 'exile')).toEqual(['Elvish Mystic']);
    expect(tg.names(1, 'graveyard')).toEqual(['Wall of Omens']);
  });

  it('criatura de um oponente que você controla volta sob o seu controle', () => {
    const tg = setup({ battlefield: [['Avacyn, Angel of Horror'], ['Wall of Omens']], library: [['Island', 'Island'], ['Island']] });
    gainControl(tg.g, tg.bf('Wall of Omens'), 0, { kind: 'endOfTurn' }, tg.bf('Avacyn, Angel of Horror'));
    tg.run(destroy(tg.g, [tg.bf('Wall of Omens')]));
    tg.resolveAll();
    expect(tg.names(1, 'graveyard')).toEqual(['Wall of Omens']);
    tg.passTo('end').resolveAll();
    const w = tg.bf('Wall of Omens');
    expect(controllerOf(tg.g, w)).toBe(0);
    expect(tg.state.objects[w].owner).toBe(1);
    tg.passTo('upkeep', 1);
    expect(controllerOf(tg.g, w)).toBe(0); // é um objeto novo, sem relação com o efeito de controle antigo
  });

  it('se morreu durante a etapa final, espera a etapa final do próximo turno', () => {
    const tg = setup({ battlefield: [['Avacyn, Angel of Horror', 'Wall of Omens'], []], library: [['Island', 'Island'], ['Island', 'Island']] });
    tg.passTo('end');
    tg.run(destroy(tg.g, [tg.bf('Wall of Omens')]));
    tg.resolveAll();
    tg.passTo('upkeep', 1);
    expect(tg.names(0, 'graveyard')).toEqual(['Wall of Omens']);
    tg.passTo('end', 1).resolveAll();
    expect(tg.find('Wall of Omens', 'battlefield', 0)).not.toBeNull();
  });
});
