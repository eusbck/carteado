import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { chars } from '../../motor/chars.ts';
import { exile } from '../../motor/api.ts';

describe('Spirit of Resilience', () => {
  it('marcador e cópia até o fim do turno; virar cópia não dispara "ao entrar"', () => {
    const tg = setup({ battlefield: [['Spirit of Resilience'], []], graveyard: [['Wall of Omens', 'Island'], []], library: [['Plains', 'Plains'], ['Island']] });
    tg.choose('virar cópia', ['Virar uma cópia de Wall of Omens']);
    tg.run(exile(tg.g, [...tg.state.zones.graveyard[0]]));
    tg.resolveAll();
    const s = tg.state.zones.battlefield.find((id) => tg.state.objects[id].def === 'Spirit of Resilience')!;
    expect(chars(tg.g, s).name).toBe('Wall of Omens');
    expect(tg.pt(s)).toEqual([1, 5]);
    expect(tg.names(0, 'hand')).toEqual([]); // não comprou por "ao entrar"
    tg.passTo('cleanup');
    expect(chars(tg.g, s).name).toBe('Spirit of Resilience');
    expect(tg.pt(s)).toEqual([3, 3]);
  });
});
