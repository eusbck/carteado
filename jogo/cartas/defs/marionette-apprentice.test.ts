import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Marionette Apprentice';

describe(N, () => {
  it('CR 702.123a: entra 1/2 e o fabricar vai para a pilha; escolhendo o marcador, fica 2/3', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp'], []], hand: [[N], []] });
    tg.cast(N).resolve();
    expect(tg.pt(tg.bf(N))).toEqual([1, 2]);
    expect(tg.state.zones.stack).toHaveLength(1);
    tg.yes('Fabricar 1', true).resolve();
    expect(tg.pt(tg.bf(N))).toEqual([2, 3]);
    expect(tg.find('Servo')).toBeNull();
  });

  it('sem o marcador, cria um Servo 1/1 artefato', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp'], []], hand: [[N], []] });
    tg.yes('Fabricar 1', false).cast(N).resolve().resolve();
    expect(tg.pt(tg.bf('Servo'))).toEqual([1, 1]);
    expect(tg.pt(tg.bf(N))).toEqual([1, 2]);
  });

  it('se a Marionette saiu do campo antes do fabricar resolver, cria o Servo', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Swamp', 'Swamp'], []], hand: [[N, 'Infernal Grasp'], []] });
    tg.cast(N).resolve();
    tg.choose('criatura alvo', [N]).cast('Infernal Grasp').resolve();
    tg.resolve();
    expect(tg.bf('Servo')).toBeTruthy();
  });

  it('outra criatura ou artefato seu indo para o cemitério: cada oponente perde 1', () => {
    const tg = setup({ players: 3, battlefield: [[N, 'Sol Ring', 'Elvish Mystic', 'Swamp', 'Swamp'], ['Indomitable Ancients'], []], hand: [['Infernal Grasp'], [], []] });
    tg.choose('criatura alvo', ['Elvish Mystic']).cast('Infernal Grasp').resolveAll();
    expect([tg.life(1), tg.life(2)]).toEqual([39, 39]);
    // a criatura do oponente não conta
    expect(tg.life(0)).toBe(38);
  });
});
