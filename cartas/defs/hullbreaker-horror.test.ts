import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const MAGICA = 'Devolva a mágica alvo que você não controla para a mão do dono';
const PERMANENTE = 'Devolva o permanente não terreno alvo para a mão do dono';
const ilhas = (n: number) => Array(n).fill('Island');

describe('Hullbreaker Horror', () => {
  it('ao conjurar uma mágica, devolve o permanente não terreno alvo para a mão do dono', () => {
    const tg = setup({ battlefield: [['Hullbreaker Horror', 'Forest'], ['Wall of Omens']], hand: [['Sol Ring'], []] });
    tg.choose('escolha de 0 a 1 modo', [PERMANENTE]).choose('permanente não terreno alvo', ['Wall of Omens']);
    tg.cast('Sol Ring').resolve();
    expect(tg.names(1, 'hand')).toEqual(['Wall of Omens']);
    tg.resolve();
    expect(tg.find('Sol Ring')).not.toBeNull();
  });

  it('no turno do oponente, devolve a mágica dele para a mão', () => {
    const tg = setup({
      active: 1,
      battlefield: [['Hullbreaker Horror', 'Plains'], ['Swamp', 'Swamp']],
      hand: [['Secure the Wastes'], ["Night's Whisper"]],
      library: [[], ['Island', 'Island']],
    });
    tg.cast("Night's Whisper").pass();
    // Ana responde com uma instantânea; o gatilho mira a mágica de Bruno
    tg.choose('escolha de 0 a 1 modo', [MAGICA]).choose('mágica alvo que você não controla', ["Night's Whisper"]);
    tg.number('valor de X', 0).cast('Secure the Wastes').resolve();
    expect(tg.names(1, 'hand')).toEqual(["Night's Whisper"]);
    tg.resolveAll();
    expect(tg.names(1, 'hand')).toEqual(["Night's Whisper"]); // Bruno não comprou nada
  });

  it('CR 702.8a: com lampejo, pode ser conjurada no turno do oponente', () => {
    const tg = setup({ active: 1, battlefield: [ilhas(7), []], hand: [['Hullbreaker Horror'], []] });
    tg.pass();
    tg.cast('Hullbreaker Horror').resolve();
    expect(tg.find('Hullbreaker Horror', 'battlefield', 0)).not.toBeNull();
  });

  it('não pode mirar uma mágica que você controla; pode não escolher nenhum modo', () => {
    const tg = setup({ battlefield: [['Hullbreaker Horror', 'Forest', 'Forest'], []], hand: [['Sol Ring', 'Elvish Mystic'], []] });
    let modoMagica: boolean | undefined;
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('modo')) return null;
      modoMagica = !d.items.find((i) => i.label === MAGICA)?.disabled;
      return { kind: 'select', ids: [] };
    });
    tg.cast('Sol Ring');
    // a única mágica na pilha é de Ana: o primeiro modo não pode ser escolhido; sem modo, o gatilho não vai para a pilha
    expect(modoMagica).toBe(false);
    expect(tg.state.zones.stack.length).toBe(1);
    tg.resolve();
    expect(tg.find('Sol Ring')).not.toBeNull();
  });

  it('CR 101.2: esta mágica não pode ser anulada', () => {
    const tg = setup({ battlefield: [ilhas(7), ['Island', 'Island']], hand: [['Hullbreaker Horror'], ['Counterspell']] });
    tg.cast('Hullbreaker Horror').pass();
    tg.choose('mágica alvo', ['Hullbreaker Horror']).cast('Counterspell').resolve();
    tg.resolveAll();
    expect(tg.find('Hullbreaker Horror', 'battlefield', 0)).not.toBeNull();
    expect(tg.names(1, 'graveyard')).toEqual(['Counterspell']);
  });
});
