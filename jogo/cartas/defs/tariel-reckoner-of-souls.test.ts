import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Tariel, Reckoner of Souls';

describe(N, () => {
  it('sorteia uma carta de criatura do cemitério do oponente alvo e a põe no campo sob o seu controle', () => {
    const tg = setup({ battlefield: [[N], []], graveyard: [[], ['Sol Ring', 'Indomitable Ancients', 'Island']] });
    const id = tg.bf(N);
    expect(tg.pt(id)).toEqual([4, 7]);
    expect(hasKw(tg.g, id, 'flying')).toBe(true);
    expect(hasKw(tg.g, id, 'vigilance')).toBe(true);
    tg.activate(N).resolveAll();
    expect(tg.state.objects[tg.bf('Indomitable Ancients')].controller).toBe(0);
    expect(tg.names(1, 'graveyard').sort()).toEqual(['Island', 'Sol Ring']);
    expect(tg.state.objects[id].tapped).toBe(true);
  });

  it('sem carta de criatura no cemitério, nada acontece', () => {
    const tg = setup({ battlefield: [[N], []], graveyard: [[], ['Sol Ring']] });
    tg.activate(N).resolveAll();
    expect(tg.names(1, 'graveyard')).toEqual(['Sol Ring']);
  });
});