import debounce from './debounce.js'

window.onload = () => {

    class Slide {
        constructor(slide, wrapper) {
            this.slide = document.querySelector(slide);
            this.wrapper = document.querySelector(wrapper);
            this.dist = { finalPosition: 0, startX: 0, movement: 0};
            this.activeClass = 'active';
        }


        transition(active) {
            this.slide.style.transition = active ? 'transform .3s' : '';
        }
        moveSlide(distX) {
            this.dist.movePosition = distX;
            this.slide.style.transform = `translate3d(${distX}px, 0, 0)`;
        }

        updatePosition(clientX) {
            this.dist.movement = (this.dist.startX - clientX * 1.2);
            return this.dist.finalPosition - this.dist.movement;
        }


        onStart(event) {
            let moveType;
            if (event.type === 'mousedown') {
                event.preventDefault();
                this.dist.startX = event.clientX;
                moveType = 'mousemove';
            } else {
                this.dist.startX = event.changedTouches[0].clientX;
                moveType = 'touchmove'
            }
            this.wrapper.addEventListener(moveType, this.onMove);
            this.transition(false);
        }

        onMove(event) {
            const pointerPosition = (event.type === 'mousemove') ? event.clientX : event.changedTouches[0].clientX
            const finalPosition = this.updatePosition(pointerPosition);
            this.moveSlide(finalPosition);
        }

        onEnd(event){
            const moveType = (event.type === 'mouseup') ? 'mousemove' : 'touchmove';
            this.wrapper.removeEventListener(moveType, this.onMove);
            this.dist.finalPosition = this.dist.movePosition;
            this.transition(true);
            this.changeSlideOnEnd();
        }

        changeSlideOnEnd() {
        if (this.dist.movement > 120 && this.index.next !== undefined) {
            this.activeNextSlide()
        } else if (this.dist.movement < -120 && this.index.prev !== undefined) {
            this.activePrevSlide();
        } else {
            this.changeSlide(this.index.active)
        }

        }

        addSlideEvents() {
            this.wrapper.addEventListener('mousedown', this.onStart);
            this.wrapper.addEventListener('touchstart', this.onStart);
            this.wrapper.addEventListener('mouseup', this.onEnd);
            this.wrapper.addEventListener('touchend', this.onEnd);
        }



        //slides config
        slidePosition(slide) {
            const margin = (this.wrapper.offsetWidth - slide.offsetWidth) / 2;
            return -(slide.offsetLeft - margin);

        }

        slidesConfig() {
            this.slideArr = [...this.slide.children].map((el) => {
                const position = this.slidePosition(el);
                return {
                    el,
                    position
                }
            });
        }

        slidesIndexNav(index) {
            const last = this.slideArr.length -1;
            this.index = {
                prev: index === 0 ? last : index -1,
                active: index,
                next: index === last ? 0 : index + 1
            }
        }

        changeSlide(index) {
            const activeSlide = this.slideArr[index]
            this.moveSlide(activeSlide.position);
            this.slidesIndexNav(index);
            this.dist.finalPosition = activeSlide.position;
            this.changeActiveClass();
        }

        changeActiveClass() {
            this.slideArr.forEach(item => item.el.classList.remove(this.activeClass));
            this.slideArr[this.index.active].el.classList.add(this.activeClass);
        }

        activePrevSlide() {
            if (this.index.prev !== undefined) this.changeSlide(this.index.prev)
        }

        activeNextSlide() {
            if (this.index.next !== undefined) this.changeSlide(this.index.next)
        }

        onResize() {
        setTimeout(() => {
            this.slidesConfig();
            this.changeSlide(this.index.active);
        }, 1000)
        }

        addResizeEvent() {
            window.addEventListener('resize', this.onResize)
        }

        bindEvents() {
            this.onStart = this.onStart.bind(this)
            this.onMove = this.onMove.bind(this);
            this.onEnd = this.onEnd.bind(this);

            this.activePrevSlide = this.activePrevSlide.bind(this);
            this.activeNextSlide = this.activeNextSlide.bind(this);
            this.onResize = debounce(this.onResize.bind(this),50);
        }

        init() {
            this.bindEvents();
            this.transition(true);
            this.addSlideEvents();
            this.slidesConfig();
            this.addResizeEvent();
            return this;
        }
    }

    class SlideNav extends Slide {
        addArrow(prev, next) {
            this.prev = document.querySelector(prev);
            this.next = document.querySelector(next);

            this.addArrowEvent();
        }

        addArrowEvent() {
            this.prev.addEventListener("click", this.activePrevSlide);
            this.next.addEventListener("click", this.activeNextSlide);
        }
    }


    const slide = new SlideNav('.slide div','.wrapper')
    console.log(slide);
    slide.init();
    slide.changeSlide(2);
    slide.addArrow('.prev', '.next');
}

