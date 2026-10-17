// Revisão B: exilar "até esta permanente sair do campo" (CR 610.3). O efeito que devolve as cartas é de uma vez só e
// acontece logo depois de a permanente sair, sem pilha; vale também quando o dono dela deixa a partida (CR 800.4a).
import { describe, expect, it } from 'vitest';
import { controllerOf } from '../motor/chars.ts';
import { fixture as setup } from './artefatos.ts';

const GRASP = 'Grasp of Fate';

describe('CR 610.3: exilada até a permanente sair do campo', () => {
  it('CR 610.3 (ruling 1 de Austere Command): a carta volta no meio da mágica e um modo seguinte pode destruí-la', () => {
    const tg = setup({ battlefield: [[...Array(9).fill('Plains')], ['Baleful Strix']], hand: [[GRASP, 'Austere Command'], []] });
    tg.choose('permanente não terreno alvo', ['Baleful Strix']);
    tg.cast(GRASP).resolveAll();
    expect(tg.find('Baleful Strix')).toBeNull();
    // modos em ordem: encantamentos (Grasp sai e a Strix volta) e depois criaturas de valor de mana 3 ou menos
    tg.choose('escolha', ['Destrua todos os encantamentos', 'Destrua todas as criaturas com valor de mana 3 ou menos']).cast('Austere Command').resolve();
    expect(tg.find(GRASP)).toBeNull();
    expect(tg.find('Baleful Strix')).toBeNull();
    expect(tg.find('Baleful Strix', 'graveyard', 1)).not.toBeNull();
  });

  it('CR 610.3d: duas permanentes que saem juntas devolvem as cartas juntas, sob o controle dos donos (610.3c)', () => {
    const tg = setup({ players: 3, battlefield: [[...Array(11).fill('Plains')], ['Indomitable Ancients'], ['Sol Ring']], hand: [[GRASP, GRASP, 'Cleansing Nova'], [], []] });
    tg.choose('permanente não terreno alvo', ['Indomitable Ancients']);
    tg.cast(GRASP).resolveAll();
    tg.choose('permanente não terreno alvo', ['Sol Ring']);
    tg.cast(GRASP).resolveAll();
    expect(tg.find('Indomitable Ancients')).toBeNull();
    expect(tg.find('Sol Ring')).toBeNull();
    let voltas = 0;
    const antes = tg.state.log.length;
    tg.choose('escolha', ['Destrua todos os artefatos e encantamentos']).cast('Cleansing Nova').resolve();
    voltas = tg.state.log.slice(antes).filter((l) => l.text.includes('do exílio para o campo')).length;
    expect(voltas).toBe(1);
    expect(controllerOf(tg.g, tg.bf('Indomitable Ancients'))).toBe(1);
    // o Sol Ring volta depois da destruição de Cleansing Nova: fica no campo
    expect(controllerOf(tg.g, tg.bf('Sol Ring'))).toBe(2);
  });

  it('CR 800.4a: quem tem a carta exilada deixa a partida: a carta volta ao campo do dono dela', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains', 'Plains'], ['Indomitable Ancients']], hand: [[GRASP], []], players: 3 });
    tg.choose('permanente não terreno alvo', ['Indomitable Ancients']);
    tg.cast(GRASP).resolveAll();
    tg.game.concede(0);
    tg.settle();
    expect(controllerOf(tg.g, tg.bf('Indomitable Ancients'))).toBe(1);
  });
});
