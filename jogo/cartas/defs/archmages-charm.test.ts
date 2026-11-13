import { describe, expect, it } from 'vitest';
import { controllerOf, createTokens } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

const N = "Archmage's Charm";
const ilhas = ['Island', 'Island', 'Island'];

describe(N, () => {
  it('anula a mágica alvo', () => {
    const tg = setup({ active: 1, battlefield: [ilhas, ['Forest']], hand: [[N], ['Elvish Mystic']] });
    tg.cast('Elvish Mystic').pass().choose('modo(s)', ['Anule a mágica alvo']).cast(N).resolveAll();
    expect(tg.names(1, 'graveyard')).toEqual(['Elvish Mystic']);
  });
  it('o jogador alvo compra duas cartas', () => {
    const tg = setup({ battlefield: [ilhas, []], hand: [[N], []], library: [['Opt', 'Ponder', 'Forest'], []] });
    tg.choose('modo(s)', ['O jogador alvo compra duas cartas']).choose('jogador alvo', ['Ana']).cast(N).resolve();
    expect(tg.names(0, 'hand')).toEqual(['Opt', 'Ponder']);
  });
  it('ganha o controle de um permanente não terreno com valor de mana 1 ou menos; não mira os de 2 ou mais', () => {
    const tg = setup({ battlefield: [ilhas, ['Sol Ring', 'Mind Stone']], hand: [[N], []] });
    let alvos: string[] = [];
    tg.choose('modo(s)', ['Ganhe o controle do permanente não terreno alvo com valor de mana 1 ou menos']);
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('valor de mana 1 ou menos')) return null;
      alvos = d.items.map((i) => i.label);
      return { kind: 'select', ids: [d.items.find((i) => i.label === 'Sol Ring')!.id] };
    });
    tg.cast(N).resolve();
    expect(alvos).toEqual(['Sol Ring']);
    expect(controllerOf(tg.g, tg.bf('Sol Ring'))).toBe(0);
  });
  it('ganha o controle de uma ficha que não é cópia (valor de mana 0)', () => {
    const tg = setup({ battlefield: [ilhas, []], hand: [[N], []] });
    tg.run(createTokens(tg.g, 1, 'Treasure', 1));
    tg.choose('modo(s)', ['Ganhe o controle do permanente não terreno alvo com valor de mana 1 ou menos']).cast(N).resolve();
    expect(controllerOf(tg.g, tg.bf('Treasure'))).toBe(0);
  });
});
