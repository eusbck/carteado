import { describe, expect, it } from 'vitest';
import { enterCard, fixture as setup } from '../../testes/artefatos.ts';

const N = 'Annie Joins Up';

describe(N, () => {
  it('ao entrar, causa 5 de dano à criatura alvo de um oponente', () => {
    const tg = setup({ battlefield: [['Elvish Mystic'], ['Indomitable Ancients']], hand: [[N], []] });
    tg.choose('criatura ou planeswalker alvo', ['Indomitable Ancients']);
    enterCard(tg, N, 0);
    tg.resolveAll();
    expect(tg.state.objects[tg.bf('Indomitable Ancients')].damage).toBe(5);
  });

  it('a habilidade de uma criatura lendária sua dispara uma vez a mais; a do oponente, não', () => {
    // a sua Medusa (lendária) ganha dois marcadores; a do oponente, um
    const tg = setup({ battlefield: [[N, 'Medusa, Inhuman Queen', 'Island'], ['Medusa, Inhuman Queen']], hand: [['Sol Ring'], []] });
    const [minha] = tg.all('Medusa, Inhuman Queen').filter((id) => tg.state.objects[id].controller === 0);
    const [dele] = tg.all('Medusa, Inhuman Queen').filter((id) => tg.state.objects[id].controller === 1);
    tg.cast('Sol Ring').resolveAll();
    expect(tg.state.objects[minha].counters['+1/+1']).toBe(2);
    expect(tg.state.objects[dele].counters['+1/+1']).toBe(1);
  });
});
