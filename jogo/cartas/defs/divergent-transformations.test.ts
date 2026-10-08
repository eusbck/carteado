import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { chars } from '../../motor/chars.ts';

const montanhas = (n: number) => Array(n).fill('Mountain');

describe('Divergent Transformations', () => {
  it('em ordem APNAP, cada controlador troca a própria criatura', () => {
    const tg = setup({
      battlefield: [[...montanhas(6), 'Elvish Mystic'], ['Wall of Omens']],
      hand: [['Divergent Transformations'], []],
      library: [['Plains', 'Indomitable Ancients'], ['Swamp', 'Crashing Drawbridge', 'Island']],
    });
    tg.choose('criaturas alvo', ['Elvish Mystic', 'Wall of Omens']).cast('Divergent Transformations').resolve();
    expect(tg.names(0, 'exile')).toEqual(['Elvish Mystic']);
    expect(tg.names(1, 'exile')).toEqual(['Wall of Omens']);
    expect(tg.find('Indomitable Ancients', 'battlefield', 0)).not.toBeNull();
    expect(tg.find('Crashing Drawbridge', 'battlefield', 1)).not.toBeNull();
    expect(tg.names(0, 'library')).toEqual(['Plains']);
    expect(tg.names(1, 'library').sort()).toEqual(['Island', 'Swamp']);
    // Ana é a jogadora ativa: revela primeiro
    const revela = tg.state.log.filter((l) => l.text.includes(' revela ')).map((l) => l.text);
    expect(revela).toEqual(['Ana revela Plains, Indomitable Ancients.', 'Bruno revela Swamp, Crashing Drawbridge.']);
  });

  it('com dois oponentes custa {4}{R}; o valor de mana continua 7', () => {
    const tg = setup({
      players: 3,
      battlefield: [[...montanhas(6), 'Elvish Mystic'], ['Wall of Omens'], []],
      hand: [['Divergent Transformations'], [], []],
      library: [['Indomitable Ancients'], ['Crashing Drawbridge'], []],
    });
    tg.choose('criaturas alvo', ['Elvish Mystic', 'Wall of Omens']).cast('Divergent Transformations');
    const magica = tg.find('Divergent Transformations', 'stack')!;
    expect(chars(tg.g, magica).manaValue).toBe(7);
    const montanhasViradas = tg.state.zones.battlefield.filter((id) => tg.state.objects[id].def === 'Mountain' && tg.state.objects[id].tapped).length;
    expect(montanhasViradas).toBe(5);
    tg.resolve();
    expect(tg.find('Indomitable Ancients', 'battlefield', 0)).not.toBeNull();
    expect(tg.find('Crashing Drawbridge', 'battlefield', 1)).not.toBeNull();
  });

  it('duas criaturas do mesmo jogador: ele repete o processo duas vezes, uma criatura de cada vez', () => {
    const tg = setup({
      battlefield: [montanhas(6), ['Wall of Omens', 'Zetalpa, Primal Dawn']],
      hand: [['Divergent Transformations'], []],
      library: [[], ['Plains', 'Elvish Mystic', 'Indomitable Ancients']],
    });
    tg.choose('criaturas alvo', ['Wall of Omens', 'Zetalpa, Primal Dawn']).cast('Divergent Transformations').resolve();
    expect(tg.names(1, 'exile').sort()).toEqual(['Wall of Omens', 'Zetalpa, Primal Dawn']);
    expect(tg.find('Elvish Mystic', 'battlefield', 1)).not.toBeNull();
    expect(tg.find('Indomitable Ancients', 'battlefield', 1)).not.toBeNull();
    expect(tg.names(1, 'library')).toEqual(['Plains']);
    // duas revelações separadas, com embaralhamento entre elas
    expect(tg.state.log.filter((l) => l.text.startsWith('Bruno revela')).length).toBe(2);
  });

  it('se um dos alvos fica ilegal, só o outro é trocado', () => {
    const tg = setup({
      battlefield: [montanhas(6), ['Wall of Omens', 'Elvish Mystic', 'Plains']],
      hand: [['Divergent Transformations'], ['Swords to Plowshares']],
      library: [[], ['Indomitable Ancients', 'Crashing Drawbridge']],
    });
    tg.choose('criaturas alvo', ['Wall of Omens', 'Elvish Mystic']).cast('Divergent Transformations').pass();
    tg.choose('criatura alvo', ['Wall of Omens']).cast('Swords to Plowshares').resolve();
    tg.resolve();
    expect(tg.names(1, 'exile').sort()).toEqual(['Elvish Mystic', 'Wall of Omens']);
    expect(tg.state.zones.battlefield.filter((id) => tg.state.objects[id].controller === 1 && chars(tg.g, id).types.includes('Creature')).length).toBe(1);
    expect(tg.names(1, 'library').length).toBe(1);
  });

  it('sem carta de criatura no grimório, revela tudo e embaralha', () => {
    const tg = setup({
      battlefield: [montanhas(6), ['Wall of Omens', 'Elvish Mystic']],
      hand: [['Divergent Transformations'], []],
      library: [[], ['Plains', 'Swamp']],
    });
    tg.choose('criaturas alvo', ['Wall of Omens', 'Elvish Mystic']).cast('Divergent Transformations').resolve();
    expect(tg.names(1, 'exile').sort()).toEqual(['Elvish Mystic', 'Wall of Omens']);
    expect(tg.names(1, 'library').sort()).toEqual(['Plains', 'Swamp']);
    expect(tg.state.zones.battlefield.filter((id) => tg.state.objects[id].controller === 1).length).toBe(0);
  });

  it('CR 601.2c: sem duas criaturas alvo, não pode ser conjurada', () => {
    const tg = setup({ battlefield: [[...montanhas(6), 'Elvish Mystic'], []], hand: [['Divergent Transformations'], []] });
    expect(tg.canCast('Divergent Transformations')).toBe(false);
  });
});
