import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { enterCard, fixture as setup } from '../../testes/artefatos.ts';

const N = 'Claim Jumper';

describe(N, () => {
  it('busca uma Plains virada e, se um oponente ainda tem mais terrenos, repete uma vez', () => {
    const tg = setup({ battlefield: [['Forest'], ['Island', 'Island', 'Island']], library: [['Plains', 'Sol Ring', 'Plains', 'Plains'], []] });
    tg.yes('Claim Jumper', true).choose('Claim Jumper', ['Plains']).yes('Claim Jumper', true).choose('Claim Jumper', ['Plains']);
    const id = enterCard(tg, N, 0)!;
    tg.resolveAll();
    expect(tg.pt(id)).toEqual([3, 3]);
    expect(hasKw(tg.g, id, 'vigilance')).toBe(true);
    const planicies = tg.all('Plains');
    expect(planicies).toHaveLength(2);
    expect(planicies.every((p) => tg.state.objects[p].tapped)).toBe(true);
    expect(tg.names(0, 'library')).toHaveLength(2);
  });

  it('com um terreno a menos só, busca uma vez; sem oponente com mais terrenos, não dispara', () => {
    const tg = setup({ battlefield: [['Forest'], ['Island', 'Island']], library: [['Plains', 'Plains'], []] });
    tg.yes('Claim Jumper', true).choose('Claim Jumper', ['Plains']);
    enterCard(tg, N, 0);
    tg.resolveAll();
    expect(tg.all('Plains')).toHaveLength(1);
  });

  it('sem oponente com mais terrenos, não dispara', () => {
    const tg = setup({ battlefield: [['Forest'], ['Island']], library: [['Plains'], []] });
    enterCard(tg, N, 0);
    tg.resolveAll();
    expect(tg.all('Plains')).toHaveLength(0);
  });
});
