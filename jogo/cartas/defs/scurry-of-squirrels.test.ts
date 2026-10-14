import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const NOME = 'Scurry of Squirrels';

describe(NOME, () => {
  it('miríade duas vezes: com três jogadores, duas fichas atacam o outro oponente; exiladas no fim do combate', () => {
    const tg = setup({ players: 3, battlefield: [[NOME], [], []] });
    tg.yes('Miríade', true).yes('Miríade', true);
    tg.attack([[NOME, 1]]).passTo('declareBlockers');
    const copias = tg.all(NOME).filter((id) => tg.state.objects[id].isToken);
    expect(copias.length).toBe(2);
    expect(tg.state.combat!.attackers.filter((a) => copias.includes(a.id)).every((a) => a.target.kind === 'player' && a.target.id === 2)).toBe(true);
    tg.passTo('main2');
    expect(tg.all(NOME).length).toBe(1);
  });

  it('com um oponente só, a miríade não cria fichas; o dano de combate põe um marcador numa criatura sua', () => {
    const tg = setup({ battlefield: [[NOME, 'Wall of Omens'], []] });
    tg.choose('criatura alvo que você controla', ['Wall of Omens']);
    tg.attack([[NOME, 1]]).passTo('main2');
    expect(tg.all(NOME).length).toBe(1);
    expect(tg.state.objects[tg.bf('Wall of Omens')].counters['+1/+1']).toBe(1);
  });
});
