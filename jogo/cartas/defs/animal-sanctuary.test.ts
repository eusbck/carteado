import { describe, expect, it } from 'vitest';
import { alternativasDeMana, setup } from '../../testes/padroes.ts';

const NOME = 'Animal Sanctuary';

describe(NOME, () => {
  it('CR 605: mana que produz', () => expect(alternativasDeMana(NOME)).toEqual(['C']));
  it('{2}, {T}: marcador +1/+1 no Bird, Cat, Dog, Goat, Ox ou Snake alvo (de qualquer jogador)', () => {
    const tg = setup({ battlefield: [[NOME, 'Sol Ring', 'Wall of Omens', 'Hardened Academic'], ['Sakura-Tribe Elder']] });
    let alvos: string[] = [];
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('Bird, Cat, Dog, Goat, Ox ou Snake alvo')) return null;
      alvos = d.items.filter((i) => !i.disabled).map((i) => i.label).sort();
      return { kind: 'select', ids: [d.items.find((i) => i.label === 'Sakura-Tribe Elder')!.id] };
    });
    tg.activate(NOME, 'marcador').resolve();
    // Wall of Omens (Wall) não pode ser alvo; Hardened Academic é Bird, Sakura-Tribe Elder é Snake
    expect(alvos).toEqual(['Hardened Academic', 'Sakura-Tribe Elder']);
    expect(tg.state.objects[tg.bf('Sakura-Tribe Elder')].counters['+1/+1']).toBe(1);
  });
});
