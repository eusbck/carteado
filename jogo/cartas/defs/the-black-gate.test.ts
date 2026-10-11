import { describe, expect, it } from 'vitest';
import { alternativasDeMana, setup } from '../../testes/padroes.ts';
import { createTokens } from '../../motor/api.ts';
import type { TestGame } from '../../testes/harness.ts';

const NOME = 'The Black Gate';

function jogar(paga: boolean, vida = 40) {
  const tg = setup({ battlefield: [[], []], hand: [[NOME], []], life: vida });
  let perguntou = false;
  tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('pagar 3 de vida') ? (perguntou = true, { kind: 'select', ids: [paga ? 'yes' : 'no'] }) : null));
  tg.play(NOME);
  return { tg, perguntou, virado: tg.state.objects[tg.bf(NOME)].tapped };
}

/** ataca `defensor` com a criatura e devolve quem podia bloqueá-la */
function bloqueadoras(tg: TestGame, atacante: string, defensor: number): string[] {
  let podem: string[] = [];
  const id = tg.bf(atacante);
  tg.script.push((d) => {
    if (d.kind !== 'blockers') return null;
    podem = d.candidates.filter((x) => x.canBlock.includes(id)).map((x) => tg.state.objects[x.obj].def).sort();
    return { kind: 'blockers', blocks: [] };
  });
  tg.attack([[atacante, defensor]]).passTo('combatDamage');
  return podem;
}

describe(NOME, () => {
  it('CR 605: mana que produz', () => expect(alternativasDeMana(NOME)).toEqual(['B']));
  it('pagando 3 de vida, entra desvirado', () => {
    const { tg, virado } = jogar(true);
    expect(virado).toBe(false);
    expect(tg.life(0)).toBe(37);
  });
  it('sem pagar, entra virado', () => {
    const { tg, virado } = jogar(false);
    expect(virado).toBe(true);
    expect(tg.life(0)).toBe(40);
  });
  it('CR 119.4: com menos de 3 de vida não pode pagar', () => {
    const { tg, virado, perguntou } = jogar(true, 2);
    expect(perguntou).toBe(false);
    expect(virado).toBe(true);
    expect(tg.life(0)).toBe(2);
  });
  it('a criatura alvo não pode ser bloqueada pelas criaturas do jogador com mais vida', () => {
    const tg = setup({ players: 3, battlefield: [[NOME, 'Swamp', 'Elvish Mystic'], ['Indomitable Ancients', 'Viscera Seer'], ['Wall of Omens']] });
    tg.state.players[1].life = 45;
    tg.choose('criatura alvo', ['Elvish Mystic']).activate(NOME, 'Escolha um jogador').resolve();
    expect(bloqueadoras(tg, 'Elvish Mystic', 1)).toEqual([]);
  });
  it('o jogador é escolhido na resolução; mudar a vida depois não muda o efeito', () => {
    const tg = setup({ battlefield: [[NOME, 'Swamp', 'Elvish Mystic'], ['Indomitable Ancients']] });
    let opcoes: string[] = [];
    tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('jogador com mais vida') ? (opcoes = d.items.map((i) => i.label), null) : null));
    tg.choose('jogador com mais vida', ['Bruno']);
    tg.state.players[1].life = 45; // ao ativar, Bruno é o único com mais vida
    tg.choose('criatura alvo', ['Elvish Mystic']).activate(NOME, 'Escolha um jogador');
    tg.state.players[1].life = 40; // antes de resolver, empata com Ana: a escolha usa as vidas da resolução
    tg.resolve();
    expect(opcoes).toEqual(['Ana', 'Bruno']);
    tg.state.players[1].life = 10; // depois de resolver, Bruno perde vida
    expect(bloqueadoras(tg, 'Elvish Mystic', 1)).toEqual([]);
  });
  it('vale também contra criaturas que o jogador escolhido põe no campo depois', () => {
    const tg = setup({ battlefield: [[NOME, 'Swamp', 'Elvish Mystic'], []] });
    tg.state.players[1].life = 45;
    tg.choose('criatura alvo', ['Elvish Mystic']).activate(NOME, 'Escolha um jogador').resolve();
    tg.run(createTokens(tg.g, 1, 'Scarecrow', 1));
    expect(bloqueadoras(tg, 'Elvish Mystic', 1)).toEqual([]);
  });
  it('sem o efeito, as criaturas bloqueiam normalmente', () => {
    const tg = setup({ battlefield: [[NOME, 'Swamp', 'Elvish Mystic'], ['Indomitable Ancients']] });
    expect(bloqueadoras(tg, 'Elvish Mystic', 1)).toEqual(['Indomitable Ancients']);
  });
});
