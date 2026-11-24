/**
 * Frontend Manga API Client
 * Connects to the integrated complete manga provider with automatic fallback protection
 */

export const FALLBACK_MANGA_CATALOG = [
  // --- TOP GLOBAL MANHWA & WEBSERIES ---
  {
    id: 'kat:lookism.693',
    aliases: ['lookism', 'webtoon:lookism', 'wc:01J76XYBD282Y3XKX0KRGD64Q5'],
    title: 'Lookism',
    englishTitle: 'Lookism',
    coverUrl: 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/medium/bx86848-4CSItSclJUvi.jpg',
    status: 'Ongoing',
    score: '9.3',
    year: '2014',
    author: 'Park Tae-jun',
    description: 'Daniel Park, an overweight and unattractive high school student bullied relentlessly, mysteriously wakes up in a tall, handsome, and physically gifted new body.',
    tags: ['Action', 'School', 'Drama', 'Supernatural', 'Manhwa'],
    sourceName: 'MangaKatana',
    totalChapters: 633,
    latestChapter: '632',
    chapters: Array.from({ length: 633 }, (_, i) => {
      const chNum = 633 - i;
      return {
        id: `kat_ch:lookism.693:c${chNum}`,
        chapter: String(chNum),
        title: `Chapter ${chNum}`,
      };
    })
  },
  {
    id: 'wc:01J76XYGVNHEER7G6M90C6YCTW',
    aliases: [
      '01J76XYGVNHEER7G6M90C6YCTW',
      'wc:01J76XYGVNHEER7G6M90C6YCTW',
      'kat:worlds-strongest-troll.26644',
      'worlds-strongest-troll',
      'world-s-strongest-troll',
      "world's strongest troll",
      "the world's strongest troll",
      'asura:worlds-strongest-troll-7de80a82',
      'asura:worlds-strongest-troll-f212c582'
    ],
    title: "World's Strongest Troll",
    englishTitle: "World's Strongest Troll",
    coverUrl: 'https://mangakatana.com/imgs/cover/04e/1f/7b189.jpg',
    status: 'Completed',
    score: '9.5',
    year: '2022',
    author: 'Dex',
    description: "Jaeyeong's chaotic VR gaming adventures in Arcadia as the legendary troll DEX who overcomes every insurmountable obstacle through sheer game knowledge and unconventional tactics!",
    tags: ['Action', 'Comedy', 'Fantasy', 'Virtual Reality', 'Manhwa'],
    sourceName: 'WeebCentral',
    totalChapters: 198,
    latestChapter: '198',
    chapters: Array.from({ length: 198 }, (_, i) => {
      const chNum = 198 - i;
      return {
        id: `wc_ch:01J76XYGVNHEER7G6M90C6YCTW:${chNum}`,
        chapter: String(chNum),
        title: `Chapter ${chNum}`,
      };
    })
  },
  {
    id: 'wc:01J76XYFAESZTJT5AQ1SPFKYXR',
    aliases: [
      '01J76XYFAESZTJT5AQ1SPFKYXR',
      'wc:01J76XYFAESZTJT5AQ1SPFKYXR',
      'webtoon:ks:my-in-laws-are-obsessed-with-me',
      'my-in-laws-are-obsessed-with-me',
      'my in laws are obsessed with me',
      'my-in-laws-are-my-beloved-in-laws',
      'my in-laws are my beloved in-laws',
      'md:c44b5b1d-60cf-4faf-be2c-0a807200358f'
    ],
    title: 'My In-Laws Are Obsessed With Me',
    englishTitle: 'My In-Laws Are Obsessed With Me',
    coverUrl: 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/medium/bx142894-SRinclU1kzu9.jpg',
    status: 'Ongoing',
    score: '9.6',
    year: '2021',
    author: 'Seungu & Han Yoon-seol',
    description: 'Pereshati regresses after being betrayed and poisoned by her family. To safeguard her second life, she proposes a contract marriage with the cursed Grand Duke Therdeo Lapileon.',
    tags: ['Fantasy', 'Romance', 'Reincarnation', 'Drama', 'Manhwa'],
    sourceName: 'WeebCentral',
    totalChapters: 130,
    latestChapter: '130',
    chapters: Array.from({ length: 130 }, (_, i) => {
      const chNum = 130 - i;
      return {
        id: `wc_ch:01J76XYFAESZTJT5AQ1SPFKYXR:${chNum}`,
        chapter: String(chNum),
        title: `Chapter ${chNum}`,
      };
    })
  },
  {
    id: 'kat:tower-of-god.465',
    aliases: ['tower-of-god', 'webtoon:tower-of-god', 'tower of god', 'wc:01J76XY7M0W9WWJ55VJYYB2J1S'],
    title: 'Tower of God',
    englishTitle: 'Tower of God',
    coverUrl: 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/medium/bx85143-23oup3ETbFJk.jpg',
    status: 'Ongoing',
    score: '9.4',
    year: '2010',
    author: 'SIU',
    description: 'What do you desire? Fortune? Glory? Power? Revenge? Whatever you desire, it is here, at the peak of the Tower.',
    tags: ['Action', 'Adventure', 'Fantasy', 'Mystery', 'Manhwa'],
    sourceName: 'MangaKatana',
    totalChapters: 653,
    latestChapter: '652',
    chapters: Array.from({ length: 653 }, (_, i) => {
      const chNum = 653 - i;
      return {
        id: `kat_ch:tower-of-god.465:c${chNum}`,
        chapter: String(chNum),
        title: `Chapter ${chNum}`,
      };
    })
  },
  {
    id: 'kat:wind-breaker.467',
    aliases: ['wind-breaker', 'webtoon:wind-breaker', 'wind breaker', 'wc:01J76XYA1TQYKV6W4BCMR2WD5M'],
    title: 'Wind Breaker',
    englishTitle: 'Wind Breaker',
    coverUrl: 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/medium/bx135083-TQbNFWKGJJHW.jpg',
    status: 'Ongoing',
    score: '9.5',
    year: '2013',
    author: 'Jo Yongseok',
    description: 'Jay is an honors student whose sole focus is academics—until he is plunged into the high-stakes world of underground street cycling!',
    tags: ['Sports', 'Action', 'Drama', 'School', 'Manhwa'],
    sourceName: 'MangaKatana',
    totalChapters: 557,
    latestChapter: '556.5',
    chapters: Array.from({ length: 557 }, (_, i) => {
      const chNum = 557 - i;
      return {
        id: `kat_ch:wind-breaker.467:c${chNum}`,
        chapter: String(chNum),
        title: `Chapter ${chNum}`,
      };
    })
  },
  {
    id: 'kat:eleceed.115',
    aliases: ['eleceed', 'webtoon:eleceed', 'wc:01J76XYD3Q2Q7HYYMB3FSDPSKC'],
    title: 'Eleceed',
    englishTitle: 'Eleceed',
    coverUrl: 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/medium/bx106929-flAUvHZDUz5v.jpg',
    status: 'Ongoing',
    score: '9.6',
    year: '2018',
    author: 'Son Jaeho & ZHENA',
    description: 'Jiwoo has super-speed reflexes. Kayden is a deadly awakener on the run who transforms into a fat, fluffy street cat!',
    tags: ['Action', 'Comedy', 'Supernatural', 'Manhwa'],
    sourceName: 'MangaKatana',
    totalChapters: 425,
    latestChapter: '425',
    chapters: Array.from({ length: 425 }, (_, i) => {
      const chNum = 425 - i;
      return {
        id: `kat_ch:eleceed.115:c${chNum}`,
        chapter: String(chNum),
        title: `Chapter ${chNum}`,
      };
    })
  },
  {
    id: 'wc:01J76XYDT7H7ANER8KJG5R9SJV',
    aliases: [
      '01J76XYDT7H7ANER8KJG5R9SJV',
      'wc:01J76XYDT7H7ANER8KJG5R9SJV',
      'asura:nano-machine-ab39de10',
      'nano-machine',
      'webtoon:nano-machine'
    ],
    title: 'Nano Machine',
    englishTitle: 'Nano Machine',
    coverUrl: 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/medium/bx120980-RZ9WLd0o9hyo.jpg',
    status: 'Ongoing',
    score: '9.5',
    year: '2020',
    author: 'Jeolmu Hyeon',
    description: 'Cheon Yeo-woon is an illegitimate prince of the Demonic Cult marked for assassination until a descendant injects him with nanomachines.',
    tags: ['Action', 'Martial Arts', 'Sci-Fi', 'Murim'],
    sourceName: 'WeebCentral',
    totalChapters: 339,
    latestChapter: '339',
    chapters: Array.from({ length: 339 }, (_, i) => {
      const chNum = 339 - i;
      return {
        id: `wc_ch:01J76XYDT7H7ANER8KJG5R9SJV:${chNum}`,
        chapter: String(chNum),
        title: `Chapter ${chNum}`,
      };
    })
  },
  {
    id: 'wc:01J76XYEVCSS5ANBCJZ4ZF9P65',
    aliases: [
      '01J76XYEVCSS5ANBCJZ4ZF9P65',
      'wc:01J76XYEVCSS5ANBCJZ4ZF9P65',
      'asura:return-of-the-mount-hua-sect-ab39de10',
      'return-of-the-mount-hua-sect',
      'mount-hua',
      'return-of-the-blossoming-blade'
    ],
    title: 'Return of the Mount Hua Sect',
    englishTitle: 'Return of the Mount Hua Sect',
    coverUrl: 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/medium/bx132144-i5B4VnG9sRgh.png',
    status: 'Ongoing',
    score: '9.7',
    year: '2021',
    author: 'Biga',
    description: 'Chung Myung, the 13th disciple of the Great Mount Hua Sect, slays the Heavenly Demon and awakens a century later to restore his fallen sect.',
    tags: ['Action', 'Adventure', 'Comedy', 'Martial Arts'],
    sourceName: 'WeebCentral',
    totalChapters: 194,
    latestChapter: '194',
    chapters: Array.from({ length: 194 }, (_, i) => {
      const chNum = 194 - i;
      return {
        id: `wc_ch:01J76XYEVCSS5ANBCJZ4ZF9P65:${chNum}`,
        chapter: String(chNum),
        title: `Chapter ${chNum}`,
      };
    })
  },
  {
    id: 'wc:01J76XYEZ1BQJM22H3RREE1XMG',
    aliases: [
      '01J76XYEZ1BQJM22H3RREE1XMG',
      'wc:01J76XYEZ1BQJM22H3RREE1XMG',
      'asura:reincarnation-of-the-suicidal-battle-god-ab39de10',
      'doom-breaker',
      'reincarnation-of-the-suicidal-battle-god'
    ],
    title: 'Doom Breaker',
    englishTitle: 'Reincarnation of the Suicidal Battle God',
    coverUrl: 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/medium/bx136220-u9sewv3u02mN.jpg',
    status: 'Ongoing',
    score: '9.5',
    year: '2021',
    author: 'Cheong-dam',
    description: 'Zephyr is the last surviving human in a world destroyed by gods. Granted a second chance by the gods who found his struggle entertaining, he regresses to get revenge.',
    tags: ['Action', 'Fantasy', 'Reincarnation', 'Manhwa'],
    sourceName: 'WeebCentral',
    totalChapters: 101,
    latestChapter: '101',
    chapters: Array.from({ length: 101 }, (_, i) => {
      const chNum = 101 - i;
      return {
        id: `wc_ch:01J76XYEZ1BQJM22H3RREE1XMG:${chNum}`,
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
    coverUrl: 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/medium/bx30021-FE6kmrfpuKyb.jpg',
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
    aliases: ['one-punch-man', 'one punch man', 'opm', '01J76XY7KT7J224EBK6J816Y1Q', 'wc:01J76XY7KT7J224EBK6J816Y1Q'],
    title: 'One-Punch Man',
    englishTitle: 'One-Punch Man',
    coverUrl: 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx74347-sZpmNJ5xLwRK.jpg',
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
  {
    id: 'wc:01J76XYD7E91K8QP6CY0Y53900',
    aliases: ['01J76XYD7E91K8QP6CY0Y53900', 'blue-lock', 'blue lock'],
    title: 'Blue Lock',
    englishTitle: 'Blue Lock',
    coverUrl: 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx106130-yPNeuSu75ey1.jpg',
    status: 'Ongoing',
    score: '9.3',
    year: '2018',
    author: 'Muneyuki Kaneshiro & Yusuke Nomura',
    description: 'Japan’s desire for World Cup glory leads the Japanese Football Association to launch a new rigorous training program to find the national team’s next star striker. Three hundred high school strikers are pitted against each other in the Blue Lock facility!',
    tags: ['Action', 'Sports', 'Drama', 'Shounen'],
    sourceName: 'WeebCentral',
    totalChapters: 280,
    latestChapter: '280',
    chapters: Array.from({ length: 280 }, (_, i) => {
      const chNum = 280 - i;
      return {
        id: `wc_ch:01J76XYD7E91K8QP6CY0Y53900:c${chNum}`,
        chapter: String(chNum),
        title: `Chapter ${chNum}`,
      };
    })
  },
  {
    id: 'wc:01J76XYE3130E1W5HKTJ7VD912',
    aliases: ['01J76XYE3130E1W5HKTJ7VD912', 'sakamoto-days', 'sakamoto days'],
    title: 'Sakamoto Days',
    englishTitle: 'Sakamoto Days',
    coverUrl: 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx125828-p78Z8SflkfmO.jpg',
    status: 'Ongoing',
    score: '9.4',
    year: '2020',
    author: 'Yuto Suzuki',
    description: 'Taro Sakamoto was an unrivaled hitman, earning legendary status in the underworld until he fell in love, married, retired, and gained weight running a convenience store. But the criminal underworld has not forgotten him!',
    tags: ['Action', 'Comedy', 'Supernatural', 'Shounen'],
    sourceName: 'WeebCentral',
    totalChapters: 195,
    latestChapter: '195',
    chapters: Array.from({ length: 195 }, (_, i) => {
      const chNum = 195 - i;
      return {
        id: `wc_ch:01J76XYE3130E1W5HKTJ7VD912:c${chNum}`,
        chapter: String(chNum),
        title: `Chapter ${chNum}`,
      };
    })
  },
  {
    id: 'wc:01J76XYE23859ZWDP7BJ520AKY',
    aliases: ['01J76XYE23859ZWDP7BJ520AKY', 'kat:the-beginning-after-the-end.21950', 'the-beginning-after-the-end', 'tbate'],
    title: 'The Beginning After the End',
    englishTitle: 'The Beginning After the End',
    coverUrl: 'https://temp.compsci88.com/cover/fallback/01J76XYE23859ZWDP7BJ520AKY.jpg',
    status: 'Ongoing',
    score: '9.5',
    year: '2018',
    author: 'TurtleMe & Fuyuki23',
    description: 'King Grey has unrivaled strength, wealth, and prestige in a world governed by martial ability. However, solitude lingers closely behind those with great power. Reincarnated into a new world filled with magic and monsters, the king has a second chance to relive his life!',
    tags: ['Action', 'Adventure', 'Fantasy', 'Manhwa', 'Webtoon', 'Reincarnation'],
    sourceName: 'WeebCentral',
    totalChapters: 185,
    latestChapter: '185',
    chapters: Array.from({ length: 185 }, (_, i) => {
      const chNum = 185 - i;
      return {
        id: `wc_ch:01J76XYE23859ZWDP7BJ520AKY:c${chNum}`,
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
      'the-despised-stepmother-begins-her-second-life',
      'stepmother-second-life'
    ],
    title: 'The Despised Stepmother Begins Her Second Life',
    englishTitle: "The Step Mother's Began Her Second Life",
    coverUrl: 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx213993-T1BvCf8cBvlt.jpg',
    status: 'Ongoing',
    score: '9.3',
    year: '2024',
    author: 'Gwon Gyeoul',
    description: 'After dying from betrayal, she regresses back to the start of her second marriage with her stepchildren. This time, she will protect them and take control of her destiny! (Webtoon Manhwa adaptation ongoing at Chapter 35; original novel completed).',
    tags: ['Romance', 'Drama', 'Fantasy', 'Regression', 'Manhwa'],
    sourceName: 'Webtoon',
    totalChapters: 35,
    latestChapter: '35',
    chapters: Array.from({ length: 35 }, (_, idx) => {
      const num = 35 - idx;
      return {
        id: `webtoon:stepmother:${num}`,
        chapter: String(num),
        title: `Chapter ${num}`,
      };
    })
  },
  {
    id: 'kat:a-stepmothers-fairy-tale.23902',
    aliases: [
      'the-stepmother-has-left',
      'the stepmother has left',
      'the-step-mother-has-left',
      'a-stepmothers-fairy-tale',
      'a stepmothers fairy tale',
      'a-stepmothers-marchen',
      'the-fantasie-of-a-stepmother',
      'the fantasie of a stepmother',
      'md:73f00a6a-dc33-49f6-beb0-98feb29ce0cc',
      '73f00a6a-dc33-49f6-beb0-98feb29ce0cc',
      'wc:01J76XYDQ9JTWW4THBJWPXNJ9H',
      '01J76XYDQ9JTWW4THBJWPXNJ9H'
    ],
    title: "The Stepmother Has Left",
    englishTitle: "A Stepmother's Fairy Tale",
    coverUrl: 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx111075-ZSqT1Z2XASRp.jpg',
    status: 'Ongoing',
    score: '9.6',
    year: '2019',
    author: 'Spice&Kitty & ORKA',
    description: 'The iron widow, the spider widow, male hunter, the witch of Neuwanstein Castle... these were all the words used to describe the Marchioness Shuri Von Neuwanstein. Despite receiving such criticism from the world, she raised her children who were not related to her by blood. When she died, she woke up seven years in the past...',
    tags: ['Fantasy', 'Romance', 'Drama', 'Regression', 'Manhwa'],
    sourceName: 'MangaKatana',
    totalChapters: 154,
    latestChapter: '153',
    chapters: Array.from({ length: 154 }, (_, i) => {
      const chNum = 153 - i;
      return {
        id: `kat_ch:a-stepmothers-fairy-tale.23902:c${chNum}`,
        chapter: String(chNum),
        title: `Chapter ${chNum}`,
      };
    })
  },
  {
    id: 'wc:01J76XYCPSY3C4BNPBRY8JMCBE',
    aliases: [
      '01J76XYCPSY3C4BNPBRY8JMCBE',
      'wc:01J76XYCPSY3C4BNPBRY8JMCBE',
      'webtoon:solo-leveling',
      'webtoon:solo',
      'solo-leveling',
      'solo'
    ],
    title: 'Solo Leveling',
    englishTitle: 'Solo Leveling (Only I Level Up)',
    coverUrl: 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx105398-b673Vt5ZSuz3.jpg',
    status: 'Completed',
    score: '9.6',
    year: '2018',
    author: 'Chugong & DUBU (REDICE)',
    description: '10 years ago, after "the Gate" that connected the real world with the monster world opened, ordinary hunter Sung Jin-woo receives a quest log that only he can see!',
    tags: ['Action', 'Fantasy', 'Supernatural', 'Manhwa'],
    sourceName: 'WeebCentral',
    totalChapters: 201,
    latestChapter: '201',
    chapters: Array.from({ length: 201 }, (_, i) => {
      const chNum = 201 - i;
      return {
        id: `wc_ch:01J76XYCPSY3C4BNPBRY8JMCBE:${chNum}`,
        chapter: String(chNum),
        title: `Chapter ${chNum}`,
      };
    })
  },
  {
    id: 'wc:01J76XYDMWWJX3T4BFWR84FQQK',
    aliases: [
      '01J76XYDMWWJX3T4BFWR84FQQK',
      'wc:01J76XYDMWWJX3T4BFWR84FQQK',
      'webtoon:omniscient-reader',
      'webtoon:orv',
      'omniscient-reader',
      'orv',
      'omniscient-readers-viewpoint'
    ],
    title: "Omniscient Reader's Viewpoint",
    englishTitle: "Omniscient Reader's Viewpoint",
    coverUrl: 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx119257-Pi21aq3ey9GG.jpg',
    status: 'Ongoing',
    score: '9.6',
    year: '2020',
    author: 'sing N song & Sleepy-C',
    description: 'Kim Dokja was an ordinary office worker whose sole interest was reading web novels. When his favorite apocalyptic novel becomes reality, he is the only person who knows the ending!',
    tags: ['Action', 'Fantasy', 'Apocalypse', 'System'],
    sourceName: 'WeebCentral',
    totalChapters: 312,
    latestChapter: '312',
    chapters: Array.from({ length: 312 }, (_, i) => {
      const chNum = 312 - i;
      return {
        id: `wc_ch:01J76XYDMWWJX3T4BFWR84FQQK:${chNum}`,
        chapter: String(chNum),
        title: `Chapter ${chNum}`,
      };
    })
  },
  {
    id: 'wc:01J76XYG12YTB3J27FVBM256V8',
    aliases: [
      '01J76XYG12YTB3J27FVBM256V8',
      'wc:01J76XYG12YTB3J27FVBM256V8',
      'asura:damn-reincarnation-3ebcc5a9',
      'damn-reincarnation',
      'my-blasted-reincarnated-life'
    ],
    title: 'My Blasted Reincarnated Life',
    englishTitle: 'Damn Reincarnation',
    coverUrl: 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx151512-q0Xddr1JNKNq.png',
    status: 'Ongoing',
    score: '9.3',
    year: '2022',
    author: 'Mokma & Jeong-Yeol Park',
    description: 'When the warrior Hamel sacrifices himself to protect his rival Bermut Lionhart, he vows to eliminate the demon kings. Reincarnated 300 years later as Eugene Lionhart in his rival bloodline, he begins his quest!',
    tags: ['Action', 'Adventure', 'Fantasy', 'Reincarnation'],
    sourceName: 'WeebCentral',
    totalChapters: 101,
    latestChapter: '101',
    chapters: Array.from({ length: 101 }, (_, i) => {
      const chNum = 101 - i;
      return {
        id: `wc_ch:01J76XYG12YTB3J27FVBM256V8:${chNum}`,
        chapter: String(chNum),
        title: `Chapter ${chNum}`,
      };
    })
  },
  {
    id: 'wc:01J76XYG976314R2DM2DKQRBGS',
    aliases: [
      '01J76XYG976314R2DM2DKQRBGS',
      'wc:01J76XYG976314R2DM2DKQRBGS',
      'asura:surviving-game-barbarian',
      'surviving-the-game-as-a-barbarian',
      'barbarian'
    ],
    title: 'Surviving The Game as a Barbarian',
    englishTitle: 'Surviving The Game as a Barbarian',
    coverUrl: 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/medium/bx164857-MVeV0leMZb0m.jpg',
    status: 'Ongoing',
    score: '9.4',
    year: '2023',
    author: 'Han D-Seul & Jung Yoon-kang',
    description: 'After playing the impossible 2D RPG Dungeon and Stone for 9 years, Lee Hansoo beats the final boss and wakes up inside the game as a savage barbarian!',
    tags: ['Action', 'Adventure', 'Fantasy', 'System'],
    sourceName: 'WeebCentral',
    totalChapters: 170,
    latestChapter: '170',
    chapters: Array.from({ length: 170 }, (_, i) => {
      const chNum = 170 - i;
      return {
        id: `wc_ch:01J76XYG976314R2DM2DKQRBGS:${chNum}`,
        chapter: String(chNum),
        title: `Chapter ${chNum}`,
      };
    })
  },
  {
    id: 'wc:01J76XYF6V9BDFSRRTY2C65SBS',
    aliases: [
      '01J76XYF6V9BDFSRRTY2C65SBS',
      'wc:01J76XYF6V9BDFSRRTY2C65SBS',
      'asura:greatest-estate-developer',
      'the-greatest-estate-developer',
      'estate-developer'
    ],
    title: 'The Greatest Estate Developer',
    englishTitle: 'The Greatest Estate Developer',
    coverUrl: 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx140407-fJQr0fmqq1IO.png',
    status: 'Ongoing',
    score: '9.7',
    year: '2021',
    author: 'BK_Moon & Kim Hyunsoo',
    description: 'Civil engineering student Suho Kim falls asleep reading a fantasy novel and wakes up as Lloyd Frontera, a good-for-nothing noble in massive debt. Using modern engineering, he creates an empire!',
    tags: ['Comedy', 'Fantasy', 'Reincarnation', 'Architecture'],
    sourceName: 'WeebCentral',
    totalChapters: 225,
    latestChapter: '225',
    chapters: Array.from({ length: 225 }, (_, i) => {
      const chNum = 225 - i;
      return {
        id: `wc_ch:01J76XYF6V9BDFSRRTY2C65SBS:${chNum}`,
        chapter: String(chNum),
        title: `Chapter ${chNum}`,
      };
    })
  }
];

export const KNOWN_CHAPTER_COUNTS = {
  'lookism': 633,
  'tower of god': 653,
  'wind breaker': 557,
  'eleceed': 425,
  'mercenary enrollment': 230,
  'teenage mercenary': 230,
  'nano machine': 339,
  'the beginning after the end': 190,
  'tbate': 190,
  'return of the mount hua sect': 194,
  'mount hua': 194,
  'reincarnation of the suicidal battle god': 101,
  'doom breaker': 101,
  'reaper of the drifting moon': 215,
  'murim login': 190,
  'a fortune-telling princess': 176,
  'the despised stepmother begins her second life': 35,
  'the step mother\'s began her second life': 35,
  'the stepmother has left': 154,
  'the step mother has left': 154,
  'a stepmothers fairy tale': 154,
  'a stepmother\'s fairy tale': 154,
  'the fantasie of a stepmother': 173,
  'my in-laws are obsessed with me': 137,
  'my in laws are obsessed with me': 137,
  'solo leveling': 201,
  'omniscient reader': 312,
  'omniscient readers viewpoint': 312,
  'damn reincarnation': 101,
  'surviving the game as a barbarian': 170,
  'barbarian': 170,
  'the greatest estate developer': 225,
  'greatest estate developer': 225,
  'one piece': 1120,
  'berserk': 376,
  'naruto': 700,
  'bleach': 686,
  'jujutsu kaisen': 271,
  'chainsaw man': 180,
  'death note': 108,
  'one-punch man': 215,
  'one punch man': 215,
  'tokyo ghoul': 143,
  'black clover': 375,
  'blue lock': 280,
  'sakamoto days': 190,
  'oshi no ko': 166,
  'haikyuu': 402,
  'dragon ball super': 103,
  'fortune-telling princess': 176,
  'world\'s strongest troll': 197,
  'worlds strongest troll': 197,
  'the world\'s strongest troll': 197,
  'mount hua': 150,
  'demon slayer': 205,
  'attack on titan': 139,
  'hunter x hunter': 400,
  'spy x family': 105,
  'frieren': 135,
  'dandadan': 180,
  'kaiju no 8': 115,
  'vinland saga': 215,
  'vagabond': 327,
  'kingdom': 815,
  'overgeared': 230,
  'sss class suicide hunter': 120,
  'tomb raider king': 411,
  'magic emperor': 600,
  'martial peak': 3700,
  'tales of demons and gods': 480,
  'apotheosis': 1100,
  'leveling with the gods': 120,
  'pick me up': 115,
  'second life ranker': 170,
  'the boxer': 104,
  'sweet home': 141,
  'bastard': 94,
  'weak hero': 267,
  'god of high school': 572,
  'noblesse': 544,
  'hardcore leveling warrior': 320,
  'reformation of the deadbeat noble': 125,
  'swordmasters youngest son': 130,
  'standard of reincarnation': 115,
  'terminally ill genius dark knight': 95,
  'legend of the northern blade': 190,
  'peerless dad': 275,
  'gosu': 233,
  'poison dragon': 150,
  'lightning degree': 180,
  'wandering warrior of wudang': 140,
  'infinite mage': 95,
};

export function getKnownChapterCount(title) {
  if (!title) return 0;
  const clean = title.toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
  if (!clean) return 0;
  for (const [key, count] of Object.entries(KNOWN_CHAPTER_COUNTS)) {
    const cleanKey = key.toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
    if (clean === cleanKey || clean.includes(cleanKey)) {
      return count;
    }
  }
  return 0;
}

export const BROKEN_COVER_HASHES = [
  'bx69363-22ZgqCqKqB7b', // old one punch man
  'bx106130-9mW113O7rDnA', // old blue lock
  'bx125828-5pqzh1Wb4NOQ', // old sakamoto days
  'bx106082-xO3m2bFspE40', // old tbate
  'bx86337-0g70bKkFpD7E', // old lookism
  'bx85143-6o80VwHhYVrn', // old tower of god
  'bx85489-B0x2z8P96Y24', // old wind breaker
  'bx110291-PqA9Zuhd8OqJ', // old eleceed
  'bx125633-5cTzE1O23e59', // old mercenary enrollment
  'bx111594-g9YqGkM0Yw8S', // old nano machine
  'bx124479-7aKj9V318vLz', // old mount hua
  'bx136264-bM8qjX4jF8Lz', // old doom breaker
  'bx151608-F4l8jNq9M2X5', // old reaper of drifting moon
  'bx119614-fX48Z1kM9m2K', // old murim login
  'bx30001-A5Tf0z3g7R6o', // old death note
  'bx63327-S7M94aK1QYd0', // old tokyo ghoul
  'bx86123-5cTzE1O23e59', // old black clover
  'bx117040-CXKgWikBFQgS', // old oshi no ko
  'bx65243-KPXir4sRqJBW', // old haikyuu
  'bx86942-0mjRDkf4THpo', // old dragon ball super
  'bx120760-GkF8m72w5n3Q', // old kaiju no 8
  'bx118586-GkF8m72w5n3Q', // old overgeared
  'bx124973-mD8tJ3bN5n2L', // old sss suicide hunter
  'bx111521-g8kM2bFspE40', // old tomb raider king
  'bx112674-g9YqGkM0Yw8S', // old magic emperor
  'bx138356-8pK0Zuhd8OqJ', // old leveling with the gods
  'bx159074-xO3m2bFspE40', // old pick me up
  'bx109605-B0x2z8P96Y24', // old second life ranker
  'bx103980-6o80VwHhYVrn', // old weak hero
  'bx85141-KPXir4sRqJBW', // old god of high school
  'bx85142-9mW113O7rDnA', // old noblesse
  'bx118686-7aKj9V318vLz', // old legend of northern blade
  'bx136323-9h16T5s0K1vT', // old world's strongest troll
  'bx143977-YV08jXW6eQc3'  // old in laws
];

export function isKnownBrokenUrl(url) {
  if (!url || typeof url !== 'string') return false;
  return BROKEN_COVER_HASHES.some((hash) => url.includes(hash));
}

export function isMachineId(str) {
  if (!str || typeof str !== 'string') return false;
  const s = str.trim();
  if (/^01[0-9A-HJKMNP-TV-Z]{24}$/i.test(s)) return true;
  if (/^wc:01[0-9A-HJKMNP-TV-Z]{24}$/i.test(s)) return true;
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s)) return true;
  if (/^(kat|mk|webtoon|asura|thunder|flame|vortex):[0-9a-z_.-]+$/i.test(s)) return true;
  if (s.length >= 22 && /^[0-9A-Z]{22,}$/.test(s)) return true;
  return false;
}

export function unwrapProxyUrl(url) {
  if (!url || typeof url !== 'string') return url;
  if (url.includes('/api/image-proxy?url=')) {
    try {
      const match = url.match(/url=([^&]+)/);
      if (match) {
        return decodeURIComponent(match[1]);
      }
    } catch {}
  }
  return url;
}

export const KNOWN_MANGA_COVERS = {
  // Verified live AniList & MangaDex covers (200 OK)
  'lookism': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/medium/bx86848-4CSItSclJUvi.jpg',
  'tower of god': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/medium/bx85143-23oup3ETbFJk.jpg',
  'wind breaker': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/medium/bx135083-TQbNFWKGJJHW.jpg',
  'eleceed': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/medium/bx106929-flAUvHZDUz5v.jpg',
  'mercenary enrollment': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/medium/bx126297-SPiM7QtUnJ4P.jpg',
  'teenage mercenary': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/medium/bx126297-SPiM7QtUnJ4P.jpg',
  'nano machine': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/medium/bx120980-RZ9WLd0o9hyo.jpg',
  'return of the mount hua sect': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/medium/bx132144-i5B4VnG9sRgh.png',
  'mount hua': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/medium/bx132144-i5B4VnG9sRgh.png',
  'reincarnation of the suicidal battle god': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/medium/bx136220-u9sewv3u02mN.jpg',
  'doom breaker': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/medium/bx136220-u9sewv3u02mN.jpg',
  'reaper of the drifting moon': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/medium/bx153432-flZLVek7Ei1Z.png',
  'murim login': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/medium/bx120385-4JYGuOR6cn72.jpg',
  'death note': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/medium/bx30021-FE6kmrfpuKyb.jpg',
  'one punch man': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/medium/bx74347-sZpmNJ5xLwRK.jpg',
  'one-punch man': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/medium/bx74347-sZpmNJ5xLwRK.jpg',
  'tokyo ghoul': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/medium/bx63327-glC9cDxYBja9.png',
  'black clover': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/medium/bx114652-b4VxxYpvU8id.png',
  'blue lock': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/medium/bx106130-yPNeuSu75ey1.jpg',
  'sakamoto days': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/medium/bx125828-p78Z8SflkfmO.jpg',
  'the beginning after the end': 'https://temp.compsci88.com/cover/fallback/01J76XYE23859ZWDP7BJ520AKY.jpg',
  'the beginning after the': 'https://temp.compsci88.com/cover/fallback/01J76XYE23859ZWDP7BJ520AKY.jpg',
  'tbate': 'https://temp.compsci88.com/cover/fallback/01J76XYE23859ZWDP7BJ520AKY.jpg',
  'the stepmother has left': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx111075-ZSqT1Z2XASRp.jpg',
  'the fantasie of a stepmother': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx111075-ZSqT1Z2XASRp.jpg',
  'a stepmothers fairy tale': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx111075-ZSqT1Z2XASRp.jpg',
  'a stepmothers marchen': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx111075-ZSqT1Z2XASRp.jpg',
  'dandadan': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/medium/bx132029-prGF4gePdSKv.jpg',
  'gachiakuta': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/medium/bx144946-cscic3n2SwdY.jpg',
  'chained soldier': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/medium/bx106064-WBMhTOo7UQ20.png',
  'the fragrant flower blooms with dignity': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/medium/bx140475-QEGtrmdvbpOv.jpg',
  'the fragrant flower': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/medium/bx140475-QEGtrmdvbpOv.jpg',
  'spy x family': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/medium/bx108556-NHjkz0BNJhLx.jpg',
  'oshi no ko': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/medium/bx117195-r3kf8eF0xkDJ.png',
  'haikyuu': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/medium/bx181735-xIoXaQmtjkuC.png',
  'dragon ball super': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/medium/bx86508-QSahE7mTFEXl.png',
  'one piece': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx30013-BeslEMqiPhlk.jpg',
  'berserk': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx30002-Cul4OeN7bYtn.jpg',
  'solo leveling': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx105398-b673Vt5ZSuz3.jpg',
  'fortune-telling princess': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx170151-hItAtAb5Kj0I.jpg',
  'a fortune-telling princess': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx170151-hItAtAb5Kj0I.jpg',
  'the despised stepmother begins her second life': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx213993-T1BvCf8cBvlt.jpg',
  'the despised stepmother': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx213993-T1BvCf8cBvlt.jpg',
  'stepmother': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx213993-T1BvCf8cBvlt.jpg',
  'step mother': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx213993-T1BvCf8cBvlt.jpg',
  'stepmother second life': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx213993-T1BvCf8cBvlt.jpg',
  'chainsaw man': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx105778-euxXZEIfDY2u.png',
  'jujutsu kaisen': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx101517-H3TdM3g5ZUe9.jpg',
  'boruto': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx168468-FEo5x1ZZyWj4.png',
  'kagurabachi': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx169355-5pqzh1Wb4NOQ.png',
  'omniscient reader': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx119257-Pi21aq3ey9GG.jpg',
  'omniscient readers viewpoint': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx119257-Pi21aq3ey9GG.jpg',
  'surviving the game as a barbarian': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/medium/bx164857-MVeV0leMZb0m.jpg',
  'barbarian': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/medium/bx164857-MVeV0leMZb0m.jpg',
  'blasted reincarnat': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx151512-q0Xddr1JNKNq.png',
  'damn reincarnation': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx151512-q0Xddr1JNKNq.png',
  'demon slayer': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx87216-c9bSNVD10UuD.png',
  'attack on titan': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx53390-1RsuABC34P9D.jpg',
  'bleach': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx30012-1epmVfTSv2rr.png',
  'naruto': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/nx30011-9yUF1dXWgDOx.jpg',
  'hunter x hunter': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx30026-uCvXMudMzmwI.jpg',
  'frieren': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx118586-CXKgWikBFQgS.jpg',
  'vinland saga': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx30642-0mjRDkf4THpo.jpg',
  'vagabond': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx30656-9mW113O7rDnA.png',
  'kingdom': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/nx46765-KPXir4sRqJBW.png',
  'greatest estate developer': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx140407-fJQr0fmqq1IO.png',
  'the greatest estate developer': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx140407-fJQr0fmqq1IO.png',
  'world\'s strongest troll': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/medium/bx159121-j90Wcbi7rd2C.png',
  'worlds strongest troll': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/medium/bx159121-j90Wcbi7rd2C.png',
  'kaiju no 8': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/medium/bx120760-MtXvMgujLBpe.jpg',
  'overgeared': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/medium/n105664-4x0zfa6fmqp8.png',
  'sss class suicide hunter': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/medium/bx128067-wnLBg6Cy1ncs.jpg',
  'tomb raider king': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/medium/bx110462-okQFIoSFvb4L.jpg',
  'magic emperor': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/medium/bx116353-DYuIigXuPwpZ.jpg',
  'leveling with the gods': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/medium/bx138222-PyVZk5MOWP07.png',
  'pick me up': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/medium/bx94792-kr1IT9eUToNU.jpg',
  'second life ranker': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/medium/bx109957-EgJWdR7l9TBG.jpg',
  'weak hero': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/medium/bx113488-0ghq0eEnftk0.jpg',
  'god of high school': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/medium/bx85141-qHR957V3FVco.png',
  'noblesse': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/medium/bx59983-cfSjrRxuAlAD.png',
  'legend of the northern blade': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/medium/bx119521-qYqxFvn0NnXo.png',
  'my in-laws are obsessed with me': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/medium/bx142894-SRinclU1kzu9.jpg',
  'trillion game': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/medium/bx126056-7Q4faimXQRm4.jpg',
  '1000000000000': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/medium/bx126056-7Q4faimXQRm4.jpg',
  'the regressed youngest son of the duke is an assassin': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/medium/bx175262-shGEYbbfLHDD.jpg',
  'todays underwear': 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx137682-9t1F6V7O7r3T.jpg'
};

export function getReliableCoverUrl(title, currentUrl) {
  const cleanTitleStr = cleanTitle(title || '');
  const t = cleanTitleStr.toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();

  // 1. Prioritize verified live covers table
  if (t) {
    if (KNOWN_MANGA_COVERS[t]) {
      return KNOWN_MANGA_COVERS[t];
    }
    for (const [key, url] of Object.entries(KNOWN_MANGA_COVERS)) {
      const cleanKey = key.toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
      if (t === cleanKey || (cleanKey.length > 3 && (t.startsWith(cleanKey + ' ') || t.endsWith(' ' + cleanKey)))) {
        return url;
      }
    }
  }

  // 2. Check currentUrl and unwrap if proxy
  if (currentUrl && typeof currentUrl === 'string') {
    const unwrapped = unwrapProxyUrl(currentUrl);
    const isDirectDomain =
      unwrapped.includes('temp.compsci88.com') ||
      unwrapped.includes('mangadex.org') ||
      unwrapped.includes('anilist.co') ||
      unwrapped.includes('myanimelist.net') ||
      unwrapped.includes('cloudinary.com') ||
      unwrapped.includes('images.weserv.nl');

    if (isDirectDomain && !isKnownBrokenUrl(unwrapped)) {
      return unwrapped;
    }

    if (
      !unwrapped.includes('nocover') &&
      !unwrapped.includes('placeholder') &&
      !unwrapped.startsWith('data:image/svg+xml') &&
      !isKnownBrokenUrl(unwrapped)
    ) {
      if (typeof window !== 'undefined' && (window.location.hostname.includes('github.io') || !getApiBaseUrl())) {
        return unwrapped;
      }
      return currentUrl;
    }
  }

  return getFallbackCover(title);
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
      const t = m.title?.english || m.title?.romaji || m.title?.userPreferred || 'Manga';

      // Check if catalog item matches
      const normT = t.toLowerCase().replace(/[^a-z0-9]/g, '');
      const catalogMatch = FALLBACK_MANGA_CATALOG.find((cat) => {
        const normCat = cat.title.toLowerCase().replace(/[^a-z0-9]/g, '');
        return normCat === normT || normCat.includes(normT) || normT.includes(normCat);
      });
      if (catalogMatch) {
        return formatMangaItem({
          ...catalogMatch,
          coverUrl: getReliableCoverUrl(t, m.coverImage?.extraLarge || m.coverImage?.large || catalogMatch.coverUrl),
          bannerUrl: m.bannerImage || catalogMatch.bannerUrl
        });
      }

      const knownCount = getKnownChapterCount(t);
      const totalCh = m.chapters || knownCount || 120;
      const chList = Array.from({ length: totalCh }, (_, idx) => {
        const num = totalCh - idx;
        return {
          id: `anilist_ch:${m.id}:${num}`,
          chapter: String(num),
          title: `Chapter ${num}`
        };
      });
      return formatMangaItem({
        id: `anilist:${m.id}`,
        title: t,
        englishTitle: m.title?.english || null,
        coverUrl: getReliableCoverUrl(t, m.coverImage?.large || m.coverImage?.extraLarge || m.coverImage?.medium),
        bannerUrl: m.bannerImage || null,
        status: m.status === 'FINISHED' ? 'Completed' : 'Ongoing',
        score: m.averageScore ? (m.averageScore / 10).toFixed(1) : '8.8',
        year: m.startDate?.year ? String(m.startDate.year) : '2023',
        author: 'Manga Universe',
        description: m.description ? decodeHtml(m.description) : '',
        tags: m.genres || ['Action', 'Fantasy'],
        sourceName: 'AniList',
        totalChapters: totalCh,
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

    const t = m.title?.english || m.title?.romaji || m.title?.userPreferred || 'Manga';

    // Check catalog first
    const normT = t.toLowerCase().replace(/[^a-z0-9]/g, '');
    const catalogMatch = FALLBACK_MANGA_CATALOG.find((cat) => {
      const normCat = cat.title.toLowerCase().replace(/[^a-z0-9]/g, '');
      return normCat === normT || normCat.includes(normT) || normT.includes(normCat);
    });
    if (catalogMatch) {
      return {
        ...catalogMatch,
        id: `anilist:${m.id}`,
        coverUrl: getReliableCoverUrl(t, m.coverImage?.extraLarge || m.coverImage?.large || catalogMatch.coverUrl),
        bannerUrl: m.bannerImage || catalogMatch.bannerUrl
      };
    }

    const knownCount = getKnownChapterCount(t);
    const totalCh = m.chapters || knownCount || 120;
    const chList = Array.from({ length: totalCh }, (_, idx) => {
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
      title: t,
      englishTitle: m.title?.english || null,
      coverUrl: getReliableCoverUrl(t, m.coverImage?.extraLarge || m.coverImage?.large),
      bannerUrl: m.bannerImage || null,
      status: m.status === 'FINISHED' ? 'Completed' : 'Ongoing',
      score: m.averageScore ? (m.averageScore / 10).toFixed(1) : '8.8',
      year: m.startDate?.year ? String(m.startDate.year) : '2023',
      author: authors,
      description: m.description ? decodeHtml(m.description) : '',
      tags: m.genres || ['Action', 'Fantasy'],
      sourceName: 'AniList',
      totalChapters: totalCh,
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
      (m.title && String(m.title).toLowerCase().includes(q)) ||
      (m.englishTitle && String(m.englishTitle).toLowerCase().includes(q)) ||
      (m.aliases && Array.isArray(m.aliases) && m.aliases.some((a) => a && String(a).toLowerCase().includes(q)))
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
 * Helper to check if an image needs proxying (skips AniList, MyAnimeList, MangaDex, Data URIs)
 */
function needsImageProxy(url) {
  if (!url) return false;
  if (url.startsWith('/api/image-proxy') || url.startsWith('http://localhost') || url.startsWith('data:')) return false;
  if (url.includes('anilist.co') || url.includes('myanimelist.net') || url.includes('mangadex.org') || url.includes('weebcentral.com')) return false;
  return false;
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

export const KNOWN_SERIES_TITLES = {
  '01j76xydq9jtww4thbjwpxnj9h': "A Stepmother's Fairy Tale",
  '01j76xy7e9fndz1dbbm6pbjpfk': 'One Piece',
  '01j76xy7kt7j224ebk6j816y1q': 'One-Punch Man',
  '01j76xyd7e91k8qp6cy0y53900': 'Blue Lock',
  '01j76xye3130e1w5hktj7vd912': 'Sakamoto Days',
  '01j76xye23859zwdp7bj520aky': 'The Beginning After the End',
  '01j76xy7ef75djnqcv04htpdzk': 'Berserk',
  '01j76xycerxe60t7fkxvccaq0h': 'Jujutsu Kaisen',
  '01j76xycrvy3qgyamrr3stw941': 'Chainsaw Man',
  '01j76xybnej5egk9zep3ys0pmh': 'Boruto: Two Blue Vortex',
  '01j76xyggm22wzp7t4tka4zfaf': 'Kagurabachi',
  '01j76xybd282y3xkx0krgd64q5': 'Lookism',
  '01j76xy7m0w9wwj55vjyyb2j1s': 'Tower of God',
  '01j76xya1tqykv6w4bcmr2wd5m': 'Wind Breaker',
  '01j76xyfaesztjt5aq1spfkyxr': 'My In-Laws Are Obsessed With Me',
  '01j76xygvnheer7g6m90c6yctw': "World's Strongest Troll",
  '01j76xyd44p5q8203e3fsrw939': 'Solo Leveling',
  '01j76xyc218s1ezz7n80q68s2k': "Omniscient Reader's Viewpoint",
  '01j76xych4cs9m5e9t97e3b5z4': 'Nano Machine',
  '01j76xydry4j3b7h0w6c3j95sz': 'The Greatest Estate Developer',
  '01j76xydez7sz9t0151sz47g74': 'Return of the Mount Hua Sect',
  '01j76xyd3q2q7hyymb3fsdpskc': 'Teenage Mercenary',
  '01j76xyea95pg5avmckc9tk492': 'Mercenary Enrollment',
  '01j76xygvnheer7g6m90c6yctw': "World's Strongest Troll",
  '01j76xyemwa55c7xtzhp1hnarm': 'Dandadan',
  '01j76xyfd97drqqkk75fzb7pqh': 'Gachiakuta',
  '01j76xycvrsnny2c2qh721967b': 'Chained Soldier',
  '01j76xycyj0p680skx3qz0nqd7': 'Spy x Family',
  '01j76xyfhfz88r32bw3rxhn1wp': 'The Fragrant Flower Blooms with Dignity'
};

/**
 * Title cleaner: strips provider prefix tags (Vortex:, Asura:, etc.) and decodes entities
 */
export function cleanTitle(raw) {
  if (!raw || typeof raw !== 'string') return 'Manga';
  let t = decodeHtml(raw);

  t = t.replace(/^(vortex|asura|webtoon|weebcentral|mangadex|mangakakalot|kakamanga|mangapill|wc|mk|md)\s*:\s*/i, '');
  t = t
    .replace(/Chapter\s+[0-9.]+/i, '')
    .replace(/\s+manga$/i, '')
    .trim();

  if (isMachineId(t)) {
    const rawId = t.replace(/^wc:/i, '').toLowerCase();
    if (KNOWN_SERIES_TITLES[rawId]) {
      return KNOWN_SERIES_TITLES[rawId];
    }
  }

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
 * Checks if a chapter's subtitle is redundant with its chapter number
 * (e.g. "Chapter 2" for chapter 2, "Chapter 02", "Ch. 2", "2")
 */
export function isRedundantChapterTitle(title, chapterNumber) {
  if (!title) return true;
  const raw = String(title).trim().toLowerCase();
  const ch = String(chapterNumber || '').trim().toLowerCase();
  if (!raw) return true;

  if (raw === ch || raw === `chapter ${ch}` || raw === `ch. ${ch}` || raw === `ch ${ch}` || raw === `ep. ${ch}` || raw === `ep ${ch}` || raw === `episode ${ch}`) {
    return true;
  }

  const stripped = raw
    .replace(/\b(chapter|ch|ep|episode|volume|vol|part)\b/gi, '')
    .replace(/[^0-9a-z]/gi, '')
    .trim();
  const cleanCh = ch.replace(/[^0-9a-z]/gi, '').trim();

  if (!stripped || stripped === cleanCh || parseFloat(stripped) === parseFloat(cleanCh)) {
    return true;
  }

  return false;
}

/**
 * Authentic Title Matcher: verifies candidate title against query to prevent false-positive mapping
 */
export function isAuthenticSeriesMatch(query, candidateTitle) {
  if (!query || !candidateTitle) return false;
  const qLower = String(query).toLowerCase().trim();
  const cLower = String(candidateTitle).toLowerCase().trim();
  if (qLower === cLower || cLower.includes(qLower) || qLower.includes(cLower)) return true;

  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'of', 'in', 'to', 'for', 'with', 'are', 'is', 'my', 'her', 'his', 'manga', 'series']);
  const cleanQ = qLower.replace(/[^a-z0-9\s]/g, ' ');
  const qTokens = cleanQ.split(/\s+/).filter(t => t.length > 1 && !stopWords.has(t));
  if (qTokens.length === 0) return false;

  const cClean = cLower.replace(/[^a-z0-9\s]/g, ' ');
  const matchedTokens = qTokens.filter(t => cClean.includes(t));
  if (qTokens.some(t => t.length >= 4 && cClean.includes(t))) return true;
  const threshold = qTokens.length <= 2 ? 1 : Math.min(2, qTokens.length);
  return matchedTokens.length >= threshold;
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

  const rawId = String(mangaId || '').replace(/^wc:|^wc_/i, '');
  const wcPrefixed = `wc:${rawId}`;

  const fallbackItem = FALLBACK_MANGA_CATALOG.find(
    (m) => m.id === mangaId || m.id === rawId || m.id === wcPrefixed ||
           m.aliases?.includes(mangaId) || m.aliases?.includes(rawId) || m.aliases?.includes(wcPrefixed)
  ) || FALLBACK_MANGA_CATALOG.find((m) => {
    const q = String(mangaId || '').toLowerCase().replace(/^wc:|^webtoon:|^md:|^asura:|^vortex:|^thunder:|^flame:|^mk:|^kat:/, '').replace(/[-_:]/g, ' ');
    if (isMachineId(q)) return false;
    const titleQ = m.title.toLowerCase().replace(/[-_:]/g, ' ');
    return q.includes(titleQ) || titleQ.includes(q);
  });

  const queryTitle = fallbackItem?.title || fallbackItem?.englishTitle || '';

  // 0. Live upstream synchronization via Android Bridge (real-time latest chapters)
  if (typeof window !== 'undefined' && window.AndroidBridge && typeof window.AndroidBridge.getLiveMangaDetails === 'function') {
    try {
      const liveJson = window.AndroidBridge.getLiveMangaDetails(mangaId || '', queryTitle);
      if (liveJson) {
        const liveData = typeof liveJson === 'string' ? JSON.parse(liveJson) : liveJson;
        if (liveData && Array.isArray(liveData.chapters) && liveData.chapters.length > 0) {
          const merged = {
            ...(fallbackItem || {}),
            ...liveData,
            id: mangaId,
            title: cleanTitle(liveData.title || fallbackItem?.title || 'Manga'),
            englishTitle: fallbackItem?.englishTitle ? cleanTitle(fallbackItem.englishTitle) : null,
            coverUrl: getReliableCoverUrl(fallbackItem?.title || liveData.title, fallbackItem?.coverUrl),
            chapters: deduplicateChapters(liveData.chapters),
            totalChapters: liveData.chapters.length,
            latestChapter: liveData.latestChapter || (liveData.chapters[0]?.chapter || '')
          };
          setClientCached(cacheKey, merged);
          return merged;
        }
      }
    } catch (bridgeErr) {
      console.warn('AndroidBridge.getLiveMangaDetails warning:', bridgeErr);
    }
  }

  const baseUrl = getApiBaseUrl();

  // Always query live backend first for the latest chapters; fallback catalog is reserved strictly for network failure

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
      
      const isBogusTitle = isMachineId(data.title) || data.title.toLowerCase() === 'manga' || data.title.toLowerCase() === 'manga series';
      const isBogusDesc = !data.description || data.description.includes('being indexed') || data.description.includes('being refreshed');
      const isBogusAuthor = !data.author || data.author === 'Manga' || data.author === 'Author' || data.author === 'Unknown Author';

      if (fallbackItem) {
        if (isBogusTitle) {
          data.title = cleanTitle(fallbackItem.title);
          data.englishTitle = fallbackItem.englishTitle ? cleanTitle(fallbackItem.englishTitle) : null;
        }
        if (isBogusDesc && fallbackItem.description) {
          data.description = fallbackItem.description;
        }
        if (isBogusAuthor && fallbackItem.author) {
          data.author = fallbackItem.author;
        }
        if ((!data.coverUrl || isKnownBrokenUrl(data.coverUrl) || data.coverUrl.startsWith('data:')) && fallbackItem.coverUrl) {
          data.coverUrl = getReliableCoverUrl(fallbackItem.title, fallbackItem.coverUrl);
        }
        if (fallbackItem.tags && (!data.tags || data.tags.length <= 1)) {
          data.tags = fallbackItem.tags;
        }
        if (fallbackItem.status) data.status = fallbackItem.status;
        if (fallbackItem.score) data.score = fallbackItem.score;
        if (fallbackItem.year) data.year = fallbackItem.year;
        if (!data.chapters || data.chapters.length === 0) {
          data.chapters = fallbackItem.chapters || [];
          data.totalChapters = (fallbackItem.chapters || []).length;
        }
      } else if (isBogusTitle) {
        const knownTitle = KNOWN_SERIES_TITLES[rawId.toLowerCase()];
        if (knownTitle) {
          data.title = knownTitle;
          data.coverUrl = getReliableCoverUrl(knownTitle, data.coverUrl);
        }
      }

      if (data.coverUrl) {
        data.coverUrl = getReliableCoverUrl(data.title, data.coverUrl);
      }
      if (!data.author || !data.author.trim() || data.author.toLowerCase() === 'author') {
        data.author = 'Top Artist';
      }
      if (Array.isArray(data.chapters)) {
        data.chapters = deduplicateChapters(data.chapters);
        data.totalChapters = data.chapters.length;
      }
      if (Array.isArray(data.chapters) && data.chapters.length > 0) {
        setClientCached(cacheKey, data);
      } else if (fallbackItem && Array.isArray(fallbackItem.chapters) && fallbackItem.chapters.length > 0) {
        data.chapters = fallbackItem.chapters;
        data.totalChapters = fallbackItem.chapters.length;
      }
    }
    return data;
  } catch (err) {
    console.warn('fetchMangaDetails API warning, checking fallback:', err);
    if (fallbackItem) {
      let liveChapters = fallbackItem.chapters || [];
      const katSlug = fallbackItem.id?.startsWith('kat:') ? fallbackItem.id.replace('kat:', '') :
        (fallbackItem.aliases?.find(a => a.startsWith('kat:'))?.replace('kat:', '') || null);
      if (katSlug) {
        try {
          const targetUrl = `https://mangakatana.com/manga/${katSlug}`;
          const res = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`, { signal: AbortSignal.timeout(4000) });
          if (res.ok) {
            const html = await res.text();
            const regex = /<div class="chapter"[^>]*>\s*<a href="https:\/\/mangakatana\.com\/manga\/[^/]+\/([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
            const matches = [...html.matchAll(regex)];
            if (matches.length > 0) {
              liveChapters = matches.map(m => {
                const chSlug = m[1];
                const rawText = m[2].replace(/<[^>]+>/g, '').trim();
                const num = rawText.match(/(?:Chapter|Ch\.?|Ep\.?)\s*([0-9.]+)/i)?.[1] || chSlug.replace(/^c/, '');
                const isDuplicate = isRedundantChapterTitle(rawText, num);
                return {
                  id: `kat_ch:${katSlug}:${chSlug}`,
                  chapter: num,
                  title: isDuplicate ? '' : rawText
                };
              }).sort((a, b) => (parseFloat(b.chapter) || 0) - (parseFloat(a.chapter) || 0));
            }
          }
        } catch {}
      }

      const result = {
        ...fallbackItem,
        id: mangaId,
        title: cleanTitle(fallbackItem.title),
        englishTitle: fallbackItem.englishTitle ? cleanTitle(fallbackItem.englishTitle) : null,
        coverUrl: getReliableCoverUrl(fallbackItem.title, fallbackItem.coverUrl),
        chapters: liveChapters,
        totalChapters: liveChapters.length,
        latestChapter: liveChapters[0]?.chapter || fallbackItem.latestChapter
      };
      setClientCached(cacheKey, result);
      return result;
    }
    if (String(mangaId).startsWith('md:') || String(mangaId).startsWith('mangadex:')) {
      const mdItem = await fetchMangaDexDetailsClient(mangaId);
      if (mdItem) {
        setClientCached(cacheKey, mdItem);
        return mdItem;
      }
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
 * Client-side MangaDex Details and Chapter List Fetcher
 */
export async function fetchMangaDexDetailsClient(mangaId) {
  const cleanId = String(mangaId).replace(/^md:|^mangadex:/, '').trim();
  try {
    const mangaUrl = `https://api.mangadex.org/manga/${cleanId}?includes[]=cover_art&includes[]=author&includes[]=artist`;
    const res = await fetch(mangaUrl);
    if (!res.ok) return null;
    const json = await res.json();
    const item = json.data;
    if (!item) return null;

    const attrs = item.attributes || {};
    const rawTitle = attrs.title?.en || attrs.title?.['ja-ro'] || attrs.title?.['ko-ro'] || Object.values(attrs.title || {})[0] || 'Manga';
    const title = cleanTitle(rawTitle);

    let englishTitle = null;
    if (attrs.altTitles && Array.isArray(attrs.altTitles)) {
      const enAlt = attrs.altTitles.find((t) => t.en);
      if (enAlt) englishTitle = cleanTitle(enAlt.en);
    }
    if (!englishTitle && attrs.title?.en) englishTitle = cleanTitle(attrs.title.en);

    let coverUrl = getFallbackCover(title);
    const coverRel = (item.relationships || []).find((r) => r.type === 'cover_art');
    if (coverRel?.attributes?.fileName) {
      coverUrl = `https://uploads.mangadex.org/covers/${cleanId}/${coverRel.attributes.fileName}.512.jpg`;
    }

    const desc = attrs.description?.en || Object.values(attrs.description || {})[0] || 'No description available.';
    const genres = (attrs.tags || []).map((t) => t.attributes?.name?.en).filter(Boolean).slice(0, 5);

    // Fetch chapters (English preferred, fallback to all)
    let rawChapters = [];
    try {
      const feedUrlEn = `https://api.mangadex.org/manga/${cleanId}/feed?translatedLanguage[]=en&order[chapter]=desc&limit=500&contentRating[]=safe&contentRating[]=suggestive&contentRating[]=erotica&contentRating[]=pornographic`;
      const feedRes = await fetch(feedUrlEn);
      if (feedRes.ok) {
        const feedJson = await feedRes.json();
        rawChapters = feedJson.data || [];
      }
    } catch {}

    if (rawChapters.length === 0) {
      try {
        const feedUrlAll = `https://api.mangadex.org/manga/${cleanId}/feed?order[chapter]=desc&limit=500&contentRating[]=safe&contentRating[]=suggestive&contentRating[]=erotica&contentRating[]=pornographic`;
        const feedResAll = await fetch(feedUrlAll);
        if (feedResAll.ok) {
          const feedJsonAll = await feedResAll.json();
          rawChapters = feedJsonAll.data || [];
        }
      } catch {}
    }

    const chapters = rawChapters.map((ch, idx) => {
      const num = ch.attributes?.chapter || String(rawChapters.length - idx);
      const chTitle = ch.attributes?.title || '';
      return {
        id: `md_ch:${ch.id}`,
        chapter: num,
        title: isRedundantChapterTitle(chTitle, num) ? '' : chTitle,
        releaseDate: ch.attributes?.publishAt?.split('T')[0] || ''
      };
    });

    const deduped = deduplicateChapters(chapters);

    return {
      id: `md:${cleanId}`,
      title,
      englishTitle: englishTitle || title,
      coverUrl,
      description: decodeHtml(desc),
      status: attrs.status ? attrs.status.toUpperCase() : 'ONGOING',
      score: '9.2',
      year: attrs.year || new Date().getFullYear(),
      author: 'MangaDex Community',
      tags: genres.length > 0 ? genres : ['Manga'],
      sourceName: 'MangaDex',
      chapters: deduped,
      totalChapters: deduped.length,
      latestChapter: deduped[0]?.chapter || '1'
    };
  } catch (err) {
    console.warn('fetchMangaDexDetailsClient error:', err);
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
  } catch {
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
  let num = String(chapterNumber || '').replace(/[^0-9.]/g, '');
  if (!num) {
    const m = String(chapterId || '').match(/(?:chapter-|:c|:ch|:ep|:)([0-9.]+)/i);
    num = m ? m[1] : ([...String(chapterId || '').matchAll(/([0-9.]+)/g)].pop()?.[1] || '1');
  }
  const mid = String(mangaId || '').toLowerCase();
  const cid = String(chapterId || '').toLowerCase();
  const title = String(mangaTitle || '').toLowerCase();

  if (mid.includes('fortune-telling') || cid.includes('ftp') || cid.includes('fortune-telling') || title.includes('fortune-telling')) {
    return `https://afortunetellingprincess.com/a-fortune-telling-princess-manhwa-chapter-${num}/`;
  }
  if (mid.includes('despised-stepmother') || title.includes('despised stepmother') || (title.includes('stepmother') && title.includes('second life'))) {
    return `https://kingofshojo.com/the-despised-stepmother-begins-her-second-life-chapter-${num}/`;
  }
  if (mid.includes('a-stepmothers-fairy-tale') || mid.includes('01j76xydq9jtww4thbjwpxnj9h') || title.includes('fairy tale') || title.includes('stepmother has left') || title.includes('fantasie of a stepmother')) {
    return `https://mangakatana.com/manga/a-stepmothers-fairy-tale.23902/c${num}`;
  }
  if (mid.includes('solo') || cid.includes('solo') || title.includes('solo leveling')) {
    return `https://ww4.readsololeveling.org/chapter/solo-leveling-chapter-${num}/`;
  }
  if (mid.includes('omniscient') || cid.includes('orv') || title.includes('omniscient reader')) {
    return `https://w1.omniscientreadersviewpoint.com/manga/omniscient-readers-viewpoint-chapter-${num}/`;
  }
  if (mid.includes('damn-reincarnation') || title.includes('damn reincarnation')) {
    return `https://asurascans.com/comics/damn-reincarnation-3ebcc5a9/chapter/${num}`;
  }
  if (mid.includes('barbarian') || title.includes('barbarian')) {
    return `https://asurascans.com/comics/surviving-the-game-as-a-barbarian-ab39de10/chapter/${num}`;
  }
  if (mid.includes('estate') || title.includes('greatest estate')) {
    return `https://asurascans.com/comics/the-greatest-estate-developer-ab39de10/chapter/${num}`;
  }

  if (cid.startsWith('wc_ch:')) {
    const rawWcId = cid.replace('wc_ch:', '');
    return `https://weebcentral.com/chapters/${rawWcId}/images?reading_style=long_strip`;
  }
  if (cid.startsWith('kat_ch:')) {
    const parts = cid.replace('kat_ch:', '').split(':');
    const katSlug = parts[0];
    const chSlug = parts.length > 1 ? parts[1] : `c${num}`;
    return `https://mangakatana.com/manga/${katSlug}/${chSlug}`;
  }
  if (cid.startsWith('md_ch:') || cid.startsWith('md:')) {
    return `https://mangadex.org/chapter/${cid.replace(/^md_ch:|^md:/, '')}`;
  }
  if (mid.startsWith('wc:')) {
    return `https://weebcentral.com/series/${mid.replace('wc:', '')}/full-chapter-list`;
  }
  if (mid.startsWith('kat:')) {
    return `https://mangakatana.com/manga/${mid.replace('kat:', '')}`;
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

export async function fetchClientHtml(targetUrl, timeoutMs = 5000) {
  // 0. Android Native Bridge (Zero CORS, direct OkHttp)
  if (typeof window !== 'undefined' && window.AndroidBridge && typeof window.AndroidBridge.fetchHtml === 'function') {
    try {
      const bridgeHtml = window.AndroidBridge.fetchHtml(targetUrl);
      if (bridgeHtml && bridgeHtml.length > 200) return bridgeHtml;
    } catch (e) {
      console.warn('AndroidBridge.fetchHtml warning:', e);
    }
  }

  // 1. Direct fetch (instant for local, WebView, Cordova, Electron, permissive servers)
  try {
    const res = await fetch(targetUrl, { signal: AbortSignal.timeout(Math.min(timeoutMs, 3000)) });
    if (res.ok) {
      const text = await res.text();
      if (text && text.length > 200) return text;
    }
  } catch {}

  // 2. allorigins raw
  try {
    const res = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`, { signal: AbortSignal.timeout(3500) });
    if (res.ok) {
      const text = await res.text();
      if (text && text.length > 200) return text;
    }
  } catch {}

  // 3. allorigins get JSON wrapper
  try {
    const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`, { signal: AbortSignal.timeout(3500) });
    if (res.ok) {
      const json = await res.json();
      if (json && json.contents && json.contents.length > 200) return json.contents;
    }
  } catch {}

  // 4. codetabs proxy
  try {
    const res = await fetch(`https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(targetUrl)}`, { signal: AbortSignal.timeout(3500) });
    if (res.ok) {
      const text = await res.text();
      if (text && text.length > 200) return text;
    }
  } catch {}

  // 5. corsproxy.io
  try {
    const res = await fetch(`https://corsproxy.io/?url=${encodeURIComponent(targetUrl)}`, { signal: AbortSignal.timeout(3500) });
    if (res.ok) {
      const text = await res.text();
      if (text && text.length > 200) return text;
    }
  } catch {}

  return null;
}

/**
 * Fetch All Real Pages for a Chapter
 */
export async function fetchChapterPages(chapterId, mangaId = null, chapterNumber = null, mangaTitle = null) {
  // 0. High-Priority Android Native Bridge (Zero CORS, native OkHttp)
  if (typeof window !== 'undefined' && window.AndroidBridge && typeof window.AndroidBridge.getChapterPages === 'function') {
    try {
      const bridgeJson = window.AndroidBridge.getChapterPages(mangaId || '', chapterId || '', String(chapterNumber || ''), mangaTitle || '');
      if (bridgeJson) {
        const parsed = typeof bridgeJson === 'string' ? JSON.parse(bridgeJson) : bridgeJson;
        if (parsed && Array.isArray(parsed.pages) && parsed.pages.length > 0) {
          return parsed;
        }
      }
    } catch (bridgeErr) {
      console.warn('AndroidBridge.getChapterPages error:', bridgeErr);
    }
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000); // 20s timeout
  const baseUrl = getApiBaseUrl();

  try {
    const qParams = new URLSearchParams({
      chapterId: chapterId || '',
      mangaId: mangaId || '',
      ch: chapterNumber || '',
      title: mangaTitle || '',
    });
    const url = baseUrl
      ? `${baseUrl}/api/manga/read?${qParams.toString()}`
      : `/api/manga/read?${qParams.toString()}`;
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

  // Client-side direct resolution on static hosting
  let chNum = (chapterNumber !== null && chapterNumber !== undefined && chapterNumber !== '') ? String(chapterNumber).replace(/[^0-9.]/g, '') : '';
  if (chNum === '') {
    const m = String(chapterId || '').match(/(?:chapter-|:c|:ch|:ep|:)([0-9.]+)/i);
    if (m) {
      chNum = m[1];
    } else {
      const allNums = [...String(chapterId || '').matchAll(/([0-9.]+)/g)];
      chNum = allNums.length > 0 ? allNums[allNums.length - 1][1] : '1';
    }
  }
  const mid = String(mangaId || '').toLowerCase();
  const cid = String(chapterId || '').toLowerCase();
  const title = String(mangaTitle || '').toLowerCase();
  const sourceUrl = getChapterSourceUrl(mangaId, chapterId, chapterNumber, mangaTitle);

  // 1. Client-side MangaPill Scraper (One Piece, Berserk, Death Note, Bleach, Naruto, Chainsaw Man, Jujutsu Kaisen, etc.)
  if (/^[0-9]+-[0-9]+\//.test(cid) || cid.startsWith('mp:') || /^[0-9]+\/[a-z0-9-]+/.test(mid)) {
    try {
      let mpPath = cid.replace(/^mp:/, '').trim();
      if (!mpPath.includes('/')) {
        const pMatch = mid.match(/^([0-9]+)/)?.[1];
        const slugMatch = mid.match(/\/([a-z0-9-]+)/)?.[1];
        if (pMatch && slugMatch) {
          const parsedN = parseFloat(chNum) || 1.0;
          const code = 10000000 + Math.floor(parsedN * 1000);
          mpPath = `${pMatch}-${code}/${slugMatch}-chapter-${chNum}`;
        }
      }
      if (mpPath.includes('/')) {
        const targetUrl = `https://mangapill.com/chapters/${mpPath}`;
        const html = await fetchClientHtml(targetUrl, 5000);
        if (html) {
          const imgMatches = [...html.matchAll(/<img[^>]+(?:data-src|src)="([^"]+)"/gi)]
            .map(m => m[1])
            .filter(src => src && (src.includes('mangapill.com') || src.includes('readdetectiveconan.com')));
          if (imgMatches.length > 0) {
            const pages = imgMatches.map((imgUrl, idx) => ({
              pageNumber: idx + 1,
              url: baseUrl ? `${baseUrl}/api/image-proxy?url=${encodeURIComponent(imgUrl)}` : imgUrl,
              originalUrl: imgUrl,
            }));
            return { chapterId, totalPages: pages.length, pages, sourceUrl };
          }
        }
      }
    } catch (err) {
      console.warn('Client-side MangaPill resolution error:', err);
    }
  }

  // 2. Client-side WeebCentral Chapter Resolution
  const WC_SERIES_MAP = {
    'nano-machine': '01J76XYDT7H7ANER8KJG5R9SJV',
    'mount-hua': '01J76XYEVCSS5ANBCJZ4ZF9P65',
    'return-of-the-mount-hua-sect': '01J76XYEVCSS5ANBCJZ4ZF9P65',
    'blossoming-blade': '01J76XYEVCSS5ANBCJZ4ZF9P65',
    'solo-leveling': '01J76XYCPSY3C4BNPBRY8JMCBE',
    'omniscient-reader': '01J76XYDMWWJX3T4BFWR84FQQK',
    'orv': '01J76XYDMWWJX3T4BFWR84FQQK',
    'estate-developer': '01J76XYF6V9BDFSRRTY2C65SBS',
    'the-greatest-estate-developer': '01J76XYF6V9BDFSRRTY2C65SBS',
    'doom-breaker': '01J76XYEZ1BQJM22H3RREE1XMG',
    'suicidal-battle-god': '01J76XYEZ1BQJM22H3RREE1XMG',
    'barbarian': '01J76XYG976314R2DM2DKQRBGS',
    'surviving-the-game-as-a-barbarian': '01J76XYG976314R2DM2DKQRBGS',
    'damn-reincarnation': '01J76XYG12YTB3J27FVBM256V8',
    'my-blasted-reincarnated-life': '01J76XYG12YTB3J27FVBM256V8',
    'worlds-strongest-troll': '01J76XYGVNHEER7G6M90C6YCTW',
    'my-in-laws-are-obsessed-with-me': '01J76XYFAESZTJT5AQ1SPFKYXR',
    'the-hole-is-open': '01J76XYHGCQ2A1VG5KYTNHEHKF',
    'seitokai-ni-mo-ana-wa-aru': '01J76XYHGCQ2A1VG5KYTNHEHKF',
    'lookism': '01J76XYBD282Y3XKX0KRGD64Q5',
    'tower-of-god': '01J76XY7M0W9WWJ55VJYYB2J1S',
    'wind-breaker': '01J76XYA1TQYKV6W4BCMR2WD5M',
    'blue-lock': '01J76XYD7E91K8QP6CY0Y53900',
    'eleceed': '01J76XYD3Q2Q7HYYMB3FSDPSKC',
  };

  let wcTarget = cid.replace(/^wc_ch:|^wc:/, '').trim();
  let wcChapId = null;
  if (/^[0-9A-Z]{26}$/i.test(wcTarget)) {
    if (Object.values(WC_SERIES_MAP).includes(wcTarget)) {
      wcTarget = `${wcTarget}:${chNum}`;
    } else {
      wcChapId = wcTarget;
    }
  }

  if (!wcChapId) {
    let targetSeriesId = null;
    let targetSeriesChNum = chNum;
    if (wcTarget.includes(':')) {
      const [potSeries, potNum] = wcTarget.split(':');
      if (/^[0-9A-Z]{26}$/i.test(potSeries)) {
        targetSeriesId = potSeries;
        targetSeriesChNum = potNum || chNum;
      }
    }
    if (!targetSeriesId) {
      for (const [k, v] of Object.entries(WC_SERIES_MAP)) {
        if (mid.includes(k) || title.includes(k.replace(/-/g, ' ')) || cid.includes(k)) {
          targetSeriesId = v;
          break;
        }
      }
    }
    if (targetSeriesId) {
      try {
        const sUrl = `https://weebcentral.com/series/${targetSeriesId}/full-chapter-list`;
        const sHtml = await fetchClientHtml(sUrl, 5000);
        if (sHtml) {
          const chMatches = [...sHtml.matchAll(/<a[^>]+href="[^"]*chapters\/([0-9A-Z]{26})"[^>]*>([\s\S]*?)<\/a>/gi)];
          const cleanTarget = String(targetSeriesChNum || '1').replace(/[^0-9.]/g, '');
          for (const cm of chMatches) {
            const rawText = cm[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
            const numMatch = rawText.match(/(?:Chapter|Ch\.?|Episode|Ep\.?)\s*([0-9.]+)/i) || rawText.match(/([0-9.]+)/);
            if (numMatch && (numMatch[1] === cleanTarget || parseFloat(numMatch[1]) === parseFloat(cleanTarget))) {
              wcChapId = cm[1];
              break;
            }
          }
        }
      } catch (err) {
        console.warn('WeebCentral series chapter list error:', err);
      }
    }
  }

  if (wcChapId) {
    try {
      const targetUrl = `https://weebcentral.com/chapters/${wcChapId}/images?is_prev=False&current_page=1&reading_style=long_strip`;
      const html = await fetchClientHtml(targetUrl, 6000);
      if (html) {
        const imgMatches = [...html.matchAll(/<img[^>]+src="([^"]+)"/gi)]
          .map(m => m[1])
          .filter(src => src && !src.includes('/static/') && !src.includes('brand.png') && !src.includes('logo') && !src.includes('favicon'));
        if (imgMatches.length > 0) {
          const pages = imgMatches.map((imgUrl, idx) => ({
            pageNumber: idx + 1,
            url: baseUrl ? `${baseUrl}/api/image-proxy?url=${encodeURIComponent(imgUrl)}` : imgUrl,
            originalUrl: imgUrl,
          }));
          return { chapterId, totalPages: pages.length, pages, sourceUrl };
        }
      }
    } catch (err) {
      console.warn('Direct WeebCentral page resolution error:', err);
    }
  }

  // 3. Client-side MangaKatana resolution
  let katSlug = null;
  let specificChSlug = null;
  if (cid.startsWith('kat_ch:')) {
    const parts = cid.replace('kat_ch:', '').split(':');
    katSlug = parts[0];
    specificChSlug = parts.length > 1 ? parts[1] : `c${chNum}`;
  } else if (title.includes('one piece') || mid.includes('one-piece')) {
    katSlug = 'one-piece.49';
  } else if (title.includes('one-punch') || title.includes('one punch') || mid.includes('one-punch')) {
    katSlug = 'one-punch-man.163';
  } else if (title.includes('berserk') || mid.includes('berserk')) {
    katSlug = 'berserk.1087';
  } else if (title.includes('chainsaw') || mid.includes('chainsaw')) {
    katSlug = 'chainsaw-man.21890';
  } else if (title.includes('jujutsu') || mid.includes('jujutsu')) {
    katSlug = 'jujutsu-kaisen.20224';
  } else if (title.includes('blue lock') || mid.includes('blue-lock')) {
    katSlug = 'blue-lock.20912';
  } else if (title.includes('sakamoto') || mid.includes('sakamoto')) {
    katSlug = 'sakamoto-days.25555';
  } else if (title.includes('dandadan') || mid.includes('dandadan')) {
    katSlug = 'dandadan.25883';
  } else if (title.includes('gachiakuta') || mid.includes('gachiakuta')) {
    katSlug = 'gachiakuta.26574';
  } else if (title.includes('lookism') || mid.includes('lookism')) {
    katSlug = 'lookism.693';
  } else if (title.includes('fairy tale') || title.includes('stepmother has left') || mid.includes('a-stepmothers-fairy-tale')) {
    katSlug = 'a-stepmothers-fairy-tale.23902';
  } else if (title.includes('tower of god') || mid.includes('tower-of-god')) {
    katSlug = 'tower-of-god.465';
  } else if (title.includes('strongest troll') || mid.includes('worlds-strongest-troll')) {
    katSlug = 'worlds-strongest-troll.26644';
  } else if (title.includes('solo leveling') || mid.includes('solo-leveling') || mid.includes('solo')) {
    katSlug = 'solo-leveling.20815';
  } else if (title.includes('naruto') || mid.includes('naruto')) {
    katSlug = 'naruto.1205';
  } else if (title.includes('bleach') || mid.includes('bleach')) {
    katSlug = 'bleach.47';
  } else if (title.includes('demon slayer') || mid.includes('demon-slayer')) {
    katSlug = 'demon-slayer-kimetsu-no-yaiba.1293';
  } else if (title.includes('hunter x hunter') || mid.includes('hunter-x-hunter')) {
    katSlug = 'hunter-x-hunter.102';
  } else if (title.includes('vinland saga') || mid.includes('vinland-saga')) {
    katSlug = 'vinland-saga.81';
  } else if (title.includes('kingdom') || mid.includes('kingdom')) {
    katSlug = 'kingdom.92';
  } else if (title.includes('vagabond') || mid.includes('vagabond')) {
    katSlug = 'vagabond.84';
  } else if (title.includes('death note') || mid.includes('death-note')) {
    katSlug = 'death-note.235';
  } else if (title.includes('spy x family') || mid.includes('spy-x-family')) {
    katSlug = 'spy-x-family.21980';
  } else if (title.includes('kaiju no') || mid.includes('kaiju-no-8')) {
    katSlug = 'kaiju-no-8.25203';
  } else if (title.includes('black clover') || mid.includes('black-clover')) {
    katSlug = 'black-clover.15582';
  } else if (title.includes('my hero academia') || mid.includes('boku-no-hero-academia')) {
    katSlug = 'boku-no-hero-academia.1325';
  } else if (title.includes('omniscient reader') || mid.includes('omniscient-reader')) {
    katSlug = 'omniscient-readers-viewpoint.24837';
  } else if (title.includes('nano machine') || mid.includes('nano-machine')) {
    katSlug = 'nano-machine.25193';
  } else if (title.includes('estate developer') || mid.includes('greatest-estate-developer')) {
    katSlug = 'the-greatest-estate-developer.26244';
  } else if (title.includes('magic emperor') || mid.includes('magic-emperor')) {
    katSlug = 'magic-emperor.23439';
  } else if (title.includes('mount hua') || title.includes('blossoming blade')) {
    katSlug = 'return-of-the-blossoming-blade.25807';
  } else if (title.includes('wind breaker') || mid.includes('wind-breaker')) {
    katSlug = 'wind-breaker.467';
  } else if (title.includes('eleceed') || mid.includes('eleceed')) {
    katSlug = 'eleceed.115';
  }

  if (katSlug) {
    try {
      const targetSlug = specificChSlug || `c${chNum}`;
      const targetUrl = `https://mangakatana.com/manga/${katSlug}/${targetSlug}`;
      const html = await fetchClientHtml(targetUrl, 5000);
      if (html) {
        let arrayMatch = html.match(/var\s+thzq\s*=\s*\[([^\]]+)\]/i);
        if (!arrayMatch) {
          const allMatches = [...html.matchAll(/var\s+[a-z0-9_]+\s*=\s*\[([^\]]*https:[^\]]*)\]/gi)];
          let best = '';
          for (const m of allMatches) {
            if (m[1].length > best.length) best = m[1];
          }
          if (best) arrayMatch = [null, best];
        }
        if (arrayMatch) {
          const rawUrls = [...arrayMatch[1].matchAll(/['"](https?:\/\/[^'"]+)['"]/g)].map(m => m[1]);
          if (rawUrls.length > 0) {
            const pages = rawUrls.map((imgUrl, idx) => ({
              pageNumber: idx + 1,
              url: imgUrl,
              originalUrl: imgUrl
            }));
            return { chapterId, totalPages: pages.length, pages, sourceUrl };
          }
        }
      }
    } catch (err) {
      console.warn('Direct MangaKatana page resolution error:', err);
    }
  }

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
        const useDataSaver = Array.isArray(json.chapter?.dataSaver) && json.chapter.dataSaver.length > 0;
        const files = useDataSaver ? json.chapter.dataSaver : (json.chapter?.data || []);
        const folder = useDataSaver ? 'data-saver' : 'data';
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

  // 4. Dynamic Multi-Source Search & Scraping Fallback
  // For unmapped titles, AniList entries, or dynamically searched manga:
  try {
    const candidateTitles = new Set();
    if (mangaTitle && cleanTitle(mangaTitle)) candidateTitles.add(cleanTitle(mangaTitle));
    if (title && title !== 'manga' && title !== 'manga series') candidateTitles.add(cleanTitle(title));

    if (mid && !mid.startsWith('anilist:') && !mid.startsWith('kat:') && !mid.startsWith('wc:')) {
      const slugTitle = mid.replace(/[-_:]/g, ' ').trim();
      if (slugTitle && slugTitle.length > 2 && !isMachineId(slugTitle)) {
        candidateTitles.add(cleanTitle(slugTitle));
      }
    }

    // Add subtitle-stripped & punctuation-stripped variants (preserving core title)
    for (const t of [...candidateTitles]) {
      const simplified = t.replace(/[:\-–—!?,.()'"[\]]/g, ' ').replace(/\s+/g, ' ').trim();
      if (simplified && simplified !== t) candidateTitles.add(simplified);
    }

    // If mangaId starts with anilist:, retrieve AniList synonyms to cross-match English & Romaji titles
    if (mid.startsWith('anilist:') || cid.startsWith('anilist_ch:')) {
      const aniIdMatch = mid.match(/anilist:([0-9]+)/) || cid.match(/anilist_ch:([0-9]+)/);
      const anilistId = aniIdMatch ? parseInt(aniIdMatch[1], 10) : null;
      if (anilistId && !isNaN(anilistId)) {
        try {
          const aniRes = await fetch('https://graphql.anilist.co', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: AbortSignal.timeout(4000),
            body: JSON.stringify({
              query: `query ($id: Int) { Media(id: $id, type: MANGA) { title { romaji english userPreferred native } synonyms } }`,
              variables: { id: anilistId }
            })
          });
          if (aniRes.ok) {
            const aniJson = await aniRes.json();
            const media = aniJson?.data?.Media;
            if (media) {
              if (media.title?.romaji) candidateTitles.add(cleanTitle(media.title.romaji));
              if (media.title?.english) candidateTitles.add(cleanTitle(media.title.english));
              if (media.title?.userPreferred) candidateTitles.add(cleanTitle(media.title.userPreferred));
              if (Array.isArray(media.synonyms)) {
                media.synonyms.slice(0, 2).forEach(s => s && candidateTitles.add(cleanTitle(s)));
              }
            }
          }
        } catch {}
      }
    }

    const cleanTargetCh = String(chNum !== undefined && chNum !== null ? chNum : '1').replace(/[^0-9.]/g, '') || '1';
    const finalCandidates = [...candidateTitles].filter(c => c && c.length >= 2).slice(0, 3);

    // Step 4A: Try WeebCentral dynamic search
    for (const cTitle of finalCandidates) {
      try {
        const searchUrl = `https://weebcentral.com/search/data?text=${encodeURIComponent(cTitle)}`;
        const sHtml = await fetchClientHtml(searchUrl, 5000);
        if (sHtml) {
          const seriesMatches = [...sHtml.matchAll(/(?:https?:\/\/weebcentral\.com)?\/series\/([0-9A-Z]{26})(?:\/([^"\s>]+))?/gi)];
          for (const sm of seriesMatches.slice(0, 4)) {
            const seriesId = sm[1];
            const seriesSlug = (sm[2] || '').replace(/[-_]/g, ' ').trim();
            if (seriesSlug && !isAuthenticSeriesMatch(cTitle, seriesSlug) && !isAuthenticSeriesMatch(mangaTitle || title, seriesSlug)) {
              continue;
            }

            const chListUrl = `https://weebcentral.com/series/${seriesId}/full-chapter-list`;
            const chListHtml = await fetchClientHtml(chListUrl, 5000);
            if (chListHtml) {
              const chMatches = [...chListHtml.matchAll(/<a[^>]+href="[^"]*chapters\/([0-9A-Z]{26})"[^>]*>([\s\S]*?)<\/a>/gi)];
              let foundChapId = null;
              for (const cm of chMatches) {
                const rawText = cm[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
                const numMatch = rawText.match(/(?:Chapter|Ch\.?|Episode|Ep\.?)\s*([0-9.]+)/i) || rawText.match(/([0-9.]+)/);
                if (numMatch && (numMatch[1] === cleanTargetCh || parseFloat(numMatch[1]) === parseFloat(cleanTargetCh))) {
                  foundChapId = cm[1];
                  break;
                }
              }
              if (foundChapId) {
                const targetUrl = `https://weebcentral.com/chapters/${foundChapId}/images?is_prev=False&current_page=1&reading_style=long_strip`;
                const imgHtml = await fetchClientHtml(targetUrl, 6000);
                if (imgHtml) {
                  const imgMatches = [...imgHtml.matchAll(/<img[^>]+src="([^"]+)"/gi)]
                    .map(m => m[1])
                    .filter(src => src && !src.includes('/static/') && !src.includes('brand.png') && !src.includes('logo') && !src.includes('favicon'));
                  if (imgMatches.length > 0) {
                    const pages = imgMatches.map((imgUrl, idx) => ({
                      pageNumber: idx + 1,
                      url: baseUrl ? `${baseUrl}/api/image-proxy?url=${encodeURIComponent(imgUrl)}` : imgUrl,
                      originalUrl: imgUrl,
                    }));
                    return { chapterId, totalPages: pages.length, pages, sourceUrl: targetUrl };
                  }
                }
              }
            }
          }
        }
      } catch (e) {
        console.warn('Dynamic WeebCentral resolution warning:', e);
      }
    }

    // Step 4B: Try MangaKatana dynamic search
    for (const cTitle of finalCandidates) {
      try {
        const searchUrl = `https://mangakatana.com/?search=${encodeURIComponent(cTitle)}&search_by=book_name`;
        const sHtml = await fetchClientHtml(searchUrl, 5000);
        if (sHtml) {
          const cardMatches = [...sHtml.matchAll(/<h3 class="title"[^>]*>\s*<a[^>]*href="https?:\/\/mangakatana\.com\/manga\/([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi)];
          for (const card of cardMatches.slice(0, 4)) {
            const foundSlug = card[1];
            const cardTitle = (card[2] || '').replace(/<[^>]+>/g, '').trim();
            if (!isAuthenticSeriesMatch(cTitle, foundSlug.replace(/[-.]/g, ' ')) && !isAuthenticSeriesMatch(cTitle, cardTitle) && !isAuthenticSeriesMatch(mangaTitle || title, cardTitle)) {
              continue;
            }

            const chUrl = `https://mangakatana.com/manga/${foundSlug}/c${cleanTargetCh}`;
            const chHtml = await fetchClientHtml(chUrl, 5000);
            let arrayMatch = chHtml?.match(/var\s+thzq\s*=\s*\[([^\]]+)\]/i);
            if (!arrayMatch && chHtml) {
              const allMatches = [...chHtml.matchAll(/var\s+[a-z0-9_]+\s*=\s*\[([^\]]*https:[^\]]*)\]/gi)];
              let best = '';
              for (const m of allMatches) {
                if (m[1].length > best.length) best = m[1];
              }
              if (best) arrayMatch = [null, best];
            }
            if (arrayMatch) {
              const rawUrls = [...arrayMatch[1].matchAll(/['"](https?:\/\/[^'"]+)['"]/g)].map(m => m[1]);
              if (rawUrls.length > 0) {
                const pages = rawUrls.map((imgUrl, idx) => ({
                  pageNumber: idx + 1,
                  url: baseUrl ? `${baseUrl}/api/image-proxy?url=${encodeURIComponent(imgUrl)}` : imgUrl,
                  originalUrl: imgUrl
                }));
                return { chapterId, totalPages: pages.length, pages, sourceUrl: chUrl };
              }
            }
          }
        }
      } catch (e) {
        console.warn('Dynamic MangaKatana resolution warning:', e);
      }
    }

    // Step 4C: Try MangaDex dynamic search
    for (const cTitle of finalCandidates) {
      try {
        const mdSearchUrl = `https://api.mangadex.org/manga?title=${encodeURIComponent(cTitle)}&limit=3`;
        const mdRes = await fetch(mdSearchUrl, { signal: AbortSignal.timeout(4000) });
        if (mdRes.ok) {
          const mdJson = await mdRes.json();
          const items = mdJson?.data || [];
          for (const item of items) {
            const mdTitle = item.attributes?.title?.en || Object.values(item.attributes?.title || {})[0] || '';
            if (mdTitle && !isAuthenticSeriesMatch(cTitle, mdTitle) && !isAuthenticSeriesMatch(mangaTitle || title, mdTitle)) {
              continue;
            }

            const feedUrl = `https://api.mangadex.org/manga/${item.id}/feed?translatedLanguage[]=en&chapter[]=${encodeURIComponent(cleanTargetCh)}&limit=5`;
            const feedRes = await fetch(feedUrl, { signal: AbortSignal.timeout(4000) });
            if (feedRes.ok) {
              const feedJson = await feedRes.json();
              const chaps = feedJson?.data || [];
              const foundCh = chaps.find(c => c.attributes?.chapter === cleanTargetCh || parseFloat(c.attributes?.chapter) === parseFloat(cleanTargetCh));
              if (foundCh) {
                const atHomeRes = await fetch(`https://api.mangadex.org/at-home/server/${foundCh.id}`, { signal: AbortSignal.timeout(4000) });
                if (atHomeRes.ok) {
                  const atHomeJson = await atHomeRes.json();
                  const bUrl = atHomeJson.baseUrl;
                  const hash = atHomeJson.chapter?.hash;
                  const useDataSaver = Array.isArray(atHomeJson.chapter?.dataSaver) && atHomeJson.chapter.dataSaver.length > 0;
                  const files = useDataSaver ? atHomeJson.chapter.dataSaver : (atHomeJson.chapter?.data || []);
                  const folder = useDataSaver ? 'data-saver' : 'data';
                  const pages = files.map((fileName, idx) => {
                    const directUrl = `${bUrl}/${folder}/${hash}/${fileName}`;
                    return {
                      pageNumber: idx + 1,
                      url: baseUrl ? `${baseUrl}/api/image-proxy?url=${encodeURIComponent(directUrl)}` : directUrl,
                      originalUrl: directUrl,
                    };
                  });
                  if (pages.length > 0) {
                    return { chapterId, totalPages: pages.length, pages, sourceUrl: `https://mangadex.org/chapter/${foundCh.id}` };
                  }
                }
              }
            }
          }
        }
      } catch (e) {
        console.warn('Dynamic MangaDex resolution warning:', e);
      }
    }
  } catch (err) {
    console.warn('Dynamic multi-source search fallback error:', err);
  }

  return {
    chapterId,
    totalPages: 0,
    pages: [],
    sourceUrl,
    warning: `Chapter ${chNum} images are temporarily synchronizing. Please try another chapter.`
  };
}

const liveCoverCache = new Map();

/**
 * Dynamically fetch a verified high-res cover from AniList GraphQL or MangaDex
 */
export async function fetchLiveCover(title) {
  if (!title || typeof title !== 'string') return null;
  const clean = cleanTitle(title).trim();
  if (!clean) return null;
  const cacheKey = clean.toLowerCase();
  if (liveCoverCache.has(cacheKey)) return liveCoverCache.get(cacheKey);

  // 1. Static verified table first
  const reliable = getReliableCoverUrl(clean, null);
  if (reliable && !reliable.startsWith('data:') && !isKnownBrokenUrl(reliable)) {
    liveCoverCache.set(cacheKey, reliable);
    return reliable;
  }

  // 2. Query AniList GraphQL (open CORS, no auth - handles Manga, Manhwa, and adaptations)
  try {
    const q = `query ($search: String) {
      Page(page: 1, perPage: 1) {
        media(search: $search) {
          coverImage { large extraLarge medium }
        }
      }
    }`;
    const res = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: q, variables: { search: clean } })
    });
    if (res.ok) {
      const json = await res.json();
      const firstMedia = json?.data?.Page?.media?.[0];
      const cover = firstMedia?.coverImage?.large || firstMedia?.coverImage?.extraLarge || firstMedia?.coverImage?.medium;
      if (cover && !isKnownBrokenUrl(cover)) {
        liveCoverCache.set(cacheKey, cover);
        return cover;
      }
    }
  } catch {}

  // 3. Query MangaDex API (open CORS)
  try {
    const res = await fetch(`https://api.mangadex.org/manga?title=${encodeURIComponent(clean)}&limit=1&includes[]=cover_art`);
    if (res.ok) {
      const json = await res.json();
      const manga = json?.data?.[0];
      const rel = manga?.relationships?.find((r) => r.type === 'cover_art');
      const fileName = rel?.attributes?.fileName;
      if (manga && fileName) {
        const cover = `https://uploads.mangadex.org/covers/${manga.id}/${fileName}.512.jpg`;
        liveCoverCache.set(cacheKey, cover);
        return cover;
      }
    }
  } catch {}

  return null;
}

function escapeXml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function getFallbackCover(title = 'Manga', author = '') {
  let safeTitle = cleanTitle(title || 'Manga');
  if (isMachineId(safeTitle)) {
    const rawId = safeTitle.replace(/^wc:/i, '').toLowerCase();
    safeTitle = KNOWN_SERIES_TITLES[rawId] || 'Manga Series';
  }
  const escapedTitle = escapeXml(safeTitle);
  const escapedAuthor = escapeXml(author && author !== 'Manga' ? author : 'Manga Series');

  let hash = 0;
  for (let i = 0; i < safeTitle.length; i++) {
    hash = safeTitle.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue1 = Math.abs(hash % 360);
  const hue2 = (hue1 + 50) % 360;

  // Split title if lengthy
  const words = escapedTitle.split(' ');
  let line1 = escapedTitle;
  let line2 = '';
  if (escapedTitle.length > 16 && words.length > 1) {
    const mid = Math.ceil(words.length / 2);
    line1 = words.slice(0, mid).join(' ');
    line2 = words.slice(mid).join(' ');
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="600" viewBox="0 0 400 600">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#07090e"/>
        <stop offset="50%" stop-color="hsl(${hue1}, 28%, 11%)"/>
        <stop offset="100%" stop-color="#040609"/>
      </linearGradient>
      <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="hsl(${hue1}, 85%, 62%)"/>
        <stop offset="100%" stop-color="hsl(${hue2}, 85%, 62%)"/>
      </linearGradient>
      <radialGradient id="glow" cx="50%" cy="32%" r="55%">
        <stop offset="0%" stop-color="hsl(${hue1}, 80%, 55%)" stop-opacity="0.22"/>
        <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="400" height="600" fill="url(#bg)"/>
    <circle cx="200" cy="210" r="150" fill="url(#glow)"/>
    
    <text x="200" y="270" text-anchor="middle" fill="hsl(${hue1}, 40%, 40%)" fill-opacity="0.12" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="150" font-weight="900">漫画</text>
    
    <rect x="22" y="22" width="356" height="556" rx="16" fill="none" stroke="url(#accent)" stroke-width="1.5" stroke-opacity="0.4"/>
    <rect x="30" y="30" width="340" height="540" rx="12" fill="none" stroke="#ffffff" stroke-width="0.8" stroke-opacity="0.08"/>
    
    <text x="44" y="56" fill="hsl(${hue1}, 80%, 70%)" font-family="'JetBrains Mono', monospace" font-size="10" font-weight="700" letter-spacing="3">KURONEKO ARCHIVE</text>
    <circle cx="350" cy="52" r="4" fill="hsl(${hue1}, 85%, 60%)"/>
    
    <circle cx="200" cy="195" r="44" fill="#0d111a" stroke="url(#accent)" stroke-width="2"/>
    <polygon points="200,172 220,206 180,206" fill="none" stroke="hsl(${hue1}, 85%, 60%)" stroke-width="2"/>
    <circle cx="200" cy="195" r="7" fill="hsl(${hue2}, 85%, 60%)"/>
    
    <line x1="140" y1="310" x2="260" y2="310" stroke="url(#accent)" stroke-width="2" stroke-linecap="round"/>
    <text x="200" y="355" text-anchor="middle" fill="#ffffff" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="${line2 ? '22' : '25'}" font-weight="800" letter-spacing="0.5">${line1}</text>
    ${line2 ? `<text x="200" y="390" text-anchor="middle" fill="#ffffff" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="21" font-weight="800" letter-spacing="0.5">${line2}</text>` : ''}
    <text x="200" y="${line2 ? '425' : '395'}" text-anchor="middle" fill="#94a3b8" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="12" font-weight="500">${escapedAuthor}</text>
    
    <text x="200" y="538" text-anchor="middle" fill="#64748b" font-family="'JetBrains Mono', monospace" font-size="9" letter-spacing="3">AUTHENTIC MANGA EDITION</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Format a Manga item into standard shape
 */
function formatMangaItem(item) {
  if (!item) return null;
  let safeTitle = cleanTitle(item.title);
  if (isMachineId(safeTitle)) {
    const rawId = String(item.id || item.seriesId || safeTitle).replace(/^wc:/i, '').toLowerCase();
    safeTitle = KNOWN_SERIES_TITLES[rawId] || item.englishTitle || 'Manga Series';
  }
  const safeEnglishTitle = item.englishTitle && !isMachineId(item.englishTitle) ? cleanTitle(item.englishTitle) : null;
  const reliableCover = getReliableCoverUrl(safeTitle, item.coverUrl);
  const baseUrl = getApiBaseUrl();

  const proxiedCover = reliableCover
    ? (needsImageProxy(reliableCover) 
        ? (baseUrl ? `${baseUrl}/api/image-proxy?url=${encodeURIComponent(reliableCover)}` : reliableCover)
        : reliableCover)
    : getFallbackCover(safeTitle, item.author);

  const rawUnwrapped = unwrapProxyUrl(item.rawCoverUrl || item.coverUrl);
  const rawCover = (rawUnwrapped && !isKnownBrokenUrl(rawUnwrapped) && !rawUnwrapped.includes('nocover') && !rawUnwrapped.includes('placeholder'))
    ? rawUnwrapped
    : reliableCover;

  return {
    id: item.id,
    title: safeTitle,
    englishTitle: safeEnglishTitle,
    coverUrl: proxiedCover,
    rawCoverUrl: rawCover,
    status: item.status || 'Ongoing',
    author: item.author && item.author.trim() && item.author !== 'Manga' ? decodeHtml(item.author) : 'Top Artist',
    tags: (item.tags || ['Manga', 'Action']).map(decodeHtml),
    year: item.year || null,
    sourceName: item.sourceName || (
      item.id?.startsWith('kat:') ? 'MangaKatana' :
      item.id?.startsWith('flame:') ? 'Flame Comics' :
      item.id?.startsWith('thunder:') ? 'Thunder Scans' :
      item.id?.startsWith('asura:') ? 'Asura Scans' :
      item.id?.startsWith('vortex:') ? 'Vortex Scans' :
      (item.id?.startsWith('wc:') || /^[0-9a-hjkmnp-tv-z]{26}$/i.test(item.id || '')) ? 'WeebCentral' :
      item.id?.startsWith('md:') ? 'MangaDex' :
      item.id?.startsWith('mk:') ? 'MangaKakalot' :
      item.id?.startsWith('webtoon:') ? 'Webtoon' : 'MangaPill'
    ),
    provider: item.provider || (
      item.id?.startsWith('asura:') ? 'asura' :
      item.id?.startsWith('webtoon:') ? 'webtoon' :
      (item.id?.startsWith('wc:') || /^[0-9a-hjkmnp-tv-z]{26}$/i.test(item.id || '')) ? 'weebcentral' : 'mangapill'
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
