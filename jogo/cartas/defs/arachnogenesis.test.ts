import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/api.ts';
import { fixture } from '../../testes/artefatos.ts';

const N = 'Arachnogenesis';

describe(N, () => {
  it('cria uma Spider 1/2 com alcance por atacante e previne o dano de combate das criaturas que não são Spider', () => {
    const tg = fixture({ active: 1, battlefield: [['Forest', 'Forest', 'Forest'], ['Ripjaw Raptor', 'Elvish Mystic', 'Indomitable Ancients']], hand: [[N], []] });
    tg.attack([['Ripjaw Raptor', 0], ['Elvish Mystic', 0]]).passTo('declareAttackers', 1);
    // prioridade com Bruno (ativo); passa para Ana conjurar
    tg.pass();
    tg.cast(N);
    while (tg.state.zones.stack.length) tg.pass();
    const aranhas = tg.all('Spider');
    expect(aranhas).toHaveLength(2);
    expect(tg.pt(aranhas[0])).toEqual([1, 2]);
    expect(hasKw(tg.g, aranhas[0], 'reach')).toBe(true);
    tg.block([[aranhas[0], 'Ripjaw Raptor']]).passTo('main2', 1);
    expect(tg.life(0)).toBe(40);
    // a Spider bloqueadora não leva dano do Raptor, e o Raptor leva 1 da Spider
    expect(tg.state.objects[aranhas[0]].damage).toBe(0);
    expect(tg.state.objects[tg.bf('Ripjaw Raptor')].damage).toBe(1);
  });
});
