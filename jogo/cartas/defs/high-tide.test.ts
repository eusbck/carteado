import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'High Tide';
const virar = (tg: ReturnType<typeof setup>, nome: string, dono: number) => {
  const id = tg.state.zones.battlefield.find((x) => tg.state.objects[x].def === nome && tg.state.objects[x].controller === dono && !tg.state.objects[x].tapped)!;
  const a = tg.actionIds().find((x) => x.startsWith(`mana:${id}|`))!;
  tg.answer({ kind: 'priority', action: a });
  tg.settle();
};
const reserva = (tg: ReturnType<typeof setup>, p: number) => tg.state.players[p].manaPool.map((u) => u.type).sort().join('');

describe(N, () => {
  it('vale para qualquer terreno com o tipo Island, de qualquer jogador', () => {
    const tg = setup({ battlefield: [['Island', 'Island', 'Coastal Peak'], ['Island']], hand: [[N], []] });
    tg.cast(N).resolve();
    virar(tg, 'Island', 0);
    expect(reserva(tg, 0)).toBe('UU');
    virar(tg, 'Coastal Peak', 0);
    expect(reserva(tg, 0).length).toBe(4);
    tg.pass();
    virar(tg, 'Island', 1);
    expect(reserva(tg, 1)).toBe('UU');
  });
  it('vale para a Island que entra depois de a High Tide resolver; acaba no fim do turno', () => {
    const tg = setup({ battlefield: [['Island'], []], hand: [[N, 'Island'], []], library: [['Opt'], ['Forest']] });
    tg.cast(N).resolve().play('Island');
    virar(tg, 'Island', 0);
    expect(reserva(tg, 0)).toBe('UU');
    tg.passTo('upkeep', 1);
    expect(tg.state.delayedTriggers.some((d) => d.abilityId === 'High Tide:mana')).toBe(false);
  });
});
