import { describe, expect, it } from 'vitest';
import { enterCard, fixture as setup } from '../../testes/artefatos.ts';

const N = 'Markov Enforcer';

describe(N, () => {
  it('ao entrar, luta com até uma criatura de um oponente; se ela morrer no turno, cria um Blood', () => {
    const tg = setup({ battlefield: [[], ['Stromkirk Captain', 'Indomitable Ancients']] });
    tg.choose('criatura alvo', ['Stromkirk Captain']);
    const id = enterCard(tg, N, 0)!;
    tg.resolveAll();
    expect(tg.pt(id)).toEqual([6, 6]);
    expect(tg.find('Stromkirk Captain')).toBeNull();
    expect(tg.state.objects[id].damage).toBe(2);
    expect(tg.all('Blood')).toHaveLength(1);
  });

  it('outro Vampire seu entrando também faz o Enforcer lutar; é opcional', () => {
    const tg = setup({ battlefield: [[N], ['Indomitable Ancients']] });
    const id = tg.bf(N);
    tg.choose('criatura alvo', ['Indomitable Ancients']);
    enterCard(tg, 'Vampire Nighthawk', 0);
    tg.resolveAll();
    expect(tg.state.objects[tg.bf('Indomitable Ancients')].damage).toBe(6);
    expect(tg.state.objects[id].damage).toBe(2);
    tg.script.length = 0;
    tg.choose('criatura alvo', []);
    enterCard(tg, 'Stromkirk Condemned', 0);
    tg.resolveAll();
    expect(tg.state.objects[id].damage).toBe(2);
  });
});
