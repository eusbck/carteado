// Regressões dos problemas que a revisão achou no motor de artefatos (custos, improvisar, camadas, gatilhos de estado).
import { describe, expect, it } from 'vitest';
import { addEffect, chars } from '../motor/api.ts';
import { fixture } from './artefatos.ts';

describe('CDA de carta fora do campo durante as camadas (CR 604.3, 613.1, 613.4a)', () => {
  it('Duplicant e o Master of Etherium exilado contam o artefato criado por efeito de tipo (camada 4)', () => {
    const tg = fixture({ battlefield: [['Sol Ring', 'Sol Ring', 'Sol Ring'], ['Master of Etherium', 'Silver Myr', 'Elvish Mystic']], hand: [['Duplicant'], []] });
    tg.choose('criatura não ficha', ['Master of Etherium']).yes('Duplicant:').cast('Duplicant').resolveAll();
    const dup = tg.bf('Duplicant');
    expect(tg.pt(dup)).toEqual([1, 1]);
    const elf = tg.bf('Elvish Mystic');
    addEffect(tg.g, { source: elf, sourceDef: '', controller: 1, duration: { kind: 'endOfTurn' }, affected: [elf], mods: [{ k: 'addTypes', types: ['Artifact'] }] });
    tg.g.bump(); tg.refresh();
    expect(tg.pt(dup)).toEqual([2, 2]);
    const master = tg.find('Master of Etherium', 'exile')!;
    expect([chars(tg.g, master).power, chars(tg.g, master).toughness]).toEqual([2, 2]);
    // a leitura depois da passada e um novo cálculo concordam (nada ficou em cache com o campo pela metade)
    tg.g.derived = null;
    expect([chars(tg.g, master).power, tg.pt(dup)]).toEqual([2, [2, 2]]);
  });
  it('o Master exilado deixa de contar o artefato do dono que outro jogador passou a controlar (camada 2)', () => {
    const tg = fixture({ battlefield: [['Sol Ring', 'Sol Ring', 'Sol Ring'], ['Master of Etherium', 'Silver Myr', 'Sol Ring']], hand: [['Duplicant'], []] });
    tg.choose('criatura não ficha', ['Master of Etherium']).yes('Duplicant:').cast('Duplicant').resolveAll();
    const dup = tg.bf('Duplicant');
    expect(tg.pt(dup)).toEqual([2, 2]);
    const myr = tg.bf('Silver Myr');
    addEffect(tg.g, { source: dup, sourceDef: '', controller: 0, duration: { kind: 'endOfTurn' }, affected: [myr], mods: [{ k: 'control', player: 0 }] });
    tg.g.bump(); tg.refresh();
    expect(tg.pt(dup)).toEqual([1, 1]);
  });
});
