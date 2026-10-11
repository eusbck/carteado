import { describe, expect, it } from 'vitest';
import { controllerOf } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Fractured Identity';
const terrenos = ['Plains', 'Island', 'Island', 'Island', 'Island'];

describe(N, () => {
  it('exila a permanente, e cada outro jogador cria uma cópia sem os marcadores dela', () => {
    const tg = setup({ players: 3, battlefield: [terrenos, [{ name: 'Indomitable Ancients', counters: { '+1/+1': 3 } }], []], hand: [[N], [], []] });
    tg.choose('alvo', ['Indomitable Ancients']).cast(N).resolveAll();
    expect(tg.find('Indomitable Ancients', 'exile')).not.toBeNull();
    const fichas = tg.all('Indomitable Ancients');
    expect(fichas).toHaveLength(2);
    expect(fichas.map((id) => controllerOf(tg.g, id)).sort()).toEqual([0, 2]);
    for (const id of fichas) {
      expect(tg.state.objects[id].isToken).toBe(true);
      expect(tg.pt(id)).toEqual([2, 10]);
    }
  });

  it('mirando uma permanente sua, só os outros jogadores criam a cópia', () => {
    const tg = setup({ battlefield: [[...terrenos, 'Sol Ring'], []], hand: [[N], []] });
    tg.choose('alvo', ['Sol Ring']).cast(N).resolveAll();
    const fichas = tg.all('Sol Ring');
    expect(fichas).toHaveLength(1);
    expect(controllerOf(tg.g, fichas[0])).toBe(1);
  });

  it('as habilidades de entrar da permanente copiada disparam para cada ficha', () => {
    // Wall of Omens: quando entra, compre uma carta
    const tg = setup({ battlefield: [terrenos, ['Wall of Omens']], hand: [[N], []] });
    tg.choose('alvo', ['Wall of Omens']).cast(N).resolveAll();
    expect(tg.names(0, 'hand')).toHaveLength(1);
    expect(tg.names(1, 'hand')).toHaveLength(0);
  });
});
