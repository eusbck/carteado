import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Extract Brain';

describe(N, () => {
  it('o oponente escolhe X cartas da mão; você conjura uma delas de graça', () => {
    const tg = setup({ battlefield: [['Island', 'Swamp', 'Island', 'Swamp'], []], hand: [[N], ['Baleful Strix', 'Sol Ring', 'Prismatic Lens']] });
    tg.number('valor de X', 2);
    let quem = -1;
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('escolha 2 carta')) return null;
      quem = d.player;
      return { kind: 'select', ids: d.items.filter((i) => i.label !== 'Baleful Strix').map((i) => i.id) };
    });
    let ofertas: string[] = [];
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('escolha uma mágica para conjurar')) return null;
      ofertas = d.items.map((i) => i.label);
      return { kind: 'select', ids: [d.items.find((i) => i.label === 'Sol Ring')!.id] };
    });
    tg.cast(N).resolveAll();
    expect(quem).toBe(1);
    expect(ofertas).toEqual(['Não conjurar', 'Sol Ring', 'Prismatic Lens']);
    expect(tg.state.objects[tg.bf('Sol Ring')].controller).toBe(0);
    expect(tg.names(1, 'hand').sort()).toEqual(['Baleful Strix', 'Prismatic Lens']);
  });
});
