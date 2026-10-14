import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/api.ts';
import { fixture } from '../../testes/artefatos.ts';

const N = 'Scrapshooter';

describe(N, () => {
  it('prometendo o presente, o oponente compra uma carta e o artefato dele é destruído', () => {
    const tg = fixture({ battlefield: [['Forest', 'Forest', 'Forest', 'Sol Ring'], ['Sol Ring']], hand: [[N], []] });
    tg.choose('presente', ['Prometer a Bruno']);
    tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('artefato ou encantamento alvo') ? { kind: 'select', ids: [d.items.find((i) => !i.disabled && tg.state.objects[i.obj!]?.controller === 1)!.id] } : null));
    tg.cast(N).resolveAll();
    expect(hasKw(tg.g, tg.bf(N), 'reach')).toBe(true);
    expect(tg.state.zones.hand[1]).toHaveLength(1);
    expect(tg.find('Sol Ring', 'battlefield', 1)).toBeNull();
    expect(tg.find('Sol Ring', 'battlefield', 0)).not.toBeNull();
  });

  it('sem prometer, ninguém compra e nada é destruído', () => {
    const tg = fixture({ battlefield: [['Forest', 'Forest', 'Forest'], ['Sol Ring']], hand: [[N], []] });
    tg.choose('presente', ['Não prometer']);
    tg.cast(N).resolveAll();
    expect(tg.state.zones.hand[1]).toHaveLength(0);
    expect(tg.find('Sol Ring')).not.toBeNull();
  });
});
