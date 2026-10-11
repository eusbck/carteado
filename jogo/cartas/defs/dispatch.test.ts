import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Dispatch';

describe(N, () => {
  it('vira a criatura alvo', () => {
    const tg = setup({ battlefield: [['Plains', 'Sol Ring'], ['Indomitable Ancients']], hand: [[N], []] });
    tg.choose('criatura alvo', ['Indomitable Ancients']).cast(N).resolveAll();
    expect(tg.state.objects[tg.bf('Indomitable Ancients')].tapped).toBe(true);
  });

  it('com três ou mais artefatos, a criatura é exilada', () => {
    const tg = setup({ battlefield: [['Plains', 'Sol Ring', 'Darksteel Ingot', 'Thran Dynamo'], ['Indomitable Ancients']], hand: [[N], []] });
    tg.choose('criatura alvo', ['Indomitable Ancients']).cast(N).resolveAll();
    expect(tg.find('Indomitable Ancients', 'exile')).not.toBeNull();
  });
});