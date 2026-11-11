import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Jurati, Cordial Queen';

describe(N, () => {
  it('uma ou mais criaturas artefato causam dano de combate a um jogador: uma cópia da ficha de artefato alvo (um disparo só)', () => {
    const tg = setup({ battlefield: [[N, { name: 'Borg', token: true }, { name: 'Borg', token: true }], []] });
    tg.choose('ficha de artefato alvo', ['Borg']);
    tg.attack(tg.all('Borg').map((id) => [id, 1])).passTo('main2');
    expect(tg.all('Borg')).toHaveLength(3);
  });
});
