import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { enterCard } from '../../testes/artefatos.ts';

const NOME = 'Disrupt Decorum';

describe(NOME, () => {
  it('goada as criaturas que você não controla; as suas e as que entram depois ficam de fora', () => {
    const tg = setup({ players: 3, battlefield: [['Mountain', 'Mountain', 'Mountain', 'Mountain', 'Wall of Omens'], ['Indomitable Ancients'], ['Zetalpa, Primal Dawn']], hand: [[NOME], [], []] });
    tg.cast(NOME).resolve();
    expect(tg.state.objects[tg.bf('Indomitable Ancients')].goadedBy.map((x) => x.player)).toEqual([0]);
    expect(tg.state.objects[tg.bf('Zetalpa, Primal Dawn')].goadedBy.map((x) => x.player)).toEqual([0]);
    expect(tg.state.objects[tg.bf('Wall of Omens')].goadedBy).toEqual([]);
    const nova = enterCard(tg, 'Wall of Omens', 1)!;
    expect(tg.state.objects[nova].goadedBy).toEqual([]);
  });
});
