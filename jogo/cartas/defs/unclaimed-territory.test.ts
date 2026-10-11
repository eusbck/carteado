import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const NOME = 'Unclaimed Territory';

/** joga o terreno escolhendo o tipo e devolve o jogo (com os itens oferecidos na escolha) */
function jogar(tipo: string, campo: string[] = [], mao: string[] = []) {
  const tg = setup({ battlefield: [campo, ['Indomitable Ancients']], hand: [[NOME, ...mao], []] });
  let itens: string[] = [];
  tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('escolha um tipo de criatura') ? (itens = d.items.map((i) => i.label), { kind: 'select', ids: [tipo] }) : null));
  tg.play(NOME);
  return { tg, itens };
}

describe(NOME, () => {
  it('só tipos de criatura existentes aparecem na escolha', () => {
    const { tg, itens } = jogar('Elf');
    expect(itens).toContain('Elf');
    expect(itens).toContain('Snake');
    for (const x of ['Equipment', 'Aura', 'Treasure', 'Forest', 'Jace']) expect(itens).not.toContain(x);
    expect(tg.state.objects[tg.bf(NOME)].choices.creatureType).toBe('Elf');
  });
  it('CR 106.6: a mana de qualquer cor só paga mágica de criatura do tipo escolhido', () => {
    // Elvish Mystic ({G}) é Elf: pago só com o território
    const elfo = jogar('Elf', [], ['Elvish Mystic']).tg;
    expect(elfo.canCast('Elvish Mystic')).toBe(true);
    elfo.cast('Elvish Mystic').resolve();
    expect(elfo.find('Elvish Mystic')).not.toBeNull();
    // Sakura-Tribe Elder ({1}{G}) é Snake: o {G} não sai do território escolhido como Elf
    expect(jogar('Elf', ['Sol Ring'], ['Sakura-Tribe Elder']).tg.canCast('Sakura-Tribe Elder')).toBe(false);
    expect(jogar('Snake', ['Sol Ring'], ['Sakura-Tribe Elder']).tg.canCast('Sakura-Tribe Elder')).toBe(true);
    // mágica que não é de criatura
    expect(jogar('Elf', [], ['Brainstorm']).tg.canCast('Brainstorm')).toBe(false);
  });
  it('{T}: adicione {C} (sem restrição)', () => {
    const { tg } = jogar('Elf', [], ['Sol Ring']);
    tg.cast('Sol Ring').resolve();
    expect(tg.find('Sol Ring')).not.toBeNull();
  });
});
