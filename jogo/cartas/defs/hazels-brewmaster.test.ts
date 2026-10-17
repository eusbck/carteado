import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const NOME = "Hazel's Brewmaster";

describe(NOME, () => {
  it('ao entrar, exila Chittering Witch de um cemitério e cria uma Food; a Food ganha a habilidade ativada da Witch', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Swamp', 'Swamp', 'Swamp', 'Swamp', 'Wall of Omens'], ['Indomitable Ancients']], hand: [[NOME], []], graveyard: [[], ['Chittering Witch']] });
    tg.choose('até uma carta alvo', ['Chittering Witch']).cast(NOME).resolveAll();
    expect(tg.names(1, 'exile')).toEqual(['Chittering Witch']);
    const food = tg.bf('Food');
    // a Food tem "{1}{B}, Sacrifique uma criatura: a criatura alvo recebe -2/-2"
    tg.choose('Sacrifique', ['Wall of Omens']).choose('criatura alvo', ['Indomitable Ancients']).activate('Food', '-2/-2').resolve();
    expect(tg.pt(tg.bf('Indomitable Ancients'))).toEqual([0, 8]);
    expect(tg.find('Food')).toBe(food);
  });

  it('sem alvo, cria só a Food', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Swamp', 'Swamp'], []], hand: [[NOME], []] });
    tg.cast(NOME).resolveAll();
    expect(tg.all('Food').length).toBe(1);
  });

  it('sempre que ataca, exila até uma carta alvo de um cemitério e cria outra Food', () => {
    const tg = setup({ battlefield: [[NOME], []], graveyard: [[], ['Gilded Goose']] });
    tg.choose('até uma carta alvo', ['Gilded Goose']);
    tg.attack([[NOME, 1]]).passTo('declareBlockers');
    expect(tg.names(1, 'exile')).toEqual(['Gilded Goose']);
    expect(tg.all('Food').length).toBe(1);
    // a Food tem as habilidades ativadas da Goose, inclusive a de mana
    const d = tg.pending!;
    expect(d.kind === 'priority' && d.actions.some((a) => a.obj === tg.bf('Food') && a.kind === 'mana')).toBe(true);
  });
});
