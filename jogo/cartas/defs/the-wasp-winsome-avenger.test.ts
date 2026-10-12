import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'The Wasp, Winsome Avenger';

describe(N, () => {
  it('lampejo e voar; ao entrar, o Hero alvo ganha resistência a magia até o fim do turno', () => {
    const tg = setup({ battlefield: [['Island', 'Island', 'Patriot, Shield Wielder', 'Silver Myr'], []], hand: [[N], []] });
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('Hero alvo')) return null;
      expect(d.items.map((i) => i.label)).not.toContain('Silver Myr');
      return { kind: 'select', ids: [d.items.find((i) => i.label === 'Patriot, Shield Wielder')!.id] };
    });
    tg.cast(N).resolveAll();
    for (const kw of ['flash', 'flying']) expect(hasKw(tg.g, tg.bf(N), kw)).toBe(true);
    expect(hasKw(tg.g, tg.bf('Patriot, Shield Wielder'), 'hexproof')).toBe(true);
  });

  it('atacando, vira uma criatura do jogador defensor', () => {
    const tg = setup({ players: 3, battlefield: [[N], ['Serra Angel'], ['Indomitable Ancients']] });
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('jogador defensor')) return null;
      expect(d.items.map((i) => i.label)).toEqual(['Serra Angel']);
      return { kind: 'select', ids: [d.items[0].id] };
    });
    tg.attack([[N, 1]]).passTo('declareBlockers', 0);
    expect(tg.state.objects[tg.bf('Serra Angel')].tapped).toBe(true);
  });
});