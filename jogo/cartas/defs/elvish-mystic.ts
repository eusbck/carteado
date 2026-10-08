// Elvish Mystic — {T}: Add {G}.
import { defineCard, mana } from '../../motor/api.ts';

export default defineCard({ name: 'Elvish Mystic', faces: [{ abilities: [mana('G', { text: '{T}: Adicione {G}.' })] }] });
