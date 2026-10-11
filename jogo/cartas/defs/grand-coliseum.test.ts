import { describe, expect, it } from 'vitest';
import { alternativasDeMana, entraVirado, setup } from '../../testes/padroes.ts';

const NOME = 'Grand Coliseum';

function ativar(rotulo: string) {
  const tg = setup({ battlefield: [[NOME], []] });
  const d = tg.pending!;
  const act = d.kind === 'priority' ? d.actions.find((a) => a.id.startsWith('mana:') && a.label.endsWith(rotulo))!.id : '';
  tg.answer({ kind: 'priority', action: act });
  tg.settle();
  return tg;
}

describe(NOME, () => {
  it('CR 605: mana que produz', () => expect(alternativasDeMana(NOME)).toEqual(['B', 'C', 'G', 'R', 'U', 'W']));
  it('CR 614.1c: entra virado', () => expect(entraVirado(NOME)).toBe(true));
  it('CR 120.3a: a mana colorida causa 1 de dano a você; {C} não', () => {
    const cor = ativar('{G}');
    expect(cor.state.players[0].manaPool.map((u) => u.type)).toEqual(['G']);
    expect(cor.life(0)).toBe(39);
    const incolor = ativar('{C}');
    expect(incolor.state.players[0].manaPool.map((u) => u.type)).toEqual(['C']);
    expect(incolor.life(0)).toBe(40);
  });
});
