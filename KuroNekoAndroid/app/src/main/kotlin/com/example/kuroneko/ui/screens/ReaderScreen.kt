package com.example.kuroneko.ui.screens

import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import coil.request.ImageRequest
import com.example.kuroneko.data.MangaRepository
import com.example.kuroneko.data.ReaderPage

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ReaderScreen(
    mangaId: String,
    chapterId: String,
    chapterNumber: String,
    repository: MangaRepository,
    onBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    var pages by remember { mutableStateOf<List<ReaderPage>>(emptyList()) }
    var isWebtoonMode by remember { mutableStateOf(true) }
    var showHud by remember { mutableStateOf(true) }
    var currentPageIndex by remember { mutableIntStateOf(0) }

    LaunchedEffect(mangaId, chapterId, chapterNumber) {
        pages = repository.getChapterPages(mangaId, chapterId, chapterNumber)
        repository.saveProgress(mangaId, chapterId, chapterNumber, 1)
    }

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(Color.Black)
            .clickable(
                indication = null,
                interactionSource = remember { MutableInteractionSource() }
            ) {
                showHud = !showHud
            }
    ) {
        if (pages.isEmpty()) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator(color = MaterialTheme.colorScheme.primary)
            }
        } else {
            if (isWebtoonMode) {
                // Continuous Vertical Scroll (Webtoon Mode)
                val listState = rememberLazyListState()
                LaunchedEffect(listState) {
                    snapshotFlow { listState.firstVisibleItemIndex }
                        .collect { idx ->
                            currentPageIndex = idx
                            repository.saveProgress(mangaId, chapterId, chapterNumber, idx + 1)
                        }
                }

                LazyColumn(
                    state = listState,
                    modifier = Modifier.fillMaxSize(),
                    verticalArrangement = Arrangement.spacedBy(0.dp)
                ) {
                    itemsIndexed(pages) { index, page ->
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .aspectRatio(0.72f)
                        ) {
                            AsyncImage(
                                model = ImageRequest.Builder(LocalContext.current)
                                    .data(page.imageUrl)
                                    .crossfade(true)
                                    .build(),
                                contentDescription = "Page ${index + 1}",
                                contentScale = ContentScale.FillWidth,
                                modifier = Modifier.fillMaxSize()
                            )
                        }
                    }
                }
            } else {
                // Single Page / Paged Flip Mode
                val pagerState = rememberPagerState(pageCount = { pages.size })
                LaunchedEffect(pagerState.currentPage) {
                    currentPageIndex = pagerState.currentPage
                    repository.saveProgress(mangaId, chapterId, chapterNumber, pagerState.currentPage + 1)
                }

                HorizontalPager(
                    state = pagerState,
                    modifier = Modifier.fillMaxSize()
                ) { pageIdx ->
                    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        AsyncImage(
                            model = ImageRequest.Builder(LocalContext.current)
                                .data(pages[pageIdx].imageUrl)
                                .crossfade(true)
                                .build(),
                            contentDescription = "Page ${pageIdx + 1}",
                            contentScale = ContentScale.Fit,
                            modifier = Modifier.fillMaxSize()
                        )
                    }
                }
            }
        }

        // Top HUD Overlay
        AnimatedVisibility(
            visible = showHud,
            enter = fadeIn() + slideInVertically(),
            exit = fadeOut() + slideOutVertically(),
            modifier = Modifier.align(Alignment.TopCenter)
        ) {
            Surface(
                color = Color.Black.copy(alpha = 0.85f),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .statusBarsPadding()
                        .padding(horizontal = 8.dp, vertical = 6.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        IconButton(onClick = onBack) {
                            Icon(
                                imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                                contentDescription = "Back",
                                tint = Color.White
                            )
                        }
                        Column {
                            Text(
                                text = "Chapter $chapterNumber",
                                color = Color.White,
                                fontWeight = FontWeight.Bold,
                                fontSize = 16.sp
                            )
                            Text(
                                text = if (pages.isNotEmpty()) "Page ${currentPageIndex + 1} of ${pages.size}" else "Loading...",
                                color = Color.Gray,
                                fontSize = 12.sp
                            )
                        }
                    }

                    IconButton(onClick = { isWebtoonMode = !isWebtoonMode }) {
                        Icon(
                            imageVector = if (isWebtoonMode) Icons.Default.ViewAgenda else Icons.Default.ViewCarousel,
                            contentDescription = "Toggle reading mode",
                            tint = MaterialTheme.colorScheme.primary
                        )
                    }
                }
            }
        }

        // Bottom HUD Overlay
        AnimatedVisibility(
            visible = showHud,
            enter = fadeIn() + slideInVertically(initialOffsetY = { it }),
            exit = fadeOut() + slideOutVertically(targetOffsetY = { it }),
            modifier = Modifier.align(Alignment.BottomCenter)
        ) {
            Surface(
                color = Color.Black.copy(alpha = 0.85f),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .navigationBarsPadding()
                        .padding(horizontal = 16.dp, vertical = 12.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Surface(
                        color = MaterialTheme.colorScheme.surfaceVariant,
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Text(
                            text = if (isWebtoonMode) "Webtoon Strip Mode" else "Single Page Mode",
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.SemiBold,
                            modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp)
                        )
                    }

                    Text(
                        text = "${currentPageIndex + 1} / ${pages.size}",
                        color = Color.White,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }
    }
}
