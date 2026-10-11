import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { manaOptions } from '../../motor/costs.ts';
import { enterCard, fixture as setup } from '../../testes/artefatos.ts';

const N = 'Song of Freyalise';
const geraMana = (tg: ReturnType<typeof setup>, nome: string) => manaOptions(tg.g, 0).some((o) => o.obj === tg.bf(nome));

describe(N, () => {
  it('capítulos I e II: as criaturas que você controla ganham "{T}: uma mana de qualquer cor" até o seu próximo turno', () => {
    const tg = setup({ battlefield: [['Forest', 'Forest', 'Indomitable Ancients'], []], hand: [[N], []] });
    expect(geraMana(tg, 'Indomitable Ancients')).toBe(false);
    tg.cast(N).resolveAll();
    expect(tg.state.objects[tg.bf(N)].counters.lore).toBe(1);
    expect(geraMana(tg, 'Indomitable Ancients')).toBe(true);
    // a criatura que chega depois não ganha a habilidade
    enterCard(tg, 'Fatespinner', 0);
    expect(geraMana(tg, 'Fatespinner')).toBe(false);
    // no seu próximo turno o efeito do capítulo I acaba e o II dá de novo, agora às duas
    tg.passTo('upkeep', 1).passTo('main1', 0);
    tg.resolveAll();
    expect(tg.state.objects[tg.bf(N)].counters.lore).toBe(2);
    expect(geraMana(tg, 'Fatespinner')).toBe(true);
  });

  it('capítulo III: um marcador +1/+1 em cada criatura sua, com vigilância, atropelar e indestrutível; depois a Saga é sacrificada', () => {
    const tg = setup({ battlefield: [[{ name: N, counters: { lore: 2 } }, 'Indomitable Ancients'], ['Silver Myr']] });
    tg.passTo('upkeep', 1).passTo('main1', 0);
    tg.resolveAll();
    const a = tg.bf('Indomitable Ancients');
    expect(tg.pt(a)).toEqual([3, 11]);
    for (const kw of ['vigilance', 'trample', 'indestructible']) expect(hasKw(tg.g, a, kw)).toBe(true);
    expect(tg.pt(tg.bf('Silver Myr'))).toEqual([1, 1]);
    expect(tg.find(N)).toBeNull();
    expect(tg.names(0, 'graveyard')).toEqual([N]);
  });
});