import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { counter } from '../../motor/api.ts';

function comTipo(tipo: string, mao: string[]) {
  const tg = setup({ battlefield: [['Cavern of Souls'], []], hand: [mao, []] });
  tg.state.objects[tg.bf('Cavern of Souls')].choices.tipo = tipo;
  tg.refresh();
  return tg;
}

describe('Cavern of Souls', () => {
  it('conforme entra, escolhe um tipo de criatura', () => {
    const tg = setup({ battlefield: [[], []], hand: [['Cavern of Souls'], []] });
    tg.choose('escolha um tipo de criatura', ['Dragon']).play('Cavern of Souls');
    expect(tg.state.objects[tg.bf('Cavern of Souls')].choices.tipo).toBe('Dragon');
  });

  it('gasta numa mágica de criatura do tipo escolhido, ela não pode ser anulada; em outra mágica, não pode ser gasta', () => {
    const tg = comTipo('Elf', ['Elvish Mystic']);
    tg.cast('Elvish Mystic');
    const sp = tg.state.zones.stack[0];
    expect(tg.run(counter(tg.g, sp))).toBe(false);
    tg.resolve();
    expect(tg.find('Elvish Mystic', 'battlefield', 0)).not.toBeNull();
    // outro tipo: a mana colorida não paga, e a incolor não paga {G}
    const tg2 = comTipo('Dragon', ['Elvish Mystic']);
    expect(tg2.canCast('Elvish Mystic')).toBe(false);
  });

  it('paga com a mana incolor uma mágica qualquer, que pode ser anulada', () => {
    const tg = comTipo('Elf', ['Sol Ring']);
    tg.cast('Sol Ring');
    const sp = tg.state.zones.stack[0];
    expect(tg.run(counter(tg.g, sp))).toBe(true);
    expect(tg.find('Sol Ring', 'graveyard', 0)).not.toBeNull();
  });
});
