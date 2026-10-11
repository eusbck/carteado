import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Parnesse, the Subtle Brush';
const lib = Array(10).fill('Forest');

describe(N, () => {
  it('mágica de um oponente que tem um permanente seu como alvo é anulada, a menos que ele pague 4 de vida', () => {
    // Spit Flame: 4 de dano à criatura alvo
    const tg = setup({ active: 1, battlefield: [[N, 'Elvish Mystic'], ['Mountain', 'Mountain', 'Mountain']], hand: [[], ['Spit Flame']], library: [lib, lib] });
    expect(tg.pt(tg.bf(N))).toEqual([4, 4]);
    tg.choose('criatura alvo', ['Elvish Mystic']).yes('Parnesse', false).cast('Spit Flame').resolveAll();
    expect(tg.find('Elvish Mystic')).not.toBeNull();
    expect(tg.find('Spit Flame', 'graveyard', 1)).not.toBeNull();
    expect(tg.life(1)).toBe(40);
  });

  it('pagando 4 de vida, a mágica resolve', () => {
    const tg = setup({ active: 1, battlefield: [[N, 'Elvish Mystic'], ['Mountain', 'Mountain', 'Mountain']], hand: [[], ['Spit Flame']], library: [lib, lib] });
    tg.choose('criatura alvo', ['Elvish Mystic']).yes('Parnesse', true).cast('Spit Flame').resolveAll();
    expect(tg.find('Elvish Mystic')).toBeNull();
    expect(tg.life(1)).toBe(36);
  });

  it('com menos de 4 de vida, o oponente não pode pagar; e as suas próprias mágicas não disparam', () => {
    const tg = setup({ active: 1, life: 3, battlefield: [[N, 'Elvish Mystic'], ['Mountain', 'Mountain', 'Mountain']], hand: [[], ['Spit Flame']], library: [lib, lib] });
    let perguntou = false;
    tg.script.push((d) => { if (d.kind === 'select' && d.prompt.startsWith('Parnesse')) perguntou = true; return null; });
    tg.choose('criatura alvo', ['Elvish Mystic']).cast('Spit Flame').resolveAll();
    expect(perguntou).toBe(false);
    expect(tg.find('Elvish Mystic')).not.toBeNull();

    const meu = setup({ battlefield: [[N, 'Elvish Mystic', 'Mountain', 'Mountain', 'Mountain'], []], hand: [['Spit Flame'], []], library: [lib, lib] });
    meu.choose('criatura alvo', ['Elvish Mystic']).cast('Spit Flame');
    expect(meu.state.zones.stack).toHaveLength(1);
  });

  it('quando você copia uma mágica, até um oponente alvo pode copiá-la também', () => {
    // Double Vision copia o primeiro Preordain; o oponente escolhido também ganha uma cópia e compra uma carta
    const tg = setup({ battlefield: [[N, 'Double Vision', 'Island'], []], hand: [['Preordain'], []], library: [lib, lib] });
    tg.choose('oponente alvo', ['Bruno']).yes('Parnesse', true).cast('Preordain').resolveAll();
    expect(tg.names(0, 'hand')).toHaveLength(2);
    expect(tg.names(1, 'hand')).toHaveLength(1);
  });

  it('o oponente pode recusar a cópia, e você pode não escolher ninguém', () => {
    const tg = setup({ battlefield: [[N, 'Double Vision', 'Island'], []], hand: [['Preordain'], []], library: [lib, lib] });
    tg.choose('oponente alvo', ['Bruno']).yes('Parnesse', false).cast('Preordain').resolveAll();
    expect(tg.names(1, 'hand')).toHaveLength(0);
    const sem = setup({ battlefield: [[N, 'Double Vision', 'Island'], []], hand: [['Preordain'], []], library: [lib, lib] });
    sem.script.push((d) => (d.kind === 'select' && d.prompt.includes('oponente alvo') ? { kind: 'select', ids: [] } : null));
    sem.cast('Preordain').resolveAll();
    expect(sem.names(1, 'hand')).toHaveLength(0);
    expect(sem.names(0, 'hand')).toHaveLength(2);
  });
});
