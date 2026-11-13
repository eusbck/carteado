import { describe, expect, it } from 'vitest';
import { createTokens, gainLife } from '../../motor/api.ts';
import { fixture as setup, runEffect } from '../../testes/artefatos.ts';

const N = 'Ocelot Pride';

describe(N, () => {
  it('sem ganhar vida no turno, não cria nada', () => {
    const tg = setup({ battlefield: [[N], []] });
    tg.passTo('cleanup');
    expect(tg.all('Cat')).toHaveLength(0);
  });

  it('ganhou vida antes de a Ocelot entrar: o gatilho dispara igual', () => {
    const tg = setup({ battlefield: [['Plains'], []], hand: [[N], []] });
    gainLife(tg.g, 0, 1, null);
    tg.cast(N).resolve();
    tg.passTo('cleanup');
    expect(tg.all('Cat').filter((id) => tg.state.objects[id].isToken)).toHaveLength(1);
  });

  it('com a bênção (o Cat é o décimo permanente), copia cada ficha que entrou no turno, inclusive o Cat', () => {
    // Ocelot + 7 terrenos + um Treasure criado neste turno = 9; o Cat é o décimo
    const tg = setup({ battlefield: [[N, 'Plains', 'Plains', 'Plains', 'Plains', 'Plains', 'Plains', 'Plains'], []] });
    runEffect(tg, createTokens(tg.g, 0, 'Treasure', 1));
    gainLife(tg.g, 0, 1, null);
    tg.passTo('cleanup');
    expect(tg.state.players[0].citysBlessing).toBe(true);
    expect(tg.all('Treasure')).toHaveLength(2);
    expect(tg.all('Cat').filter((id) => tg.state.objects[id].isToken)).toHaveLength(2);
  });
});
