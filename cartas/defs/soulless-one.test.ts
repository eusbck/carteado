import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { destroy, untilEndOfTurn } from '../../motor/api.ts';

describe('Soulless One', () => {
  it('sozinho, conta a si mesmo: 1/1', () => {
    const tg = setup({ battlefield: [['Soulless One'], []] });
    expect(tg.pt(tg.bf('Soulless One'))).toEqual([1, 1]);
  });
  it('Zombies no campo de todos os jogadores mais cartas de Zombie em todos os cemitérios', () => {
    const tg = setup({
      battlefield: [['Soulless One', { name: 'Zombie 2/2', token: true }, 'Wall of Omens'], ["Stitcher's Supplier"]],
      graveyard: [['Undead Augur', 'Wall of Omens'], ['Midnight Reaper', 'Island']],
    });
    // campo: Soulless One, ficha, Stitcher's Supplier (3); cemitérios: Undead Augur, Midnight Reaper (2)
    expect(tg.pt(tg.bf('Soulless One'))).toEqual([5, 5]);
  });
  it('acompanha mudanças: ficha Zombie que morre deixa de contar (não vai como carta ao cemitério)', () => {
    const tg = setup({ battlefield: [['Soulless One', { name: 'Zombie 2/2', token: true }, "Stitcher's Supplier"], []], library: [['Island', 'Island', 'Island'], []] });
    expect(tg.pt(tg.bf('Soulless One'))).toEqual([3, 3]);
    tg.run(destroy(tg.g, [tg.bf('Zombie 2/2'), tg.bf("Stitcher's Supplier")]));
    tg.resolveAll();
    // Stitcher's Supplier agora é carta no cemitério; a ficha deixou de existir
    expect(tg.pt(tg.bf('Soulless One'))).toEqual([2, 2]);
  });
  it('CR 613.4a: camada 7a; bônus de outras camadas somam por cima', () => {
    const tg = setup({ battlefield: [['Soulless One', 'Lord of the Undead'], []] });
    const s = tg.bf('Soulless One');
    expect(tg.pt(s)).toEqual([3, 3]);
    untilEndOfTurn({ g: tg.g, you: 0, source: s }, [s], [{ k: 'pt', p: 2, t: 0 }]);
    tg.refresh();
    expect(tg.pt(tg.bf('Soulless One'))).toEqual([5, 3]);
  });
});
