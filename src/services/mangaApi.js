/**
 * Frontend Manga API Client
 * Connects to the integrated complete manga provider with automatic fallback protection
 */

export const FALLBACK_MANGA_CATALOG = [
  // --- TOP GLOBAL MANHWA & WEBSERIES ---
  {
    id: 'wc:01J76XYBD282Y3XKX0KRGD64Q5',
    aliases: ['lookism', 'webtoon:lookism'],
    title: 'Lookism',
    englishTitle: 'Lookism',
    coverUrl: 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx86337-0g70bKkFpD7E.jpg',
    status: 'Ongoing',
    score: '9.3',
    year: '2014',
    author: 'Park Tae-jun',
    description: 'Daniel Park, an overweight and unattractive high school student bullied relentlessly, mysteriously wakes up in a tall, handsome, and physically gifted new body.',
    tags: ['Action', 'School', 'Drama', 'Supernatural'],
    sourceName: 'WeebCentral',
    totalChapters: 631,
    latestChapter: '631',
    chapters: Array.from({ length: 631 }, (_, i) => {
      const chNum = 631 - i;
      return {
        id: `wc_ch:lookism:${chNum}`,
        chapter: String(chNum),
        title: `Chapter ${chNum}`,
      };
    })
  },
  {
    id: 'wc:01J76XY7M0W9WWJ55VJYYB2J1S',
    aliases: ['tower-of-god', 'webtoon:tower-of-god', 'tower of god'],
    title: 'Tower of God',
    englishTitle: 'Tower of God',
    coverUrl: 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx85143-6o80VwHhYVrn.jpg',
    status: 'Ongoing',
    score: '9.4',
    year: '2010',
    author: 'SIU',
    description: 'What do you desire? Fortune? Glory? Power? Revenge? Whatever you desire, it is here, at the peak of the Tower.',
    tags: ['Action', 'Adventure', 'Fantasy', 'Mystery'],
    sourceName: 'WeebCentral',
    totalChapters: 630,
    latestChapter: '630',
    chapters: Array.from({ length: 630 }, (_, i) => {
      const chNum = 630 - i;
      return {
        id: `wc_ch:tower-of-god:${chNum}`,
        chapter: String(chNum),
        title: `Chapter ${chNum}`,
      };
    })
  },
  {
    id: 'wc:01J76XYA1TQYKV6W4BCMR2WD5M',
    aliases: ['wind-breaker', 'webtoon:wind-breaker', 'wind breaker'],
    title: 'Wind Breaker',
    englishTitle: 'Wind Breaker',
    coverUrl: 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx85489-B0x2z8P96Y24.jpg',
    status: 'Ongoing',
    score: '9.5',
    year: '2013',
    author: 'Jo Yongseok',
    description: 'Jay is an honors student whose sole focus is academics—until he is plunged into the high-stakes world of underground street cycling!',
    tags: ['Sports', 'Action', 'Drama', 'School'],
    sourceName: 'WeebCentral',
    totalChapters: 500,
    latestChapter: '500',
    chapters: Array.from({ length: 500 }, (_, i) => {
      const chNum = 500 - i;
      return {
        id: `wc_ch:wind-breaker:${chNum}`,
        chapter: String(chNum),
        title: `Chapter ${chNum}`,
      };
    })
  },
  {
    id: 'wc:01J76XYD3Q2Q7HYYMB3FSDPSKC',
    aliases: ['eleceed', 'webtoon:eleceed'],
    title: 'Eleceed',
    englishTitle: 'Eleceed',
    coverUrl: 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx110291-PqA9Zuhd8OqJ.jpg',
    status: 'Ongoing',
    score: '9.6',
    year: '2018',
    author: 'Son Jaeho & ZHENA',
    description: 'Jiwoo has super-speed reflexes. Kayden is a deadly awakener on the run who transforms into a fat, fluffy street cat!',
    tags: ['Action', 'Comedy', 'Supernatural'],
    sourceName: 'WeebCentral',
    totalChapters: 320,
    latestChapter: '320',
    chapters: Array.from({ length: 320 }, (_, i) => {
      const chNum = 320 - i;
      return {
        id: `wc_ch:eleceed:${chNum}`,
        chapter: String(chNum),
        title: `Chapter ${chNum}`,
      };
    })
  },
  {
    id: 'asura:nano-machine-ab39de10',
    aliases: ['nano-machine', 'webtoon:nano-machine'],
    title: 'Nano Machine',
    englishTitle: 'Nano Machine',
    coverUrl: 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx111594-g9YqGkM0Yw8S.jpg',
    status: 'Ongoing',
    score: '9.4',
    year: '2020',
    author: 'Jeolmu Hyeon',
    description: 'Cheon Yeo-woon is an illegitimate prince of the Demonic Cult marked for assassination until a descendant injects him with nanomachines.',
    tags: ['Action', 'Martial Arts', 'Sci-Fi', 'Murim'],
    sourceName: 'Asura Scans',
    totalChapters: 230,
    latestChapter: '230',
    chapters: Array.from({ length: 230 }, (_, i) => {
      const chNum = 230 - i;
      return {
        id: `asura_ch:nano-machine-ab39de10:${chNum}`,
        chapter: String(chNum),
        title: `Chapter ${chNum}`,
      };
    })
  },
  {
    id: 'asura:return-of-the-mount-hua-sect-ab39de10',
    aliases: ['return-of-the-mount-hua-sect', 'mount-hua'],
    title: 'Return of the Mount Hua Sect',
    englishTitle: 'Return of the Mount Hua Sect',
    coverUrl: 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx124479-7aKj9V318vLz.jpg',
    status: 'Ongoing',
    score: '9.6',
    year: '2021',
    author: 'Biga',
    description: 'Chung Myung, the 13th disciple of the Great Mount Hua Sect, slays the Heavenly Demon and awakens a century later to restore his fallen sect.',
    tags: ['Action', 'Adventure', 'Comedy', 'Martial Arts'],
    sourceName: 'Asura Scans',
    totalChapters: 150,
    latestChapter: '150',
    chapters: Array.from({ length: 150 }, (_, i) => {
      const chNum = 150 - i;
      return {
        id: `asura_ch:return-of-the-mount-hua-sect-ab39de10:${chNum}`,
        chapter: String(chNum),
        title: `Chapter ${chNum}`,
      };
    })
  },
  {
    id: 'asura:reincarnation-of-the-suicidal-battle-god-ab39de10',
    aliases: ['doom-breaker', 'reincarnation-of-the-suicidal-battle-god'],
    title: 'Doom Breaker',
    englishTitle: 'Reincarnation of the Suicidal Battle God',
    coverUrl: 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx136264-bM8qjX4jF8Lz.jpg',
    status: 'Ongoing',
    score: '9.5',
    year: '2021',
    author: 'Cheong-dam',
    description: 'Zephyr is the last surviving human in a world destroyed by gods. Granted a second chance by the gods who found his struggle entertaining, he regresses to get revenge.',
    tags: ['Action', 'Fantasy', 'Reincarnation', 'Manhwa'],
    sourceName: 'Asura Scans',
    totalChapters: 110,
    latestChapter: '110',
    chapters: Array.from({ length: 110 }, (_, i) => {
      const chNum = 110 - i;
      return {
        id: `asura_ch:reincarnation-of-the-suicidal-battle-god-ab39de10:${chNum}`,
        chapter: String(chNum),
        title: `Chapter ${chNum}`,
      };
    })
  },
  {
    id: '938/death-note',
    aliases: ['death-note', 'death note'],
    title: 'Death Note',
    englishTitle: 'Death Note',
    coverUrl: 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx30001-A5Tf0z3g7R6o.jpg',
    status: 'Completed',
    score: '9.3',
    year: '2003',
    author: 'Tsugumi Ohba & Takeshi Obata',
    description: 'Light Yagami discovers a supernatural notebook that grants him the ability to kill anyone whose name and face he knows.',
    tags: ['Mystery', 'Psychological', 'Supernatural', 'Thriller'],
    sourceName: 'MangaPill',
    totalChapters: 108,
    latestChapter: '108',
    chapters: Array.from({ length: 108 }, (_, i) => {
      const chNum = 108 - i;
      const code = 10000000 + (chNum * 1000);
      return {
        id: `938-${code}/death-note-chapter-${chNum}`,
        chapter: String(chNum),
        title: `Chapter ${chNum}`,
      };
    })
  },
  {
    id: '3262/one-punch-man',
    aliases: ['one-punch-man', 'one punch man', 'opm'],
    title: 'One-Punch Man',
    englishTitle: 'One-Punch Man',
    coverUrl: 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx69363-22ZgqCqKqB7b.jpg',
    status: 'Ongoing',
    score: '9.2',
    year: '2012',
    author: 'ONE & Yusuke Murata',
    description: 'Saitama is a hero who only does it for fun. After three years of training, he has grown so strong that he can defeat any enemy with a single punch.',
    tags: ['Action', 'Comedy', 'Superhero', 'Supernatural'],
    sourceName: 'MangaPill',
    totalChapters: 215,
    latestChapter: '215',
    chapters: Array.from({ length: 215 }, (_, i) => {
      const chNum = 215 - i;
      const code = 10000000 + (chNum * 1000);
      return {
        id: `3262-${code}/one-punch-man-chapter-${chNum}`,
        chapter: String(chNum),
        title: `Chapter ${chNum}`,
      };
    })
  },
  // --- MANGAPILL SHONEN & SEINEN CLASSICS ---
  {
    id: '2/one-piece',
    title: 'One Piece',
    englishTitle: 'One Piece',
    coverUrl: 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx30013-BeslEMqiPhlk.jpg',
    status: 'Ongoing',
    score: '9.3',
    year: '1997',
    author: 'Eiichiro Oda',
    description: 'Gol D. Roger was known as the "Pirate King", the strongest and most infamous being to have sailed the Grand Line. Monkey D. Luffy sets sail in search of the legendary One Piece treasure!',
    tags: ['Action', 'Adventure', 'Fantasy', 'Shounen'],
    sourceName: 'MangaPill',
    totalChapters: 1120,
    latestChapter: '1120',
    chapters: Array.from({ length: 1120 }, (_, i) => {
      const chNum = 1120 - i;
      const code = 10000000 + (chNum * 1000);
      return {
        id: `2-${code}/one-piece-chapter-${chNum}`,
        chapter: String(chNum),
        title: chNum === 1110 ? 'Falling Stars' : chNum === 1109 ? 'Interception' : chNum === 1108 ? 'World, Please Respond' : chNum === 1 ? 'Romance Dawn' : `Chapter ${chNum}`,
      };
    })
  },
  {
    id: '1/berserk',
    title: 'Berserk',
    englishTitle: 'Berserk',
    coverUrl: 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx30002-Cul4OeN7bYtn.jpg',
    status: 'Ongoing',
    score: '9.5',
    year: '1989',
    author: 'Kentaro Miura',
    description: 'Guts, known as the Black Swordsman, seeks sanctuary from demonic forces that pursue him and vengeance against the man who branded him an unholy sacrifice.',
    tags: ['Action', 'Dark Fantasy', 'Horror', 'Seinen'],
    sourceName: 'MangaPill',
    totalChapters: 376,
    latestChapter: '376',
    chapters: Array.from({ length: 376 }, (_, i) => {
      const chNum = 376 - i;
      const code = 10000000 + (chNum * 1000);
      return {
        id: `1-${code}/berserk-chapter-${chNum}`,
        chapter: String(chNum),
        title: chNum === 375 ? 'The Crescent Moon' : chNum === 1 ? 'The Black Swordsman' : `Chapter ${chNum}`,
      };
    })
  },
  {
    id: '723/chainsaw-man',
    title: 'Chainsaw Man',
    englishTitle: 'Chainsaw Man',
    coverUrl: 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx105778-euxXZEIfDY2u.png',
    status: 'Ongoing',
    score: '9.2',
    year: '2018',
    author: 'Tatsuki Fujimoto',
    description: 'Denji is a young man living in poverty with his chainsaw demon Pochita, until an unholy union transforms him into Chainsaw Man!',
    tags: ['Action', 'Supernatural', 'Gore', 'Shounen'],
    sourceName: 'MangaPill',
    totalChapters: 170,
    latestChapter: '170',
    chapters: Array.from({ length: 170 }, (_, i) => {
      const chNum = 170 - i;
      const code = 10000000 + (chNum * 1000);
      return {
        id: `723-${code}/chainsaw-man-chapter-${chNum}`,
        chapter: String(chNum),
        title: `Chapter ${chNum}`,
      };
    })
  },
  {
    id: '2085/jujutsu-kaisen',
    title: 'Jujutsu Kaisen',
    englishTitle: 'Jujutsu Kaisen',
    coverUrl: 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx101517-H3TdM3g5ZUe9.jpg',
    status: 'Completed',
    score: '9.2',
    year: '2018',
    author: 'Gege Akutami',
    description: 'Yuji Itadori swallows a cursed talisman to save his friends and becomes the host of the ancient Demon King Ryomen Sukuna.',
    tags: ['Action', 'Supernatural', 'Dark Fantasy', 'Shounen'],
    sourceName: 'MangaPill',
    totalChapters: 271,
    latestChapter: '271',
    chapters: Array.from({ length: 271 }, (_, i) => {
      const chNum = 271 - i;
      const code = 10000000 + (chNum * 1000);
      return {
        id: `2085-${code}/jujutsu-kaisen-chapter-${chNum}`,
        chapter: String(chNum),
        title: `Chapter ${chNum}`,
      };
    })
  },
  {
    id: '7486/boruto-two-blue-vortex',
    title: 'Boruto: Two Blue Vortex',
    englishTitle: 'Boruto: Two Blue Vortex',
    coverUrl: 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx168468-FEo5x1ZZyWj4.png',
    status: 'Ongoing',
    score: '8.9',
    year: '2023',
    author: 'Masashi Kishimoto & Mikio Ikemoto',
    description: 'Three years have passed since the fateful memory distortion. Boruto Uzumaki returns as a rogue warrior facing Omnipotence.',
    tags: ['Action', 'Ninja', 'Shounen'],
    sourceName: 'MangaPill',
    totalChapters: 16,
    latestChapter: '16',
    chapters: Array.from({ length: 16 }, (_, i) => {
      const chNum = 16 - i;
      const code = 10000000 + (chNum * 1000);
      return {
        id: `7486-${code}/boruto-two-blue-vortex-chapter-${chNum}`,
        chapter: String(chNum),
        title: `Chapter ${chNum}`,
      };
    })
  },
  {
    id: '7529/kagurabachi',
    title: 'Kagurabachi',
    englishTitle: 'Kagurabachi',
    coverUrl: 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx169355-5pqzh1Wb4NOQ.png',
    status: 'Ongoing',
    score: '9.0',
    year: '2023',
    author: 'Takeru Hokazono',
    description: 'Chihiro spends his days training under his swordsmith father until tragedy strikes. Armed with an enchanted katana, his quest for vengeance begins.',
    tags: ['Action', 'Supernatural', 'Swordplay'],
    sourceName: 'MangaPill',
    totalChapters: 35,
    latestChapter: '35',
    chapters: Array.from({ length: 35 }, (_, i) => {
      const chNum = 35 - i;
      const code = 10000000 + (chNum * 1000);
      return {
        id: `7529-${code}/kagurabachi-chapter-${chNum}`,
        chapter: String(chNum),
        title: `Chapter ${chNum}`,
      };
    })
  },
  {
    id: '467/demon-slayer',
    aliases: ['webtoon:demon-slayer', 'demon-slayer', 'kimetsu-no-yaiba'],
    title: 'Demon Slayer: Kimetsu no Yaiba',
    englishTitle: 'Demon Slayer: Kimetsu no Yaiba',
    coverUrl: 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx87216-c9bSNVD10UuD.png',
    status: 'Completed',
    score: '9.1',
    year: '2016',
    author: 'Koyoharu Gotouge',
    description: 'Tanjiro Kamado sets out on a perilous path to avenge his slaughtered family and find a cure for his sister Nezuko, who has been turned into a demon.',
    tags: ['Action', 'Demons', 'Historical', 'Shounen'],
    sourceName: 'MangaPill',
    totalChapters: 205,
    latestChapter: '205',
    chapters: Array.from({ length: 205 }, (_, i) => {
      const chNum = 205 - i;
      const code = 10000000 + (chNum * 1000);
      return {
        id: `467-${code}/demon-slayer-kimetsu-no-yaiba-chapter-${chNum}`,
        chapter: String(chNum),
        title: `Chapter ${chNum}`,
      };
    })
  },
  {
    id: '50/attack-on-titan',
    aliases: ['webtoon:attack-on-titan', 'attack-on-titan', 'shingeki-no-kyojin'],
    title: 'Attack on Titan',
    englishTitle: 'Attack on Titan',
    coverUrl: 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx53390-1RsuABC34P9D.jpg',
    status: 'Completed',
    score: '9.3',
    year: '2009',
    author: 'Hajime Isayama',
    description: 'Humanity lives inside cities surrounded by enormous walls that protect them from gigantic man-eating humanoids referred to as Titans. Eren Yeager vows to cleanse the earth of Titans.',
    tags: ['Action', 'Dark Fantasy', 'Military', 'Mystery'],
    sourceName: 'MangaPill',
    totalChapters: 139,
    latestChapter: '139',
    chapters: Array.from({ length: 139 }, (_, i) => {
      const chNum = 139 - i;
      const code = 10000000 + (chNum * 1000);
      return {
        id: `50-${code}/attack-on-titan-chapter-${chNum}`,
        chapter: String(chNum),
        title: `Chapter ${chNum}`,
      };
    })
  },
  {
    id: '3/bleach',
    aliases: ['wc:bleach', 'bleach'],
    title: 'Bleach',
    englishTitle: 'Bleach',
    coverUrl: 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx30012-1epmVfTSv2rr.png',
    status: 'Completed',
    score: '9.1',
    year: '2001',
    author: 'Tite Kubo',
    description: 'Ichigo Kurosaki gains the powers of a Soul Reaper and is thrust into defending humans from evil spirits and guiding deceased souls to the afterlife.',
    tags: ['Action', 'Supernatural', 'Shounen'],
    sourceName: 'MangaPill',
    totalChapters: 686,
    latestChapter: '686',
    chapters: Array.from({ length: 686 }, (_, i) => {
      const chNum = 686 - i;
      const code = 10000000 + (chNum * 1000);
      return {
        id: `3-${code}/bleach-chapter-${chNum}`,
        chapter: String(chNum),
        title: `Chapter ${chNum}`,
      };
    })
  },
  {
    id: '5/naruto',
    aliases: ['wc:naruto', 'naruto'],
    title: 'Naruto',
    englishTitle: 'Naruto',
    coverUrl: 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/nx30011-9yUF1dXWgDOx.jpg',
    status: 'Completed',
    score: '9.2',
    year: '1999',
    author: 'Masashi Kishimoto',
    description: 'Naruto Uzumaki, a mischievous ninja who struggles for recognition, dreams of becoming the Hokage—the leader and strongest ninja of his village.',
    tags: ['Action', 'Adventure', 'Ninja', 'Shounen'],
    sourceName: 'MangaPill',
    totalChapters: 700,
    latestChapter: '700',
    chapters: Array.from({ length: 700 }, (_, i) => {
      const chNum = 700 - i;
      const code = 10000000 + (chNum * 1000);
      return {
        id: `5-${code}/naruto-chapter-${chNum}`,
        chapter: String(chNum),
        title: `Chapter ${chNum}`,
      };
    })
  },
  {
    id: '17/hunter-x-hunter',
    aliases: ['wc:hunter-x-hunter', 'hunter-x-hunter'],
    title: 'Hunter x Hunter',
    englishTitle: 'Hunter x Hunter',
    coverUrl: 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx30026-uCvXMudMzmwI.jpg',
    status: 'Ongoing',
    score: '9.4',
    year: '1998',
    author: 'Yoshihiro Togashi',
    description: 'Gon Freecss discovers that his father is actually alive and a world-renowned Hunter. Gon embarks on a journey to become a Hunter himself.',
    tags: ['Action', 'Adventure', 'Fantasy', 'Shounen'],
    sourceName: 'MangaPill',
    totalChapters: 400,
    latestChapter: '400',
    chapters: Array.from({ length: 400 }, (_, i) => {
      const chNum = 400 - i;
      const code = 10000000 + (chNum * 1000);
      return {
        id: `17-${code}/hunter-x-hunter-chapter-${chNum}`,
        chapter: String(chNum),
        title: `Chapter ${chNum}`,
      };
    })
  },
  {
    id: '2873/spy-x-family',
    aliases: ['md:spy-x-family', 'spy-x-family', 'spyxfamily'],
    title: 'Spy x Family',
    englishTitle: 'Spy x Family',
    coverUrl: 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx108556-NHjkz0BNJhLx.jpg',
    status: 'Ongoing',
    score: '9.2',
    year: '2019',
    author: 'Tatsuya Endo',
    description: 'A spy on an undercover mission marries an assassin and adopts a telepathic girl as part of his cover, with none of them knowing the other\'s secrets.',
    tags: ['Action', 'Comedy', 'Slice of Life', 'Shounen'],
    sourceName: 'MangaPill',
    totalChapters: 105,
    latestChapter: '105',
    chapters: Array.from({ length: 105 }, (_, i) => {
      const chNum = 105 - i;
      const code = 10000000 + (chNum * 1000);
      return {
        id: `2873-${code}/spy-x-family-chapter-${chNum}`,
        chapter: String(chNum),
        title: `Chapter ${chNum}`,
      };
    })
  },
  {
    id: '4708/frieren',
    aliases: ['md:frieren', 'frieren', 'sousou-no-frieren'],
    title: "Frieren: Beyond Journey's End",
    englishTitle: "Frieren: Beyond Journey's End",
    coverUrl: 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx118586-CXKgWikBFQgS.jpg',
    status: 'Ongoing',
    score: '9.5',
    year: '2020',
    author: 'Kanehito Yamada & Tsukasa Abe',
    description: 'The mage Frieren defeated the Demon King alongside hero Himmel. An elf with a lifespan of millennia, she sets out on a new journey to understand humanity.',
    tags: ['Adventure', 'Drama', 'Fantasy', 'Magic'],
    sourceName: 'MangaPill',
    totalChapters: 135,
    latestChapter: '135',
    chapters: Array.from({ length: 135 }, (_, i) => {
      const chNum = 135 - i;
      const code = 10000000 + (chNum * 1000);
      return {
        id: `4708-${code}/sousou-no-frieren-chapter-${chNum}`,
        chapter: String(chNum),
        title: `Chapter ${chNum}`,
      };
    })
  },
  {
    id: '5588/dandadan',
    aliases: ['md:dandadan', 'dandadan'],
    title: 'Dandadan',
    englishTitle: 'Dandadan',
    coverUrl: 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx132029-prGF4gePdSKv.jpg',
    status: 'Ongoing',
    score: '9.3',
    year: '2021',
    author: 'Yukinobu Tatsu',
    description: 'Momo Ayase believes in ghosts but denies aliens, while Okarun believes in aliens but denies ghosts. To prove each other wrong, they visit supernatural hotspots and unleash utter chaos!',
    tags: ['Action', 'Comedy', 'Supernatural', 'Sci-Fi'],
    sourceName: 'MangaPill',
    totalChapters: 170,
    latestChapter: '170',
    chapters: Array.from({ length: 170 }, (_, i) => {
      const chNum = 170 - i;
      const code = 10000000 + (chNum * 1000);
      return {
        id: `5588-${code}/dandadan-chapter-${chNum}`,
        chapter: String(chNum),
        title: `Chapter ${chNum}`,
      };
    })
  },
  {
    id: '60/vinland-saga',
    aliases: ['mk:vinland-saga', 'vinland-saga'],
    title: 'Vinland Saga',
    englishTitle: 'Vinland Saga',
    coverUrl: 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx30642-0mjRDkf4THpo.jpg',
    status: 'Ongoing',
    score: '9.5',
    year: '2005',
    author: 'Makoto Yukimura',
    description: 'Thorfinn pursues a quest for revenge against his father\'s killer, joining the mercenary band of Askeladd during the Viking invasion of England.',
    tags: ['Action', 'Adventure', 'Historical', 'Seinen'],
    sourceName: 'MangaPill',
    totalChapters: 215,
    latestChapter: '215',
    chapters: Array.from({ length: 215 }, (_, i) => {
      const chNum = 215 - i;
      const code = 10000000 + (chNum * 1000);
      return {
        id: `60-${code}/vinland-saga-chapter-${chNum}`,
        chapter: String(chNum),
        title: `Chapter ${chNum}`,
      };
    })
  },
  {
    id: '4/vagabond',
    aliases: ['mk:vagabond', 'vagabond'],
    title: 'Vagabond',
    englishTitle: 'Vagabond',
    coverUrl: 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx30656-9mW113O7rDnA.png',
    status: 'Hiatus',
    score: '9.6',
    year: '1998',
    author: 'Takehiko Inoue',
    description: 'Shinmen Takezo is destined to become the legendary sword-saint Miyamoto Musashi. A breathtaking chronicle of martial mastery, philosophy, and self-discovery.',
    tags: ['Action', 'Historical', 'Samurai', 'Seinen'],
    sourceName: 'MangaPill',
    totalChapters: 327,
    latestChapter: '327',
    chapters: Array.from({ length: 327 }, (_, i) => {
      const chNum = 327 - i;
      const code = 10000000 + (chNum * 1000);
      return {
        id: `4-${code}/vagabond-chapter-${chNum}`,
        chapter: String(chNum),
        title: `Chapter ${chNum}`,
      };
    })
  },
  {
    id: '8/kingdom',
    aliases: ['mk:kingdom', 'kingdom'],
    title: 'Kingdom',
    englishTitle: 'Kingdom',
    coverUrl: 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/nx46765-KPXir4sRqJBW.png',
    status: 'Ongoing',
    score: '9.5',
    year: '2006',
    author: 'Yasuhisa Hara',
    description: 'During the Warring States period of ancient China, Xin and Piao are war-orphans who train to become Great Generals of the Heavens.',
    tags: ['Action', 'Historical', 'Military', 'Seinen'],
    sourceName: 'MangaPill',
    totalChapters: 810,
    latestChapter: '810',
    chapters: Array.from({ length: 810 }, (_, i) => {
      const chNum = 810 - i;
      const code = 10000000 + (chNum * 1000);
      return {
        id: `8-${code}/kingdom-chapter-${chNum}`,
        chapter: String(chNum),
        title: `Chapter ${chNum}`,
      };
    })
  },

  // --- WEBTOON & MANHWA MASTERPIECES ---
  {
    id: 'webtoon:fortune-telling-princess',
    aliases: ['webtoon:a-fortune-telling-princess', 'a-fortune-telling-princess', 'fortune-telling-princess'],
    title: 'A Fortune-Telling Princess',
    englishTitle: 'A Fortune-Telling Princess',
    coverUrl: 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx170151-hItAtAb5Kj0I.jpg',
    status: 'Ongoing',
    score: '9.2',
    year: '2023',
    author: 'Gimgae & Saidin',
    description: 'I was a prophetess who was revered as a living god in my past life. But after dying a tragic death, I was reincarnated as the neglected fifth princess of the imperial family.',
    tags: ['Romance', 'Fantasy', 'Shoujo', 'Reincarnation'],
    sourceName: 'Webtoon',
    totalChapters: 174,
    latestChapter: '174',
    chapters: Array.from({ length: 174 }, (_, i) => {
      const chNum = 174 - i;
      return {
        id: `webtoon:ftp:${chNum}`,
        chapter: String(chNum),
        title: `Chapter ${chNum}`,
      };
    })
  },
  {
    id: 'webtoon:stepmother-second-life',
    aliases: [
      'webtoon:the-step-mothers-began-her-second-life',
      'wc:01j76xy74zfsrkyp568q0e43q1-the-step-mother-began-her-second-life',
      'the-despised-stepmother-begins-her-second-life'
    ],
    title: 'The Despised Stepmother Begins Her Second Life',
    englishTitle: "The Step Mother's Began Her Second Life",
    coverUrl: 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx213993-T1BvCf8cBvlt.jpg',
    status: 'Ongoing',
    score: '9.3',
    year: '2024',
    author: 'Gwon Gyeoul',
    description: 'After dying from betrayal, she regresses back to the start of her second marriage with her stepchildren. This time, she will protect them and take control of her destiny!',
    tags: ['Romance', 'Drama', 'Fantasy', 'Regression'],
    sourceName: 'Webtoon',
    totalChapters: 85,
    latestChapter: '85',
    chapters: Array.from({ length: 85 }, (_, idx) => {
      const num = 85 - idx;
      return {
        id: `webtoon:stepmother:${num}`,
        chapter: String(num),
        title: `Chapter ${num}`,
      };
    })
  },
  {
    id: 'webtoon:solo-leveling',
    aliases: ['solo-leveling', 'solo'],
    title: 'Solo Leveling',
    englishTitle: 'Solo Leveling (Only I Level Up)',
    coverUrl: 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx105398-b673Vt5ZSuz3.jpg',
    status: 'Completed',
    score: '9.6',
    year: '2018',
    author: 'Chugong & DUBU (REDICE)',
    description: '10 years ago, after "the Gate" that connected the real world with the monster world opened, ordinary hunter Sung Jin-woo receives a quest log that only he can see!',
    tags: ['Action', 'Fantasy', 'Supernatural', 'Manhwa'],
    sourceName: 'Webtoon',
    totalChapters: 200,
    latestChapter: '200',
    chapters: Array.from({ length: 200 }, (_, i) => {
      const chNum = 200 - i;
      return {
        id: `webtoon:solo:${chNum}`,
        chapter: String(chNum),
        title: chNum === 200 ? 'Epilogue 21' : chNum === 1 ? 'Prologue' : `Chapter ${chNum}`,
      };
    })
  },
  {
    id: 'webtoon:omniscient-reader',
    aliases: ['omniscient-reader', 'orv', 'omniscient-readers-viewpoint'],
    title: "Omniscient Reader's Viewpoint",
    englishTitle: "Omniscient Reader's Viewpoint",
    coverUrl: 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx119257-Pi21aq3ey9GG.jpg',
    status: 'Ongoing',
    score: '9.5',
    year: '2020',
    author: 'sing N song & Sleepy-C',
    description: 'Kim Dokja was an ordinary office worker whose sole interest was reading web novels. When his favorite apocalyptic novel becomes reality, he is the only person who knows the ending!',
    tags: ['Action', 'Fantasy', 'Apocalypse', 'System'],
    sourceName: 'Webtoon',
    totalChapters: 220,
    latestChapter: '220',
    chapters: Array.from({ length: 220 }, (_, i) => {
      const chNum = 220 - i;
      return {
        id: `webtoon:orv:${chNum}`,
        chapter: String(chNum),
        title: `Chapter ${chNum}`,
      };
    })
  },

  // --- ASURA SCANS TOP HITS ---
  {
    id: 'asura:damn-reincarnation-3ebcc5a9',
    aliases: ['damn-reincarnation', 'my-blasted-reincarnated-life'],
    title: 'My Blasted Reincarnated Life',
    englishTitle: 'Damn Reincarnation',
    coverUrl: 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx151512-q0Xddr1JNKNq.png',
    status: 'Ongoing',
    score: '9.2',
    year: '2022',
    author: 'Mokma & Jeong-Yeol Park',
    description: 'When the warrior Hamel sacrifices himself to protect his rival Bermut Lionhart, he vows to eliminate the demon kings. Reincarnated 300 years later as Eugene Lionhart in his rival bloodline, he begins his quest!',
    tags: ['Action', 'Adventure', 'Fantasy', 'Reincarnation'],
    sourceName: 'Asura Scans',
    totalChapters: 85,
    latestChapter: '85',
    chapters: Array.from({ length: 85 }, (_, i) => {
      const chNum = 85 - i;
      return {
        id: `asura_ch:damn-reincarnation-3ebcc5a9:${chNum}`,
        chapter: String(chNum),
        title: `Chapter ${chNum}`,
      };
    })
  },
  {
    id: 'asura:surviving-game-barbarian',
    aliases: ['surviving-the-game-as-a-barbarian', 'barbarian'],
    title: 'Surviving The Game as a Barbarian',
    englishTitle: 'Surviving The Game as a Barbarian',
    coverUrl: 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/medium/bx164857-MVeV0leMZb0m.jpg',
    status: 'Ongoing',
    score: '9.3',
    year: '2023',
    author: 'Han D-Seul & Jung Yoon-kang',
    description: 'After playing the impossible 2D RPG Dungeon and Stone for 9 years, Lee Hansoo beats the final boss and wakes up inside the game as a savage barbarian!',
    tags: ['Action', 'Adventure', 'Fantasy', 'System'],
    sourceName: 'Asura Scans',
    totalChapters: 80,
    latestChapter: '80',
    chapters: Array.from({ length: 80 }, (_, i) => {
      const chNum = 80 - i;
      return {
        id: `asura_ch:surviving-the-game-as-a-barbarian-ab39de10:${chNum}`,
        chapter: String(chNum),
        title: `Chapter ${chNum}`,
      };
    })
  },
  {
    id: 'asura:greatest-estate-developer',
    aliases: ['the-greatest-estate-developer', 'estate-developer'],
    title: 'The Greatest Estate Developer',
    englishTitle: 'The Greatest Estate Developer',
    coverUrl: 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx140407-fJQr0fmqq1IO.png',
    status: 'Ongoing',
    score: '9.7',
    year: '2021',
    author: 'BK_Moon & Kim Hyunsoo',
    description: 'Civil engineering student Suho Kim falls asleep reading a fantasy novel and wakes up as Lloyd Frontera, a good-for-nothing noble in massive debt. Using modern engineering, he creates an empire!',
    tags: ['Comedy', 'Fantasy', 'Reincarnation', 'Architecture'],
    sourceName: 'Asura Scans',
    totalChapters: 165,
    latestChapter: '165',
    chapters: Array.from({ length: 165 }, (_, i) => {
      const chNum = 165 - i;
      return {
        id: `asura_ch:the-greatest-estate-developer-ab39de10:${chNum}`,
        chapter: String(chNum),
        title: `Chapter ${chNum}`,
      };
    })
  }
];

export const KNOWN_MANGA_COVERS = {
  'lookism': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx86337-0g70bKkFpD7E.jpg',
  'tower of god': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx85143-6o80VwHhYVrn.jpg',
  'wind breaker': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx85489-B0x2z8P96Y24.jpg',
  'eleceed': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx110291-PqA9Zuhd8OqJ.jpg',
  'mercenary enrollment': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx125633-5cTzE1O23e59.jpg',
  'teenage mercenary': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx125633-5cTzE1O23e59.jpg',
  'nano machine': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx111594-g9YqGkM0Yw8S.jpg',
  'return of the mount hua sect': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx124479-7aKj9V318vLz.jpg',
  'mount hua': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx124479-7aKj9V318vLz.jpg',
  'reincarnation of the suicidal battle god': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx136264-bM8qjX4jF8Lz.jpg',
  'doom breaker': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx136264-bM8qjX4jF8Lz.jpg',
  'reaper of the drifting moon': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx151608-F4l8jNq9M2X5.jpg',
  'murim login': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx119614-fX48Z1kM9m2K.jpg',
  'death note': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx30001-A5Tf0z3g7R6o.jpg',
  'one punch man': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx69363-22ZgqCqKqB7b.jpg',
  'one-punch man': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx69363-22ZgqCqKqB7b.jpg',
  'tokyo ghoul': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx63327-S7M94aK1QYd0.jpg',
  'black clover': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx86123-5cTzE1O23e59.jpg',
  'blue lock': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx106130-9mW113O7rDnA.jpg',
  'sakamoto days': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx125828-5pqzh1Wb4NOQ.png',
  'oshi no ko': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx117040-CXKgWikBFQgS.jpg',
  'haikyuu': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx65243-KPXir4sRqJBW.png',
  'dragon ball super': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx86942-0mjRDkf4THpo.jpg',
  'one piece': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx30013-BeslEMqiPhlk.jpg',
  'berserk': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx30002-Cul4OeN7bYtn.jpg',
  'solo leveling': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx105398-b673Vt5ZSuz3.jpg',
  'fortune-telling princess': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx170151-hItAtAb5Kj0I.jpg',
  'stepmother': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx213993-T1BvCf8cBvlt.jpg',
  'step mother': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx213993-T1BvCf8cBvlt.jpg',
  'chainsaw man': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx105778-euxXZEIfDY2u.png',
  'jujutsu kaisen': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx101517-H3TdM3g5ZUe9.jpg',
  'boruto': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx168468-FEo5x1ZZyWj4.png',
  'kagurabachi': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx169355-5pqzh1Wb4NOQ.png',
  'omniscient reader': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx119257-Pi21aq3ey9GG.jpg',
  'surviving the game as a barbarian': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/medium/bx164857-MVeV0leMZb0m.jpg',
  'barbarian': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/medium/bx164857-MVeV0leMZb0m.jpg',
  'blasted reincarnat': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx151512-q0Xddr1JNKNq.png',
  'damn reincarnation': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx151512-q0Xddr1JNKNq.png',
  'demon slayer': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx87216-c9bSNVD10UuD.png',
  'attack on titan': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx53390-1RsuABC34P9D.jpg',
  'bleach': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx30012-1epmVfTSv2rr.png',
  'naruto': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/nx30011-9yUF1dXWgDOx.jpg',
  'hunter x hunter': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx30026-uCvXMudMzmwI.jpg',
  'spy x family': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx108556-NHjkz0BNJhLx.jpg',
  'frieren': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx118586-CXKgWikBFQgS.jpg',
  'dandadan': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx132029-prGF4gePdSKv.jpg',
  'vinland saga': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx30642-0mjRDkf4THpo.jpg',
  'vagabond': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx30656-9mW113O7rDnA.png',
  'kingdom': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/nx46765-KPXir4sRqJBW.png',
  'greatest estate developer': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx140407-fJQr0fmqq1IO.png',
};

export function getReliableCoverUrl(title, currentUrl) {
  if (currentUrl && (currentUrl.includes('anilist.co') || currentUrl.includes('myanimelist.net'))) {
    return currentUrl;
  }
  const t = (title || '').toLowerCase().trim();
  for (const [key, url] of Object.entries(KNOWN_MANGA_COVERS)) {
    if (t.includes(key) || key.includes(t)) {
      return url;
    }
  }
  return currentUrl || getFallbackCover(title);
}

// High-speed client-side memory cache with 5-minute TTL
const clientCache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000;

function getClientCached(key) {
  const item = clientCache.get(key);
  if (!item) return null;
  if (Date.now() - item.time > CACHE_TTL_MS) {
    clientCache.delete(key);
    return null;
  }
  return item.data;
}

function setClientCached(key, data) {
  clientCache.set(key, { data, time: Date.now() });
}

export function getApiBaseUrl() {
  if (typeof window !== 'undefined') {
    const custom = localStorage.getItem('kuroneko_backend_url');
    if (custom && custom.trim()) {
      return custom.trim().replace(/\/$/, '');
    }
    // High-speed verified API proxy for static hosting (GitHub Pages)
    if (window.location.hostname.includes('github.io') || window.location.protocol === 'file:') {
      return 'https://anime-rosy-kappa.vercel.app';
    }
  }
  return '';
}

export function setApiBaseUrl(url) {
  if (typeof window !== 'undefined') {
    if (url && url.trim()) {
      localStorage.setItem('kuroneko_backend_url', url.trim().replace(/\/$/, ''));
    } else {
      localStorage.removeItem('kuroneko_backend_url');
    }
  }
}

/**
 * Fetch Popular / Trending Manga
 */
export async function fetchPopularManga() {
  const cached = getClientCached('popular_manga');
  if (cached) return cached;

  const baseUrl = getApiBaseUrl();
  try {
    const url = baseUrl ? `${baseUrl}/api/manga/popular` : '/api/manga/popular';
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      const formatted = data.map(formatMangaItem);
      setClientCached('popular_manga', formatted);
      return formatted;
    }
    return FALLBACK_MANGA_CATALOG.map(formatMangaItem);
  } catch (err) {
    console.warn('fetchPopularManga network warning, using fallback catalog:', err);
    return FALLBACK_MANGA_CATALOG.map(formatMangaItem);
  }
}

/**
 * Live AniList GraphQL Search for Static Hosting (GitHub Pages)
 */
export async function searchAniList(query) {
  if (!query || !query.trim()) return [];
  try {
    const q = `query ($search: String) {
      Page(page: 1, perPage: 16) {
        media(search: $search, type: MANGA, sort: SEARCH_MATCH) {
          id
          title { romaji english userPreferred }
          coverImage { extraLarge large medium }
          bannerImage
          description(asHtml: false)
          chapters
          volumes
          status
          averageScore
          genres
          startDate { year }
        }
      }
    }`;
    const res = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ query: q, variables: { search: query.trim() } })
    });
    if (!res.ok) return [];
    const json = await res.json();
    const media = json?.data?.Page?.media || [];
    return media.map((m) => {
      const totalCh = m.chapters || 50;
      const chList = Array.from({ length: Math.min(totalCh, 200) }, (_, idx) => {
        const num = totalCh - idx;
        return {
          id: `anilist_ch:${m.id}:${num}`,
          chapter: String(num),
          title: `Chapter ${num}`
        };
      });
      const t = m.title.english || m.title.romaji || m.title.userPreferred || 'Manga';
      return formatMangaItem({
        id: `anilist:${m.id}`,
        title: t,
        englishTitle: m.title.english || null,
        coverUrl: m.coverImage?.large || m.coverImage?.extraLarge || m.coverImage?.medium,
        bannerUrl: m.bannerImage || null,
        status: m.status === 'FINISHED' ? 'Completed' : 'Ongoing',
        score: m.averageScore ? (m.averageScore / 10).toFixed(1) : '8.8',
        year: m.startDate?.year ? String(m.startDate.year) : '2023',
        author: 'Manga Universe',
        description: m.description ? decodeHtml(m.description) : '',
        tags: m.genres || ['Action', 'Fantasy'],
        sourceName: 'AniList',
        totalChapters: m.chapters || totalCh,
        latestChapter: String(totalCh),
        chapters: chList
      });
    }).filter(Boolean);
  } catch (err) {
    console.warn('AniList live search error:', err);
    return [];
  }
}

/**
 * Fetch AniList Details for Static Hosting
 */
export async function fetchAniListDetails(id) {
  try {
    const q = `query ($id: Int) {
      Media(id: $id, type: MANGA) {
        id
        title { romaji english userPreferred }
        coverImage { extraLarge large medium }
        bannerImage
        description(asHtml: false)
        chapters
        volumes
        status
        averageScore
        genres
        startDate { year }
        staff(perPage: 3) { nodes { name { full } } }
      }
    }`;
    const cleanId = parseInt(String(id).replace(/^anilist:/, ''), 10);
    if (isNaN(cleanId)) return null;
    const res = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: q, variables: { id: cleanId } })
    });
    if (!res.ok) return null;
    const json = await res.json();
    const m = json?.data?.Media;
    if (!m) return null;
    const totalCh = m.chapters || 50;
    const chList = Array.from({ length: Math.min(totalCh, 250) }, (_, idx) => {
      const num = totalCh - idx;
      return {
        id: `anilist_ch:${m.id}:${num}`,
        chapter: String(num),
        title: `Chapter ${num}`
      };
    });
    const authors = m.staff?.nodes?.map(n => n.name?.full).filter(Boolean).join(', ') || 'Manga Artist';
    return {
      id: `anilist:${m.id}`,
      title: m.title.english || m.title.romaji || 'Manga',
      englishTitle: m.title.english || null,
      coverUrl: m.coverImage?.extraLarge || m.coverImage?.large,
      bannerUrl: m.bannerImage || null,
      status: m.status === 'FINISHED' ? 'Completed' : 'Ongoing',
      score: m.averageScore ? (m.averageScore / 10).toFixed(1) : '8.8',
      year: m.startDate?.year ? String(m.startDate.year) : '2023',
      author: authors,
      description: m.description ? decodeHtml(m.description) : '',
      tags: m.genres || ['Action', 'Fantasy'],
      sourceName: 'AniList',
      totalChapters: m.chapters || totalCh,
      latestChapter: String(totalCh),
      chapters: chList
    };
  } catch (err) {
    console.warn('fetchAniListDetails error:', err);
    return null;
  }
}

export async function searchManga(query = '') {
  if (!query || !query.trim()) return fetchPopularManga();

  const cacheKey = `search_${query.trim().toLowerCase()}`;
  const cached = getClientCached(cacheKey);
  if (cached) return cached;

  const baseUrl = getApiBaseUrl();
  try {
    const url = baseUrl
      ? `${baseUrl}/api/manga/search?q=${encodeURIComponent(query.trim())}`
      : `/api/manga/search?q=${encodeURIComponent(query.trim())}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      const formatted = data.map(formatMangaItem);
      setClientCached(cacheKey, formatted);
      return formatted;
    }
  } catch (err) {
    console.warn('searchManga API warning, matching fallback:', err);
  }

  // Client-side fallback filter
  const q = query.toLowerCase().trim();
  const matched = FALLBACK_MANGA_CATALOG.filter(
    (m) =>
      m.title.toLowerCase().includes(q) ||
      (m.englishTitle && m.englishTitle.toLowerCase().includes(q)) ||
      (m.aliases && m.aliases.some((a) => a.toLowerCase().includes(q)))
  ).map(formatMangaItem);

  try {
    const liveResults = await searchAniList(query);
    if (liveResults && liveResults.length > 0) {
      const seen = new Set(matched.map((m) => m.title.toLowerCase()));
      for (const item of liveResults) {
        if (!seen.has(item.title.toLowerCase())) {
          seen.add(item.title.toLowerCase());
          matched.push(item);
        }
      }
    }
  } catch {}

  setClientCached(cacheKey, matched);
  return matched;
}

/**
 * Helper to check if an image needs proxying (skips AniList, MyAnimeList, Data URIs)
 */
function needsImageProxy(url) {
  if (!url) return false;
  if (url.startsWith('/api/image-proxy') || url.startsWith('http://localhost') || url.startsWith('data:')) return false;
  if (url.includes('anilist.co') || url.includes('myanimelist.net')) return false;
  return true;
}

/**
 * Robust HTML entity decoder
 */
export function decodeHtml(str) {
  if (!str || typeof str !== 'string') return '';
  let decoded = str
    .replace(/&quot;/gi, '"')
    .replace(/&apos;/gi, "'")
    .replace(/&#039;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&mdash;/gi, '—')
    .replace(/&ndash;/gi, '–')
    .replace(/&hellip;/gi, '…')
    .replace(/&lsquo;/gi, "‘")
    .replace(/&rsquo;/gi, "’")
    .replace(/&ldquo;/gi, '“')
    .replace(/&rdquo;/gi, '”')
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => {
      try {
        return String.fromCodePoint(parseInt(hex, 16));
      } catch {
        return '';
      }
    })
    .replace(/&#([0-9]+);/g, (_, dec) => {
      try {
        return String.fromCodePoint(parseInt(dec, 10));
      } catch {
        return '';
      }
    });

  if (decoded.includes('&amp;') || decoded.includes('&#')) {
    decoded = decoded
      .replace(/&quot;/gi, '"')
      .replace(/&apos;/gi, "'")
      .replace(/&#039;/g, "'")
      .replace(/&#39;/g, "'")
      .replace(/&amp;/gi, '&')
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/&#x([0-9a-f]+);/gi, (_, hex) => {
        try {
          return String.fromCodePoint(parseInt(hex, 16));
        } catch {
          return '';
        }
      })
      .replace(/&#([0-9]+);/g, (_, dec) => {
        try {
          return String.fromCodePoint(parseInt(dec, 10));
        } catch {
          return '';
        }
      });
  }
  return decoded;
}

/**
 * Title cleaner: strips provider prefix tags (Vortex:, Asura:, etc.) and decodes entities
 */
export function cleanTitle(raw) {
  if (!raw || typeof raw !== 'string') return 'Manga';
  let t = decodeHtml(raw);

  t = t.replace(/^(vortex|asura|webtoon|weebcentral|mangadex|mangakakalot|kakamanga|mangapill|wc|mk|md)s*:s*/i, '');
  t = t
    .replace(/Chapters+[0-9.]+/i, '')
    .replace(/\s+manga$/i, '')
    .trim();

  const words = t.split(/\s+/);
  const half = Math.floor(words.length / 2);
  if (words.length >= 2 && words.length % 2 === 0) {
    const firstHalf = words.slice(0, half).join(' ');
    const secondHalf = words.slice(half).join(' ');
    if (firstHalf.toLowerCase() === secondHalf.toLowerCase()) {
      t = firstHalf;
    }
  }

  if (t.includes('-') && !t.includes(' ')) {
    t = t.replace(/-/g, ' ');
  }
  t = t.replace(/\s+/g, ' ').trim();

  if (t === t.toLowerCase()) {
    t = t.replace(/\b\w/g, (c) => c.toUpperCase());
  }

  return t || 'Manga';
}

/**
 * Deduplicate chapter lists by normalized chapter number and ID
 */
export function deduplicateChapters(chapters) {
  if (!Array.isArray(chapters)) return [];
  const seenNumbers = new Map();
  const seenIds = new Set();
  const result = [];

  for (const ch of chapters) {
    if (!ch || (!ch.id && !ch.chapter)) continue;

    if (ch.id && seenIds.has(ch.id)) continue;
    if (ch.id) seenIds.add(ch.id);

    let normKey = null;
    const parsedNum = parseFloat(ch.chapter);
    if (!isNaN(parsedNum)) {
      normKey = `num:${parsedNum}`;
    } else if (ch.chapter) {
      normKey = `str:${String(ch.chapter).toLowerCase().trim()}`;
    } else if (ch.title) {
      normKey = `title:${String(ch.title).toLowerCase().trim()}`;
    }

    if (normKey) {
      if (seenNumbers.has(normKey)) {
        const existingIdx = seenNumbers.get(normKey);
        const existing = result[existingIdx];
        const existingTitle = (existing.title || '').toLowerCase();
        const curTitle = (ch.title || '').toLowerCase();
        const genericTitle = `chapter ${ch.chapter}`.toLowerCase();

        if (
          (existingTitle === genericTitle || !existingTitle) &&
          curTitle &&
          curTitle !== genericTitle
        ) {
          result[existingIdx] = ch;
        }
        continue;
      }
      seenNumbers.set(normKey, result.length);
    }

    result.push(ch);
  }

  result.sort((a, b) => {
    const numA = parseFloat(a.chapter);
    const numB = parseFloat(b.chapter);
    if (!isNaN(numA) && !isNaN(numB)) return numB - numA;
    return 0;
  });

  return result;
}

/**
 * Fetch Manga Details & Full Chapter List
 */
export async function fetchMangaDetails(mangaId, refresh = false) {
  const cacheKey = `details_${mangaId}`;
  if (!refresh) {
    const cached = getClientCached(cacheKey);
    if (cached) return cached;
  }

  const baseUrl = getApiBaseUrl();
  const fallbackItem = FALLBACK_MANGA_CATALOG.find(
    (m) => m.id === mangaId || m.aliases?.includes(mangaId)
  ) || FALLBACK_MANGA_CATALOG.find((m) => {
    const q = String(mangaId || '').toLowerCase().replace(/^wc:|^webtoon:|^md:|^asura:|^vortex:|^thunder:|^flame:|^mk:/, '').replace(/[-_:]/g, ' ');
    const titleQ = m.title.toLowerCase().replace(/[-_:]/g, ' ');
    return q.includes(titleQ) || titleQ.includes(q);
  });

  // Fast resolution from rich static catalog
  if (fallbackItem && !refresh) {
    const result = {
      ...fallbackItem,
      id: mangaId,
      title: cleanTitle(fallbackItem.title),
      englishTitle: fallbackItem.englishTitle ? cleanTitle(fallbackItem.englishTitle) : null,
      coverUrl: getReliableCoverUrl(fallbackItem.title, fallbackItem.coverUrl),
      chapters: fallbackItem.chapters || []
    };
    setClientCached(cacheKey, result);
    return result;
  }

  try {
    const refreshQuery = refresh ? '&refresh=true' : '';
    const url = baseUrl 
      ? `${baseUrl}/api/manga/details?id=${encodeURIComponent(mangaId)}${refreshQuery}`
      : `/api/manga/details?id=${encodeURIComponent(mangaId)}${refreshQuery}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data) {
      if (data.title) data.title = cleanTitle(data.title);
      if (data.englishTitle) data.englishTitle = cleanTitle(data.englishTitle);
      if (data.description) data.description = decodeHtml(data.description);
      if (!data.author || !data.author.trim() || data.author.toLowerCase() === 'author') {
        data.author = 'Unknown Author';
      }
      if (data.coverUrl && needsImageProxy(data.coverUrl)) {
        const proxyPrefix = baseUrl ? `${baseUrl}/api/image-proxy` : '/api/image-proxy';
        data.coverUrl = `${proxyPrefix}?url=${encodeURIComponent(data.coverUrl)}`;
      }
      if (Array.isArray(data.chapters)) {
        data.chapters = deduplicateChapters(data.chapters);
        data.totalChapters = data.chapters.length;
      }
      setClientCached(cacheKey, data);
    }
    return data;
  } catch (err) {
    console.warn('fetchMangaDetails API warning, checking fallback:', err);
    if (fallbackItem) {
      const result = {
        ...fallbackItem,
        id: mangaId,
        title: cleanTitle(fallbackItem.title),
        englishTitle: fallbackItem.englishTitle ? cleanTitle(fallbackItem.englishTitle) : null,
        coverUrl: getReliableCoverUrl(fallbackItem.title, fallbackItem.coverUrl),
        chapters: fallbackItem.chapters || []
      };
      setClientCached(cacheKey, result);
      return result;
    }
    if (String(mangaId).startsWith('anilist:')) {
      const anilistItem = await fetchAniListDetails(mangaId);
      if (anilistItem) {
        setClientCached(cacheKey, anilistItem);
        return anilistItem;
      }
    }
    return null;
  }
}

/**
 * Fetch Smart Manga Recommendations / Suggestions
 */
export async function fetchMangaRecommendations(mangaId = '', genres = [], limit = 8) {
  const genresStr = Array.isArray(genres) ? genres.slice(0, 3).join(',') : String(genres || '');
  const cacheKey = `recs_${mangaId}_${genresStr}_${limit}`;
  const cached = getClientCached(cacheKey);
  if (cached) return cached;

  const baseUrl = getApiBaseUrl();
  const getFilteredCatalog = () => {
    const normMid = String(mangaId || '').toLowerCase().trim();
    const genreList = Array.isArray(genres)
      ? genres.map((g) => String(g).toLowerCase())
      : String(genres || '').toLowerCase().split(',').map((s) => s.trim()).filter(Boolean);

    const candidates = FALLBACK_MANGA_CATALOG.filter((m) => {
      const mid = m.id.toLowerCase();
      if (normMid && (mid === normMid || mid.includes(normMid) || normMid.includes(mid))) return false;
      if (m.aliases && m.aliases.some((a) => normMid && (a.toLowerCase() === normMid || a.toLowerCase().includes(normMid) || normMid.includes(a.toLowerCase())))) return false;
      const titleLower = m.title.toLowerCase();
      const engLower = (m.englishTitle || '').toLowerCase();
      if (normMid && (titleLower.includes(normMid) || normMid.includes(titleLower) || engLower.includes(normMid))) return false;
      return true;
    });

    if (genreList.length > 0) {
      candidates.sort((a, b) => {
        const matchA = (a.tags || []).filter((t) => genreList.includes(String(t).toLowerCase())).length;
        const matchB = (b.tags || []).filter((t) => genreList.includes(String(t).toLowerCase())).length;
        return matchB - matchA;
      });
    }

    return candidates.slice(0, limit).map(formatMangaItem);
  };

  try {
    const url = baseUrl
      ? `${baseUrl}/api/manga/recommendations?id=${encodeURIComponent(mangaId)}&genres=${encodeURIComponent(genresStr)}&limit=${limit}`
      : `/api/manga/recommendations?id=${encodeURIComponent(mangaId)}&genres=${encodeURIComponent(genresStr)}&limit=${limit}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const list = (data?.recommendations || []).map(formatMangaItem).filter(Boolean);
    if (list.length > 0) {
      setClientCached(cacheKey, list);
      return list;
    }
    const fallbackList = getFilteredCatalog();
    setClientCached(cacheKey, fallbackList);
    return fallbackList;
  } catch (err) {
    const fallbackList = getFilteredCatalog();
    setClientCached(cacheKey, fallbackList);
    return fallbackList;
  }
}

/**
 * Fetch Chapters for a Manga
 */
export async function fetchMangaChapters(mangaId, order = 'desc', refresh = false) {
  try {
    const details = await fetchMangaDetails(mangaId, refresh);
    if (!details || !details.chapters) return [];

    const chapters = [...details.chapters];
    chapters.sort((a, b) => {
      const numA = parseFloat(a.chapter);
      const numB = parseFloat(b.chapter);
      if (!isNaN(numA) && !isNaN(numB)) {
        if (numA !== numB) {
          return order === 'asc' ? numA - numB : numB - numA;
        }
      }
      return 0;
    });

    return chapters;
  } catch (err) {
    console.error('fetchMangaChapters failed:', err);
    return [];
  }
}

export function getChapterSourceUrl(mangaId, chapterId, chapterNumber, mangaTitle) {
  const num = String(chapterNumber || '').replace(/[^0-9.]/g, '') || (String(chapterId || '').match(/([0-9.]+)/)?.[1] || '1');
  const mid = String(mangaId || '').toLowerCase();
  const cid = String(chapterId || '').toLowerCase();
  const title = String(mangaTitle || '').toLowerCase();

  if (mid.includes('fortune-telling') || cid.includes('ftp') || cid.includes('fortune-telling') || title.includes('fortune-telling')) {
    return `https://afortunetellingprincess.com/a-fortune-telling-princess-manhwa-chapter-${num}/`;
  }
  if (mid.includes('stepmother') || cid.includes('stepmother') || title.includes('stepmother')) {
    return `https://kingofshojo.com/the-despised-stepmother-begins-her-second-life-chapter-${num}/`;
  }
  if (mid.includes('solo') || cid.includes('solo') || title.includes('solo leveling')) {
    return `https://ww4.readsololeveling.org/chapter/solo-leveling-chapter-${num}/`;
  }
  if (mid.includes('omniscient') || cid.includes('orv') || title.includes('omniscient reader')) {
    return `https://w1.omniscientreadersviewpoint.com/manga/omniscient-readers-viewpoint-chapter-${num}/`;
  }
  if (mid.includes('damn-reincarnation') || mid.includes('blasted') || title.includes('reincarnat')) {
    return `https://asurascans.com/comics/damn-reincarnation-3ebcc5a9/chapter/${num}`;
  }
  if (mid.includes('barbarian') || title.includes('barbarian')) {
    return `https://asurascans.com/comics/surviving-the-game-as-a-barbarian-ab39de10/chapter/${num}`;
  }
  if (mid.includes('estate') || title.includes('greatest estate')) {
    return `https://asurascans.com/comics/the-greatest-estate-developer-ab39de10/chapter/${num}`;
  }

  if (mid.includes('one-piece') || cid.includes('one-piece') || title.includes('one piece')) {
    return `https://mangapill.com/chapters/2-${10000000 + (parseInt(num) * 1000)}/one-piece-chapter-${num}`;
  }
  if (mid.includes('berserk') || cid.includes('berserk') || title.includes('berserk')) {
    return `https://mangapill.com/chapters/1-${10000000 + (parseInt(num) * 1000)}/berserk-chapter-${num}`;
  }

  if (cid.startsWith('http://') || cid.startsWith('https://')) {
    return chapterId;
  }
  return `https://www.google.com/search?q=${encodeURIComponent(cleanTitle(title) + ' chapter ' + num + ' read online')}`;
}

/**
 * Fetch All Real Pages for a Chapter
 */
export async function fetchChapterPages(chapterId, mangaId = null, chapterNumber = null, mangaTitle = null) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000); // 20s timeout
  const baseUrl = getApiBaseUrl();

  try {
    const url = baseUrl
      ? `${baseUrl}/api/manga/read?chapterId=${encodeURIComponent(chapterId)}`
      : `/api/manga/read?chapterId=${encodeURIComponent(chapterId)}`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.pages) && data.pages.length > 0) {
        if (baseUrl) {
          data.pages = data.pages.map((p) => ({
            ...p,
            url: p.url && p.url.startsWith('/api/') ? `${baseUrl}${p.url}` : p.url,
          }));
        }
        return data;
      }
    }
  } catch (err) {
    clearTimeout(timer);
    console.warn('fetchChapterPages API warning, attempting client-side resolution:', err.message);
  }

  // Client-side direct resolution for A Fortune-Telling Princess on static hosting
  const chNum = String(chapterNumber || '').replace(/[^0-9.]/g, '') || (String(chapterId || '').match(/([0-9.]+)/)?.[1] || '1');
  const mid = String(mangaId || '').toLowerCase();
  const cid = String(chapterId || '').toLowerCase();
  const title = String(mangaTitle || '').toLowerCase();
  const sourceUrl = getChapterSourceUrl(mangaId, chapterId, chapterNumber, mangaTitle);

  if (mid.includes('fortune-telling') || cid.includes('ftp') || cid.includes('fortune-telling') || title.includes('fortune-telling')) {
    const totalPages = 28;
    const pages = Array.from({ length: totalPages }, (_, idx) => {
      const p = idx + 1;
      const imgUrl = `https://afortunetellingprincess.com/wp-content/uploads/manga/a-fortune-telling-princess-manhwa/chapter-${chNum}/${p}.jpg`;
      return {
        pageNumber: p,
        url: baseUrl ? `${baseUrl}/api/image-proxy?url=${encodeURIComponent(imgUrl)}` : imgUrl,
        originalUrl: imgUrl,
      };
    });
    return {
      chapterId,
      totalPages: pages.length,
      pages,
      sourceUrl
    };
  }

  // Client-side fallback for MangaDex on static hosting (e.g. GitHub Pages)
  if (chapterId && (chapterId.startsWith('md_ch:') || chapterId.startsWith('md:'))) {
    const cleanId = chapterId.replace(/^md_ch:|^md:/, '');
    try {
      const res = await fetch(`https://api.mangadex.org/at-home/server/${cleanId}`);
      if (res.ok) {
        const json = await res.json();
        const bUrl = json.baseUrl;
        const hash = json.chapter?.hash;
        const files = json.chapter?.dataSaver || json.chapter?.data || [];
        const folder = json.chapter?.dataSaver ? 'data-saver' : 'data';
        const pages = files.map((fileName, idx) => {
          const directUrl = `${bUrl}/${folder}/${hash}/${fileName}`;
          return {
            pageNumber: idx + 1,
            url: baseUrl ? `${baseUrl}/api/image-proxy?url=${encodeURIComponent(directUrl)}` : directUrl,
            originalUrl: directUrl,
          };
        });
        return { chapterId, totalPages: pages.length, pages, sourceUrl };
      }
    } catch {}
  }

  return {
    chapterId,
    totalPages: 0,
    pages: [],
    sourceUrl,
    warning: `Chapter ${chNum} images are temporarily synchronizing. Please try another chapter.`
  };
}

export function getFallbackCover(title = 'Manga') {
  const clean = (title || 'Manga').slice(0, 24);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="600" viewBox="0 0 400 600">
    <defs>
      <linearGradient id="cyberBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0a0f1d"/>
        <stop offset="50%" stop-color="#0e172a"/>
        <stop offset="100%" stop-color="#161b33"/>
      </linearGradient>
      <linearGradient id="neonGlow" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#06b6d4"/>
        <stop offset="100%" stop-color="#f43f5e"/>
      </linearGradient>
    </defs>
    <rect width="400" height="600" fill="url(#cyberBg)"/>
    <rect x="20" y="20" width="360" height="560" rx="16" fill="none" stroke="url(#neonGlow)" stroke-width="2" stroke-opacity="0.35"/>
    <circle cx="200" cy="220" r="70" fill="url(#neonGlow)" fill-opacity="0.12"/>
    <text x="200" y="245" text-anchor="middle" fill="#06b6d4" fill-opacity="0.75" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="64" font-weight="900">漫画</text>
    <text x="200" y="360" text-anchor="middle" fill="#ffffff" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="22" font-weight="800">${clean.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</text>
    <rect x="150" y="380" width="100" height="2" fill="url(#neonGlow)" rx="1"/>
    <text x="200" y="415" text-anchor="middle" fill="#38bdf8" font-family="'JetBrains Mono', monospace" font-size="11" font-weight="700" letter-spacing="3">KURONEKO // UNIVERSE</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Format a Manga item into standard shape
 */
function formatMangaItem(item) {
  if (!item) return null;
  const safeTitle = cleanTitle(item.title);
  const safeEnglishTitle = item.englishTitle ? cleanTitle(item.englishTitle) : null;
  const reliableCover = getReliableCoverUrl(safeTitle, item.coverUrl);
  const baseUrl = getApiBaseUrl();

  const proxiedCover = reliableCover
    ? (needsImageProxy(reliableCover) 
        ? (baseUrl ? `${baseUrl}/api/image-proxy?url=${encodeURIComponent(reliableCover)}` : `/api/image-proxy?url=${encodeURIComponent(reliableCover)}`)
        : reliableCover)
    : getFallbackCover(safeTitle);

  return {
    id: item.id,
    title: safeTitle,
    englishTitle: safeEnglishTitle,
    coverUrl: proxiedCover,
    rawCoverUrl: reliableCover,
    status: item.status || 'Ongoing',
    author: item.author && item.author.trim() ? decodeHtml(item.author) : 'Unknown Author',
    tags: (item.tags || ['Manga', 'Action']).map(decodeHtml),
    year: item.year || null,
    sourceName: item.sourceName || (
      item.id?.startsWith('asura:') ? 'Asura Scans' :
      item.id?.startsWith('webtoon:') ? 'Webtoon' : 'MangaPill'
    ),
    provider: item.provider || (
      item.id?.startsWith('asura:') ? 'asura' :
      item.id?.startsWith('webtoon:') ? 'webtoon' : 'mangapill'
    ),
    latestChapter: item.latestChapter || (item.totalChapters ? String(item.totalChapters) : null),
    totalChapters: item.totalChapters ? Number(item.totalChapters) : (item.latestChapter && !isNaN(parseFloat(item.latestChapter)) ? Math.floor(parseFloat(item.latestChapter)) : null),
    lastUpdated: item.lastUpdated || null,
  };
}

/**
 * Fetch Real-time Manga News & Updates
 */
export async function fetchMangaNews(title = '', limit = 10) {
  try {
    const baseUrl = getApiBaseUrl();
    const q = title ? `?title=${encodeURIComponent(title)}&limit=${limit}` : `?limit=${limit}`;
    const url = baseUrl ? `${baseUrl}/api/manga/news${q}` : `/api/manga/news${q}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.warn('fetchMangaNews error:', err.message);
    return [];
  }
}
