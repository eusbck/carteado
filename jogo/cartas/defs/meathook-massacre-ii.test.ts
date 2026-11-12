import { describe, expect, it } from 'vitest';
import { controllerOf, destroy } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

const NOME = 'Meathook Massacre II';

describe(NOME, () => {
  it('conjurada com X = 1, cada jogador sacrifica uma criatura', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Swamp', 'Swamp', 'Swamp', 'Swamp', 'Wall of Omens'], ['Indomitable Ancients']], hand: [[NOME], []] });
    tg.number('X', 1);
    tg.yes('pagar 3 de vida', false);
    tg.yes('pagar 3 de vida', false);
    tg.cast(NOME).resolveAll();
    expect(tg.names(0, 'graveyard')).toEqual(['Wall of Omens']);
    // o oponente não pagou: a criatura dele volta sob o seu controle com marcador de finalidade
    const a = tg.bf('Indomitable Ancients');
    expect(controllerOf(tg.g, a)).toBe(0);
    expect(tg.state.objects[a].counters.finality).toBe(1);
  });

  it('pagando 3 de vida, a sua criatura volta com marcador de finalidade', () => {
    const tg = setup({ battlefield: [[NOME, 'Wall of Omens'], []], library: [['Island'], ['Island']] });
    tg.yes('pagar 3 de vida', true);
    tg.run(destroy(tg.g, [tg.bf('Wall of Omens')]));
    tg.resolveAll();
    expect(tg.life(0)).toBe(37);
    expect(tg.state.objects[tg.bf('Wall of Omens')].counters.finality).toBe(1);
  });

  it('o oponente que paga 3 de vida fica sem a criatura, e ela não volta', () => {
    const tg = setup({ battlefield: [[NOME], ['Wall of Omens']] });
    tg.yes('pagar 3 de vida', true);
    tg.run(destroy(tg.g, [tg.bf('Wall of Omens')]));
    tg.resolveAll();
    expect(tg.life(1)).toBe(37);
    expect(tg.names(1, 'graveyard')).toEqual(['Wall of Omens']);
  });

  it('a ficha não volta', () => {
    const tg = setup({ battlefield: [[NOME, { name: 'Thrull', token: true }], []] });
    tg.yes('pagar 3 de vida', true);
    tg.run(destroy(tg.g, [tg.bf('Thrull')]));
    tg.resolveAll();
    expect(tg.find('Thrull')).toBeNull();
  });

  it('a carta que saiu do cemitério não volta, pagando ou não', () => {
    const tg = setup({ battlefield: [[NOME], ['Wall of Omens']] });
    tg.yes('pagar 3 de vida', false);
    tg.run(destroy(tg.g, [tg.bf('Wall of Omens')]));
    tg.settle();
    // antes de o gatilho resolver, a carta sai do cemitério
    const carta = tg.find('Wall of Omens', 'graveyard')!;
    tg.state.zones.graveyard[1] = tg.state.zones.graveyard[1].filter((x) => x !== carta);
    tg.state.objects[carta].zone = 'exile';
    tg.state.zones.exile.push(carta);
    tg.g.bump();
    tg.refresh();
    tg.resolveAll();
    expect(tg.find('Wall of Omens')).toBeNull();
  });
});
