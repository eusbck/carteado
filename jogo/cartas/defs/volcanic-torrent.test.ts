import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Volcanic Torrent';

describe(N, () => {
  it('a cascata exila até achar uma carta mais barata, que pode ser conjurada de graça antes da Torrent', () => {
    const tg = setup({
      battlefield: [['Island', 'Island', 'Island', 'Mountain', 'Mountain'], []],
      hand: [[N], []], library: [['Forest', 'Opt', 'Plains', 'Plains'], []],
    });
    tg.yes('Cascata', true).cast(N).resolve();
    // a Opt conjurada pela cascata fica acima da Torrent
    expect(tg.find('Opt', 'stack')).not.toBeNull();
    tg.resolveAll();
    expect(tg.find('Opt', 'graveyard', 0)).not.toBeNull();
    // a Forest exilada foi para o fundo
    expect(tg.names(0, 'library').at(-1)).toBe('Forest');
  });

  it('X conta as mágicas conjuradas no turno, inclusive a conjurada pela cascata', () => {
    const tg = setup({
      battlefield: [['Island', 'Island', 'Island', 'Island', 'Mountain', 'Mountain', 'Wall of Omens'], ['Talrand, Sky Summoner', 'Indomitable Ancients']],
      hand: [['Opt', N], []], library: [['Swamp', 'Forest', 'Opt', 'Plains', 'Plains'], []],
    });
    tg.cast('Opt').resolveAll();
    tg.yes('Cascata', true).cast(N).resolveAll();
    // Opt, Torrent e a Opt da cascata: 3 de dano em cada criatura dos oponentes
    expect(tg.find('Talrand, Sky Summoner')).toBeNull();
    expect(tg.state.objects[tg.bf('Indomitable Ancients')].damage).toBe(3);
    expect(tg.state.objects[tg.bf('Wall of Omens')].damage).toBe(0);
  });
});
