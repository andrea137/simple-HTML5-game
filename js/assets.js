/* Adapted from mainline.i3s.unice.fr/mooc/SkywardBound/ */

var assetsToLoadURLs = {
/*    backgroundImage: { url: 'assets/images/background.png' }, // http://www.clipartlord.com/category/weather-clip-art/winter-clip-art/

    logo1: { url: "assets/images/SkywardWithoutBalls.png" },
    logo2: { url: "assets/images/BoundsWithoutBalls.png" },
    bell: { url: "assets/images/bells.png" },
    spriteSheetBunny: { url: 'assets/images/bunnySpriteSheet.png' },
    plop: { url: 'assets/sounds/plop.mp3', buffer: false, loop: false, volume: 1.0 },
    humbug: { url: 'assets/sounds/humbug.mp3', buffer: true, loop: true, volume: 1.0 },
    concertino: { url: 'assets/sounds/christmas_concertino.mp3', buffer: true, loop: true, volume: 1.0 },
    xmas: { url: 'assets/sounds/xmas.mp3', buffer: true, loop: true, volume: 0.6 }
*/
    plop: { url: 'http://mainline.i3s.unice.fr/mooc/plop.mp3', buffer: false, loop: false, volume: 1.0 },
    laser: { url: 'assets/sounds/laser-shot-silenced.wav', buffer: false, loop: false, volume: 0.2 },
    laserSuper: { url: 'assets/sounds/laser-element.wav', buffer: false, loop: false, volume: 0.5 },
    soundtrack: { url: 'assets/sounds/soundtrack.mp3', buffer: true, loop: true, volume: 0.7 },
    spriteRun: { url: 'assets/images/Run.png'}

};

function loadAssets(callback) {
    // here we should load the souds, the sprite sheets etc.
    // then at the end call the callback function           
    loadAssetsUsingHowlerAndNoXhr(assetsToLoadURLs, callback);
}

// You do not have to understand in details the next lines of code...
// just use them!

/* ############################
    BUFFER LOADER for loading multiple files asyncrhonously. The callback functions is called when all
    files have been loaded and decoded 
 ############################## */
function isImage(url) {
    return (url.match(/\.(jpeg|jpg|gif|png)$/) != null);
}

function isAudio(url) {
    return (url.match(/\.(mp3|ogg|wav)$/) != null);
}

function loadAssetsUsingHowlerAndNoXhr(assetsToBeLoaded, callback) {
    var assetsLoaded = {};
    var loadedAssets = 0;
    var numberOfAssetsToLoad = 0;

    // define ifLoad function
    var ifLoad = function () {
        if (++loadedAssets >= numberOfAssetsToLoad) {
            callback(assetsLoaded);
        }
        console.log("Loaded asset " + loadedAssets);
    };

    // get num of assets to load
    for (var name in assetsToBeLoaded) {
        numberOfAssetsToLoad++;
    }

    console.log("Nb assets to load: " + numberOfAssetsToLoad);

    for (name in assetsToBeLoaded) {
        var url = assetsToBeLoaded[name].url;
        console.log("Loading " + url);
        if (isImage(url)) {
            assetsLoaded[name] = new Image();

            assetsLoaded[name].onload = ifLoad;
            // will start async loading. 
            assetsLoaded[name].src = url;
        } else {
            // We assume the asset is an audio file
            console.log("loading " + name + " buffer : " + assetsToBeLoaded[name].loop);
            var error = false;
            var tmp = new Howl({
                urls: [url],
                buffer: assetsToBeLoaded[name].buffer,
                loop: assetsToBeLoaded[name].loop,
                autoplay: false,
                volume: assetsToBeLoaded[name].volume,
                onload: function () {
                    if (++loadedAssets >= numberOfAssetsToLoad) {
                        callback(assetsLoaded);
                    }
                    console.log("Loaded asset " + loadedAssets);
                },
                onloaderror: function () {
                    if (++loadedAssets >= numberOfAssetsToLoad) {
                        callback(assetsLoaded);
                    }
                    console.log("Loaded asset " + loadedAssets);
                    error = true;
                }
            }); // End of howler.js callback
            if (error) {
                assetsLoaded[name] = undefined;
            } else {
                assetsLoaded[name] = tmp;
            }
        } // if

    } // for
} // function

