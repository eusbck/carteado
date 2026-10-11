import { describe, expect, it } from 'vitest';
import { destroy } from '../../motor/api.ts';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Sinister Concierge';
const A = 'Indomitable Ancients';
const tempo = (tg: ReturnType<typeof setup>, nome: string) => { const id = tg.find(nome, 'exile'); return id === null ? null : tg.state.objects[id].counters.time ?? 0; };

describe(N, () => {
  it('os dois são exilados com três marcadores de tempo; o dono de cada carta remove um por manutenção e a conjura de graça, com ímpeto', () => {
    const tg = setup({ battlefield: [[N], [A]] });
    expect(tg.pt(tg.bf(N))).toEqual([2, 1]);
    tg.choose('criatura alvo', [A]).yes(N, true);
    tg.run(destroy(tg.g, [tg.bf(N)]));
    tg.resolveAll();
    expect(tempo(tg, N)).toBe(3);
    expect(tempo(tg, A)).toBe(3);
    // cada dono remove na própria manutenção: a de Bruno primeiro
    tg.passTo('main1', 1);
    expect(tempo(tg, A)).toBe(2);
    expect(tempo(tg, N)).toBe(3);
    tg.passTo('main1', 0);
    expect(tempo(tg, N)).toBe(2);
    tg.passTo('main1', 1);
    tg.passTo('main1', 0);
    expect(tempo(tg, N)).toBe(1);
    // na terceira manutenção de Bruno sai o último marcador: ele conjura de graça, e a criatura tem ímpeto
    tg.yes('sem pagar o custo de mana', true);
    tg.passTo('main1', 1);
    const dele = tg.bf(A, 1);
    expect(tg.state.objects[dele].controller).toBe(1);
    expect(hasKw(tg.g, dele, 'haste')).toBe(true);
    tg.yes('sem pagar o custo de mana', true);
    tg.passTo('main1', 0);
    expect(tg.find(N)).not.toBeNull();
    expect(hasKw(tg.g, tg.bf(N), 'haste')).toBe(true);
  });

  it('é opcional: sem exilar, ele fica no cemitério e a criatura alvo fica no campo', () => {
    const tg = setup({ battlefield: [[N], [A]] });
    tg.choose('criatura alvo', [A]).yes(N, false);
    tg.run(destroy(tg.g, [tg.bf(N)]));
    tg.resolveAll();
    expect(tg.find(N, 'graveyard', 0)).not.toBeNull();
    expect(tg.find(A)).not.toBeNull();
  });

  it('pode não ter alvo: só ele é exilado com os marcadores', () => {
    const tg = setup({ battlefield: [[N], [A]] });
    tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('criatura alvo') && !d.prompt.startsWith(N) ? { kind: 'select', ids: [] } : null));
    tg.yes(N, true);
    tg.run(destroy(tg.g, [tg.bf(N)]));
    tg.resolveAll();
    expect(tempo(tg, N)).toBe(3);
    expect(tg.find(A)).not.toBeNull();
  });

  it('conjurar ao sair o último marcador é opcional; recusando, a carta fica exilada', () => {
    const tg = setup({ battlefield: [[N], []] });
    tg.yes(N, true);
    tg.run(destroy(tg.g, [tg.bf(N)]));
    tg.resolveAll();
    tg.yes('sem pagar o custo de mana', false);
    for (let i = 0; i < 3; i++) { tg.passTo('main1', 1); tg.passTo('main1', 0); }
    expect(tempo(tg, N)).toBe(0);
    expect(tg.find(N)).toBeNull();
  });
});
