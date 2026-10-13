import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Haddad, o Taxad';
const lib = Array(8).fill('Island');

describe(N, () => {
  it('na segunda mágica do oponente no turno, sem pagar {1}, você cria um Tesouro', () => {
    const tg = setup({ active: 1, battlefield: [[N], ['Forest', 'Forest', 'Forest']], hand: [[], ['Elvish Mystic', 'Llanowar Elves']], library: [lib, lib] });
    tg.cast('Elvish Mystic').resolveAll();
    expect(tg.names(0, 'battlefield')).not.toContain('Treasure');
    tg.yes('Haddad', false);
    tg.cast('Llanowar Elves').resolveAll();
    expect(tg.names(0, 'battlefield')).toContain('Treasure');
  });

  it('pagando {1}, ninguém cria nada', () => {
    const tg = setup({ active: 1, battlefield: [[N], ['Forest', 'Forest', 'Forest']], hand: [[], ['Elvish Mystic', 'Llanowar Elves']], library: [lib, lib] });
    tg.cast('Elvish Mystic').resolveAll();
    tg.yes('Haddad', true);
    tg.cast('Llanowar Elves').resolveAll();
    expect(tg.names(0, 'battlefield')).not.toContain('Treasure');
    expect(tg.state.zones.battlefield.filter((id) => tg.state.objects[id].tapped)).toHaveLength(3);
  });

  it('as suas próprias mágicas não contam', () => {
    const tg = setup({ battlefield: [[N, 'Forest', 'Forest'], []], hand: [['Elvish Mystic', 'Llanowar Elves'], []], library: [lib, lib] });
    tg.cast('Elvish Mystic').resolveAll();
    tg.cast('Llanowar Elves').resolveAll();
    expect(tg.names(0, 'battlefield')).not.toContain('Treasure');
  });
});
