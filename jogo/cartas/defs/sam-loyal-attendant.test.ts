import { describe, expect, it } from 'vitest';
import { fixture as setup, enterCard } from '../../testes/artefatos.ts';

const N = 'Sam, Loyal Attendant';

describe(N, () => {
  it('ao entrar, o jogador alvo pode pôr o Frodo do grimório na mão', () => {
    const tg = setup({ battlefield: [[], []], library: [['Forest', 'Frodo, Adventurous Hobbit', 'Forest'], []] });
    tg.choose('jogador alvo', ['Ana']).yes('Parceiro com', true).choose('Escolha Frodo', ['Frodo, Adventurous Hobbit']);
    enterCard(tg, N, 0);
    tg.resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Frodo, Adventurous Hobbit']);
  });

  it('no início do combate no seu turno, cria uma Food', () => {
    const tg = setup({ battlefield: [[N], []] });
    tg.passTo('beginCombat', 0);
    tg.resolveAll();
    expect(tg.all('Food')).toHaveLength(1);
  });

  it('as habilidades das Foods custam {1} a menos: com um terreno só, a Food custa {1}', () => {
    const tg = setup({ battlefield: [[N, 'Plains', { name: 'Food', token: true }], []] });
    expect(tg.actionIds().some((a) => a.startsWith('act') && a.includes(String(tg.bf('Food'))))).toBe(true);
    tg.activate('Food').resolveAll();
    expect(tg.life(0)).toBe(43);
    expect(tg.all('Food')).toHaveLength(0);
    const sem = setup({ battlefield: [['Plains', { name: 'Food', token: true }], []] });
    expect(sem.actionIds().some((a) => a.startsWith('act') && a.includes(String(sem.bf('Food'))))).toBe(false);
  });
});
