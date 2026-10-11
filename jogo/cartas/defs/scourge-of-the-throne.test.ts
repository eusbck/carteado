import { describe, expect, it } from 'vitest';
import { gainLife } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Scourge of the Throne';

describe(N, () => {
  it('atacando quem tem mais vida, recebe o marcador antes dos bloqueadores, desvira e há um combate adicional', () => {
    const tg = setup({ battlefield: [[N, 'Indomitable Ancients'], []], library: [[], ['Island']] });
    tg.attack([[N, 1], ['Indomitable Ancients', 1]]);
    tg.attack([[N, 1], ['Indomitable Ancients', 1]]);
    tg.passUntil((x) => x.state.turn.step === 'declareBlockers');
    const id = tg.bf(N);
    expect(tg.state.objects[id].counters['+1/+1']).toBe(1);
    expect(tg.state.objects[id].tapped).toBe(false);
    expect(tg.state.objects[tg.bf('Indomitable Ancients')].tapped).toBe(false);
    tg.passTo('main2');
    // só o primeiro ataque do turno cria um combate adicional
    expect(tg.state.turn.combatCount).toBe(2);
  });

  it('o destronar dispara de novo no segundo combate só se o defensor ainda tem mais vida', () => {
    const tg = setup({ life: 20, battlefield: [[N], []], library: [[], ['Island']] });
    tg.attack([[N, 1]]);
    tg.attack([[N, 1]]);
    tg.passTo('main2');
    // 1º combate: empatados em 20, marcador e 6 de dano (14); 2º combate: o defensor tem menos vida, sem marcador, 6 de dano
    expect(tg.state.objects[tg.bf(N)].counters['+1/+1']).toBe(1);
    expect(tg.life(1)).toBe(20 - 6 - 6);
    expect(tg.state.turn.combatCount).toBe(2);
  });

  it('atacando quem tem menos vida, nada dispara', () => {
    const tg = setup({ players: 3, battlefield: [[N], [], []], library: [[], ['Island'], ['Island']] });
    tg.state.players[2].life = 60; tg.g.bump(); tg.refresh();
    tg.attack([[N, 1]]).passTo('main2');
    expect(tg.state.objects[tg.bf(N)].counters['+1/+1'] ?? 0).toBe(0);
    expect(tg.state.turn.combatCount).toBe(1);
    expect(tg.state.objects[tg.bf(N)].tapped).toBe(true);
  });

  it('se o jogador atacado não tem mais vida ao resolver, não desvira nem há combate adicional', () => {
    const tg = setup({ players: 3, battlefield: [[N], [], []], library: [[], ['Island'], ['Island']] });
    tg.attack([[N, 1]]);
    tg.passUntil((x) => x.state.turn.step === 'declareAttackers' && x.state.zones.stack.length > 0);
    // em resposta, outro jogador passa a ter mais vida
    gainLife(tg.g, 2, 10, null);
    tg.refresh();
    tg.passTo('main2');
    expect(tg.state.turn.combatCount).toBe(1);
    expect(tg.state.objects[tg.bf(N)].tapped).toBe(true);
    // o destronar já tinha disparado e resolve mesmo assim (ruling 3)
    expect(tg.state.objects[tg.bf(N)].counters['+1/+1']).toBe(1);
  });
});
