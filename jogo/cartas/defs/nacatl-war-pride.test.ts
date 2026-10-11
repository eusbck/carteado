import { describe, expect, it } from 'vitest';
import { validateBlocks } from '../../motor/combat.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Nacatl War-Pride';
const lib = Array(10).fill('Forest');

describe(N, () => {
  it('ao atacar, cria uma cópia virada e atacando para cada criatura do defensor, exiladas na etapa final', () => {
    const tg = setup({ battlefield: [[N], ['Elvish Mystic', 'Silver Myr']], library: [lib, lib] });
    const id = tg.bf(N);
    expect(tg.pt(id)).toEqual([3, 3]);
    tg.attack([[N, 1]]).passTo('declareBlockers');
    const fichas = tg.all(N).filter((x) => x !== id);
    expect(fichas).toHaveLength(2);
    expect(fichas.every((x) => tg.state.objects[x].isToken && tg.state.objects[x].tapped)).toBe(true);
    expect(tg.state.combat?.attackers.filter((a) => fichas.includes(a.id))).toHaveLength(2);
    tg.passTo('main1', 1);
    expect(tg.all(N)).toEqual([id]);
  });

  it('precisa ser bloqueada por exatamente uma criatura se puder: nem zero, nem duas', () => {
    const tg = setup({ battlefield: [[N], ['Indomitable Ancients', 'Keeper of Fables']], library: [lib, lib] });
    const id = tg.bf(N);
    const anciao = tg.bf('Indomitable Ancients');
    const keeper = tg.bf('Keeper of Fables');
    tg.attack([[N, 1]]).passTo('declareBlockers');
    // três atacantes (a original e duas cópias) e dois bloqueadores: os dois têm de bloquear, um em cada atacante
    const fichas = tg.all(N).filter((x) => x !== id);
    expect(validateBlocks(tg.g, 1, [])).not.toBeNull();
    expect(validateBlocks(tg.g, 1, [[anciao, id]])).not.toBeNull();
    expect(validateBlocks(tg.g, 1, [[anciao, id], [keeper, id]])).not.toBeNull();
    expect(validateBlocks(tg.g, 1, [[anciao, id], [keeper, fichas[0]]])).toBeNull();
  });

  it('a resposta padrão do defensor cumpre a exigência', () => {
    const tg = setup({ battlefield: [[N], ['Indomitable Ancients']], library: [lib, lib] });
    tg.attack([[N, 1]]).passTo('main2', 0);
    // um bloqueador para dois atacantes: um foi bloqueado, o outro passou (3 de dano)
    expect(tg.life(1)).toBe(37);
  });
});
