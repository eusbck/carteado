import { describe, expect, it } from 'vitest';
import { untilEndOfTurn } from '../../motor/api.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Cloud, Ex-SOLDIER';
const terrenos = ['Mountain', 'Forest', 'Plains', 'Mountain', 'Forest'];

describe(N, () => {
  it('ao entrar, anexa a ele o Equipamento alvo que você controla', () => {
    const tg = setup({ battlefield: [[...terrenos, 'Silver Myr', { name: 'Basilisk Collar', attachTo: 'Silver Myr' }], []], hand: [[N], []] });
    tg.choose('Equipamento alvo', ['Basilisk Collar']).cast(N).resolve().resolveAll();
    expect(tg.state.objects[tg.bf('Basilisk Collar')].attachedTo).toBe(tg.bf(N));
  });

  it('o alvo é opcional: pode entrar sem anexar nada', () => {
    const tg = setup({ battlefield: [[...terrenos, 'Basilisk Collar'], []], hand: [[N], []] });
    tg.choose('Equipamento alvo', []).cast(N).resolve().resolveAll();
    expect(tg.bf(N)).not.toBeNull();
    expect(tg.state.objects[tg.bf('Basilisk Collar')].attachedTo).toBeNull();
  });

  it('um Equipamento que não pode ser anexado a Cloud continua onde está', () => {
    const tg = setup({ battlefield: [[...terrenos, 'Silver Myr', { name: 'Basilisk Collar', attachTo: 'Silver Myr' }], []], hand: [[N], []] });
    tg.choose('Equipamento alvo', ['Basilisk Collar']).cast(N).resolve();
    // com o gatilho na pilha, Cloud ganha proteção contra artefatos (CR 702.16d: não pode ser equipado por eles)
    const cloud = tg.bf(N);
    untilEndOfTurn({ g: tg.g, you: 0, source: cloud } as never, [cloud], [{ k: 'addKeyword', kw: 'protection', param: 'type:Artifact' }]);
    tg.refresh().resolveAll();
    expect(tg.state.objects[tg.bf('Basilisk Collar')].attachedTo).toBe(tg.bf('Silver Myr'));
  });

  it('ao atacar, compra uma carta por criatura equipada atacante e, com força 7 ou mais, cria dois Treasures', () => {
    const tg = setup({
      battlefield: [[N, { name: 'Buster Sword', attachTo: N }, 'Silver Myr', { name: 'Basilisk Collar', attachTo: 'Silver Myr' }, 'Indomitable Ancients'], []],
    });
    expect(tg.pt(tg.bf(N))).toEqual([7, 6]);
    const mao = tg.names(0, 'hand').length;
    tg.attack([[N, 1], ['Silver Myr', 1], ['Indomitable Ancients', 1]]).passTo('declareBlockers');
    expect(tg.names(0, 'hand').length).toBe(mao + 2);
    expect(tg.all('Treasure').length).toBe(2);
  });

  it('só conta as equipadas que atacam; sem força 7, não cria Treasures', () => {
    const tg = setup({
      battlefield: [[N, { name: 'Basilisk Collar', attachTo: N }, 'Silver Myr', { name: 'Shadowspear', attachTo: 'Silver Myr' }], []],
    });
    const mao = tg.names(0, 'hand').length;
    tg.attack([[N, 1]]).passTo('declareBlockers');
    expect(tg.names(0, 'hand').length).toBe(mao + 1);
    expect(tg.all('Treasure').length).toBe(0);
  });

  it('tem ímpeto: ataca no turno em que entra', () => {
    const tg = setup({ battlefield: [[{ name: N, ready: false }], []] });
    tg.attack([[N, 1]]).passTo('main2', 0);
    expect(tg.life(1)).toBe(36);
  });
});
