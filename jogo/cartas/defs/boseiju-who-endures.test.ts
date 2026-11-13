import { describe, expect, it } from 'vitest';
import { setup, type TestGame } from '../../testes/harness.ts';
import { alternativasDeMana } from '../../testes/padroes.ts';

const NOME = 'Boseiju, Who Endures';

function podeCanalizar(tg: TestGame): boolean {
  tg.settle();
  return tg.pending?.kind === 'priority' && tg.pending.actions.some((a) => a.id.startsWith('act:') && a.obj === tg.find(NOME, 'hand'));
}

describe(NOME, () => {
  it('CR 605: mana que produz', () => expect(alternativasDeMana(NOME)).toEqual(['G']));
  it('descartar é parte do custo: a carta vai para o cemitério ao ativar', () => {
    const tg = setup({ battlefield: [['Forest', 'Forest'], ['Tundra']], hand: [[NOME], []], library: [[], ['Taiga', 'Island']] });
    tg.yes('procurar', true).choose('tipo básico de terreno', ['Taiga']).activate(NOME, 'Canalizar');
    expect(tg.names(0, 'graveyard')).toEqual([NOME]);
    expect(tg.state.zones.stack.length).toBe(1);
    tg.resolve();
    expect(tg.find('Tundra', 'graveyard', 1)).not.toBeNull();
    // o oponente pega um terreno com tipo básico, mesmo não básico
    expect(tg.find('Taiga', 'battlefield', 1)).not.toBeNull();
  });
  it('custa {1} a menos para cada criatura lendária que você controla', () => {
    const tg = setup({ battlefield: [['Forest', 'Kinnan, Bonder Prodigy'], ['Sol Ring']], hand: [[NOME], []] });
    expect(podeCanalizar(tg)).toBe(true);
    expect(podeCanalizar(setup({ battlefield: [['Forest'], ['Sol Ring']], hand: [[NOME], []] }))).toBe(false);
  });
  it('sem um alvo possível, não pode ativar só para descartar', () => {
    // terreno básico do oponente e artefato seu não servem
    expect(podeCanalizar(setup({ battlefield: [['Forest', 'Forest', 'Sol Ring'], ['Forest']], hand: [[NOME], []] }))).toBe(false);
  });
});
