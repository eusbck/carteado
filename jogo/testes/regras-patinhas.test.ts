// lote4-c: modos com patinhas (pawprint, CR 107.18, 700.2i), em motor/patinhas.ts.
import { describe, expect, it } from 'vitest';
import type { Decision } from '../motor/types.ts';
import { setup } from './harness.ts';

const N = 'Season of Gathering';

describe('Modos com patinhas (CR 700.2i)', () => {
  it('CR 700.2i: a soma das patinhas dos modos escolhidos não passa do total; o modo que não cabe fica indisponível', () => {
    const tg = setup({ battlefield: [[...Array(6).fill('Forest'), 'Llanowar Elves'], []], hand: [[N], []], library: [['Island', 'Island', 'Island'], []] });
    const vistos: { resta: string; desabilitados: string[] }[] = [];
    let passo = 0;
    tg.script.push((d: Decision) => {
      if (d.kind !== 'select' || !d.prompt.includes('patinha')) return null;
      vistos.push({ resta: d.prompt, desabilitados: d.items.filter((i) => i.disabled).map((i) => i.id) });
      passo++;
      // 3 patinhas, depois 2: restam 0
      return { kind: 'select', ids: [passo === 1 ? '2' : '1'] };
    });
    tg.script.push((d: Decision) => (d.kind === 'select' && d.prompt.includes('patinha') ? (vistos.push({ resta: d.prompt, desabilitados: d.items.filter((i) => i.disabled).map((i) => i.id) }), { kind: 'select', ids: ['1'] }) : null));
    tg.choose('artefato ou encantamento', ['Artefato']);
    tg.cast(N).resolve();
    expect(vistos.length).toBe(2);
    expect(vistos[0].resta).toContain('restam 5');
    expect(vistos[1].resta).toContain('restam 2');
    // com 2 patinhas, o modo de 3 não cabe
    expect(vistos[1].desabilitados).toEqual(['2']);
  });
  it('CR 700.2d: o mesmo modo pode ser escolhido de novo; CR 700.2: os modos resolvem na ordem escrita', () => {
    const tg = setup({ battlefield: [[...Array(6).fill('Forest'), 'Llanowar Elves'], []], hand: [[N], []], library: [['Island', 'Island', 'Island', 'Island'], []] });
    // escolhe o de 3 patinhas antes do de 1, e o de 1 duas vezes: resolve 1, 1 e depois 3 (a compra vê a força 3)
    tg.script.push(
      (d: Decision) => (d.kind === 'select' && d.prompt.includes('patinha') ? { kind: 'select', ids: ['2'] } : null),
      (d: Decision) => (d.kind === 'select' && d.prompt.includes('patinha') ? { kind: 'select', ids: ['0'] } : null),
      (d: Decision) => (d.kind === 'select' && d.prompt.includes('patinha') ? { kind: 'select', ids: ['0'] } : null),
    );
    tg.cast(N).resolve();
    expect(tg.state.objects[tg.bf('Llanowar Elves')].counters['+1/+1']).toBe(2);
    expect(tg.names(0, 'hand').length).toBe(3);
  });
  it('CR 107.18: sem escolher modo nenhum, a mágica resolve sem fazer nada', () => {
    const tg = setup({ battlefield: [[...Array(6).fill('Forest')], []], hand: [[N], []] });
    tg.script.push((d: Decision) => (d.kind === 'select' && d.prompt.includes('patinha') ? { kind: 'select', ids: [] } : null));
    tg.cast(N).resolve();
    expect(tg.names(0, 'graveyard')).toEqual([N]);
  });
});
