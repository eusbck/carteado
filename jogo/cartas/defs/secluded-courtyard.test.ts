import { describe, expect, it } from 'vitest';
import { alternativasDeMana, setup } from '../../testes/padroes.ts';
import type { TestGame } from '../../testes/harness.ts';

const NOME = 'Secluded Courtyard';

/** joga o Courtyard escolhendo o tipo */
function comTipo(tipo: string, campo: string[] = [], mao: string[] = []): TestGame {
  const tg = setup({ battlefield: [campo, []], hand: [[NOME, ...mao], []] });
  tg.choose('tipo de criatura', [tipo]).play(NOME);
  return tg;
}

function podeAtivar(tg: TestGame, nome: string): boolean {
  tg.settle();
  const d = tg.pending;
  const id = tg.bf(nome);
  return d?.kind === 'priority' && d.actions.some((a) => a.id.startsWith('act:') && a.obj === id);
}

describe(NOME, () => {
  it('CR 605: mana que produz ({C} ou qualquer cor)', () => expect(alternativasDeMana(NOME)).toEqual(['B', 'C', 'G', 'R', 'U', 'W']));
  it('ao entrar, escolhe um tipo de criatura (guardado no terreno)', () => {
    const tg = comTipo('Elf');
    expect(tg.state.objects[tg.bf(NOME)].choices.tipo).toBe('Elf');
  });
  it('CR 106.6: a mana colorida paga mágica de criatura do tipo escolhido, não de outro tipo', () => {
    const tg = comTipo('Elf', [], ['Elvish Mystic', 'Viscera Seer']);
    expect(tg.canCast('Elvish Mystic')).toBe(true);
    expect(tg.canCast('Viscera Seer')).toBe(false);
    tg.cast('Elvish Mystic').resolve();
    expect(tg.find('Elvish Mystic')).not.toBeNull();
  });
  it('CR 106.6: a mana colorida paga habilidade de uma criatura do tipo escolhido', () => {
    // Wakestone Gargoyle (Gargoyle): {1}{W}; a Island paga o {1}, o {W} só pode vir do Courtyard
    const sim = comTipo('Gargoyle', ['Island', 'Wakestone Gargoyle']);
    expect(podeAtivar(sim, 'Wakestone Gargoyle')).toBe(true);
    const nao = comTipo('Elf', ['Island', 'Wakestone Gargoyle']);
    expect(podeAtivar(nao, 'Wakestone Gargoyle')).toBe(false);
  });
  it('sem tipo escolhido, a mana colorida não paga nada', () => {
    // posto direto no campo, sem passar pela escolha de "ao entrar"
    const tg = setup({ battlefield: [[NOME], []], hand: [['Elvish Mystic', 'Sol Ring'], []] });
    expect(tg.canCast('Elvish Mystic')).toBe(false);
    expect(tg.canCast('Sol Ring')).toBe(true); // {C}
  });
});
