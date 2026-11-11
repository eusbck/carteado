import { describe, expect, it } from 'vitest';
import { enterCard, fixture as setup } from '../../testes/artefatos.ts';

const N = 'Elena, Turk Recruit';
const marcadores = (tg: ReturnType<typeof setup>) => tg.state.objects[tg.bf(N)].counters['+1/+1'] ?? 0;

describe(N, () => {
  it('ao entrar, devolve uma carta histórica que não é Assassin do seu cemitério para a mão', () => {
    const tg = setup({
      battlefield: [['Plains', 'Plains', 'Plains'], []], hand: [[N], []],
      graveyard: [['Sol Ring', 'Shadow, Mysterious Assassin', 'Island'], ['Silver Myr']],
    });
    let oferecidas: string[] = [];
    tg.script.push((d) => {
      if (!d.prompt.includes('histórica') || !('items' in d)) return null;
      oferecidas = (d as { items: { label: string }[] }).items.map((i) => i.label);
      return null;
    });
    tg.choose('histórica', ['Sol Ring']).cast(N).resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Sol Ring']);
    expect(tg.names(0, 'graveyard').sort()).toEqual(['Island', 'Shadow, Mysterious Assassin']);
    expect(oferecidas.some((l) => l.includes('Sol Ring'))).toBe(true);
    expect(oferecidas.some((l) => l.includes('Shadow'))).toBe(false);
    expect(oferecidas.some((l) => l.includes('Silver Myr'))).toBe(false);
  });

  it('sem carta histórica que não seja Assassin no seu cemitério, o gatilho de entrar não faz nada', () => {
    const tg = setup({
      battlefield: [['Plains', 'Plains', 'Plains'], []], hand: [[N], []],
      graveyard: [['Shadow, Mysterious Assassin', 'Island'], ['Silver Myr']],
    });
    tg.cast(N).resolveAll();
    expect(tg.bf(N)).not.toBeNull();
    expect(tg.names(0, 'hand')).toEqual([]);
    expect(tg.names(1, 'graveyard')).toEqual(['Silver Myr']);
  });

  it('conjurar um artefato ou uma mágica lendária põe um marcador; uma mágica comum, não', () => {
    const tg = setup({
      battlefield: [[N, 'Swamp', 'Swamp', 'Swamp', 'Forest'], []],
      hand: [['Sol Ring', 'Elvish Mystic', 'Shadow, Mysterious Assassin'], []],
    });
    tg.cast('Sol Ring').resolveAll();
    expect(marcadores(tg)).toBe(1);
    tg.cast('Elvish Mystic').resolveAll();
    expect(marcadores(tg)).toBe(1);
    tg.cast('Shadow, Mysterious Assassin').resolveAll();
    expect(marcadores(tg)).toBe(2);
    expect(tg.pt(tg.bf(N))).toEqual([3, 6]);
  });

  it('o gatilho de conjurar uma mágica histórica resolve antes dela e mesmo que ela seja anulada', () => {
    const tg = setup({ battlefield: [[N, 'Swamp'], ['Island', 'Island']], hand: [['Sol Ring'], ['Counterspell']] });
    tg.cast('Sol Ring');
    const pilha = tg.state.zones.stack;
    expect(tg.state.objects[pilha[pilha.length - 1]].stack?.kind).toBe('triggered');
    tg.pass();
    tg.choose('mágica alvo', ['Sol Ring']).cast('Counterspell').resolveAll();
    expect(tg.find('Sol Ring', 'graveyard')).not.toBeNull();
    expect(marcadores(tg)).toBe(1);
  });

  it('jogar um terreno lendário não dispara', () => {
    const tg = setup({ battlefield: [[N], []], hand: [['Urborg, Tomb of Yawgmoth'], []] });
    tg.play('Urborg, Tomb of Yawgmoth').resolveAll();
    expect(tg.bf('Urborg, Tomb of Yawgmoth')).not.toBeNull();
    expect(marcadores(tg)).toBe(0);
  });

  it('uma carta histórica posta no campo sem ser conjurada não dispara', () => {
    const tg = setup({ battlefield: [[N], []] });
    enterCard(tg, 'Sol Ring', 0);
    tg.resolveAll();
    expect(marcadores(tg)).toBe(0);
  });
});
