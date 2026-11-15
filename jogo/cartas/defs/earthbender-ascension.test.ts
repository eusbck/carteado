import { describe, expect, it } from 'vitest';
import { chars, destroy, hasKw, removeCounters, returnToHand } from '../../motor/api.ts';
import { enterCard, fixture, runEffect } from '../../testes/artefatos.ts';

const N = 'Earthbender Ascension';

describe(N, () => {
  it('dobra um terreno existente e depois busca um básico virado, disparando aterragem', () => {
    const tg = fixture({ battlefield: [['Forest', 'Forest', 'Forest', 'Plains'], []], hand: [[N], []], library: [['Mountain', 'Island'], ['Forest']] });
    const terreno = tg.bf('Plains');
    tg.choose('terreno alvo que você controla', [terreno]).choose('Procure uma carta de terreno básico', ['Mountain']).cast(N).resolveAll();
    expect(tg.pt(terreno)).toEqual([2, 2]);
    expect(hasKw(tg.g, terreno, 'haste')).toBe(true);
    expect(chars(tg.g, terreno).subtypes).toContain('Plains');
    expect(tg.state.objects[tg.bf('Mountain')].tapped).toBe(true);
    expect(tg.state.objects[tg.bf(N)].counters.quest).toBe(1);
    expect(tg.state.turn.landsPlayed).toBe(0);
  });

  it('o terreno buscado ainda não está entre os alvos de dobrar a terra', () => {
    const tg = fixture({ battlefield: [['Forest', 'Forest', 'Forest'], []], hand: [[N], []], library: [['Mountain'], ['Forest']] });
    let escolheuTerreno = false;
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('terreno alvo que você controla')) return null;
      escolheuTerreno = true;
      expect(d.items.every((i) => i.label === 'Forest')).toBe(true);
      expect(tg.find('Mountain')).toBeNull();
      return { kind: 'select', ids: [d.items[0].id] };
    });
    tg.choose('Procure uma carta de terreno básico', ['Mountain']).cast(N).resolveAll();
    expect(escolheuTerreno).toBe(true);
    expect(chars(tg.g, tg.bf('Mountain')).types).not.toContain('Creature');
  });

  it('CR 608.2b: se o terreno alvo fica ilegal, nem dobra a terra nem busca', () => {
    const tg = fixture({ battlefield: [['Forest', 'Forest', 'Forest', 'Plains'], []], hand: [[N], []], library: [['Mountain'], ['Forest']] });
    tg.choose('terreno alvo que você controla', ['Plains']).cast(N).resolve();
    runEffect(tg, returnToHand(tg.g, [tg.bf('Plains')]));
    tg.resolveAll();
    expect(tg.find('Mountain')).toBeNull();
    expect(tg.names(0, 'library')).toEqual(['Mountain']);
    expect(tg.state.objects[tg.bf(N)].counters.quest ?? 0).toBe(0);
    expect(tg.state.delayedTriggers).toHaveLength(0);
  });

  it('pode não encontrar um básico e ainda assim dobra a terra', () => {
    const tg = fixture({ battlefield: [['Forest', 'Forest', 'Forest', 'Plains'], []], hand: [[N], []], library: [['Mountain', 'Island'], ['Forest']] });
    tg.choose('terreno alvo que você controla', ['Plains']).choose('Procure uma carta de terreno básico', []).cast(N).resolveAll();
    expect(tg.pt(tg.bf('Plains'))).toEqual([2, 2]);
    expect(tg.names(0, 'library')).toHaveLength(2);
    expect(tg.state.objects[tg.bf(N)].counters.quest ?? 0).toBe(0);
  });

  it('CR 603.12: escolhe o alvo no gatilho reflexivo e concede atropelar até o fim do turno', () => {
    const tg = fixture({ battlefield: [[{ name: N, counters: { quest: 3 } }, 'Indomitable Ancients'], []], hand: [['Forest'], []] });
    tg.choose('criatura alvo que você controla', ['Indomitable Ancients']).play('Forest');
    expect(tg.script).toHaveLength(1);
    expect(tg.state.objects[tg.bf(N)].counters.quest).toBe(3);
    tg.resolve();
    expect(tg.script).toHaveLength(0);
    expect(tg.state.objects[tg.bf(N)].counters.quest).toBe(4);
    expect(tg.pt(tg.bf('Indomitable Ancients'))).toEqual([2, 10]);
    expect(tg.state.zones.stack).toHaveLength(1);
    tg.resolveAll();
    expect(tg.pt(tg.bf('Indomitable Ancients'))).toEqual([3, 11]);
    expect(hasKw(tg.g, tg.bf('Indomitable Ancients'), 'trample')).toBe(true);
    tg.choose('criatura alvo que você controla', ['Indomitable Ancients']);
    enterCard(tg, 'Plains', 0);
    tg.resolveAll();
    expect(tg.state.objects[tg.bf(N)].counters.quest).toBe(5);
    expect(tg.pt(tg.bf('Indomitable Ancients'))).toEqual([4, 12]);
    tg.passTo('upkeep', 1);
    expect(hasKw(tg.g, tg.bf('Indomitable Ancients'), 'trample')).toBe(false);
    expect(tg.pt(tg.bf('Indomitable Ancients'))).toEqual([4, 12]);
  });

  it('antes do quarto marcador, aterragem não exige alvo nem concede o prêmio', () => {
    const tg = fixture({ battlefield: [[{ name: N, counters: { quest: 2 } }], []], hand: [['Forest'], []] });
    tg.play('Forest').resolveAll();
    expect(tg.state.objects[tg.bf(N)].counters.quest).toBe(3);
    expect(tg.state.zones.stack).toHaveLength(0);
  });

  it('CR 603.4: confere novamente os quatro marcadores ao resolver o gatilho reflexivo', () => {
    const tg = fixture({ battlefield: [[{ name: N, counters: { quest: 3 } }, 'Indomitable Ancients'], []], hand: [['Forest'], []] });
    tg.choose('criatura alvo que você controla', ['Indomitable Ancients']).play('Forest').resolve();
    removeCounters(tg.g, { kind: 'obj', id: tg.bf(N) }, 'quest', 1);
    tg.resolveAll();
    expect(tg.pt(tg.bf('Indomitable Ancients'))).toEqual([2, 10]);
    expect(hasKw(tg.g, tg.bf('Indomitable Ancients'), 'trample')).toBe(false);
  });

  it('CR 608.2h: o gatilho reflexivo usa os marcadores da última informação conhecida', () => {
    const tg = fixture({ battlefield: [[{ name: N, counters: { quest: 3 } }, 'Indomitable Ancients'], []], hand: [['Forest'], []] });
    tg.choose('criatura alvo que você controla', ['Indomitable Ancients']).play('Forest').resolve();
    runEffect(tg, returnToHand(tg.g, [tg.bf(N)]));
    tg.resolveAll();
    expect(tg.pt(tg.bf('Indomitable Ancients'))).toEqual([3, 11]);
    expect(hasKw(tg.g, tg.bf('Indomitable Ancients'), 'trample')).toBe(true);
  });

  it('sem o encantamento no campo, não coloca missão nem cria o gatilho reflexivo', () => {
    const tg = fixture({ battlefield: [[{ name: N, counters: { quest: 3 } }, 'Indomitable Ancients'], []], hand: [['Forest'], []] });
    tg.play('Forest');
    runEffect(tg, destroy(tg.g, [tg.bf(N)]));
    tg.resolveAll();
    expect(tg.pt(tg.bf('Indomitable Ancients'))).toEqual([2, 10]);
    expect(tg.state.zones.stack).toHaveLength(0);
  });
});
