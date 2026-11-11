import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const NOME = 'Ragavan, Nimble Pilferer';

describe(NOME, () => {
  it('com dash tem ímpeto e volta para a mão no início da próxima etapa final', () => {
    const tg = setup({ battlefield: [['Mountain', 'Mountain'], []], hand: [[NOME], []], library: [['Island'], ['Dark Ritual', 'Island']] });
    tg.cast(NOME, 'dash').resolve();
    const id = tg.bf(NOME);
    expect(tg.g.state.objects[id]).toBeDefined();
    tg.attack([[NOME, 1]]).passTo('main2', 0);
    expect(tg.life(1)).toBe(38);
    expect(tg.find('Treasure')).not.toBeNull();
    expect(tg.names(1, 'exile')).toEqual(['Dark Ritual']);
    tg.passTo('end');
    tg.resolveAll();
    expect(tg.names(0, 'hand')).toEqual([NOME]);
  });

  it('até o fim do turno pode conjurar a carta exilada pagando o custo; terreno não', () => {
    const tg = setup({ battlefield: [['Swamp', NOME], []], library: [[], ['Dark Ritual', 'Island']], step: 'main1' });
    tg.attack([[NOME, 1]]).passTo('main2', 0);
    tg.cast('Dark Ritual', '*').resolve();
    expect(tg.names(1, 'graveyard')).toEqual(['Dark Ritual']);
    expect(tg.state.players[0].manaPool.map((m) => m.type)).toEqual(['B', 'B', 'B']);
  });

  it('com o grimório do jogador vazio, ainda cria o Tesouro', () => {
    const tg = setup({ battlefield: [[NOME], []], library: [[], []] });
    tg.attack([[NOME, 1]]).passTo('main2', 0);
    expect(tg.find('Treasure')).not.toBeNull();
  });

  it('conjurada normalmente, não tem ímpeto', () => {
    const tg = setup({ battlefield: [['Mountain'], []], hand: [[NOME], []] });
    tg.cast(NOME, 'hand').resolve();
    expect(tg.g.state.objects[tg.bf(NOME)]).toBeDefined();
    tg.passTo('end');
    tg.resolveAll();
    expect(tg.find(NOME)).not.toBeNull();
  });
});
