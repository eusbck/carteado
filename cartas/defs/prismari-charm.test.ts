import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const ilhaMontanha = ['Island', 'Mountain'];

describe('Prismari Charm', () => {
  it('modo 1: vigiar 2, depois compra', () => {
    const tg = setup({ battlefield: [ilhaMontanha, []], hand: [['Prismari Charm'], []], library: [['Plains', 'Swamp', 'Forest'], []] });
    tg.choose('modo', ['Vigiar 2, depois compre uma carta']);
    tg.script.push((d) => (d.kind === 'arrange' ? { kind: 'arrange', order: d.items.map((i) => i.id), placement: { [d.items[0].id]: 'graveyard', [d.items[1].id]: 'top' } } : null));
    tg.cast('Prismari Charm').resolve();
    expect(tg.names(0, 'graveyard').sort()).toEqual(['Plains', 'Prismari Charm']);
    expect(tg.names(0, 'hand')).toEqual(['Swamp']);
  });
  it('modo 2: 1 de dano a cada um de um ou dois alvos', () => {
    const tg = setup({ battlefield: [ilhaMontanha, ['Elvish Mystic']], hand: [['Prismari Charm'], []] });
    tg.choose('modo', ['Causa 1 de dano a cada um de um ou dois alvos']).choose('um ou dois alvos', ['Elvish Mystic', 'Bruno']);
    tg.cast('Prismari Charm').resolve();
    expect(tg.find('Elvish Mystic')).toBeNull();
    expect(tg.life(1)).toBe(39);
  });
  it('modo 3: devolve permanente não terreno para a mão do dono', () => {
    const tg = setup({ battlefield: [ilhaMontanha, ['Sol Ring']], hand: [['Prismari Charm'], []] });
    tg.choose('modo', ['Devolva o permanente não terreno alvo para a mão do dono']).choose('permanente não terreno', ['Sol Ring']);
    tg.cast('Prismari Charm').resolve();
    expect(tg.names(1, 'hand')).toEqual(['Sol Ring']);
  });
});
