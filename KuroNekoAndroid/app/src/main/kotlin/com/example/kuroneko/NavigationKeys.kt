package com.example.kuroneko

import androidx.navigation3.runtime.NavKey
import kotlinx.serialization.Serializable

@Serializable
data object HomeNav : NavKey

@Serializable
data class MangaDetailNav(val mangaId: String) : NavKey

@Serializable
data class ReaderNav(val mangaId: String, val chapterId: String, val chapterNumber: String) : NavKey

@Serializable
data object LibraryNav : NavKey
