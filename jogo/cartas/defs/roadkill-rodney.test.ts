import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Roadkill Rodney';
const ilhas = (n: number) => Array(n).fill('Island');

describe(N, () => {
  it('CR 702.157a: com o esquadrão pago duas vezes, cria duas cópias ao entrar', () => {
    const tg = setup({ battlefield: [ilhas(8), []], hand: [[N], []] });
    tg.number('quantas vezes', 2).cast(N).resolveAll();
    const todos = tg.all(N);
    expect(todos).toHaveLength(3);
    expect(todos.filter((id) => tg.state.objects[id].isToken)).toHaveLength(2);
    expect(todos.every((id) => hasKw(tg.g, id, 'deathtouch'))).toBe(true);
    expect(tg.pt(todos[0])).toEqual([2, 1]);
    expect(tg.all('Island').every((i) => tg.state.objects[i].tapped)).toBe(true);
  });

  it('sem pagar o esquadrão, entra sozinho', () => {
    const tg = setup({ battlefield: [ilhas(2), []], hand: [[N], []] });
    tg.number('quantas vezes', 0).cast(N).resolveAll();
    expect(tg.all(N)).toHaveLength(1);
  });

  it('ao causar dano de combate a um jogador, cria uma ficha de Mutagen', () => {
    const tg = setup({ battlefield: [[N], []], library: [[], ['Island']] });
    tg.attack([[N, 1]]).passTo('main2');
    expect(tg.life(1)).toBe(38);
    expect(tg.all('Mutagen')).toHaveLength(1);
  });
});
