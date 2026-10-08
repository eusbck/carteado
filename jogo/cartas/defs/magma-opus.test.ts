import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Magma Opus', () => {
  it('escolhe todos os alvos ao conjurar; divide 4 de dano com pelo menos 1 por alvo; o mesmo permanente pode receber dano e ser virado', () => {
    const tg = setup({
      battlefield: [['Island', 'Island', 'Island', 'Island', 'Mountain', 'Mountain', 'Mountain', 'Mountain'], ['Wall of Omens', 'Indomitable Ancients']],
      hand: [['Magma Opus'], []], library: [['Plains', 'Plains'], []],
    });
    tg.choose('alvos do dano dividido', ['Wall of Omens', 'Bruno']);
    tg.number('Wall of Omens', 3);
    tg.choose('dois permanentes alvo', ['Wall of Omens', 'Indomitable Ancients']);
    tg.cast('Magma Opus').resolve();
    expect(tg.state.objects[tg.bf('Wall of Omens')].damage).toBe(3);
    expect(tg.state.objects[tg.bf('Wall of Omens')].tapped).toBe(true);
    expect(tg.state.objects[tg.bf('Indomitable Ancients')].tapped).toBe(true);
    expect(tg.life(1)).toBe(39);
    expect(tg.pt(tg.bf('Elemental'))).toEqual([4, 4]);
    expect(tg.names(0, 'hand')).toEqual(['Plains', 'Plains']);
  });
  it('{U/R}{U/R}, descarte esta carta: cria um Tesouro', () => {
    const tg = setup({ battlefield: [['Island', 'Mountain'], []], hand: [['Magma Opus'], []] });
    tg.activate('Magma Opus').resolve();
    expect(tg.names(0, 'graveyard')).toEqual(['Magma Opus']);
    expect(tg.all('Treasure').length).toBe(1);
  });
});
