import { describe, expect, it } from 'vitest';
import { fixture } from '../../testes/artefatos.ts';

const N = 'Emry, Lurker of the Loch';

describe(N, () => {
  it('com três artefatos, custa só {U}; ao entrar, mói quatro', () => {
    const tg = fixture({ battlefield: [['Island', 'Sol Ring', 'Gold Myr', "Cultivator's Caravan"], []], hand: [[N], []] });
    tg.cast(N).resolveAll();
    expect(tg.find(N)).not.toBeNull();
    expect(tg.state.zones.graveyard[0]).toHaveLength(4);
  });

  it('depois de ativar, conjura o artefato do cemitério pagando o custo', () => {
    const tg = fixture({ battlefield: [[N, 'Island', 'Island'], []], graveyard: [['Sol Ring', 'Forest'], []] });
    const anel = tg.find('Sol Ring', 'graveyard', 0)!;
    const acao = () => tg.actionIds().find((a) => a.startsWith('cast:') && a.split(':').includes(String(anel)));
    expect(acao()).toBeUndefined();
    tg.choose('carta de artefato alvo', ['Sol Ring']).activate(N).resolve();
    expect(acao()).toBeDefined();
    tg.answer({ kind: 'priority', action: acao()! });
    tg.settle();
    tg.resolveAll();
    expect(tg.find('Sol Ring')).not.toBeNull();
    // pagou {1}
    expect(tg.state.zones.battlefield.filter((id) => tg.state.objects[id].def === 'Island' && tg.state.objects[id].tapped)).toHaveLength(1);
  });
});
