// F3 (estudo do Arena, registro R1): as linhas de registro das cartas p–z migradas para `reg`. O texto fica igual ao de
// antes, e cada carta revelada vira uma ref (a mesa mostra a imagem e os bots leem pela ref, não pelo texto).
import { describe, expect, it } from 'vitest';
import type { LogEntry } from '../motor/types.ts';
import { fixture } from './artefatos.ts';
import { setup, type TestGame } from './harness.ts';

const JACE = 'Jace, Architect of Thought';
const ZETALPA = 'Zetalpa, Primal Dawn';
const ilhas = ['Island', 'Island', 'Island', 'Island'];

/** o texto remontado a partir de parts e refs (tem de bater com `text`) */
function remonta(tg: TestGame, l: LogEntry): string {
  return (l.parts ?? []).map((p) => {
    if (typeof p === 'string') return p;
    const r = l.refs![p.ref];
    return r.k === 'obj' ? r.name : tg.state.players[r.id].name;
  }).join('');
}
const ultima = (tg: TestGame, kind: string) => [...tg.state.log].reverse().find((l) => l.kind === kind)!;
const nomesObj = (l: LogEntry) => l.refs!.filter((r) => r.k === 'obj').map((r) => (r.k === 'obj' ? r.name : ''));

describe('registro estruturado: cartas p–z', () => {
  it('Polymorph: a lista revelada vira uma ref por carta, mesmo com vírgula no nome', () => {
    const tg = setup({ battlefield: [ilhas, ['Wall of Omens']], hand: [['Polymorph'], []], library: [[], [JACE, 'Plains', ZETALPA, 'Forest']] });
    tg.choose('criatura alvo', ['Wall of Omens']).cast('Polymorph').resolve();
    const l = ultima(tg, 'revela');
    const b = tg.state.players[1].name;
    expect(l.text).toBe(`${b} revela ${JACE}, Plains, ${ZETALPA}.`);
    expect(nomesObj(l)).toEqual([JACE, 'Plains', ZETALPA]);
    expect(l.refs![0]).toEqual({ k: 'jogador', id: 1 });
    expect(l.actor).toBe(1);
    expect(l.rule).toBe('701.20');
    expect(remonta(tg, l)).toBe(l.text);
  });

  it('Polymorph com grimório vazio: "nada (grimório vazio)" fica como texto, sem ref de carta', () => {
    const tg = setup({ battlefield: [ilhas, ['Wall of Omens']], hand: [['Polymorph'], []], library: [[], []] });
    tg.choose('criatura alvo', ['Wall of Omens']).cast('Polymorph').resolve();
    const l = ultima(tg, 'revela');
    expect(l.text).toBe(`${tg.state.players[1].name} revela nada (grimório vazio).`);
    expect(nomesObj(l)).toEqual([]);
    expect(remonta(tg, l)).toBe(l.text);
  });

  it('Psychic Battle: vários jogadores na mesma linha, cada carta logo depois do dono', () => {
    const tg = fixture({
      battlefield: [['Psychic Battle', 'Swamp', 'Swamp', 'Elvish Mystic'], ['Indomitable Ancients', 'Silver Myr']],
      hand: [['Infernal Grasp'], []],
      library: [[ZETALPA, 'Island'], [JACE, 'Island']],
    });
    tg.choose('criatura alvo', ['Indomitable Ancients']);
    tg.yes('Psychic Battle', false);
    tg.cast('Infernal Grasp').resolveAll();
    const l = ultima(tg, 'revela');
    const [a, b] = tg.state.players.map((p) => p.name);
    expect(l.text).toBe(`Psychic Battle: ${a} revela ${ZETALPA} (8); ${b} revela ${JACE} (4).`);
    expect(l.refs!.map((r) => (r.k === 'jogador' ? `j${r.id}` : r.name))).toEqual(['j0', ZETALPA, 'j1', JACE]);
    expect(remonta(tg, l)).toBe(l.text);
  });
});
