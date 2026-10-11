import { describe, expect, it } from 'vitest';
import { setup, type TestGame } from '../../testes/harness.ts';
import { alternativasDeMana } from '../../testes/padroes.ts';

const NOME = 'Otawara, Soaring City';

function podeCanalizar(tg: TestGame): boolean {
  tg.settle();
  return tg.pending?.kind === 'priority' && tg.pending.actions.some((a) => a.id.startsWith('act:') && a.obj === tg.find(NOME, 'hand'));
}

describe(NOME, () => {
  it('CR 605: mana que produz', () => expect(alternativasDeMana(NOME)).toEqual(['U']));
  it('descartar é parte do custo: a carta vai para o cemitério ao ativar', () => {
    const tg = setup({ battlefield: [['Island', 'Island', 'Island', 'Island'], ['Zetalpa, Primal Dawn']], hand: [[NOME], []] });
    tg.choose('alvo', ['Zetalpa, Primal Dawn']).activate(NOME, 'Canalizar');
    expect(tg.names(0, 'graveyard')).toEqual([NOME]);
    expect(tg.state.zones.stack.length).toBe(1);
    tg.resolve();
    expect(tg.names(1, 'hand')).toEqual(['Zetalpa, Primal Dawn']);
  });
  it('custa {1} a menos para cada criatura lendária que você controla (só genérico)', () => {
    // duas lendárias: {1}{U} bastam
    const tg = setup({ battlefield: [['Island', 'Island', 'Gau, Feral Youth', 'Breena, the Demagogue'], ['Sol Ring']], hand: [[NOME], []] });
    expect(podeCanalizar(tg)).toBe(true);
    tg.choose('alvo', ['Sol Ring']).activate(NOME, 'Canalizar').resolve();
    expect(tg.names(1, 'hand')).toEqual(['Sol Ring']);
    // a lendária do oponente não conta
    expect(podeCanalizar(setup({ battlefield: [['Island', 'Island'], ['Gau, Feral Youth', 'Breena, the Demagogue']], hand: [[NOME], []] }))).toBe(false);
  });
  it('sem um alvo possível, não pode ativar só para descartar', () => {
    expect(podeCanalizar(setup({ battlefield: [['Island', 'Island', 'Island', 'Island'], ['Forest']], hand: [[NOME], []] }))).toBe(false);
  });
});
