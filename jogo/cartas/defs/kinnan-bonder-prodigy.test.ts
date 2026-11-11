import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { activateMana } from '../../testes/artefatos.ts';

const K = 'Kinnan, Bonder Prodigy';
const reserva = (tg: ReturnType<typeof setup>) => tg.state.players[0].manaPool.map((u) => u.type).sort();

describe(K, () => {
  it('virar um permanente que não é terreno para obter mana dá uma mana a mais; terreno não', () => {
    const tg = setup({ battlefield: [[K, 'Sol Ring', 'Forest'], []] });
    activateMana(tg, 'Sol Ring', 'C');
    expect(reserva(tg)).toEqual(['C', 'C', 'C']);
    activateMana(tg, 'Forest', 'G');
    expect(reserva(tg)).toEqual(['C', 'C', 'C', 'G']);
    // sem pilha (CR 605.1b)
    expect(tg.state.zones.stack.length).toBe(0);
  });

  it('escolhe o tipo entre os que o permanente produziu', () => {
    const tg = setup({ battlefield: [[K, 'Elvish Mystic'], []] });
    activateMana(tg, 'Elvish Mystic', 'G');
    expect(reserva(tg)).toEqual(['G', 'G']);
  });

  it('{5}{G}{U}: põe no campo uma criatura que não é Human dentre as cinco do topo; o resto vai para o fundo', () => {
    const tg = setup({
      battlefield: [[K, 'Forest', 'Island', 'Sol Ring', 'Sol Ring', 'Plains'], []],
      library: [['Island', 'Noble Hierarch', 'Zetalpa, Primal Dawn', 'Plains', 'Swamp', 'Forest'], []],
    });
    let oferecidas: string[] = [];
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('não seja Human')) return null;
      oferecidas = d.items.map((i) => i.label);
      return { kind: 'select', ids: [d.items[0].id] };
    });
    tg.activate(K, '{5}{G}{U}').resolve();
    // Noble Hierarch é Human
    expect(oferecidas).toEqual(['Zetalpa, Primal Dawn']);
    expect(tg.find('Zetalpa, Primal Dawn', 'battlefield', 0)).not.toBeNull();
    expect(tg.names(0, 'library')[0]).toBe('Forest');
    expect(tg.names(0, 'library').length).toBe(5);
  });
});
