import { describe, expect, it } from 'vitest';
import { alternativasDeMana, entraVirado } from '../../testes/padroes.ts';
import { setup, type TestGame } from '../../testes/harness.ts';
import { chars } from '../../motor/chars.ts';
import { manaOptions } from '../../motor/costs.ts';
import { untap, untilEndOfTurn } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

const NOME = 'Restless Prairie';

/** ativa a habilidade de virar criatura e desvira o terreno, caso o pagamento automático o tenha usado */
function animar(tg: TestGame): ObjId {
  tg.activate(NOME, 'Llama').resolve();
  const id = tg.bf(NOME);
  untap(tg.g, id);
  tg.refresh();
  return id;
}

describe(NOME, () => {
  it('CR 605: mana que produz', () => expect(alternativasDeMana(NOME)).toEqual(['G', 'W']));
  it('CR 614.1c: entra virado', () => expect(entraVirado(NOME)).toBe(true));
  it('{2}{G}{W}: vira uma criatura Llama verde e branca 3/3 até o fim do turno, e continua terreno', () => {
    const tg = setup({ battlefield: [[NOME, 'Forest', 'Plains', 'Sol Ring'], []] });
    const id = animar(tg);
    const c = chars(tg.g, id);
    expect(c.types.sort()).toEqual(['Creature', 'Land']);
    expect(c.subtypes).toEqual(['Llama']);
    expect(c.colors.sort()).toEqual(['G', 'W']);
    expect(tg.pt(id)).toEqual([3, 3]);
    expect(manaOptions(tg.g, 0).some((o) => o.obj === id)).toBe(true);
    tg.passTo('upkeep', 1);
    expect(chars(tg.g, id).types).toEqual(['Land']);
  });
  it('sempre que ataca, as outras criaturas que você controla recebem +1/+1 até o fim do turno', () => {
    const tg = setup({ battlefield: [[NOME, 'Forest', 'Plains', 'Sol Ring', 'Elvish Mystic'], ['Wall of Omens']] });
    const id = animar(tg);
    tg.attack([[NOME, 1]]).passTo('declareBlockers');
    expect(tg.pt(tg.bf('Elvish Mystic'))).toEqual([2, 2]);
    expect(tg.pt(id)).toEqual([3, 3]); // ela mesma não recebe
    expect(tg.pt(tg.bf('Wall of Omens'))).toEqual([0, 4]);
  });
  it('CR 302.6: sem controle contínuo desde o início do turno, não ataca nem usa a mana', () => {
    const tg = setup({ battlefield: [[{ name: NOME, ready: false }, 'Forest', 'Plains', 'Sol Ring'], []] });
    expect(manaOptions(tg.g, 0).some((o) => o.obj === tg.bf(NOME))).toBe(true);
    const id = animar(tg);
    expect(manaOptions(tg.g, 0).some((o) => o.obj === id)).toBe(false);
    let candidatos: ObjId[] = [];
    tg.script.push((d) => (d.kind === 'attackers' ? (candidatos = d.candidates.map((x) => x.obj), { kind: 'attackers', attacks: [] }) : null));
    tg.passTo('main2');
    expect(candidatos).not.toContain(id);
  });
  it('dispara mesmo se virou criatura por outro efeito', () => {
    const tg = setup({ battlefield: [[NOME, 'Sol Ring', 'Elvish Mystic'], []] });
    const id = tg.bf(NOME);
    untilEndOfTurn({ g: tg.g, you: 0, source: tg.bf('Sol Ring') }, [id], [{ k: 'addTypes', types: ['Creature'] }, { k: 'setPT', p: 2, t: 2 }]);
    tg.refresh();
    tg.attack([[NOME, 1]]).passTo('declareBlockers');
    expect(tg.pt(tg.bf('Elvish Mystic'))).toEqual([2, 2]);
  });
});
