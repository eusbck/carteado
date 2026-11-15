import { describe, expect, it } from 'vitest';
import { chars, hasKw } from '../../motor/api.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Magda, the Hoardmaster';
const tesouros = (n: number) => Array.from({ length: n }, () => ({ name: 'Treasure', token: true, tapped: true }));

describe(N, () => {
  it('mirar uma criatura alheia é crime e mirar uma criatura sua não é', () => {
    const tg = setup({ battlefield: [[N, 'Swamp', 'Swamp', 'Swamp', 'Swamp', 'Wall of Omens'], ['Indomitable Ancients']], hand: [['Infernal Grasp', 'Infernal Grasp'], []] });
    tg.choose('criatura alvo', ['Wall of Omens']).cast('Infernal Grasp').resolveAll();
    expect(tg.all('Treasure')).toHaveLength(0);
    tg.choose('criatura alvo', ['Indomitable Ancients']).cast('Infernal Grasp').resolveAll();
    expect(tg.all('Treasure')).toHaveLength(1);
    expect(tg.state.objects[tg.bf('Treasure')].tapped).toBe(true);
  });
  it('cria o Tesouro antes de a mágica criminosa resolver e só dispara uma vez no turno', () => {
    const tg = setup({ battlefield: [[N, 'Swamp', 'Swamp', 'Swamp', 'Swamp'], ['Indomitable Ancients', 'Wall of Omens']], hand: [['Infernal Grasp', 'Infernal Grasp'], []] });
    tg.choose('criatura alvo', ['Indomitable Ancients']).cast('Infernal Grasp');
    expect(tg.state.zones.stack).toHaveLength(2);
    tg.resolve();
    expect(tg.find('Indomitable Ancients')).not.toBeNull();
    expect(tg.all('Treasure')).toHaveLength(1);
    tg.resolveAll().choose('criatura alvo', ['Wall of Omens']).cast('Infernal Grasp').resolveAll();
    expect(tg.all('Treasure')).toHaveLength(1);
  });
  it('pode disparar novamente no turno do oponente', () => {
    const tg = setup({ battlefield: [[N, 'Swamp', 'Swamp', 'Swamp', 'Swamp'], ['Indomitable Ancients', 'Wall of Omens']], hand: [['Infernal Grasp', 'Infernal Grasp'], []] });
    tg.choose('criatura alvo', ['Indomitable Ancients']).cast('Infernal Grasp').resolveAll().passTo('main1', 1).pass();
    tg.choose('criatura alvo', ['Wall of Omens']).cast('Infernal Grasp').resolveAll();
    expect(tg.all('Treasure')).toHaveLength(2);
  });
  it('sacrifica três Tesouros, mesmo virados, para criar Escorpião Dragão vermelho 4/4 com voar e ímpeto', () => {
    const tg = setup({ battlefield: [[N, ...tesouros(3)], []] });
    tg.activate(N).resolveAll();
    expect(tg.all('Treasure')).toHaveLength(0);
    const id = tg.bf('Scorpion Dragon');
    expect(tg.pt(id)).toEqual([4, 4]);
    expect(chars(tg.g, id).colors).toEqual(['R']);
    expect(chars(tg.g, id).subtypes).toEqual(['Scorpion', 'Dragon']);
    expect(hasKw(tg.g, id, 'flying')).toBe(true);
    expect(hasKw(tg.g, id, 'haste')).toBe(true);
  });
  it('exige três Tesouros e só ativa como feitiço, com a pilha vazia', () => {
    const pouca = setup({ battlefield: [[N, ...tesouros(2), 'Sol Ring'], []] });
    expect(() => pouca.activate(N)).toThrow('Ação indisponível');
    const foraDaFase = setup({ step: 'beginCombat', battlefield: [[N, ...tesouros(3)], []] });
    expect(() => foraDaFase.activate(N)).toThrow('Ação indisponível');
    const tg = setup({ battlefield: [[N, ...tesouros(3), 'Swamp', 'Swamp'], ['Wall of Omens']], hand: [['Infernal Grasp'], []] });
    tg.cast('Infernal Grasp');
    expect(() => tg.activate(N)).toThrow('Ação indisponível');
  });
});
