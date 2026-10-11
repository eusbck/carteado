import { describe, expect, it } from 'vitest';
import { counter, exile } from '../../motor/api.ts';
import { chars } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Virtue of Persistence // Locthwain Scorn';
const pantanos = (n: number) => Array(n).fill('Swamp');
const chaves = (tg: ReturnType<typeof setup>) => tg.actionIds().filter((a) => a.startsWith('cast:')).map((a) => a.split(':').slice(2).join(':')).sort();

describe(N, () => {
  it('CR 715.4 — no cemitério é só uma carta de encantamento de valor de mana 7', () => {
    const tg = setup({ battlefield: [[], []], graveyard: [[N], []] });
    const id = tg.find(N, 'graveyard', 0)!;
    expect(chars(tg.g, id).name).toBe('Virtue of Persistence');
    expect(chars(tg.g, id).types).toEqual(['Enchantment']);
    expect(chars(tg.g, id).manaValue).toBe(7);
  });

  it('CR 715.3b — conjurada como aventura, só as características da aventura', () => {
    const tg = setup({ battlefield: [pantanos(2), ['Elvish Mystic']], hand: [[N], []] });
    // com dois Swamps só a aventura ({1}{B}) pode ser conjurada
    expect(chaves(tg)).toEqual(['hand@1']);
    tg.choose('criatura alvo', ['Elvish Mystic']).cast(N, 'hand@1');
    const magica = tg.state.zones.stack[0];
    expect(chars(tg.g, magica).name).toBe('Locthwain Scorn');
    expect(chars(tg.g, magica).types).toEqual(['Sorcery']);
    expect(chars(tg.g, magica).manaValue).toBe(2);
    tg.resolveAll();
    // -3/-3 mata a 1/1; você ganha 2 de vida
    expect(tg.find('Elvish Mystic')).toBeNull();
    expect(tg.life(0)).toBe(42);
    // CR 715.3d: a carta vai para o exílio, de onde pode ser conjurada como encantamento
    expect(tg.find(N, 'exile')).not.toBeNull();
  });

  it('do exílio, só no tempo de um feitiço', () => {
    const tg = setup({ battlefield: [pantanos(9), ['Elvish Mystic']], hand: [[N], []], graveyard: [[], ['Indomitable Ancients']], library: [Array(10).fill('Forest'), Array(10).fill('Forest')] });
    tg.choose('criatura alvo', ['Elvish Mystic']).cast(N, 'hand@1').resolveAll();
    expect(chaves(tg)).toEqual(['adventure']);
    // no turno do oponente não dá
    tg.passTo('main1', 1);
    tg.pass();
    expect(tg.pending?.player).toBe(0);
    expect(chaves(tg)).toEqual([]);
    tg.passTo('main1', 0);
    tg.cast(N, 'adventure').resolveAll();
    const id = tg.bf(N);
    expect(chars(tg.g, id).name).toBe('Virtue of Persistence');
    expect(tg.all('Swamp').filter((s) => tg.state.objects[s].tapped)).toHaveLength(7);
    // na sua próxima manutenção, põe no campo uma carta de criatura de qualquer cemitério
    tg.choose('carta de criatura alvo', ['Indomitable Ancients']);
    tg.passTo('main1', 1);
    tg.passTo('main1', 0);
    expect(tg.find('Indomitable Ancients', 'battlefield', 0)).not.toBeNull();
  });

  it('CR 715.3d — anulada, vai para o cemitério e não dá para conjurar a carta depois', () => {
    const tg = setup({ battlefield: [pantanos(9), ['Elvish Mystic']], hand: [[N], []] });
    tg.choose('criatura alvo', ['Elvish Mystic']).cast(N, 'hand@1');
    tg.run(counter(tg.g, tg.state.zones.stack[0]));
    tg.settle();
    expect(tg.find(N, 'graveyard', 0)).not.toBeNull();
    expect(chaves(tg)).toEqual([]);
  });

  it('exilada de outro jeito, não dá permissão de conjurar', () => {
    const tg = setup({ battlefield: [pantanos(9), []], hand: [[N], []] });
    tg.run(exile(tg.g, [tg.find(N, 'hand', 0)!]));
    expect(tg.find(N, 'exile')).not.toBeNull();
    expect(chaves(tg)).toEqual([]);
  });

  it('da mão também pode ser conjurada direto como encantamento', () => {
    const tg = setup({ battlefield: [pantanos(7), []], hand: [[N], []] });
    tg.cast(N, 'hand').resolveAll();
    expect(chars(tg.g, tg.bf(N)).types).toEqual(['Enchantment']);
  });
});
