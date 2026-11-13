// F3 (estudo do Arena, registro R1): as linhas de registro das cartas de g a o migradas para o helper `reg` mantêm o
// texto de antes e ganham refs: cada carta revelada vira uma ref (mesmo com vírgula no nome), cada jogador da linha
// também, e a lista vazia continua com o texto de antes.
import { describe, expect, it } from 'vitest';
import type { LogEntry } from '../motor/types.ts';
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

describe('registro estruturado: cartas de g a o', () => {
  it('Intuition: a revelação com nomes que têm vírgula vira uma ref por carta, e o texto fica igual', () => {
    const tg = setup({ battlefield: [['Island', 'Island', 'Island'], []], hand: [['Intuition'], []], library: [[JACE, 'Forest', ZETALPA, 'Opt'], []] });
    tg.choose('Procure três cartas', [JACE, ZETALPA, 'Opt']);
    tg.cast('Intuition').resolve();
    const l = ultima(tg, 'revela', 'revela');
    const ana = tg.state.players[0].name;
    expect(nomesObj(l).sort()).toEqual([JACE, ZETALPA, 'Opt'].sort());
    expect(l.text).toBe(`${ana} revela ${nomesObj(l).join(', ')}.`);
    expect(l.rule).toBe('701.20');
    expect(l.actor).toBe(0);
    expect(l.refs![0]).toEqual({ k: 'jogador', id: 0 });
    expect(remonta(tg, l)).toBe(l.text);
  });

  it('Mob Verdict: a linha dos votos tem uma ref para cada jogador, na ordem do texto', () => {
    const tg = setup({ players: 3, battlefield: [['Mountain', 'Mountain', 'Mountain', 'Mountain'], [], []], hand: [['Mob Verdict'], [], []], library: [['Island', 'Island'], [], []] });
    tg.choose('Mob Verdict', ['Bruno']).choose('Mob Verdict', ['Ana']).choose('Mob Verdict', ['Bruno']);
    tg.cast('Mob Verdict').resolve();
    const l = ultima(tg, 'outro', 'votos');
    expect(l.text).toBe('Mob Verdict, votos: Ana → Bruno; Bruno → Ana; Carla → Bruno.');
    expect(l.refs!.map((r) => (r.k === 'jogador' ? r.id : -1))).toEqual([0, 1, 1, 0, 2, 1]);
    expect(l.actor).toBe(0);
    expect(remonta(tg, l)).toBe(l.text);
  });

  it('Grief: a mão vazia continua "vazia" no texto, sem ref de carta', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Swamp', 'Swamp'], []], hand: [['Grief'], []] });
    tg.cast('Grief').resolveAll();
    const l = ultima(tg, 'revela', 'revela a mão');
    expect(l.text).toBe(`${tg.state.players[1].name} revela a mão: vazia.`);
    expect(nomesObj(l)).toEqual([]);
    expect(l.actor).toBe(1);
    expect(remonta(tg, l)).toBe(l.text);
  });

  it('Grief: com cartas na mão, cada uma vira ref, depois do jogador que revela', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Swamp', 'Swamp'], []], hand: [['Grief'], ['Island', JACE]] });
    tg.choose('Grief: escolha', [JACE]).cast('Grief').resolveAll();
    const l = ultima(tg, 'revela', 'revela a mão');
    expect(l.text).toBe(`${tg.state.players[1].name} revela a mão: Island, ${JACE}.`);
    expect(l.refs!.map((r) => r.k)).toEqual(['jogador', 'obj', 'obj']);
    expect(remonta(tg, l)).toBe(l.text);
  });
});
