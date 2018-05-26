// var slider = document.getElementById("slider-handle");
var audio = document.getElementById("audio");
// currPoster.style.transform = "rotate(120deg)";//此处更改有效
var currentTimer;
var posterTimer;
var musicPressIsDown = false; //进度条是否按下
var vm = new Vue({
    el: "#main",
    data: {
        "Exciting": {},
        "Exciting_Rank": {},
        "Melodious": {},
        "Melodious_Rank": {},
        "currAudioSrc": 'mp3/We Are Electric.mp3',
        "currPosterUrl": 'mp3/poster/We Are Electric.jpg',
        "currMusicName": 'We Are Electric',
        "currArtist": 'Flying Steps',
        "currDuration": '03:28',
        "currVolume": 0.5,
        "sliderType": 'volume',//or music
        "loopType": 'list',//single,random
        "currList": 'Exciting',//当前播放列表
        "randomList": []//随机列表
    },
    mounted: function () {

        this.$nextTick(function () {
            $.ajax({
                url: "get_music_data.php",
                type: "post",
                dataType: "json",
                success: function (data) {
                    vm.Exciting = data.Exciting;
                    vm.Exciting_Rank = data.Exciting_Rank;
                    vm.Melodious = data.Melodious;
                    vm.Melodious_Rank = data.Melodious_Rank;
                    // for (var key in data) {
                    //     for(var i in data[key]){
                    //         var temp_audio = new Audio();
                    //         temp_audio.src = data[key][i].url;
                    //         temp_audio.load();
                    //     }
                    // }
                }
            });
            //音量初始化
            audio.volume = 0;
            vm.muteBtnEvent();
        });
    },
    filters: {
        musicRankText: function (text, l) {
            if (text.length > l) {
                return text.substr(0, l) + '...';
            } else {
                return text;
            }
        }
    },
    methods: {
        musicListHover: function (event) {
            var ele = event.currentTarget;
            // ele.style.borderLeft = "4px solid gray";
            // ele.style.boxShadow = "4px 4px 4px gray";

        },
        musicListOut: function (event) {
            var ele = event.currentTarget;
            // ele.style.borderLeft = "1px solid #4e4e4e";
        },
        sliderChange: function (handle, maxLength, x, type) {//拖动的元素，最大值，鼠标的x值, 更改的类型（声音、播放进度
            var handleP = handle.parentNode;
            var handleS = handleP.firstChild;
            var pX = handleP.offsetLeft;
            var ppX = handleP.offsetParent.offsetLeft;
            handleS.style.width = x - pX - ppX + 'px';
            handle.style.left = x - pX - ppX - 5 + 'px';
            if (audio.pause != false && type == "music") {
                audio.currentTime = (x - pX - ppX) / maxLength * audio.duration;
            } else if (type == "volume") {
                audio.volume = vm.currVolume = ((x - pX - ppX) > maxLength) ? 1 : (x - pX - ppX) / maxLength;
                vm.changeVolumeState(vm.currVolume);
            }
            handleP.onmousemove = function (e) {
                musicPressIsDown = true;
                var nx = e.clientX;
                var v = nx - pX - ppX;
                if (v > maxLength) {
                    v = maxLength;
                } else if (v < 0) {
                    v = 0;
                }
                handle.style.left = v - 5 + 'px';
                handleS.style.width = v + 'px';
                if (type == "volume") {
                    audio.volume = vm.currVolume = v / maxLength;
                    vm.changeVolumeState(vm.currVolume);
                } else {
                    var currentT = document.getElementById("current-time");
                    currentT.innerHTML = vm.timeChange(v / maxLength * audio.duration);
                }
            }
        },
        vMdown: function (event, maxLength, type) {
            //判断是点击进度条还是进度条的圆
            var handle = event.currentTarget;
            var handleP = handle.parentNode;
            var type = this.sliderType = type || 'volume';
            musicPressIsDown = true;
            if (handle.className.indexOf("slider") >= 0 && handle.className.indexOf("slider-handle") == -1) {
                handleP = handle;
                handle = handleP.getElementsByClassName("slider-handle")[0];
            }
            var handleS = handleP.firstChild;
            // console.log(handle);
            vm.sliderChange(handle, maxLength, event.clientX, type);
        },
        vMup: function (event) {
            // var slider = document.getElementsByClassName("slider");
            // for(let sl of slider) {
            //     sl.onmousemove = null;
            // }

            $.each($('.slider'), function (k, v) {
                v.onmousemove = null;
            });
            if (this.sliderType == 'music') {
                var pace = document.getElementById("pace");
                audio.currentTime = pace.style.width.replace("px", '') / 344 * audio.duration;
                this.sliderType = 'main';
            }
            musicPressIsDown = false;
        },
        playOrpause: function (event) {
            var pBtn = document.getElementById('play-btn');
            if (audio.paused) {
                pBtn.setAttribute('class', 'play-pause m-btn');
                // pBtn.classList.remove('play-p');
                audio.play();
                $('#' + vm.currList).find('li[audio-src="' + vm.currAudioSrc + '"]').eq(0).addClass('r-first');
                // document.getElementById("duration").innerHTML = this.timeChange(audio.duration);
                var i = 0;
                var v = 0.2;
                currentTimer = setInterval(function () {
                    // 海报旋转
                    if(audio.readyState==4){
                        vm.$refs.poster.style.transform = 'rotate(' + i * 0.5 % 360 + 'deg)';
                        i++;
                    }
                    var pace = document.getElementById("pace");
                    var loaded = document.getElementById("loaded");
                    var slider = loaded.getElementsByClassName('slider-handle')[0];
                    // 如果没有按住进度条则进度条推进
                    if (!musicPressIsDown) {
                        var currentT = document.getElementById("current-time");
                        currentT.innerHTML = vm.timeChange(audio.currentTime);
                        pace.style.width = audio.currentTime / audio.duration * 344 + "px";
                        slider.style.left = audio.currentTime / audio.duration * 344 - 5 + "px";
                    }
                    //播放完毕则清空
                    if (audio.paused) {
                        pBtn.setAttribute('class', 'play-p m-btn');
                        audio.currentTime = 0;
                        pace.style.width = "0px";
                        slider.style.left = "0px";
                        clearInterval(currentTimer);
                        vm.$refs.poster.style.transform = 'rotate(0deg)';
                    }
                }, 50)
                // pBtn.style.backgroundPosition = "-250px 0";
            } else {
                pBtn.setAttribute('class', 'play-p m-btn');
                audio.pause();
                clearInterval(currentTimer);
                vm.$refs.poster.style.transform = 'rotate(0deg)';
            }
        },
        // 时间转换
        timeChange: function (num) {
            var m = Math.floor(num / 60);
            var s = Math.round(num % 60);
            if (m < 10) {
                m = "0" + m;
            }
            if (s < 10) {
                s = "0" + s;
            }
            return m + ":" + s;
        },
        //点击播放列表的音乐
        playListMusic: function (event, item) {
            var musicD = event.currentTarget;
            vm.currList = $(musicD).parent().attr('id');
            // var musicList = document.getElementsByClassName('music-list');
            // for(let list of musicList){
            //     var lis = list.getElementsByTagName('li');
            //     for(let li of lis){
            //         li.classList.remove('r-first');
            //     }
            // }
            $.each($('.music-list'), function (k, v) {
                var li = $(v).find('li');
                $.each(li, function (k2, v2) {
                    v2.classList.remove('r-first');
                })
            });
            var pace = document.getElementById("pace");
            var loaded = document.getElementById("loaded");
            var slider = loaded.getElementsByClassName('slider-handle')[0];
            pace.style.width = "0px";
            slider.style.left = "0px";
            vm.$refs.poster.style.transform = 'rotate(0deg)';
            audio.src = item.url;
            vm.currAudioSrc = item.url;
            vm.currDuration = item.time;
            this.currMusicName = item.name;
            this.currArtist = item.author;
            this.currPosterUrl = item.poster_url;
            clearInterval(currentTimer);
            this.playOrpause();
        },
        muteBtnEvent: function () {
            if (audio.volume != 0) {
                this.changeVolumeState(0);
            } else {
                this.changeVolumeState(this.currVolume);
            }
        },
        changeVolumeState: function (volume) {
            var volumeSlider = $('#slider-handle-volume');
            var pace = volumeSlider.prev();
            var maxL = volumeSlider.parent().width();
            if (volume == 0) {
                audio.volume = 0;
                var v = $('.horn').eq(0);
                v.attr('class', 'mute fl m-btn');
                volumeSlider.css({ 'left': '-5px' });
                pace.css({ 'width': '0px' });
            } else {
                var v = $('.mute').eq(0);
                v.attr('class', 'horn fl m-btn');
                audio.volume = volume;
                volumeSlider.css({ 'left': maxL * volume - 5 + 'px' });
                pace.css({ 'width': maxL * volume + 'px' });
            }
        },
        playPreBtn: function () {
            playNext('pre');
        },
        playNextBtn: function () {
            playNext('next');
        },
        playMode: function (event, mode) {
            vm.loopType = mode;
            var ele = event.currentTarget;
            $.each($('.mode-control').find('span'), function (k, v) {
                $(v).removeClass('current-mode');
            });
            $(ele).addClass('current-mode');
            var currListObj = vm.getCurrList();
            if (mode == 'random') {

                var tempArr = [];
                var lastIndex;
                vm.randomList = [];

                for (var i = 0; i < currListObj.length; i++) {
                    var random = Math.random(0, 1);
                    if (random > 0.5 && i != vm.randomList.length) { //i!=randomList.length 保证数组不会和循环模式的数组一样
                        if (lastIndex == undefined) {
                            lastIndex = i;
                            vm.randomList.push(currListObj[i]);
                        }
                        else if (lastIndex + 1 != i) {
                            vm.randomList.push(currListObj[i]);
                        } else if (lastIndex + 1 == i) {
                            tempArr.push(currListObj[i]);
                        }
                    } else {
                        tempArr.push(currListObj[i]);
                    }
                }
                vm.randomList = vm.randomList.concat(tempArr);
            }
        },
        rank_n: function (i) {
            if (i == 1) {
                return {
                    'rank-n': true,
                    'r-first': true
                };
            } else if (i == 2) {
                return {
                    'rank-n': true,
                    'r-second': true
                };
            } else if (i == 3) {
                return {
                    'rank-n': true,
                    'r-third': true
                };
            } else {
                return {
                    'rank-n': true
                }
            }
        },
        getCurrList: function () {
            var currListObj;
            currListObj = vm[vm.currList];
            return currListObj;
        }
    }
});
var layerIndex;
var lastIndex=0;
audio.onended = function (e) {
    // var currSrc = audio.src.slice(audio.src.indexOf('mp3'),audio.src.lenght);
    playNext('next');
}

audio.onprogress = function () {
    if (audio.readyState != 4) {
        if(layerIndex==undefined || layerIndex!=lastIndex+1){
            layerIndex = layer.load(1, {
                shade: [0.1, '#fff'] //0.1透明度的白色背景
            });
        }
    }else{
        layer.close(layerIndex);
    }
}
audio.oncanplay = function () {
    lastIndex = layerIndex;
    layer.close(layerIndex);
    loadNewAduio = false;
}
function playNext(preOrNext) {
    var currListObj = vm.getCurrList();
    if (vm.loopType == 'list') {
        loopEvent(currListObj, preOrNext);
    } else if (vm.loopType == 'random') {
        loopEvent(vm.randomList, preOrNext);
    }
    audio.pause();
    audio.currentTime = 0;
    clearInterval(currentTimer);
    vm.playOrpause();
}
function loopEvent(listObj, preOrNext) {
    var listDom;
    var nextIndex;
    listDom = $('#' + vm.currList);
    $.each(listDom.find('li'), function (k, v) {
        $(v).removeClass('r-first');
    });
    for (var i = 0; i < listObj.length; i++) {
        if (listObj[i].url == vm.currAudioSrc) {
            if (preOrNext == 'next') {
                nextIndex = ((i + 1) == listObj.length) ? 0 : (i + 1);
            } else {
                nextIndex = ((i - 1) == -1) ? (listObj.length - 1) : (i - 1);
            }
            var nextObj = listObj[nextIndex];
            audio.src = vm.currAudioSrc = nextObj.url;
            vm.currArtist = nextObj.author;
            vm.currMusicName = nextObj.name;
            vm.currPosterUrl = nextObj.poster_url;
            vm.currDuration = nextObj.time;
            return;
        }
    }
}