import { describe, expect, it } from 'vitest';
import { chars, destroy, exile, hasKw, putOntoBattlefield, returnToHand, untap } from '../../motor/api.ts';
import { activateMana, fixture, runEffect } from '../../testes/artefatos.ts';
import { entraVirado } from '../../testes/padroes.ts';

const N = 'Ba Sing Se';

describe(N, () => {
  it('entra virado sem um terreno básico seu e desvirado com qualquer terreno básico seu', () => {
    expect(entraVirado(N)).toBe(true);
    expect(entraVirado(N, ['Breeding Pool'])).toBe(true);
    expect(entraVirado(N, [], [], true, ['Forest'])).toBe(true);
    expect(entraVirado(N, ['Island'])).toBe(false);
  });

  it('CR 614.12: um terreno básico que entra junto não permite entrar desvirado', () => {
    const tg = fixture({ hand: [[N, 'Forest'], []] });
    runEffect(tg, putOntoBattlefield(tg.g, [
      { id: tg.find(N, 'hand')!, controller: 0 },
      { id: tg.find('Forest', 'hand')!, controller: 0 },
    ], 'effect'));
    expect(tg.state.objects[tg.bf(N)].tapped).toBe(true);
  });

  it('dobra a terra 2 sem mudar a cor nem as habilidades de mana do terreno', () => {
    const tg = fixture({ battlefield: [[N, 'Forest', 'Forest', 'Forest', 'Plains'], []] });
    const terreno = tg.bf('Plains');
    tg.choose('terreno alvo que você controla', [terreno]).activate(N, 'Dobre a terra').resolveAll();
    expect(tg.pt(terreno)).toEqual([2, 2]);
    expect(chars(tg.g, terreno).types).toEqual(expect.arrayContaining(['Land', 'Creature']));
    expect(chars(tg.g, terreno).subtypes).toContain('Plains');
    expect(chars(tg.g, terreno).supertypes).toContain('Basic');
    expect(chars(tg.g, terreno).colors).toEqual([]);
    expect(hasKw(tg.g, terreno, 'haste')).toBe(true);
    activateMana(tg, 'Plains', 'W');
    expect(tg.state.players[0].manaPool.map((u) => u.type)).toContain('W');
    tg.passTo('upkeep', 1);
    expect(tg.pt(terreno)).toEqual([2, 2]);
    expect(hasKw(tg.g, terreno, 'haste')).toBe(true);
  });

  it.each(['morrer', 'exilar', 'devolver à mão'])('CR 701.66a: volta virado ao morrer ou ser exilado, mas não ao ir para a mão (%s)', (acao) => {
    const tg = fixture({ battlefield: [[N, 'Forest', 'Forest', 'Forest', 'Plains'], []] });
    const terreno = tg.bf('Plains');
    tg.choose('terreno alvo que você controla', [terreno]).activate(N, 'Dobre a terra').resolveAll();
    if (acao === 'morrer') runEffect(tg, destroy(tg.g, [terreno]));
    else if (acao === 'exilar') runEffect(tg, exile(tg.g, [terreno]));
    else runEffect(tg, returnToHand(tg.g, [terreno]));
    tg.resolveAll();
    if (acao === 'devolver à mão') {
      expect(tg.find('Plains')).toBeNull();
      expect(tg.find('Plains', 'hand', 0)).not.toBeNull();
    } else {
      const novo = tg.bf('Plains');
      expect(novo).not.toBe(terreno);
      expect(tg.state.objects[novo].tapped).toBe(true);
      expect(tg.state.objects[novo].counters['+1/+1'] ?? 0).toBe(0);
      expect(chars(tg.g, novo).types).not.toContain('Creature');
    }
  });

  it('pode dobrar novamente um terreno que já é criatura', () => {
    const tg = fixture({ battlefield: [[N, ...Array(6).fill('Forest'), 'Plains'], []] });
    const terreno = tg.bf('Plains');
    tg.choose('terreno alvo que você controla', [terreno]).activate(N, 'Dobre a terra').resolveAll();
    untap(tg.g, tg.bf(N));
    tg.refresh();
    tg.choose('terreno alvo que você controla', [terreno]).activate(N, 'Dobre a terra').resolveAll();
    expect(tg.pt(terreno)).toEqual([4, 4]);
  });

  it('CR 608.2b: o alvo ilegal impede a resolução da habilidade', () => {
    const tg = fixture({ battlefield: [[N, 'Forest', 'Forest', 'Forest', 'Plains'], []] });
    tg.choose('terreno alvo que você controla', ['Plains']).activate(N, 'Dobre a terra');
    runEffect(tg, returnToHand(tg.g, [tg.bf('Plains')]));
    tg.resolveAll();
    expect(tg.find('Plains')).toBeNull();
    expect(tg.state.delayedTriggers).toHaveLength(0);
  });

  it('gera mana verde e só permite dobrar a terra como feitiço', () => {
    const tg = fixture({ battlefield: [[N, 'Forest', 'Forest', 'Forest'], []] });
    const id = tg.bf(N);
    const podeDobrar = () => tg.actionIds().some((a) => a.startsWith(`act:${id}:`));
    expect(podeDobrar()).toBe(true);
    tg.passTo('beginCombat', 0);
    expect(podeDobrar()).toBe(false);
    tg.passTo('main1', 1).pass();
    expect(podeDobrar()).toBe(false);
    activateMana(tg, N, 'G');
    expect(tg.state.players[0].manaPool.map((u) => u.type)).toContain('G');
  });
});
