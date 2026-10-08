import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { addEffect, putOntoBattlefield } from '../../motor/api.ts';

const UR = 'The Ur-Sphinx';
const TERRENOS = (n: number) => ['Plains', 'Island', 'Swamp', ...Array(n - 3).fill('Plains')];
const conjuravel = (tg: ReturnType<typeof setup>, id: number, metodo: string) => tg.actionIds().includes(`cast:${id}:${metodo}`);

describe('The Ur-Sphinx', () => {
  it('eminência no campo: outras mágicas de Esfinge custam {1} a menos; outras mágicas não', () => {
    const tg = setup({ battlefield: [[UR, ...TERRENOS(8)], []], hand: [[UR, 'Indomitable Ancients'], []] });
    const mao = tg.find(UR, 'hand', 0)!;
    expect(conjuravel(tg, mao, 'hand')).toBe(true);
    // Indomitable Ancients ({2}{W}{W}) não é Esfinge: sem redução (testado com 3 terrenos)
    const tg2 = setup({ battlefield: [[UR, 'Plains', 'Plains', 'Plains'], []], hand: [['Indomitable Ancients'], []] });
    expect(tg2.canCast('Indomitable Ancients')).toBe(false);
    // com 7 terrenos, a Esfinge (9 - 1 = 8) não dá
    const tg3 = setup({ battlefield: [[UR, ...TERRENOS(7)], []], hand: [[UR], []] });
    expect(conjuravel(tg3, tg3.find(UR, 'hand', 0)!, 'hand')).toBe(false);
  });

  it('eminência na zona de comando: reduz outra Esfinge, mas não a si mesma', () => {
    const tg = setup({ battlefield: [TERRENOS(8), []], command: [[UR], []], hand: [[UR], []] });
    const mao = tg.find(UR, 'hand', 0)!;
    const cmd = tg.find(UR, 'command')!;
    expect(conjuravel(tg, mao, 'hand')).toBe(true);
    // a do comando custa {6}{W}{U}{B} cheio: a eminência não funciona na pilha
    expect(conjuravel(tg, cmd, 'command')).toBe(false);
    tg.cast(UR, 'hand').resolve();
    expect(tg.find(UR, 'battlefield', 0)).not.toBeNull();
    expect(tg.state.players[0].manaPool.length).toBe(0);
  });

  it('conjura na resolução, ignorando o tempo de feitiço, sem pagar o custo de mana e com X = 0', () => {
    const tg = setup({
      battlefield: [[UR], ['Wall of Omens']],
      library: [['Indomitable Ancients', 'Plains'], ["Black Sun's Zenith", 'Island']],
    });
    tg.choose('moída por Ana', ['Indomitable Ancients']).choose('moída por Bruno', ["Black Sun's Zenith"]);
    tg.attack([[UR, 1]]).passUntil((x) => x.state.turn.step === 'declareAttackers');
    // a habilidade dispara uma vez; cada jogador mói 1 (uma Esfinge atacou)
    tg.resolve();
    expect(tg.names(0, 'library')).toEqual(['Plains']);
    expect(tg.names(1, 'library')).toEqual(['Island']);
    // as duas mágicas foram conjuradas durante a resolução, na etapa de declarar atacantes (CR 608.2g)
    expect(tg.state.turn.step).toBe('declareAttackers');
    expect(tg.state.zones.stack.map((id) => tg.state.objects[id].def)).toEqual(['Indomitable Ancients', "Black Sun's Zenith"]);
    tg.resolveAll();
    // X = 0: nenhum marcador -1/-1; a mágica volta embaralhada ao grimório do dono
    expect(tg.state.objects[tg.bf('Wall of Omens')].counters['-1/-1'] ?? 0).toBe(0);
    expect(tg.names(1, 'library').sort()).toEqual(["Black Sun's Zenith", 'Island']);
    // a criatura do próprio grimório entrou sob controle de Ana, sem pagar mana
    expect(tg.find('Indomitable Ancients', 'battlefield', 0)).not.toBeNull();
  });

  it('pode conjurar a carta de um oponente; terrenos não se conjuram; mói quantas Esfinges atacaram', () => {
    const tg = setup({
      battlefield: [[UR, 'Indomitable Ancients'], []],
      library: [['Plains', 'Forest', 'Island'], ['Sol Ring', 'Swamp', 'Mountain']],
    });
    // Indomitable Ancients vira Esfinge: duas Esfinges atacam, cada jogador mói 2
    addEffect(tg.g, { source: tg.bf('Indomitable Ancients'), sourceDef: '', controller: 0, duration: { kind: 'permanent' }, affected: [tg.bf('Indomitable Ancients')], mods: [{ k: 'addTypes', subtypes: ['Sphinx'] }] });
    tg.refresh();
    tg.choose('moída por Bruno', ['Sol Ring']);
    tg.script.push((d) => { if (d.kind === 'select' && d.prompt.includes('moída por Ana')) throw new Error('terreno não pode ser conjurado'); return null; });
    tg.attack([[UR, 1], ['Indomitable Ancients', 1]]).passTo('declareBlockers');
    expect(tg.names(0, 'graveyard').sort()).toEqual(['Forest', 'Plains']);
    expect(tg.names(1, 'graveyard')).toEqual(['Swamp']);
    // Sol Ring de Bruno entrou sob o controle de Ana
    const sol = tg.bf('Sol Ring');
    expect(tg.state.objects[sol].controller).toBe(0);
    expect(tg.state.objects[sol].owner).toBe(1);
  });

  it('uma Esfinge que entra atacando não dispara a última habilidade', () => {
    const tg = setup({ battlefield: [[], []], step: 'declareAttackers', library: [['Plains'], ['Island']] });
    tg.run(putOntoBattlefield(tg.g, [{ controller: 0, token: { copyOf: { def: UR, face: 0, except: { legendary: false } } }, tapped: true, attacking: { kind: 'player', id: 1 } }], 'token'));
    tg.settle();
    expect(tg.state.zones.stack.length).toBe(0);
    expect(tg.names(0, 'library')).toEqual(['Plains']);
    expect(tg.names(1, 'library')).toEqual(['Island']);
    expect(tg.state.combat?.attackers.length).toBe(1);
  });

  it('uma criatura que não é Esfinge atacando sozinha não dispara', () => {
    const tg = setup({ battlefield: [[UR, 'Indomitable Ancients'], []], library: [['Plains'], ['Island']] });
    tg.attack([['Indomitable Ancients', 1]]).passTo('declareBlockers');
    expect(tg.names(0, 'library')).toEqual(['Plains']);
    expect(tg.names(1, 'library')).toEqual(['Island']);
  });
});
