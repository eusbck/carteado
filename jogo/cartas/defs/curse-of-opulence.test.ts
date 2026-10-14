import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const NOME = 'Curse of Opulence';
const lib = Array(6).fill('Island');

function golds(tg: ReturnType<typeof setup>, p: number): number {
  return tg.state.zones.battlefield.filter((id) => tg.state.objects[id].def === 'Gold' && tg.state.objects[id].controller === p).length;
}

describe(NOME, () => {
  it('Bruno, encantado, é atacado por Carla: Ana (dona da maldição) e Carla criam uma ficha Gold cada', () => {
    const tg = setup({ players: 3, battlefield: [['Mountain'], [], ['Indomitable Ancients']], hand: [[NOME], [], []], library: [lib, lib, lib] });
    tg.choose('jogador', ['Bruno']).cast(NOME).resolveAll();
    expect(tg.state.objects[tg.bf(NOME)].data.enchantedPlayer).toBe(1);
    tg.passTo('main1', 2);
    tg.attack([['Indomitable Ancients', 1]]).passTo('declareBlockers', 2);
    expect(golds(tg, 0)).toBe(1);
    expect(golds(tg, 2)).toBe(1);
    expect(golds(tg, 1)).toBe(0);
    // a ficha Gold: sacrifique para uma mana de qualquer cor
    const gold = tg.state.zones.battlefield.find((id) => tg.state.objects[id].def === 'Gold')!;
    expect(tg.state.objects[gold].isToken).toBe(true);
  });

  it('sem atacantes no combate ao resolver, só quem controla a maldição cria a ficha', () => {
    const tg = setup({ players: 3, battlefield: [['Mountain'], [], ['Indomitable Ancients']], hand: [[NOME], [], []], library: [lib, lib, lib] });
    tg.choose('jogador', ['Bruno']).cast(NOME).resolveAll();
    tg.passTo('main1', 2);
    tg.attack([['Indomitable Ancients', 1]]).passUntil((x) => x.state.zones.stack.length > 0);
    tg.state.combat!.attackers.forEach((a) => { a.removed = true; });
    tg.resolveAll();
    expect(golds(tg, 0)).toBe(1);
    expect(golds(tg, 2)).toBe(0);
  });

  it('atacar só um planeswalker do jogador encantado não dispara', () => {
    const tg = setup({ players: 3, battlefield: [['Mountain'], ["Elspeth, Sun's Champion"], ['Indomitable Ancients']], hand: [[NOME], [], []], library: [lib, lib, lib] });
    tg.choose('jogador', ['Bruno']).cast(NOME).resolveAll();
    tg.passTo('main1', 2);
    tg.attack([['Indomitable Ancients', { kind: 'obj', id: tg.bf("Elspeth, Sun's Champion") }]]).passTo('declareBlockers', 2);
    expect(golds(tg, 0)).toBe(0);
  });

  it('encantando a si mesma, ganha quando outro jogador ataca você', () => {
    const tg = setup({ battlefield: [['Mountain'], ['Indomitable Ancients']], hand: [[NOME], []], library: [lib, lib] });
    tg.choose('jogador', ['Ana']).cast(NOME).resolveAll();
    tg.passTo('main1', 1);
    tg.attack([['Indomitable Ancients', 0]]).passTo('declareBlockers', 1);
    expect(golds(tg, 0)).toBe(1);
    expect(golds(tg, 1)).toBe(1);
  });
});
