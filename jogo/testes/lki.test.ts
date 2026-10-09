// A última informação conhecida (LKI, CR 608.2h) não muda depois de gravada: com CONGELAR_LKI=1 as entradas ficam
// congeladas (a suíte inteira roda assim para provar que nenhum código as muda), e as cópias do estado as compartilham.
import { describe, expect, it } from 'vitest';
import { CONGELAR_LKI, cloneState } from '../motor/state.ts';
import { setup } from './harness.ts';

describe('LKI', () => {
  it('as cópias do estado compartilham as entradas, mas cada uma tem o próprio mapa e o resto copiado', () => {
    const tg = setup({ battlefield: [['Elvish Mystic'], []], hand: [['Sol Ring', 'Sol Ring'], []] });
    tg.cast('Sol Ring');
    const s = tg.state;
    const ids = Object.keys(s.lki);
    expect(ids.length).toBeGreaterThan(0);
    const c = cloneState(s);
    expect(c.lki).not.toBe(s.lki);
    for (const k of ids) expect(c.lki[Number(k)]).toBe(s.lki[Number(k)]);
    expect(c.objects).not.toBe(s.objects);
    expect(JSON.stringify(c)).toBe(JSON.stringify(s));
    // a cópia grava as próprias entradas sem mexer no mapa do original (e vice-versa)
    c.lki[999999] = c.lki[Number(ids[0])];
    expect(s.lki[999999]).toBeUndefined();
    // a partida retomada de um checkpoint, e o fork, também compartilham
    const cp = tg.game.checkpoint()!;
    expect(cp.state.lki[Number(ids[0])]).toBe(s.lki[Number(ids[0])]);
    const f = tg.game.fork();
    expect(f.state.lki[Number(ids[0])]).toBe(s.lki[Number(ids[0])]);
    // e seguem independentes: o fork conjura o segundo Sol Ring sem mudar o original
    const antes = JSON.stringify(s);
    const d = f.pending!;
    if (d.kind !== 'priority') throw new Error('sem prioridade');
    const acao = d.actions.find((a) => a.kind === 'cast');
    if (acao) f.answer(d.player, { kind: 'priority', action: acao.id });
    expect(JSON.stringify(tg.state)).toBe(antes);
  });

  it.runIf(CONGELAR_LKI)('com CONGELAR_LKI=1, a entrada gravada e as das cópias do estado ficam congeladas', () => {
    const tg = setup({ battlefield: [['Elvish Mystic'], []], hand: [['Sol Ring'], []] });
    tg.cast('Sol Ring');
    const lki = Object.values(tg.state.lki);
    expect(lki.length).toBeGreaterThan(0);
    for (const e of lki) {
      expect(Object.isFrozen(e)).toBe(true);
      expect(Object.isFrozen(e.obj)).toBe(true);
      expect(Object.isFrozen(e.chars.abilities)).toBe(true);
      expect(() => { (e.obj as { tapped: boolean }).tapped = true; }).toThrow(TypeError);
    }
    const cp = tg.game.checkpoint()!;
    for (const e of Object.values(cp.state.lki)) expect(Object.isFrozen(e)).toBe(true);
  });
});
