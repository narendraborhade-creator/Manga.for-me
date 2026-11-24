package com.example.kuroneko

import androidx.compose.runtime.Composable
import androidx.compose.ui.platform.LocalContext
import androidx.navigation3.runtime.entryProvider
import androidx.navigation3.runtime.rememberNavBackStack
import androidx.navigation3.ui.NavDisplay
import com.example.kuroneko.data.MangaRepository
import com.example.kuroneko.ui.screens.HomeScreen
import com.example.kuroneko.ui.screens.LibraryScreen
import com.example.kuroneko.ui.screens.MangaDetailScreen
import com.example.kuroneko.ui.screens.ReaderScreen

@Composable
fun MainNavigation() {
    val context = LocalContext.current
    val repository = MangaRepository(context)
    val backStack = rememberNavBackStack(HomeNav)

    NavDisplay(
        backStack = backStack,
        onBack = { backStack.removeLastOrNull() },
        entryProvider = entryProvider {
            entry<HomeNav> {
                HomeScreen(
                    repository = repository,
                    onMangaClick = { mangaId -> backStack.add(MangaDetailNav(mangaId)) },
                    onLibraryClick = { backStack.add(LibraryNav) }
                )
            }
            entry<MangaDetailNav> { nav ->
                MangaDetailScreen(
                    mangaId = nav.mangaId,
                    repository = repository,
                    onBack = { backStack.removeLastOrNull() },
                    onChapterClick = { chapterId, chapterNumber ->
                        backStack.add(ReaderNav(nav.mangaId, chapterId, chapterNumber))
                    }
                )
            }
            entry<ReaderNav> { nav ->
                ReaderScreen(
                    mangaId = nav.mangaId,
                    chapterId = nav.chapterId,
                    chapterNumber = nav.chapterNumber,
                    repository = repository,
                    onBack = { backStack.removeLastOrNull() }
                )
            }
            entry<LibraryNav> {
                LibraryScreen(
                    repository = repository,
                    onBack = { backStack.removeLastOrNull() },
                    onMangaClick = { mangaId -> backStack.add(MangaDetailNav(mangaId)) }
                )
            }
        }
    )
}
