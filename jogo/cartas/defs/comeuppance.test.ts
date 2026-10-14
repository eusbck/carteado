import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { dealDamage } from '../../motor/api.ts';

const NOME = 'Comeuppance';

describe(NOME, () => {
  it('no combate do oponente: o dano das criaturas dele a você é prevenido e cada uma recebe a mesma quantidade de Comeuppance', () => {
    const tg = setup({ active: 1, battlefield: [['Plains', 'Plains', 'Plains', 'Plains'], ['Indomitable Ancients']], hand: [[NOME], []] });
    tg.attack([['Indomitable Ancients', 0]]);
    tg.passUntil((x) => x.pending?.player === 0 && x.state.turn.step === 'declareAttackers');
    tg.cast(NOME).resolve();
    tg.passTo('main2', 1);
    expect(tg.life(0)).toBe(40);
    expect(tg.state.objects[tg.bf('Indomitable Ancients')].damage).toBe(2);
  });

  it('fonte que não é criatura: o dano vai para o controlador dela; suas próprias fontes não são prevenidas', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains', 'Plains', 'Plains', 'Wall of Omens'], ['Sol Ring']], hand: [[NOME], []] });
    tg.cast(NOME).resolve();
    dealDamage(tg.g, [{ source: tg.bf('Sol Ring'), target: { kind: 'player', id: 0 }, amount: 3, combat: false }]);
    expect(tg.life(0)).toBe(40);
    expect(tg.life(1)).toBe(37);
    dealDamage(tg.g, [{ source: tg.bf('Wall of Omens'), target: { kind: 'player', id: 0 }, amount: 1, combat: false }]);
    expect(tg.life(0)).toBe(39);
  });
});
