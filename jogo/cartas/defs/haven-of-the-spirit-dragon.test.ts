import { describe, expect, it } from 'vitest';
import { alternativasDeMana, setup } from '../../testes/padroes.ts';

const NOME = 'Haven of the Spirit Dragon';

describe(NOME, () => {
  it('CR 605: mana que produz ({C} ou qualquer cor)', () => expect(alternativasDeMana(NOME)).toEqual(['B', 'C', 'G', 'R', 'U', 'W']));
  it('CR 106.6: a mana colorida paga uma mágica de criatura Dragon', () => {
    const tg = setup({ battlefield: [[NOME, 'Mountain', 'Sol Ring'], []], hand: [['Manaform Hellkite'], []] });
    expect(tg.canCast('Manaform Hellkite')).toBe(true);
    tg.cast('Manaform Hellkite').resolve();
    expect(tg.find('Manaform Hellkite')).not.toBeNull();
    expect(tg.state.objects[tg.bf(NOME)].tapped).toBe(true);
  });
  it('CR 106.6: a mana colorida não paga outras mágicas; {C} paga custo genérico', () => {
    const tg = setup({ battlefield: [[NOME], []], hand: [['Elvish Mystic', 'Sol Ring'], []] });
    expect(tg.canCast('Elvish Mystic')).toBe(false);
    expect(tg.canCast('Sol Ring')).toBe(true);
  });
  it('{2}, {T}, sacrifique: devolve uma carta de criatura Dragon do seu cemitério para a mão', () => {
    const tg = setup({ battlefield: [[NOME, 'Sol Ring'], []], graveyard: [['Manaform Hellkite', 'Elvish Mystic'], ['Steel Hellkite']] });
    let opcoes: string[] = [];
    tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('Dragon') ? (opcoes = d.items.map((i) => i.label), null) : null));
    tg.choose('Dragon', ['Manaform Hellkite']).activate(NOME, 'Devolva').resolve();
    expect(opcoes.some((l) => l.includes('Elvish Mystic'))).toBe(false);
    expect(opcoes.some((l) => l.includes('Steel Hellkite'))).toBe(false); // cemitério do oponente
    expect(tg.names(0, 'hand')).toEqual(['Manaform Hellkite']);
    expect(tg.find(NOME, 'graveyard')).not.toBeNull();
  });
});
