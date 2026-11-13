import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'The Gitrog Monster';

describe(N, () => {
  it('na manutenção, sacrificando um terreno, ele fica e você compra (o terreno foi para o cemitério)', () => {
    const tg = setup({ battlefield: [[N, 'Forest'], []], library: [['Hex', 'Hex', 'Hex'], []], step: 'untap' });
    tg.choose('The Gitrog Monster: sacrifique', ['Forest']).passTo('main1');
    expect(tg.find(N)).not.toBeNull();
    expect(tg.names(0, 'graveyard')).toEqual(['Forest']);
    // a compra do gatilho e a da etapa de compra
    expect(tg.names(0, 'hand').length).toBeGreaterThanOrEqual(1);
  });
  it('na manutenção, sem sacrificar um terreno, sacrifica o Gitrog', () => {
    const tg = setup({ battlefield: [[N, 'Forest'], []], library: [['Hex', 'Hex'], []], step: 'untap' });
    tg.choose('The Gitrog Monster: sacrifique', []).passTo('main1');
    expect(tg.find(N)).toBeNull();
    expect(tg.find('Forest')).not.toBeNull();
  });
  it('moer vários terrenos de uma vez compra uma carta só', () => {
    const tg = setup({ battlefield: [[N, 'Island', 'Swamp'], []], hand: [['Glimpse the Unthinkable'], []], library: [['Forest', 'Forest', 'Plains', ...Array<string>(10).fill('Hex')], []] });
    tg.choose('jogador alvo', ['Ana']).cast('Glimpse the Unthinkable').resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Hex']);
  });
  it('você pode jogar um terreno adicional', () => {
    const tg = setup({ battlefield: [[N], []], hand: [['Forest', 'Island', 'Swamp'], []] });
    tg.play('Forest').play('Island');
    expect(tg.actionIds().some((a) => a.startsWith('play:'))).toBe(false);
  });
});
