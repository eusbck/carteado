import { describe, expect, it } from 'vitest';
import { dealDamage } from '../../motor/actions.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Ethereal Haze';

describe(N, () => {
  it('previne todo o dano que criaturas causariam neste turno, de combate ou não; o de outras fontes, não', () => {
    const tg = setup({ battlefield: [['Plains', 'Serra Angel', 'Hawkeye, Avenging Archer'], ['Wall of Omens']], hand: [[N], []] });
    const vida = tg.life(1);
    tg.cast(N).resolveAll();
    tg.choose('qualquer alvo', ['Wall of Omens']).activate('Hawkeye, Avenging Archer').resolveAll();
    expect(tg.state.objects[tg.bf('Wall of Omens')].damage).toBe(0);
    dealDamage(tg.g, [{ source: tg.bf('Plains'), target: { kind: 'player', id: 1 }, amount: 2, combat: false }]);
    expect(tg.life(1)).toBe(vida - 2);
    tg.attack([['Serra Angel', 1]]).passTo('main2', 0);
    expect(tg.life(1)).toBe(vida - 2);
  });
});