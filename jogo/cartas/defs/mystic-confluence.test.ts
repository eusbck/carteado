import { describe, expect, it } from 'vitest';
import { exile } from '../../motor/api.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Mystic Confluence';
const ilhas = Array(5).fill('Island');
const ANULAR = 'Anule a mágica alvo, a menos que quem a controla pague {3}';
const DEVOLVER = 'Devolva a criatura alvo para a mão do dono';
const COMPRAR = 'Compre uma carta';
const modos = (tg: ReturnType<typeof setup>, ...ms: string[]) => { for (const m of ms) tg.choose('escolha o modo', [m]); };

describe(N, () => {
  it('os três modos podem ser diferentes ou repetidos, e resolvem na ordem escrita', () => {
    const tg = setup({ battlefield: [ilhas, ['Indomitable Ancients', 'Elvish Mystic']], hand: [[N], []] });
    // escolhidos fora de ordem: comprar, devolver, devolver
    modos(tg, COMPRAR, DEVOLVER, DEVOLVER);
    tg.choose('criatura alvo', ['Indomitable Ancients']).choose('criatura alvo', ['Elvish Mystic']);
    tg.cast(N).resolveAll();
    expect(tg.names(1, 'hand').sort()).toEqual(['Elvish Mystic', 'Indomitable Ancients']);
    expect(tg.names(0, 'hand')).toEqual(['Forest']);
  });

  it('o mesmo modo três vezes: compra três cartas', () => {
    const tg = setup({ battlefield: [ilhas, []], hand: [[N], []] });
    modos(tg, COMPRAR, COMPRAR, COMPRAR);
    tg.cast(N).resolveAll();
    expect(tg.names(0, 'hand')).toHaveLength(3);
  });

  it('anula a mágica alvo se quem a controla não pagar {3}; pagando, ela resolve', () => {
    // o oponente conjura Sol Ring com uma Mountain: não tem como pagar {3}
    const tg = setup({ active: 1, battlefield: [ilhas, ['Mountain']], hand: [[N], ['Sol Ring']] });
    tg.cast('Sol Ring');
    tg.pass();
    expect(tg.pending?.player).toBe(0);
    modos(tg, ANULAR, COMPRAR, COMPRAR);
    tg.choose('mágica alvo', ['Sol Ring']).yes('Pagar {3}', false);
    tg.cast(N).resolve();
    expect(tg.find('Sol Ring')).toBeNull();
    expect(tg.find('Sol Ring', 'graveyard', 1)).not.toBeNull();
    expect(tg.names(0, 'hand')).toHaveLength(2);

    const paga = setup({ active: 1, battlefield: [ilhas, ['Mountain', 'Mountain', 'Mountain', 'Mountain']], hand: [[N], ['Sol Ring']] });
    paga.cast('Sol Ring');
    paga.pass();
    modos(paga, ANULAR, COMPRAR, COMPRAR);
    paga.choose('mágica alvo', ['Sol Ring']).yes('Pagar {3}', true);
    paga.cast(N).resolveAll();
    expect(paga.find('Sol Ring')).not.toBeNull();
    expect(paga.all('Mountain').every((id) => paga.state.objects[id].tapped)).toBe(true);
  });

  it('com todos os alvos ilegais, a mágica não resolve e você não compra', () => {
    const tg = setup({ battlefield: [ilhas, ['Elvish Mystic']], hand: [[N], []] });
    modos(tg, DEVOLVER, COMPRAR, COMPRAR);
    tg.choose('criatura alvo', ['Elvish Mystic']);
    tg.cast(N);
    tg.run(exile(tg.g, [tg.bf('Elvish Mystic')]));
    tg.resolveAll();
    expect(tg.names(0, 'hand')).toEqual([]);
    expect(tg.find(N, 'graveyard', 0)).not.toBeNull();
  });
});
