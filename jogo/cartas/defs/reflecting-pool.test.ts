import { describe, expect, it } from 'vitest';
import { manaOptions } from '../../motor/costs.ts';
import { untilEndOfTurn } from '../../motor/api.ts';
import { setup, type CardSpec, type TestGame } from '../../testes/harness.ts';

const NOME = 'Reflecting Pool';
/** a habilidade impressa da Pool (sem as concedidas, como a de Chromatic Lantern) */
const HABILIDADE = `${NOME}#0.0`;

function tipos(tg: TestGame, id = tg.bf(NOME, 0)): string[] {
  return [...new Set(manaOptions(tg.g, 0).filter((o) => o.obj === id && o.abilityId === HABILIDADE).map((o) => o.alt.join('')))].sort();
}
const campo = (meu: (string | CardSpec)[], dele: (string | CardSpec)[] = []) => setup({ battlefield: [[NOME, ...meu], dele] });

function acao(tg: TestGame, rotulo: string): void {
  const d = tg.pending!;
  if (d.kind !== 'priority') throw new Error('sem prioridade');
  tg.answer({ kind: 'priority', action: d.actions.find((a) => a.label === rotulo)!.id });
  tg.settle();
}

describe(NOME, () => {
  it('CR 106.7: uma mana de um tipo que um terreno seu poderia produzir', () => {
    const tg = campo(['Forest', 'Island']);
    expect(tipos(tg)).toEqual(['G', 'U']);
    acao(tg, `${NOME}: adicionar {G}`);
    expect(tg.state.players[0].manaPool.map((u) => u.type)).toEqual(['G']);
    expect(tg.state.objects[tg.bf(NOME)].tapped).toBe(true);
  });
  it('não olha os terrenos dos oponentes', () => expect(tipos(campo([], ['Forest', 'Island']))).toEqual([]));
  it('considera as habilidades de mana dos seus terrenos, sem olhar custos nem se estão virados', () => {
    expect(tipos(campo([{ name: 'Swamp', tapped: true }]))).toEqual(['B']);
    // Sunken Ruins: {C} e o filtro {U/B}, {T} (custo que não dá para pagar agora)
    expect(tipos(campo(['Sunken Ruins']))).toEqual(['B', 'C', 'U']);
  });
  it('Reflecting Pools não se ajudam a produzir mana', () => {
    expect(tipos(campo([NOME]))).toEqual([]);
    const tg = campo([NOME, 'Mountain']);
    for (const id of tg.all(NOME)) expect(tipos(tg, id)).toEqual(['R']);
  });
  it('habilidades concedidas a um terreno mudam o que ele poderia produzir', () => {
    // Chromatic Lantern dá "{T}: Adicione uma mana de qualquer cor" à Forest
    expect(tipos(campo(['Forest', { name: 'Chromatic Lantern', tapped: true }]))).toEqual(['B', 'G', 'R', 'U', 'W']);
    // e um terreno que ganha um tipo básico ganha a mana desse tipo (CR 305.6)
    const tg = campo(['Kher Keep']);
    untilEndOfTurn({ g: tg.g, you: 0, source: tg.bf('Kher Keep') }, [tg.bf('Kher Keep')], [{ k: 'addTypes', subtypes: ['Island'] }]);
    tg.refresh();
    expect(tipos(tg)).toEqual(['C', 'U']);
  });
  it('produz incolor se um terreno seu produz {C}', () => expect(tipos(campo(['Kher Keep', 'Plains']))).toEqual(['C', 'W']));
  it('a mana não leva as restrições nem os efeitos extras dos outros terrenos', () => {
    // Path of Ancestry: a mana dele tem "quando for gasta numa criatura que compartilha tipo…, vidência 1"
    const tg = setup({ battlefield: [[NOME, 'Path of Ancestry'], []], command: [['Terra, Herald of Hope'], []] });
    expect(tipos(tg)).toEqual(['B', 'R', 'W']);
    acao(tg, `${NOME}: adicionar {R}`);
    acao(tg, 'Path of Ancestry: adicionar {W}');
    const [daPool, doPath] = tg.state.players[0].manaPool;
    expect(daPool.type).toBe('R');
    expect(daPool.onSpend).toBeUndefined();
    expect(daPool.restriction).toBeUndefined();
    expect(doPath.onSpend).toBeDefined();
  });
});
