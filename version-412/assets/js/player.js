(function () {
    function attachPlayer(player) {
        var video = player.querySelector('video');
        var overlay = player.querySelector('[data-player-overlay]');
        var button = player.querySelector('[data-player-button]');
        var stream = player.getAttribute('data-stream');
        var prepared = false;
        var hls = null;

        function prepare() {
            if (prepared || !video || !stream) {
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                hls.loadSource(stream);
                hls.attachMedia(video);
            } else {
                video.src = stream;
            }

            prepared = true;
        }

        function play() {
            prepare();
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
            if (video) {
                video.controls = true;
                var promise = video.play();
                if (promise && promise.catch) {
                    promise.catch(function () {});
                }
            }
        }

        if (button) {
            button.addEventListener('click', play);
        }

        if (overlay) {
            overlay.addEventListener('click', play);
        }

        if (video) {
            video.addEventListener('click', function () {
                if (!prepared) {
                    play();
                }
            });
        }

        window.addEventListener('pagehide', function () {
            if (hls && hls.destroy) {
                hls.destroy();
            }
        });
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(attachPlayer);
})();
