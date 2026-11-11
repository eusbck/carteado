import { describe, expect, it } from 'vitest';
import { enterCard, fixture as setup, removeCard } from '../../testes/artefatos.ts';

const N = 'Kíli the Resourceful';

describe(N, () => {
  it('CR 702.195a — com três artefatos, lendárias e/ou Sagas, você ganha a história duradoura sem pilha', () => {
    const tg = setup({ battlefield: [[N, 'Sol Ring'], []] });
    expect(tg.state.players[0].enduringStory).toBeFalsy();
    enterCard(tg, 'Sol Ring', 0);
    expect(tg.state.zones.stack.length).toBe(0);
    expect(tg.state.players[0].enduringStory).toBe(true);
  });

  it('uma lendária que também é artefato conta uma vez só', () => {
    const tg = setup({ battlefield: [[N, 'Blackblade Reforged'], []] });
    expect(tg.state.players[0].enduringStory).toBeFalsy();
  });

  it('CR 702.195b — a história duradoura fica pelo resto da partida, mesmo sem Kíli e sem as permanentes', () => {
    const tg = setup({ battlefield: [[N, 'Sol Ring', 'Mind Stone'], []] });
    expect(tg.state.players[0].enduringStory).toBe(true);
    for (const n of [N, 'Sol Ring', 'Mind Stone']) removeCard(tg, tg.bf(n));
    tg.refresh();
    expect(tg.state.players[0].enduringStory).toBe(true);
  });

  it('com a história duradoura, o primeiro equipar do turno pode custar {0}', () => {
    const tg = setup({ battlefield: [[N, 'Sol Ring', 'Loxodon Warhammer', 'Silver Myr'], []] });
    tg.yes('pagar {0}', true).choose('criatura alvo', ['Silver Myr']).activate('Loxodon Warhammer', 'Equipar').resolveAll();
    expect(tg.state.objects[tg.bf('Loxodon Warhammer')].attachedTo).toBe(tg.bf('Silver Myr'));
    expect(tg.state.objects[tg.bf('Sol Ring')].tapped).toBe(false);
  });

  it('sem a história duradoura, o equipar paga o custo', () => {
    const tg = setup({ battlefield: [[N, 'Loxodon Warhammer', 'Llanowar Elves'], []] });
    expect(tg.state.players[0].enduringStory).toBeFalsy();
    expect(tg.pending?.kind === 'priority' && tg.pending.actions.some((a) => a.label.startsWith('Loxodon Warhammer: Equipar'))).toBe(false);
  });

  it('quando outro Dwarf ou Equipamento seu entra, compra uma carta, uma vez por turno', () => {
    const tg = setup({ battlefield: [[N], []] });
    enterCard(tg, 'Lightning Greaves', 0);
    tg.resolveAll();
    expect(tg.names(0, 'hand').length).toBe(1);
    enterCard(tg, 'Bruenor Battlehammer', 0);
    tg.resolveAll();
    expect(tg.names(0, 'hand').length).toBe(1);
    tg.passTo('upkeep', 1);
    enterCard(tg, 'Swiftfoot Boots', 0);
    tg.resolveAll();
    expect(tg.names(0, 'hand').length).toBe(2);
  });
});
