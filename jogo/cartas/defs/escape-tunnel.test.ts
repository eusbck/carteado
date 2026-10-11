import { describe, expect, it } from 'vitest';
import { setup, type TestGame } from '../../testes/harness.ts';
import { untilEndOfTurn } from '../../motor/api.ts';

const NOME = 'Escape Tunnel';

/** ataca o jogador 1 com a criatura e devolve se ela podia ser bloqueada */
function podeSerBloqueada(tg: TestGame, criatura: string): boolean {
  const id = tg.bf(criatura);
  let pode = false;
  tg.script.push((d) => (d.kind === 'blockers' ? (pode = d.candidates.some((x) => x.canBlock.includes(id)), { kind: 'blockers', blocks: [] }) : null));
  tg.attack([[criatura, 1]]).passTo('main2');
  return pode;
}

function maisDois(tg: TestGame, nome: string): void {
  const id = tg.bf(nome);
  untilEndOfTurn({ g: tg.g, you: 1, source: tg.bf('Indomitable Ancients') }, [id], [{ k: 'pt', p: 2, t: 0 }]);
  tg.refresh();
}

describe(NOME, () => {
  it('{T}, sacrifique: busca um terreno básico para o campo, virado', () => {
    const tg = setup({ battlefield: [[NOME], []], library: [['Island', 'Sol Ring'], []] });
    tg.choose('terreno básico', ['Island']).activate(NOME, 'Procure').resolve();
    expect(tg.find(NOME)).toBeNull();
    expect(tg.state.objects[tg.bf('Island')].tapped).toBe(true);
  });
  it('{T}, sacrifique: a criatura alvo com força 2 ou menos não pode ser bloqueada neste turno', () => {
    const tg = setup({ step: 'beginCombat', battlefield: [[NOME, 'Elvish Mystic', 'Zetalpa, Primal Dawn'], ['Indomitable Ancients']] });
    let alvos: string[] = [];
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('força 2 ou menos')) return null;
      alvos = d.items.filter((i) => !i.disabled).map((i) => i.label).sort();
      return { kind: 'select', ids: [d.items.find((i) => i.label === 'Elvish Mystic')!.id] };
    });
    tg.activate(NOME, 'bloqueada').resolve();
    expect(alvos).toEqual(['Elvish Mystic', 'Indomitable Ancients']);
    expect(podeSerBloqueada(tg, 'Elvish Mystic')).toBe(false);
    expect(tg.life(1)).toBe(39);
  });
  it('CR 608.2b: com força 3 ou mais antes de resolver, não resolve; depois de resolver, continua imbloqueável', () => {
    const antes = setup({ step: 'beginCombat', battlefield: [[NOME, 'Elvish Mystic'], ['Indomitable Ancients']] });
    antes.choose('força 2 ou menos', ['Elvish Mystic']).activate(NOME, 'bloqueada');
    maisDois(antes, 'Elvish Mystic');
    antes.resolve();
    expect(podeSerBloqueada(antes, 'Elvish Mystic')).toBe(true);

    const depois = setup({ step: 'beginCombat', battlefield: [[NOME, 'Elvish Mystic'], ['Indomitable Ancients']] });
    depois.choose('força 2 ou menos', ['Elvish Mystic']).activate(NOME, 'bloqueada').resolve();
    maisDois(depois, 'Elvish Mystic');
    expect(podeSerBloqueada(depois, 'Elvish Mystic')).toBe(false);
    expect(depois.life(1)).toBe(37);
  });
});
