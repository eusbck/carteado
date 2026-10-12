import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { canBlock } from '../../motor/combat.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Speed, Young Avenger';

describe(N, () => {
  it('ímpeto; conjurando uma mágica que não é de criatura e pagando {1}, uma criatura com ímpeto só é bloqueada por criaturas com ímpeto', () => {
    const tg = setup({ battlefield: [[N, 'Mountain', 'Mountain'], ['Serra Angel', 'Leatherhead, Iron Gator']], hand: [['Sol Ring'], []] });
    const speed = tg.bf(N);
    expect(hasKw(tg.g, speed, 'haste')).toBe(true);
    expect(canBlock(tg.g, tg.bf('Serra Angel'), speed)).toBe(true);
    tg.script.push((d) => ('prompt' in d && String(d.prompt).includes('Speed') && d.kind === 'select' ? { kind: 'select', ids: [d.items[0].id] } : null));
    tg.yes('Speed', true).choose('criatura alvo com ímpeto', [N]).cast('Sol Ring').resolveAll();
    expect(canBlock(tg.g, tg.bf('Serra Angel'), speed)).toBe(false);
    expect(canBlock(tg.g, tg.bf('Leatherhead, Iron Gator'), speed)).toBe(true);
  });
});