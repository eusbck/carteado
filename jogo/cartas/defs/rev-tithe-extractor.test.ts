import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Rev, Tithe Extractor';

describe(N, () => {
  it('no dano de combate cria um Treasure e exila virada para baixo a carta do topo do grimório do jogador, que você pode conjurar pagando o custo', () => {
    const tg = setup({ battlefield: [[N, 'Forest', 'Forest'], []], library: [['Island'], ['Silver Myr', 'Island']] });
    tg.script.push((d) => { const i = d.kind === 'select' ? d.items.find((x) => x.label === N) : undefined; return i ? { kind: 'select', ids: [i.id] } : null; });
    tg.attack([[N, 1]]).passTo('declareBlockers', 0);
    expect(hasKw(tg.g, tg.bf(N), 'deathtouch')).toBe(true);
    tg.passTo('main2', 0);
    expect(tg.all('Treasure')).toHaveLength(1);
    const exilada = tg.find('Silver Myr', 'exile')!;
    expect(tg.state.objects[exilada].faceDown).toBe(true);
    expect(tg.canCast('Silver Myr')).toBe(true);
  });
});