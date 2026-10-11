import { describe, expect, it } from 'vitest';
import { enterCard, fixture as setup } from '../../testes/artefatos.ts';

const N = 'Bramble Sovereign';

describe(N, () => {
  it('pagando {1}{G}, o controlador da criatura que entrou cria uma cópia dela, sem os marcadores', () => {
    const tg = setup({ battlefield: [[N, 'Forest', 'Forest'], []] });
    expect(tg.pt(tg.bf(N))).toEqual([4, 4]);
    tg.yes('Pagar {1}{G}', true);
    enterCard(tg, 'Indomitable Ancients', 1);
    tg.resolveAll();
    const todas = tg.all('Indomitable Ancients');
    expect(todas).toHaveLength(2);
    for (const id of todas) expect(tg.state.objects[id].controller).toBe(1);
    expect(todas.filter((id) => tg.state.objects[id].isToken)).toHaveLength(1);
    // a ficha que entrou não dispara de novo (não é "que não é ficha")
    expect(tg.state.zones.stack).toHaveLength(0);
  });

  it('sem pagar, nada acontece', () => {
    const tg = setup({ battlefield: [[N, 'Forest', 'Forest'], []] });
    tg.yes('Pagar {1}{G}', false);
    enterCard(tg, 'Silver Myr', 0);
    tg.resolveAll();
    expect(tg.all('Silver Myr')).toHaveLength(1);
  });
});