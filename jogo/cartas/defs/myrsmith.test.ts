import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Myrsmith';

describe(N, () => {
  it('conjurando um artefato, paga {1} e cria uma ficha Myr antes de a mágica resolver', () => {
    const tg = setup({ battlefield: [[N, 'Plains', 'Plains', 'Forest'], []], hand: [['Sol Ring', 'Llanowar Elves'], []] });
    // mágica que não é artefato não dispara
    tg.cast('Llanowar Elves');
    expect(tg.state.zones.stack).toHaveLength(1);
    tg.resolve();
    tg.yes('Pagar {1}', true);
    tg.cast('Sol Ring').resolve();
    expect(tg.all('Myr')).toHaveLength(1);
    expect(tg.state.zones.stack).toHaveLength(1);
    tg.resolve();
    expect(tg.find('Sol Ring')).not.toBeNull();
  });
});
