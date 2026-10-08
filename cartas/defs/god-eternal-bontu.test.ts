import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const BONTU = 'God-Eternal Bontu';
const terrenos = ['Swamp', 'Swamp', 'Swamp', 'Swamp', 'Swamp'];

describe('God-Eternal Bontu', () => {
  it('ao entrar, sacrifica outras permanentes e compra o mesmo tanto', () => {
    const tg = setup({ battlefield: [[...terrenos, 'Sol Ring', 'Wall of Omens'], []], hand: [[BONTU], []], library: [['Island', 'Forest', 'Plains'], []] });
    tg.cast(BONTU).resolve();
    tg.choose('God-Eternal Bontu: sacrifique', ['Sol Ring', 'Wall of Omens']).resolve();
    expect(tg.find('Sol Ring')).toBeNull();
    expect(tg.find('Wall of Omens')).toBeNull();
    expect(tg.names(0, 'hand')).toEqual(['Island', 'Forest']);
  });

  it('pode sacrificar zero permanentes', () => {
    const tg = setup({ battlefield: [[...terrenos, 'Sol Ring'], []], hand: [[BONTU], []], library: [['Island'], []] });
    tg.cast(BONTU).resolve();
    tg.choose('God-Eternal Bontu: sacrifique', []).resolve();
    expect(tg.find('Sol Ring')).not.toBeNull();
    expect(tg.names(0, 'hand')).toEqual([]);
  });

  it('os gatilhos dos sacrifícios vão para a pilha depois de comprar', () => {
    const tg = setup({ battlefield: [[...terrenos, 'Solemn Simulacrum'], []], hand: [[BONTU], []], library: [['Island', 'Forest'], []] });
    tg.cast(BONTU).resolve();
    tg.choose('God-Eternal Bontu: sacrifique', ['Solemn Simulacrum']).resolve();
    // comprou a Island pela Bontu; o gatilho do Solemn está na pilha agora
    expect(tg.names(0, 'hand')).toEqual(['Island']);
    expect(tg.state.zones.stack.length).toBe(1);
    tg.yes('Solemn Simulacrum', true).resolve();
    expect(tg.names(0, 'hand')).toEqual(['Island', 'Forest']);
  });

  it('quando morre, pode ir para o grimório do dono em terceiro a partir do topo', () => {
    const tg = setup({ battlefield: [[BONTU, 'Swamp', 'Swamp'], []], hand: [['Infernal Grasp'], []], library: [['Island', 'Forest', 'Plains', 'Mountain'], []] });
    tg.yes('terceiro a partir do topo', true).choose('criatura alvo', [BONTU]).cast('Infernal Grasp').resolveAll();
    expect(tg.names(0, 'library')).toEqual(['Island', 'Forest', BONTU, 'Plains', 'Mountain']);
    expect(tg.names(0, 'graveyard')).toEqual(['Infernal Grasp']);
  });

  it('quando é exilada do campo também pode ir para o grimório', () => {
    const tg = setup({ battlefield: [[BONTU, 'Plains'], []], hand: [['Swords to Plowshares'], []], library: [['Island', 'Forest'], []] });
    tg.yes('terceiro a partir do topo', true).choose('criatura alvo', [BONTU]).cast('Swords to Plowshares').resolveAll();
    expect(tg.names(0, 'library')).toEqual(['Island', 'Forest', BONTU]);
    expect(tg.find(BONTU, 'exile')).toBeNull();
  });

  it('sem querer, fica no cemitério', () => {
    const tg = setup({ battlefield: [[BONTU, 'Swamp', 'Swamp'], []], hand: [['Infernal Grasp'], []], library: [['Island'], []] });
    tg.yes('terceiro a partir do topo', false).choose('criatura alvo', [BONTU]).cast('Infernal Grasp').resolveAll();
    expect(tg.names(0, 'graveyard')).toContain(BONTU);
  });

  it('ameaça: um bloqueador só não basta', () => {
    const tg = setup({ battlefield: [[BONTU], ['Wall of Omens']] });
    expect(() => tg.attack([[BONTU, 1]]).block([['Wall of Omens', BONTU]]).passTo('main2')).toThrow(/menace/);
  });
});
