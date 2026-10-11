import { describe, expect, it } from 'vitest';
import { chars, nameOf } from '../../motor/chars.ts';
import { enterCard, fixture as setup } from '../../testes/artefatos.ts';

const N = 'Dazzling Theater // Prop Room';
const planicies = (n: number) => Array(n).fill('Plains');
const chaves = (tg: ReturnType<typeof setup>) => tg.actionIds().filter((a) => a.startsWith('cast:')).map((a) => a.split(':').slice(2).join(':')).sort();
const destrancar = (tg: ReturnType<typeof setup>) => tg.actionIds().filter((a) => a.startsWith('unlock:'));

describe(N, () => {
  it('CR 709.5d — conjurar uma porta: ela entra destrancada; não dá para conjurar as duas', () => {
    const tg = setup({ battlefield: [planicies(7), []], hand: [[N], []] });
    // uma opção para cada porta, nenhuma para as duas juntas
    expect(chaves(tg)).toEqual(['hand', 'hand@1']);
    tg.cast(N, 'hand').resolveAll();
    const id = tg.bf(N);
    expect(nameOf(tg.g, id)).toBe('Dazzling Theater');
    expect(tg.all('Plains').filter((p) => tg.state.objects[p].tapped)).toHaveLength(4);
  });

  it('CR 709.3b — na pilha só existe a porta conjurada', () => {
    const tg = setup({ battlefield: [planicies(7), []], hand: [[N], []] });
    tg.cast(N, 'hand@1');
    const magica = tg.state.zones.stack[0];
    expect(chars(tg.g, magica).name).toBe('Prop Room');
    expect(chars(tg.g, magica).manaValue).toBe(3);
  });

  it('CR 709.2 — a Sala é uma carta só', () => {
    const tg = setup({ battlefield: [[], []], hand: [[N], []] });
    expect(tg.state.zones.hand[0]).toHaveLength(1);
  });

  it('CR 709.4 — fora da pilha e do campo tem as duas portas: valor de mana 7', () => {
    const tg = setup({ battlefield: [[], []], hand: [[N], []] });
    const id = tg.find(N, 'hand', 0)!;
    expect(chars(tg.g, id).manaValue).toBe(7);
    expect(chars(tg.g, id).subtypes).toContain('Room');
  });

  it('CR 709.5 — no campo, as características das portas destrancadas', () => {
    const tg = setup({ battlefield: [planicies(7), []], hand: [[N], []] });
    tg.cast(N, 'hand@1').resolveAll();
    const id = tg.bf(N);
    expect(nameOf(tg.g, id)).toBe('Prop Room');
    expect(chars(tg.g, id).manaValue).toBe(3);
    // destrancando a outra porta, passa a ter as duas
    const [acao] = destrancar(tg);
    expect(acao).toBeDefined();
    tg.answer({ kind: 'priority', action: acao });
    tg.settle();
    expect(nameOf(tg.g, id)).toBe('Dazzling Theater // Prop Room');
    expect(chars(tg.g, id).manaValue).toBe(7);
    expect(tg.all('Plains').every((p) => tg.state.objects[p].tapped)).toBe(true);
    expect(destrancar(tg)).toHaveLength(0);
  });

  it('CR 709.5d — vinda de fora da pilha, entra com as duas portas trancadas', () => {
    const tg = setup({ battlefield: [planicies(7), []] });
    const id = enterCard(tg, N, 0)!;
    expect(destrancar(tg)).toHaveLength(2);
    expect(chars(tg.g, id).abilities.filter((a) => !a.id.startsWith('kw:'))).toHaveLength(0);
  });

  it('CR 709.5 — sem porta destrancada, não tem nome nem habilidades', () => {
    const tg = setup({ battlefield: [[...planicies(3), { name: 'Elvish Mystic', tapped: true }], []] });
    const id = enterCard(tg, N, 0)!;
    expect(chars(tg.g, id).name).toBe('');
    expect(chars(tg.g, id).manaValue).toBe(0);
    // Prop Room trancada: a criatura não desvira no turno do oponente
    tg.passTo('upkeep', 1);
    expect(tg.state.objects[tg.bf('Elvish Mystic')].tapped).toBe(true);
  });

  it('CR 116.2m, 709.5e — destrancar é ação especial, só como feitiço', () => {
    const tg = setup({ active: 1, battlefield: [planicies(7), []] });
    enterCard(tg, N, 0);
    tg.pass();
    // no turno do oponente, com prioridade, não dá para destrancar
    expect(tg.pending?.player).toBe(0);
    expect(destrancar(tg)).toHaveLength(0);
    tg.passTo('main1', 0);
    expect(destrancar(tg)).toHaveLength(2);
    // não usa a pilha
    tg.answer({ kind: 'priority', action: destrancar(tg)[0] });
    tg.settle();
    expect(tg.state.zones.stack).toHaveLength(0);
    expect(destrancar(tg)).toHaveLength(1);
  });

  it('convoca com criatura que acabou de entrar', () => {
    // Dazzling Theater destrancada: Wall of Omens ({1}{W}) sai com uma Plains e uma criatura com enjoo de invocação
    const tg = setup({ battlefield: [[...planicies(5), { name: 'Elvish Mystic', ready: false }], []], hand: [[N, 'Wall of Omens'], []], library: [Array(10).fill('Forest'), []] });
    tg.cast(N, 'hand').resolveAll();
    expect(tg.all('Plains').filter((p) => !tg.state.objects[p].tapped)).toHaveLength(1);
    tg.choose('Convocar', ['Elvish Mystic']).cast('Wall of Omens').resolveAll();
    expect(tg.find('Wall of Omens')).not.toBeNull();
    expect(tg.state.objects[tg.bf('Elvish Mystic')].tapped).toBe(true);
  });

  it('sem a porta do teatro destrancada, as mágicas de criatura não têm convocar', () => {
    const tg = setup({ battlefield: [[...planicies(4), { name: 'Elvish Mystic', ready: false }], []], hand: [[N, 'Wall of Omens'], []] });
    tg.cast(N, 'hand@1').resolveAll();
    // sobra uma Plains: Wall of Omens custa {1}{W} e, sem convocar, não dá
    expect(tg.canCast('Wall of Omens')).toBe(false);
  });

  it('Prop Room desvira todas as suas criaturas na etapa de desvirar dos outros', () => {
    const tg = setup({ battlefield: [[...planicies(3), { name: 'Elvish Mystic', tapped: true }, { name: 'Sol Ring', tapped: true }], [{ name: 'Wall of Omens', tapped: true }]], hand: [[N], []], library: [Array(10).fill('Forest'), Array(10).fill('Forest')] });
    tg.cast(N, 'hand@1').resolveAll();
    tg.passTo('upkeep', 1);
    // a sua criatura desvirou no turno do oponente; o seu artefato, não
    expect(tg.state.objects[tg.bf('Elvish Mystic')].tapped).toBe(false);
    expect(tg.state.objects[tg.bf('Sol Ring')].tapped).toBe(true);
    // a criatura do oponente desvira normalmente, na etapa dele
    expect(tg.state.objects[tg.bf('Wall of Omens')].tapped).toBe(false);
  });
});
