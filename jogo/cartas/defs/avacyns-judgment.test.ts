import { describe, expect, it } from 'vitest';
import { discard } from '../../motor/actions.ts';
import { setup } from '../../testes/harness.ts';

const N = "Avacyn's Judgment";
const montanhas = (n: number) => Array(n).fill('Mountain');

describe(N, () => {
  it('conjurada da mão, causa 2 de dano dividido entre os alvos escolhidos', () => {
    const tg = setup({ battlefield: [montanhas(2), ['Indomitable Ancients']], hand: [[N], []] });
    tg.choose('alvos do dano dividido', ['Bruno', 'Indomitable Ancients']);
    tg.cast(N).resolveAll();
    // um para cada alvo (cada alvo recebe pelo menos 1)
    expect(tg.life(1)).toBe(39);
    expect(tg.state.objects[tg.bf('Indomitable Ancients')].damage).toBe(1);
  });

  it('conjurada da mão com um alvo só, os 2 de dano vão para ele', () => {
    const tg = setup({ battlefield: [montanhas(2), []], hand: [[N], []] });
    tg.choose('alvos do dano dividido', ['Bruno']);
    tg.cast(N).resolveAll();
    expect(tg.life(1)).toBe(38);
  });

  it('conjurada pela loucura no turno de outro jogador, causa X de dano dividido', () => {
    // {X}{R} com seis Mountains: X = 5
    const tg = setup({ active: 1, battlefield: [montanhas(6), []], hand: [[N], []] });
    tg.yes('Loucura', true).number('valor de X', 5).choose('alvos do dano dividido', ['Bruno']);
    tg.run(discard(tg.g, 0, 1));
    tg.resolveAll();
    expect(tg.life(1)).toBe(35);
    expect(tg.find(N, 'graveyard', 0)).not.toBeNull();
    expect(tg.state.turn.active).toBe(1);
  });

  it('sem conjurar, vai para o cemitério', () => {
    const tg = setup({ battlefield: [montanhas(3), []], hand: [[N], []] });
    tg.yes('Loucura', false);
    tg.run(discard(tg.g, 0, 1));
    tg.resolveAll();
    expect(tg.find(N, 'graveyard', 0)).not.toBeNull();
    expect(tg.life(1)).toBe(40);
  });
});
