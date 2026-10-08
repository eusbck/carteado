import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const ilhas = ['Island', 'Island', 'Island', 'Island'];

describe('Polymorph', () => {
  it('destrói a criatura alvo; o controlador dela revela até uma carta de criatura, põe no campo e embaralha o resto', () => {
    const tg = setup({
      battlefield: [ilhas, ['Wall of Omens']], hand: [['Polymorph'], []],
      library: [[], ['Plains', 'Swamp', 'Indomitable Ancients', 'Forest']],
    });
    tg.choose('criatura alvo', ['Wall of Omens']).cast('Polymorph').resolve();
    expect(tg.names(1, 'graveyard')).toEqual(['Wall of Omens']);
    expect(tg.find('Indomitable Ancients', 'battlefield', 1)).not.toBeNull();
    // as duas reveladas voltam para o grimório, junto com a que não foi revelada
    expect(tg.names(1, 'library').sort()).toEqual(['Forest', 'Plains', 'Swamp']);
    expect(tg.state.log.some((l) => l.text.includes('Bruno revela Plains, Swamp, Indomitable Ancients'))).toBe(true);
  });

  it('criatura indestrutível não é destruída, mas o controlador revela e põe uma criatura no campo', () => {
    const tg = setup({ battlefield: [ilhas, ['Zetalpa, Primal Dawn']], hand: [['Polymorph'], []], library: [[], ['Plains', 'Elvish Mystic']] });
    tg.choose('criatura alvo', ['Zetalpa, Primal Dawn']).cast('Polymorph').resolve();
    expect(tg.find('Zetalpa, Primal Dawn')).not.toBeNull();
    expect(tg.find('Elvish Mystic', 'battlefield', 1)).not.toBeNull();
    expect(tg.names(1, 'library')).toEqual(['Plains']);
  });

  it('sem carta de criatura no grimório, revela tudo e embaralha; o alvo continua destruído', () => {
    const tg = setup({ battlefield: [ilhas, ['Wall of Omens']], hand: [['Polymorph'], []], library: [[], ['Plains', 'Swamp', 'Sol Ring']] });
    tg.choose('criatura alvo', ['Wall of Omens']).cast('Polymorph').resolve();
    expect(tg.names(1, 'graveyard')).toEqual(['Wall of Omens']);
    expect(tg.names(1, 'library').sort()).toEqual(['Plains', 'Sol Ring', 'Swamp']);
    expect(tg.state.log.some((l) => l.text.includes('Bruno revela Plains, Swamp, Sol Ring'))).toBe(true);
    expect(tg.state.zones.battlefield.filter((id) => tg.state.objects[id].controller === 1).length).toBe(0);
  });

  it('carta de artefato e criatura é carta de criatura', () => {
    const tg = setup({ battlefield: [ilhas, ['Wall of Omens']], hand: [['Polymorph'], []], library: [[], ['Sol Ring', 'Crashing Drawbridge', 'Indomitable Ancients']] });
    tg.choose('criatura alvo', ['Wall of Omens']).cast('Polymorph').resolve();
    expect(tg.find('Crashing Drawbridge', 'battlefield', 1)).not.toBeNull();
    expect(tg.find('Indomitable Ancients', 'battlefield', 1)).toBeNull();
  });

  it('quem revela é o controlador da criatura alvo (aqui, a própria Ana), e a criatura entra sob o controle dele', () => {
    const tg = setup({ battlefield: [[...ilhas, 'Elvish Mystic'], []], hand: [['Polymorph'], []], library: [['Indomitable Ancients'], ['Wall of Omens']] });
    tg.choose('criatura alvo', ['Elvish Mystic']).cast('Polymorph').resolve();
    // Ana mirou a própria criatura: é ela quem revela
    expect(tg.find('Indomitable Ancients', 'battlefield', 0)).not.toBeNull();
    expect(tg.names(1, 'library')).toEqual(['Wall of Omens']);
  });

  it('CR 608.2b: com o alvo ilegal, nada acontece', () => {
    const tg = setup({ battlefield: [ilhas, ['Wall of Omens', 'Plains']], hand: [['Polymorph'], ['Swords to Plowshares']], library: [[], ['Plains', 'Indomitable Ancients']] });
    tg.choose('criatura alvo', ['Wall of Omens']).cast('Polymorph').pass();
    tg.choose('criatura alvo', ['Wall of Omens']).cast('Swords to Plowshares').resolve();
    tg.resolve();
    expect(tg.state.zones.stack.length).toBe(0);
    expect(tg.find('Indomitable Ancients')).toBeNull();
    expect(tg.names(1, 'library')).toEqual(['Plains', 'Indomitable Ancients']);
  });
});
