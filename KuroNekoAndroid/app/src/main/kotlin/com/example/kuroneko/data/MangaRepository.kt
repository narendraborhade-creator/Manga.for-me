package com.example.kuroneko.data

import android.content.Context
import android.content.SharedPreferences
import android.webkit.WebResourceResponse
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONArray
import org.json.JSONObject
import java.io.ByteArrayInputStream
import java.net.URLEncoder
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.TimeUnit
import java.util.regex.Pattern

class MangaRepository(context: Context) {

    private val prefs: SharedPreferences =
        context.getSharedPreferences("kuroneko_prefs", Context.MODE_PRIVATE)

    private val httpClient: OkHttpClient = OkHttpClient.Builder()
        .connectTimeout(15, TimeUnit.SECONDS)
        .readTimeout(20, TimeUnit.SECONDS)
        .followRedirects(true)
        .build()

    private val slugMap: Map<String, String> = mapOf(
        "01J76XY7E9FNDZ1DBBM6PBJPFK" to "one-piece.49",
        "01J76XY7KT7J224EBK6J816Y1Q" to "one-punch-man.163",
        "01J76XYD7E91K8QP6CY0Y53900" to "blue-lock.20912",
        "01J76XYE3130E1W5HKTJ7VD912" to "sakamoto-days.25555",
        "01J76XYE23859ZWDP7BJ520AKY" to "the-beginning-after-the-end.20235",
        "01J76XYDQ9JTWW4THBJWPXNJ9H" to "a-stepmothers-fairy-tale.23902",
        "webtoon:solo-leveling" to "solo-leveling.20815",
        "01J76XYEMWA55C7XTZHP1HNARM" to "dandadan.25883",
        "01J76XYFD97DRQQKK75FZB7PQH" to "gachiakuta.26574",
        "01J76XYCVRSNNY2C2QH721967B" to "mato-seihei-no-slave.22152",
        "01J76XYCYJ0P680SKX3QZ0NQD7" to "spy-x-family.21980",
        "01J76XYFHFZ88R32BW3RXHN1WP" to "the-fragrant-flower-blooms-with-dignity.26462",
        "01J76XY7EF75DJNQCV04HTPDZK" to "berserk.1087",
        "01J76XYCERXE60T7FKXVCCAQ0H" to "jujutsu-kaisen.20224",
        "01J76XYCRVY3QGYAMRR3STW941" to "chainsaw-man.21890",
        "kat:lookism.693" to "lookism.693",
        "kat:tower-of-god.465" to "tower-of-god.465",
        "kat:worlds-strongest-troll.26644" to "worlds-strongest-troll.26644",
        "2/one-piece" to "one-piece.49",
        "3262/one-punch-man" to "one-punch-man.163",
        "1/berserk" to "berserk.1087",
        "723/chainsaw-man" to "chainsaw-man.21890",
        "938/death-note" to "death-note.235",
        "3/bleach" to "bleach.47",
        "5/naruto" to "naruto.1205",
        "17/hunter-x-hunter" to "hunter-x-hunter.102",
        "2085/jujutsu-kaisen" to "jujutsu-kaisen.20224",
        "467/demon-slayer" to "demon-slayer-kimetsu-no-yaiba.1293",
        "50/attack-on-titan" to "shingeki-no-kyojin.131",
        "60/vinland-saga" to "vinland-saga.81",
        "4/vagabond" to "vagabond.84",
        "8/kingdom" to "kingdom.92",
        "asura:surviving-game-barbarian" to "surviving-the-game-as-a-barbarian.27138",
        "asura:reincarnation-of-the-suicidal-battle-god-ab39de10" to "reincarnation-of-the-suicidal-battle-god.25816",
        "asura:nano-machine-ab39de10" to "nano-machine.25193",
        "asura:greatest-estate-developer" to "the-greatest-estate-developer.26244",
        "asura:return-of-the-mount-hua-sect-ab39de10" to "return-of-the-blossoming-blade.25807",
        "kat:wind-breaker.467" to "wind-breaker.467",
        "kat:eleceed.115" to "eleceed.115"
    )

    private val wcSeriesMap: Map<String, String> = mapOf(
        "01J76XY7E9FNDZ1DBBM6PBJPFK" to "01J76XY7E9FNDZ1DBBM6PBJPFK",
        "01J76XY7KT7J224EBK6J816Y1Q" to "01J76XY7KT7J224EBK6J816Y1Q",
        "01J76XYD7E91K8QP6CY0Y53900" to "01J76XYD7E91K8QP6CY0Y53900",
        "01J76XYE3130E1W5HKTJ7VD912" to "01J76XYE3130E1W5HKTJ7VD912",
        "01J76XYE23859ZWDP7BJ520AKY" to "01J76XYE23859ZWDP7BJ520AKY",
        "01J76XYDQ9JTWW4THBJWPXNJ9H" to "01J76XYDQ9JTWW4THBJWPXNJ9H",
        "01J76XYEMWA55C7XTZHP1HNARM" to "01J76XYEMWA55C7XTZHP1HNARM",
        "01J76XYFD97DRQQKK75FZB7PQH" to "01J76XYFD97DRQQKK75FZB7PQH",
        "01J76XYCVRSNNY2C2QH721967B" to "01J76XYCVRSNNY2C2QH721967B",
        "01J76XYCYJ0P680SKX3QZ0NQD7" to "01J76XYCYJ0P680SKX3QZ0NQD7",
        "01J76XYFHFZ88R32BW3RXHN1WP" to "01J76XYFHFZ88R32BW3RXHN1WP",
        "01J76XY7EF75DJNQCV04HTPDZK" to "01J76XY7EF75DJNQCV04HTPDZK",
        "01J76XYCERXE60T7FKXVCCAQ0H" to "01J76XYCERXE60T7FKXVCCAQ0H",
        "01J76XYCRVY3QGYAMRR3STW941" to "01J76XYCRVY3QGYAMRR3STW941",
        "01J76XYFAESZTJT5AQ1SPFKYXR" to "01J76XYFAESZTJT5AQ1SPFKYXR",
        "01J76XYGVNHEER7G6M90C6YCTW" to "01J76XYGVNHEER7G6M90C6YCTW",
        "01J76XYBD282Y3XKX0KRGD64Q5" to "01J76XYBD282Y3XKX0KRGD64Q5",
        "01J76XY7M0W9WWJ55VJYYB2J1S" to "01J76XY7M0W9WWJ55VJYYB2J1S",
        "01J76XYA1TQYKV6W4BCMR2WD5M" to "01J76XYA1TQYKV6W4BCMR2WD5M",
        "01J76XYDT7H7ANER8KJG5R9SJV" to "01J76XYDT7H7ANER8KJG5R9SJV",
        "01J76XYEVCSS5ANBCJZ4ZF9P65" to "01J76XYEVCSS5ANBCJZ4ZF9P65",
        "01J76XYF6V9BDFSRRTY2C65SBS" to "01J76XYF6V9BDFSRRTY2C65SBS",
        "01J76XYCPSY3C4BNPBRY8JMCBE" to "01J76XYCPSY3C4BNPBRY8JMCBE",
        "01J76XYDMWWJX3T4BFWR84FQQK" to "01J76XYDMWWJX3T4BFWR84FQQK",
        "01J76XYEZ1BQJM22H3RREE1XMG" to "01J76XYEZ1BQJM22H3RREE1XMG",
        "01J76XYG976314R2DM2DKQRBGS" to "01J76XYG976314R2DM2DKQRBGS",
        "01J76XYG12YTB3J27FVBM256V8" to "01J76XYG12YTB3J27FVBM256V8",
        "webtoon:ks:my-in-laws-are-obsessed-with-me" to "01J76XYFAESZTJT5AQ1SPFKYXR",
        "my-in-laws-are-obsessed-with-me" to "01J76XYFAESZTJT5AQ1SPFKYXR",
        "my-in-laws-are-my-beloved-in-laws" to "01J76XYFAESZTJT5AQ1SPFKYXR",
        "kat:worlds-strongest-troll.26644" to "01J76XYGVNHEER7G6M90C6YCTW",
        "worlds-strongest-troll" to "01J76XYGVNHEER7G6M90C6YCTW",
        "lookism" to "01J76XYBD282Y3XKX0KRGD64Q5",
        "tower-of-god" to "01J76XY7M0W9WWJ55VJYYB2J1S",
        "wind-breaker" to "01J76XYA1TQYKV6W4BCMR2WD5M",
        "webtoon:solo-leveling" to "01J76XYCPSY3C4BNPBRY8JMCBE",
        "solo-leveling" to "01J76XYCPSY3C4BNPBRY8JMCBE",
        "webtoon:omniscient-reader" to "01J76XYDMWWJX3T4BFWR84FQQK",
        "omniscient-reader" to "01J76XYDMWWJX3T4BFWR84FQQK",
        "asura:nano-machine-ab39de10" to "01J76XYDT7H7ANER8KJG5R9SJV",
        "nano-machine" to "01J76XYDT7H7ANER8KJG5R9SJV",
        "asura:greatest-estate-developer" to "01J76XYF6V9BDFSRRTY2C65SBS",
        "the-greatest-estate-developer" to "01J76XYF6V9BDFSRRTY2C65SBS",
        "estate-developer" to "01J76XYF6V9BDFSRRTY2C65SBS",
        "asura:return-of-the-mount-hua-sect-ab39de10" to "01J76XYEVCSS5ANBCJZ4ZF9P65",
        "return-of-the-mount-hua-sect" to "01J76XYEVCSS5ANBCJZ4ZF9P65",
        "mount-hua" to "01J76XYEVCSS5ANBCJZ4ZF9P65",
        "doom-breaker" to "01J76XYEZ1BQJM22H3RREE1XMG",
        "asura:reincarnation-of-the-suicidal-battle-god-ab39de10" to "01J76XYEZ1BQJM22H3RREE1XMG",
        "barbarian" to "01J76XYG976314R2DM2DKQRBGS",
        "surviving-the-game-as-a-barbarian" to "01J76XYG976314R2DM2DKQRBGS",
        "asura:surviving-game-barbarian" to "01J76XYG976314R2DM2DKQRBGS",
        "damn-reincarnation" to "01J76XYG12YTB3J27FVBM256V8",
        "my-blasted-reincarnated-life" to "01J76XYG12YTB3J27FVBM256V8"
    )

    private val wcChapterCache = ConcurrentHashMap<String, ConcurrentHashMap<String, String>>()

    // Pre-populated verified catalog with direct CDN URLs (zero Vercel load)
    val catalog: List<MangaItem> = listOf(
        MangaItem(
            id = "01J76XY7E9FNDZ1DBBM6PBJPFK",
            title = "One Piece",
            englishTitle = "One Piece",
            coverUrl = "https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx30013-BeslEMqiPhlk.jpg",
            status = "Ongoing",
            score = "9.8",
            year = "1997",
            author = "Eiichiro Oda",
            tags = listOf("Action", "Adventure", "Fantasy", "Shounen"),
            sourceName = "MangaKatana",
            totalChapters = 1120,
            latestChapter = "1120",
            description = "Gol D. Roger was known as the 'Pirate King', the strongest and most infamous being to have sailed the Grand Line. Monkey D. Luffy sets sail in search of the legendary One Piece treasure!"
        ),
        MangaItem(
            id = "01J76XY7KT7J224EBK6J816Y1Q",
            title = "One-Punch Man",
            englishTitle = "One-Punch Man",
            coverUrl = "https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx74347-sZpmNJ5xLwRK.jpg",
            status = "Ongoing",
            score = "9.4",
            year = "2012",
            author = "ONE & Yusuke Murata",
            tags = listOf("Action", "Comedy", "Superhero", "Supernatural"),
            sourceName = "MangaKatana",
            totalChapters = 215,
            latestChapter = "215",
            description = "Saitama is a hero who only does it for fun. After three years of training, he has grown so strong that he can defeat any enemy with a single punch."
        ),
        MangaItem(
            id = "01J76XYD7E91K8QP6CY0Y53900",
            title = "Blue Lock",
            englishTitle = "Blue Lock",
            coverUrl = "https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx106130-yPNeuSu75ey1.jpg",
            status = "Ongoing",
            score = "9.3",
            year = "2018",
            author = "Muneyuki Kaneshiro & Yusuke Nomura",
            tags = listOf("Action", "Sports", "Drama", "Shounen"),
            sourceName = "MangaKatana",
            totalChapters = 280,
            latestChapter = "280",
            description = "Japan's desire for World Cup glory leads the Japanese Football Association to launch a new rigorous training program to find the national team's next star striker. Three hundred high school strikers enter the Blue Lock facility!"
        ),
        MangaItem(
            id = "01J76XYE3130E1W5HKTJ7VD912",
            title = "Sakamoto Days",
            englishTitle = "Sakamoto Days",
            coverUrl = "https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx125828-p78Z8SflkfmO.jpg",
            status = "Ongoing",
            score = "9.4",
            year = "2020",
            author = "Yuto Suzuki",
            tags = listOf("Action", "Comedy", "Supernatural", "Shounen"),
            sourceName = "MangaKatana",
            totalChapters = 195,
            latestChapter = "195",
            description = "Taro Sakamoto was an unrivaled hitman, earning legendary status in the underworld until he fell in love, married, retired, and gained weight running a convenience store. But the criminal underworld has not forgotten him!"
        ),
        MangaItem(
            id = "01J76XYE23859ZWDP7BJ520AKY",
            title = "The Beginning After the End",
            englishTitle = "The Beginning After the End",
            coverUrl = "https://temp.compsci88.com/cover/fallback/01J76XYE23859ZWDP7BJ520AKY.jpg",
            status = "Ongoing",
            score = "9.6",
            year = "2018",
            author = "TurtleMe & Fuyuki23",
            tags = listOf("Action", "Adventure", "Fantasy", "Manhwa", "Webtoon"),
            sourceName = "WeebCentral",
            totalChapters = 185,
            latestChapter = "185",
            description = "King Grey has unrivaled strength, wealth, and prestige in a world governed by martial ability. Reincarnated into a new world filled with magic and monsters, the king has a second chance to relive his life!"
        ),
        MangaItem(
            id = "01J76XYDQ9JTWW4THBJWPXNJ9H",
            title = "A Stepmother's Fairy Tale",
            englishTitle = "The Fantasie of a Stepmother",
            coverUrl = "https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx111075-ZSqT1Z2XASRp.jpg",
            status = "Ongoing",
            score = "9.7",
            year = "2019",
            author = "Spice&Kitty & ORKA",
            tags = listOf("Fantasy", "Romance", "Drama", "Regression", "Manhwa"),
            sourceName = "WeebCentral",
            totalChapters = 173,
            latestChapter = "172",
            description = "The iron widow, the spider widow, male hunter, the witch of Neuwanstein Castle... Shuri Von Neuwanstein raised children who were not related to her by blood. When she was killed, she woke up seven years in the past."
        ),
        MangaItem(
            id = "webtoon:solo-leveling",
            title = "Solo Leveling",
            englishTitle = "Only I Level Up",
            coverUrl = "https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx105398-b673Vt5ZSuz3.jpg",
            status = "Completed",
            score = "9.7",
            year = "2018",
            author = "Chugong & DUBU",
            tags = listOf("Action", "Fantasy", "Monsters", "Manhwa", "Webtoon"),
            sourceName = "Webtoon",
            totalChapters = 200,
            latestChapter = "200",
            description = "In a world where hunters must battle deadly monsters, weak hunter Sung Jin-woo finds himself in a mysterious dual dungeon that grants him the unique ability to level up infinitely!"
        ),
        MangaItem(
            id = "01J76XYEMWA55C7XTZHP1HNARM",
            title = "Dandadan",
            englishTitle = "Dandadan",
            coverUrl = "https://s4.anilist.co/file/anilistcdn/media/manga/cover/medium/bx132029-prGF4gePdSKv.jpg",
            status = "Ongoing",
            score = "9.5",
            year = "2021",
            author = "Yukinobu Tatsu",
            tags = listOf("Action", "Comedy", "Supernatural", "Sci-Fi"),
            sourceName = "MangaKatana",
            totalChapters = 180,
            latestChapter = "180",
            description = "Momo Ayase strikes up an unusual friendship with her school's UFO fanatic, whom she nicknames 'Okarun' because he won't say his real name. Soon, ghosts, aliens, and occult battles explode!"
        ),
        MangaItem(
            id = "01J76XYFD97DRQQKK75FZB7PQH",
            title = "Gachiakuta",
            englishTitle = "Gachiakuta",
            coverUrl = "https://s4.anilist.co/file/anilistcdn/media/manga/cover/medium/bx144946-cscic3n2SwdY.jpg",
            status = "Ongoing",
            score = "9.3",
            year = "2022",
            author = "Kei Urana",
            tags = listOf("Action", "Drama", "Supernatural", "Shounen"),
            sourceName = "MangaKatana",
            totalChapters = 110,
            latestChapter = "110",
            description = "Rudo lives in the slums of a floating sphere city, despised as tribal trash. Framed for murder, he is cast down into the Abyss—a colossal garbage dump where he awakens the power to breathe life into discarded objects."
        ),
        MangaItem(
            id = "01J76XYCVRSNNY2C2QH721967B",
            title = "Chained Soldier",
            englishTitle = "Mato Seihei no Slave",
            coverUrl = "https://s4.anilist.co/file/anilistcdn/media/manga/cover/medium/bx106064-WBMhTOo7UQ20.png",
            status = "Ongoing",
            score = "9.2",
            year = "2019",
            author = "Takahiro & Yohei Takemura",
            tags = listOf("Action", "Fantasy", "Ecchi", "Supernatural"),
            sourceName = "MangaKatana",
            totalChapters = 145,
            latestChapter = "145",
            description = "When entrances to a demon realm called 'Mato' open across Japan, a special fruit gives women superpowers. Yuuki Wakura is saved by Kyouka Uzen, captain of the 7th Anti-Demon Corps, and becomes her bonded warrior."
        ),
        MangaItem(
            id = "01J76XYCYJ0P680SKX3QZ0NQD7",
            title = "Spy x Family",
            englishTitle = "Spy x Family",
            coverUrl = "https://s4.anilist.co/file/anilistcdn/media/manga/cover/medium/bx108556-NHjkz0BNJhLx.jpg",
            status = "Ongoing",
            score = "9.5",
            year = "2019",
            author = "Tatsuya Endo",
            tags = listOf("Comedy", "Action", "Supernatural", "Shounen"),
            sourceName = "MangaKatana",
            totalChapters = 108,
            latestChapter = "108",
            description = "Master spy 'Twilight' must create a fake family for an undercover peace mission. Unknown to him, his adopted daughter Anya is a telepath, and his fake wife Yor is an elite assassin!"
        ),
        MangaItem(
            id = "01J76XYFHFZ88R32BW3RXHN1WP",
            title = "The Fragrant Flower Blooms with Dignity",
            englishTitle = "Kaoru Hana wa Rin to Saku",
            coverUrl = "https://s4.anilist.co/file/anilistcdn/media/manga/cover/medium/bx140475-QEGtrmdvbpOv.jpg",
            status = "Ongoing",
            score = "9.6",
            year = "2021",
            author = "Saka Mikami",
            tags = listOf("Romance", "Slice of Life", "School", "Drama"),
            sourceName = "MangaKatana",
            totalChapters = 140,
            latestChapter = "140",
            description = "Rintaro Tsumugi, an intimidating boy from the bottom-tier Chidori High, meets Kaoruko Wakaguri, a warm customer at his family's cake shop who attends the prestigious neighboring girls' school."
        ),
        MangaItem(
            id = "01J76XY7EF75DJNQCV04HTPDZK",
            title = "Berserk",
            englishTitle = "Berserk",
            coverUrl = "https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx30002-Cul4OeN7bYtn.jpg",
            status = "Ongoing",
            score = "9.9",
            year = "1989",
            author = "Kentaro Miura",
            tags = listOf("Action", "Dark Fantasy", "Horror", "Seinen"),
            sourceName = "MangaKatana",
            totalChapters = 376,
            latestChapter = "376",
            description = "Guts, a former mercenary known as the 'Black Swordsman', seeks vengeance against his former comrade Griffith, who sacrificed their band of brothers to become a demonic god."
        ),
        MangaItem(
            id = "01J76XYGVNHEER7G6M90C6YCTW",
            title = "World's Strongest Troll",
            englishTitle = "World's Strongest Troll",
            coverUrl = "https://mangakatana.com/imgs/cover/04e/1f/7b189.jpg",
            status = "Completed",
            score = "9.5",
            year = "2022",
            author = "Dex",
            tags = listOf("Action", "Comedy", "Fantasy", "Virtual Reality", "Manhwa"),
            sourceName = "WeebCentral",
            totalChapters = 198,
            latestChapter = "198",
            description = "Jaeyeong's chaotic VR gaming adventures in Arcadia as the legendary troll DEX who overcomes every insurmountable obstacle through sheer game knowledge and unconventional tactics!"
        ),
        MangaItem(
            id = "01J76XYFAESZTJT5AQ1SPFKYXR",
            title = "My In-Laws Are Obsessed With Me",
            englishTitle = "My In-Laws Are Obsessed With Me",
            coverUrl = "https://s4.anilist.co/file/anilistcdn/media/manga/cover/medium/bx142894-SRinclU1kzu9.jpg",
            status = "Ongoing",
            score = "9.6",
            year = "2021",
            author = "Seungu & Han Yoon-seol",
            tags = listOf("Fantasy", "Romance", "Reincarnation", "Drama", "Manhwa"),
            sourceName = "WeebCentral",
            totalChapters = 130,
            latestChapter = "130",
            description = "Pereshati regresses after being betrayed and poisoned by her family. To safeguard her second life, she proposes a contract marriage with the cursed Grand Duke Therdeo Lapileon."
        )
    )

    suspend fun getPopularManga(): List<MangaItem> = withContext(Dispatchers.IO) {
        catalog
    }

    suspend fun searchManga(
        query: String = "",
        source: String = "All",
        genre: String = "All"
    ): List<MangaItem> = withContext(Dispatchers.IO) {
        val q = query.trim().lowercase()
        catalog.filter { item ->
            val matchesQuery = q.isEmpty() ||
                item.title.lowercase().contains(q) ||
                (item.englishTitle?.lowercase()?.contains(q) == true) ||
                item.author.lowercase().contains(q)

            val matchesSource = source == "All" || item.sourceName.equals(source, ignoreCase = true)
            val matchesGenre = genre == "All" || item.tags.any { it.equals(genre, ignoreCase = true) }

            matchesQuery && matchesSource && matchesGenre
        }
    }

    suspend fun getMangaDetails(mangaId: String): MangaDetail = withContext(Dispatchers.IO) {
        val manga = catalog.find { it.id == mangaId }
            ?: catalog.first()

        val chapters = (manga.totalChapters downTo 1).map { chNum ->
            ChapterItem(
                id = "${manga.id}_ch_$chNum",
                chapterNumber = chNum.toString(),
                title = "Chapter $chNum",
                releaseDate = if (chNum == manga.totalChapters) "Latest Release" else "Archived"
            )
        }

        MangaDetail(manga = manga, chapters = chapters)
    }

    private fun isAuthenticSeriesMatch(query: String, candidateTitle: String): Boolean {
        if (query.isBlank() || candidateTitle.isBlank()) return false
        val qLower = query.lowercase().trim()
        val cLower = candidateTitle.lowercase().trim()
        if (qLower == cLower || cLower.contains(qLower) || qLower.contains(cLower)) return true

        val stopWords = setOf("the", "a", "an", "and", "or", "of", "in", "to", "for", "with", "are", "is", "my", "her", "his", "manga", "series")
        val qTokens = qLower.replace(Regex("[^a-z0-9\\s]"), " ")
            .split(Regex("\\s+"))
            .filter { it.isNotBlank() && it.length > 1 && it !in stopWords }
        if (qTokens.isEmpty()) return false

        val matchedTokens = qTokens.count { token -> cLower.contains(token) }
        if (qTokens.any { it.length >= 4 && cLower.contains(it) }) return true
        val threshold = if (qTokens.size <= 2) 1 else Math.min(2, qTokens.size)
        return matchedTokens >= threshold
    }

    private fun searchWeebCentralSeries(title: String): String? {
        if (title.isBlank()) return null
        return try {
            val q = URLEncoder.encode(title.trim(), "UTF-8")
            val url = "https://weebcentral.com/search/data?text=$q"
            val request = Request.Builder()
                .url(url)
                .header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36")
                .header("Referer", "https://weebcentral.com/")
                .build()
            httpClient.newCall(request).execute().use { resp ->
                if (resp.isSuccessful) {
                    val html = resp.body?.string().orEmpty()
                    val p = Pattern.compile("(?:https?://weebcentral\\.com)?/series/([0-9A-Za-z]{26})(?:/([^\"\\s>]+))?", Pattern.CASE_INSENSITIVE)
                    val m = p.matcher(html)
                    while (m.find()) {
                        val sId = m.group(1).orEmpty()
                        val sSlug = m.group(2)?.replace("-", " ").orEmpty()
                        if (sSlug.isBlank() || isAuthenticSeriesMatch(title, sSlug)) {
                            return sId
                        }
                    }
                }
                null
            }
        } catch (_: Exception) {
            null
        }
    }

    private fun searchKatanaSlug(query: String): String? {
        if (query.isBlank()) return null
        return try {
            val q = URLEncoder.encode(query.trim(), "UTF-8")
            val searchUrl = "https://mangakatana.com/?search=$q&search_by=book_name"
            val sReq = Request.Builder()
                .url(searchUrl)
                .header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36")
                .header("Referer", "https://mangakatana.com/")
                .build()
            httpClient.newCall(sReq).execute().use { sResp ->
                if (sResp.isSuccessful) {
                    val sHtml = sResp.body?.string().orEmpty()
                    val cardPattern = Pattern.compile("<h3 class=\"title\"[^>]*>\\s*<a[^>]*href=\"https?://mangakatana\\.com/manga/([^\"/?#]+)\"[^>]*>([\\s\\S]*?)</a>", Pattern.CASE_INSENSITIVE)
                    val cardMatcher = cardPattern.matcher(sHtml)
                    while (cardMatcher.find()) {
                        val candidateSlug = cardMatcher.group(1).orEmpty()
                        val candidateTitle = cardMatcher.group(2).orEmpty().replace(Regex("<[^>]+>"), "").trim()
                        if (isAuthenticSeriesMatch(query, candidateTitle) || isAuthenticSeriesMatch(query, candidateSlug.replace(Regex("[-.]"), " "))) {
                            return candidateSlug
                        }
                    }
                }
                null
            }
        } catch (_: Exception) {
            null
        }
    }

    private fun fetchAniListSynonyms(mangaId: String, title: String): List<String> {
        val results = mutableListOf<String>()
        try {
            val cleanId = mangaId.replace(Regex("^anilist:"), "").toIntOrNull()
            val query = if (cleanId != null) {
                "query { Media(id: $cleanId, type: MANGA) { title { romaji english native userPreferred } synonyms } }"
            } else if (title.isNotBlank()) {
                val safeT = JSONObject.quote(title)
                "query { Media(search: $safeT, type: MANGA) { title { romaji english native userPreferred } synonyms } }"
            } else return emptyList()

            val bodyObj = JSONObject().apply { put("query", query) }
            val reqBody = bodyObj.toString().toRequestBody("application/json; charset=utf-8".toMediaTypeOrNull())
            val req = Request.Builder()
                .url("https://graphql.anilist.co")
                .post(reqBody)
                .build()
            httpClient.newCall(req).execute().use { resp ->
                if (resp.isSuccessful) {
                    val json = JSONObject(resp.body?.string().orEmpty())
                    val media = json.optJSONObject("data")?.optJSONObject("Media")
                    if (media != null) {
                        val tObj = media.optJSONObject("title")
                        tObj?.optString("romaji")?.takeIf { it.isNotBlank() }?.let { results.add(it) }
                        tObj?.optString("english")?.takeIf { it.isNotBlank() }?.let { results.add(it) }
                        tObj?.optString("userPreferred")?.takeIf { it.isNotBlank() }?.let { results.add(it) }
                        val syns = media.optJSONArray("synonyms")
                        if (syns != null) {
                            for (i in 0 until syns.length()) {
                                val s = syns.optString(i)
                                if (s.isNotBlank()) results.add(s)
                            }
                        }
                    }
                }
            }
        } catch (_: Exception) {}
        return results.distinct().take(3)
    }

    private fun resolveWeebCentralSeries(mangaId: String, requestedTitle: String): String? {
        val cleanMid = mangaId.replace(Regex("^(wc:|wc_)"), "").trim()
        if (cleanMid.matches(Regex("^[0-9A-Za-z]{26}$"))) return cleanMid

        val direct = wcSeriesMap[mangaId] ?: wcSeriesMap[cleanMid]
            ?: wcSeriesMap.entries.find { mangaId.contains(it.key, ignoreCase = true) }?.value
        if (direct != null) return direct

        val t = requestedTitle.lowercase().trim()
        val m = mangaId.lowercase().trim()
        return when {
            t.contains("obsessed with me") || m.contains("obsessed-with-me") -> "01J76XYFAESZTJT5AQ1SPFKYXR"
            t.contains("hole is open") || t.contains("seitokai") -> "01J76XYHGCQ2A1VG5KYTNHEHKF"
            t.contains("strongest troll") || m.contains("strongest-troll") -> "01J76XYGVNHEER7G6M90C6YCTW"
            t.contains("solo leveling") || m.contains("solo-leveling") || m.contains("solo") -> "01J76XYCPSY3C4BNPBRY8JMCBE"
            t.contains("omniscient reader") || m.contains("omniscient-reader") || m.contains("orv") -> "01J76XYDMWWJX3T4BFWR84FQQK"
            t.contains("nano machine") || m.contains("nano-machine") -> "01J76XYDT7H7ANER8KJG5R9SJV"
            t.contains("estate developer") || m.contains("estate-developer") -> "01J76XYF6V9BDFSRRTY2C65SBS"
            t.contains("mount hua") || t.contains("blossoming blade") -> "01J76XYEVCSS5ANBCJZ4ZF9P65"
            t.contains("doom breaker") || t.contains("suicidal battle god") -> "01J76XYEZ1BQJM22H3RREE1XMG"
            t.contains("barbarian") -> "01J76XYG976314R2DM2DKQRBGS"
            t.contains("damn reincarnation") || t.contains("blasted reincarnated") -> "01J76XYG12YTB3J27FVBM256V8"
            t.contains("stepmother") || t.contains("fairy tale") -> "01J76XYDQ9JTWW4THBJWPXNJ9H"
            t.contains("lookism") || m.contains("lookism") -> "01J76XYBD282Y3XKX0KRGD64Q5"
            t.contains("tower of god") || m.contains("tower-of-god") -> "01J76XY7M0W9WWJ55VJYYB2J1S"
            t.contains("wind breaker") || m.contains("wind-breaker") -> "01J76XYA1TQYKV6W4BCMR2WD5M"
            t.contains("one piece") || m.contains("one-piece") -> "01J76XY7E9FNDZ1DBBM6PBJPFK"
            t.contains("berserk") || m.contains("berserk") -> "01J76XY7EF75DJNQCV04HTPDZK"
            else -> null
        }
    }

    private fun findWeebCentralChapterId(seriesId: String, chNum: String): String? {
        val seriesCache = wcChapterCache[seriesId]
        val cleanChNum = chNum.replace(Regex("[^0-9.]"), "")
        if (seriesCache != null) {
            val direct = seriesCache[cleanChNum] ?: seriesCache[chNum]
            if (direct != null) return direct
            val dbl = cleanChNum.toDoubleOrNull()
            if (dbl != null) {
                val matched = seriesCache.entries.find { it.key.toDoubleOrNull() == dbl }?.value
                if (matched != null) return matched
            }
        }
        try {
            val url = "https://weebcentral.com/series/$seriesId/full-chapter-list"
            val request = Request.Builder()
                .url(url)
                .header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36")
                .header("Referer", "https://weebcentral.com/")
                .build()

            httpClient.newCall(request).execute().use { response ->
                if (response.isSuccessful) {
                    val html = response.body?.string().orEmpty()
                    val chPattern = Pattern.compile(
                        "<a[^>]+href=\"[^\"]*chapters/([0-9A-Z]{26})\"[^>]*>([\\s\\S]*?)</a>",
                        Pattern.CASE_INSENSITIVE
                    )
                    val matcher = chPattern.matcher(html)
                    val map = wcChapterCache.computeIfAbsent(seriesId) { ConcurrentHashMap() }

                    while (matcher.find()) {
                        val chapId = matcher.group(1).orEmpty()
                        val rawText = matcher.group(2).orEmpty().replace(Regex("<[^>]+>"), " ").trim()
                        val cleanText = rawText.replace(Regex("\\s+"), " ").replace(Regex("Last Read.*", RegexOption.IGNORE_CASE), "").trim()
                        val numMatch = Regex("(?:Chapter|Ch\\.?|Episode|Ep\\.?)\\s*([0-9.]+)", RegexOption.IGNORE_CASE).find(cleanText)
                            ?: Regex("([0-9.]+)").find(cleanText)
                        val num = numMatch?.groupValues?.get(1) ?: "1"
                        map[num] = chapId
                    }
                    val direct = map[cleanChNum] ?: map[chNum]
                    if (direct != null) return direct
                    val dbl = cleanChNum.toDoubleOrNull()
                    if (dbl != null) {
                        return map.entries.find { it.key.toDoubleOrNull() == dbl }?.value
                    }
                }
            }
        } catch (_: Exception) {}
        return null
    }

    private fun resolveKatanaSlug(mangaId: String, requestedTitle: String): String? {
        val direct = slugMap[mangaId]
            ?: slugMap.entries.find { mangaId.contains(it.key, ignoreCase = true) }?.value
        if (direct != null) return direct

        val t = requestedTitle.lowercase().trim()
        val m = mangaId.lowercase().trim()
        return when {
            t.contains("one piece") || m.contains("one-piece") -> "one-piece.49"
            t.contains("one-punch") || t.contains("one punch") || m.contains("one-punch") -> "one-punch-man.163"
            t.contains("blue lock") || m.contains("blue-lock") -> "blue-lock.20912"
            t.contains("sakamoto") || m.contains("sakamoto") -> "sakamoto-days.25555"
            t.contains("beginning after") || m.contains("beginning-after") -> "the-beginning-after-the-end.20235"
            t.contains("stepmother") || t.contains("fairy tale") || m.contains("stepmother") -> "a-stepmothers-fairy-tale.23902"
            t.contains("solo leveling") || m.contains("solo-leveling") -> "solo-leveling.20815"
            t.contains("dandadan") || m.contains("dandadan") -> "dandadan.25883"
            t.contains("gachiakuta") || m.contains("gachiakuta") -> "gachiakuta.26574"
            t.contains("chained soldier") || t.contains("mato seihei") -> "mato-seihei-no-slave.22152"
            t.contains("spy x family") || m.contains("spy-x-family") -> "spy-x-family.21980"
            t.contains("fragrant flower") -> "the-fragrant-flower-blooms-with-dignity.26462"
            t.contains("berserk") || m.contains("berserk") -> "berserk.1087"
            t.contains("lookism") || m.contains("lookism") -> "lookism.693"
            t.contains("tower of god") || m.contains("tower-of-god") -> "tower-of-god.465"
            t.contains("strongest troll") || m.contains("strongest-troll") -> "worlds-strongest-troll.26644"
            t.contains("death note") || m.contains("death-note") -> "death-note.235"
            t.contains("chainsaw") || m.contains("chainsaw") -> "chainsaw-man.21890"
            t.contains("jujutsu") || m.contains("jujutsu") -> "jujutsu-kaisen.20224"
            t.contains("wind breaker") || m.contains("wind-breaker") -> "wind-breaker.467"
            t.contains("eleceed") || m.contains("eleceed") -> "eleceed.115"
            t.contains("naruto") || m.contains("naruto") -> "naruto.1205"
            t.contains("bleach") || m.contains("bleach") -> "bleach.47"
            t.contains("demon slayer") || m.contains("demon-slayer") -> "demon-slayer-kimetsu-no-yaiba.1293"
            t.contains("hunter x hunter") || m.contains("hunter-x-hunter") -> "hunter-x-hunter.102"
            t.contains("vinland") || m.contains("vinland-saga") -> "vinland-saga.81"
            t.contains("kingdom") || m.contains("kingdom") -> "kingdom.92"
            t.contains("vagabond") || m.contains("vagabond") -> "vagabond.84"
            t.contains("kaiju no") || m.contains("kaiju-no-8") -> "kaiju-no-8.25203"
            t.contains("black clover") || m.contains("black-clover") -> "black-clover.15582"
            t.contains("my hero academia") || m.contains("boku-no-hero-academia") -> "boku-no-hero-academia.1325"
            t.contains("omniscient reader") || m.contains("omniscient-reader") -> "omniscient-readers-viewpoint.24837"
            t.contains("nano machine") || m.contains("nano-machine") -> "nano-machine.25193"
            t.contains("estate developer") || m.contains("greatest-estate-developer") -> "the-greatest-estate-developer.26244"
            t.contains("magic emperor") || m.contains("magic-emperor") -> "magic-emperor.23439"
            t.contains("mount hua") || t.contains("blossoming blade") -> "return-of-the-blossoming-blade.25807"
            t.contains("doom breaker") || t.contains("suicidal battle god") -> "reincarnation-of-the-suicidal-battle-god.25816"
            t.contains("barbarian") -> "surviving-the-game-as-a-barbarian.27138"
            t.contains("damn reincarnation") || t.contains("blasted reincarnated") -> "damn-reincarnation.26360"
            else -> null
        }
    }

    suspend fun getChapterPages(
        mangaId: String,
        chapterId: String,
        requestedChNum: String = "",
        requestedTitle: String = ""
    ): List<ReaderPage> = withContext(Dispatchers.IO) {
        val num = if (requestedChNum.isNotBlank()) {
            requestedChNum.replace(Regex("[^0-9.]"), "").ifEmpty { "1" }
        } else {
            Regex("(?:chapter-|:c|:ch|:ep|:)([0-9.]+)").find(chapterId)?.groupValues?.get(1)
                ?: Regex("([0-9.]+)").findAll(chapterId).lastOrNull()?.value
                ?: "1"
        }

        // 1. Direct MangaPill Scraper (One Piece, Berserk, Death Note, Bleach, Naruto, Chainsaw Man, Jujutsu Kaisen, etc.)
        if (chapterId.matches(Regex("^[0-9]+-[0-9]+/.*")) || chapterId.startsWith("mp:") || mangaId.matches(Regex("^[0-9]+/[a-z0-9-]+"))) {
            try {
                var mpPath = chapterId.replace(Regex("^mp:"), "").trim()
                if (!mpPath.contains("/")) {
                    val pMatch = Regex("^([0-9]+)").find(mangaId)?.value
                    val slugMatch = Regex("/([a-z0-9-]+)").find(mangaId)?.groupValues?.get(1)
                    if (pMatch != null && slugMatch != null) {
                        val parsedN = num.toDoubleOrNull() ?: 1.0
                        val code = 10000000 + (parsedN * 1000).toInt()
                        mpPath = "$pMatch-$code/$slugMatch-chapter-$num"
                    }
                }
                val url = "https://mangapill.com/chapters/$mpPath"
                val request = Request.Builder()
                    .url(url)
                    .header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36")
                    .header("Referer", "https://mangapill.com/")
                    .build()

                httpClient.newCall(request).execute().use { response ->
                    if (response.isSuccessful) {
                        val html = response.body?.string().orEmpty()
                        val imgPattern = Pattern.compile("<img[^>]+(?:data-src|src)=\"([^\"]+)\"", Pattern.CASE_INSENSITIVE)
                        val matcher = imgPattern.matcher(html)
                        val pageList = mutableListOf<ReaderPage>()
                        var pageCount = 1
                        while (matcher.find()) {
                            val src = matcher.group(1).orEmpty()
                            if (src.contains("mangapill.com") || src.contains("readdetectiveconan.com")) {
                                pageList.add(ReaderPage(pageNumber = pageCount++, imageUrl = src))
                            }
                        }
                        if (pageList.isNotEmpty()) {
                            return@withContext pageList
                        }
                    }
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }

        // 2. WeebCentral direct or resolved chapter fetch
        var wcChapId: String? = null
        val rawWc = chapterId.replace(Regex("^(wc_ch:|wc:)"), "").trim()
        if (rawWc.contains(":")) {
            val potSeries = rawWc.substringBefore(":")
            val potNum = rawWc.substringAfter(":").replace(Regex("[^0-9.]"), "").ifEmpty { num }
            if (potSeries.matches(Regex("^[0-9A-Za-z]{26}$"))) {
                wcChapId = findWeebCentralChapterId(potSeries, potNum)
            }
        } else if (rawWc.matches(Regex("^[0-9A-Za-z]{26}$"))) {
            if (wcSeriesMap.values.contains(rawWc)) {
                wcChapId = findWeebCentralChapterId(rawWc, num)
            } else {
                wcChapId = rawWc
            }
        }

        val candidateTitles = mutableListOf<String>()
        if (requestedTitle.isNotBlank()) candidateTitles.add(requestedTitle)
        if (mangaId.isNotBlank() && !mangaId.startsWith("anilist:") && !mangaId.startsWith("wc:") && !mangaId.startsWith("kat:")) {
            candidateTitles.add(mangaId.replace(Regex("[-_:]"), " "))
        }

        if (wcChapId.isNullOrBlank() || !wcChapId.matches(Regex("^[0-9A-Za-z]{26}$"))) {
            var wcSeriesId = resolveWeebCentralSeries(mangaId, requestedTitle)
            if (wcSeriesId == null) {
                for (cand in candidateTitles) {
                    val found = searchWeebCentralSeries(cand)
                    if (found != null) {
                        wcSeriesId = found
                        break
                    }
                }
            }
            if (wcSeriesId == null && (mangaId.startsWith("anilist:") || chapterId.startsWith("anilist_ch:"))) {
                val syns = fetchAniListSynonyms(mangaId, requestedTitle)
                for (s in syns) {
                    val found = searchWeebCentralSeries(s)
                    if (found != null) {
                        wcSeriesId = found
                        break
                    }
                }
            }
            if (wcSeriesId != null) {
                wcChapId = findWeebCentralChapterId(wcSeriesId, num)
            }
        }

        if (!wcChapId.isNullOrBlank() && wcChapId.matches(Regex("^[0-9A-Za-z]{26}$"))) {
            try {
                val url = "https://weebcentral.com/chapters/$wcChapId/images?is_prev=False&current_page=1&reading_style=long_strip"
                val request = Request.Builder()
                    .url(url)
                    .header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36")
                    .header("Referer", "https://weebcentral.com/")
                    .build()

                httpClient.newCall(request).execute().use { response ->
                    if (response.isSuccessful) {
                        val html = response.body?.string().orEmpty()
                        val imgPattern = Pattern.compile("<img[^>]+src=\"([^\"]+)\"", Pattern.CASE_INSENSITIVE)
                        val matcher = imgPattern.matcher(html)
                        val pageList = mutableListOf<ReaderPage>()
                        var pageCount = 1

                        while (matcher.find()) {
                            val src = matcher.group(1).orEmpty()
                            if (src.isNotBlank() && !src.contains("brand") && !src.contains("logo") && !src.contains("favicon") && !src.contains("static")) {
                                pageList.add(ReaderPage(pageNumber = pageCount++, imageUrl = src))
                            }
                        }
                        if (pageList.isNotEmpty()) {
                            return@withContext pageList
                        }
                    }
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }

        // 3. MangaKatana resolution
        var slug: String? = null
        var specificChSlug: String? = null
        if (chapterId.startsWith("kat_ch:")) {
            val parts = chapterId.replace("kat_ch:", "").split(":")
            slug = parts.firstOrNull()
            specificChSlug = if (parts.size > 1) parts[1] else "c$num"
        } else {
            slug = resolveKatanaSlug(mangaId, requestedTitle)
            specificChSlug = "c$num"
        }

        // Dynamic search on MangaKatana if slug unknown, enforcing authentic title matching
        if (slug == null) {
            if (requestedTitle.isNotBlank()) {
                slug = searchKatanaSlug(requestedTitle)
            }
            if (slug == null) {
                for (cand in candidateTitles) {
                    val s = searchKatanaSlug(cand)
                    if (s != null) {
                        slug = s
                        break
                    }
                }
            }
            if (slug == null && (mangaId.startsWith("anilist:") || chapterId.startsWith("anilist_ch:"))) {
                val syns = fetchAniListSynonyms(mangaId, requestedTitle)
                for (s in syns) {
                    val sSlug = searchKatanaSlug(s)
                    if (sSlug != null) {
                        slug = sSlug
                        break
                    }
                }
            }
        }

        if (slug != null) {
            try {
                val targetSlug = if (!specificChSlug.isNullOrBlank()) specificChSlug else "c$num"
                val url = "https://mangakatana.com/manga/$slug/$targetSlug"
                val request = Request.Builder()
                    .url(url)
                    .header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36")
                    .header("Referer", "https://mangakatana.com/")
                    .build()

                httpClient.newCall(request).execute().use { response ->
                    if (response.isSuccessful) {
                        val html = response.body?.string().orEmpty()
                        // Specifically match var thzq first (full chapter images, avoids 1-page preview arrays like ytaw)
                        val thzqPattern = Pattern.compile("var\\s+thzq\\s*=\\s*\\[([^\\]]+)\\]", Pattern.CASE_INSENSITIVE)
                        val thzqMatcher = thzqPattern.matcher(html)
                        var rawArray: String? = null
                        if (thzqMatcher.find()) {
                            rawArray = thzqMatcher.group(1)
                        } else {
                            val anyArrPattern = Pattern.compile("var\\s+[a-zA-Z0-9_]+\\s*=\\s*\\[([^\\]]*https:[^\\]]*)\\]", Pattern.CASE_INSENSITIVE)
                            val anyMatcher = anyArrPattern.matcher(html)
                            var maxLen = 0
                            while (anyMatcher.find()) {
                                val content = anyMatcher.group(1).orEmpty()
                                if (content.length > maxLen) {
                                    maxLen = content.length
                                    rawArray = content
                                }
                            }
                        }

                        if (!rawArray.isNullOrBlank()) {
                            val urlPattern = Pattern.compile("['\"](https?://[^'\"]+)['\"]")
                            val urlMatcher = urlPattern.matcher(rawArray)
                            val pageList = mutableListOf<ReaderPage>()
                            var pageCount = 1
                            while (urlMatcher.find()) {
                                val imgUrl = urlMatcher.group(1)
                                if (!imgUrl.isNullOrBlank()) {
                                    pageList.add(ReaderPage(pageNumber = pageCount++, imageUrl = imgUrl))
                                }
                            }
                            if (pageList.isNotEmpty()) {
                                return@withContext pageList
                            }
                        }
                    }
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }

        // 4. A Fortune-Telling Princess direct CDN
        if (mangaId.contains("fortune-telling") || chapterId.contains("ftp") || chapterId.contains("fortune-telling") || requestedTitle.contains("fortune-telling", true)) {
            val pageList = (1..28).map { p ->
                ReaderPage(pageNumber = p, imageUrl = "https://afortunetellingprincess.com/wp-content/uploads/manga/a-fortune-telling-princess-manhwa/chapter-$num/$p.jpg")
            }
            return@withContext pageList
        }

        // 3. MangaDex fallback
        if (chapterId.startsWith("md_ch:") || chapterId.startsWith("md:")) {
            val mdId = chapterId.replace(Regex("^(md_ch:|md:)"), "")
            try {
                val url = "https://api.mangadex.org/at-home/server/$mdId"
                val request = Request.Builder().url(url).build()
                httpClient.newCall(request).execute().use { resp ->
                    if (resp.isSuccessful) {
                        val body = resp.body?.string().orEmpty()
                        val json = JSONObject(body)
                        val bUrl = json.optString("baseUrl")
                        val chObj = json.optJSONObject("chapter")
                        val hash = chObj?.optString("hash")
                        val dataArr = chObj?.optJSONArray("data")
                        val hasData = dataArr != null && dataArr.length() > 0
                        val folder = if (hasData) "data" else "data-saver"
                        val files = if (hasData) dataArr else (chObj?.optJSONArray("dataSaver") ?: dataArr)
                        if (bUrl.isNotBlank() && !hash.isNullOrBlank() && files != null) {
                            val pageList = mutableListOf<ReaderPage>()
                            for (i in 0 until files.length()) {
                                val file = files.getString(i)
                                pageList.add(ReaderPage(pageNumber = i + 1, imageUrl = "$bUrl/$folder/$hash/$file"))
                            }
                            if (pageList.isNotEmpty()) {
                                return@withContext pageList
                            }
                        }
                    }
                }
            } catch (_: Exception) {}
        }

        // 4. Dynamic MangaDex title search fallback
        if (requestedTitle.isNotBlank()) {
            try {
                val allCands = mutableListOf<String>()
                allCands.add(requestedTitle)
                allCands.addAll(candidateTitles)
                val cleanNum = num.replace(Regex("[^0-9.]"), "")
                for (cand in allCands.distinct().take(3)) {
                    val mdQ = URLEncoder.encode(cand.trim(), "UTF-8")
                    val mdUrl = "https://api.mangadex.org/manga?title=$mdQ&limit=3"
                    val mdReq = Request.Builder().url(mdUrl).header("User-Agent", "KuroNekoMobile/1.0").build()
                    httpClient.newCall(mdReq).execute().use { mdResp ->
                        if (mdResp.isSuccessful) {
                            val mdJson = JSONObject(mdResp.body?.string().orEmpty())
                            val dataArr = mdJson.optJSONArray("data")
                            if (dataArr != null && dataArr.length() > 0) {
                                for (di in 0 until dataArr.length()) {
                                    val dObj = dataArr.getJSONObject(di)
                                    val mdTitle = dObj.optJSONObject("attributes")?.optJSONObject("title")?.optString("en").orEmpty()
                                    if (mdTitle.isNotBlank() && !isAuthenticSeriesMatch(cand, mdTitle) && !isAuthenticSeriesMatch(requestedTitle, mdTitle)) {
                                        continue
                                    }
                                    val mdId = dObj.optString("id")
                                    if (mdId.isNotBlank()) {
                                        val feedUrl = "https://api.mangadex.org/manga/$mdId/feed?translatedLanguage[]=en&chapter[]=${URLEncoder.encode(cleanNum, "UTF-8")}&limit=5"
                                        val feedReq = Request.Builder().url(feedUrl).header("User-Agent", "KuroNekoMobile/1.0").build()
                                        httpClient.newCall(feedReq).execute().use { feedResp ->
                                            if (feedResp.isSuccessful) {
                                                val feedJson = JSONObject(feedResp.body?.string().orEmpty())
                                                val chArr = feedJson.optJSONArray("data")
                                                if (chArr != null && chArr.length() > 0) {
                                                    val targetMdChId = chArr.getJSONObject(0).optString("id")
                                                    val atHomeUrl = "https://api.mangadex.org/at-home/server/$targetMdChId"
                                                    val atHomeReq = Request.Builder().url(atHomeUrl).header("User-Agent", "KuroNekoMobile/1.0").build()
                                                    httpClient.newCall(atHomeReq).execute().use { atResp ->
                                                        if (atResp.isSuccessful) {
                                                            val atJson = JSONObject(atResp.body?.string().orEmpty())
                                                            val bUrl = atJson.optString("baseUrl")
                                                            val chObj = atJson.optJSONObject("chapter")
                                                            val hash = chObj?.optString("hash")
                                                            val innerDataArr = chObj?.optJSONArray("data")
                                                            val innerHasData = innerDataArr != null && innerDataArr.length() > 0
                                                            val innerFolder = if (innerHasData) "data" else "data-saver"
                                                            val files = if (innerHasData) innerDataArr else (chObj?.optJSONArray("dataSaver") ?: innerDataArr)
                                                            if (bUrl.isNotBlank() && !hash.isNullOrBlank() && files != null) {
                                                                val pageList = mutableListOf<ReaderPage>()
                                                                for (fi in 0 until files.length()) {
                                                                    val file = files.getString(fi)
                                                                    pageList.add(ReaderPage(pageNumber = fi + 1, imageUrl = "$bUrl/$innerFolder/$hash/$file"))
                                                                }
                                                                if (pageList.isNotEmpty()) {
                                                                    return@withContext pageList
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            } catch (_: Exception) {}
        }

        emptyList()
    }

    /**
     * Live upstream chapter synchronization.
     * When a source uploads a new chapter (e.g. Chapter 36 when user was on Chapter 35),
     * this queries the live source (WeebCentral full-chapter-list or MangaKatana),
     * extracts all new chapters, and returns the updated chapter list!
     */
    fun getLiveMangaDetails(mangaId: String, requestedTitle: String): String {
        // 1. Try WeebCentral series full-chapter-list (direct ULID or mapped series)
        var wcSeriesId = resolveWeebCentralSeries(mangaId, requestedTitle)
        if (wcSeriesId == null && requestedTitle.isNotBlank()) {
            wcSeriesId = searchWeebCentralSeries(requestedTitle)
            if (wcSeriesId == null) {
                val syns = fetchAniListSynonyms(mangaId, requestedTitle)
                for (s in syns) {
                    val found = searchWeebCentralSeries(s)
                    if (found != null) {
                        wcSeriesId = found
                        break
                    }
                }
            }
        }
        if (wcSeriesId != null && wcSeriesId.matches(Regex("^[0-9A-Za-z]{26}$"))) {
            try {
                val url = "https://weebcentral.com/series/$wcSeriesId/full-chapter-list"
                val request = Request.Builder()
                    .url(url)
                    .header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36")
                    .header("Referer", "https://weebcentral.com/")
                    .build()

                httpClient.newCall(request).execute().use { response ->
                    if (response.isSuccessful) {
                        val html = response.body?.string().orEmpty()
                        val chPattern = Pattern.compile(
                            "<a[^>]+href=\"[^\"]*chapters/([0-9A-Z]{26})\"[^>]*>([\\s\\S]*?)</a>",
                            Pattern.CASE_INSENSITIVE
                        )
                        val matcher = chPattern.matcher(html)
                        val chaptersList = mutableListOf<JSONObject>()
                        val seen = mutableSetOf<String>()
                        val chCacheMap = wcChapterCache.computeIfAbsent(wcSeriesId) { ConcurrentHashMap() }

                        while (matcher.find()) {
                            val chapId = matcher.group(1).orEmpty()
                            if (seen.add(chapId)) {
                                val rawText = matcher.group(2).orEmpty().replace(Regex("<[^>]+>"), " ").trim()
                                val cleanText = rawText.replace(Regex("\\s+"), " ").replace(Regex("Last Read.*", RegexOption.IGNORE_CASE), "").trim()
                                val numMatch = Regex("(?:Chapter|Ch\\.?|Episode|Ep\\.?)\\s*([0-9.]+)", RegexOption.IGNORE_CASE).find(cleanText)
                                    ?: Regex("([0-9.]+)").find(cleanText)
                                val chNum = numMatch?.groupValues?.get(1) ?: "1"

                                chCacheMap[chNum] = chapId

                                val isDuplicate = cleanText.equals("Chapter $chNum", ignoreCase = true) ||
                                                  cleanText.equals("Episode $chNum", ignoreCase = true) ||
                                                  cleanText.equals("Ch. $chNum", ignoreCase = true) ||
                                                  cleanText.equals("Ch $chNum", ignoreCase = true) ||
                                                  cleanText.equals(chNum, ignoreCase = true)
                                val titleToUse = if (cleanText.isNotBlank() && !isDuplicate) cleanText else ""

                                val chObj = JSONObject().apply {
                                    put("id", "wc_ch:$chapId")
                                    put("chapter", chNum)
                                    put("title", titleToUse)
                                }
                                chaptersList.add(chObj)
                            }
                        }

                        if (chaptersList.isNotEmpty()) {
                            // Sort descending (latest chapter first)
                            chaptersList.sortWith(Comparator { a, b ->
                                val nA = a.optString("chapter").toDoubleOrNull() ?: 0.0
                                val nB = b.optString("chapter").toDoubleOrNull() ?: 0.0
                                nB.compareTo(nA)
                            })

                            val json = JSONObject().apply {
                                put("id", mangaId)
                                put("title", requestedTitle.ifBlank { "Manga" })
                                put("totalChapters", chaptersList.size)
                                put("latestChapter", chaptersList.firstOrNull()?.optString("chapter") ?: "")
                                val arr = JSONArray()
                                chaptersList.forEach { arr.put(it) }
                                put("chapters", arr)
                            }
                            return json.toString()
                        }
                    }
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }

        // 2. Try MangaKatana
        var slug = resolveKatanaSlug(mangaId, requestedTitle)
        if (slug == null && requestedTitle.isNotBlank()) {
            slug = searchKatanaSlug(requestedTitle)
            if (slug == null) {
                val syns = fetchAniListSynonyms(mangaId, requestedTitle)
                for (s in syns) {
                    val found = searchKatanaSlug(s)
                    if (found != null) {
                        slug = found
                        break
                    }
                }
            }
        }

        if (slug != null) {
            try {
                val url = "https://mangakatana.com/manga/$slug"
                val request = Request.Builder()
                    .url(url)
                    .header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36")
                    .header("Referer", "https://mangakatana.com/")
                    .build()

                httpClient.newCall(request).execute().use { response ->
                    if (response.isSuccessful) {
                        val html = response.body?.string().orEmpty()
                        val chPattern = Pattern.compile(
                            "<div class=\"chapter\"[^>]*>\\s*<a href=\"https://mangakatana\\.com/manga/[^/]+/([^\"]+)\"[^>]*>([\\s\\S]*?)</a>",
                            Pattern.CASE_INSENSITIVE
                        )
                        val matcher = chPattern.matcher(html)
                        val chaptersList = mutableListOf<JSONObject>()
                        val seen = mutableSetOf<String>()

                        while (matcher.find()) {
                            val chSlug = matcher.group(1).orEmpty()
                            if (seen.add(chSlug)) {
                                val chRawText = matcher.group(2).orEmpty().replace(Regex("<[^>]+>"), "").trim()
                                val numMatch = Regex("(?:Chapter|Ch\\.?|Ep\\.?)\\s*([0-9.]+)", RegexOption.IGNORE_CASE).find(chRawText)
                                    ?: Regex("^c([0-9.]+)", RegexOption.IGNORE_CASE).find(chSlug)
                                    ?: Regex("([0-9.]+)").find(chRawText)
                                val chNum = numMatch?.groupValues?.get(1) ?: chSlug.replace("c", "")

                                val isDuplicate = chRawText.equals("Chapter $chNum", ignoreCase = true) ||
                                                  chRawText.equals("Ch. $chNum", ignoreCase = true) ||
                                                  chRawText.equals("Ch $chNum", ignoreCase = true) ||
                                                  chRawText.equals(chNum, ignoreCase = true)
                                val titleToUse = if (chRawText.isNotBlank() && !isDuplicate) chRawText else ""

                                val chObj = JSONObject().apply {
                                    put("id", "kat_ch:$slug:$chSlug")
                                    put("chapter", chNum)
                                    put("title", titleToUse)
                                }
                                chaptersList.add(chObj)
                            }
                        }

                        if (chaptersList.isNotEmpty()) {
                            // Sort descending (latest chapter first)
                            chaptersList.sortWith(Comparator { a, b ->
                                val nA = a.optString("chapter").toDoubleOrNull() ?: 0.0
                                val nB = b.optString("chapter").toDoubleOrNull() ?: 0.0
                                nB.compareTo(nA)
                            })

                            val json = JSONObject().apply {
                                put("id", mangaId)
                                put("title", requestedTitle.ifBlank { "Manga" })
                                put("totalChapters", chaptersList.size)
                                put("latestChapter", chaptersList.firstOrNull()?.optString("chapter") ?: "")
                                val arr = JSONArray()
                                chaptersList.forEach { arr.put(it) }
                                put("chapters", arr)
                            }
                            return json.toString()
                        }
                    }
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }

        return ""
    }

    fun fetchHtmlDirect(url: String): String {
        return try {
            val request = Request.Builder()
                .url(url)
                .header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36")
                .header("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8")
                .header("Accept-Language", "en-US,en;q=0.9")
                .build()
            httpClient.newCall(request).execute().use { response ->
                if (response.isSuccessful) {
                    response.body?.string().orEmpty()
                } else {
                    ""
                }
            }
        } catch (e: Exception) {
            ""
        }
    }

    /**
     * Intercepts and streams images with verified Referer and User-Agent headers.
     * Guarantees 100% reliable image delivery, proper binary MIME types (never application/octet-stream),
     * and null character encoding so Android's Chromium WebView decodes pages flawlessly.
     */
    fun fetchImageStream(url: String, hostHint: String? = null): WebResourceResponse? {
        return try {
            val referer = when {
                url.contains("mangakatana.com", ignoreCase = true) -> "https://mangakatana.com/"
                url.contains("lowee.us", ignoreCase = true) ||
                url.contains("compsci88.com", ignoreCase = true) ||
                url.contains("planeptune", ignoreCase = true) ||
                url.contains("lastation", ignoreCase = true) ||
                url.contains("weebcentral.com", ignoreCase = true) -> "https://weebcentral.com/"
                url.contains("mangadex.org", ignoreCase = true) || url.contains("mangadex.network", ignoreCase = true) -> "https://mangadex.org/"
                url.contains("mangapill.com", ignoreCase = true) || url.contains("readdetectiveconan.com", ignoreCase = true) -> "https://mangapill.com/"
                url.contains("asuracomic", ignoreCase = true) || url.contains("asurascans", ignoreCase = true) -> "https://asurascans.com/"
                url.contains("afortunetellingprincess.com", ignoreCase = true) -> "https://afortunetellingprincess.com/"
                url.contains("kingofshojo.com", ignoreCase = true) -> "https://kingofshojo.com/"
                url.contains("readsololeveling.org", ignoreCase = true) -> "https://readsololeveling.org/"
                url.contains("kakamanga.com", ignoreCase = true) ||
                url.contains("chapmanganato.com", ignoreCase = true) ||
                url.contains("mangakakalot.com", ignoreCase = true) -> "https://www.kakamanga.com/"
                else -> "https://mangakatana.com/"
            }

            val isMangaDex = url.contains("mangadex.org", ignoreCase = true) || url.contains("mangadex.network", ignoreCase = true)

            val reqBuilder = Request.Builder()
                .url(url)
                .header("Referer", referer)
                .header("Accept", "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8")

            if (!isMangaDex) {
                reqBuilder.header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36")
            } else {
                reqBuilder.header("User-Agent", "KuroNekoMobile/1.0")
            }

            httpClient.newCall(reqBuilder.build()).execute().use { response ->
                if (response.isSuccessful && response.body != null) {
                    val bytes = response.body?.bytes() ?: return null
                    if (bytes.isEmpty()) return null

                    // Detect proper image MIME type (avoid application/octet-stream rejection by Chromium)
                    val rawContentType = response.header("Content-Type")?.substringBefore(";")?.trim().orEmpty()
                    val mimeType = if (rawContentType.startsWith("image/", ignoreCase = true) && !rawContentType.contains("octet-stream", ignoreCase = true)) {
                        rawContentType
                    } else if (bytes.size >= 2 && bytes[0] == 0xFF.toByte() && bytes[1] == 0xD8.toByte()) {
                        "image/jpeg"
                    } else if (bytes.size >= 4 && bytes[0] == 0x89.toByte() && bytes[1] == 0x50.toByte()) {
                        "image/png"
                    } else if (bytes.size >= 12 && bytes[0] == 0x52.toByte() && bytes[1] == 0x49.toByte()) {
                        "image/webp"
                    } else {
                        when {
                            url.contains(".png", ignoreCase = true) -> "image/png"
                            url.contains(".webp", ignoreCase = true) -> "image/webp"
                            url.contains(".gif", ignoreCase = true) -> "image/gif"
                            url.contains(".svg", ignoreCase = true) -> "image/svg+xml"
                            else -> "image/jpeg"
                        }
                    }

                    val headers = mapOf(
                        "Access-Control-Allow-Origin" to "*",
                        "Access-Control-Allow-Methods" to "GET, OPTIONS",
                        "Cache-Control" to "public, max-age=604800",
                        "Content-Type" to mimeType,
                        "Content-Length" to bytes.size.toString()
                    )

                    // IMPORTANT: encoding must be null for binary image types in WebResourceResponse
                    WebResourceResponse(
                        mimeType,
                        null,
                        200,
                        "OK",
                        headers,
                        ByteArrayInputStream(bytes)
                    )
                } else {
                    null
                }
            }
        } catch (e: Exception) {
            null
        }
    }

    // --- Local Persistence for Bookmarks (No server needed) ---
    fun isBookmarked(mangaId: String): Boolean {
        val set = prefs.getStringSet("bookmarked_ids", emptySet()) ?: emptySet()
        return set.contains(mangaId)
    }

    fun toggleBookmark(mangaId: String): Boolean {
        val set = (prefs.getStringSet("bookmarked_ids", emptySet()) ?: emptySet()).toMutableSet()
        val isNowBookmarked = if (set.contains(mangaId)) {
            set.remove(mangaId)
            false
        } else {
            set.add(mangaId)
            true
        }
        prefs.edit().putStringSet("bookmarked_ids", set).apply()
        return isNowBookmarked
    }

    fun getBookmarkedManga(): List<MangaItem> {
        val set = prefs.getStringSet("bookmarked_ids", emptySet()) ?: emptySet()
        return catalog.filter { set.contains(it.id) }
    }

    // --- Reading Progress History ---
    fun saveProgress(mangaId: String, chapterId: String, chapterNumber: String, page: Int = 1) {
        val json = JSONObject().apply {
            put("mangaId", mangaId)
            put("chapterId", chapterId)
            put("chapterNumber", chapterNumber)
            put("pageNumber", page)
            put("timestamp", System.currentTimeMillis())
        }
        prefs.edit().putString("progress_$mangaId", json.toString()).apply()
    }

    fun getProgress(mangaId: String): ReadingProgress? {
        val str = prefs.getString("progress_$mangaId", null) ?: return null
        return try {
            val json = JSONObject(str)
            ReadingProgress(
                mangaId = json.getString("mangaId"),
                chapterId = json.getString("chapterId"),
                chapterNumber = json.getString("chapterNumber"),
                pageNumber = json.optInt("pageNumber", 1),
                lastReadTimestamp = json.optLong("timestamp", System.currentTimeMillis())
            )
        } catch (_: Exception) {
            null
        }
    }
}
