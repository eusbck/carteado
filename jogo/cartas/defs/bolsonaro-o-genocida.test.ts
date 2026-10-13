import { describe, expect, it } from 'vitest';
import { destroy } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Bolsonaro, o Genocida';

describe(N, () => {
  it('ao atacar, destrói a criatura com a menor resistência do jogador defensor', () => {
    const tg = setup({ battlefield: [[N], ['Indomitable Ancients', 'Elvish Mystic']] });
    tg.attack([[N, 1]]).passTo('declareBlockers');
    expect(tg.find('Elvish Mystic', 'battlefield')).toBeNull();
    expect(tg.names(1, 'graveyard')).toEqual(['Elvish Mystic']);
    expect(tg.find('Indomitable Ancients', 'battlefield')).not.toBeNull();
  });

  it('no empate, quem controla Bolsonaro escolhe', () => {
    const tg = setup({ battlefield: [[N], ['Elvish Mystic', 'Llanowar Elves']] });
    tg.choose('menor resistência', ['Llanowar Elves']);
    tg.attack([[N, 1]]).passTo('declareBlockers');
    expect(tg.names(1, 'graveyard')).toEqual(['Llanowar Elves']);
    expect(tg.find('Elvish Mystic', 'battlefield')).not.toBeNull();
  });

  it('criatura de oponente que morre: você ganha 2 de vida e Bolsonaro recebe um marcador +1/+1', () => {
    const tg = setup({ battlefield: [[N], ['Elvish Mystic']] });
    tg.run(destroy(tg.g, [tg.bf('Elvish Mystic')]));
    tg.resolveAll();
    expect(tg.life(0)).toBe(42);
    expect(tg.pt(tg.bf(N))).toEqual([5, 5]);
  });

  it('criatura sua que morre não conta', () => {
    const tg = setup({ battlefield: [[N, 'Elvish Mystic'], []] });
    tg.run(destroy(tg.g, [tg.bf('Elvish Mystic')]));
    tg.resolveAll();
    expect(tg.life(0)).toBe(40);
    expect(tg.pt(tg.bf(N))).toEqual([4, 4]);
  });

  it('sem criaturas do outro lado, o ataque segue normalmente', () => {
    const tg = setup({ battlefield: [[N], []] });
    tg.attack([[N, 1]]).passTo('main2', 0);
    expect(tg.life(1)).toBe(36);
  });
});
