import { describe, expect, it } from 'vitest';
import { putOntoBattlefield } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

const NOME = 'City of Traitors';

describe(NOME, () => {
  it('jogar a própria City não dispara; jogar outro terreno a sacrifica', () => {
    const tg = setup({ hand: [[NOME], []] });
    tg.play(NOME).resolveAll();
    expect(tg.find(NOME)).not.toBeNull();
    const tg2 = setup({ battlefield: [[NOME], []], hand: [['Island'], []] });
    tg2.play('Island').resolveAll();
    expect(tg2.find(NOME)).toBeNull();
    expect(tg2.names(0, 'graveyard')).toEqual([NOME]);
  });

  it('um terreno posto no campo por efeito não dispara', () => {
    const tg = setup({ battlefield: [[NOME], []], hand: [['Island'], []] });
    const ilha = tg.find('Island', 'hand', 0)!;
    tg.run(putOntoBattlefield(tg.g, [{ id: ilha, controller: 0 }], 'effect'));
    tg.resolveAll();
    expect(tg.find(NOME)).not.toBeNull();
    expect(tg.find('Island')).not.toBeNull();
  });
});
