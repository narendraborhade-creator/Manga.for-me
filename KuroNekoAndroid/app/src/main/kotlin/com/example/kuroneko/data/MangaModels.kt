package com.example.kuroneko.data

import kotlinx.serialization.Serializable

@Serializable
data class MangaItem(
    val id: String,
    val title: String,
    val englishTitle: String? = null,
    val coverUrl: String,
    val status: String = "Ongoing",
    val score: String = "9.5",
    val year: String = "2024",
    val author: String = "Top Artist",
    val tags: List<String> = listOf("Action", "Manga"),
    val sourceName: String = "WeebCentral",
    val totalChapters: Int = 100,
    val latestChapter: String = "100",
    val description: String = ""
)

@Serializable
data class ChapterItem(
    val id: String,
    val chapterNumber: String,
    val title: String,
    val releaseDate: String = "Recently"
)

data class MangaDetail(
    val manga: MangaItem,
    val chapters: List<ChapterItem>
)

data class ReaderPage(
    val pageNumber: Int,
    val imageUrl: String
)

data class ReadingProgress(
    val mangaId: String,
    val chapterId: String,
    val chapterNumber: String,
    val pageNumber: Int = 1,
    val lastReadTimestamp: Long = System.currentTimeMillis()
)
