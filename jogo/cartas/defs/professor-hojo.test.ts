import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Professor Hojo';
const pode = (tg: ReturnType<typeof setup>, nome: string, trecho: string) =>
  tg.pending?.kind === 'priority' && tg.pending.actions.some((a) => a.label.startsWith(`${nome}:`) && a.label.includes(trecho));

describe(N, () => {
  it('equipar é habilidade ativada: custa {2} a menos e dispara a compra', () => {
    const tg = setup({ battlefield: [[N, 'Plains', 'Silver Myr', 'Loxodon Warhammer'], []] });
    // equipar {3} com uma Plains: só com a redução
    expect(pode(tg, 'Loxodon Warhammer', 'Equipar')).toBe(true);
    tg.choose('criatura alvo', ['Silver Myr']).activate('Loxodon Warhammer', 'Equipar');
    expect(tg.state.objects[tg.bf('Plains')].tapped).toBe(true);
    expect(tg.state.zones.stack.length).toBe(2);
    tg.resolve();
    // a compra resolve antes do equipar
    expect(tg.names(0, 'hand').length).toBe(1);
    expect(tg.state.objects[tg.bf('Loxodon Warhammer')].attachedTo).toBeNull();
    tg.resolveAll();
    expect(tg.state.objects[tg.bf('Loxodon Warhammer')].attachedTo).toBe(tg.bf('Silver Myr'));
  });

  it('a compra resolve antes da habilidade que a disparou', () => {
    const tg = setup({ battlefield: [[N, 'Plains', 'Silver Myr', 'Lightning Greaves'], []] });
    tg.choose('criatura alvo', ['Silver Myr']).activate('Lightning Greaves', 'Equipar');
    tg.resolve();
    expect(tg.names(0, 'hand').length).toBe(1);
    expect(tg.state.zones.stack.length).toBe(1);
  });

  it('só reduz o genérico; a segunda ativação do turno paga o custo inteiro', () => {
    const tg = setup({ battlefield: [[N, 'Plains', 'Silver Myr', 'Wall of Omens', 'Lightning Greaves', 'Loxodon Warhammer'], []] });
    tg.choose('criatura alvo', ['Silver Myr']).activate('Lightning Greaves', 'Equipar').resolveAll();
    // o martelo ({3}) já não tem redução: com uma Plains e o Silver Myr, não dá
    expect(pode(tg, 'Loxodon Warhammer', 'Equipar')).toBe(false);
  });
});
