import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Fight for the Throne';
const jogar = (tg: ReturnType<typeof setup>) => tg.choose('criatura alvo que você controla', ['Serra Angel']).choose('criatura alvo que um oponente controla', ['Silver Myr']).cast(N).resolveAll();

describe(N, () => {
  it('um marcador +1/+1 na sua criatura, que luta com a do oponente; morrendo esta, com o seu comandante no campo, você vira o monarca', () => {
    const tg = setup({ battlefield: [['Forest', 'Forest', 'Serra Angel', { name: 'Elvish Mystic', commander: true }], ['Silver Myr']], hand: [[N], []] });
    jogar(tg);
    expect(tg.pt(tg.bf('Serra Angel'))).toEqual([5, 5]);
    expect(tg.state.objects[tg.bf('Serra Angel')].damage).toBe(1);
    expect(tg.find('Silver Myr')).toBeNull();
    expect(tg.state.monarch).toBe(0);
  });

  it('sem o seu comandante no campo, você não vira o monarca', () => {
    const tg = setup({ battlefield: [['Forest', 'Forest', 'Serra Angel'], ['Silver Myr']], hand: [[N], []] });
    jogar(tg);
    expect(tg.find('Silver Myr')).toBeNull();
    expect(tg.state.monarch).toBeNull();
  });
});