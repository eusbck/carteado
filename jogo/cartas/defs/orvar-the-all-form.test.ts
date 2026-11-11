import { describe, expect, it } from 'vitest';
import { chars, destroy, discard } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Orvar, the All-Form';
const tokensDe = (tg: ReturnType<typeof setup>, nome: string) => tg.state.zones.battlefield.filter((id) => tg.state.objects[id].isToken && tg.state.objects[id].copyOf?.def === nome);

describe(N, () => {
  it('polimorfo: é de todos os tipos de criatura', () => {
    const tg = setup({ battlefield: [[N], []] });
    expect(chars(tg.g, tg.bf(N)).subtypes).toEqual(expect.arrayContaining(['Merfolk', 'Faerie', 'Wizard', 'Shapeshifter']));
  });
  it('o gatilho resolve antes da mágica que o disparou: cria uma ficha cópia do permanente seu que a mágica mira', () => {
    const tg = setup({ battlefield: [[N, 'Sol Ring', 'Island', 'Island', 'Island'], []], hand: [['Twitch'], []], library: [['Opt'], []] });
    tg.choose('artefato, criatura ou terreno alvo', ['Sol Ring']).cast('Twitch');
    expect(tg.state.zones.stack).toHaveLength(2);
    tg.resolve();
    expect(tokensDe(tg, 'Sol Ring')).toHaveLength(1);
    expect(tg.find('Twitch', 'stack')).not.toBeNull();
    tg.resolveAll();
  });
  it('com dois permanentes seus como alvo, você escolhe qual a ficha copia; os de outros jogadores não servem', () => {
    const tg = setup({ battlefield: [[N, 'Spellseeker', ...Array(5).fill('Island')], ['Elvish Mystic']], hand: [['Step Through'], []] });
    let opcoes: string[] = [];
    tg.choose('duas criaturas alvo', ['Spellseeker', 'Elvish Mystic']);
    tg.cast('Step Through');
    // só o Spellseeker é seu: sem escolha
    tg.resolve();
    expect(tokensDe(tg, 'Spellseeker')).toHaveLength(1);
    expect(tokensDe(tg, 'Elvish Mystic')).toHaveLength(0);
    const tg2 = setup({ battlefield: [[N, 'Spellseeker', 'Gilded Drake', ...Array(5).fill('Island')], []], hand: [['Step Through'], []] });
    tg2.choose('duas criaturas alvo', ['Spellseeker', 'Gilded Drake']);
    tg2.script.push((d) => { if (d.kind === 'select' && d.prompt.includes('Orvar: escolha')) { opcoes = d.items.map((i) => i.label).sort(); return { kind: 'select', ids: [d.items.find((i) => i.label === 'Gilded Drake')!.id] }; } return null; });
    tg2.cast('Step Through').resolve();
    expect(opcoes).toEqual(['Gilded Drake', 'Spellseeker']);
    expect(tokensDe(tg2, 'Gilded Drake')).toHaveLength(1);
  });
  it('mágica que só mira Orvar ou permanentes de outros não dispara', () => {
    const tg = setup({ battlefield: [[N, 'Island', 'Island', 'Island'], ['Sol Ring']], hand: [['Twitch', 'Twitch'], []], library: [['Opt', 'Opt'], []] });
    tg.choose('artefato, criatura ou terreno alvo', ['Sol Ring']).cast('Twitch');
    expect(tg.state.zones.stack).toHaveLength(1);
  });
  it('se o permanente alvo saiu do campo antes de resolver, não cria a ficha', () => {
    const tg = setup({ battlefield: [[N, 'Sol Ring', 'Island', 'Island', 'Island'], []], hand: [['Twitch'], []], library: [['Opt'], []] });
    tg.choose('artefato, criatura ou terreno alvo', ['Sol Ring']).cast('Twitch');
    tg.run(destroy(tg.g, [tg.bf('Sol Ring')]));
    tg.resolveAll();
    expect(tokensDe(tg, 'Sol Ring')).toHaveLength(0);
  });
  it('descartado por uma mágica de oponente, cria a cópia de qualquer permanente alvo; descartado por você, não', () => {
    // a Ana descarta Orvar pelo Cephalid Coliseum do Bruno (habilidade de oponente)
    const tg = setup({ active: 1, battlefield: [[], [{ name: 'Cephalid Coliseum' }, 'Island', 'Sol Ring']], hand: [[N], []], graveyard: [[], Array(7).fill('Forest')], library: [['Opt', 'Ponder', 'Brainstorm'], []] });
    tg.choose('jogador alvo', ['Ana']).choose('Descarte', [N, 'Opt', 'Ponder']).choose('permanente alvo para a ficha copiar', ['Sol Ring']);
    tg.activate('Cephalid Coliseum', 'Limiar').resolveAll();
    expect(tokensDe(tg, 'Sol Ring')).toHaveLength(1);
    expect(tg.state.objects[tokensDe(tg, 'Sol Ring')[0]].controller).toBe(0);
    const tg2 = setup({ battlefield: [[], []], hand: [[N], []] });
    tg2.run(discard(tg2.g, 0, 1));
    expect(tg2.state.zones.stack).toHaveLength(0);
  });
});
