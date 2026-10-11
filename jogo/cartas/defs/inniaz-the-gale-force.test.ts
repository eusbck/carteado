import { describe, expect, it } from 'vitest';
import { controllerOf, hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Inniaz, the Gale Force';
// três criaturas com voar: Inniaz, Zetalpa e Master of Predicaments
const voadores = [N, 'Zetalpa, Primal Dawn', 'Master of Predicaments'];
const ataque = (alvo: number): [string, number][] => voadores.map((v) => [v, alvo]);

describe(N, () => {
  it('com dois jogadores, vocês trocam o controle de duas permanentes à sua escolha', () => {
    const tg = setup({ battlefield: [[...voadores, 'Sol Ring'], ['Silver Myr']] });
    const id = tg.bf(N);
    expect(tg.pt(id)).toEqual([4, 4]);
    expect(hasKw(tg.g, id, 'flying')).toBe(true);
    tg.choose('que Ana passa a controlar', ['Silver Myr']).choose('que Bruno passa a controlar', ['Sol Ring']);
    tg.attack(ataque(1)).passTo('declareBlockers');
    expect(controllerOf(tg.g, tg.bf('Silver Myr'))).toBe(0);
    expect(controllerOf(tg.g, tg.bf('Sol Ring'))).toBe(1);
  });

  it('com três jogadores, cada um ganha uma permanente do jogador à direita, todas ao mesmo tempo', () => {
    // assentos Ana, Bruno, Carla: à direita de Ana está Carla; de Bruno, Ana; de Carla, Bruno
    const tg = setup({ players: 3, battlefield: [[...voadores, 'Sol Ring'], ['Silver Myr'], ['Elvish Mystic']] });
    tg.choose('de Carla que Ana passa a controlar', ['Elvish Mystic'])
      .choose('de Ana que Bruno passa a controlar', ['Sol Ring'])
      .choose('de Bruno que Carla passa a controlar', ['Silver Myr']);
    tg.attack(ataque(1)).passTo('declareBlockers');
    expect(controllerOf(tg.g, tg.bf('Elvish Mystic'))).toBe(0);
    expect(controllerOf(tg.g, tg.bf('Sol Ring'))).toBe(1);
    expect(controllerOf(tg.g, tg.bf('Silver Myr'))).toBe(2);
    // resolveu antes dos bloqueadores
    expect(tg.state.turn.step).toBe('declareBlockers');
  });

  it('a atacante com voar cedida sai do combate e continua virada', () => {
    const tg = setup({ battlefield: [voadores, ['Silver Myr']] });
    tg.choose('que Ana passa a controlar', ['Silver Myr']).choose('que Bruno passa a controlar', ['Master of Predicaments']);
    tg.attack(ataque(1)).passTo('declareBlockers');
    const cedida = tg.bf('Master of Predicaments');
    expect(controllerOf(tg.g, cedida)).toBe(1);
    expect(tg.state.objects[cedida].tapped).toBe(true);
    expect(tg.state.combat!.attackers.filter((a) => !a.removed).map((a) => a.id)).not.toContain(cedida);
  });

  it('de quem não controla permanente que não seja terreno, o jogador à esquerda não ganha nada', () => {
    const tg = setup({ battlefield: [[...voadores, 'Sol Ring'], ['Island']] });
    let perguntas = 0;
    tg.script.push((d) => { if (d.kind === 'select' && d.prompt.includes('Inniaz')) perguntas++; return null; });
    tg.choose('que Bruno passa a controlar', ['Sol Ring']);
    tg.attack(ataque(1)).passTo('declareBlockers');
    expect(perguntas).toBe(1);
    expect(controllerOf(tg.g, tg.bf('Sol Ring'))).toBe(1);
    expect(controllerOf(tg.g, tg.bf('Island'))).toBe(1);
  });

  it('com quatro atacantes com voar, o gatilho dispara uma vez só', () => {
    const tg = setup({ battlefield: [[...voadores, 'Thief of Sanity', 'Sol Ring'], ['Silver Myr']] });
    let perguntas = 0;
    tg.script.push((d) => { if (d.kind === 'select' && d.prompt.includes('Inniaz')) perguntas++; return null; });
    tg.attack([...ataque(1), ['Thief of Sanity', 1]]).passTo('declareBlockers');
    expect(perguntas).toBe(2);
  });

  it('com duas atacantes com voar, não dispara', () => {
    const tg = setup({ battlefield: [[...voadores, 'Sol Ring'], ['Silver Myr']] });
    tg.attack(ataque(1).slice(0, 2)).passTo('declareBlockers');
    expect(controllerOf(tg.g, tg.bf('Silver Myr'))).toBe(1);
  });

  it('{2}{W/U}: as atacantes com voar recebem +1/+1 até o fim do turno', () => {
    const tg = setup({ battlefield: [[N, 'Zetalpa, Primal Dawn', 'Indomitable Ancients', 'Island', 'Island', 'Island'], []] });
    tg.attack([[N, 1], ['Indomitable Ancients', 1]]).passTo('declareBlockers');
    tg.activate(N).resolveAll();
    expect(tg.pt(tg.bf(N))).toEqual([5, 5]);
    // atacante sem voar e voadora que não ataca não recebem
    expect(tg.pt(tg.bf('Indomitable Ancients'))).toEqual([2, 10]);
    expect(tg.pt(tg.bf('Zetalpa, Primal Dawn'))).toEqual([4, 8]);
    tg.passTo('upkeep', 1);
    expect(tg.pt(tg.bf(N))).toEqual([4, 4]);
  });
});
