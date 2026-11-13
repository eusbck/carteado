// F3 (estudo do Arena, registro R1): as chamadas de log do motor migradas para o helper `reg` mantêm o texto de antes e
// ganham kind, actor, refs e parts. Cartas com vírgula no nome viram uma ref cada (os bots não precisam mais separar o
// texto por vírgula), e o ajuste manual sai com kind 'manual'.
import { describe, expect, it } from 'vitest';
import { clash } from '../motor/api.ts';
import type { Ctx } from '../motor/defs.ts';
import { searchTo } from '../motor/efeitos.ts';
import type { LogEntry, ManualAction } from '../motor/types.ts';
import { fixture, runEffect } from './artefatos.ts';
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
const ultima = (tg: TestGame, kind: string) => [...tg.state.log].reverse().find((l) => l.kind === kind)!;

describe('registro estruturado: chamadas migradas', () => {
  it('revelar na busca: uma ref por carta, mesmo com vírgula no nome; o texto fica igual', () => {
    const tg = fixture({ battlefield: [[], []], library: [[JACE, 'Forest', ZETALPA, 'Forest'], ['Forest']] });
    tg.choose('Procure', [JACE, ZETALPA]);
    runEffect(tg, searchTo({ g: tg.g } as unknown as Ctx, 0, () => true, 2, 'hand', { reveal: true }));
    const l = ultima(tg, 'revela');
    const nomes = l.refs!.filter((r) => r.k === 'obj').map((r) => (r.k === 'obj' ? r.name : ''));
    expect([...nomes].sort()).toEqual([JACE, ZETALPA].sort());
    expect(l.text).toBe(`${tg.state.players[0].name} revela ${nomes.join(', ')}.`);
    expect(l.rule).toBe('701.20');
    expect(l.actor).toBe(0);
    expect(l.refs![0]).toEqual({ k: 'jogador', id: 0 });
    expect(remonta(tg, l)).toBe(l.text);
  });

  it('confronto: as duas revelações na mesma linha, com uma ref para cada jogador e cada carta', () => {
    const tg = fixture({ battlefield: [[], []], library: [[JACE, 'Forest'], [ZETALPA, 'Island']] });
    tg.yes('Confronto: pôr', false);
    runEffect(tg, clash(tg.g, 0, 1));
    const l = ultima(tg, 'revela');
    const [a, b] = tg.state.players.map((p) => p.name);
    expect(l.text).toBe(`Confronto: ${a} revela ${JACE}; ${b} revela ${ZETALPA}.`);
    expect(l.refs!.map((r) => r.k)).toEqual(['jogador', 'obj', 'jogador', 'obj']);
    expect(l.refs!.filter((r) => r.k === 'obj').map((r) => (r.k === 'obj' ? r.name : ''))).toEqual([JACE, ZETALPA]);
    expect(l.actor).toBe(0);
    expect(remonta(tg, l)).toBe(l.text);
  });

  it('confronto com grimório vazio: "nada (grimório vazio)" fica como texto', () => {
    const tg = fixture({ battlefield: [[], []], library: [[JACE], []] });
    tg.yes('Confronto: pôr', false);
    runEffect(tg, clash(tg.g, 0, 1));
    const l = ultima(tg, 'revela');
    const [a, b] = tg.state.players.map((p) => p.name);
    expect(l.text).toBe(`Confronto: ${a} revela ${JACE}; ${b} revela nada (grimório vazio).`);
    expect(remonta(tg, l)).toBe(l.text);
  });

  describe('ajuste manual', () => {
    function manual(tg: TestGame, m: ManualAction): void {
      const a = { kind: 'priority' as const, action: 'manual', manual: m };
      expect(tg.game.check(tg.pending!.player, a)).toBeNull();
      tg.answer(a);
      tg.settle();
    }
    function comManual(opts: Parameters<typeof setup>[0]): TestGame {
      const tg = setup(opts);
      tg.state.config.manualMode = true;
      return tg.refresh();
    }

    it('gera kind manual, com o mesmo texto de antes e refs dos jogadores e cartas', () => {
      const tg = comManual({ battlefield: [['Wall of Omens'], []], hand: [[JACE], []] });
      const [a, b] = tg.state.players.map((p) => p.name);
      const n0 = tg.state.log.length;
      manual(tg, { k: 'vida', player: 1, delta: -3 });
      manual(tg, { k: 'marcadores', target: { kind: 'obj', id: tg.bf('Wall of Omens') }, kind: '+1/+1', delta: 2 });
      manual(tg, { k: 'virar', obj: tg.bf('Wall of Omens'), tapped: true });
      manual(tg, { k: 'mover', obj: tg.find(JACE, 'hand', 0)!, to: 'libraryTop' });
      const linhas = tg.state.log.slice(n0).filter((l) => l.kind === 'manual');
      expect(linhas.map((l) => l.text)).toEqual([
        `${a} (ajuste manual): ${b} perde 3 de vida.`,
        `${a} (ajuste manual): coloca 2 marcador(es) +1/+1 em Wall of Omens.`,
        `${a} (ajuste manual) vira Wall of Omens.`,
        `${a} (ajuste manual) move uma carta da mão para o topo do grimório.`,
      ]);
      for (const l of linhas) {
        expect(l.actor).toBe(0);
        expect(remonta(tg, l)).toBe(l.text);
      }
      expect(linhas[0].refs).toEqual([{ k: 'jogador', id: 0 }, { k: 'jogador', id: 1, papel: 'alvo' }]);
      expect(linhas[1].refs![1]).toMatchObject({ k: 'obj', name: 'Wall of Omens', papel: 'alvo' });
      // carta escondida (da mão para o grimório): não vira ref, só "uma carta"
      expect(linhas[3].refs).toEqual([{ k: 'jogador', id: 0 }]);
    });
  });
});
