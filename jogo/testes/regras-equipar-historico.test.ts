// lote3-a (deck Cloud): recursos novos do motor. Equipar por {0} (gancho equipForZero) e equipar no tempo de
// instantânea (equipAsInstant), em motor/equipar.ts e motor/stack.ts; segundo dividido (CR 702.61); aventura cuja carta
// é um terreno (CR 715.3d, 305.9; motor/formatos.ts e priority.ts); histórico e história duradoura (CR 702.195,
// motor/historia.ts); redução de custo de habilidade que olha os alvos (abilityCostModifier com alvos); equipar com o
// Equipamento fora de fase (CR 702.26b).
import { describe, expect, it } from 'vitest';
import { mayCastFree } from '../motor/mecanicas.ts';
import { fixture as setup, runEffect } from './artefatos.ts';

const acoes = (tg: ReturnType<typeof setup>) => (tg.pending?.kind === 'priority' ? tg.pending.actions : []);

describe('equipar (CR 702.6) com custo {0} e no tempo de instantânea', () => {
  it('CR 602.2b, 118.9 — "pagar {0} em vez do custo de equipar" vale só na primeira ativação de equipar do turno', () => {
    const tg = setup({ battlefield: [['Bruenor Battlehammer', 'Silver Myr', 'Llanowar Elves', 'Loxodon Warhammer', 'Shadowspear', 'Plains', 'Plains'], []] });
    // sem o {0}, o martelo ({3}) não caberia nas duas Plains
    tg.yes('pagar {0}', true).choose('criatura alvo', ['Silver Myr']).activate('Loxodon Warhammer', 'Equipar').resolveAll();
    expect(tg.all('Plains').every((p) => !tg.state.objects[p].tapped)).toBe(true);
    expect(tg.state.turnStats[0].equipActivated).toBe(1);
    // a segunda ativação paga o custo ({2} da Shadowspear)
    let perguntou = false;
    tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('pagar {0}') ? ((perguntou = true), { kind: 'select', ids: ['yes'] }) : null));
    tg.choose('criatura alvo', ['Llanowar Elves']).activate('Shadowspear', 'Equipar').resolveAll();
    expect(perguntou).toBe(false);
    expect(tg.all('Plains').every((p) => tg.state.objects[p].tapped)).toBe(true);
  });

  it('CR 602.2b — recusando o {0}, paga o custo normal e o primeiro equipar do turno já foi usado', () => {
    const tg = setup({ battlefield: [['Bruenor Battlehammer', 'Silver Myr', 'Lightning Greaves', 'Loxodon Warhammer'], []] });
    tg.yes('pagar {0}', false).choose('criatura alvo', ['Silver Myr']).activate('Lightning Greaves', 'Equipar').resolveAll();
    expect(tg.state.objects[tg.bf('Lightning Greaves')].attachedTo).toBe(tg.bf('Silver Myr'));
    expect(acoes(tg).some((a) => a.label.startsWith('Loxodon Warhammer: Equipar'))).toBe(false);
  });

  it('CR 702.6a — equipar é só como feitiço, a menos que um efeito permita no tempo de instantânea (Forge Anew)', () => {
    const sem = setup({ battlefield: [['Silver Myr', 'Lightning Greaves'], []], step: 'beginCombat' });
    expect(acoes(sem).some((a) => a.label.startsWith('Lightning Greaves: Equipar'))).toBe(false);
    const com = setup({ battlefield: [['Forge Anew', 'Silver Myr', 'Lightning Greaves'], []], step: 'beginCombat' });
    expect(acoes(com).some((a) => a.label.startsWith('Lightning Greaves: Equipar'))).toBe(true);
  });

  it('CR 702.26b — o Equipamento fora de fase é tratado como se não existisse: o equipar que resolve não o move', () => {
    const tg = setup({ battlefield: [['Silver Myr', 'Llanowar Elves', 'Lightning Greaves'], []] });
    tg.choose('criatura alvo', ['Llanowar Elves']).activate('Lightning Greaves', 'Equipar');
    tg.state.objects[tg.bf('Lightning Greaves')].phasedOut = true;
    tg.refresh();
    tg.resolveAll();
    expect(tg.state.objects[tg.bf('Lightning Greaves')].attachedTo).toBeNull();
  });
});

describe('segundo dividido (CR 702.61)', () => {
  it('CR 702.61a-b — com a mágica na pilha, ninguém conjura nem ativa habilidades que não são de mana; mana continua', () => {
    const tg = setup({ battlefield: [['Mountain', 'Plains', 'Silver Myr', 'Lightning Greaves'], ['Mountain']], hand: [['Inventory Management'], ['Lightning Bolt']] });
    tg.cast('Inventory Management');
    expect(acoes(tg).some((a) => a.kind === 'cast' || a.kind === 'activate')).toBe(false);
    tg.pass();
    expect(tg.pending?.player).toBe(1);
    expect(acoes(tg).some((a) => a.kind === 'cast')).toBe(false);
    expect(acoes(tg).some((a) => a.kind === 'mana')).toBe(true);
  });

  it('CR 702.61a — nem um efeito que conjura durante a resolução consegue conjurar com ela na pilha', () => {
    const tg = setup({ battlefield: [['Mountain', 'Plains'], []], hand: [['Inventory Management', 'Lightning Bolt'], []] });
    tg.cast('Inventory Management');
    const raio = tg.find('Lightning Bolt', 'hand', 0)!;
    tg.yes('Conjurar', true);
    expect(runEffect(tg, mayCastFree(tg.g, 0, raio))).toBe(false);
    expect(tg.find('Lightning Bolt', 'hand', 0)).toBe(raio);
  });

  it('CR 702.61a — o feitiço com segundo dividido pode ser conjurado com outras mágicas na pilha; depois que sai, tudo volta', () => {
    const tg = setup({ battlefield: [['Mountain', 'Plains', 'Mountain', 'Mountain', 'Silver Myr'], []], hand: [['Lightning Bolt', 'Inventory Management', 'Lightning Bolt'], []] });
    tg.choose('alvo', ['Bruno']).cast('Lightning Bolt');
    expect(tg.canCast('Inventory Management')).toBe(true);
    tg.cast('Inventory Management');
    expect(tg.state.zones.stack.length).toBe(2);
    expect(tg.canCast('Lightning Bolt')).toBe(false);
    tg.resolve();
    // o primeiro raio continua na pilha e o segundo já pode ser conjurado em resposta
    expect(tg.state.zones.stack.length).toBe(1);
    expect(tg.canCast('Lightning Bolt')).toBe(true);
  });
});

describe('aventura cuja carta é um terreno (CR 715.3d, 305.9)', () => {
  const ISH = 'Ishgard, the Holy See // Faith & Grief';
  it('CR 305.9 — da mão, a face de terreno não é conjurada; a aventura é; do exílio, o terreno é jogado, não conjurado', () => {
    const tg = setup({ battlefield: [Array(5).fill('Plains'), []], hand: [[ISH], []] });
    const ids = () => tg.actionIds().filter((a) => tg.state.objects[Number(a.split(':')[1])]?.def === ISH);
    expect(ids().filter((a) => a.startsWith('cast:')).map((a) => a.split(':')[2])).toEqual(['hand@1']);
    expect(ids().filter((a) => a.startsWith('play:'))).toHaveLength(1);
    tg.cast(ISH, 'hand@1').resolveAll();
    expect(ids().filter((a) => a.startsWith('cast:'))).toEqual([]);
    expect(ids().filter((a) => a.startsWith('play:')).map((a) => a.split(':')[2])).toEqual(['adventure']);
  });
});

describe('histórico (CR 702.195)', () => {
  it('CR 702.195a-b — três artefatos, Sagas e/ou lendárias dão a história duradoura a quem controla a permanente com histórico', () => {
    const tg = setup({ battlefield: [['Kíli the Resourceful', 'Sol Ring', 'Mind Stone'], ['Sol Ring', 'Mind Stone', 'Blackblade Reforged']] });
    expect(tg.state.players[0].enduringStory).toBe(true);
    expect(tg.state.players[1].enduringStory).toBeFalsy();
  });
});

describe('redução de custo de habilidade que olha os alvos (abilityCostModifier)', () => {
  it('Professor Hojo: a ativação com uma criatura sua como alvo fica mais barata e é contada no turno', () => {
    const tg = setup({ battlefield: [['Professor Hojo', 'Plains', 'Silver Myr', 'Loxodon Warhammer'], ['Wall of Omens']] });
    expect(acoes(tg).some((a) => a.label.startsWith('Loxodon Warhammer: Equipar'))).toBe(true);
    tg.choose('criatura alvo', ['Silver Myr']).activate('Loxodon Warhammer', 'Equipar').resolveAll();
    expect(tg.state.turnStats[0].activatedTargetingOwnCreature).toBe(1);
  });
});
