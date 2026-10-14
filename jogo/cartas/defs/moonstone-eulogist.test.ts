import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { destroy, sacrifice } from '../../motor/api.ts';

const NOME = 'Moonstone Eulogist';

describe(NOME, () => {
  it('uma criatura do oponente morre: você cria uma Blood; sacrificando um artefato, marcador e 1 de vida', () => {
    const tg = setup({ battlefield: [[NOME, 'Sol Ring', 'Wall of Omens'], ['Indomitable Ancients']] });
    tg.run(destroy(tg.g, [tg.bf('Indomitable Ancients'), tg.bf('Wall of Omens')]));
    tg.resolveAll();
    expect(tg.all('Blood').length).toBe(1);
    tg.run(sacrifice(tg.g, [tg.bf('Sol Ring')]));
    tg.resolveAll();
    expect(tg.state.objects[tg.bf(NOME)].counters['+1/+1']).toBe(1);
    expect(tg.life(0)).toBe(41);
  });
});
