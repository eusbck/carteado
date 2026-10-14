import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Stolen Goods';

describe(N, () => {
  it('exila até achar uma carta que não é terreno; você a conjura de graça; os terrenos ficam exilados', () => {
    const tg = setup({ battlefield: [['Island', 'Island', 'Island', 'Island'], []], hand: [[N], []], library: [Array(8).fill('Island'), ['Swamp', 'Forest', 'Baleful Strix', 'Sol Ring']] });
    tg.cast(N).resolveAll();
    expect(tg.state.zones.exile.map((id) => tg.state.objects[id].def).sort()).toEqual(['Baleful Strix', 'Forest', 'Swamp']);
    expect(tg.names(1, 'library')).toEqual(['Sol Ring']);
    const strix = tg.find('Baleful Strix', 'exile')!;
    const forest = tg.find('Forest', 'exile')!;
    expect(tg.actionIds().some((a) => a.split(':').includes(String(forest)))).toBe(false);
    const acao = tg.actionIds().find((a) => a.startsWith('cast:') && a.split(':').includes(String(strix)))!;
    expect(acao).toBeDefined();
    tg.answer({ kind: 'priority', action: acao });
    tg.resolveAll();
    expect(tg.state.objects[tg.bf('Baleful Strix')].controller).toBe(0);
  });

  it('sem carta que não seja terreno, o grimório inteiro é exilado', () => {
    const tg = setup({ battlefield: [['Island', 'Island', 'Island', 'Island'], []], hand: [[N], []], library: [Array(8).fill('Island'), ['Swamp', 'Forest']] });
    tg.cast(N).resolveAll();
    expect(tg.names(1, 'library')).toEqual([]);
    expect(tg.state.zones.exile).toHaveLength(2);
  });

  it('a permissão acaba no fim do turno', () => {
    const tg = setup({ battlefield: [['Island', 'Island', 'Island', 'Island'], []], hand: [[N], []], library: [Array(8).fill('Island'), ['Baleful Strix', ...Array(8).fill('Island')]] });
    tg.cast(N).resolveAll();
    const strix = tg.find('Baleful Strix', 'exile')!;
    tg.passTo('main1', 1).passTo('main1', 0);
    expect(tg.actionIds().some((a) => a.split(':').includes(String(strix)))).toBe(false);
  });
});
