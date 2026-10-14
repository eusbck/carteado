import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { createTokens } from '../../motor/api.ts';
import { alternativasDeMana, entraVirado } from '../../testes/padroes.ts';

const NOME = 'Oran-Rief, the Vastwood';

describe(NOME, () => {
  it('CR 605: produz {G}', () => expect(alternativasDeMana(NOME)).toEqual(['G']));
  it('CR 614.1c: entra virado', () => expect(entraVirado(NOME)).toBe(true));
  it('um marcador em cada criatura verde que entrou neste turno, de qualquer jogador; as que já estavam ficam sem', () => {
    const tg = setup({ battlefield: [[NOME, { name: 'Squirrel', token: true }], []] });
    const velho = tg.bf('Squirrel');
    const [meu] = tg.run(createTokens(tg.g, 0, 'Squirrel', 1));
    const [dele] = tg.run(createTokens(tg.g, 1, 'Squirrel', 1));
    const [rato] = tg.run(createTokens(tg.g, 0, 'Rat', 1));
    tg.activate(NOME, 'marcador').resolve();
    expect(tg.state.objects[meu].counters['+1/+1']).toBe(1);
    expect(tg.state.objects[dele].counters['+1/+1']).toBe(1);
    expect(tg.state.objects[rato].counters['+1/+1'] ?? 0).toBe(0);
    expect(tg.state.objects[velho].counters['+1/+1'] ?? 0).toBe(0);
  });
});
