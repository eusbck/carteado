import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { destroy } from '../../motor/api.ts';
import { alternativasDeMana } from '../../testes/padroes.ts';

const NOME = 'Swarmyard';

describe(NOME, () => {
  it('CR 605: produz {C}', () => expect(alternativasDeMana(NOME)).toEqual(['C']));
  it('CR 701.19a: regenera um Squirrel, que é virado em vez de destruído', () => {
    const tg = setup({ battlefield: [[NOME, { name: 'Squirrel', token: true }], []] });
    tg.choose('Insect, Rat', ['Squirrel']).activate(NOME, 'Regenere').resolve();
    tg.run(destroy(tg.g, [tg.bf('Squirrel')]));
    expect(tg.find('Squirrel')).not.toBeNull();
    expect(tg.state.objects[tg.bf('Squirrel')].tapped).toBe(true);
  });
  it('não mira criatura de outro tipo', () => {
    const tg = setup({ battlefield: [[NOME, 'Wall of Omens'], []] });
    expect(tg.actionIds().some((a) => a.startsWith('act:'))).toBe(false);
  });
});
