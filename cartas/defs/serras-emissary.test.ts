import { describe, expect, it } from 'vitest';
import { setup, type TestGame } from '../../testes/harness.ts';
import { hasKw, kwParams } from '../../motor/chars.ts';
import { canBlock } from '../../motor/combat.ts';

const EMISSARY = "Serra's Emissary";
const planicies = Array(7).fill('Plains');

/** responde à próxima escolha cujo prompt tem `trecho`, guardando as opções oferecidas */
function capturar(tg: TestGame, trecho: string, rotulo: string, ofertas: Record<string, string[]>): void {
  tg.script.push((d) => {
    if (d.kind !== 'select' || !d.prompt.includes(trecho)) return null;
    ofertas[trecho] = d.items.map((i) => i.label);
    return { kind: 'select', ids: [d.items.find((i) => i.label === rotulo)!.id] };
  });
}

describe(EMISSARY, () => {
  it('a escolha oferece só os nove tipos de carta', () => {
    const tg = setup({ battlefield: [planicies, []], hand: [[EMISSARY], []] });
    let ids: string[] = [];
    tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('tipo de carta') ? (ids = d.items.map((i) => i.id), { kind: 'select', ids: ['Land'] }) : null));
    tg.cast(EMISSARY).resolve();
    expect(ids).toEqual(['Artifact', 'Battle', 'Creature', 'Enchantment', 'Instant', 'Kindred', 'Land', 'Planeswalker', 'Sorcery']);
    expect(hasKw(tg.g, tg.bf(EMISSARY), 'flying')).toBe(true);
  });

  it('a escolha é feita ao entrar, sem pilha: ninguém responde antes da proteção', () => {
    const tg = setup({
      battlefield: [[...planicies, 'Wall of Omens'], ['Island', 'Mountain', 'Mountain', 'Elvish Mystic']],
      hand: [[EMISSARY], ['Prismari Command']],
    });
    tg.choose('tipo de carta', ['Instantânea']).cast(EMISSARY).resolve();
    // já entrou com a proteção; nada foi para a pilha
    expect(tg.state.zones.stack).toEqual([]);
    expect(kwParams(tg.g, tg.bf(EMISSARY), 'protection')).toEqual(['type:Instant']);
    expect(kwParams(tg.g, tg.bf('Wall of Omens'), 'protection')).toEqual(['type:Instant']);
    expect(kwParams(tg.g, tg.bf('Elvish Mystic'), 'protection')).toEqual([]);
    // Bruno recebe prioridade e conjura uma instantânea: Ana e as criaturas dela não são alvos legais (CR 702.16b)
    tg.pass();
    const ofertas: Record<string, string[]> = {};
    tg.choose('modo', ['Causa 2 de dano a qualquer alvo', 'O jogador alvo cria uma ficha de Tesouro']);
    capturar(tg, 'qualquer alvo', 'Bruno', ofertas);
    capturar(tg, 'jogador alvo que cria', 'Bruno', ofertas);
    tg.cast('Prismari Command').resolve();
    expect(ofertas['qualquer alvo'].sort()).toEqual(['Bruno', 'Elvish Mystic']);
    expect(ofertas['jogador alvo que cria']).toEqual(['Bruno']);
    expect(tg.life(1)).toBe(38);
  });

  it('Criatura: dano de criaturas a você e às suas criaturas é prevenido; criaturas não bloqueiam as suas', () => {
    const tg = setup({
      battlefield: [planicies, ['Goldspan Dragon', 'Village Pillagers']],
      hand: [[EMISSARY], []], library: [['Plains'], ['Island']],
    });
    tg.choose('tipo de carta', ['Criatura']).cast(EMISSARY).resolve();
    tg.attack([['Goldspan Dragon', 0], ['Village Pillagers', 0]]).block([[EMISSARY, 'Village Pillagers']]);
    tg.passTo('main2', 1);
    // CR 702.16e: os 4 do dragão em Ana e os 5 (murchar) dos Pillagers na Emissary são prevenidos
    expect(tg.life(0)).toBe(40);
    const em = tg.bf(EMISSARY);
    expect(tg.state.objects[em].counters).toEqual({});
    expect(tg.state.objects[em].damage).toBe(0);
    expect(tg.names(1, 'graveyard')).toEqual(['Village Pillagers']);
    // CR 702.16f: atacando, a Emissary não pode ser bloqueada por criaturas (nem pelo dragão voador)
    expect(canBlock(tg.g, tg.bf('Goldspan Dragon'), em)).toBe(false);
  });

  it('Artefato: o Equipamento solta das suas criaturas (CR 702.16d) e fica no campo', () => {
    const tg = setup({
      battlefield: [[...planicies, 'Wall of Omens', { name: 'Lightning Greaves', attachTo: 'Wall of Omens' }], []],
      hand: [[EMISSARY], []],
    });
    expect(hasKw(tg.g, tg.bf('Wall of Omens'), 'shroud')).toBe(true);
    tg.choose('tipo de carta', ['Artefato']).cast(EMISSARY).resolve();
    const botas = tg.bf('Lightning Greaves');
    expect(tg.state.objects[botas].attachedTo).toBeNull();
    expect(hasKw(tg.g, tg.bf('Wall of Omens'), 'shroud')).toBe(false);
  });
});
