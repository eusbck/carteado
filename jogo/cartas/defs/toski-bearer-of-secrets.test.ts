import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { attackCandidates } from '../../motor/combat.ts';

const NOME = 'Toski, Bearer of Secrets';

describe(NOME, () => {
  it('ataca a cada combate se puder; com enjoo de invocação, não', () => {
    const tg = setup({ battlefield: [[NOME], []] });
    const erros: (string | null)[] = [];
    tg.script.push((d, x) => {
      if (d.kind !== 'attackers') return null;
      erros.push(x.game.check(0, { kind: 'attackers', attacks: [] }));
      return { kind: 'attackers', attacks: [[x.bf(NOME), { kind: 'player', id: 1 }]] };
    });
    tg.passTo('main2');
    expect(erros[0]).toMatch(/508.1d/);
    const tg2 = setup({ battlefield: [[{ name: NOME, ready: false }], []] });
    expect(attackCandidates(tg2.g, 0)).toEqual([]);
  });

  it('cada criatura sua que causa dano de combate a um jogador: compre uma carta', () => {
    const tg = setup({ battlefield: [[NOME, 'Indomitable Ancients'], []], library: [['Island', 'Island', 'Island'], []] });
    tg.attack([[NOME, 1], ['Indomitable Ancients', 1]]).passTo('main2');
    expect(tg.names(0, 'hand').length).toBe(2);
    expect(tg.life(1)).toBe(37);
  });

  it('não pode ser anulada', () => {
    const tg = setup({ battlefield: [['Forest', 'Forest', 'Forest', 'Forest'], []], hand: [[NOME], []] });
    tg.cast(NOME);
    const id = tg.state.zones.stack[0];
    expect(tg.state.objects[id].def).toBe(NOME);
  });
});
