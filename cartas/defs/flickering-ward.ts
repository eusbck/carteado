// Flickering Ward
// Enchant creature
// As this Aura enters, choose a color.
// Enchanted creature has protection from the chosen color. This effect doesn't remove this Aura.
// {W}: Return this Aura to its owner's hand.
import { activated, asEnters, attachedGets, chooseColor, defineCard, returnToHand, t } from '../../motor/api.ts';

export default defineCard({
  name: 'Flickering Ward',
  faces: [{
    enchant: t.creature(undefined, 'criatura'),
    abilities: [
      asEnters(function* (c, ev) { ev.choices.cor = yield* chooseColor(c.g, c.you, 'Flickering Ward: escolha uma cor'); }, 'Ao entrar, escolha uma cor.'),
      attachedGets((c) => {
        const cor = c.g.state.objects[c.source]?.choices.cor as string | undefined;
        // ruling 1: a proteção não remove esta Aura (exceção no próprio efeito)
        return cor ? [{ k: 'addKeyword', kw: 'protection', param: { base: `color:${cor}`, exceto: c.source } }] : [];
      }, 'A criatura encantada tem proteção contra a cor escolhida. Este efeito não remove esta Aura.'),
      activated('{W}', function* (c) { if (c.g.state.objects[c.source]) yield* returnToHand(c.g, [c.source]); }, { text: '{W}: Devolva esta Aura para a mão do dono.' }),
    ],
  }],
  rulings: { 1: 'teste: protegida de branco, outras Auras brancas caem, esta fica' },
});
