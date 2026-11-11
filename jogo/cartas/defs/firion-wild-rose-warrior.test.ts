import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/api.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Firion, Wild Rose Warrior';

describe(N, () => {
  it('as criaturas equipadas que você controla têm ímpeto', () => {
    const tg = setup({ battlefield: [[N, { name: 'Shadowspear', attachTo: 'Indomitable Ancients' }, { name: 'Indomitable Ancients', ready: false }, { name: 'Wall of Omens', ready: false }], []] });
    expect(hasKw(tg.g, tg.bf('Indomitable Ancients'), 'haste')).toBe(true);
    expect(hasKw(tg.g, tg.bf('Wall of Omens'), 'haste')).toBe(false);
  });

  it('a ficha copia o Equipamento sem os anexos e com o desconto de {2} em equipar; é sacrificada na próxima manutenção', () => {
    const tg = setup({ battlefield: [[N, 'Plains', 'Plains', 'Indomitable Ancients'], []], hand: [['Swiftfoot Boots'], []] });
    tg.cast('Swiftfoot Boots').resolveAll();
    const botas = tg.all('Swiftfoot Boots');
    expect(botas.length).toBe(2);
    const ficha = botas.find((id) => tg.state.objects[id].isToken)!;
    expect(tg.state.objects[ficha].attachedTo).toBeNull();
    // sem mana: só a ficha (equipar {1} - {2} = {0}) pode equipar
    const acts = tg.actionIds();
    expect(acts.some((a) => a.startsWith(`act:${ficha}:`))).toBe(true);
    expect(acts.some((a) => a.startsWith(`act:${botas.find((id) => id !== ficha)}:`))).toBe(false);
    tg.answer({ kind: 'priority', action: acts.find((a) => a.startsWith(`act:${ficha}:`))! });
    tg.choose('criatura alvo que você controla', ['Indomitable Ancients']).resolveAll();
    expect(tg.state.objects[ficha].attachedTo).toBe(tg.bf('Indomitable Ancients'));
    // na próxima manutenção (do oponente), a ficha é sacrificada
    tg.passTo('upkeep', 1).resolveAll();
    expect(tg.all('Swiftfoot Boots').length).toBe(1);
    expect(tg.state.objects[tg.bf('Swiftfoot Boots')].isToken).toBeFalsy();
  });

  it('a cópia de um Equipamento lendário cai na regra das lendas (CR 704.5j)', () => {
    const tg = setup({ battlefield: [[N, 'Plains', 'Plains'], []], hand: [['Shadowspear'], []] });
    tg.cast('Shadowspear').resolveAll();
    expect(tg.all('Shadowspear').length).toBe(1);
  });

  it('as habilidades de entrar do Equipamento copiado disparam para a ficha (Nettlecyst cria outro Germ)', () => {
    const tg = setup({ battlefield: [[N, 'Plains', 'Plains', 'Plains'], []], hand: [['Nettlecyst'], []] });
    tg.cast('Nettlecyst').resolveAll();
    expect(tg.all('Nettlecyst').length).toBe(2);
    expect(tg.all('Phyrexian Germ').length).toBe(2);
  });
});
