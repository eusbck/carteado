import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const DEMON = "Demon of Fate's Design";
const pagandoVida = (tg: ReturnType<typeof setup>, nome: string) =>
  tg.actionIds().find((a) => a.startsWith('cast:') && a.includes("Demon of Fate's Design:vida") && a.split(':')[1] === String(tg.find(nome, 'hand', 0)));

describe(DEMON, () => {
  it('uma vez em cada um dos seus turnos, conjura uma mágica de encantamento pagando vida igual ao valor de mana', () => {
    const tg = setup({ battlefield: [[DEMON], []], hand: [['Ghostly Prison', 'Sphere of Safety', 'Wall of Omens'], []] });
    expect(pagandoVida(tg, 'Wall of Omens')).toBeUndefined();
    tg.answer({ kind: 'priority', action: pagandoVida(tg, 'Ghostly Prison')! });
    tg.settle();
    expect(tg.life(0)).toBe(37);
    tg.resolve();
    expect(tg.find('Ghostly Prison')).not.toBeNull();
    expect(pagandoVida(tg, 'Sphere of Safety')).toBeUndefined();
  });

  it('{2}{B}, sacrifique outro encantamento: +X/+0 até o fim do turno, X = valor de mana do sacrificado', () => {
    const tg = setup({ battlefield: [[DEMON, 'Ghostly Prison', 'Swamp', 'Swamp', 'Swamp'], []] });
    tg.activate(DEMON, '{2}{B}').resolve();
    expect(tg.names(0, 'graveyard')).toEqual(['Ghostly Prison']);
    expect(tg.pt(tg.bf(DEMON))).toEqual([9, 6]);
  });
});
