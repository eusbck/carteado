import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Cloud, Ex-SOLDIER';
const terras = ['Mountain', 'Forest', 'Plains', 'Plains', 'Plains'];

describe(N, () => {
  it('ao entrar, anexa a ele o Equipamento alvo, tirando-o de outra criatura', () => {
    const tg = setup({ battlefield: [[...terras, 'Loxodon Warhammer', 'Silver Myr', { name: 'Lightning Greaves', attachTo: 'Silver Myr' }], []], hand: [[N], []] });
    tg.choose('Equipamento alvo', ['Lightning Greaves']).cast(N).resolveAll();
    const cloud = tg.bf(N);
    expect(tg.state.objects[tg.bf('Lightning Greaves')].attachedTo).toBe(cloud);
    expect(hasKw(tg.g, cloud, 'haste')).toBe(true);
  });

  it('ao atacar, compra uma carta por criatura atacante equipada; com força 7 ou mais, dois Tesouros', () => {
    const tg = setup({
      battlefield: [[N, 'Silver Myr', 'Llanowar Elves', { name: 'Loxodon Warhammer', attachTo: N }, { name: 'Lightning Greaves', attachTo: 'Silver Myr' }], []],
      step: 'beginCombat',
    });
    tg.attack([[N, 1], ['Silver Myr', 1], ['Llanowar Elves', 1]]).passTo('declareBlockers');
    expect(tg.names(0, 'hand').length).toBe(2);
    expect(tg.names(0, 'battlefield').filter((n) => n === 'Treasure').length).toBe(2);
  });

  it('com força menor que 7, não cria Tesouros', () => {
    const tg = setup({ battlefield: [[N, { name: 'Lightning Greaves', attachTo: N }], []], step: 'beginCombat' });
    tg.attack([[N, 1]]).passTo('declareBlockers');
    expect(tg.names(0, 'hand').length).toBe(1);
    expect(tg.names(0, 'battlefield').filter((n) => n === 'Treasure').length).toBe(0);
  });
});
