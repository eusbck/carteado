import { describe, expect, it } from 'vitest';
import { alternativasDeMana, setup } from '../../testes/padroes.ts';
import { destroy } from '../../motor/api.ts';

const NOME = "Bonders' Enclave";

function podeAtivar(tg: ReturnType<typeof setup>): boolean {
  return tg.actionIds().some((a) => a.startsWith(`act:${tg.bf(NOME)}:`));
}

describe(NOME, () => {
  it('CR 605: mana que produz', () => expect(alternativasDeMana(NOME)).toEqual(['C']));
  it('só ativa com uma criatura de força 4 ou mais', () => {
    expect(podeAtivar(setup({ battlefield: [[NOME, 'Sol Ring', 'Sol Ring', 'Wall of Omens'], []] }))).toBe(false);
    // a criatura de força 4 do oponente não conta
    expect(podeAtivar(setup({ battlefield: [[NOME, 'Sol Ring', 'Sol Ring'], ['Zetalpa, Primal Dawn']] }))).toBe(false);
    expect(podeAtivar(setup({ battlefield: [[NOME, 'Sol Ring', 'Sol Ring', 'Zetalpa, Primal Dawn'], []] }))).toBe(true);
  });
  it('depois de ativada, a condição não é checada de novo', () => {
    const tg = setup({ battlefield: [[NOME, 'Sol Ring', 'Sol Ring', 'Zetalpa, Primal Dawn'], []], library: [['Island'], []] });
    tg.activate(NOME, 'Compre');
    // a criatura sai antes da resolução: ainda compra
    tg.run(destroy(tg.g, [tg.bf('Zetalpa, Primal Dawn')]));
    tg.resolve();
    expect(tg.names(0, 'hand')).toEqual(['Island']);
  });
});
