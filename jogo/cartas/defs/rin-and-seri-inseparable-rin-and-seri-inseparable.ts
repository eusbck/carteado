// Rin and Seri, Inseparable // Rin and Seri, Inseparable (carta reversível: as duas faces são iguais e vale a da frente)
// Rin and Seri, Inseparable {1}{R}{G}{W} — Legendary Creature — Dog Cat 4/4
// Whenever you cast a Dog spell, create a 1/1 green Cat creature token.
// Whenever you cast a Cat spell, create a 1/1 white Dog creature token.
// {R}{G}{W}, {T}: Rin and Seri deals damage to any target equal to the number of Dogs you control. You gain life equal
// to the number of Cats you control.
import { activated, controlledBy, createTokens, dealDamage, defineCard, gainLife, is, on, t, tgtRef, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Rin and Seri, Inseparable // Rin and Seri, Inseparable',
  faces: [{
    abilities: [
      // ruling 1: não dispara ao conjurar a própria Rin and Seri (ela ainda não está no campo); ruling 2: resolve antes
      // da mágica, mesmo que ela seja anulada
      triggered(on.youCast(is.subtype('Dog')), function* (c) { yield* createTokens(c.g, c.you, 'Cat verde 1/1', 1); }, {
        text: 'Sempre que você conjura uma mágica de Cão, crie uma ficha de criatura Felino verde 1/1.',
      }),
      triggered(on.youCast(is.subtype('Cat')), function* (c) { yield* createTokens(c.g, c.you, 'Dog branco 1/1', 1); }, {
        text: 'Sempre que você conjura uma mágica de Felino, crie uma ficha de criatura Cão branca 1/1.',
      }),
      activated('{R}{G}{W}, {T}', function* (c) {
        // ruling 4: as quantidades são contadas na resolução, e Rin and Seri conta a si mesma se ainda estiver no campo
        const alvo = tgtRef(c);
        if (alvo === null) return;
        const caes = controlledBy(c.g, c.you, (id) => is.subtype('Dog')(c, id)).length;
        dealDamage(c.g, [{ source: c.source, target: alvo, amount: caes, combat: false }]);
        const felinos = controlledBy(c.g, c.you, (id) => is.subtype('Cat')(c, id)).length;
        gainLife(c.g, c.you, felinos, c.source);
      }, {
        targets: [t.any()],
        text: '{R}{G}{W}, {T}: Rin and Seri causa dano a qualquer alvo igual ao número de Cães que você controla. Você ganha vida igual ao número de Felinos que você controla.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: não dispara ao conjurar a própria Rin and Seri',
    2: 'teste: a ficha vem antes de a mágica resolver, mesmo que ela seja anulada',
    3: 'regra geral: CR 608.2b — com o alvo ilegal a habilidade não resolve e não há ganho de vida (motor/stack.ts)',
    4: 'teste: conta os Cães e Felinos na resolução, inclusive a própria Rin and Seri',
  },
});
