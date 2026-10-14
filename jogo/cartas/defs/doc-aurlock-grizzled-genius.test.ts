import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Doc Aurlock, Grizzled Genius';

describe(N, () => {
  it('uma mágica conjurada do cemitério ou do exílio custa {2} a menos; da mão, não', () => {
    // Faithless Looting: retrospectiva {2}{R} vira {R}; Kodama's Reach ({2}{G}) da mão continua custando 3
    const tg = setup({ battlefield: [[N, 'Mountain', 'Forest'], []], graveyard: [['Faithless Looting'], []], hand: [["Kodama's Reach"], []] });
    expect(tg.canCast("Kodama's Reach")).toBe(false);
    tg.cast('Faithless Looting', 'flashback').resolve();
    expect(tg.find('Faithless Looting', 'exile')).not.toBeNull();
  });

  it('do exílio também: a Prismatic Lens ({2}) exilada por Gonti sai sem nenhum terreno (Gonti {1}, Doc {2})', () => {
    const tg = setup({ battlefield: [[N, 'Gonti, Canny Acquisitor'], []], library: [Array(8).fill('Island'), ['Prismatic Lens', ...Array(8).fill('Island')]] });
    tg.attack([['Gonti, Canny Acquisitor', 1]]).passTo('main2', 0);
    const lente = tg.find('Prismatic Lens', 'exile')!;
    const acao = tg.actionIds().find((a) => a.startsWith('cast:') && a.split(':').includes(String(lente)));
    expect(acao).toBeDefined();
  });

  it('a redução não paga mana colorida', () => {
    const tg = setup({ battlefield: [[N, 'Island', 'Island', 'Island'], []], graveyard: [['Faithless Looting'], []] });
    expect(tg.actionIds().some((a) => a.startsWith('cast:') && a.endsWith(':flashback'))).toBe(false);
  });
});
