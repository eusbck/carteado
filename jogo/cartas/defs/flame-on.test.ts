import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Flame On!';
const montanhas = Array(5).fill('Mountain');
const forests = Array(10).fill('Forest');

describe(N, () => {
  it('põe X marcadores +1/+1 (cartas que não são criatura nem terreno no seu cemitério) e dá voar até o fim do turno', () => {
    const tg = setup({
      battlefield: [[...montanhas, 'Indomitable Ancients'], []], hand: [[N], []],
      graveyard: [['Sol Ring', 'Breath Weapon', 'Elvish Mystic', 'Island'], ['Sol Ring']], library: [forests, forests],
    });
    tg.choose('criatura alvo', ['Indomitable Ancients']).cast(N).resolveAll();
    const id = tg.bf('Indomitable Ancients');
    // Sol Ring e Breath Weapon contam; a criatura, o terreno e o cemitério do oponente não
    expect(tg.state.objects[id].counters['+1/+1']).toBe(2);
    expect(hasKw(tg.g, id, 'flying')).toBe(true);
    tg.passTo('upkeep', 1);
    expect(hasKw(tg.g, id, 'flying')).toBe(false);
    expect(tg.state.objects[id].counters['+1/+1']).toBe(2);
  });

  it('com o cemitério sem cartas que contem, só dá voar', () => {
    const tg = setup({ battlefield: [[...montanhas, 'Indomitable Ancients'], []], hand: [[N], []], library: [forests, forests] });
    tg.choose('criatura alvo', ['Indomitable Ancients']).cast(N).resolveAll();
    expect(tg.state.objects[tg.bf('Indomitable Ancients')].counters['+1/+1'] ?? 0).toBe(0);
    expect(hasKw(tg.g, tg.bf('Indomitable Ancients'), 'flying')).toBe(true);
  });

  it('CR 702.88a: ricochete — na sua próxima manutenção, conjura do exílio sem pagar', () => {
    const tg = setup({ battlefield: [[...montanhas, 'Indomitable Ancients'], []], hand: [[N], []], graveyard: [['Sol Ring'], []], library: [forests, forests] });
    tg.choose('criatura alvo', ['Indomitable Ancients']).cast(N).resolveAll();
    expect(tg.find(N, 'exile')).not.toBeNull();
    tg.yes('Ricochete', true).choose('criatura alvo', ['Indomitable Ancients']);
    tg.passTo('upkeep', 0);
    tg.resolveAll();
    // um marcador de cada vez (só o Sol Ring no cemitério)
    expect(tg.state.objects[tg.bf('Indomitable Ancients')].counters['+1/+1']).toBe(2);
    expect(tg.find(N, 'graveyard', 0)).not.toBeNull();
    expect(tg.all('Mountain').every((m) => !tg.state.objects[m].tapped)).toBe(true);
  });
});
