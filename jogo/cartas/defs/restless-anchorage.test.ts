import { describe, expect, it } from 'vitest';
import { alternativasDeMana, entraVirado } from '../../testes/padroes.ts';
import { setup, type TestGame } from '../../testes/harness.ts';
import { chars, hasKw } from '../../motor/chars.ts';
import { manaOptions } from '../../motor/costs.ts';
import { untap, untilEndOfTurn } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

const NOME = 'Restless Anchorage';

/** ativa a habilidade de virar criatura e desvira o terreno, caso o pagamento automático o tenha usado */
function animar(tg: TestGame): ObjId {
  tg.activate(NOME, 'Bird').resolve();
  const id = tg.bf(NOME);
  untap(tg.g, id);
  tg.refresh();
  return id;
}

describe(NOME, () => {
  it('CR 605: mana que produz', () => expect(alternativasDeMana(NOME)).toEqual(['U', 'W']));
  it('CR 614.1c: entra virado', () => expect(entraVirado(NOME)).toBe(true));
  it('{1}{W}{U}: vira uma criatura Bird branca e azul 2/3 com voar até o fim do turno, e continua terreno', () => {
    const tg = setup({ battlefield: [[NOME, 'Plains', 'Island', 'Mountain'], []] });
    const id = animar(tg);
    const c = chars(tg.g, id);
    expect(c.types.sort()).toEqual(['Creature', 'Land']);
    expect(c.subtypes).toEqual(['Bird']);
    expect(c.colors.sort()).toEqual(['U', 'W']);
    expect(tg.pt(id)).toEqual([2, 3]);
    expect(hasKw(tg.g, id, 'flying')).toBe(true);
    // continua com a habilidade de mana
    expect(manaOptions(tg.g, 0).some((o) => o.obj === id)).toBe(true);
    tg.passTo('upkeep', 1);
    expect(chars(tg.g, id).types).toEqual(['Land']);
    expect(chars(tg.g, id).colors).toEqual([]);
  });
  it('sempre que ataca, cria uma ficha de Mapa', () => {
    const tg = setup({ battlefield: [[NOME, 'Plains', 'Island', 'Mountain'], []] });
    animar(tg);
    tg.attack([[NOME, 1]]).passTo('main2');
    expect(tg.all('Map').length).toBe(1);
    expect(tg.state.objects[tg.bf('Map')].controller).toBe(0);
    expect(tg.life(1)).toBe(38);
  });
  it('CR 302.6: sem controle contínuo desde o início do turno, não ataca nem usa a mana', () => {
    const tg = setup({ battlefield: [[{ name: NOME, ready: false }, 'Plains', 'Island', 'Mountain'], []] });
    // antes de virar criatura, a mana pode ser usada normalmente
    expect(manaOptions(tg.g, 0).some((o) => o.obj === tg.bf(NOME))).toBe(true);
    const id = animar(tg);
    expect(manaOptions(tg.g, 0).some((o) => o.obj === id)).toBe(false);
    let candidatos: ObjId[] = [];
    tg.script.push((d) => (d.kind === 'attackers' ? (candidatos = d.candidates.map((x) => x.obj), { kind: 'attackers', attacks: [] }) : null));
    tg.passTo('main2');
    expect(candidatos).not.toContain(id);
    expect(tg.find('Map')).toBeNull();
  });
  it('dispara mesmo se virou criatura por outro efeito', () => {
    const tg = setup({ battlefield: [[NOME, 'Sol Ring'], []] });
    const id = tg.bf(NOME);
    // um efeito de outra fonte que anima o terreno
    untilEndOfTurn({ g: tg.g, you: 0, source: tg.bf('Sol Ring') }, [id], [{ k: 'addTypes', types: ['Creature'] }, { k: 'setPT', p: 3, t: 3 }]);
    tg.refresh();
    tg.attack([[NOME, 1]]).passTo('main2');
    expect(tg.all('Map').length).toBe(1);
    expect(tg.life(1)).toBe(37);
  });
  it('CR 111.10s: a ficha de Mapa faz a criatura alvo explorar', () => {
    const tg = setup({ battlefield: [[NOME, 'Plains', 'Island', 'Mountain', 'Mountain'], []], library: [['Counterspell'], []] });
    const id = animar(tg);
    tg.attack([[NOME, 1]]).passTo('main2');
    const mapa = chars(tg.g, tg.bf('Map'));
    expect([mapa.types, mapa.subtypes, mapa.colors]).toEqual([['Artifact'], ['Map'], []]);
    // na segunda fase principal o terreno ainda é criatura: explora e recebe +1/+1
    tg.yes('Explorar', false);
    tg.choose('criatura alvo', [NOME]).activate('Map').resolve();
    expect(tg.find('Map')).toBeNull();
    expect(tg.state.objects[id].counters['+1/+1']).toBe(1);
    expect(tg.pt(id)).toEqual([3, 4]);
    expect(tg.names(0, 'library')).toEqual(['Counterspell']);
  });
});
