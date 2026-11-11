import { describe, expect, it } from 'vitest';
import { attackCandidates } from '../../motor/combat.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'The Aetherspark';

describe(N, () => {
  it('+1: anexa-se a uma criatura sua e põe um marcador +1/+1; o dano de combate dela no seu turno vira lealdade', () => {
    const tg = setup({ battlefield: [[N, 'Silver Myr'], []] });
    const ae = tg.bf(N);
    expect(tg.state.objects[ae].counters.loyalty).toBe(4);
    tg.choose('criatura alvo', ['Silver Myr']).activate(N, '+1').resolveAll();
    const myr = tg.bf('Silver Myr');
    expect(tg.state.objects[ae].attachedTo).toBe(myr);
    expect(tg.state.objects[myr].counters['+1/+1']).toBe(1);
    expect(tg.state.objects[ae].counters.loyalty).toBe(5);
    tg.passTo('beginCombat');
    tg.attack([['Silver Myr', 1]]).passTo('main2', 0);
    expect(tg.life(1)).toBe(38);
    expect(tg.state.objects[ae].counters.loyalty).toBe(7);
  });

  it('anexada, não pode ser atacada; sem estar anexada, pode', () => {
    const tg = setup({ battlefield: [['Silver Myr'], [N, 'Wall of Omens']], active: 0, step: 'beginCombat' });
    const ae = tg.bf(N);
    const alvos = () => attackCandidates(tg.g, 0).flatMap((o) => o.targets).map((x) => `${x.kind}:${x.id}`);
    expect(alvos()).toContain(`obj:${ae}`);
    tg.state.objects[ae].attachedTo = tg.bf('Wall of Omens');
    tg.refresh();
    expect(alvos()).not.toContain(`obj:${ae}`);
  });

  it('−5: compra duas cartas; −10: dez manas de uma cor', () => {
    const tg = setup({ battlefield: [[{ name: N, counters: { loyalty: 10 } }], []] });
    tg.activate(N, '−5').resolveAll();
    expect(tg.names(0, 'hand').length).toBe(2);
    const outro = setup({ battlefield: [[{ name: N, counters: { loyalty: 10 } }], []] });
    outro.choose('cor', ['vermelho']).activate(N, '−10').resolveAll();
    expect(outro.state.players[0].manaPool.map((u) => u.type)).toEqual(Array(10).fill('R'));
  });
});
