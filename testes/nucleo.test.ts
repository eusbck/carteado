import { describe, expect, it } from 'vitest';
import { setup, P } from './harness.ts';

describe('prioridade e pilha', () => {
  it('CR 117.3c: quem conjura recebe a prioridade de novo', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp'], ['Grizzly']].map((x) => x.filter((n) => n !== 'Grizzly')), hand: [["Night's Whisper"]] });
    tg.cast("Night's Whisper");
    expect(tg.pending?.kind).toBe('priority');
    expect(tg.pending?.player).toBe(0);
    expect(tg.state.zones.stack.length).toBe(1);
  });

  it('CR 117.4: com todos passando, resolve só o topo da pilha', () => {
    const tg = setup({
      battlefield: [['Swamp', 'Swamp', 'Swamp', 'Swamp'], ['Island', 'Island']],
      hand: [["Night's Whisper"], ['Counterspell']],
      library: [['Plains', 'Plains', 'Plains'], []],
    });
    tg.cast("Night's Whisper");
    tg.pass(); // Ana passa
    // Bruno responde com Counterspell
    tg.choose('mágica alvo', ["Night's Whisper"]).cast('Counterspell');
    expect(tg.state.zones.stack.length).toBe(2);
    tg.resolve(); // resolve Counterspell
    expect(tg.state.zones.stack.length).toBe(0);
    expect(tg.names(0, 'graveyard')).toContain("Night's Whisper"); // CR 701.6a
    expect(tg.state.zones.hand[0].length).toBe(0); // não comprou
    expect(tg.life(0)).toBe(40);
  });

  it('CR 608.2b: mágica com todos os alvos ilegais não resolve', () => {
    const tg = setup({
      battlefield: [['Swamp', 'Swamp', 'Swamp', 'Swamp'], ['Indomitable Ancients', 'Swamp', 'Swamp']],
      hand: [['Infernal Grasp'], ['Infernal Grasp']],
    });
    tg.choose('criatura alvo', ['Indomitable Ancients']).cast('Infernal Grasp');
    tg.pass();
    // Bruno destrói a própria criatura em resposta
    tg.choose('criatura alvo', ['Indomitable Ancients']).cast('Infernal Grasp');
    tg.resolve();
    expect(tg.find('Indomitable Ancients')).toBeNull();
    tg.resolve();
    // a de Ana não resolve: Ana não perde 2 de vida
    expect(tg.life(0)).toBe(40);
    expect(tg.life(1)).toBe(38);
  });
});

describe('terrenos e mana', () => {
  it('CR 305.2: só um terreno por turno', () => {
    const tg = setup({ hand: [['Forest', 'Forest'], []] });
    tg.play('Forest');
    expect(tg.actionIds().some((a) => a.startsWith('play:'))).toBe(false);
  });

  it('CR 305.1: terreno só na fase principal com a pilha vazia', () => {
    const tg = setup({ step: 'upkeep', hand: [['Forest'], []] });
    expect(tg.actionIds().some((a) => a.startsWith('play:'))).toBe(false);
  });

  it('CR 106.1, 601.2h: Sol Ring paga custo genérico; cor faltando impede conjurar', () => {
    const tg = setup({ battlefield: [['Sol Ring'], []], hand: [['Infernal Grasp'], []] });
    expect(tg.canCast('Infernal Grasp')).toBe(false);
  });

  it('CR 903.4: Command Tower produz cores da identidade do comandante', () => {
    const tg = setup({ battlefield: [['Command Tower'], ['Indomitable Ancients']], command: [['Felothar the Steadfast'], []], hand: [['Swords to Plowshares'], []] });
    expect(tg.canCast('Swords to Plowshares')).toBe(true);
  });
});

describe('ações baseadas em estado', () => {
  it('CR 704.5g: dano letal destrói; 702.12b indestrutível sobrevive', () => {
    const tg = setup({
      battlefield: [['Mountain', 'Mountain'], ['Wall of Omens', 'Zetalpa, Primal Dawn']],
      hand: [['Abrade', 'Abrade'], []],
    });
    tg.choose('modo', ['Causa 3 de dano à criatura alvo']).choose('criatura alvo', ['Zetalpa, Primal Dawn']).cast('Abrade');
    tg.resolve();
    expect(tg.find('Zetalpa, Primal Dawn')).not.toBeNull();
  });

  it('CR 704.5a: vida 0 perde; 104.2a o último que resta vence', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp'], []], hand: [["Night's Whisper"], []], library: [['Swamp', 'Swamp'], []], life: 2 });
    tg.cast("Night's Whisper").resolve();
    expect(tg.state.players[0].lost).toBe(true);
    expect(tg.state.gameOver?.winners).toEqual([1]);
  });
});

describe('gatilhos', () => {
  it('CR 603.10a: Blood Artist vê a própria morte e a das outras no mesmo evento', () => {
    const tg = setup({
      battlefield: [['Blood Artist', 'Wall of Omens'], []],
      hand: [[], []],
    });
    // destrói as duas ao mesmo tempo via ação de estado: dá 0 de resistência com -X? usamos dano letal direto
    const g = tg.g;
    for (const name of ['Blood Artist', 'Wall of Omens']) g.state.objects[tg.bf(name)].damage = 10;
    g.bump();
    tg.choose('jogador alvo', ['Bruno']).choose('jogador alvo', ['Bruno']);
    tg.pass();
    tg.resolveAll();
    expect(tg.life(1)).toBe(38);
    expect(tg.life(0)).toBe(42);
  });

  it('CR 101.4: Fleshbag Marauder — cada jogador sacrifica uma criatura', () => {
    const tg = setup({
      battlefield: [['Swamp', 'Swamp', 'Swamp', 'Wall of Omens'], ['Indomitable Ancients']],
      hand: [['Fleshbag Marauder'], []],
    });
    tg.cast('Fleshbag Marauder').resolve();
    tg.choose('Sacrifique', ['Wall of Omens']);
    tg.resolve();
    expect(tg.find('Indomitable Ancients')).toBeNull();
    expect(tg.find('Wall of Omens')).toBeNull();
    expect(tg.find('Fleshbag Marauder')).not.toBeNull();
  });
});

describe('combate', () => {
  it('CR 510.1b: criatura não bloqueada causa dano ao jogador atacado', () => {
    const tg = setup({ step: 'beginCombat', battlefield: [['Zetalpa, Primal Dawn'], []] });
    tg.attack([['Zetalpa, Primal Dawn', 1]]);
    tg.passTo('main2');
    expect(tg.life(1)).toBe(32); // golpe duplo: 4 + 4
  });

  it('CR 903.10a, 704.6c: 21 de dano de combate do mesmo comandante derrota', () => {
    const tg = setup({ step: 'beginCombat', battlefield: [[{ name: 'Zetalpa, Primal Dawn', commander: true }], []] });
    tg.state.players[1].commanderDamage[String(tg.state.objects[tg.bf('Zetalpa, Primal Dawn')].card)] = 14;
    tg.attack([['Zetalpa, Primal Dawn', 1]]);
    tg.passTo('main2');
    expect(tg.state.players[1].lost).toBe(true);
  });

  it('CR 302.6: criatura que acabou de entrar não ataca', () => {
    const tg = setup({ step: 'beginCombat', battlefield: [[{ name: 'Indomitable Ancients', ready: false }], []] });
    tg.pass();
    expect(tg.pending?.kind).toBe('priority');
    expect(tg.state.turn.step).not.toBe('declareBlockers');
  });

  it('CR 702.9b: voar só é bloqueado por voar/alcance', () => {
    const tg = setup({ step: 'beginCombat', battlefield: [['Zetalpa, Primal Dawn'], ['Indomitable Ancients']] });
    tg.attack([['Zetalpa, Primal Dawn', 1]]);
    tg.pass();
    tg.settle();
    // Bruno não tem bloqueadores possíveis: não há decisão de bloqueio
    expect(tg.pending?.kind).toBe('priority');
  });
});

void P;
