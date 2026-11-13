// lote4-b: cometer um crime (CR 700.13; motor/crime.ts).
import { describe, expect, it } from 'vitest';
import { crimesNoLote } from '../motor/api.ts';
import type { GameEvent } from '../motor/events.ts';
import { setup } from './harness.ts';

const conjura = (obj: number): GameEvent => ({ type: 'cast', obj, player: 0, from: 'hand', copy: false });
const alvoObj = (by: number, id: number): GameEvent => ({ type: 'target', target: { kind: 'obj', id }, by, controller: 0, spell: true });

describe('CR 700.13: cometer um crime', () => {
  const montar = () => setup({ players: 3, battlefield: [['Wall of Omens'], ['Indomitable Ancients'], []], graveyard: [['Sol Ring'], ['Burnished Hart'], []] });

  it('CR 700.13: mirar um oponente, um permanente dele ou uma carta no cemitério dele é crime', () => {
    const tg = montar();
    const magia = 9999;
    expect(crimesNoLote(tg.g, [conjura(magia), { type: 'target', target: { kind: 'player', id: 2 }, by: magia, controller: 0, spell: true }])).toEqual([{ jogador: 0, por: magia }]);
    expect(crimesNoLote(tg.g, [conjura(magia), alvoObj(magia, tg.bf('Indomitable Ancients'))])).toHaveLength(1);
    expect(crimesNoLote(tg.g, [conjura(magia), alvoObj(magia, tg.find('Burnished Hart', 'graveyard')!)])).toHaveLength(1);
  });

  it('CR 700.13: mirar a si mesmo, algo seu ou uma carta do seu cemitério não é crime', () => {
    const tg = montar();
    const magia = 9999;
    expect(crimesNoLote(tg.g, [conjura(magia), { type: 'target', target: { kind: 'player', id: 0 }, by: magia, controller: 0, spell: true }])).toHaveLength(0);
    expect(crimesNoLote(tg.g, [conjura(magia), alvoObj(magia, tg.bf('Wall of Omens'))])).toHaveLength(0);
    expect(crimesNoLote(tg.g, [conjura(magia), alvoObj(magia, tg.find('Sol Ring', 'graveyard')!)])).toHaveLength(0);
  });

  it('CR 700.13: dois alvos criminosos na mesma mágica são um crime só', () => {
    const tg = montar();
    const magia = 9999;
    const lote = [conjura(magia), alvoObj(magia, tg.bf('Indomitable Ancients')), { type: 'target', target: { kind: 'player', id: 1 }, by: magia, controller: 0, spell: true } as GameEvent];
    expect(crimesNoLote(tg.g, lote)).toHaveLength(1);
  });

  it('CR 700.13: copiar ou mudar os alvos não é conjurar, ativar nem pôr na pilha: não comete crime', () => {
    const tg = montar();
    const magia = 9999;
    expect(crimesNoLote(tg.g, [{ type: 'cast', obj: magia, player: 0, from: 'hand', copy: true }, alvoObj(magia, tg.bf('Indomitable Ancients'))])).toHaveLength(0);
    expect(crimesNoLote(tg.g, [alvoObj(magia, tg.bf('Indomitable Ancients'))])).toHaveLength(0);
  });

  it('CR 700.13: habilidade ativada e habilidade desencadeada posta na pilha também cometem crime', () => {
    const tg = montar();
    const hab = 9998;
    const alvo = tg.bf('Indomitable Ancients');
    const ativa: GameEvent = { type: 'activate', obj: hab, source: tg.bf('Wall of Omens'), player: 0, abilityId: 'x' };
    const dispara: GameEvent = { type: 'triggerOnStack', obj: hab, source: tg.bf('Wall of Omens'), abilityId: 'x', controller: 0 };
    expect(crimesNoLote(tg.g, [ativa, { ...alvoObj(hab, alvo), spell: false } as GameEvent])).toHaveLength(1);
    expect(crimesNoLote(tg.g, [{ ...alvoObj(hab, alvo), spell: false } as GameEvent, dispara])).toHaveLength(1);
  });
});
