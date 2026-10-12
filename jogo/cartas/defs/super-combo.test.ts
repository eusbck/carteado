import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Super Combo';

describe(N, () => {
  it('a sua criatura causa dano igual à força à criatura de um oponente; replicar copia com novos alvos', () => {
    const tg = setup({ battlefield: [[...Array(4).fill('Forest'), 'Serra Angel'], ['Wall of Omens', 'Indomitable Ancients']], hand: [[N], []] });
    tg.number('quantas vezes', 1).choose('criatura alvo que você controla', ['Serra Angel']).choose('criatura alvo que um oponente controla', ['Wall of Omens']);
    tg.yes('novos alvos', true).choose('criatura alvo que você controla', ['Serra Angel']).choose('criatura alvo que um oponente controla', ['Indomitable Ancients']);
    tg.cast(N).resolveAll();
    expect(tg.find('Wall of Omens')).toBeNull();
    expect(tg.state.objects[tg.bf('Indomitable Ancients')].damage).toBe(4);
    expect(tg.state.objects[tg.bf('Serra Angel')].damage).toBe(0);
  });
});