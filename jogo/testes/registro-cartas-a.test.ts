// F3 (estudo do Arena, registro R1): as linhas de registro do motor (bloquear-se-puder, dragar...), dos módulos de cartas
// e das cartas de a a f migradas para o helper `reg` mantêm o texto de antes e ganham refs: cada carta revelada vira uma
// ref (mesmo com vírgula no nome), cada jogador da linha também, e a lista vazia continua com o texto de antes.
import { describe, expect, it } from 'vitest';
import type { LogEntry } from '../motor/types.ts';
import { enterCard, fixture } from './artefatos.ts';
import { setup, type TestGame } from './harness.ts';

const JACE = 'Jace, Architect of Thought';
const ZETALPA = 'Zetalpa, Primal Dawn';

/** o texto remontado a partir de parts e refs (tem de bater com `text`) */
function remonta(tg: TestGame, l: LogEntry): string {
  return (l.parts ?? []).map((p) => {
    if (typeof p === 'string') return p;
    const r = l.refs![p.ref];
    return r.k === 'obj' ? r.name : tg.state.players[r.id].name;
  }).join('');
}
const ultima = (tg: TestGame, kind: string, trecho: string) => [...tg.state.log].reverse().find((l) => l.kind === kind && l.text.includes(trecho))!;
const nomesObj = (l: LogEntry) => l.refs!.filter((r) => r.k === 'obj').map((r) => (r.k === 'obj' ? r.name : ''));

describe('registro estruturado: motor, módulos de cartas e cartas de a a f', () => {
  it('Clifftop Lookout: a revelação com nomes que têm vírgula vira uma ref por carta, e o texto fica igual', () => {
    const tg = fixture({ battlefield: [[], []], library: [[JACE, ZETALPA, 'Forest', 'Island'], []] });
    enterCard(tg, 'Clifftop Lookout', 0);
    tg.resolveAll();
    const l = ultima(tg, 'revela', 'revela');
    expect(l.text).toBe(`${tg.state.players[0].name} revela ${JACE}, ${ZETALPA}, Forest.`);
    expect(nomesObj(l)).toEqual([JACE, ZETALPA, 'Forest']);
    expect(l.refs![0]).toEqual({ k: 'jogador', id: 0 });
    expect(l.actor).toBe(0);
    expect(l.rule).toBe('701.20');
    expect(remonta(tg, l)).toBe(l.text);
  });

  it('Clifftop Lookout: com o grimório vazio, o texto continua "revela nada", sem ref de carta', () => {
    const tg = fixture({ battlefield: [[], []], library: [[], []] });
    enterCard(tg, 'Clifftop Lookout', 0);
    tg.resolveAll();
    const l = ultima(tg, 'revela', 'revela');
    expect(l.text).toBe(`${tg.state.players[0].name} revela nada.`);
    expect(nomesObj(l)).toEqual([]);
    expect(remonta(tg, l)).toBe(l.text);
  });

  it('Aeon Engine: a linha cita dois jogadores, cada um com a sua ref, na ordem do texto', () => {
    const tg = fixture({ players: 3, battlefield: [['Aeon Engine'], [], []] });
    tg.activate('Aeon Engine').resolveAll();
    const l = ultima(tg, 'outro', 'ordem dos turnos');
    expect(l.text).toBe('A ordem dos turnos é invertida: depois de Ana joga Carla.');
    expect(l.refs!.map((r) => (r.k === 'jogador' ? r.id : -1))).toEqual([0, 2]);
    expect(l.actor).toBe(0);
    expect(remonta(tg, l)).toBe(l.text);
  });

  it('Fact or Fiction: a pilha vazia continua "[vazia]"; cada carta da outra pilha é uma ref', () => {
    const tg = setup({ battlefield: [['Island', 'Island', 'Island', 'Island'], []], hand: [['Fact or Fiction'], []], library: [['Plains', JACE, 'Mountain', 'Forest', 'Opt', 'Sol Ring'], []] });
    tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('separe as cartas') ? { kind: 'select', ids: [] } : null));
    tg.choose('vai para a sua mão', ['Pilha 1: vazia']);
    tg.cast('Fact or Fiction').resolve();
    const rev = ultima(tg, 'revela', 'Fact or Fiction');
    expect(rev.text).toBe(`Ana revela Plains, ${JACE}, Mountain, Forest, Opt (Fact or Fiction).`);
    expect(nomesObj(rev)).toEqual(['Plains', JACE, 'Mountain', 'Forest', 'Opt']);
    expect(remonta(tg, rev)).toBe(rev.text);
    const sep = ultima(tg, 'outro', 'separa as pilhas');
    expect(sep.text).toBe(`Bruno separa as pilhas: [vazia] e [Plains, ${JACE}, Mountain, Forest, Opt].`);
    expect(sep.actor).toBe(1);
    expect(nomesObj(sep)).toHaveLength(5);
    expect(remonta(tg, sep)).toBe(sep.text);
  });
});
