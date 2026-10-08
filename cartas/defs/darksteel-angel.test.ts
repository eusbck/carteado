import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { hasKw } from '../../motor/chars.ts';
import { draw } from '../../motor/api.ts';

const ANJO = 'Darksteel Angel';

describe(ANJO, () => {
  it('voar e indestrutível', () => {
    const tg = setup({ battlefield: [[ANJO], []] });
    expect(hasKw(tg.g, tg.bf(ANJO), 'flying')).toBe(true);
    expect(hasKw(tg.g, tg.bf(ANJO), 'indestructible')).toBe(true);
  });

  it('vida 0, compra de grimório vazio, dez venenos e 21 de dano de comandante não fazem você perder', () => {
    const tg = setup({ battlefield: [[ANJO, 'Plains'], ['Wall of Omens']], hand: [['Swords to Plowshares'], []] });
    const ana = tg.state.players[0];
    ana.life = 0;
    ana.counters.poison = 10;
    ana.commanderDamage = { 99: 21 };
    tg.run(draw(tg.g, 0, 1)); // grimório vazio (CR 704.5b)
    tg.g.bump();
    tg.refresh();
    expect(tg.state.players[0].left).toBe(false);
    expect(tg.state.players[0].life).toBe(0);
    expect(tg.state.gameOver).toBeNull();
    // ela continua jogando: sem o anjo, perde na próxima verificação (aqui pelos dez venenos, CR 704.5c)
    tg.choose('criatura alvo', [ANJO]).cast('Swords to Plowshares').resolve();
    expect(tg.state.players[0].lost).toBe(true);
    expect(tg.state.gameOver?.winners).toEqual([1]);
  });

  it('conceder ainda tira você da partida com Darksteel Angel no campo', () => {
    const tg = setup({ battlefield: [[ANJO], []] });
    tg.game.concede(0);
    expect(tg.state.players[0].lost).toBe(true);
    expect(tg.state.players[0].left).toBe(true);
    expect(tg.find(ANJO)).toBeNull();
    expect(tg.state.gameOver?.winners).toEqual([1]);
  });

  it('suas criaturas não recebem marcadores -1/-1; as dos oponentes recebem', () => {
    const tg = setup({
      active: 1,
      battlefield: [[ANJO, 'Wall of Omens'], ['Swamp', 'Swamp', 'Swamp', 'Swamp', 'Indomitable Ancients']],
      hand: [[], ['Soul Snuffers']],
    });
    tg.cast('Soul Snuffers').resolveAll();
    expect(tg.state.objects[tg.bf('Wall of Omens')].counters).toEqual({});
    expect(tg.state.objects[tg.bf(ANJO)].counters).toEqual({});
    expect(tg.state.objects[tg.bf('Indomitable Ancients')].counters).toEqual({ '-1/-1': 1 });
    expect(tg.state.objects[tg.bf('Soul Snuffers')].counters).toEqual({ '-1/-1': 1 });
  });

  it('dano de murchar não deixa marcadores -1/-1 nas suas criaturas', () => {
    const tg = setup({ active: 1, battlefield: [[ANJO, 'Wall of Omens'], ['Village Pillagers']], library: [[], ['Island']] });
    tg.attack([['Village Pillagers', 0]]).block([['Wall of Omens', 'Village Pillagers']]).passTo('main2', 1);
    const parede = tg.bf('Wall of Omens');
    expect(tg.state.objects[parede].counters).toEqual({});
    expect(tg.pt(parede)).toEqual([0, 4]);
    expect(tg.life(0)).toBe(40);
  });

  it('uma criatura sua que entraria com marcador -1/-1 entra sem ele', () => {
    const tg = setup({ battlefield: [[ANJO, 'Forest', 'Forest', 'Forest', 'Forest'], []], hand: [['Wickerbough Elder'], []] });
    tg.cast('Wickerbough Elder').resolve();
    const elder = tg.bf('Wickerbough Elder');
    expect(tg.state.objects[elder].counters).toEqual({});
    expect(tg.pt(elder)).toEqual([4, 4]);
  });
});
