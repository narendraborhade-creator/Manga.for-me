package com.example.kuroneko

import android.annotation.SuppressLint
import android.content.Intent
import android.graphics.Color
import android.net.Uri
import android.os.Bundle
import android.view.View
import android.view.ViewGroup
import android.webkit.*
import android.widget.FrameLayout
import android.widget.ProgressBar
import androidx.activity.ComponentActivity
import androidx.activity.OnBackPressedCallback
import androidx.core.view.WindowCompat
import com.example.kuroneko.data.MangaRepository

class MainActivity : ComponentActivity() {

    private lateinit var webView: WebView
    private lateinit var progressBar: ProgressBar
    private lateinit var repository: MangaRepository

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Set status bar & navigation bar to transparent/dark matching KuroNeko theme #080A11
        WindowCompat.setDecorFitsSystemWindows(window, false)
        window.statusBarColor = Color.parseColor("#080A11")
        window.navigationBarColor = Color.parseColor("#080A11")

        repository = MangaRepository(this)

        val rootLayout = FrameLayout(this).apply {
            layoutParams = ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
            )
            setBackgroundColor(Color.parseColor("#080A11"))
        }

        webView = WebView(this).apply {
            layoutParams = ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
            )
            setBackgroundColor(Color.parseColor("#080A11"))
            isVerticalScrollBarEnabled = false
            isHorizontalScrollBarEnabled = false
        }

        progressBar = ProgressBar(this, null, android.R.attr.progressBarStyleHorizontal).apply {
            layoutParams = FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                8
            )
            max = 100
            progressDrawable = getDrawable(android.R.drawable.progress_horizontal)
        }

        rootLayout.addView(webView)
        rootLayout.addView(progressBar)
        setContentView(rootLayout)

        configureWebView()

        // Handle modern Android Back button: navigate inside web history first!
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (webView.canGoBack()) {
                    webView.goBack()
                } else {
                    isEnabled = false
                    onBackPressedDispatcher.onBackPressed()
                }
            }
        })

        // Load the local bundled web app with full offline capabilities
        val localAssetUrl = "file:///android_asset/www/index.html"
        webView.loadUrl(localAssetUrl)
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun configureWebView() {
        val settings = webView.settings
        settings.javaScriptEnabled = true
        settings.domStorageEnabled = true
        settings.databaseEnabled = true
        settings.allowFileAccess = true
        settings.allowContentAccess = true
        settings.allowFileAccessFromFileURLs = false
        settings.allowUniversalAccessFromFileURLs = false
        settings.cacheMode = WebSettings.LOAD_DEFAULT
        settings.mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
        settings.mediaPlaybackRequiresUserGesture = false
        settings.useWideViewPort = true
        settings.loadWithOverviewMode = true
        settings.builtInZoomControls = true
        settings.displayZoomControls = false

        // Custom User Agent identifying KuroNeko Android Native Client
        val defaultUserAgent = settings.userAgentString
        settings.userAgentString = "$defaultUserAgent KuroNekoAndroid/1.0"

        // Inject Native Android Bridge
        webView.addJavascriptInterface(AndroidBridge(this, repository), "AndroidBridge")

        // Handle file / APK downloads triggered inside WebView
        webView.setDownloadListener { url, userAgent, contentDisposition, mimetype, _ ->
            if (!url.isNullOrBlank()) {
                AndroidBridge.enqueueDownload(
                    context = this@MainActivity,
                    url = url,
                    mimeTypeHint = mimetype,
                    contentDisposition = contentDisposition,
                    userAgent = userAgent
                )
            }
        }

        webView.webChromeClient = object : WebChromeClient() {
            override fun onProgressChanged(view: WebView?, newProgress: Int) {
                if (newProgress < 100) {
                    progressBar.visibility = View.VISIBLE
                    progressBar.progress = newProgress
                } else {
                    progressBar.visibility = View.GONE
                }
            }
        }

        webView.webViewClient = object : WebViewClient() {
            private val interceptedCdnHosts = listOf(
                "mangakatana.com",
                "lowee.us",
                "compsci88.com",
                "planeptune",
                "lastation",
                "weebcentral.com",
                "mangadex.org",
                "mangadex.network",
                "mangapill.com",
                "readdetectiveconan.com",
                "asuracomic",
                "asurascans",
                "afortunetellingprincess.com",
                "kingofshojo.com",
                "readsololeveling.org",
                "manga18fx.com",
                "kakamanga.com",
                "chapmanganato.com",
                "mangakakalot.com",
                "nhentai",
                "toonily",
                "hiperdex",
                "manhwa18",
                "doujindesu",
                "e-hentai",
                "ehgt.org",
                "hath.network",
                "imgur",
                "2xstorage",
                "flamecomics",
                "thunderscans",
                "vortexscans",
                "webtoons.com",
                "pstatic.net"
            )

            private fun extractProxyTarget(urlStr: String, uri: Uri): String? {
                var target = uri.getQueryParameter("url")
                if (target.isNullOrBlank()) {
                    val idx = urlStr.indexOf("url=")
                    if (idx != -1) {
                        val raw = urlStr.substring(idx + 4).substringBefore("&_reload=").substringBefore("&_retry=")
                        target = Uri.decode(raw)
                    }
                }
                val trimmed = target?.trim().orEmpty()
                if (trimmed.isBlank()) return null
                val normalized = if (trimmed.startsWith("//")) "https:$trimmed" else trimmed
                return if (normalized.startsWith("http://", ignoreCase = true) ||
                    normalized.startsWith("https://", ignoreCase = true)
                ) {
                    normalized
                } else {
                    null
                }
            }

            override fun shouldInterceptRequest(view: WebView?, request: WebResourceRequest?): WebResourceResponse? {
                val uri = request?.url ?: return null
                val urlStr = uri.toString()

                // Intercept /api/image-proxy?url=... and images.weserv.nl/?url=...
                if (urlStr.contains("/api/image-proxy") ||
                    uri.path?.contains("image-proxy") == true ||
                    urlStr.contains("weserv.nl")
                ) {
                    val target = extractProxyTarget(urlStr, uri)
                    if (target != null) {
                        val resp = repository.fetchImageStream(target)
                        if (resp != null) return resp
                    }
                }

                // Intercept direct manga & extension CDN image domains to supply required Referer and User-Agent
                val host = uri.host?.lowercase().orEmpty()
                if (host.isNotBlank() &&
                    !host.startsWith("api.") &&
                    interceptedCdnHosts.any { host == it || host.endsWith(".$it") || host.contains(it) }
                ) {
                    val resp = repository.fetchImageStream(urlStr, host)
                    if (resp != null) return resp
                }

                return super.shouldInterceptRequest(view, request)
            }

            override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
                val uri = request?.url ?: return false
                val scheme = uri.scheme?.lowercase().orEmpty()
                val host = uri.host?.lowercase().orEmpty()
                val cleanPath = uri.path?.lowercase().orEmpty()

                // Keep bundled app assets, exact localhost, and GitHub Pages origin inside WebView
                if (scheme == "file" && cleanPath.startsWith("/android_asset/")) {
                    return false
                }
                if ((scheme == "http" || scheme == "https") &&
                    (host == "localhost" || host == "127.0.0.1" ||
                        (scheme == "https" && host == "narendraborhade-creator.github.io"))
                ) {
                    return false
                }

                // Trigger native DownloadManager for http(s) APK / CBZ links without opening arbitrary external hosts inside privileged WebView
                if ((scheme == "http" || scheme == "https") &&
                    (cleanPath.endsWith(".apk") || cleanPath.endsWith(".cbz"))
                ) {
                    AndroidBridge.enqueueDownload(
                        context = this@MainActivity,
                        url = uri.toString(),
                        fileName = cleanPath.substringAfterLast('/')
                    )
                    return true
                }

                // Open external http(s) links (like Discord, Patreon, MangaUpdates) in device browser
                if (scheme != "http" && scheme != "https") {
                    return true
                }
                return try {
                    val intent = Intent(Intent.ACTION_VIEW, uri)
                    startActivity(intent)
                    true
                } catch (e: Exception) {
                    false
                }
            }

            override fun onReceivedError(view: WebView?, request: WebResourceRequest?, error: WebResourceError?) {
                super.onReceivedError(view, request, error)
            }
        }
    }

    override fun onDestroy() {
        (webView.parent as? ViewGroup)?.removeView(webView)
        webView.destroy()
        super.onDestroy()
    }
}
