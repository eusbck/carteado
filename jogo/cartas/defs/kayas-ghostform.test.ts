import { describe, expect, it } from 'vitest';
import { exile } from '../../motor/actions.ts';
import { fixture as setup, removeCard, runEffect } from '../../testes/artefatos.ts';

const N = "Kaya's Ghostform";

describe(N, () => {
  it('a permanente encantada que morre ou é exilada volta ao campo sob o seu controle', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Serra Angel', 'Wall of Omens'], []], hand: [[N, N], []] });
    tg.choose('criatura ou planeswalker que você controla', ['Serra Angel']).cast(N).resolveAll();
    removeCard(tg, tg.bf('Serra Angel'));
    tg.resolveAll();
    expect(tg.find('Serra Angel')).not.toBeNull();
    expect(tg.names(0, 'graveyard')).toEqual([N]);
    tg.choose('criatura ou planeswalker que você controla', ['Wall of Omens']).cast(N).resolveAll();
    runEffect(tg, exile(tg.g, [tg.bf('Wall of Omens')]));
    tg.resolveAll();
    expect(tg.find('Wall of Omens')).not.toBeNull();
  });
});