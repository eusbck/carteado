import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { alternativasDeMana, entraVirado } from '../../testes/padroes.ts';
import { manaOptions } from '../../motor/costs.ts';
import { hasKw } from '../../motor/chars.ts';

const NOME = 'Hidden Hideout';

describe(NOME, () => {
  it('CR 614.1c: entra virado', () => expect(entraVirado(NOME)).toBe(true));
  it('CR 903.4f: uma mana de uma cor da identidade do comandante', () => {
    const tg = setup({ battlefield: [[NOME], []], command: [['Breena, the Demagogue'], []] });
    const id = tg.bf(NOME);
    expect([...new Set(manaOptions(tg.g, 0).filter((o) => o.obj === id).map((o) => o.alt.join('')))].sort()).toEqual(['B', 'W']);
  });
  it('sem comandante, não produz mana', () => expect(alternativasDeMana(NOME)).toEqual([]));
  it('{2}, {T}: a criatura alvo sua com um marcador ganha vínculo com a vida até o fim do turno', () => {
    const tg = setup({ battlefield: [[NOME, 'Sol Ring', { name: 'Elvish Mystic', counters: { '+1/+1': 1 } }, 'Wall of Omens'], [{ name: 'Sakura-Tribe Elder', counters: { '+1/+1': 1 } }]] });
    let alvos: string[] = [];
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('com um marcador')) return null;
      alvos = d.items.filter((i) => !i.disabled).map((i) => i.label);
      return { kind: 'select', ids: [d.items.find((i) => i.label === 'Elvish Mystic')!.id] };
    });
    tg.activate(NOME, 'vínculo').resolve();
    // Wall of Omens não tem marcador; a criatura do oponente não é sua
    expect(alvos).toEqual(['Elvish Mystic']);
    const elfo = tg.bf('Elvish Mystic');
    expect(hasKw(tg.g, elfo, 'lifelink')).toBe(true);
    tg.passTo('upkeep', 1);
    expect(hasKw(tg.g, elfo, 'lifelink')).toBe(false);
  });
});
