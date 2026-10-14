// Saw in Half
// Destroy target creature. If that creature dies this way, its controller creates two tokens that are copies of that
// creature, except their power is half that creature's power and their toughness is half that creature's toughness.
// Round up each time.
import { chars, controllerOf, copyWithExcept, createTokens, defineCard, destroy, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Saw in Half',
  faces: [{
    spell: {
      targets: [t.creature()],
      *effect(c) {
        const id = tgt(c);
        if (id === null) return;
        // ruling 8: a força e a resistência de quando esteve no campo pela última vez
        const ch = chars(c.g, id);
        const dono = controllerOf(c.g, id);
        const metade = (n: number | null): number => Math.ceil((n ?? 0) / 2);
        // rulings 1-5: copia os valores copiáveis (o que ela copiava, ou o que criou a ficha), com a força e a resistência novas
        const modelo = copyWithExcept(c.g, id, { power: metade(ch.power), toughness: metade(ch.toughness) });
        const [nova] = yield* destroy(c.g, [id]);
        // ruling 7: só se morreu mesmo (foi para o cemitério)
        if (nova === null || nova === undefined || c.g.state.objects[nova]?.zone !== 'graveyard') return;
        yield* createTokens(c.g, dono, { copyOf: modelo }, 2);
      },
    },
  }],
  rulings: {
    1: 'teste: destrói uma 2/10 e o controlador dela cria duas cópias 1/5',
    2: 'regra geral: CR 707.9b — a exceção define a força e a resistência; a habilidade que as definiria fica sem efeito nelas',
    3: 'regra geral: CR 707.2 — X do custo de mana copiado é 0',
    4: 'regra geral: CR 707.3 — ficha copia o que o efeito que a criou definiu (motor/mecanicas.ts copiableValues)',
    5: 'regra geral: CR 707.3 — copiando outra coisa, as fichas copiam o que ela copiava',
    6: 'regra geral: CR 707.5 — as habilidades de entrar da criatura copiada funcionam nas fichas',
    7: 'teste: indestrutível não morre e ninguém cria fichas',
    8: 'teste: com marcadores, a metade é da força e da resistência dela no campo, arredondada para cima',
  },
});
