import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Special Move';
const KICK = 'Jump Kick — Destrua o artefato alvo';
const DASH = 'Dash Attack — Coloque dois marcadores +1/+1 na criatura atacante ou bloqueadora alvo que você controla';
const TOSS = 'Foot Toss — A criatura alvo que você controla causa dano igual à força dela a qualquer outro alvo; depois, sacrifique-a';

describe(N, () => {
  it('Jump Kick e Foot Toss: destrói o artefato; a sua criatura causa dano igual à força e é sacrificada', () => {
    const tg = setup({ battlefield: [['Mountain', 'Mountain', 'Mountain', 'Serra Angel'], ['Sol Ring', 'Indomitable Ancients']], hand: [[N], []] });
    tg.choose('escolha', [KICK, TOSS]).choose('artefato alvo', ['Sol Ring']).choose('criatura alvo que você controla (Foot Toss)', ['Serra Angel']).choose('qualquer outro alvo', ['Indomitable Ancients']);
    tg.cast(N).resolveAll();
    expect(tg.find('Sol Ring')).toBeNull();
    expect(tg.state.objects[tg.bf('Indomitable Ancients')].damage).toBe(4);
    expect(tg.find('Serra Angel')).toBeNull();
  });

  it('Dash Attack: dois marcadores +1/+1 numa atacante sua', () => {
    const tg = setup({ battlefield: [['Mountain', 'Mountain', 'Mountain', 'Serra Angel'], ['Sol Ring']], hand: [[N], []] });
    tg.attack([['Serra Angel', 1]]).passTo('declareBlockers', 0);
    tg.choose('escolha', [KICK, DASH]).choose('artefato alvo', ['Sol Ring']).choose('criatura atacante ou bloqueadora alvo que você controla', ['Serra Angel']);
    tg.cast(N).resolveAll();
    expect(tg.pt(tg.bf('Serra Angel'))).toEqual([6, 6]);
  });
});