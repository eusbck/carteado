import { describe, expect, it } from 'vitest';
import { putOntoBattlefield, returnToHand, untap } from '../../motor/api.ts';
import { manaOptions } from '../../motor/costs.ts';
import { activateMana, enterCard, fixture, runEffect } from '../../testes/artefatos.ts';
import type { TestGame } from '../../testes/harness.ts';

const N = 'Pit of Offerings';
const opcoes = (tg: TestGame, id: number): string[] => manaOptions(tg.g, 0).filter((o) => o.obj === id).map((o) => o.alt.join('')).sort();

describe(N, () => {
  it('entra virado e pode exilar até três cartas escolhidas entre cemitérios diferentes', () => {
    const tg = fixture({ hand: [[N], []], graveyard: [['Growth Spiral', 'Sol Ring'], ['Swords to Plowshares', 'Forest']] });
    tg.choose('até três cartas alvo de cemitérios', ['Growth Spiral', 'Sol Ring', 'Swords to Plowshares']).play(N).resolveAll();
    expect(tg.state.objects[tg.bf(N)].tapped).toBe(true);
    expect(tg.names(0, 'exile').sort()).toEqual(['Growth Spiral', 'Sol Ring']);
    expect(tg.names(1, 'exile')).toEqual(['Swords to Plowshares']);
    expect(tg.names(1, 'graveyard')).toEqual(['Forest']);
  });

  it('a habilidade das cartas exiladas oferece só cores e nunca mana incolor', () => {
    const tg = fixture({ hand: [[N], []], graveyard: [['Growth Spiral', 'Sol Ring'], ['Swords to Plowshares']] });
    tg.choose('até três cartas alvo de cemitérios', ['Growth Spiral', 'Sol Ring', 'Swords to Plowshares']).play(N).resolveAll();
    untap(tg.g, tg.bf(N));
    tg.refresh();
    // Uma opção {C} da habilidade independente; a última oferece G, U e W, uma mana por ativação.
    expect(opcoes(tg, tg.bf(N))).toEqual(['C', 'G', 'U', 'W']);
    activateMana(tg, N, 'U');
    expect(tg.state.players[0].manaPool.map((u) => u.type)).toEqual(['U']);
    expect(tg.state.zones.stack).toHaveLength(0);
  });

  it('sem cartas exiladas, a última habilidade não produz mana', () => {
    const tg = fixture({ hand: [[N], []], graveyard: [['Growth Spiral'], []] });
    tg.choose('até três cartas alvo de cemitérios', []).play(N).resolveAll();
    expect(tg.find('Growth Spiral', 'graveyard')).not.toBeNull();
    untap(tg.g, tg.bf(N));
    tg.refresh();
    expect(opcoes(tg, tg.bf(N))).toEqual(['C']);
    activateMana(tg, N, 'C');
    expect(tg.state.players[0].manaPool.map((u) => u.type)).toEqual(['C']);
  });

  it('uma carta incolor exilada não acrescenta opções de mana', () => {
    const tg = fixture({ hand: [[N], []], graveyard: [['Sol Ring'], []] });
    tg.choose('até três cartas alvo de cemitérios', ['Sol Ring']).play(N).resolveAll();
    untap(tg.g, tg.bf(N));
    tg.refresh();
    expect(opcoes(tg, tg.bf(N))).toEqual(['C']);
  });

  it('CR 608.2b: exila os alvos que continuam legais e ignora os demais', () => {
    const tg = fixture({ hand: [[N], []], graveyard: [['Growth Spiral'], ['Swords to Plowshares']] });
    tg.choose('até três cartas alvo de cemitérios', ['Growth Spiral', 'Swords to Plowshares']).play(N);
    runEffect(tg, returnToHand(tg.g, [tg.find('Growth Spiral', 'graveyard', 0)!]));
    tg.resolveAll();
    expect(tg.find('Swords to Plowshares', 'exile', 1)).not.toBeNull();
    expect(tg.find('Growth Spiral', 'exile')).toBeNull();
    untap(tg.g, tg.bf(N));
    tg.refresh();
    expect(opcoes(tg, tg.bf(N))).toEqual(['C', 'W']);
  });

  it('deixa de oferecer as cores de uma carta que sai do exílio', () => {
    const tg = fixture({ hand: [[N], []], graveyard: [['Growth Spiral'], ['Swords to Plowshares']] });
    tg.choose('até três cartas alvo de cemitérios', ['Growth Spiral', 'Swords to Plowshares']).play(N).resolveAll();
    runEffect(tg, returnToHand(tg.g, [tg.find('Growth Spiral', 'exile')!]));
    untap(tg.g, tg.bf(N));
    tg.refresh();
    expect(opcoes(tg, tg.bf(N))).toEqual(['C', 'W']);
  });

  it('CR 607.2a: duas cópias não compartilham as cartas exiladas', () => {
    const tg = fixture({ hand: [[N], []], graveyard: [['Growth Spiral'], ['Swords to Plowshares']] });
    tg.choose('até três cartas alvo de cemitérios', ['Growth Spiral']).play(N).resolveAll();
    const primeira = tg.bf(N);
    tg.choose('até três cartas alvo de cemitérios', ['Swords to Plowshares']);
    const segunda = enterCard(tg, N, 0)!;
    tg.resolveAll();
    untap(tg.g, primeira);
    untap(tg.g, segunda);
    tg.refresh();
    expect(opcoes(tg, primeira)).toEqual(['C', 'G', 'U']);
    expect(opcoes(tg, segunda)).toEqual(['C', 'W']);
  });

  it('CR 400.7: um novo objeto no campo não usa as ofertas da passagem anterior', () => {
    const tg = fixture({ hand: [[N], []], graveyard: [['Growth Spiral'], []] });
    tg.choose('até três cartas alvo de cemitérios', ['Growth Spiral']).play(N).resolveAll();
    runEffect(tg, returnToHand(tg.g, [tg.bf(N)]));
    runEffect(tg, putOntoBattlefield(tg.g, [{ id: tg.find(N, 'hand')!, controller: 0 }], 'effect'));
    tg.resolveAll();
    expect(tg.find('Growth Spiral', 'exile')).not.toBeNull();
    untap(tg.g, tg.bf(N));
    tg.refresh();
    expect(opcoes(tg, tg.bf(N))).toEqual(['C']);
  });
});
