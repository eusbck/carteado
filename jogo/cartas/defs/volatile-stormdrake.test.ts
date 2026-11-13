import { describe, expect, it } from 'vitest';
import { controllerOf, destroy } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Volatile Stormdrake';

describe(N, () => {
  it('troca o controle; você recebe {E}{E}{E}{E} e paga a energia igual ao valor de mana para ficar com a criatura', () => {
    const tg = setup({ battlefield: [['Island', 'Island'], ['Spellseeker']], hand: [[N], []] });
    tg.choose('criatura alvo que um oponente', ['Spellseeker']).yes('Pagar 3 de energia', true).cast(N).resolveAll();
    expect(controllerOf(tg.g, tg.bf('Spellseeker'))).toBe(0);
    expect(controllerOf(tg.g, tg.bf(N))).toBe(1);
    expect(tg.state.players[0].counters.energy).toBe(1);
  });
  it('paga a energia igual ao valor de mana para ficar com a criatura; sem energia suficiente, sacrifica', () => {
    const tg = setup({ battlefield: [['Island', 'Island'], ['Zetalpa, Primal Dawn']], hand: [[N], []] });
    tg.choose('criatura alvo que um oponente', ['Zetalpa, Primal Dawn']).cast(N).resolveAll();
    expect(tg.find('Zetalpa, Primal Dawn')).toBeNull();
    expect(tg.names(1, 'graveyard')).toEqual(['Zetalpa, Primal Dawn']);
    expect(controllerOf(tg.g, tg.bf(N))).toBe(1);
    expect(tg.state.players[0].counters.energy).toBe(4);
  });
  it('a troca continua depois que ele sai do campo', () => {
    const tg = setup({ battlefield: [['Island', 'Island'], ['Spellseeker']], hand: [[N], []] });
    tg.choose('criatura alvo que um oponente', ['Spellseeker']).yes('Pagar 3 de energia', true).cast(N).resolveAll();
    tg.run(destroy(tg.g, [tg.bf(N)]));
    tg.passTo('upkeep', 1);
    expect(controllerOf(tg.g, tg.bf('Spellseeker'))).toBe(0);
  });
  it('se ele saiu do campo antes de resolver, nada acontece', () => {
    const tg = setup({ battlefield: [['Island', 'Island'], ['Spellseeker']], hand: [[N], []] });
    tg.choose('criatura alvo que um oponente', ['Spellseeker']).cast(N).resolve();
    tg.run(destroy(tg.g, [tg.bf(N)]));
    tg.resolveAll();
    expect(controllerOf(tg.g, tg.bf('Spellseeker'))).toBe(1);
    expect(tg.state.players[0].counters.energy).toBeUndefined();
  });
  it('a habilidade ativada de um oponente não pode mirá-lo; a mágica pode', () => {
    // a habilidade desencadeada do Gilded Drake do oponente não vê o Stormdrake; a mágica Twitch vê
    const tg = setup({ active: 1, battlefield: [[N, 'Spellseeker'], ['Island', 'Island', 'Island', 'Island', 'Island']], hand: [[], ['Gilded Drake', 'Twitch']] });
    let alvos: string[] = [];
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('até uma criatura alvo')) return null;
      alvos = d.items.map((i) => i.label);
      return { kind: 'select', ids: [] };
    });
    tg.cast('Gilded Drake').resolveAll();
    expect(alvos).toEqual(['Spellseeker']);
    let alvosTwitch: string[] = [];
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('artefato, criatura ou terreno alvo')) return null;
      alvosTwitch = d.items.map((i) => i.label);
      return { kind: 'select', ids: [d.items.find((i) => i.label === N)!.id] };
    });
    tg.cast('Twitch');
    expect(alvosTwitch).toContain(N);
  });
});
