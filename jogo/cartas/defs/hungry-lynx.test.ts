import { describe, expect, it } from 'vitest';
import { destroy } from '../../motor/api.ts';
import { hasKw, kwParams } from '../../motor/chars.ts';
import { blockCandidates } from '../../motor/combat.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Hungry Lynx';
const lib = Array(10).fill('Forest');

describe(N, () => {
  it('na sua etapa final, o oponente alvo cria um Rat 1/1 com toque mortífero', () => {
    const tg = setup({ battlefield: [[N], []], library: [lib, lib] });
    expect(tg.pt(tg.bf(N))).toEqual([2, 2]);
    tg.choose('oponente alvo', ['Bruno']);
    tg.passTo('upkeep', 1);
    const rato = tg.bf('Rat');
    expect(tg.state.objects[rato].controller).toBe(1);
    expect(tg.state.objects[rato].owner).toBe(1);
    expect(tg.pt(rato)).toEqual([1, 1]);
    expect(hasKw(tg.g, rato, 'deathtouch')).toBe(true);
  });

  it('os seus Cats têm proteção contra Rats: o Rat não os bloqueia', () => {
    const tg = setup({ battlefield: [[N, 'Elvish Mystic'], []], library: [lib, lib] });
    tg.choose('oponente alvo', ['Bruno']);
    tg.passTo('upkeep', 1);
    expect(kwParams(tg.g, tg.bf(N), 'protection')).toContain('subtype:Rat');
    tg.passTo('main1', 0);
    tg.script.length = 0;
    tg.attack([[N, 1], ['Elvish Mystic', 1]]).passTo('declareBlockers');
    const rato = blockCandidates(tg.g, 1).find((b) => b.obj === tg.bf('Rat'))!;
    expect(rato.canBlock).toEqual([tg.bf('Elvish Mystic')]);
  });

  it('quando um Rat morre, mesmo ficha, cada Cat seu ganha um marcador +1/+1', () => {
    const tg = setup({ battlefield: [[N, 'King of the Pride', 'Elvish Mystic'], []], library: [lib, lib] });
    tg.choose('oponente alvo', ['Bruno']);
    tg.passTo('upkeep', 1);
    tg.run(destroy(tg.g, [tg.bf('Rat')]));
    tg.resolveAll();
    expect(tg.state.objects[tg.bf(N)].counters['+1/+1']).toBe(1);
    expect(tg.state.objects[tg.bf('King of the Pride')].counters['+1/+1']).toBe(1);
    expect(tg.state.objects[tg.bf('Elvish Mystic')].counters['+1/+1'] ?? 0).toBe(0);
  });
});
