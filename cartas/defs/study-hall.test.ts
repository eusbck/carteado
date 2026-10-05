import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Study Hall', () => {
  it('gastando a mana no comandante, vidência X (vezes conjurado da zona de comando, contando esta)', () => {
    const tg = setup({
      battlefield: [['Study Hall', 'Mountain', 'Mountain', 'Mountain', 'Mountain', 'Mountain'], []], command: [[{ name: 'Gau, Feral Youth', commander: true }], []],
      library: [['Island', 'Island', 'Island'], []],
    });
    tg.state.players[0].commanderCasts[String(tg.state.objects[tg.state.zones.command[0]].card)] = 1; // já conjurado uma vez
    tg.refresh();
    let n = 0;
    tg.script.push((d) => (d.kind === 'arrange' && d.prompt.includes('Vidência') ? (n = d.items.length, { kind: 'arrange', placement: Object.fromEntries(d.items.map((i) => [i.id, 'top'])), order: d.items.map((i) => i.id) }) : null));
    // {1}, {T}: uma mana vermelha; o {1} sai da reserva (habilidade de mana, CR 605.3b), então vira uma Mountain antes
    const mana = (rotulo: string) => {
      const d = tg.pending;
      const acao = d?.kind === 'priority' ? d.actions.find((x) => x.label === rotulo) : undefined;
      expect(acao, rotulo).toBeDefined();
      tg.answer({ kind: 'priority', action: acao!.id });
      tg.settle();
    };
    mana('Mountain: adicionar {R}');
    mana('Study Hall: adicionar {R}');
    // Gau: {1}{R} + imposto {2}
    tg.cast('Gau, Feral Youth', 'command').resolveAll();
    expect(tg.find('Gau, Feral Youth')).not.toBeNull();
    expect(n).toBe(2);
  });
});
