import { describe, expect, it } from 'vitest';
import { hasKw, nameOf } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

const NOME = 'Westvale Abbey // Ormendahl, Profane Prince';
const fichas = (n: number) => Array.from({ length: n }, () => ({ name: 'Human Cleric', token: true }));

describe(NOME, () => {
  it('{5}, {T}, pague 1 de vida: cria um Human Cleric', () => {
    const tg = setup({ battlefield: [[NOME, 'Swamp', 'Swamp', 'Swamp', 'Swamp', 'Swamp'], []] });
    tg.activate('Westvale Abbey', 'Human Cleric').resolve();
    expect(tg.all('Human Cleric')).toHaveLength(1);
    expect(tg.life(0)).toBe(39);
  });

  it('sacrificando cinco criaturas, vira Ormendahl desvirado', () => {
    const tg = setup({ battlefield: [[NOME, 'Swamp', 'Swamp', 'Swamp', 'Swamp', 'Swamp', ...fichas(5)], []] });
    tg.choose('Sacrifique', Array(5).fill('Human Cleric'));
    tg.activate('Westvale Abbey', 'Transforme').resolve();
    const id = tg.bf(NOME);
    expect(nameOf(tg.g, id)).toBe('Ormendahl, Profane Prince');
    expect(tg.state.objects[id].tapped).toBe(false);
    expect(tg.pt(id)).toEqual([9, 7]);
    for (const k of ['flying', 'lifelink', 'indestructible', 'haste']) expect(hasKw(tg.g, id, k)).toBe(true);
  });
});
