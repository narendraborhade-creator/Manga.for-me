package com.example.kuroneko

import android.content.Context
import android.webkit.JavascriptInterface
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
        return runBlocking(Dispatchers.IO) {
            try {
                repository.fetchHtmlDirect(url)
            } catch (e: Exception) {
                ""
            }
        }
    }

    @JavascriptInterface
    fun showToast(message: String) {
        android.os.Handler(android.os.Looper.getMainLooper()).post {
            Toast.makeText(context, message, Toast.LENGTH_SHORT).show()
        }
    }
}
