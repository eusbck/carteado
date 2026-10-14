import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const NOME = 'Agitator Ant';

describe(NOME, () => {
  it('na sua etapa final, Bruno aceita: a criatura dele recebe dois marcadores e fica goadada por você', () => {
    const tg = setup({ players: 3, step: 'main2', battlefield: [[NOME], ['Indomitable Ancients'], ['Wall of Omens']] });
    tg.choose('Agitator Ant', ['Não colocar marcadores']); // Ana
    tg.choose('Agitator Ant', ['Indomitable Ancients']); // Bruno
    tg.choose('Agitator Ant', ['Não colocar marcadores']); // Carla
    tg.passUntil((x) => x.state.turn.step === 'end' && x.state.zones.stack.length === 0 && x.pending?.player === 0 && x.state.passesInRow === 0);
    const anc = tg.bf('Indomitable Ancients');
    expect(tg.state.objects[anc].counters['+1/+1']).toBe(2);
    expect(tg.state.objects[anc].goadedBy.map((x) => x.player)).toEqual([0]);
    expect(tg.state.objects[tg.bf('Wall of Omens')].goadedBy).toEqual([]);
    expect(tg.state.objects[tg.bf(NOME)].counters['+1/+1'] ?? 0).toBe(0);
  });
});
