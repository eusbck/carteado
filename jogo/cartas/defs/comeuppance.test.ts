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

  it('criatura que já saiu do campo (gatilho de morte): o dano é prevenido e não vai para o controlador', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains', 'Plains', 'Plains', 'Mountain'], ['Boros Reckoner']], hand: [[NOME, 'Lightning Bolt'], []] });
    tg.cast(NOME).resolve();
    // o Bolt mata o Boros Reckoner de Bruno, que ainda dispara e mira Ana; a fonte é a criatura que morreu
    tg.choose('qualquer alvo', ['Boros Reckoner']).choose('qualquer alvo', ['Ana']);
    tg.cast('Lightning Bolt').resolveAll();
    expect(tg.names(1, 'graveyard')).toEqual(['Boros Reckoner']);
    expect(tg.life(0)).toBe(40);
    expect(tg.life(1)).toBe(40);
  });

  it('CR 616.1e: com Selfless Squire, Comeuppance previne primeiro e devolve o dano; o Squire ganha os marcadores', () => {
    const tg = setup({ active: 1, battlefield: [[...Array(8).fill('Plains')], ['Indomitable Ancients']], hand: [[NOME, 'Selfless Squire'], []] });
    tg.attack([['Indomitable Ancients', 0]]);
    tg.passUntil((x) => x.pending?.player === 0 && x.state.turn.step === 'declareAttackers');
    tg.cast('Selfless Squire').cast(NOME).resolveAll();
    tg.passTo('main2', 1);
    expect(tg.life(0)).toBe(40);
    expect(tg.state.objects[tg.bf('Indomitable Ancients')].damage).toBe(2);
    expect(tg.state.objects[tg.bf('Selfless Squire')].counters['+1/+1']).toBe(2);
  });
});
