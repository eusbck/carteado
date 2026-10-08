import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const zumbisDe = (tg: ReturnType<typeof setup>, p: number) => tg.all('Zombie 2/2').filter((id) => tg.state.objects[id].controller === p).length;

describe('Kalitas, Traitor of Ghet', () => {
  it('CR 614.6: a criatura do oponente que morreria é exilada e você cria um Zumbi 2/2', () => {
    const tg = setup({ battlefield: [['Kalitas, Traitor of Ghet', 'Swamp', 'Swamp'], ['Indomitable Ancients']], hand: [['Infernal Grasp'], []] });
    tg.choose('criatura alvo', ['Indomitable Ancients']).cast('Infernal Grasp').resolve();
    expect(tg.find('Indomitable Ancients', 'exile')).not.toBeNull();
    expect(tg.names(1, 'graveyard')).toEqual([]);
    expect(zumbisDe(tg, 0)).toBe(1);
    expect(tg.pt(tg.all('Zombie 2/2')[0])).toEqual([2, 2]);
  });

  it('a criatura do oponente vai para o exílio: "quando morre" não dispara', () => {
    const tg = setup({ battlefield: [['Kalitas, Traitor of Ghet', 'Swamp', 'Swamp'], ['Solemn Simulacrum']], hand: [['Infernal Grasp'], []], library: [[], ['Island', 'Island']] });
    tg.yes('Solemn', true).choose('criatura alvo', ['Solemn Simulacrum']).cast('Infernal Grasp').resolveAll();
    expect(tg.find('Solemn Simulacrum', 'exile')).not.toBeNull();
    expect(tg.names(1, 'hand')).toEqual([]);
  });

  it('suas criaturas morrem normalmente', () => {
    const tg = setup({ battlefield: [['Kalitas, Traitor of Ghet', 'Indomitable Ancients', 'Swamp', 'Swamp'], []], hand: [['Infernal Grasp'], []] });
    tg.choose('criatura alvo', ['Indomitable Ancients']).cast('Infernal Grasp').resolve();
    expect(tg.names(0, 'graveyard')).toContain('Indomitable Ancients');
    expect(zumbisDe(tg, 0)).toBe(0);
  });

  it('ficha do oponente vai para o cemitério normalmente e não cria Zumbi', () => {
    const tg = setup({ battlefield: [['Kalitas, Traitor of Ghet', 'Swamp', 'Swamp'], [{ name: 'Zombie 2/2', token: true }]], hand: [['Infernal Grasp'], []] });
    tg.choose('criatura alvo', ['Zombie']).cast('Infernal Grasp').resolve();
    expect(tg.all('Zombie 2/2')).toEqual([]);
  });

  it('Kalitas morrendo junto com as criaturas do oponente ainda exila e cria os Zumbis', () => {
    const tg = setup({
      battlefield: [['Kalitas, Traitor of Ghet', 'Mountain', 'Mountain', 'Mountain', 'Mountain', 'Mountain', 'Mountain'], ['Indomitable Ancients', 'Wall of Omens']],
      hand: [['Blasphemous Act'], []],
    });
    tg.cast('Blasphemous Act').resolveAll();
    expect(tg.names(0, 'graveyard')).toContain('Kalitas, Traitor of Ghet');
    expect(tg.find('Indomitable Ancients', 'exile')).not.toBeNull();
    expect(tg.find('Wall of Omens', 'exile')).not.toBeNull();
    expect(zumbisDe(tg, 0)).toBe(2);
  });

  it('não dá para sacrificar o próprio Kalitas para a última habilidade', () => {
    const tg = setup({ battlefield: [['Kalitas, Traitor of Ghet', 'Swamp', 'Swamp', 'Swamp'], []] });
    expect(() => tg.activate('Kalitas, Traitor of Ghet')).toThrow(/indisponível/);
  });

  it('{2}{B}, sacrifique outro Zumbi: dois marcadores +1/+1', () => {
    const tg = setup({ battlefield: [['Kalitas, Traitor of Ghet', { name: 'Zombie 2/2', token: true }, 'Swamp', 'Swamp', 'Swamp'], []] });
    tg.activate('Kalitas, Traitor of Ghet').resolve();
    expect(tg.all('Zombie 2/2')).toEqual([]);
    expect(tg.pt(tg.bf('Kalitas, Traitor of Ghet'))).toEqual([5, 6]);
  });

  it('vínculo com a vida', () => {
    const tg = setup({ battlefield: [['Kalitas, Traitor of Ghet'], []] });
    tg.attack([['Kalitas, Traitor of Ghet', 1]]).passTo('main2');
    expect(tg.life(1)).toBe(37);
    expect(tg.life(0)).toBe(43);
  });
});
