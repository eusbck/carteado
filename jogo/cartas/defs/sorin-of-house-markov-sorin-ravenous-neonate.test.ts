import { describe, expect, it } from 'vitest';
import { gainLife } from '../../motor/api.ts';
import { chars, hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Sorin of House Markov // Sorin, Ravenous Neonate';

/** Sorin já transformado no campo, com a lealdade inicial */
function comNeonato(o: Parameters<typeof setup>[0] = {}) {
  const tg = setup(o);
  const id = tg.bf(N);
  tg.state.objects[id].face = 1;
  tg.state.objects[id].counters.loyalty = 3;
  tg.refresh();
  return { tg, id };
}

describe(N, () => {
  it('ganhou 3 de vida no turno: na fase principal pós-combate volta transformado com 3 de lealdade', () => {
    const tg = setup({ battlefield: [[N], []] });
    gainLife(tg.g, 0, 3, null);
    tg.passTo('main2');
    tg.resolveAll();
    const id = tg.bf(N);
    expect(tg.state.objects[id].face).toBe(1);
    expect(chars(tg.g, id).types).toContain('Planeswalker');
    expect(tg.state.objects[id].counters.loyalty).toBe(3);
  });

  it('sem 3 de vida ganhos no turno, o gatilho não dispara', () => {
    const tg = setup({ battlefield: [[N], []] });
    gainLife(tg.g, 0, 2, null);
    tg.passTo('main2');
    expect(tg.state.zones.stack).toHaveLength(0);
    expect(tg.state.objects[tg.bf(N)].face ?? 0).toBe(0);
  });

  it('frente: vínculo com a vida e extorquir', () => {
    const tg = setup({ battlefield: [[N, 'Swamp', 'Swamp'], []], hand: [['Sol Ring'], []] });
    expect(hasKw(tg.g, tg.bf(N), 'lifelink')).toBe(true);
    tg.yes('extorquir', true).cast('Sol Ring').resolveAll();
    expect([tg.life(0), tg.life(1)]).toEqual([41, 39]);
  });

  it('+2: cria uma Food', () => {
    const { tg, id } = comNeonato({ battlefield: [[N], []] });
    tg.activate('Sorin, Ravenous Neonate', '+2').resolve();
    expect(tg.bf('Food')).toBeTruthy();
    expect(tg.state.objects[id].counters.loyalty).toBe(5);
  });

  it('−1 causa dano igual a toda a vida ganha no turno', () => {
    const { tg } = comNeonato({ battlefield: [[N], ['Indomitable Ancients']] });
    gainLife(tg.g, 0, 4, null);
    tg.state.players[0].life -= 4; // perder vida não desconta (ruling 11)
    tg.choose('alvo', ['Indomitable Ancients']).activate('Sorin, Ravenous Neonate', '−1').resolve();
    expect(tg.state.objects[tg.bf('Indomitable Ancients')].damage).toBe(4);
  });

  it('−6 toma o controle para sempre, faz Vampire e, com outro permanente branco, põe vínculo com a vida', () => {
    const { tg, id } = comNeonato({ battlefield: [[N, 'Wall of Omens'], ['Indomitable Ancients']] });
    tg.state.objects[id].counters.loyalty = 6;
    tg.refresh();
    tg.choose('criatura alvo', ['Indomitable Ancients']).activate('Sorin, Ravenous Neonate', '−6').resolve();
    const alvo = tg.bf('Indomitable Ancients');
    expect(chars(tg.g, alvo).controller).toBe(0);
    expect(chars(tg.g, alvo).subtypes).toContain('Vampire');
    expect(hasKw(tg.g, alvo, 'lifelink')).toBe(true);
    tg.passTo('main1', 1);
    expect(chars(tg.g, alvo).controller).toBe(0);
  });
});
