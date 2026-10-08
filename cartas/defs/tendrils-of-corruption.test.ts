import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { destroy } from '../../motor/api.ts';

const NOME = 'Tendrils of Corruption';

describe(NOME, () => {
  it('causa X de dano à criatura alvo e você ganha X, X = Swamps que você controla (inclusive não básicos)', () => {
    const tg = setup({
      battlefield: [['Swamp', 'Swamp', 'Swamp', "Witch's Cottage", 'Island'], ['Swamp', 'Indomitable Ancients']],
      hand: [[NOME], []],
    });
    tg.choose('criatura alvo', ['Indomitable Ancients']).cast(NOME).resolve();
    expect(tg.state.objects[tg.bf('Indomitable Ancients')].damage).toBe(4);
    expect(tg.life(0)).toBe(44);
  });

  it('com o alvo ilegal, não resolve e você não ganha vida', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Swamp', 'Swamp'], ['Hateful Eidolon']], hand: [[NOME], []] });
    tg.choose('criatura alvo', ['Hateful Eidolon']).cast(NOME);
    tg.run(destroy(tg.g, [tg.bf('Hateful Eidolon')]));
    tg.resolve();
    expect(tg.life(0)).toBe(40);
    expect(tg.names(0, 'graveyard')).toEqual([NOME]);
  });
});
