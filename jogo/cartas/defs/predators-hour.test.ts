import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

const N = "Predators' Hour";

describe(N, () => {
  it('as suas criaturas ganham ameaçar e, causando dano de combate, exilam o topo do grimório do jogador para você jogar', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Swamp', 'Elvish Mystic'], []], hand: [[N], []], library: [Array(6).fill('Swamp'), ['Sol Ring', ...Array(6).fill('Island')]] });
    tg.cast(N).resolveAll();
    const elfo = tg.bf('Elvish Mystic');
    expect(hasKw(tg.g, elfo, 'menace')).toBe(true);
    tg.attack([['Elvish Mystic', 1]]).passTo('main2', 0);
    const carta = tg.state.zones.exile[0];
    expect(tg.state.objects[carta].def).toBe('Sol Ring');
    expect(tg.state.objects[carta].faceDown).toBe(true);
    expect(tg.state.objects[carta].visibleTo).toEqual([0]);
    // sobra uma Swamp: Sol Ring ({1}) do oponente é conjurado por você
    const acao = tg.actionIds().find((a) => a.startsWith('cast:') && a.split(':').includes(String(carta)))!;
    expect(acao).toBeDefined();
    tg.answer({ kind: 'priority', action: acao });
    tg.resolveAll();
    expect(tg.state.objects[tg.bf('Sol Ring')].controller).toBe(0);
    // no turno seguinte as criaturas já não têm ameaçar
    tg.passTo('main1', 1);
    expect(hasKw(tg.g, elfo, 'menace')).toBe(false);
  });
});
