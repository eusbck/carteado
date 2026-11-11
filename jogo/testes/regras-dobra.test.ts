// Dobra / warp (CR 702.185a): conjurar da mão pelo custo de dobra em vez do custo de mana; o permanente é exilado no
// início da próxima etapa final e o dono pode conjurá-lo do exílio depois que o turno atual terminar
// (motor/mecanicas-ur.ts warpPermission; a permissão "a partir do turno" é fromTurn de rule:mayPlay em motor/priority.ts).
import { describe, expect, it } from 'vitest';
import { setup } from './harness.ts';
import { foiDobrada, returnToHand } from '../motor/api.ts';
import { runEffect } from './artefatos.ts';

const T = 'Tannuk, Steadfast Second';
const dobra = (tg: ReturnType<typeof setup>, nome: string) =>
  tg.actionIds().find((a) => a.startsWith('cast:') && a.includes(':perm:warp') && a.split(':').includes(String(tg.find(nome, 'hand'))));

describe('Dobra (CR 702.185)', () => {
  it('CR 702.185a: paga o custo de dobra; exilado na etapa final; conjurável do exílio só num turno posterior', () => {
    const tg = setup({
      battlefield: [[T, 'Mountain', 'Mountain', 'Mountain', 'Mountain'], []], hand: [['Sol Ring'], []],
      library: [Array(5).fill('Island'), Array(5).fill('Island')],
    });
    tg.answer({ kind: 'priority', action: dobra(tg, 'Sol Ring')! });
    tg.settle();
    expect(foiDobrada(tg.g, tg.state.zones.stack[0])).toBe(true);
    tg.resolve();
    tg.passTo('end', 0);
    const ex = tg.find('Sol Ring', 'exile', 0)!;
    expect(ex).not.toBeNull();
    // a permissão existe, mas só a partir do turno seguinte (CR 702.185a: "depois que o turno atual terminar")
    const mod = tg.state.effects.flatMap((e) => e.mods).find((m) => m.k === 'rule' && m.id === 'rule:mayPlay' && (m.params as { objs: number[] }).objs.includes(ex));
    expect(((mod as { params?: { fromTurn: number } }).params!).fromTurn).toBe(tg.state.turn.number + 1);
    tg.passTo('main1', 1);
    // no turno de Bruno, Ana não conjura artefato (momento de feitiço); no dela, sim
    tg.passTo('main1', 0);
    expect(tg.actionIds().some((a) => a.startsWith(`cast:${tg.find('Sol Ring', 'exile', 0)}:`))).toBe(true);
  });

  it('o permanente que voltou para a mão e foi conjurado de novo é outro objeto: não é exilado', () => {
    const tg = setup({ battlefield: [[T, 'Mountain', 'Mountain', 'Mountain', 'Mountain'], []], hand: [['Sol Ring'], []], library: [Array(5).fill('Island'), Array(5).fill('Island')] });
    tg.answer({ kind: 'priority', action: dobra(tg, 'Sol Ring')! });
    tg.resolve();
    runEffect(tg, returnToHand(tg.g, [tg.bf('Sol Ring')]));
    tg.cast('Sol Ring', 'hand').resolve();
    tg.passTo('end', 0);
    expect(tg.find('Sol Ring', 'battlefield', 0)).not.toBeNull();
  });
});
