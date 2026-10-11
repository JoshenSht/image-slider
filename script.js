
/*  RESPONSIVE IMAGE SLIDER */

class ImageSlider {
    constructor(selector) {
        this.slider = document.querySelector(selector);

        if (!this.slider) return;

        this.track = this.slider.querySelector(".slider-track");
        this.prevBtn = this.slider.querySelector(".prev");
        this.nextBtn = this.slider.querySelector(".next");
        this.dotsContainer = this.slider.querySelector(".slider-dots");
        this.counter = this.slider.querySelector(".slide-counter");

        this.originalSlides = Array.from(this.track.children);
        this.totalSlides = this.originalSlides.length;

        if (this.totalSlides === 0) return;

        this.currentIndex = 0;
        this.position = 1;
        this.isAnimating = false;
        this.autoSlide = null;
        this.isHovering = false;
        this.isFocused = false;

        this.reduceMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;

        this.init();
    }

    init() {
        this.createClones();
        this.createDots();
        this.bindEvents();

        this.updatePosition(false);
        this.updateControls();
        this.startAutoSlide();
    }
    
    // Cloning for infinite looping.
    createClones() {
        if (this.totalSlides < 2) return;

        const firstClone = this.originalSlides[0].cloneNode(true);
        const lastClone = this.originalSlides[
            this.totalSlides - 1
        ].cloneNode(true);

        firstClone.setAttribute("aria-hidden", "true");
        lastClone.setAttribute("aria-hidden", "true");

        this.track.insertBefore(
            lastClone,
            this.originalSlides[0]
        );

        this.track.appendChild(firstClone);
    }

    // Move the track horizontally.
    updatePosition(animate = true) {
        this.track.style.transition =
            animate && !this.reduceMotion
                ? "transform 0.45s ease-in-out"
                : "none";

        this.track.style.transform =
            `translateX(-${this.position * 100}%)`;
    }

    // Navigate directly to a selected image.
    goTo(index) {
        if (
            this.isAnimating ||
            index === this.currentIndex ||
            index < 0 ||
            index >= this.totalSlides
        ) {
            return;
        }

        this.currentIndex = index;
        this.position = index + 1;
        this.isAnimating = true;

        this.updatePosition();
        this.updateControls();
    }

    // Navigate to the next image.
    nextSlide() {
        if (this.isAnimating || this.totalSlides < 2) {
            return;
        }

        this.currentIndex =
            (this.currentIndex + 1) % this.totalSlides;

        this.position++;
        this.isAnimating = true;

        this.updatePosition();
        this.updateControls();
    }

    // Navigate to the previous image.
    prevSlide() {
        if (this.isAnimating || this.totalSlides < 2) {
            return;
        }

        this.currentIndex =
            (this.currentIndex - 1 + this.totalSlides)
            % this.totalSlides;

        this.position--;
        this.isAnimating = true;

        this.updatePosition();
        this.updateControls();
    }

    // Handle the invisible jump at either boundary.
    handleTransitionEnd() {
        if (this.position === this.totalSlides + 1) {
            this.position = 1;
            this.updatePosition(false);
        } else if (this.position === 0) {
            this.position = this.totalSlides;
            this.updatePosition(false);
        }

        this.isAnimating = false;
        this.updateControls();
    }

    // Create one navigation dot for each original image.
    createDots() {
        this.dotsContainer.innerHTML = "";
        this.dots = [];

        this.originalSlides.forEach((slide, index) => {
            const dot = document.createElement("button");

            dot.type = "button";
            dot.className = "dot";
            dot.setAttribute(
                "aria-label",
                `Go to image ${index + 1}`
            );

            dot.addEventListener("click", () => {
                this.goTo(index);
                this.restartAutoSlide();
            });

            this.dotsContainer.appendChild(dot);
            this.dots.push(dot);
        });
    }

    // Keep the active dot and image counter synchronized.
    updateControls() {
        this.dots.forEach((dot, index) => {
            const isActive = index === this.currentIndex;

            dot.classList.toggle("active", isActive);

            if (isActive) {
                dot.setAttribute("aria-current", "true");
            } else {
                dot.removeAttribute("aria-current");
            }
        });

        if (this.counter) {
            this.counter.textContent =
                `Image ${this.currentIndex + 1} of ${this.totalSlides}`;
        }
    }

    // Attach event listeners.
    bindEvents() {
        this.nextBtn.addEventListener("click", () => {
            this.nextSlide();
            this.restartAutoSlide();
        });

        this.prevBtn.addEventListener("click", () => {
            this.prevSlide();
            this.restartAutoSlide();
        });

        this.track.addEventListener("transitionend", (event) => {
            if (event.propertyName === "transform") {
                this.handleTransitionEnd();
            }
        });

        // Pause autoplay while the pointer is over the slider.
        this.slider.addEventListener("mouseenter", () => {
            this.isHovering = true;
            this.stopAutoSlide();
        });

        this.slider.addEventListener("mouseleave", () => {
            this.isHovering = false;
            this.startAutoSlide();
        });

        // Pause autoplay during keyboard interaction.
        this.slider.addEventListener("focusin", () => {
            this.isFocused = true;
            this.stopAutoSlide();
        });

        this.slider.addEventListener("focusout", (event) => {
            if (!this.slider.contains(event.relatedTarget)) {
                this.isFocused = false;
                this.startAutoSlide();
            }
        });

        // Recalculate the track position on window resize.
        window.addEventListener("resize", () => {
            this.updatePosition(false);
        });

        // Stop autoplay when the browser tab is hidden.
        document.addEventListener("visibilitychange", () => {
            if (document.hidden) {
                this.stopAutoSlide();
            } else {
                this.startAutoSlide();
            }
        });
    }

    // Automatically advance every three seconds.
    startAutoSlide() {
        this.stopAutoSlide();

        if (
            this.isHovering ||
            this.isFocused ||
            document.hidden ||
            this.reduceMotion ||
            this.totalSlides < 2
        ) {
            return;
        }

        this.autoSlide = setInterval(() => {
            this.nextSlide();
        }, 3000);
    }

    // Clear the autoplay timer.
    stopAutoSlide() {
        if (this.autoSlide !== null) {
            clearInterval(this.autoSlide);
            this.autoSlide = null;
        }
    }

    // Restart autoplay after manual navigation.
    restartAutoSlide() {
        this.stopAutoSlide();
        this.startAutoSlide();
    }
}


// Initialize the slider when the page is ready.
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".slider").forEach((slider) => {
        new ImageSlider(`#${slider.id || "projects"} .slider`);
    });
});
