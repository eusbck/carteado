import { describe, expect, it } from 'vitest';
import { basePower, untilEndOfTurn } from '../../motor/api.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Kutzil, Malamet Exemplar';
const MYR = 'Silver Myr';

describe(N, () => {
  it('os oponentes não podem conjurar mágicas durante o seu turno, mas podem no turno deles', () => {
    const tg = setup({ battlefield: [[N, 'Mountain'], ['Mountain']], hand: [['Lightning Bolt'], ['Lightning Bolt']] });
    // você ainda pode
    expect(tg.canCast('Lightning Bolt')).toBe(true);
    tg.passTo('upkeep', 1);
    expect(tg.canCast('Lightning Bolt')).toBe(true);
    tg.passTo('main1', 0);
    tg.choose('alvo', ['Bruno']).cast('Lightning Bolt');
    // com a mágica na pilha, a prioridade passa ao oponente
    tg.pass();
    expect(tg.pending?.player).toBe(1);
    expect(tg.canCast('Lightning Bolt')).toBe(false);
  });

  it('compra uma carta quando criaturas com força maior que a base (marcador, Equipamento) causam dano de combate a um jogador', () => {
    const tg = setup({
      battlefield: [[N, { name: MYR, counters: { '+1/+1': 1 } }, 'Ornithopter', { name: 'Shadowspear', attachTo: 'Ornithopter' }], []],
    });
    const mao = tg.names(0, 'hand').length;
    tg.attack([[MYR, 1], ['Ornithopter', 1]]).passTo('main2', 0);
    // uma compra só para as duas criaturas
    expect(tg.names(0, 'hand').length).toBe(mao + 1);
  });

  it('sem aumento de força, não compra', () => {
    const tg = setup({ battlefield: [[N, MYR], []] });
    const mao = tg.names(0, 'hand').length;
    tg.attack([[N, 1], [MYR, 1]]).passTo('main2', 0);
    expect(tg.life(1)).toBe(36);
    expect(tg.names(0, 'hand').length).toBe(mao);
  });

  it('força aumentada por marcador ou efeito conta; força definida por efeito vira a base e não conta', () => {
    const tg = setup({ battlefield: [[N, MYR], []] });
    const myr = tg.bf(MYR);
    untilEndOfTurn({ g: tg.g, you: 0, source: myr } as never, [myr], [{ k: 'setPT', p: 5, t: 5 }]);
    tg.refresh();
    expect(basePower(tg.g, myr)).toBe(5);
    const mao = tg.names(0, 'hand').length;
    tg.attack([[MYR, 1]]).passTo('main2', 0);
    expect(tg.life(1)).toBe(35);
    expect(tg.names(0, 'hand').length).toBe(mao);
  });

  it('a CDA define a força-base: a criatura */* sem aumento não conta', () => {
    const tg = setup({ battlefield: [[N, 'Dungrove Elder', 'Forest', 'Forest'], []] });
    expect(basePower(tg.g, tg.bf('Dungrove Elder'))).toBe(2);
    const mao = tg.names(0, 'hand').length;
    tg.attack([['Dungrove Elder', 1]]).passTo('main2', 0);
    expect(tg.life(1)).toBe(38);
    expect(tg.names(0, 'hand').length).toBe(mao);
  });

  it('a criatura 0/0 que recebe bônus de uma habilidade (sem CDA) tem força maior que a base', () => {
    const tg = setup({ battlefield: [[N, 'Faeburrow Elder'], []] });
    expect(basePower(tg.g, tg.bf('Faeburrow Elder'))).toBe(0);
    const mao = tg.names(0, 'hand').length;
    tg.attack([['Faeburrow Elder', 1]]).passTo('main2', 0);
    expect(tg.names(0, 'hand').length).toBe(mao + 1);
  });

  it('um gatilho por jogador que tomou o dano', () => {
    const tg = setup({ players: 3, battlefield: [[N, { name: MYR, counters: { '+1/+1': 1 } }, { name: 'Ornithopter', counters: { '+1/+1': 1 } }], [], []] });
    const mao = tg.names(0, 'hand').length;
    tg.attack([[MYR, 1], ['Ornithopter', 2]]).passTo('main2', 0);
    expect(tg.names(0, 'hand').length).toBe(mao + 2);
  });
});
