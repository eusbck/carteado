import { describe, expect, it } from 'vitest';
import { alternativasDeMana, entraVirado, setup } from '../../testes/padroes.ts';

const NOME = 'Rupture Spire';

describe(NOME, () => {
  it('CR 605: mana que produz', () => expect(alternativasDeMana(NOME)).toEqual(['B', 'G', 'R', 'U', 'W']));
  it('CR 614.1c: entra virado', () => expect(entraVirado(NOME)).toBe(true));
  it('pagando {1} quando entra, fica no campo', () => {
    const tg = setup({ battlefield: [['Forest'], []], hand: [[NOME], []] });
    tg.yes('Pagar {1}', true).play(NOME).resolve();
    expect(tg.find(NOME)).not.toBeNull();
    expect(tg.state.objects[tg.bf('Forest')].tapped).toBe(true);
  });
  it('sem pagar, é sacrificado', () => {
    const tg = setup({ battlefield: [['Forest'], []], hand: [[NOME], []] });
    tg.yes('Pagar {1}', false).play(NOME).resolve();
    expect(tg.find(NOME)).toBeNull();
    expect(tg.names(0, 'graveyard')).toEqual([NOME]);
  });
  it('sem mana para pagar, é sacrificado', () => {
    const tg = setup({ battlefield: [[], []], hand: [[NOME], []] });
    // aceita pagar, mas não tem mana: cancela o pagamento
    tg.script.push((d) => (d.kind === 'payment' ? { kind: 'payment', cancel: true } : null));
    tg.yes('Pagar {1}', true).play(NOME).resolve();
    expect(tg.find(NOME)).toBeNull();
  });
});
