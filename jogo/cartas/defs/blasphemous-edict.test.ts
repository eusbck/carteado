import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const NOME = 'Blasphemous Edict';
const fichas = (n: number) => Array.from({ length: n }, () => ({ name: 'Thrull', token: true }));

describe(NOME, () => {
  it('cada jogador sacrifica treze criaturas; quem tem menos sacrifica todas', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Swamp', 'Swamp', 'Swamp', ...fichas(14)], ['Wall of Omens', 'Indomitable Ancients']], hand: [[NOME], []] });
    tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('Sacrifique') ? { kind: 'select', ids: d.items.slice(0, d.min).map((i) => i.id) } : null));
    tg.cast(NOME, 'hand').resolveAll();
    expect(tg.all('Thrull')).toHaveLength(1);
    expect(tg.names(1, 'graveyard')).toHaveLength(2);
  });

  it('com treze ou mais criaturas no campo, custa {B}', () => {
    const tg = setup({ battlefield: [['Swamp', ...fichas(13)], []], hand: [[NOME], []] });
    expect(tg.actionIds().some((a) => a.endsWith(':blasphemous'))).toBe(true);
    const menos = setup({ battlefield: [['Swamp', ...fichas(12)], []], hand: [[NOME], []] });
    expect(menos.actionIds().some((a) => a.endsWith(':blasphemous'))).toBe(false);
  });
});
