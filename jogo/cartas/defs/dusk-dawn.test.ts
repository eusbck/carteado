import { describe, expect, it } from 'vitest';
import { allowPlay, counter } from '../../motor/api.ts';
import { chars } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Dusk // Dawn';
const planicies = (n: number) => Array(n).fill('Plains');
const chaves = (tg: ReturnType<typeof setup>) => tg.actionIds().filter((a) => a.startsWith('cast:')).map((a) => a.split(':').slice(2).join(':')).sort();

describe(N, () => {
  it('Dusk destrói todas as criaturas com força 3 ou mais', () => {
    const tg = setup({ battlefield: [[...planicies(4), 'Lathliss, Dragon Queen', 'Elvish Mystic'], ['Goldspan Dragon', 'Indomitable Ancients']], hand: [[N], []] });
    tg.cast(N, 'hand').resolveAll();
    expect(tg.find('Lathliss, Dragon Queen')).toBeNull();
    expect(tg.find('Goldspan Dragon')).toBeNull();
    expect(tg.find('Elvish Mystic')).not.toBeNull();
    expect(tg.find('Indomitable Ancients')).not.toBeNull();
  });

  it('CR 709.3b — na pilha só existe a metade conjurada', () => {
    const tg = setup({ battlefield: [planicies(4), []], hand: [[N], []] });
    tg.cast(N, 'hand');
    const magica = tg.state.zones.stack[0];
    expect(chars(tg.g, magica).name).toBe('Dusk');
    expect(chars(tg.g, magica).manaValue).toBe(4);
  });

  it('CR 709.2 — a carta dividida é uma carta só e conta uma vez', () => {
    const tg = setup({ battlefield: [[], []], hand: [[N, 'Plains'], []] });
    expect(tg.state.zones.hand[0]).toHaveLength(2);
    expect(tg.names(0, 'hand')).toHaveLength(2);
  });

  it('CR 709.4 — fora da pilha tem as duas metades: feitiço de valor de mana 9', () => {
    const tg = setup({ battlefield: [[], []], hand: [[N], []] });
    const id = tg.find(N, 'hand', 0)!;
    expect(chars(tg.g, id).manaValue).toBe(9);
    expect(chars(tg.g, id).types).toEqual(['Sorcery']);
  });

  it('CR 702.127a — Dawn não se conjura da mão nem com permissão de outra zona', () => {
    const tg = setup({ battlefield: [planicies(5), []], hand: [[N], []] });
    expect(chaves(tg)).toEqual(['hand']);
    const ex = setup({ battlefield: [planicies(5), []], exile: [[N], []] });
    allowPlay(ex.g, 0, ex.bf('Plains'), [ex.find(N, 'exile')!], { kind: 'endOfTurn' });
    ex.refresh();
    expect(chaves(ex).every((k) => !k.endsWith('@1'))).toBe(true);
    expect(chaves(ex)).toHaveLength(1);
  });

  it('depois de Dusk resolver no seu turno, Dawn já pode ser conjurada do cemitério', () => {
    const tg = setup({ battlefield: [[...planicies(9), 'Lathliss, Dragon Queen', 'Elvish Mystic'], []], hand: [[N], []], graveyard: [['Silver Myr', 'Goldspan Dragon'], []] });
    tg.cast(N, 'hand').resolveAll();
    expect(tg.find(N, 'graveyard', 0)).not.toBeNull();
    expect(chaves(tg)).toEqual(['aftermath']);
    tg.cast(N, 'aftermath').resolveAll();
    // criaturas com força 2 ou menos voltam para a mão; as outras ficam no cemitério
    expect(tg.names(0, 'hand')).toEqual(['Silver Myr']);
    expect(tg.names(0, 'graveyard').sort()).toEqual(['Goldspan Dragon', 'Lathliss, Dragon Queen']);
    // CR 702.127a: conjurada do cemitério, é exilada ao sair da pilha
    expect(tg.find(N, 'exile')).not.toBeNull();
  });

  it('CR 702.127a — Dawn anulada também vai para o exílio', () => {
    const tg = setup({ battlefield: [planicies(5), []], graveyard: [[N], []] });
    tg.cast(N, 'aftermath');
    tg.run(counter(tg.g, tg.state.zones.stack[0]));
    tg.settle();
    expect(tg.find(N, 'exile')).not.toBeNull();
    expect(tg.find(N, 'graveyard', 0)).toBeNull();
  });

  it('permissão de conjurar do cemitério oferece as duas metades; Dawn assim também é exilada', () => {
    const tg = setup({ battlefield: [planicies(5), []], graveyard: [[N], []] });
    allowPlay(tg.g, 0, tg.bf('Plains'), [tg.find(N, 'graveyard', 0)!], { kind: 'endOfTurn' });
    tg.refresh();
    const ks = chaves(tg);
    expect(ks).toContain('aftermath');
    expect(ks.filter((k) => k.startsWith('perm:'))).toHaveLength(2);
    tg.cast(N, ks.find((k) => k.startsWith('perm:') && k.endsWith('@1'))!).resolveAll();
    expect(tg.find(N, 'exile')).not.toBeNull();
  });
});
