// Formatos de carta com mais de um conjunto de características (motor/formatos.ts): modal de duas faces (CR 712),
// dividida com fusão e aftermath (CR 709, 702.102, 702.127) e aventura (CR 715). As regras gerais que as cartas citam
// nos rulings ficam aqui; cada carta tem também o próprio teste em cartas/defs.
import { describe, expect, it } from 'vitest';
import '../cartas/index.ts';
import { allowPlay, putOntoBattlefield } from '../motor/api.ts';
import { chars, nameOf } from '../motor/chars.ts';
import { fixture as setup } from './artefatos.ts';

const FELL = 'Fell the Profane // Fell Mire'; // instantânea {2}{B}{B} // terreno
const WITCH = 'Witch Enchanter // Witch-Blessed Meadow'; // criatura {3}{W} // terreno
const acoes = (tg: ReturnType<typeof setup>, prefixo: string) => tg.actionIds().filter((a) => a.startsWith(prefixo));

describe('modal de duas faces (CR 712)', () => {
  it('CR 712.8a, 712.8f — fora da pilha e do campo valem as características da frente; no campo, as da face para cima', () => {
    const tg = setup({ battlefield: [[], []], hand: [[FELL], []] });
    const naMao = tg.find(FELL, 'hand', 0)!;
    expect(nameOf(tg.g, naMao)).toBe('Fell the Profane');
    expect(chars(tg.g, naMao).types).toEqual(['Instant']);
    expect(chars(tg.g, naMao).manaValue).toBe(4);
    tg.yes('3 de vida', false).play(FELL);
    const noCampo = tg.bf(FELL);
    expect(nameOf(tg.g, noCampo)).toBe('Fell Mire');
    expect(chars(tg.g, noCampo).types).toEqual(['Land']);
    expect(chars(tg.g, noCampo).manaValue).toBe(0);
  });

  it('CR 712.11b, 712.12 — da mão: a face de mágica se conjura e a de terreno se joga, cada uma no seu tempo', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Swamp', 'Swamp'], ['Indomitable Ancients']], hand: [[FELL], []] });
    expect(acoes(tg, 'cast:')).toHaveLength(1);
    expect(acoes(tg, 'play:')).toHaveLength(1);
    expect(acoes(tg, 'play:')[0].endsWith('@1')).toBe(true);
  });

  it('CR 712.12 — permissão de jogar oferece as duas faces; de conjurar, só a de mágica', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Swamp', 'Swamp'], ['Indomitable Ancients']], exile: [[FELL], []] });
    const carta = tg.find(FELL, 'exile')!;
    allowPlay(tg.g, 0, tg.bf('Swamp'), [carta], { kind: 'endOfTurn' });
    tg.refresh();
    expect(acoes(tg, 'cast:')).toHaveLength(1);
    expect(acoes(tg, 'play:')).toHaveLength(1);

    const so = setup({ battlefield: [['Swamp', 'Swamp', 'Swamp', 'Swamp'], ['Indomitable Ancients']], exile: [[FELL], []] });
    allowPlay(so.g, 0, so.bf('Swamp'), [so.find(FELL, 'exile')!], { kind: 'endOfTurn' }, { spellsOnly: true });
    so.refresh();
    expect(acoes(so, 'cast:')).toHaveLength(1);
    expect(acoes(so, 'play:')).toHaveLength(0);
  });

  it('CR 712.12 — a face que se encaixa no efeito: a jogada por permissão entra com a face de terreno', () => {
    const tg = setup({ battlefield: [[], []], exile: [[FELL], []], hand: [['Swamp'], []] });
    allowPlay(tg.g, 0, tg.find('Swamp', 'hand', 0)!, [tg.find(FELL, 'exile')!], { kind: 'endOfTurn' });
    tg.refresh();
    tg.yes('3 de vida', false).play(FELL);
    expect(nameOf(tg.g, tg.bf(FELL))).toBe('Fell Mire');
  });

  it('CR 712.14 — posta no campo por efeito, entra com a frente; a frente sendo instantânea ou feitiço, fica onde está', () => {
    const tg = setup({ battlefield: [[], ['Sol Ring']], graveyard: [[FELL, WITCH], []] });
    const fell = tg.find(FELL, 'graveyard', 0)!;
    const witch = tg.find(WITCH, 'graveyard', 0)!;
    tg.choose('artefato ou encantamento alvo', ['Sol Ring']);
    tg.run(putOntoBattlefield(tg.g, [{ id: fell, controller: 0 }, { id: witch, controller: 0 }], 'effect'));
    tg.resolveAll();
    // a instantânea não entra no campo (CR 304.4, 712.14a)
    expect(tg.find(FELL)).toBeNull();
    expect(tg.find(FELL, 'graveyard', 0)).not.toBeNull();
    // a criatura entra com a frente, e a habilidade de entrar dela dispara
    const id = tg.bf(WITCH);
    expect(nameOf(tg.g, id)).toBe('Witch Enchanter');
    expect(chars(tg.g, id).types).toEqual(['Creature']);
    expect(tg.find('Sol Ring')).toBeNull();
  });

  it('CR 712.3, 712.9 — a carta modal não se transforma: no campo continua com a face com que entrou', () => {
    const tg = setup({ battlefield: [[], []], hand: [[FELL], []] });
    tg.yes('3 de vida', false).play(FELL);
    tg.passTo('main1', 1);
    tg.passTo('main1', 0);
    expect(nameOf(tg.g, tg.bf(FELL))).toBe('Fell Mire');
    expect(tg.actionIds().some((a) => a.startsWith('transform:'))).toBe(false);
  });
});

describe('dividida (CR 709) e aventura (CR 715)', () => {
  const SPLIT = 'Double Jump // Flying Kick'; // {1}{U} // {1}{R}, com fusão
  const VIRTUE = 'Virtue of Persistence // Locthwain Scorn'; // {5}{B}{B} // aventura {1}{B}
  const chaves = (tg: ReturnType<typeof setup>) => acoes(tg, 'cast:').map((a) => a.split(':').slice(2).join(':')).sort();

  it('CR 709.3a — só a metade conjurada conta para ver se pode ser conjurada', () => {
    // só mana azul: Double Jump pode, Flying Kick ({1}{R}) e a fusão não
    const tg = setup({ battlefield: [['Island', 'Island', 'Elvish Mystic'], ['Wall of Omens']], hand: [[SPLIT], []] });
    expect(chaves(tg)).toEqual(['hand']);
  });

  it('CR 715.3a — só as características da aventura contam para conjurá-la', () => {
    // a aventura é um feitiço de {1}{B}: com dois Swamps dá; a carta de {5}{B}{B} não
    const tg = setup({ battlefield: [['Swamp', 'Swamp'], ['Elvish Mystic']], hand: [[VIRTUE], []] });
    expect(chaves(tg)).toEqual(['hand@1']);
    // sem criatura para ser alvo, a aventura não pode ser conjurada
    const semAlvo = setup({ battlefield: [['Swamp', 'Swamp'], []], hand: [[VIRTUE], []] });
    expect(chaves(semAlvo)).toEqual([]);
  });

  it('CR 715.3 — conjurar como aventura não é custo alternativo: permissões e "sem pagar" valem para ela', () => {
    const tg = setup({ battlefield: [['Swamp'], ['Elvish Mystic']], exile: [[VIRTUE], []] });
    allowPlay(tg.g, 0, tg.bf('Swamp'), [tg.find(VIRTUE, 'exile')!], { kind: 'endOfTurn' }, { free: true });
    tg.refresh();
    const ks = chaves(tg);
    expect(ks).toHaveLength(2);
    expect(ks.filter((k) => k.endsWith('@1'))).toHaveLength(1);
    tg.choose('criatura alvo', ['Elvish Mystic']).cast(VIRTUE, ks.find((k) => k.endsWith('@1'))!).resolveAll();
    expect(tg.find('Elvish Mystic')).toBeNull();
    expect(tg.state.objects[tg.bf('Swamp')].tapped).toBe(false);
  });
});
