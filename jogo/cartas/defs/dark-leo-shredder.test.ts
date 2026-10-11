import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { hasKw } from '../../motor/chars.ts';

const DL = 'Dark Leo & Shredder';
const ninja = { name: 'Ninja', token: true };

describe('Dark Leo & Shredder', () => {
  it('pelo sneak, entra virada e atacando quem a criatura devolvida atacava', () => {
    const tg = setup({ players: 3, battlefield: [['Indomitable Ancients', 'Plains', 'Swamp'], [], []], hand: [[DL], [], []] });
    tg.attack([['Indomitable Ancients', 2]]).passTo('declareBlockers');
    tg.cast(DL, 'sneak').resolveAll();
    const id = tg.bf(DL);
    expect(tg.state.objects[id].tapped).toBe(true);
    expect(tg.state.combat!.attackers.find((a) => a.id === id && !a.removed)?.target).toEqual({ kind: 'player', id: 2 });
    expect(tg.find('Indomitable Ancients', 'hand', 0)).not.toBeNull();
    tg.passTo('main2');
    expect(tg.life(2)).toBe(39);
  });

  it('não foi declarada atacante: gatilhos de atacar não disparam', () => {
    const tg = setup({ battlefield: [['Indomitable Ancients', 'Endless Foot Assault', 'Plains', 'Swamp'], []], hand: [[DL], []] });
    tg.attack([['Indomitable Ancients', 1]]).passTo('declareBlockers');
    expect(tg.all('Ninja').length).toBe(1);
    tg.cast(DL, 'sneak').resolveAll();
    expect(tg.find(DL)).not.toBeNull();
    expect(tg.all('Ninja').length).toBe(1);
  });

  it('só na sua etapa de declarar bloqueadores, depois dos bloqueios', () => {
    const tg = setup({ battlefield: [['Indomitable Ancients', 'Plains', 'Swamp'], ['Wall of Omens']], hand: [[DL], []] });
    const temSneak = () => tg.actionIds().some((a) => a.endsWith(':sneak'));
    expect(temSneak()).toBe(false);
    tg.attack([['Indomitable Ancients', 1]]).passTo('declareAttackers');
    expect(temSneak()).toBe(false);
    // bloqueado: não há criatura não bloqueada para devolver
    tg.block([['Wall of Omens', 'Indomitable Ancients']]).passTo('declareBlockers');
    expect(temSneak()).toBe(false);
    // no turno de outro jogador, também não
    const tg2 = setup({ active: 1, battlefield: [['Plains', 'Swamp'], ['Indomitable Ancients']], hand: [[DL], []] });
    tg2.attack([['Indomitable Ancients', 0]]).passTo('declareBlockers');
    tg2.passUntil((t) => t.pending?.player === 0);
    expect(tg2.actionIds().some((a) => a.endsWith(':sneak'))).toBe(false);
  });

  it('Ninjas atacantes que você controla têm toque mortífero', () => {
    const tg = setup({ battlefield: [[DL, ninja], []] });
    const n = tg.bf('Ninja');
    expect(hasKw(tg.g, n, 'deathtouch')).toBe(false);
    tg.attack([['Ninja', 1]]).passTo('declareBlockers');
    expect(hasKw(tg.g, n, 'deathtouch')).toBe(true);
    expect(hasKw(tg.g, tg.bf(DL), 'deathtouch')).toBe(false);
  });

  it('dano de combate: cria um Ninja; com cinco ou mais Ninjas, o jogador perde metade da vida arredondada para cima', () => {
    const tg = setup({ battlefield: [[DL, ninja, ninja, ninja], []] });
    tg.attack([[DL, 1]]).passTo('main2');
    // 1 de dano; Dark Leo + 3 + a nova = 5 Ninjas: perde metade de 39, arredondada para cima (20)
    expect(tg.all('Ninja').length).toBe(4);
    expect(tg.life(1)).toBe(19);
    const tg2 = setup({ battlefield: [[DL, ninja], []] });
    tg2.attack([[DL, 1]]).passTo('main2');
    expect(tg2.life(1)).toBe(39);
  });
});
