import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { hasKw } from '../../motor/chars.ts';

const NOME = 'The Odd Acorn Gang';

describe(NOME, () => {
  it('um Squirrel seu vira para dar +2/+2 e atropelar a outro Squirrel, só como feitiço', () => {
    const tg = setup({ battlefield: [[NOME, { name: 'Squirrel', token: true }, { name: 'Squirrel', token: true }], []] });
    const [a, b] = tg.all('Squirrel');
    tg.choose('Squirrel alvo', [b]);
    const d = tg.pending!;
    if (d.kind !== 'priority') throw new Error('sem prioridade');
    const acao = d.actions.find((x) => x.obj === a && x.label.includes('+2/+2'))!;
    tg.answer({ kind: 'priority', action: acao.id });
    tg.settle();
    tg.resolve();
    expect(tg.pt(b)).toEqual([3, 3]);
    expect(hasKw(tg.g, b, 'trample')).toBe(true);
    expect(tg.state.objects[a].tapped).toBe(true);
  });

  it('um ou mais Squirrels causam dano de combate a um jogador: compre uma carta só', () => {
    const tg = setup({ battlefield: [[NOME, { name: 'Squirrel', token: true }, { name: 'Squirrel', token: true }], []], library: [['Island', 'Island'], []] });
    const [a, b] = tg.all('Squirrel');
    tg.attack([[a, 1], [b, 1]]).passTo('main2');
    expect(tg.life(1)).toBe(38);
    expect(tg.names(0, 'hand')).toEqual(['Island']);
  });
});
