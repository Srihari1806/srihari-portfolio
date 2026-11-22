export interface DeskDrawer {
  id: string;
  name: string;
  teluguName: string;
  icon: string;
  tagline: string;
  description: string;
  itemsCount: number;
  route: string;
  previewItems: string[];
}

export const deskDrawers: DeskDrawer[] = [
  {
    id: 'drawer-work',
    name: 'Work',
    teluguName: 'పని & ప్రొడక్ట్స్',
    icon: 'Briefcase',
    tagline: 'Engineering feats, product decisions & live deployments.',
    description: 'Inside: CricField radar engine, HireMap knowledge graph, CineVault pulse, and ESP32 IoT nodes.',
    itemsCount: 5,
    route: '/work',
    previewItems: ['CricField Engine (Live)', 'HireMap Cytoscape Graph', 'PulseSense IoT C++', 'CineVault Box Office'],
  },
  {
    id: 'drawer-writing',
    name: 'Writing',
    teluguName: 'రచనలు & వ్యాసాలు',
    icon: 'BookOpen',
    tagline: 'Substack essays, Medium deep-dives, Notion PRDs & X analyses.',
    description: 'External publication hub covering spatial cricket, technical architectures, and generalist thinking.',
    itemsCount: 10,
    route: '/writing',
    previewItems: ['Geometry of Cricket (Substack)', 'CricField PRD v2 (Notion)', 'WebSocket Telemetry (Medium)', 'Comb-Shaped Builders (X)'],
  },
  {
    id: 'drawer-cinema',
    name: 'Cinema',
    teluguName: 'సినిమా ప్రపంచం',
    icon: 'Film',
    tagline: 'Spiral release calendar, box office models & director tributes.',
    description: 'A Telugu cinephile desk: Devara, Pushpa 2, Kalki analysis, and interval screenwriting dissections.',
    itemsCount: 6,
    route: '/creative#cinema',
    previewItems: ['Spiral Movie Calendar', 'Theatrical Recovery Math', 'Rajamouli Visual Grammar', 'Letterboxd Diary'],
  },
  {
    id: 'drawer-music',
    name: 'Music',
    teluguName: 'సంగీతం & లిరిక్స్',
    icon: 'Disc3',
    tagline: 'Original Telugu song lyrics, indie demos & cassette tapes.',
    description: 'Lyricist notebook featuring Telugu Chandassu prosody, rhyme schemes, and bedroom indie demos.',
    itemsCount: 4,
    route: '/creative#music',
    previewItems: ['Gaganapu Alalu (Acoustic)', 'Nippula Nadaka (Trap)', 'Cassette Tape Visualizer', 'Chandassu Prosody Engine'],
  },
  {
    id: 'drawer-playground',
    name: 'Playground',
    teluguName: 'ల్యాబ్ & సరదాలు',
    icon: 'Gamepad2',
    tagline: 'Cricket win probability slider, DSP waveform synth & Telugu memes.',
    description: 'Interactive sandbox for curious visitors. Experiment with algorithms, sound waves, and cultural humor.',
    itemsCount: 3,
    route: '/playground',
    previewItems: ['Live Cricket Win Predictor', 'WebAudio DSP Oscilloscope', 'TFI Meme Reaction Engine'],
  },
];
