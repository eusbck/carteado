import { describe, expect, it } from 'vitest';
import { dealDamage } from '../../motor/actions.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Swift Demise';

describe(N, () => {
  it('1 de dano na criatura alvo; depois destrói cada criatura que você não controla que recebeu dano neste turno', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Swamp', 'Indomitable Ancients'], ['Serra Angel', 'Elvish Mystic', 'Wall of Omens']], hand: [[N], []] });
    const fonte = tg.bf('Elvish Mystic');
    dealDamage(tg.g, [
      { source: fonte, target: { kind: 'obj', id: tg.bf('Indomitable Ancients') }, amount: 1, combat: false },
      { source: fonte, target: { kind: 'obj', id: tg.bf('Wall of Omens') }, amount: 1, combat: false },
    ]);
    tg.refresh();
    tg.choose('criatura alvo', ['Serra Angel']).cast(N).resolveAll();
    expect(tg.find('Serra Angel')).toBeNull();
    expect(tg.find('Wall of Omens')).toBeNull();
    expect(tg.find('Elvish Mystic')).not.toBeNull();
    expect(tg.find('Indomitable Ancients')).not.toBeNull();
  });
});