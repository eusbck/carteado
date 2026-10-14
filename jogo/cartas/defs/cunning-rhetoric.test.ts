import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Cunning Rhetoric';
const ilhas = Array(8).fill('Island');

describe(N, () => {
  it('quando um oponente ataca você, exila o topo dele e você pode conjurá-la com mana de qualquer cor', () => {
    const tg = setup({ players: 3, active: 1, battlefield: [[N, 'Island'], ['Indomitable Ancients', 'Baleful Strix'], []], library: [ilhas, ['Elvish Mystic', ...ilhas], ilhas] });
    // Bruno ataca Ana com uma e Carla com a outra: um gatilho só
    tg.attack([['Indomitable Ancients', 0], ['Baleful Strix', 2]]).passTo('declareBlockers');
    const carta = tg.state.zones.exile.find((id) => tg.state.objects[id].def === 'Elvish Mystic')!;
    expect(carta).toBeDefined();
    expect(tg.state.objects[carta].faceDown).toBeFalsy();
    expect(tg.state.zones.exile).toHaveLength(1);
    // no turno de Ana, Elvish Mystic ({G}) com a Island
    tg.passTo('main1', 0);
    const acao = tg.actionIds().find((a) => a.startsWith('cast:') && a.split(':').includes(String(carta)))!;
    expect(acao).toBeDefined();
    tg.answer({ kind: 'priority', action: acao });
    tg.resolveAll();
    expect(tg.state.objects[tg.bf('Elvish Mystic')].controller).toBe(0);
  });

  it('não dispara quando o oponente ataca outro jogador', () => {
    const tg = setup({ players: 3, active: 1, battlefield: [[N], ['Indomitable Ancients'], []] });
    tg.attack([['Indomitable Ancients', 2]]).passTo('declareBlockers');
    expect(tg.state.zones.exile).toEqual([]);
  });

  it('um terreno exilado assim se joga só com a jogada de terreno do turno disponível', () => {
    const tg = setup({ active: 1, battlefield: [[N], ['Indomitable Ancients']], library: [ilhas, ['Swamp', ...ilhas]], hand: [['Forest'], []] });
    tg.attack([['Indomitable Ancients', 0]]).passTo('main1', 0);
    const carta = tg.state.zones.exile[0];
    const jogar = () => tg.actionIds().find((a) => a.startsWith('play:') && a.split(':').includes(String(carta)));
    expect(jogar()).toBeDefined();
    tg.play('Forest');
    expect(jogar()).toBeUndefined();
  });
});
