import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { enterCard, fixture as setup } from '../../testes/artefatos.ts';

const N = 'Regal Caracal';
const lib = Array(10).fill('Forest');

describe(N, () => {
  it('os outros Cats seus recebem +1/+1 e vínculo com a vida; ao entrar, cria dois Cats 1/1 com vínculo com a vida', () => {
    const tg = setup({ battlefield: [['King of the Pride', 'Elvish Mystic'], []], library: [lib, lib] });
    const id = enterCard(tg, N, 0)!;
    tg.resolveAll();
    // o Caracal 3/3 recebe +2/+1 do King of the Pride e não dá bônus a si mesmo
    expect(tg.pt(id)).toEqual([5, 4]);
    expect(hasKw(tg.g, id, 'lifelink')).toBe(false);
    const rei = tg.bf('King of the Pride');
    expect(tg.pt(rei)).toEqual([3, 2]);
    expect(hasKw(tg.g, rei, 'lifelink')).toBe(true);
    const fichas = tg.all('Cat');
    expect(fichas).toHaveLength(2);
    // 1/1 +1/+1 do Caracal +2/+1 do King
    expect(tg.pt(fichas[0])).toEqual([4, 3]);
    expect(hasKw(tg.g, tg.bf('Elvish Mystic'), 'lifelink')).toBe(false);
  });

  it('as fichas já têm vínculo com a vida e ganham de novo do Caracal: o dano de cada uma dá a vida uma vez só', () => {
    const tg = setup({ battlefield: [[], []], library: [lib, lib] });
    enterCard(tg, N, 0);
    tg.resolveAll();
    const [ficha] = tg.all('Cat');
    tg.passTo('main1', 1);
    tg.passTo('main1', 0);
    tg.attack([[ficha, 1]]).passTo('main2', 0);
    expect(tg.life(1)).toBe(38);
    expect(tg.life(0)).toBe(42);
  });
});
