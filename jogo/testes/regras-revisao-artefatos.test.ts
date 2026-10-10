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

describe('improvisar no pagamento automático: fontes de mana primeiro (CR 702.126a)', () => {
  const thopters = (n: number) => Array.from({ length: n }, () => ({ name: 'Thopter', token: true }));
  const virados = (tg: ReturnType<typeof fixture>) => tg.state.zones.battlefield.filter((id) => tg.state.objects[id].tapped).map((id) => tg.state.objects[id].def).sort();
  it('Kappa Cannoneer com seis Islands e cinco Thopters vira as seis Islands e nenhum Thopter', () => {
    const tg = fixture({ battlefield: [[...thopters(5), ...Array(6).fill('Island')], []], hand: [['Kappa Cannoneer'], []] });
    tg.cast('Kappa Cannoneer');
    expect(tg.state.zones.stack.map((id) => tg.state.objects[id].def)).toContain('Kappa Cannoneer');
    expect(virados(tg)).toEqual(Array(6).fill('Island'));
  });
  it('só improvisa o que falta, preferindo o artefato que não é criatura e sem habilidade de mana', () => {
    const tg = fixture({ battlefield: [[...thopters(2), 'Swiftfoot Boots', 'Sol Ring', 'Island', 'Island', 'Island'], []], hand: [['Kappa Cannoneer'], []] });
    tg.cast('Kappa Cannoneer');
    // três Islands e o Sol Ring dão cinco manas; falta uma, paga virando as Swiftfoot Boots
    expect(virados(tg)).toEqual(['Island', 'Island', 'Island', 'Sol Ring', 'Swiftfoot Boots']);
    // com uma Mind Stone a mais, as fontes de mana pagam tudo e nada é improvisado
    const tg2 = fixture({ battlefield: [[...thopters(2), 'Swiftfoot Boots', 'Sol Ring', 'Mind Stone', 'Island', 'Island', 'Island'], []], hand: [['Kappa Cannoneer'], []] });
    tg2.cast('Kappa Cannoneer');
    expect(virados(tg2)).toEqual(['Island', 'Island', 'Island', 'Mind Stone', 'Sol Ring']);
  });
  it('entre criaturas, vira primeiro a que está com enjoo de invocação', () => {
    const tg = fixture({ battlefield: [['Thopter', 'Island', 'Island', 'Island', 'Island', 'Island'].map((name, i) => i === 0 ? { name, token: true } : name).concat([{ name: 'Thopter', token: true, ready: false }]), []], hand: [['Kappa Cannoneer'], []] });
    const prontos = tg.state.zones.battlefield.filter((id) => tg.state.objects[id].def === 'Thopter');
    tg.cast('Kappa Cannoneer');
    const [velho, novo] = prontos;
    expect(tg.state.objects[novo].tapped).toBe(true);
    expect(tg.state.objects[velho].tapped).toBe(false);
  });
});
