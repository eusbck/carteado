import { describe, expect, it } from 'vitest';
import { cardDef } from '../../motor/defs.ts';
import { candidateTargets } from '../../motor/stack.ts';
import { setup } from '../../testes/harness.ts';

const FC = 'Fatehold Charm';
const mana = ['Plains', 'Island'];
const lealdade = (tg: ReturnType<typeof setup>, id: number) => tg.state.objects[id].counters.loyalty ?? 0;

describe('Fatehold Charm', () => {
  it('sem ficha de Jace, cria uma com 0 de lealdade e põe 2 marcadores', () => {
    const tg = setup({ battlefield: [mana, []], hand: [[FC], []], library: [['Forest'], []] });
    tg.choose('modo', ['Compre uma carta. Fortaleça Jace 2.']).cast(FC).resolve();
    expect(tg.names(0, 'hand')).toEqual(['Forest']);
    const jaces = tg.all('Jace');
    expect(jaces).toHaveLength(1);
    expect(tg.state.objects[jaces[0]].isToken).toBe(true);
    expect(lealdade(tg, jaces[0])).toBe(2);
  });

  it('com ficha de Jace no campo, não cria outra; com duas, você escolhe qual recebe', () => {
    const tg = setup({ battlefield: [[...mana, { name: 'Jace', token: true, counters: { loyalty: 1 } }], []], hand: [[FC], []], library: [['Forest'], []] });
    tg.choose('modo', ['Compre uma carta. Fortaleça Jace 2.']).cast(FC).resolve();
    expect(tg.all('Jace')).toHaveLength(1);
    expect(lealdade(tg, tg.bf('Jace'))).toBe(3);

    const tg2 = setup({ battlefield: [[...mana, { name: 'Jace', token: true, counters: { loyalty: 1 } }, { name: 'Jace', token: true, counters: { loyalty: 4 } }], []], hand: [[FC], []], library: [['Forest'], []] });
    const [a, b] = tg2.all('Jace');
    tg2.choose('modo', ['Compre uma carta. Fortaleça Jace 2.']).choose('ficha de Jace', [b]).cast(FC).resolve();
    expect([lealdade(tg2, a), lealdade(tg2, b)]).toEqual([1, 6]);
  });

  it('Jace que não é ficha não recebe os marcadores; cria-se a ficha', () => {
    const tg = setup({ battlefield: [[...mana, { name: 'Jace, Multiverse Architect', counters: { loyalty: 5 } }], []], hand: [[FC], []], library: [['Forest'], []] });
    const arquiteto = tg.bf('Jace, Multiverse Architect');
    tg.choose('modo', ['Compre uma carta. Fortaleça Jace 2.']).cast(FC).resolve();
    expect(lealdade(tg, arquiteto)).toBe(5);
    const ficha = tg.all('Jace').find((id) => tg.state.objects[id].isToken)!;
    expect(lealdade(tg, ficha)).toBe(2);
  });

  it('devolve a criatura alvo para a mão do dono', () => {
    const tg = setup({ battlefield: [mana, ['Indomitable Ancients']], hand: [[FC], []] });
    tg.choose('modo', ['Devolva a mágica ou criatura alvo para a mão do dono.']).choose('mágica ou criatura alvo', ['Indomitable Ancients']).cast(FC).resolve();
    expect(tg.names(1, 'hand')).toEqual(['Indomitable Ancients']);
  });

  it('devolve a mágica alvo para a mão do dono', () => {
    const tg = setup({ active: 1, battlefield: [mana, ['Island']], hand: [[FC], ['Sol Ring']] });
    tg.cast('Sol Ring');
    tg.pass();
    tg.choose('modo', ['Devolva a mágica ou criatura alvo para a mão do dono.']).choose('mágica ou criatura alvo', ['Sol Ring']).cast(FC).resolveAll();
    expect(tg.names(1, 'hand')).toEqual(['Sol Ring']);
    expect(tg.find('Sol Ring')).toBeNull();
  });

  it('não serve: permanente que não é criatura, nem habilidade na pilha', () => {
    const tg = setup({ battlefield: [mana, ['Sol Ring', 'Wall of Omens']], hand: [[FC], []] });
    const spec = cardDef(FC)!.faces[0].spell!.modes!.modes[1].targets![0];
    expect(candidateTargets(tg.g, spec, 0, tg.find(FC, 'hand')!)).toEqual([{ kind: 'obj', id: tg.bf('Wall of Omens') }]);
  });

  it('as criaturas que você controla recebem +1/+2 até o fim do turno', () => {
    const tg = setup({ battlefield: [[...mana, 'Wall of Omens'], ['Indomitable Ancients']], hand: [[FC], []] });
    tg.choose('modo', ['As criaturas que você controla recebem +1/+2 até o fim do turno.']).cast(FC).resolve();
    expect(tg.pt(tg.bf('Wall of Omens'))).toEqual([1, 6]);
    expect(tg.pt(tg.bf('Indomitable Ancients'))).toEqual([2, 10]);
  });
});
