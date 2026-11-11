import { describe, expect, it } from 'vitest';
import { chars } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Ishgard, the Holy See // Faith & Grief';
const planicies = (n: number) => Array(n).fill('Plains');
const acoes = (tg: ReturnType<typeof setup>) => tg.actionIds()
  .filter((a) => (a.startsWith('cast:') || a.startsWith('play:')) && tg.state.objects[Number(a.split(':')[1])]?.def === N)
  .map((a) => a.split(':').slice(2).join(':')).sort();

describe(N, () => {
  it('CR 715.4 — no cemitério e na mão é só um terreno de valor de mana 0', () => {
    const tg = setup({ battlefield: [[], []], graveyard: [[N], []] });
    const id = tg.find(N, 'graveyard', 0)!;
    expect(chars(tg.g, id).name).toBe('Ishgard, the Holy See');
    expect(chars(tg.g, id).types).toEqual(['Land']);
    expect(chars(tg.g, id).manaValue).toBe(0);
  });

  it('Town é um tipo de terreno sem regras próprias (CR 205.3i)', () => {
    const tg = setup({ battlefield: [[N], []] });
    expect(chars(tg.g, tg.bf(N)).subtypes).toEqual(['Town']);
  });

  it('da mão: jogar como terreno (entra virado, {T}: {W}) ou conjurar a aventura; o terreno nunca é conjurado', () => {
    const tg = setup({ battlefield: [planicies(5), []], hand: [[N], []] });
    expect(acoes(tg)).toEqual(['hand', 'hand@1']);
    expect(tg.actionIds().filter((a) => a.startsWith('cast:')).map((a) => a.split(':').slice(2).join(':'))).toEqual(['hand@1']);
    tg.play(N);
    expect(tg.state.objects[tg.bf(N)].tapped).toBe(true);
  });

  it('CR 715.3b — conjurada como aventura, só as características da aventura', () => {
    const tg = setup({ battlefield: [planicies(5), []], hand: [[N], []], graveyard: [['Sol Ring', 'Ethereal Armor', 'Lightning Greaves', 'Wall of Omens'], []] });
    tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('até duas cartas de artefato') ? { kind: 'select', ids: d.items.filter((i) => ['Sol Ring', 'Ethereal Armor'].includes(i.label)).map((i) => i.id) } : null));
    tg.cast(N, 'hand@1');
    const magica = tg.state.zones.stack[0];
    expect(chars(tg.g, magica).name).toBe('Faith & Grief');
    expect(chars(tg.g, magica).types).toEqual(['Sorcery']);
    expect(chars(tg.g, magica).manaValue).toBe(5);
    tg.resolveAll();
    expect(tg.names(0, 'hand').sort()).toEqual(['Ethereal Armor', 'Sol Ring']);
    expect(tg.find(N, 'exile')).not.toBeNull();
  });

  it('CR 715.3d — resolvida, vai para o exílio e o terreno pode ser jogado de lá', () => {
    const tg = setup({ battlefield: [planicies(5), []], hand: [[N], []], graveyard: [['Sol Ring'], []] });
    tg.cast(N, 'hand@1').resolveAll();
    expect(acoes(tg)).toEqual(['adventure']);
    tg.play(N);
    expect(tg.find(N, 'battlefield', 0)).not.toBeNull();
    expect(tg.state.turn.landsPlayed).toBe(1);
  });

  it('do exílio, só como a jogada de terreno do turno, na sua fase principal', () => {
    const tg = setup({ battlefield: [planicies(5), []], hand: [[N, 'Plains'], []], graveyard: [['Sol Ring'], []] });
    tg.cast(N, 'hand@1').resolveAll();
    tg.play('Plains');
    expect(acoes(tg)).toEqual([]);
    tg.passTo('main1', 1);
    tg.pass();
    expect(tg.pending?.player).toBe(0);
    expect(acoes(tg)).toEqual([]);
    tg.passTo('main1', 0);
    expect(acoes(tg)).toEqual(['adventure']);
  });
});
