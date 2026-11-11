import { describe, expect, it } from 'vitest';
import { gainLife } from '../../motor/api.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Aerith, Last Ancient';
const naEtapaFinalComGatilho = (tg: ReturnType<typeof setup>) =>
  tg.passUntil((x) => x.state.turn.step === 'end' && x.state.zones.stack.length > 0);

describe(N, () => {
  it('com vínculo com a vida no ataque, ganha 3 e devolve a carta de criatura alvo para a mão', () => {
    const tg = setup({ battlefield: [[N], []], graveyard: [['Silver Myr'], []] });
    tg.choose('carta de criatura alvo', ['Silver Myr']).attack([[N, 1]]).passTo('main2', 0);
    expect(tg.life(0)).toBe(43);
    tg.passTo('cleanup');
    expect(tg.find('Silver Myr', 'hand', 0)).not.toBeNull();
  });

  it('com 7 ou mais de vida ganhos no turno, devolve a carta para o campo', () => {
    const tg = setup({ battlefield: [[N], []], graveyard: [['Silver Myr'], []] });
    gainLife(tg.g, 0, 7, tg.bf(N));
    tg.refresh().choose('carta de criatura alvo', ['Silver Myr']).passTo('cleanup');
    expect(tg.find('Silver Myr', 'battlefield', 0)).not.toBeNull();
  });

  it('sem ganho de vida no turno, não dispara', () => {
    const tg = setup({ battlefield: [[N], []], graveyard: [['Silver Myr'], []] });
    tg.passTo('end', 0);
    expect(tg.state.zones.stack.length).toBe(0);
    tg.passTo('cleanup');
    expect(tg.find('Silver Myr', 'graveyard', 0)).not.toBeNull();
  });

  it('com 5 de vida ganhos, ganhar mais 2 com o gatilho na pilha devolve a carta ao campo', () => {
    const tg = setup({ battlefield: [[N], []], graveyard: [['Silver Myr'], []] });
    gainLife(tg.g, 0, 5, tg.bf(N));
    tg.refresh().choose('carta de criatura alvo', ['Silver Myr']);
    naEtapaFinalComGatilho(tg);
    gainLife(tg.g, 0, 2, tg.bf(N));
    tg.refresh().resolveAll();
    expect(tg.find('Silver Myr', 'battlefield', 0)).not.toBeNull();
  });
});
