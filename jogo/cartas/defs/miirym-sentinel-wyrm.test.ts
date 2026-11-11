import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { chars, putOntoBattlefield } from '../../motor/api.ts';

const M = 'Miirym, Sentinel Wyrm';

describe(M, () => {
  it('a ficha copia o Dragon que entrou, sem marcadores, e não é lendária', () => {
    const tg = setup({ battlefield: [[M], []], hand: [['Klauth, Unrivaled Ancient', 'Elvish Mystic'], []] });
    tg.run(putOntoBattlefield(tg.g, [{ id: tg.find('Klauth, Unrivaled Ancient', 'hand', 0)!, controller: 0, counters: { '+1/+1': 2 } }], 'effect'));
    tg.resolve();
    const fichas = tg.state.zones.battlefield.filter((id) => tg.state.objects[id].isToken);
    expect(fichas.length).toBe(1);
    const c = chars(tg.g, fichas[0]);
    expect(c.name).toBe('Klauth, Unrivaled Ancient');
    expect(c.supertypes).not.toContain('Legendary');
    expect(tg.pt(fichas[0])).toEqual([4, 4]);
    // a ficha (Dragon) não dispara de novo; outra criatura não dispara
    expect(tg.state.zones.stack.length).toBe(0);
    tg.run(putOntoBattlefield(tg.g, [{ id: tg.find('Elvish Mystic', 'hand', 0)!, controller: 0 }], 'effect'));
    expect(tg.state.zones.stack.length).toBe(0);
  });
});
