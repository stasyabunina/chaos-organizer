import playSvg from '../svg/play.svg?raw';
import volumeSvg from '../svg/volume.svg?raw';
import fullscreenSvg from '../svg/fullscreen.svg?raw';
import forwardSvg from '../svg/forward.svg?raw';
import backwardSvg from '../svg/backward.svg?raw';
import config from './app/config';
import state from './app/state';
import { getCookie } from './utils/cookie';
import scrollToBottom from './utils/scrollToBottom';

export default class VideoController {
    constructor(element, name, fileLoaderRemove) {
        this.element = element;
        this.name = name;
        this.fileLoaderRemove = fileLoaderRemove;

        this.volume = 1;

        this.init()
    }

    init() {
        this.render()
    }

    render() {
        const videoWrapper = document.createElement('div');
        videoWrapper.className = 'fullscreen:border-0 fullscreen:max-w-none fullscreen:w-full';

        const videoControlsWrapper = document.createElement('div');
        videoControlsWrapper.classList.add('relative');

        const video = document.createElement('video');
        video.className = 'video w-full';
        video.src = `${config.baseUrl}/${getCookie('username')}/${this.name}`;
        video.controls = 'controls';
        this.element.append(videoWrapper);
        videoWrapper.append(video);

        const controlsInputWrapper = document.createElement('div');
        controlsInputWrapper.className = 'absolute bottom-0 flex flex-col w-full';

        const videoControls = document.createElement('div');
        videoControls.className = 'w-full h-0 px-2 flex justify-center items-center bg-neutral bg-opacity-80 transition-[height] ease-out duration-100 overflow-hidden';

        const slider = document.createElement('input');
        slider.type = 'range';
        slider.min = 0;
        video.onloadedmetadata = () => {
            slider.max = video.duration * 100;
        };
        slider.value = 0;
        slider.className = 'video-slider w-[99.9%] bg-[#e5e7eb] outline-none h-[5.5px] appearance-none cursor-pointer focus-visible:outline-none';

        const playBtn = document.createElement('button');
        playBtn.type = 'button';
        playBtn.innerHTML = playSvg;
        playBtn.querySelector('svg').setAttribute('width', '20px');
        playBtn.querySelector('svg').setAttribute('height', '20px');
        playBtn.className = 'btn btn-ghost btn-circle mr-1';

        this.playPath = playBtn.querySelectorAll('path')[0];
        this.pausePath = playBtn.querySelectorAll('path')[1];

        const volumeBtn = document.createElement('button');
        volumeBtn.type = 'button';
        volumeBtn.innerHTML = volumeSvg;
        volumeBtn.className = 'btn btn-ghost btn-circle mr-1';

        const fullscreenBtn = document.createElement('button');
        fullscreenBtn.type = 'button';
        fullscreenBtn.innerHTML = fullscreenSvg;
        fullscreenBtn.className = 'btn btn-ghost btn-circle';

        const forwardBtn = document.createElement('button');
        forwardBtn.type = 'button';
        forwardBtn.innerHTML = forwardSvg;
        forwardBtn.className = 'btn btn-ghost btn-circle mr-1';

        const backwardBtn = document.createElement('button');
        backwardBtn.type = 'button';
        backwardBtn.innerHTML = backwardSvg;
        backwardBtn.className = 'btn btn-ghost btn-circle mr-1';

        const volumeSlider = document.createElement('input');
        volumeSlider.type = 'range';
        volumeSlider.min = 0;
        volumeSlider.max = 100;
        volumeSlider.value = 100;
        volumeSlider.className = 'volume-slider mr-auto bg-[#FF79C6] outline-none h-[5.5px] appearance-none cursor-pointer focus-visible:outline-none';

        const videoWorks = !!video.canPlayType;
        if (videoWorks) {
            video.controls = false;
        }

        videoWrapper.append(videoControlsWrapper);
        videoControlsWrapper.append(controlsInputWrapper);
        controlsInputWrapper.append(slider);
        controlsInputWrapper.append(videoControls);
        videoControls.append(playBtn);
        videoControls.append(volumeBtn);
        videoControls.append(volumeSlider);
        videoControls.append(backwardBtn);
        videoControls.append(forwardBtn);
        videoControls.append(fullscreenBtn);

        this.videoWrapper = videoWrapper;
        this.video = video;
        this.slider = slider;
        this.videoControls = videoControls;
        this.playBtn = playBtn;
        this.fullscreenBtn = fullscreenBtn;
        this.volumeSlider = volumeSlider;
        this.volumeBtn = volumeBtn;
        this.forwardBtn = forwardBtn;
        this.backwardBtn = backwardBtn;

        this.fullscreenHandler();
        this.volumeHandler();
        this.videoControlsHandler();

        video.addEventListener('loadedmetadata', () => {
            this.fileLoaderRemove();
            scrollToBottom();
        });
    }

    volumeHandler() {
        const upPath = this.volumeBtn.querySelectorAll('path')[1];
        const downPath = this.volumeBtn.querySelectorAll('path')[2];

        this.volumeSlider.addEventListener('input', (event) => {
            const tempSliderValue = event.target.value;

            const progress = (tempSliderValue / this.volumeSlider.max) * 100;

            this.video.volume = tempSliderValue / 100;
            this.volume = tempSliderValue / 100;

            if (this.video.volume === 0) {
                upPath.classList.add('hidden');
                downPath.classList.add('hidden');
            } else if (this.video.volume <= 0.5) {
                upPath.classList.add('hidden');
                downPath.classList.remove('hidden');
            } else {
                upPath.classList.remove('hidden');
                downPath.classList.remove('hidden');
            }

            this.volumeSlider.style.background = `linear-gradient(to right, #FF79C6 ${progress}%, #e5e7eb ${progress}%)`;
        });

        this.volumeBtn.addEventListener('click', () => {
            if (this.video.volume !== 0) {
                this.video.volume = 0;
                this.volumeSlider.value = 0;
                this.volumeSlider.style.background = `linear-gradient(to right, #FF79C6 0%, #e5e7eb 0%)`;
                upPath.classList.add('hidden');
                downPath.classList.add('hidden');
            } else {
                this.volumeSlider.value = this.volume * 100;
                this.video.volume = this.volume;
                this.volumeSlider.style.background = `linear-gradient(to right, #FF79C6 ${this.volume * 100
                    }%, #e5e7eb ${this.volume * 100}%)`;
                upPath.classList.remove('hidden');
                downPath.classList.remove('hidden');
            }
        });
    }

    videoControlsHandler() {
        let updateVideoControls;

        this.videoWrapper.addEventListener('mouseenter', () => {
            clearTimeout(updateVideoControls);
            this.videoControls.classList.remove('h-0');
            this.videoControls.classList.add('h-[65px]');
        })

        this.videoWrapper.addEventListener('mouseleave', () => {
            updateVideoControls = setTimeout(() => {
                this.videoControls.classList.add('h-0');
                this.videoControls.classList.remove('h-[65px]')
            }, 1500);
        })

        this.slider.addEventListener('input', (event) => {
            const tempSliderValue = event.target.value;

            const progress = (tempSliderValue / this.slider.max) * 100;

            this.video.currentTime = this.slider.value / 100;

            this.slider.style.background = `linear-gradient(to right, #FF79C6 ${progress}%, #e5e7eb ${progress}%)`;
        });

        this.playBtn.addEventListener('click', () => {
            this.play();
        })

        this.video.addEventListener('ended', () => {
            this.pausePath.classList.add('hidden');
            this.playPath.classList.remove('hidden');
            clearInterval(this.updateSlider);
            this.slider.value = this.slider.max;
            this.slider.style.background = `linear-gradient(to right, #FF79C6 100%, #e5e7eb 100%)`;
        });

        this.forwardBtn.addEventListener('click', () => {
            this.video.currentTime += 5;
            this.slider.value = this.video.currentTime * 100;
            const per = this.slider.value / this.video.duration;
            this.slider.style.background = `linear-gradient(to right, #FF79C6 ${per}%, #e5e7eb ${per}%)`;
        });

        this.backwardBtn.addEventListener('click', () => {
            this.video.currentTime -= 5;
            this.slider.value = this.video.currentTime * 100;
            const per = this.slider.value / this.video.duration;
            this.slider.style.background = `linear-gradient(to right, #FF79C6 ${per}%, #e5e7eb ${per}%)`;
        });
    }

    play() {
        if (this.video.paused) {
            this.video.play();
            this.updateSlider = setInterval(() => {
                this.slider.value = this.video.currentTime * 100;
                const per = this.slider.value / this.video.duration;
                this.slider.style.background = `linear-gradient(to right, #FF79C6 ${per}%, #e5e7eb ${per}%)`;
            }, 10);
            this.pausePath.classList.remove('hidden');
            this.playPath.classList.add('hidden');
        } else {
            this.video.pause();
            clearInterval(this.updateSlider);
            this.pausePath.classList.add('hidden');
            this.playPath.classList.remove('hidden');
        }
    };

    fullscreenHandler() {
        this.fullscreenBtn.addEventListener('click', () => {
            if (
                !document.fullscreenElement &&
                !document.mozFullScreenElement &&
                !document.webkitFullscreenElement &&
                !document.msFullscreenElement
            ) {
                if (this.videoWrapper.requestFullscreen) {
                    this.videoWrapper.requestFullscreen();
                } else if (this.videoWrapper.msRequestFullscreen) {
                    this.videoWrapper.msRequestFullscreen();
                } else if (this.videoWrapper.mozRequestFullScreen) {
                    this.videoWrapper.mozRequestFullScreen();
                } else if (this.videoWrapper.webkitRequestFullscreen) {
                    this.videoWrapper.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
                }

                state.isFullscreen = true;
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                } else if (document.msExitFullscreen) {
                    document.msExitFullscreen();
                } else if (document.mozCancelFullScreen) {
                    document.mozCancelFullScreen();
                } else if (document.webkitExitFullscreen) {
                    document.webkitExitFullscreen();
                }

                state.isFullscreen = false;
            }
        });

        document.addEventListener('fullscreenchange', escapeKeyHandler);
        document.addEventListener('webkitfullscreenchange', escapeKeyHandler);
        document.addEventListener('mozfullscreenchange', escapeKeyHandler);
        document.addEventListener('MSFullscreenChange', escapeKeyHandler);

        function escapeKeyHandler() {
            if (
                !document.fullscreenElement &&
                !document.webkitIsFullScreen &&
                !document.mozFullScreen &&
                !document.msFullscreenElement
            ) {
                state.isFullscreen = false;
            }
        }

        const keyNav = (e) => {
            if (state.isFullscreen === false) {
                return;
            }
            if (e.code === 'Space') {
                e.preventDefault();
                this.play();
            } else if (e.code === 'ArrowRight') {
                this.video.currentTime += 5;
                this.slider.value = this.video.currentTime * 100;
                const per = this.slider.value / this.video.duration;
                this.slider.style.background = `linear-gradient(to right, #FF79C6 ${per}%, #e5e7eb ${per}%)`;
            } else if (e.code === 'ArrowLeft') {
                this.video.currentTime -= 5;
                this.slider.value = this.video.currentTime * 100;
                const per = this.slider.value / this.video.duration;
                this.slider.style.background = `linear-gradient(to right, #FF79C6 ${per}%, #e5e7eb ${per}%)`;
            }
        };
        window.addEventListener('keyup', keyNav);
    }
}