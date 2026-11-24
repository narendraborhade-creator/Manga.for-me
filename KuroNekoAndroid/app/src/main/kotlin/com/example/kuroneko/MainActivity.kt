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
        settings.allowFileAccessFromFileURLs = true
        settings.allowUniversalAccessFromFileURLs = true
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
            override fun shouldInterceptRequest(view: WebView?, request: WebResourceRequest?): WebResourceResponse? {
                val uri = request?.url ?: return null
                val urlStr = uri.toString()

                // Intercept /api/image-proxy?url=...
                if (urlStr.contains("/api/image-proxy") || uri.path?.contains("image-proxy") == true) {
                    var target = uri.getQueryParameter("url")
                    if (target.isNullOrBlank()) {
                        val idx = urlStr.indexOf("url=")
                        if (idx != -1) {
                            val raw = urlStr.substring(idx + 4).substringBefore("&_reload=").substringBefore("&_retry=")
                            target = Uri.decode(raw)
                        }
                    }
                    if (!target.isNullOrBlank()) {
                        val resp = repository.fetchImageStream(target)
                        if (resp != null) return resp
                    }
                }

                // Intercept images.weserv.nl/?url=...
                if (urlStr.contains("weserv.nl")) {
                    var target = uri.getQueryParameter("url")
                    if (target.isNullOrBlank()) {
                        val idx = urlStr.indexOf("url=")
                        if (idx != -1) {
                            val raw = urlStr.substring(idx + 4).substringBefore("&_reload=").substringBefore("&_retry=")
                            target = Uri.decode(raw)
                        }
                    }
                    if (!target.isNullOrBlank()) {
                        val resp = repository.fetchImageStream(target)
                        if (resp != null) return resp
                    }
                }

                // Intercept direct manga CDN image domains to supply required Referer and User-Agent
                val host = uri.host?.lowercase().orEmpty()
                if (host.contains("mangakatana.com") || 
                    host.contains("lowee.us") ||
                    host.contains("compsci88.com") || 
                    host.contains("planeptune") || 
                    host.contains("lastation") || 
                    host.contains("weebcentral.com") ||
                    host.contains("mangadex.org") || 
                    host.contains("mangadex.network") || 
                    host.contains("mangapill.com") || 
                    host.contains("readdetectiveconan.com") || 
                    host.contains("asuracomic") || 
                    host.contains("asurascans") || 
                    host.contains("afortunetellingprincess.com") ||
                    host.contains("kingofshojo.com") ||
                    host.contains("readsololeveling.org") ||
                    host.contains("kakamanga.com") ||
                    host.contains("chapmanganato.com") ||
                    host.contains("mangakakalot.com")) {
                    val resp = repository.fetchImageStream(urlStr, host)
                    if (resp != null) return resp
                }

                return super.shouldInterceptRequest(view, request)
            }

            override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
                val url = request?.url?.toString() ?: return false
                // Keep local asset URLs, localhost, and GitHub Pages inside WebView
                if (url.startsWith("file:///android_asset/") || 
                    url.contains("narendraborhade-creator.github.io") || 
                    url.contains("localhost")) {
                    return false
                }
                // Open external links (like Discord, Patreon, MangaUpdates) in device browser
                return try {
                    val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
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
        webView.destroy()
        super.onDestroy()
    }
}
