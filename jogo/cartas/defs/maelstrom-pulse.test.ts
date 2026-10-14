import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { createTokens } from '../../motor/api.ts';

const NOME = 'Maelstrom Pulse';
const MANA = ['Swamp', 'Forest', 'Forest'];

describe(NOME, () => {
  it('destrói o alvo e as outras permanentes com o mesmo nome, inclusive fichas (as de Squirrel se chamam Squirrel)', () => {
    const tg = setup({ battlefield: [[...MANA, 'Wall of Omens'], ['Wall of Omens', 'Indomitable Ancients']], hand: [[NOME], []] });
    const [a] = tg.run(createTokens(tg.g, 1, 'Squirrel', 2));
    tg.choose('permanente não terreno', [a]).cast(NOME).resolve();
    expect(tg.all('Squirrel')).toEqual([]);
    expect(tg.all('Wall of Omens').length).toBe(2);
  });

  it('alvo indestrutível fica, mas as outras com o mesmo nome são destruídas', () => {
    const tg = setup({ battlefield: [[...MANA, 'Wall of Omens'], ['Wall of Omens']], hand: [[NOME], []] });
    const minha = tg.bf('Wall of Omens', 0);
    tg.state.objects[minha].counters.indestructible = 1;
    tg.choose('permanente não terreno', [minha]).cast(NOME).resolve();
    expect(tg.find('Wall of Omens', 'battlefield', 0)).toBe(minha);
    expect(tg.find('Wall of Omens', 'battlefield', 1)).toBeNull();
  });
});
