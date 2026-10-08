import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { putOntoBattlefield } from '../../motor/api.ts';

describe('Grim Poppet', () => {
  it('entra com três -1/-1; pode mirar a mesma criatura várias vezes, nunca a si mesma', () => {
    const tg = setup({ battlefield: [[], ['Wall of Omens']], hand: [['Grim Poppet'], []] });
    tg.run(putOntoBattlefield(tg.g, [{ id: tg.state.zones.hand[0][0], controller: 0 }], 'effect'));
    const gp = tg.bf('Grim Poppet');
    expect(tg.pt(gp)).toEqual([1, 1]);
    let alvos: number[] = [];
    tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('outra criatura alvo') ? (alvos = d.items.map((i) => i.obj!), null) : null));
    tg.choose('outra criatura alvo', ['Wall of Omens']).activate('Grim Poppet').resolve();
    tg.choose('outra criatura alvo', ['Wall of Omens']).activate('Grim Poppet').resolve();
    expect(alvos).not.toContain(gp);
    expect(tg.pt(tg.bf('Wall of Omens'))).toEqual([-2, 2]);
    expect(tg.pt(gp)).toEqual([3, 3]);
  });
});
