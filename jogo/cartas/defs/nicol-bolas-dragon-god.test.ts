import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { chars } from '../../motor/chars.ts';
import { registry } from '../../motor/defs.ts';
import type { Decision } from '../../motor/types.ts';

const BOLAS = 'Nicol Bolas, Dragon-God';
const JACE = 'Jace, Multiverse Architect';
const QUINTORIUS = 'Quintorius, History Chaser';

const tipos = (id: string) => registry.abilities.get(id)?.kind;

describe('Nicol Bolas, Dragon-God', () => {
  it('Bolas não ganha estáticas, disparadas nem ativadas sem lealdade dos outros planeswalkers', () => {
    const tg = setup({ battlefield: [[BOLAS], [JACE, QUINTORIUS]] });
    const b = chars(tg.g, tg.bf(BOLAS)).abilities.map((a) => a.id);
    const jace = chars(tg.g, tg.bf(JACE)).abilities.map((a) => a.id);
    const quint = chars(tg.g, tg.bf(QUINTORIUS)).abilities.map((a) => a.id);
    // as de lealdade de Jace (+1, −3) e de Quintorius (+1, −4), de planeswalkers de outro jogador
    for (const id of [...jace, ...quint].filter((x) => tipos(x) === 'activated')) expect(b).toContain(id);
    // não as disparadas (o gatilho de combate de Jace, o de cemitério de Quintorius)
    for (const id of [...jace, ...quint].filter((x) => tipos(x) === 'triggered')) expect(b).not.toContain(id);
    // as próprias + 4 ganhas
    expect(b.length).toBe(4 + 4);
  });

  it('o outro planeswalker continua com as próprias habilidades de lealdade', () => {
    const tg = setup({ battlefield: [[BOLAS], [JACE]] });
    const jace = chars(tg.g, tg.bf(JACE)).abilities.filter((a) => tipos(a.id) === 'activated');
    expect(jace.length).toBe(2);
    // sem outros planeswalkers, Bolas só tem as dele
    const tg2 = setup({ battlefield: [[BOLAS], []] });
    expect(chars(tg2.g, tg2.bf(BOLAS)).abilities.length).toBe(4);
  });

  it('mesmo com várias habilidades, só uma de lealdade por turno', () => {
    const tg = setup({ battlefield: [[BOLAS], [JACE]], hand: [['Sol Ring'], []], library: [['Plains', 'Island', 'Swamp'], []] });
    tg.choose('fundo do grimório', ['Sol Ring']);
    // +1 de Jace, ganho por Bolas: quem compra é Ana e a lealdade é a de Bolas
    tg.activate(BOLAS, '+1: Compre duas cartas').resolve();
    const b = tg.bf(BOLAS);
    expect(tg.state.objects[b].counters.loyalty).toBe(5);
    expect(tg.state.objects[tg.bf(JACE)].counters.loyalty).toBe(4);
    expect(tg.names(0, 'hand').sort()).toEqual(['Island', 'Plains']);
    expect(tg.names(0, 'library')).toEqual(['Swamp', 'Sol Ring']);
    expect(tg.actionIds().some((a) => a.startsWith(`act:${b}:`))).toBe(false);
  });

  it('a habilidade ganha trata Bolas como a fonte ("outro" alvo, lealdade de Bolas)', () => {
    const tg = setup({ battlefield: [[BOLAS, 'Wall of Omens'], [JACE]], library: [['Plains', 'Indomitable Ancients'], []] });
    let opcoes: string[] = [];
    tg.script.push((d: Decision) => {
      if (d.kind !== 'select' || !d.prompt.includes('outro planeswalker ou criatura')) return null;
      opcoes = d.items.map((i) => i.label);
      return { kind: 'select', ids: [d.items.find((i) => i.label === 'Wall of Omens')!.id] };
    });
    tg.activate(BOLAS, '−3: Exile outro').resolve();
    tg.resolveAll();
    // não pode mirar o próprio Bolas ("outro") nem o Jace de Bruno ("que você controla")
    expect(opcoes).toEqual(['Wall of Omens']);
    expect(tg.state.objects[tg.bf(BOLAS)].counters.loyalty).toBe(1);
    expect(tg.names(0, 'exile')).toEqual(['Wall of Omens']);
    expect(tg.find('Indomitable Ancients', 'battlefield', 0)).not.toBeNull();
    expect(tg.state.objects[tg.bf(JACE)].counters.loyalty).toBe(4);
  });

  it('+1: cada oponente, na ordem de turno, escolhe uma carta da mão ou um permanente; tudo é exilado ao mesmo tempo', () => {
    const tg = setup({
      players: 4,
      battlefield: [[BOLAS], ['Island'], ['Wall of Omens'], []],
      hand: [[], ['Sol Ring'], [], []],
      library: [['Plains'], [], [], []],
    });
    const quem: number[] = [];
    tg.script.push((d) => (d.kind === 'select' && d.prompt.startsWith('Nicol Bolas: exile') && d.player === 1 ? (quem.push(1), { kind: 'select', ids: [d.items.find((i) => i.label === 'Mão: Sol Ring')!.id] }) : null));
    tg.script.push((d) => (d.kind === 'select' && d.prompt.startsWith('Nicol Bolas: exile') && d.player === 2 ? (quem.push(2), { kind: 'select', ids: [d.items[0].id] }) : null));
    tg.activate(BOLAS, '+1: Você compra').resolve();
    expect(tg.names(0, 'hand')).toEqual(['Plains']);
    // Diego não tem nada: não escolhe
    expect(quem).toEqual([1, 2]);
    expect(tg.names(1, 'exile')).toEqual(['Sol Ring']);
    expect(tg.find('Island', 'battlefield', 1)).not.toBeNull();
    expect(tg.names(2, 'exile')).toEqual(['Wall of Omens']);
    expect(tg.state.objects[tg.bf(BOLAS)].counters.loyalty).toBe(5);
  });

  it('−3: destrói a criatura ou o planeswalker alvo', () => {
    const tg = setup({ battlefield: [[BOLAS], [JACE]] });
    tg.choose('criatura ou planeswalker alvo', [JACE]);
    tg.activate(BOLAS, '−3: Destrua').resolve();
    expect(tg.find(JACE)).toBeNull();
    expect(tg.names(1, 'graveyard')).toEqual([JACE]);
    expect(tg.state.objects[tg.bf(BOLAS)].counters.loyalty).toBe(1);
  });

  it('−8: cada oponente que não controla criatura ou planeswalker lendário perde o jogo', () => {
    const tg = setup({
      players: 4,
      battlefield: [[{ name: BOLAS, counters: { loyalty: 8 } }], ['Zetalpa, Primal Dawn'], ['Indomitable Ancients', 'Sol Ring'], [JACE]],
    });
    tg.activate(BOLAS, '−8').resolve();
    expect(tg.state.players[1].lost).toBe(false);
    expect(tg.state.players[2].lost).toBe(true);
    expect(tg.state.players[3].lost).toBe(false);
    expect(tg.state.gameOver).toBeNull();
    // Bolas sai com 0 de lealdade (CR 704.5i)
    expect(tg.find(BOLAS)).toBeNull();
  });

  it('−8 em dois jogadores: o oponente sem lendário perde e você vence', () => {
    const tg = setup({ battlefield: [[{ name: BOLAS, counters: { loyalty: 9 } }], ['Indomitable Ancients']] });
    tg.activate(BOLAS, '−8').resolve();
    expect(tg.state.players[1].lost).toBe(true);
    expect(tg.state.gameOver?.winners).toEqual([0]);
  });
});
