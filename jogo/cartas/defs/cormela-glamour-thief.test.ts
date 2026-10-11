import { describe, expect, it } from 'vitest';
import { destroy } from '../../motor/api.ts';
import { hasKw } from '../../motor/chars.ts';
import { activateMana, fixture as setup } from '../../testes/artefatos.ts';

const N = 'Cormela, Glamour Thief';

describe(N, () => {
  it('ímpeto; {1}, {T}: adiciona {U}{B}{R}, que só paga mágicas instantâneas e feitiços', () => {
    const tg = setup({ battlefield: [[{ name: N, ready: false }, 'Island'], []], hand: [['Maestros Charm', 'Sol Ring'], []] });
    expect(hasKw(tg.g, tg.bf(N), 'haste')).toBe(true);
    expect(tg.pt(tg.bf(N))).toEqual([2, 4]);
    // com uma Island e Cormela: Maestros Charm ({U}{B}{R}) pode; Sol Ring ({1}) só sairia com a Island, que paga o {1} de Cormela
    expect(tg.canCast('Maestros Charm')).toBe(true);
    activateMana(tg, 'Island', 'U');
    activateMana(tg, N, 'U');
    expect(tg.state.players[0].manaPool.map((u) => u.type).sort().join('')).toBe('BRU');
    expect(tg.state.objects[tg.bf('Island')].tapped).toBe(true);
    // a mana restrita não paga o artefato
    expect(tg.canCast('Sol Ring')).toBe(false);
    tg.choose('modo', ['Cada oponente perde 3 de vida e você ganha 3 de vida']).cast('Maestros Charm').resolveAll();
    expect(tg.life(1)).toBe(37);
  });

  it('quando morre, devolve até uma instantânea ou feitiço do seu cemitério para a mão', () => {
    const tg = setup({ battlefield: [[N], []], graveyard: [['Maestros Charm', 'Elvish Mystic'], ['Maestros Charm']] });
    let alvos = 0;
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('instantânea ou feitiço alvo')) return null;
      alvos = d.items.filter((i) => !i.disabled).length;
      return { kind: 'select', ids: [d.items.find((i) => !i.disabled)!.id] };
    });
    tg.run(destroy(tg.g, [tg.bf(N)]));
    tg.resolveAll();
    // só a sua instantânea; nem a criatura nem a carta do oponente
    expect(alvos).toBe(1);
    expect(tg.names(0, 'hand')).toEqual(['Maestros Charm']);
  });

  it('pode não escolher nenhuma carta', () => {
    const tg = setup({ battlefield: [[N], []], graveyard: [['Maestros Charm'], []] });
    tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('instantânea ou feitiço alvo') ? { kind: 'select', ids: [] } : null));
    tg.run(destroy(tg.g, [tg.bf(N)]));
    tg.resolveAll();
    expect(tg.names(0, 'hand')).toEqual([]);
  });
});
