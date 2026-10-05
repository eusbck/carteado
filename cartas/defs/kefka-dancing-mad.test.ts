import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { hasKw } from '../../motor/chars.ts';

describe('Kefka, Dancing Mad', () => {
  it('indestrutível só no seu turno; exila uma de cada cemitério, conjura de graça e o dono perde vida; as não conjuradas ficam no exílio', () => {
    const tg = setup({ players: 3, step: 'main2', battlefield: [['Kefka, Dancing Mad'], [], []], graveyard: [[], ["Night's Whisper"], ['Island']], library: [['Plains', 'Plains', 'Plains'], ['Island'], ['Island']] });
    const k = tg.bf('Kefka, Dancing Mad');
    expect(hasKw(tg.g, k, 'indestructible')).toBe(true);
    tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('Kefka: escolha') ? { kind: 'select', ids: [d.items.find((i) => i.label === "Night's Whisper")!.id] } : null));
    tg.yes('Conjurar');
    tg.passTo('end').resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Plains', 'Plains']);
    expect(tg.life(1)).toBe(38); // dono do Night's Whisper perde 2
    expect(tg.names(2, 'exile')).toEqual(['Island']);
  });
});
