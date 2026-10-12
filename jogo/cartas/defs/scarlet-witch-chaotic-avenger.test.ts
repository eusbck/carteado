import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Scarlet Witch, Chaotic Avenger';

describe(N, () => {
  it('causando dano de combate a um jogador, exila as duas do topo viradas para baixo e pode conjurar de graça uma mágica que não é de criatura entre elas', () => {
    const tg = setup({ battlefield: [[N], []], library: [['Sol Ring', 'Elvish Mystic', 'Island'], ['Island']] });
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('Scarlet Witch')) return null;
      // a criatura que não é Hero não pode ser conjurada assim
      expect(d.items.map((i) => i.label)).toEqual(['Sol Ring']);
      return { kind: 'select', ids: [d.items[0].id] };
    });
    tg.yes('Sol Ring', true).attack([[N, 1]]).passTo('main2', 0).resolveAll();
    expect(tg.find('Sol Ring')).not.toBeNull();
    expect(tg.names(0, 'exile')).toEqual(['Elvish Mystic']);
    expect(tg.state.objects[tg.find('Elvish Mystic', 'exile')!].faceDown).toBe(true);
    expect(tg.names(0, 'library')).toEqual(['Island']);
  });
});