import { describe, expect, it } from 'vitest';
import { gainLife, loseLife } from '../../motor/actions.ts';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Lathiel, the Bounteous Dawn';

describe(N, () => {
  it('tendo ganhado vida no turno, distribui até essa quantidade de marcadores +1/+1 entre outras criaturas alvo', () => {
    const tg = setup({ battlefield: [[N, 'Silver Myr', 'Elvish Mystic'], []] });
    expect(tg.pt(tg.bf(N))).toEqual([2, 2]);
    expect(hasKw(tg.g, tg.bf(N), 'lifelink')).toBe(true);
    // ganha 5 e perde 7: o que conta é a vida ganha
    gainLife(tg.g, 0, 5, null);
    loseLife(tg.g, 0, 7, null);
    tg.refresh();
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('outras criaturas alvo')) return null;
      // "outras": Lathiel não é alvo
      expect(d.items.map((i) => i.label)).not.toContain(N);
      return { kind: 'select', ids: d.items.filter((i) => i.label === 'Silver Myr' || i.label === 'Elvish Mystic').map((i) => i.id) };
    });
    tg.number('marcadores +1/+1 em', 4);
    tg.passTo('upkeep', 1);
    const pts = [tg.pt(tg.bf('Silver Myr')), tg.pt(tg.bf('Elvish Mystic'))].map((p) => p[0]).sort();
    expect(pts).toEqual([2, 5]);
  });

  it('sem escolher alvos, nenhum marcador é colocado', () => {
    const tg = setup({ battlefield: [[N, 'Silver Myr'], []] });
    gainLife(tg.g, 0, 3, null);
    tg.refresh();
    tg.choose('outras criaturas alvo', []);
    tg.passTo('upkeep', 1);
    expect(tg.pt(tg.bf('Silver Myr'))).toEqual([1, 1]);
  });

  it('sem ganhar vida no turno, não dispara', () => {
    const tg = setup({ battlefield: [[N, 'Silver Myr'], []] });
    tg.script.push((d) => { if (d.kind === 'select' && d.prompt.includes('outras criaturas alvo')) throw new Error('não devia disparar'); return null; });
    tg.passTo('upkeep', 1);
    expect(tg.pt(tg.bf('Silver Myr'))).toEqual([1, 1]);
  });
});