import { describe, expect, it } from 'vitest';
import { putOntoBattlefield } from '../../motor/actions.ts';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup, runEffect } from '../../testes/artefatos.ts';

const N = 'Nakia, Wakandan Operative';

describe(N, () => {
  it('alcance; quando o seu comandante entra, você vira o monarca', () => {
    const tg = setup({ battlefield: [[N], []], command: [[{ name: 'Silver Myr', commander: true }], []] });
    expect(tg.pt(tg.bf(N))).toEqual([3, 3]);
    expect(hasKw(tg.g, tg.bf(N), 'reach')).toBe(true);
    const cmd = tg.find('Silver Myr', 'command')!;
    runEffect(tg, putOntoBattlefield(tg.g, [{ id: cmd, controller: 0 }], 'effect'));
    tg.resolveAll();
    expect(tg.state.monarch).toBe(0);
  });

  it('{2}, {T}: dois marcadores +1/+1 na criatura ou Vehicle alvo, só como feitiço', () => {
    const tg = setup({ battlefield: [[N, 'Island', 'Island', 'Vibranium Mining Mech'], []] });
    tg.choose('criatura ou Vehicle alvo', ['Vibranium Mining Mech']).activate(N).resolveAll();
    expect(tg.state.objects[tg.bf('Vibranium Mining Mech')].counters['+1/+1']).toBe(2);
  });
});