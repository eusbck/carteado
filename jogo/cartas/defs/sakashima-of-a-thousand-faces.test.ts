import { describe, expect, it } from 'vitest';
import { nameOf } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Sakashima of a Thousand Faces';

describe(N, () => {
  it('entra como cópia de outra criatura sua, com a regra da lenda suspensa: as duas lendárias de mesmo nome ficam no campo', () => {
    const tg = setup({ battlefield: [[...Array(4).fill('Island'), 'Skithiryx, the Blight Dragon'], ['Serra Angel']], hand: [[N], []] });
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('Sakashima')) return null;
      // só as suas criaturas
      expect(d.items.map((i) => i.label)).not.toContain('Serra Angel');
      return { kind: 'select', ids: [d.items.find((i) => i.label === 'Skithiryx, the Blight Dragon')!.id] };
    });
    tg.cast(N).resolveAll();
    const dragoes = tg.state.zones.battlefield.filter((id) => nameOf(tg.g, id) === 'Skithiryx, the Blight Dragon');
    expect(dragoes).toHaveLength(2);
    expect(tg.pt(dragoes[1])).toEqual([4, 4]);
  });
});