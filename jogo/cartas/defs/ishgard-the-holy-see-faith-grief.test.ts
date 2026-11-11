import { describe, expect, it } from 'vitest';
import { chars, exile, manaValue } from '../../motor/api.ts';
import { activateMana, fixture as setup, runEffect } from '../../testes/artefatos.ts';

const N = 'Ishgard, the Holy See // Faith & Grief';
const planicies = (n: number) => Array(n).fill('Plains');
type TG = ReturnType<typeof setup>;
const jogarIds = (tg: TG, id: number) => tg.actionIds().filter((a) => a.startsWith('play:') && a.split(':')[1] === String(id));
const conjurarIds = (tg: TG, id: number) => tg.actionIds().filter((a) => a.startsWith('cast:') && a.split(':')[1] === String(id));

describe(N, () => {
  it('fora da pilha é um terreno incolor de valor de mana 0, e da mão se joga como terreno (não se conjura)', () => {
    const tg = setup({ battlefield: [[], []], hand: [[N], []] });
    const id = tg.find(N, 'hand', 0)!;
    const c = chars(tg.g, id);
    expect(c.types).toEqual(['Land']);
    expect(c.subtypes).toEqual(['Town']);
    expect(c.colors).toEqual([]);
    expect(manaValue(tg.g, id)).toBe(0);
    // sem mana para a aventura, nenhuma ação de conjurar; a de jogar existe
    expect(conjurarIds(tg, id)).toEqual([]);
    expect(jogarIds(tg, id)).toHaveLength(1);
    tg.play(N);
    const terreno = tg.bf(N);
    expect(tg.state.objects[terreno].tapped).toBe(true);
    tg.passTo('main1', 1).passTo('main1', 0);
    activateMana(tg, 'Ishgard, the Holy See', 'W');
    expect(tg.state.players[0].manaPool.map((m) => m.type)).toEqual(['W']);
    expect(tg.state.objects[terreno].tapped).toBe(true);
  });

  it('conjurada como aventura, é um feitiço branco de valor de mana 5', () => {
    const tg = setup({ battlefield: [[...planicies(5)], []], hand: [[N], []], graveyard: [['Sol Ring', 'Smothering Tithe', 'Island'], []] });
    const id = tg.find(N, 'hand', 0)!;
    // só a aventura se conjura; a face de terreno, não
    expect(conjurarIds(tg, id).map((a) => a.split(':')[2])).toEqual(['hand@1']);
    tg.choose('artefato ou encantamento', ['Sol Ring', 'Smothering Tithe']).cast(N, 'hand@1');
    const pilha = tg.state.zones.stack;
    const sp = pilha[pilha.length - 1];
    const c = chars(tg.g, sp);
    expect(c.name).toBe('Faith & Grief');
    expect(c.types).toEqual(['Sorcery']);
    expect(c.colors).toEqual(['W']);
    expect(manaValue(tg.g, sp)).toBe(5);
    tg.resolve();
    expect(tg.names(0, 'hand').sort()).toEqual(['Smothering Tithe', 'Sol Ring']);
    expect(tg.names(0, 'graveyard')).toEqual(['Island']);
    expect(tg.find(N, 'exile')).not.toBeNull();
  });

  it('do exílio, o terreno só se joga na sua fase principal, com a pilha vazia e com uma jogada de terreno sobrando', () => {
    const tg = setup({ battlefield: [[...planicies(5)], []], hand: [[N, 'Plains'], []], graveyard: [['Sol Ring'], []] });
    tg.choose('artefato ou encantamento', ['Sol Ring']).cast(N, 'hand@1').resolve();
    const ex = tg.find(N, 'exile')!;
    // não se conjura do exílio: a face principal é terreno
    expect(conjurarIds(tg, ex)).toEqual([]);
    expect(jogarIds(tg, ex)).toHaveLength(1);
    // com a jogada de terreno gasta, não dá
    tg.play('Plains');
    expect(jogarIds(tg, ex)).toEqual([]);
    // no turno do oponente, também não
    tg.passTo('main1', 1);
    tg.pass();
    expect(tg.pending?.player).toBe(0);
    expect(jogarIds(tg, ex)).toEqual([]);
    // na sua próxima fase principal, sim; entra virado
    tg.passTo('main1', 0);
    expect(jogarIds(tg, ex)).toHaveLength(1);
    tg.answer({ kind: 'priority', action: jogarIds(tg, ex)[0] });
    tg.settle();
    const t = tg.bf(N);
    expect(tg.state.objects[t].tapped).toBe(true);
    expect(tg.state.turn.landsPlayed).toBe(1);
  });

  it('anulada, vai para o cemitério e não dá para jogar o terreno do exílio', () => {
    const tg = setup({ battlefield: [[...planicies(5)], ['Island', 'Island']], hand: [[N], ['Counterspell']], graveyard: [['Sol Ring'], []] });
    tg.choose('artefato ou encantamento', ['Sol Ring']).cast(N, 'hand@1').pass();
    tg.choose('mágica alvo', ['Faith & Grief']).cast('Counterspell').resolveAll();
    expect(tg.find(N, 'graveyard')).not.toBeNull();
    expect(tg.find(N, 'exile')).toBeNull();
    expect(tg.names(0, 'hand')).toEqual([]);
  });

  it('exilada de outro jeito, não dá permissão de jogar o terreno', () => {
    const tg = setup({ battlefield: [[], []], hand: [[N], []] });
    runEffect(tg, exile(tg.g, [tg.find(N, 'hand', 0)!]));
    const ex = tg.find(N, 'exile')!;
    expect(jogarIds(tg, ex)).toEqual([]);
    expect(conjurarIds(tg, ex)).toEqual([]);
  });
});
