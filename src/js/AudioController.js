import config from './app/config';
import playSvg from '../svg/play.svg?raw';
import { getCookie } from './utils/cookie';

export default class AudioController {
    constructor(element, name) {
        this.element = element;
        this.name = name;

        this.init()
    }

    init() {
        this.createAudio();
        this.render()
    }

    createAudio() {
        const audio = new Audio();
        audio.controls = true;
        audio.src = `${config.baseUrl}/${getCookie('username')}/${this.name}`;

        this.audio = audio;
    }

    render() {
        const playBtn = document.createElement('button');
        playBtn.type = 'button';
        playBtn.innerHTML = playSvg;
        playBtn.className = 'btn btn-ghost btn-circle w-[4rem] h-[4rem] mr-2';

        const playPath = playBtn.querySelectorAll('path')[0];
        const pausePath = playBtn.querySelectorAll('path')[1];;

        let updateSlider;
        playBtn.addEventListener('click', () => {
            if (this.audio.paused) {
                this.audio.play();
                updateSlider = setInterval(() => {
                    displayDuration(this.audio.currentTime);
                    rangeSliderWrapper.style.width =
                        (this.audio.currentTime / this.audio.duration) * 100 + '%';
                }, 10);
                pausePath.classList.remove('hidden');
                playPath.classList.add('hidden');
            } else {
                this.audio.pause();
                clearInterval(updateSlider);
                pausePath.classList.add('hidden');
                playPath.classList.remove('hidden');
            }
        });

        const audioContent = document.createElement('div');
        audioContent.className = 'w-full flex flex-col items-start justify-between';

        const audioDuration = document.createElement('span');
        audioDuration.className = 'whitespace-nowrap text-[#d1d5db]';

        const range = document.createElement('input');
        range.className = `audio-slider w-full h-full bg-[url('../img/audio.png')] bg-transparent bg-repeat bg-[length:auto_100%] bg-[0%_0%] cursor-pointer outline-none appearance-none`;
        range.type = 'range';
        range.min = 0;
        this.audio.onloadedmetadata = () => {
            range.max = this.audio.duration * 100;
        };
        range.value = 0;

        const displayDuration = (secs) => {
            audioDuration.textContent = this.convertDuration(secs);
        };

        if (this.audio.readyState > 0) {
            displayDuration(this.audio.duration);
        } else {
            this.audio.addEventListener('loadedmetadata', () => {
                displayDuration(this.audio.duration);
            });
        }

        this.audio.addEventListener('play', () => {
            if (Math.floor(this.audio.currentTime) === 0) {
                audioDuration.textContent = this.audio.duration >= 3600 ? `0:00:00` : `0:00`;
            } else {
                displayDuration(this.audio.currentTime);
            }
        });
        this.audio.addEventListener('pause', () => {
            displayDuration(this.audio.currentTime);
        });

        range.addEventListener('input', () => {
            const per = range.value / this.audio.duration;
            rangeSliderWrapper.style.width = per + '%';
            this.audio.currentTime = (per / 100) * this.audio.duration;
            displayDuration(this.audio.currentTime);
        });

        const rangeWrapper = document.createElement('div');
        rangeWrapper.className = 'w-full h-full max-h-[36px] relative mb-1';

        const rangeSliderWrapper = document.createElement('div');
        rangeSliderWrapper.className = 'h-full w-[0%] absolute top-[0px] overflow-hidden pointer-events-none';

        const rangeSlider = document.createElement('div');
        rangeSlider.className = `bg-[url('../img/audio-pink.png')] bg-transparent bg-repeat bg-[length:auto_100%] bg-[0%_0%] pointer-events-none w-[calc(100%+531px)] h-full`;

        this.element.append(playBtn);
        this.element.append(audioContent);
        audioContent.append(rangeWrapper);
        rangeWrapper.append(range);
        rangeWrapper.append(rangeSliderWrapper);
        rangeSliderWrapper.append(rangeSlider);
        audioContent.append(audioDuration);

        this.audio.addEventListener('ended', () => {
            displayDuration(this.audio.duration);
            clearInterval(updateSlider);
            range.value = range.max;
            pausePath.classList.add('hidden');
            playPath.classList.remove('hidden');
        });
    }

    convertDuration(secs) {
        const hours = Math.floor(secs / 3600);
        const minutes = Math.floor(secs / 60);
        const returnedMinutes =
            minutes < 10 && this.audio.duration >= 3600
                ? `0${minutes}`
                : `${minutes.toString().slice(-2)}`;
        const seconds = Math.floor(secs % 60);
        const returnedSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`;
        if (this.audio.duration >= 3600) {
            return `${hours}:${returnedMinutes}:${returnedSeconds}`;
        } else {
            return `${returnedMinutes}:${returnedSeconds}`;
        }
    };
}