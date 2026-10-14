import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Villainous Wealth';

describe(N, () => {
  it('conjura quantas mágicas quiser com valor de mana até X, uma de cada vez, durante a resolução', () => {
    // X = 4: Sol Ring (1) e Baleful Strix (2) servem; Thieving Amalgam (7) não; Forest é terreno; a Island fica no grimório
    const tg = setup({
      battlefield: [['Island', 'Swamp', 'Forest', 'Island', 'Swamp', 'Island', 'Swamp'], []], hand: [[N], []],
      library: [Array(8).fill('Island'), ['Sol Ring', 'Thieving Amalgam', 'Forest', 'Baleful Strix', 'Island']],
    });
    tg.number('valor de X', 4);
    const ofertas: string[][] = [];
    for (let i = 0; i < 2; i++) {
      tg.script.push((d) => {
        if (d.kind !== 'select' || !d.prompt.includes('escolha uma mágica para conjurar')) return null;
        ofertas.push(d.items.map((x) => x.label));
        const pega = d.items.find((x) => x.label === 'Sol Ring') ?? d.items.find((x) => x.label === 'Baleful Strix') ?? d.items[0];
        return { kind: 'select', ids: [pega.id] };
      });
    }
    tg.cast(N).resolveAll();
    expect(ofertas[0]).toEqual(['Não conjurar', 'Sol Ring', 'Baleful Strix']);
    expect(ofertas[1]).toEqual(['Parar de conjurar', 'Baleful Strix']);
    expect(tg.state.objects[tg.bf('Sol Ring')].controller).toBe(0);
    expect(tg.state.objects[tg.bf('Baleful Strix')].controller).toBe(0);
    expect(tg.state.zones.exile.map((id) => tg.state.objects[id].def).sort()).toEqual(['Forest', 'Thieving Amalgam']);
    expect(tg.names(1, 'library')).toEqual(['Island']);
  });

  it('as cartas não conjuradas ficam exiladas', () => {
    const tg = setup({
      battlefield: [['Island', 'Swamp', 'Forest', 'Island', 'Swamp'], []], hand: [[N], []],
      library: [Array(8).fill('Island'), ['Sol Ring', 'Baleful Strix', 'Island']],
    });
    tg.number('valor de X', 2);
    tg.choose('escolha uma mágica para conjurar', ['Não conjurar']);
    tg.cast(N).resolveAll();
    expect(tg.state.zones.exile.map((id) => tg.state.objects[id].def).sort()).toEqual(['Baleful Strix', 'Sol Ring']);
  });
});
