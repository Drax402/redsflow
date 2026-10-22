<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>REDFLOW - Blood Types Digital Masterlist</title>

    <meta property="og:title" content="REDFLOW - Blood Types Digital Masterlist">
    <meta property="og:description" content="A community blood donation digital masterlist for Irosin Rural Health Unit.">
    <meta property="og:image" content="{{ asset('images/redflow-social-preview.png') }}">
    <meta property="og:type" content="website">
    <meta property="og:url" content="{{ url('/') }}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="REDFLOW - Blood Types Digital Masterlist">
    <meta name="twitter:image" content="{{ asset('images/redflow-social-preview.png') }}">
    <link rel="icon" type="image/png" href="{{ asset('images/redflow-social-preview.png') }}">

    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@600;700;800&display=swap">

    <link rel="stylesheet" href="{{ asset('css/app-legacy.css') }}?v={{ @filemtime(public_path('css/app-legacy.css')) ?: '1' }}">

    @if (file_exists(public_path('build/manifest.json')))
        @vite(['resources/css/app.css', 'resources/js/app.js'])
    @endif
</head>
<body>

    @guest
    <div id="splashScreen" class="splash-screen" aria-hidden="true">
        <div class="splash-center">
            <div class="splash-logo-wrap">
                <span class="splash-ring"></span>
                <span class="splash-ring splash-ring-2"></span>
                <svg class="splash-drop" viewBox="0 0 24 24">
                    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
                    <path fill="#ffffff" d="M13 9h-2v3H8v2h3v3h2v-3h3v-2h-3z"/>
                </svg>
            </div>
            <h1 class="splash-title"><span>RED</span>FLOW</h1>
            <p class="splash-tagline">Connecting Blood Types,<br>Sustaining the Flow of Life.</p>
            <div class="splash-bar"><span></span></div>
        </div>
        <div class="splash-footer">Community Blood Donation Digital Masterlist<br>Irosin Sorsogon</div>
    </div>
    <script>
        (function () {
            var el = document.getElementById('splashScreen');
            if (!el) return;
            setTimeout(function () { el.classList.add('splash-hide'); }, 2400);
            setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 3000);
        })();
    </script>
    @endguest

    @include('partials.auth-shell')
    @include('partials.app-shell')

    @if (auth()->check())
        <script>
            window.__REDFLOW_SESSION_USER__ = @json(auth()->user()->toFrontendArray());
        </script>
    @endif
    <script src="{{ asset('js/script-legacy.js') }}?v={{ @filemtime(public_path('js/script-legacy.js')) ?: '1' }}"></script>
    <script>
        if (window.__REDFLOW_SESSION_USER__) {
            localStorage.setItem('redflow_logged_in', 'true');
            localStorage.setItem('redflow_current_user', JSON.stringify(window.__REDFLOW_SESSION_USER__));
        }
    </script>
</body>
</html>
