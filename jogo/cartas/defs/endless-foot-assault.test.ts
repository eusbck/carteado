import { describe, expect, it } from 'vitest';
import { counter, destroy } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Endless Foot Assault';
const planicies = (n: number) => Array(n).fill('Plains');

describe(N, () => {
  it('com o esquadrão pago duas vezes, duas cópias', () => {
    // {2}{W} + duas vezes {1}{W} = sete manas
    const tg = setup({ battlefield: [planicies(7), []], hand: [[N], []] });
    tg.number('quantas vezes', 2).cast(N).resolveAll();
    expect(tg.all('Plains').every((p) => tg.state.objects[p].tapped)).toBe(true);
    const todos = tg.all(N);
    expect(todos).toHaveLength(3);
    expect(todos.filter((id) => tg.state.objects[id].isToken)).toHaveLength(2);
  });

  it('anulada, não cria cópias', () => {
    const tg = setup({ battlefield: [planicies(8), []], hand: [[N], []] });
    tg.number('quantas vezes', 2).cast(N);
    tg.run(counter(tg.g, tg.state.zones.stack[0]));
    tg.settle();
    tg.resolveAll();
    expect(tg.all(N)).toHaveLength(0);
    expect(tg.find(N, 'graveyard', 0)).not.toBeNull();
  });

  it('se sair antes do gatilho resolver, cria as cópias mesmo assim', () => {
    const tg = setup({ battlefield: [planicies(8), []], hand: [[N], []] });
    tg.number('quantas vezes', 2).cast(N).resolve();
    // o encantamento entrou e o gatilho do esquadrão está na pilha
    expect(tg.state.zones.stack).toHaveLength(1);
    tg.run(destroy(tg.g, [tg.bf(N)]));
    tg.resolveAll();
    const copias = tg.all(N);
    expect(copias).toHaveLength(2);
    expect(copias.every((id) => tg.state.objects[id].isToken)).toBe(true);
  });

  it('uma ficha para cada oponente, mesmo os não atacados', () => {
    const tg = setup({ players: 3, battlefield: [[N, 'Indomitable Ancients'], [], []], library: [[], ['Island'], ['Island']] });
    tg.attack([['Indomitable Ancients', 1]]).passTo('declareBlockers');
    const ninjas = tg.all('Ninja');
    expect(ninjas).toHaveLength(2);
    const alvos = ninjas.map((id) => tg.state.combat!.attackers.find((a) => a.id === id)!.target);
    expect(alvos).toEqual(expect.arrayContaining([{ kind: 'player', id: 1 }, { kind: 'player', id: 2 }]));
    expect(ninjas.every((id) => tg.state.objects[id].tapped)).toBe(true);
    tg.passTo('main2');
    // Bruno leva 2 (Ancients) + 1 (Ninja); Carla, que não foi atacada na declaração, leva 1
    expect([tg.life(1), tg.life(2)]).toEqual([37, 39]);
  });

  it('as fichas não foram declaradas atacantes', () => {
    // dois Endless Foot Assault: cada um dispara uma vez no ataque; as fichas que entram atacando não disparam de novo
    const tg = setup({ battlefield: [[N, N, 'Indomitable Ancients'], []], library: [[], ['Island']] });
    tg.attack([['Indomitable Ancients', 1]]).passTo('declareBlockers');
    expect(tg.all('Ninja')).toHaveLength(2);
    expect(tg.state.zones.stack).toHaveLength(0);
  });
});
