import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { dealDamage, gainLife, loseLife } from '../../motor/api.ts';

describe('Archfiend of Despair', () => {
  it('CR 119.7: seus oponentes não podem ganhar vida; você pode', () => {
    const tg = setup({ battlefield: [['Archfiend of Despair'], []] });
    expect(gainLife(tg.g, 1, 5, null)).toBe(0);
    expect(tg.life(1)).toBe(40);
    gainLife(tg.g, 0, 2, null);
    expect(tg.life(0)).toBe(42);
  });

  it('conta só a vida perdida, mesmo que o jogador tenha ganhado vida no turno', () => {
    const tg = setup({ battlefield: [[...Array(8).fill('Swamp')], []], hand: [['Archfiend of Despair'], []] });
    gainLife(tg.g, 1, 5, null);
    loseLife(tg.g, 1, 3, null);
    tg.refresh().cast('Archfiend of Despair').resolve();
    expect(tg.life(1)).toBe(42);
    tg.passTo('end');
    expect(tg.life(1)).toBe(39); // perdeu mais 3, apesar dos 5 ganhos
    expect(tg.life(0)).toBe(40); // você não é oponente
  });

  it('ruling 3 — com dois Archfiends, o segundo a resolver vê a perda causada pelo primeiro', () => {
    const tg = setup({ battlefield: [['Archfiend of Despair', 'Archfiend of Despair'], []] });
    loseLife(tg.g, 1, 3, null);
    tg.refresh().passTo('end');
    expect(tg.life(1)).toBe(40 - 3 - 3 - 6);
  });

  it('dispara na etapa final de cada jogador; dano conta como perda de vida (CR 120.3a)', () => {
    const tg = setup({ players: 3, active: 1, battlefield: [['Archfiend of Despair'], [], []] });
    dealDamage(tg.g, [{ source: tg.bf('Archfiend of Despair'), target: { kind: 'player', id: 2 }, amount: 4, combat: false }]);
    tg.refresh().passTo('end');
    expect(tg.life(2)).toBe(32);
    expect(tg.life(1)).toBe(40); // não perdeu vida no turno: perde 0
  });
});
