package com.example.kuroneko

import android.app.DownloadManager
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Environment
import android.os.Handler
import android.os.Looper
import android.webkit.JavascriptInterface
import android.webkit.MimeTypeMap
import android.webkit.URLUtil
import android.widget.Toast
import com.example.kuroneko.data.MangaRepository
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.runBlocking
import org.json.JSONArray
import org.json.JSONObject

class AndroidBridge(
    private val context: Context,
    private val repository: MangaRepository
) {
    @JavascriptInterface
    fun getChapterPages(mangaId: String, chapterId: String, chNum: String, title: String): String {
        return runBlocking(Dispatchers.IO) {
            try {
                val pages = repository.getChapterPages(mangaId, chapterId, chNum, title)
                val json = JSONObject()
                json.put("chapterId", chapterId)
                json.put("totalPages", pages.size)
                val jsonPages = JSONArray()
                pages.forEach { p ->
                    val pObj = JSONObject()
                    pObj.put("pageNumber", p.pageNumber)
                    pObj.put("url", p.imageUrl)
                    pObj.put("originalUrl", p.imageUrl)
                    jsonPages.put(pObj)
                }
                json.put("pages", jsonPages)
                json.toString()
            } catch (e: Exception) {
                val err = JSONObject()
                err.put("chapterId", chapterId)
                err.put("totalPages", 0)
                err.put("pages", JSONArray())
                err.put("error", e.message ?: "Unknown error")
                err.toString()
            }
        }
    }

    @JavascriptInterface
    fun getLiveMangaDetails(mangaId: String, title: String): String {
        return runBlocking(Dispatchers.IO) {
            try {
                repository.getLiveMangaDetails(mangaId, title)
            } catch (e: Exception) {
                ""
            }
        }
    }

    @JavascriptInterface
    fun fetchHtml(url: String): String {
        if (url.isBlank()) return ""
        return runBlocking(Dispatchers.IO) {
            try {
                repository.fetchHtmlDirect(url)
            } catch (e: Exception) {
                ""
            }
        }
    }

    @JavascriptInterface
    fun fetchImageBase64(imageUrl: String?, referer: String?): String {
        val targetUrl = imageUrl?.trim().orEmpty()
        if (targetUrl.isBlank()) return ""
        return runBlocking(Dispatchers.IO) {
            try {
                repository.fetchImageDataUri(targetUrl, referer.orEmpty())
            } catch (e: Exception) {
                ""
            }
        }
    }

    @JavascriptInterface
    fun downloadFile(url: String?, fileName: String?): Boolean {
        return enqueueDownload(
            context = context,
            url = url.orEmpty(),
            fileName = fileName.orEmpty()
        )
    }

    @JavascriptInterface
    fun showToast(message: String) {
        Handler(Looper.getMainLooper()).post {
            Toast.makeText(context, message, Toast.LENGTH_SHORT).show()
        }
    }

    companion object {
        fun inferMimeType(url: String, fileName: String, fallbackMimeType: String? = null): String {
            val candidate = (fileName.ifBlank { url.substringBefore("?").substringBefore("#") }).lowercase()
            return when {
                candidate.endsWith(".apk") -> "application/vnd.android.package-archive"
                candidate.endsWith(".json") -> "application/json"
                candidate.endsWith(".cbz") -> "application/vnd.comicbook+zip"
                candidate.endsWith(".cbr") -> "application/vnd.comicbook-rar"
                candidate.endsWith(".pdf") -> "application/pdf"
                candidate.endsWith(".zip") -> "application/zip"
                candidate.endsWith(".png") -> "image/png"
                candidate.endsWith(".jpg") || candidate.endsWith(".jpeg") -> "image/jpeg"
                candidate.endsWith(".webp") -> "image/webp"
                !fallbackMimeType.isNullOrBlank() &&
                    !fallbackMimeType.equals("application/octet-stream", ignoreCase = true) -> fallbackMimeType
                else -> {
                    val ext = MimeTypeMap.getFileExtensionFromUrl(candidate)
                    if (!ext.isNullOrBlank()) {
                        MimeTypeMap.getSingleton().getMimeTypeFromExtension(ext) ?: "application/octet-stream"
                    } else {
                        "application/octet-stream"
                    }
                }
            }
        }

        private fun sanitizeFileName(rawName: String): String {
            val base = rawName.substringAfterLast('/').substringAfterLast('\\')
                .replace(Regex("[\\\\/:*?\"<>|\\u0000-\\u001F]"), "_")
                .trim()
            return if (base.isBlank() || base == "." || base == "..") {
                "kuroneko_download_${System.currentTimeMillis()}"
            } else {
                base
            }
        }

        fun enqueueDownload(
            context: Context,
            url: String,
            fileName: String = "",
            mimeTypeHint: String? = null,
            contentDisposition: String? = null,
            userAgent: String? = null
        ): Boolean {
            val trimmedUrl = url.trim()
            if (trimmedUrl.isBlank()) return false

            val urlPathName = try {
                Uri.parse(trimmedUrl).lastPathSegment?.takeIf { it.contains('.') }
            } catch (_: Exception) {
                null
            }
            val preliminaryMime = inferMimeType(trimmedUrl, fileName.ifBlank { urlPathName.orEmpty() }, mimeTypeHint)
            val guessedName = when {
                fileName.isNotBlank() -> fileName
                !contentDisposition.isNullOrBlank() -> URLUtil.guessFileName(trimmedUrl, contentDisposition, preliminaryMime)
                !urlPathName.isNullOrBlank() -> urlPathName
                else -> URLUtil.guessFileName(trimmedUrl, contentDisposition, preliminaryMime)
            }
            val mimeType = inferMimeType(trimmedUrl, guessedName, preliminaryMime)
            val safeName = sanitizeFileName(guessedName)

            val isHttp = trimmedUrl.startsWith("http://", ignoreCase = true) ||
                trimmedUrl.startsWith("https://", ignoreCase = true)

            if (!isHttp) {
                return false
            }

            try {
                val dm = context.getSystemService(Context.DOWNLOAD_SERVICE) as? DownloadManager
                if (dm != null) {
                    val req = DownloadManager.Request(Uri.parse(trimmedUrl)).apply {
                        setTitle(safeName)
                        setDescription("Downloading via KuroNeko")
                        setMimeType(mimeType)
                        if (!userAgent.isNullOrBlank()) {
                            addRequestHeader("User-Agent", userAgent)
                        }
                        setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED)
                        setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, safeName)
                        setAllowedOverMetered(true)
                        setAllowedOverRoaming(true)
                    }
                    dm.enqueue(req)
                    Handler(Looper.getMainLooper()).post {
                        Toast.makeText(context, "Downloading $safeName", Toast.LENGTH_SHORT).show()
                    }
                    return true
                }
            } catch (_: Exception) {
                // Fall back to external browser below for http(s) URLs only
            }

            return try {
                val intent = Intent(Intent.ACTION_VIEW, Uri.parse(trimmedUrl)).apply {
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                }
                context.startActivity(intent)
                true
            } catch (_: Exception) {
                false
            }
        }
    }
}
