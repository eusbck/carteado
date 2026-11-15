import { describe, expect, it } from 'vitest';
import { setup, type TestGame } from '../../testes/harness.ts';
import { alternativasDeMana, entraVirado } from '../../testes/padroes.ts';
import { chars, hasKw, untap, untilEndOfTurn } from '../../motor/api.ts';
import { manaOptions } from '../../motor/costs.ts';

const N = 'Restless Reef';
function animar(tg: TestGame) {
  tg.activate(N, 'Shark').resolve();
  const id = tg.bf(N);
  untap(tg.g, id);
  tg.refresh();
  return id;
}
describe(N, () => {
  it('entra virado e produz azul ou preto', () => {
    expect(entraVirado(N)).toBe(true);
    expect(alternativasDeMana(N)).toEqual(['B', 'U']);
  });
  it('vira Shark 4/4 azul e preto com toque mortífero, continua terreno e volta ao normal no fim do turno', () => {
    const tg = setup({ battlefield: [[N, 'Island', 'Swamp', 'Forest', 'Forest'], []], library: [['Forest'], ['Forest']] });
    const id = animar(tg);
    expect(chars(tg.g, id).types.sort()).toEqual(['Creature', 'Land']);
    expect(chars(tg.g, id).subtypes).toEqual(['Shark']);
    expect(chars(tg.g, id).colors.sort()).toEqual(['B', 'U']);
    expect(tg.pt(id)).toEqual([4, 4]);
    expect(hasKw(tg.g, id, 'deathtouch')).toBe(true);
    expect(manaOptions(tg.g, 0).some((o) => o.obj === id)).toBe(true);
    tg.passTo('upkeep', 1);
    expect(chars(tg.g, id).types).toEqual(['Land']);
    expect(chars(tg.g, id).colors).toEqual([]);
    expect(hasKw(tg.g, id, 'deathtouch')).toBe(false);
  });
  it('ao atacar, mói quatro cartas do jogador alvo antes do dano', () => {
    const tg = setup({ battlefield: [[N, 'Island', 'Swamp', 'Forest', 'Forest'], []], library: [[], ['Plains', 'Swamp', 'Forest', 'Mountain', 'Sol Ring']] });
    animar(tg);
    tg.choose('jogador alvo', ['Bruno']).attack([[N, 1]]).passTo('main2');
    expect(tg.names(1, 'graveyard')).toEqual(['Plains', 'Swamp', 'Forest', 'Mountain']);
    expect(tg.names(1, 'library')).toEqual(['Sol Ring']);
    expect(tg.life(1)).toBe(36);
  });
  it('dispara mesmo se outro efeito animar o terreno e permite mirar você mesmo', () => {
    const tg = setup({ battlefield: [[N, 'Sol Ring'], []], library: [['Plains', 'Swamp', 'Forest', 'Mountain', 'Island'], []] });
    untilEndOfTurn({ g: tg.g, you: 0, source: tg.bf('Sol Ring') }, [tg.bf(N)], [{ k: 'addTypes', types: ['Creature'] }, { k: 'setPT', p: 2, t: 2 }]);
    tg.refresh();
    tg.choose('jogador alvo', ['Ana']).attack([[N, 1]]).passTo('main2');
    expect(tg.names(0, 'graveyard')).toEqual(['Plains', 'Swamp', 'Forest', 'Mountain']);
  });
  it('CR 302.6: terreno recém-controlado animado não ataca nem produz mana', () => {
    const tg = setup({ battlefield: [[{ name: N, ready: false }, 'Island', 'Swamp', 'Forest', 'Forest'], []] });
    expect(manaOptions(tg.g, 0).some((o) => o.obj === tg.bf(N))).toBe(true);
    const id = animar(tg);
    expect(manaOptions(tg.g, 0).some((o) => o.obj === id)).toBe(false);
    let atacantes: number[] = [];
    tg.script.push((d) => d.kind === 'attackers' ? (atacantes = d.candidates.map((a) => a.obj), { kind: 'attackers', attacks: [] }) : null);
    tg.passTo('main2');
    expect(atacantes).not.toContain(id);
  });
});
