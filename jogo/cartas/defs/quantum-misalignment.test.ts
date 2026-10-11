import { describe, expect, it } from 'vitest';
import { chars } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Quantum Misalignment';
const L = 'Lathliss, Dragon Queen';
const ilhas = Array(5).fill('Island');
const forests = Array(10).fill('Forest');

describe(N, () => {
  it('a ficha copia o que está impresso, sem marcadores, e não é lendária', () => {
    const tg = setup({ battlefield: [[...ilhas, { name: L, counters: { '+1/+1': 2 } }], ['Indomitable Ancients']], hand: [[N], []], library: [forests, forests] });
    let alvos: string[] = [];
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('que você controla')) return null;
      alvos = d.items.filter((i) => !i.disabled).map((i) => i.label);
      return { kind: 'select', ids: [d.items.find((i) => i.label === L)!.id] };
    });
    tg.cast(N).resolveAll();
    expect(alvos).toEqual([L]);
    const copias = tg.all(L);
    expect(copias).toHaveLength(2);
    const ficha = copias.find((id) => tg.state.objects[id].isToken)!;
    expect(tg.pt(ficha)).toEqual([6, 6]);
    expect(chars(tg.g, ficha).supertypes).not.toContain('Legendary');
    expect(chars(tg.g, ficha).subtypes).toContain('Dragon');
    // a original continua lendária e as duas ficam no campo (a regra da lenda não se aplica à ficha)
    const original = copias.find((id) => !tg.state.objects[id].isToken)!;
    expect(chars(tg.g, original).supertypes).toContain('Legendary');
    expect(tg.pt(original)).toEqual([8, 8]);
  });

  it('as habilidades de entrar da criatura copiada disparam para a ficha', () => {
    // Rapacious Dragon: quando entra, crie duas fichas de Treasure
    const tg = setup({ battlefield: [[...ilhas, 'Rapacious Dragon'], []], hand: [[N], []], library: [forests, forests] });
    tg.choose('que você controla', ['Rapacious Dragon']).cast(N).resolveAll();
    expect(tg.all('Rapacious Dragon')).toHaveLength(2);
    expect(tg.all('Treasure')).toHaveLength(2);
  });

  it('CR 702.88a: ricochete — na sua próxima manutenção cria outra cópia sem pagar', () => {
    const tg = setup({ battlefield: [[...ilhas, 'Indomitable Ancients'], []], hand: [[N], []], library: [forests, forests] });
    tg.choose('que você controla', ['Indomitable Ancients']).cast(N).resolveAll();
    expect(tg.find(N, 'exile')).not.toBeNull();
    tg.yes('Ricochete', true).choose('que você controla', ['Indomitable Ancients']);
    tg.passTo('upkeep', 0);
    tg.resolveAll();
    expect(tg.all('Indomitable Ancients')).toHaveLength(3);
    expect(tg.find(N, 'graveyard', 0)).not.toBeNull();
  });
});
