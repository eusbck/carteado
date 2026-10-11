import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Cosmic Crucible';
const lib = Array(12).fill('Forest');

describe(N, () => {
  it('no início da sua primeira fase principal, adiciona quatro manas nas cores que você escolher', () => {
    const tg = setup({ active: 1, battlefield: [[N], []], library: [lib, lib] });
    tg.choose('mana 1 de', ['R']).choose('mana 2 de', ['R']).choose('mana 3 de', ['G']).choose('mana 4 de', ['G']);
    tg.passTo('main1', 0);
    expect(tg.state.players[0].manaPool.map((u) => u.type).sort()).toEqual(['G', 'G', 'R', 'R']);
  });

  it('copia uma mágica que não é de criatura, só uma vez por turno; a cópia de um artefato vira ficha', () => {
    const tg = setup({ battlefield: [[N, 'Island', 'Island'], []], hand: [['Sol Ring', 'Sol Ring'], []], library: [lib, lib] });
    tg.yes('Cosmic Crucible', true);
    tg.cast('Sol Ring').resolveAll();
    const aneis = tg.all('Sol Ring');
    expect(aneis).toHaveLength(2);
    expect(aneis.filter((id) => tg.state.objects[id].isToken)).toHaveLength(1);
    tg.cast('Sol Ring').resolveAll();
    expect(tg.all('Sol Ring')).toHaveLength(3);
  });

  it('recusando a cópia, ainda pode copiar outra mágica no mesmo turno', () => {
    const tg = setup({ battlefield: [[N, 'Island', 'Island'], []], hand: [['Sol Ring', 'Sol Ring'], []], library: [lib, lib] });
    let n = 0;
    tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('Cosmic Crucible') && d.items.some((i) => i.id === 'yes') ? { kind: 'select', ids: [n++ > 0 ? 'yes' : 'no'] } : null));
    tg.cast('Sol Ring').resolveAll();
    expect(tg.all('Sol Ring')).toHaveLength(1);
    tg.cast('Sol Ring').resolveAll();
    expect(tg.all('Sol Ring')).toHaveLength(3);
  });
});
