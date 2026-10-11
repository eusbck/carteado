import { describe, expect, it } from 'vitest';
import { nameOf } from '../../motor/api.ts';
import { chars } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Mirage Mirror';
const lib = Array(6).fill('Forest');

describe(N, () => {
  it('vira uma cópia do alvo até o fim do turno e, enquanto isso, não tem a própria habilidade', () => {
    const tg = setup({ battlefield: [[N, 'Island', 'Island'], ['Indomitable Ancients']], library: [lib, lib] });
    const id = tg.bf(N);
    tg.choose('alvo', ['Indomitable Ancients']).activate(N, '{2}').resolveAll();
    expect(nameOf(tg.g, id)).toBe('Indomitable Ancients');
    expect(tg.pt(id)).toEqual([2, 10]);
    expect(chars(tg.g, id).types).toEqual(['Creature']);
    expect(tg.state.objects[id].controller).toBe(0);
    tg.passTo('main1', 1);
    expect(nameOf(tg.g, id)).toBe(N);
    expect(chars(tg.g, id).types).toEqual(['Artifact']);
  });

  it('copiando uma permanente lendária sua, a regra das lendas se aplica', () => {
    const tg = setup({ battlefield: [[N, 'Island', 'Island', 'Zetalpa, Primal Dawn'], []], library: [lib, lib] });
    const z = tg.bf('Zetalpa, Primal Dawn');
    tg.choose('alvo', ['Zetalpa, Primal Dawn']);
    tg.choose(/lend/i, [z]);
    tg.activate(N, '{2}').resolveAll();
    expect(tg.names(0, 'battlefield').filter((n) => n === 'Zetalpa, Primal Dawn')).toHaveLength(1);
    expect(tg.names(0, 'graveyard')).toEqual([N]);
  });
});
