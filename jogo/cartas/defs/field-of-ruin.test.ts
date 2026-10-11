import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { alternativasDeMana } from '../../testes/padroes.ts';
import { returnToHand } from '../../motor/api.ts';

const NOME = 'Field of Ruin';

describe(NOME, () => {
  it('CR 605: mana que produz', () => expect(alternativasDeMana(NOME)).toEqual(['C']));
  it('destrói o terreno não básico de um oponente e cada jogador busca um terreno básico, desvirado', () => {
    const tg = setup({ battlefield: [[NOME, 'Sol Ring', 'Tundra'], ['Underground Sea', 'Island']], library: [['Plains', 'Sol Ring'], ['Swamp', 'Counterspell']] });
    let alvos: string[] = [];
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('terreno não básico alvo')) return null;
      alvos = d.items.filter((i) => !i.disabled).map((i) => i.label);
      return { kind: 'select', ids: [d.items.find((i) => i.label === 'Underground Sea')!.id] };
    });
    tg.choose('Field of Ruin: procure', ['Plains']).choose('Field of Ruin: procure', ['Swamp']);
    tg.activate(NOME, 'Destrua').resolve();
    // o seu Tundra e a Island básica do oponente não podem ser alvo
    expect(alvos).toEqual(['Underground Sea']);
    expect(tg.find('Underground Sea')).toBeNull();
    expect(tg.state.objects[tg.bf('Plains', 0)].tapped).toBe(false);
    expect(tg.state.objects[tg.bf('Swamp', 1)].tapped).toBe(false);
    expect(tg.names(0, 'graveyard')).toEqual([NOME]);
  });
  it('CR 608.2b: com o alvo ilegal, não resolve e ninguém procura', () => {
    const tg = setup({ battlefield: [[NOME, 'Sol Ring'], ['Underground Sea']], library: [['Plains'], ['Swamp']] });
    tg.choose('terreno não básico alvo', ['Underground Sea']).activate(NOME, 'Destrua');
    tg.run(returnToHand(tg.g, [tg.bf('Underground Sea')]));
    tg.resolve();
    expect(tg.names(0, 'library')).toEqual(['Plains']);
    expect(tg.names(1, 'library')).toEqual(['Swamp']);
  });
});
