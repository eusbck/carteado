import { describe, expect, it } from 'vitest';
import { nameOf } from '../../motor/chars.ts';
import { activateMana, fixture as setup } from '../../testes/artefatos.ts';

const N = 'Sink into Stupor // Soporific Springs';
const ilhas = ['Island', 'Island', 'Island'];

describe(N, () => {
  it('devolve o permanente não terreno alvo de um oponente para a mão do dono', () => {
    const tg = setup({ battlefield: [[...ilhas, 'Elvish Mystic'], ['Indomitable Ancients', 'Forest']], hand: [[N], []] });
    let alvos: string[] = [];
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('que um oponente controla')) return null;
      alvos = d.items.filter((i) => !i.disabled).map((i) => i.label);
      return { kind: 'select', ids: [d.items.find((i) => i.label === 'Indomitable Ancients')!.id] };
    });
    tg.cast(N, 'hand').resolveAll();
    // nem o terreno dele nem os seus permanentes
    expect(alvos).toEqual(['Indomitable Ancients']);
    expect(tg.names(1, 'hand')).toEqual(['Indomitable Ancients']);
  });

  it('a mágica devolvida sai da pilha sem ser anulada, mesmo a que não pode ser anulada', () => {
    // Dragonlord Dromoka não pode ser anulada
    const dele = ['Forest', 'Forest', 'Forest', 'Forest', 'Plains', 'Plains'];
    const tg = setup({ active: 1, battlefield: [ilhas, dele], hand: [[N], ['Dragonlord Dromoka']] });
    tg.cast('Dragonlord Dromoka');
    expect(tg.state.zones.stack).toHaveLength(1);
    tg.pass();
    expect(tg.pending?.player).toBe(0);
    tg.choose('que um oponente controla', ['Dragonlord Dromoka']).cast(N, 'hand').resolve();
    expect(tg.state.zones.stack).toHaveLength(0);
    expect(tg.names(1, 'hand')).toEqual(['Dragonlord Dromoka']);
    expect(tg.find('Dragonlord Dromoka')).toBeNull();
  });

  it('CR 712.11c — conjurar ou jogar olha só a face escolhida', () => {
    const tg = setup({ battlefield: [[], []], hand: [[N], []] });
    // sem mana, a instantânea não pode ser conjurada, mas o verso pode ser jogado como terreno
    expect(tg.actionIds().some((a) => a.startsWith('cast:'))).toBe(false);
    tg.yes('3 de vida', true).play(N);
    expect(nameOf(tg.g, tg.bf(N))).toBe('Soporific Springs');
    expect(tg.life(0)).toBe(37);
    activateMana(tg, 'Soporific Springs', 'U');
    expect(tg.state.players[0].manaPool.map((u) => u.type)).toEqual(['U']);
  });
});
