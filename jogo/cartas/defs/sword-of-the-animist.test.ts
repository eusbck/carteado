import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Sword of the Animist';

describe(N, () => {
  it('a criatura equipada recebe +1/+1 e, atacando, busca um terreno básico virado', () => {
    const tg = setup({ battlefield: [['Silver Myr', { name: N, attachTo: 'Silver Myr' }, 'Elvish Mystic'], []], library: [['Sol Ring', 'Forest', 'Island'], []] });
    expect(tg.pt(tg.bf('Silver Myr'))).toEqual([2, 2]);
    tg.yes('', true);
    tg.choose('terreno básico', ['Forest']);
    tg.attack([['Silver Myr', 1]]).passTo('declareBlockers');
    const f = tg.bf('Forest');
    expect(tg.state.objects[f].tapped).toBe(true);
    expect(tg.names(0, 'library')).toHaveLength(2);
  });

  it('outra criatura atacando não dispara', () => {
    const tg = setup({ battlefield: [['Silver Myr', { name: N, attachTo: 'Silver Myr' }, 'Elvish Mystic'], []], library: [['Forest'], []] });
    tg.attack([['Elvish Mystic', 1]]).passTo('declareBlockers');
    expect(tg.find('Forest')).toBeNull();
  });
});