import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Casey Jones, Back Alley Brute';

describe(N, () => {
  it('ameaçar; quando ataca, põe um marcador numa atacante; cada leva de marcadores +1/+1 numa criatura sua vira dano num oponente', () => {
    const tg = setup({ battlefield: [[N], []] });
    expect(hasKw(tg.g, tg.bf(N), 'menace')).toBe(true);
    const vida = tg.life(1);
    tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('oponente alvo') ? { kind: 'select', ids: [d.items[0].id] } : null));
    tg.choose('criatura atacante alvo', [N]).attack([[N, 1]]).passTo('main2', 0);
    expect(tg.pt(tg.bf(N))).toEqual([5, 3]);
    expect(tg.life(1)).toBe(vida - 1 - 5);
  });
});