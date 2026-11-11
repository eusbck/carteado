// lote3-b: recursos do motor para o deck We Are The Borg.
// - assimilar (motor/assimilar.ts): ainda não está nas Comprehensive Rules de 25/09/2026; segue o texto de lembrete,
//   com a mudança de tipo na camada 4 (CR 613.1d) e "perde os outros tipos de criatura" (CR 205.1a);
// - destemido concedido à próxima mágica (motor/destemido.ts, CR 702.125);
// - alvo "mágica, habilidade ativada ou habilidade desencadeada" (what: 'stackObject', CR 115.1, 115.5);
// - "os jogadores não podem ativar habilidades de lealdade" (gancho cantActivateLoyalty, CR 606.3).
import { describe, expect, it } from 'vitest';
import { assimilateCard, assimilatePermanent } from '../motor/api.ts';
import { chars, controllerOf } from '../motor/chars.ts';
import { fixture as setup, removeCard, runEffect } from './artefatos.ts';

describe('assimilar (texto de lembrete; CR 613.1d, 205.1a)', () => {
  it('carta assimilada entra sob o seu controle, com um marcador +1/+1, já como criatura artefato Borg', () => {
    const tg = setup({ battlefield: [['Conquest Mission'], []], graveyard: [[], ['Zetalpa, Primal Dawn']] });
    const carta = tg.find('Zetalpa, Primal Dawn', 'graveyard', 1)!;
    const id = runEffect(tg, assimilateCard(tg.g, 0, carta, tg.bf('Conquest Mission')))!;
    tg.resolveAll();
    expect(controllerOf(tg.g, id)).toBe(0);
    const ch = chars(tg.g, id);
    expect(ch.types).toEqual(expect.arrayContaining(['Artifact', 'Creature']));
    expect(ch.subtypes).toEqual(['Borg']);
    expect(tg.state.objects[id].counters['+1/+1']).toBe(1);
    // Conquest Mission viu um artefato que não é ficha entrar (CR 614.1c: ela entra já como artefato)
    expect(tg.all('Borg')).toHaveLength(1);
  });

  it('permanente assimilada: ganha o controle; uma criatura artefato continua artefato e só fica com o tipo Borg', () => {
    const tg = setup({ battlefield: [[], ['Steel Overseer']] });
    const ov = tg.bf('Steel Overseer');
    expect(assimilatePermanent(tg.g, 0, ov, ov)).toBe(true);
    tg.refresh();
    const ch = chars(tg.g, ov);
    expect(ch.types.filter((t) => t === 'Artifact')).toHaveLength(1);
    expect(ch.subtypes).toEqual(['Borg']);
    expect(controllerOf(tg.g, ov)).toBe(0);
  });

  it('CR 400.7: depois de mudar de zona, é outro objeto e o efeito acaba', () => {
    const tg = setup({ battlefield: [[], ['Wall of Omens']] });
    const muro = tg.bf('Wall of Omens');
    assimilatePermanent(tg.g, 0, muro, muro);
    tg.refresh();
    removeCard(tg, muro);
    const noCemiterio = tg.find('Wall of Omens', 'graveyard', 1)!;
    expect(chars(tg.g, noCemiterio).types).not.toContain('Artifact');
    expect(chars(tg.g, noCemiterio).subtypes).toEqual(['Wall']);
  });
});

describe('CR 702.125: destemido na próxima mágica', () => {
  it('CR 702.125b: oponentes que deixaram a partida não contam', () => {
    const tg = setup({
      players: 3,
      battlefield: [[...Array(5).fill('Island'), ...Array(3).fill('Swamp')], [], []],
      hand: [['Võx, Child of the Collective', 'Hive Mind Coprocessor'], [], []],
    });
    tg.state.players[2].left = true;
    tg.cast('Võx, Child of the Collective').resolveAll();
    // um oponente só: {4}{B} vira {3}{B}, e sobram três terrenos
    expect(tg.canCast('Hive Mind Coprocessor')).toBe(false);
  });
});

describe('CR 115.1: alvo que é mágica ou habilidade na pilha (Disallow)', () => {
  it('CR 115.5: a própria mágica não é oferecida como alvo; a mágica na pilha é', () => {
    const tg = setup({ battlefield: [['Island', 'Island', 'Island', 'Island'], []], hand: [['Sol Ring', 'Disallow'], []] });
    tg.cast('Sol Ring');
    let ofertas: string[] = [];
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('mágica, habilidade')) return null;
      ofertas = d.items.filter((i) => !i.disabled).map((i) => i.label);
      return { kind: 'select', ids: [d.items.find((i) => !i.disabled)!.id] };
    });
    tg.cast('Disallow').resolve();
    expect(ofertas).toHaveLength(1);
    expect(ofertas[0]).toContain('Sol Ring');
    expect(tg.find('Sol Ring', 'graveyard', 0)).not.toBeNull();
  });
});

describe('CR 606.3: "os jogadores não podem ativar habilidades de lealdade" (The Immortal Sun)', () => {
  it('o planeswalker não oferece habilidades de lealdade enquanto The Immortal Sun estiver no campo', () => {
    const J = 'Jace, Architect of Thought';
    const tg = setup({ battlefield: [[J, 'The Immortal Sun'], []] });
    const jace = tg.bf(J);
    expect(tg.actionIds().filter((a) => a.startsWith('act:') && a.split(':')[1] === String(jace))).toEqual([]);
    removeCard(tg, tg.bf('The Immortal Sun'));
    expect(tg.actionIds().filter((a) => a.startsWith('act:') && a.split(':')[1] === String(jace)).length).toBeGreaterThan(0);
  });
});
