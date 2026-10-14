import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { dealDamage } from '../../motor/api.ts';

const NOME = 'Gisela, Blade of Goldnight';

describe(NOME, () => {
  it('dobra o dano a oponentes e às permanentes deles, de qualquer fonte; previne metade (para cima) do dano a você', () => {
    const tg = setup({ battlefield: [[NOME, 'Wall of Omens'], ['Indomitable Ancients']] });
    const anc = tg.bf('Indomitable Ancients');
    dealDamage(tg.g, [{ source: anc, target: { kind: 'player', id: 1 }, amount: 3, combat: false }]);
    expect(tg.life(1)).toBe(34);
    dealDamage(tg.g, [{ source: tg.bf('Wall of Omens'), target: { kind: 'obj', id: anc }, amount: 2, combat: false }]);
    expect(tg.state.objects[anc].damage).toBe(4);
    dealDamage(tg.g, [{ source: anc, target: { kind: 'player', id: 0 }, amount: 5, combat: false }]);
    expect(tg.life(0)).toBe(38);
    dealDamage(tg.g, [{ source: anc, target: { kind: 'obj', id: tg.bf('Wall of Omens') }, amount: 3, combat: false }]);
    expect(tg.state.objects[tg.bf('Wall of Omens')].damage).toBe(1);
  });

  it('atropelar: 2 no bloqueador e 3 no jogador viram 4 e 6', () => {
    const tg = setup({ battlefield: [[NOME, 'Indomitable Ancients'], ['Wall of Omens']] });
    // o dano já atribuído (CR 510.1c) é que é dobrado, cada parte separadamente
    dealDamage(tg.g, [
      { source: tg.bf('Indomitable Ancients'), target: { kind: 'obj', id: tg.bf('Wall of Omens') }, amount: 2, combat: true },
      { source: tg.bf('Indomitable Ancients'), target: { kind: 'player', id: 1 }, amount: 3, combat: true },
    ]);
    expect(tg.state.objects[tg.bf('Wall of Omens')].damage).toBe(4);
    expect(tg.life(1)).toBe(34);
  });
});
