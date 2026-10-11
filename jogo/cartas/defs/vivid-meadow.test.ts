import { describe, expect, it } from 'vitest';
import { alternativasDeMana, jogarTerreno, setup } from '../../testes/padroes.ts';

const NOME = 'Vivid Meadow';

describe(NOME, () => {
  it('CR 605: sem marcadores de carga, só {W}', () => expect(alternativasDeMana(NOME)).toEqual(['W']));
  it('CR 614.1c: entra virado com dois marcadores de carga', () => {
    const tg = jogarTerreno(NOME);
    const o = tg.state.objects[tg.bf(NOME)];
    expect(o.tapped).toBe(true);
    expect(o.counters.charge).toBe(2);
  });
  it('{T}, remova um marcador de carga: uma mana de qualquer cor; sem marcador, só {W}', () => {
    const cores = (n: number) => {
      const tg = setup({ battlefield: [[{ name: NOME, counters: n ? { charge: n } : {} }], []] });
      return [...new Set(tg.pending!.kind === 'priority' ? tg.pending!.actions.filter((a) => a.id.startsWith('mana:')).map((a) => a.label) : [])];
    };
    expect(cores(0)).toEqual(['Vivid Meadow: adicionar {W}']);
    // as cinco cores (o {W} aparece nas duas habilidades)
    expect(cores(1).sort()).toEqual(['B', 'G', 'R', 'U', 'W'].map((x) => `Vivid Meadow: adicionar {${x}}`));
    const tg = setup({ battlefield: [[{ name: NOME, counters: { charge: 2 } }], []] });
    const act = tg.pending!.kind === 'priority' ? tg.pending!.actions.find((a) => a.id.startsWith('mana:') && a.label.includes('{B}'))!.id : '';
    tg.answer({ kind: 'priority', action: act });
    tg.settle();
    expect(tg.state.players[0].manaPool.map((u) => u.type)).toEqual(['B']);
    expect(tg.state.objects[tg.bf(NOME)].counters.charge).toBe(1);
  });
});
