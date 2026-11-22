export interface TeluguMeme {
  id: string;
  context: 'marketing' | 'bug' | 'architecture' | 'cricket' | 'cinema' | 'allrounder';
  quoteTelugu: string;
  quoteEnglish: string;
  reactionGiphyOrImg: string;
  humorExplanation: string;
  associatedRole: string;
}

export const teluguMemes: TeluguMeme[] = [
  {
    id: 'meme-marketing',
    context: 'marketing',
    quoteTelugu: 'Product build chesam... audience ekkada mastaru?!',
    quoteEnglish: 'We built the product with clean architecture... but where is the audience, boss?!',
    reactionGiphyOrImg: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=400&q=80',
    humorExplanation: 'Why engineering alone is never enough without sharp distribution, SEO, and organic community growth.',
    associatedRole: 'Marketing & Growth',
  },
  {
    id: 'meme-bug',
    context: 'bug',
    quoteTelugu: 'System lo bug unte... mind lo Thaman background music mogutondi!',
    quoteEnglish: 'When there is a bug in production... high-voltage background music starts playing in the mind!',
    reactionGiphyOrImg: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=400&q=80',
    humorExplanation: 'High-stress debugging turned into heroic cinematic sequences.',
    associatedRole: 'Software Development',
  },
  {
    id: 'meme-architecture',
    context: 'architecture',
    quoteTelugu: 'Database crash avvakudadu ante... first schema lo logic undali!',
    quoteEnglish: 'If the database shouldn\'t crash during peak load... the schema needs rigorous logic from day 1!',
    reactionGiphyOrImg: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=400&q=80',
    humorExplanation: 'Clean database normalization and index optimization saves careers.',
    associatedRole: 'Software Development',
  },
  {
    id: 'meme-cricket',
    context: 'cricket',
    quoteTelugu: 'Last over 14 runs kavali... fielders ni 30-yard circle lo pettava leda?',
    quoteEnglish: '14 needed off the final over... did you keep the fielders inside the 30-yard ring or not?!',
    reactionGiphyOrImg: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=400&q=80',
    humorExplanation: 'Tactical field placement under pressure makes or breaks championships.',
    associatedRole: 'Data Analytics',
  },
  {
    id: 'meme-allrounder',
    context: 'allrounder',
    quoteTelugu: 'Coding, Product, Cinema, Cricket, Music... Annitlo unnam ra nayana!',
    quoteEnglish: 'Code, Product, Cinema, Cricket, Lyrics... We are active across every pitch, my friend!',
    reactionGiphyOrImg: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80',
    humorExplanation: 'Celebrating the polymath builder who integrates left-brain engineering with right-brain artistry.',
    associatedRole: 'Creative Strategy',
  },
];
