import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Trading Post';

describe(N, () => {
  it('descartando: ganha 4 de vida; pagando 1 de vida: cria um Goat 0/1', () => {
    const tg = setup({ battlefield: [[N, 'Island'], []], hand: [['Forest'], []] });
    tg.activate(N, 'ganha 4 de vida').resolveAll();
    expect(tg.life(0)).toBe(44);
    expect(tg.names(0, 'graveyard')).toEqual(['Forest']);
    const outro = setup({ battlefield: [[N, 'Island'], []] });
    outro.activate(N, 'Goat').resolveAll();
    expect(outro.life(0)).toBe(39);
    expect(outro.pt(outro.bf('Goat'))).toEqual([0, 1]);
  });

  it('sacrificando uma criatura: devolve um artefato do cemitério; sacrificando um artefato: compra uma carta', () => {
    const tg = setup({ battlefield: [[N, 'Island', 'Elvish Mystic'], []], graveyard: [['Sol Ring', 'Forest'], []] });
    tg.choose('Sacrifique', ['Elvish Mystic']);
    tg.activate(N, 'Devolva a carta de artefato').resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Sol Ring']);
    expect(tg.find('Elvish Mystic')).toBeNull();
    const outro = setup({ battlefield: [[N, 'Island', 'Sol Ring'], []], library: [['Forest'], []] });
    outro.choose('Sacrifique', ['Sol Ring']);
    outro.activate(N, 'Compre uma carta').resolveAll();
    expect(outro.names(0, 'hand')).toEqual(['Forest']);
    expect(outro.find('Sol Ring')).toBeNull();
  });
});