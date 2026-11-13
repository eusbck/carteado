import { describe, expect, it } from 'vitest';
import { destroy, hasKw } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

const NOME = 'Crowded Crypt';

describe(NOME, () => {
  it('conta as suas criaturas que morrem e cria um Zombie com decaimento para cada marcador de cadáver', () => {
    const tg = setup({ battlefield: [[NOME, 'Wall of Omens', 'Burnished Hart', 'Swamp', 'Swamp', 'Swamp', 'Swamp', 'Swamp', 'Swamp'], ['Indomitable Ancients']] });
    tg.run(destroy(tg.g, [tg.bf('Wall of Omens'), tg.bf('Burnished Hart'), tg.bf('Indomitable Ancients')]));
    tg.resolveAll();
    expect(tg.state.objects[tg.bf(NOME)].counters.corpse).toBe(2);
    tg.activate(NOME, 'Zombie').resolve();
    const z = tg.all('Zombie');
    expect(z).toHaveLength(2);
    expect(hasKw(tg.g, z[0], 'decayed')).toBe(true);
  });
});
