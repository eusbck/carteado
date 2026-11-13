import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Kodama of the West Tree';

describe(N, () => {
  it('a Aura de um oponente não modifica a sua criatura; marcador e Equipamento de qualquer um, sim', () => {
    const tg = setup({
      battlefield: [[N, 'Silver Myr', { name: 'Llanowar Elves', counters: { stun: 1 } }, 'Indomitable Ancients'],
        ['Shadowspear', { name: 'Ethereal Armor', attachTo: 'Silver Myr' }]],
    });
    expect(hasKw(tg.g, tg.bf('Silver Myr'), 'trample')).toBe(false);
    expect(hasKw(tg.g, tg.bf('Llanowar Elves'), 'trample')).toBe(true);
    expect(hasKw(tg.g, tg.bf(N), 'trample')).toBe(false);
    // o Equipamento do oponente anexado à sua criatura também a modifica
    tg.state.objects[tg.bf('Shadowspear')].attachedTo = tg.bf('Indomitable Ancients');
    tg.refresh();
    expect(hasKw(tg.g, tg.bf('Indomitable Ancients'), 'trample')).toBe(true);
  });

  it('quando uma criatura modificada sua causa dano de combate a um jogador, busca um terreno básico virado', () => {
    const tg = setup({
      battlefield: [[N, { name: 'Silver Myr', counters: { '+1/+1': 1 } }], []],
      library: [['Forest', 'Island', 'Plains'], ['Island', 'Island']], step: 'beginCombat',
    });
    tg.choose('terreno básico', ['Plains']);
    tg.attack([['Silver Myr', 1]]).passTo('main2', 0);
    const p = tg.find('Plains', 'battlefield', 0);
    expect(p).not.toBeNull();
    expect(tg.state.objects[p!].tapped).toBe(true);
    expect(tg.life(1)).toBe(40 - 2);
  });
});
