import { describe, expect, it } from 'vitest';
import { untilEndOfTurn } from '../../motor/api.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Sephiroth, Fallen Hero';
const MYR = 'Silver Myr';

describe(N, () => {
  it('o marcador de célula torna a criatura modificada, mesmo pequena, e ela vira 7/5', () => {
    const tg = setup({ battlefield: [[N, MYR], []] });
    tg.choose('criatura alvo', [MYR]).yes('marcador de célula', true).attack([[N, 1]]).passTo('declareBlockers');
    const myr = tg.bf(MYR);
    expect(tg.state.objects[myr].counters.cell).toBe(1);
    expect(tg.pt(myr)).toEqual([7, 5]);
    // só até o fim do turno
    tg.passTo('upkeep', 1);
    expect(tg.pt(myr)).toEqual([1, 1]);
  });

  it('substitui a força e resistência definidas antes, mas marcadores +1/+1 e outros bônus continuam valendo', () => {
    const tg = setup({ battlefield: [[N, { name: MYR, counters: { '+1/+1': 1 } }], []] });
    const myr = tg.bf(MYR);
    untilEndOfTurn({ g: tg.g, you: 0, source: myr } as never, [myr], [{ k: 'setPT', p: 3, t: 3 }, { k: 'pt', p: 1, t: 0 }]);
    tg.refresh();
    expect(tg.pt(myr)).toEqual([5, 4]);
    tg.choose('criatura alvo', [N]).yes('marcador de célula', false).attack([[N, 1]]).passTo('declareBlockers');
    // base 7/5, +1/+0 do efeito e +1/+1 do marcador
    expect(tg.pt(myr)).toEqual([9, 6]);
    // Sephiroth não estava modificado e não recebeu o marcador
    expect(tg.pt(tg.bf(N))).toEqual([7, 5]);
  });

  it('equipada por um Equipamento de outro jogador conta como modificada', () => {
    const tg = setup({ battlefield: [[N, MYR], [{ name: 'Shadowspear', attachTo: MYR }]] });
    tg.choose('criatura alvo', [N]).yes('marcador de célula', false).attack([[N, 1]]).passTo('declareBlockers');
    expect(tg.pt(tg.bf(MYR))).toEqual([8, 6]);
  });

  it('uma Aura de outro jogador não torna a sua criatura modificada', () => {
    const tg = setup({ battlefield: [[N, MYR], [{ name: 'Angelic Gift', attachTo: MYR }]] });
    tg.choose('criatura alvo', [N]).yes('marcador de célula', false).attack([[N, 1]]).passTo('declareBlockers');
    expect(tg.pt(tg.bf(MYR))).toEqual([1, 1]);
  });

  it('a criatura modificada de um oponente não muda', () => {
    const tg = setup({ battlefield: [[N], ['Indomitable Ancients']] });
    tg.choose('criatura alvo', ['Indomitable Ancients']).yes('marcador de célula', true).attack([[N, 1]]).passTo('declareBlockers');
    const anc = tg.bf('Indomitable Ancients');
    expect(tg.state.objects[anc].counters.cell).toBe(1);
    expect(tg.pt(anc)).toEqual([2, 10]);
  });

  it('A Reunião: {3} e sacrificar uma criatura modificada devolvem Sephiroth do cemitério ao campo virado', () => {
    const tg = setup({ battlefield: [['Mountain', 'Mountain', 'Mountain', { name: MYR, counters: { '+1/+1': 1 } }], []], graveyard: [[N], []] });
    tg.choose('Sacrifique', [MYR]).activate(N, 'Reunião').resolveAll();
    const id = tg.bf(N);
    expect(tg.state.objects[id].tapped).toBe(true);
    expect(tg.find(MYR, 'graveyard', 0)).not.toBeNull();
  });

  it('A Reunião não pode ser ativada sem uma criatura modificada', () => {
    const tg = setup({ battlefield: [['Mountain', 'Mountain', 'Mountain', MYR], []], graveyard: [[N], []] });
    expect(() => tg.activate(N, 'Reunião')).toThrow(/indisponível/);
  });
});
