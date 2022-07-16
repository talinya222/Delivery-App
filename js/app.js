(() => {
    "use strict";
    const modules_flsModules = {};
    function isWebp() {
        function testWebP(callback) {
            let webP = new Image;
            webP.onload = webP.onerror = function() {
                callback(2 == webP.height);
            };
            webP.src = "data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA";
        }
        testWebP((function(support) {
            let className = true === support ? "webp" : "no-webp";
            document.documentElement.classList.add(className);
        }));
    }
    let isMobile = {
        Android: function() {
            return navigator.userAgent.match(/Android/i);
        },
        BlackBerry: function() {
            return navigator.userAgent.match(/BlackBerry/i);
        },
        iOS: function() {
            return navigator.userAgent.match(/iPhone|iPad|iPod/i);
        },
        Opera: function() {
            return navigator.userAgent.match(/Opera Mini/i);
        },
        Windows: function() {
            return navigator.userAgent.match(/IEMobile/i);
        },
        any: function() {
            return isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows();
        }
    };
    function addLoadedClass() {
        window.addEventListener("load", (function() {
            setTimeout((function() {
                document.documentElement.classList.add("loaded");
            }), 0);
        }));
    }
    let bodyLockStatus = true;
    let bodyLockToggle = (delay = 500) => {
        if (document.documentElement.classList.contains("lock")) bodyUnlock(delay); else bodyLock(delay);
    };
    let bodyUnlock = (delay = 500) => {
        let body = document.querySelector("body");
        if (bodyLockStatus) {
            let lock_padding = document.querySelectorAll("[data-lp]");
            setTimeout((() => {
                for (let index = 0; index < lock_padding.length; index++) {
                    const el = lock_padding[index];
                    el.style.paddingRight = "0px";
                }
                body.style.paddingRight = "0px";
                document.documentElement.classList.remove("lock");
            }), delay);
            bodyLockStatus = false;
            setTimeout((function() {
                bodyLockStatus = true;
            }), delay);
        }
    };
    let bodyLock = (delay = 500) => {
        let body = document.querySelector("body");
        if (bodyLockStatus) {
            let lock_padding = document.querySelectorAll("[data-lp]");
            for (let index = 0; index < lock_padding.length; index++) {
                const el = lock_padding[index];
                el.style.paddingRight = window.innerWidth - document.querySelector(".wrapper").offsetWidth + "px";
            }
            body.style.paddingRight = window.innerWidth - document.querySelector(".wrapper").offsetWidth + "px";
            document.documentElement.classList.add("lock");
            bodyLockStatus = false;
            setTimeout((function() {
                bodyLockStatus = true;
            }), delay);
        }
    };
    function menuInit() {
        if (document.querySelector(".icon-menu")) document.addEventListener("click", (function(e) {
            if (bodyLockStatus && e.target.closest(".icon-menu")) {
                bodyLockToggle();
                document.documentElement.classList.toggle("menu-open");
            }
        }));
    }
    function formFieldsInit(options = {
        viewPass: false,
        autoHeight: false
    }) {
        const formFields = document.querySelectorAll("input[placeholder],textarea[placeholder]");
        if (formFields.length) formFields.forEach((formField => {
            if (!formField.hasAttribute("data-placeholder-nohide")) formField.dataset.placeholder = formField.placeholder;
        }));
        document.body.addEventListener("focusin", (function(e) {
            const targetElement = e.target;
            if ("INPUT" === targetElement.tagName || "TEXTAREA" === targetElement.tagName) {
                if (targetElement.dataset.placeholder) targetElement.placeholder = "";
                if (!targetElement.hasAttribute("data-no-focus-classes")) {
                    targetElement.classList.add("_form-focus");
                    targetElement.parentElement.classList.add("_form-focus");
                }
                formValidate.removeError(targetElement);
            }
        }));
        document.body.addEventListener("focusout", (function(e) {
            const targetElement = e.target;
            if ("INPUT" === targetElement.tagName || "TEXTAREA" === targetElement.tagName) {
                if (targetElement.dataset.placeholder) targetElement.placeholder = targetElement.dataset.placeholder;
                if (!targetElement.hasAttribute("data-no-focus-classes")) {
                    targetElement.classList.remove("_form-focus");
                    targetElement.parentElement.classList.remove("_form-focus");
                }
                if (targetElement.hasAttribute("data-validate")) formValidate.validateInput(targetElement);
            }
        }));
        if (options.viewPass) document.addEventListener("click", (function(e) {
            let targetElement = e.target;
            if (targetElement.closest('[class*="__viewpass"]')) {
                let inputType = targetElement.classList.contains("_viewpass-active") ? "password" : "text";
                targetElement.parentElement.querySelector("input").setAttribute("type", inputType);
                targetElement.classList.toggle("_viewpass-active");
            }
        }));
        if (options.autoHeight) {
            const textareas = document.querySelectorAll("textarea[data-autoheight]");
            if (textareas.length) {
                textareas.forEach((textarea => {
                    const startHeight = textarea.hasAttribute("data-autoheight-min") ? Number(textarea.dataset.autoheightMin) : Number(textarea.offsetHeight);
                    const maxHeight = textarea.hasAttribute("data-autoheight-max") ? Number(textarea.dataset.autoheightMax) : 1 / 0;
                    setHeight(textarea, Math.min(startHeight, maxHeight));
                    textarea.addEventListener("input", (() => {
                        if (textarea.scrollHeight > startHeight) {
                            textarea.style.height = `auto`;
                            setHeight(textarea, Math.min(Math.max(textarea.scrollHeight, startHeight), maxHeight));
                        }
                    }));
                }));
                function setHeight(textarea, height) {
                    textarea.style.height = `${height}px`;
                }
            }
        }
    }
    let formValidate = {
        getErrors(form) {
            let error = 0;
            let formRequiredItems = form.querySelectorAll("*[data-required]");
            if (formRequiredItems.length) formRequiredItems.forEach((formRequiredItem => {
                if ((null !== formRequiredItem.offsetParent || "SELECT" === formRequiredItem.tagName) && !formRequiredItem.disabled) error += this.validateInput(formRequiredItem);
            }));
            return error;
        },
        validateInput(formRequiredItem) {
            let error = 0;
            if ("email" === formRequiredItem.dataset.required) {
                formRequiredItem.value = formRequiredItem.value.replace(" ", "");
                if (this.emailTest(formRequiredItem)) {
                    this.addError(formRequiredItem);
                    error++;
                } else this.removeError(formRequiredItem);
            } else if ("checkbox" === formRequiredItem.type && !formRequiredItem.checked) {
                this.addError(formRequiredItem);
                error++;
            } else if (!formRequiredItem.value.trim()) {
                this.addError(formRequiredItem);
                error++;
            } else this.removeError(formRequiredItem);
            return error;
        },
        addError(formRequiredItem) {
            formRequiredItem.classList.add("_form-error");
            formRequiredItem.parentElement.classList.add("_form-error");
            let inputError = formRequiredItem.parentElement.querySelector(".form__error");
            if (inputError) formRequiredItem.parentElement.removeChild(inputError);
            if (formRequiredItem.dataset.error) formRequiredItem.parentElement.insertAdjacentHTML("beforeend", `<div class="form__error">${formRequiredItem.dataset.error}</div>`);
        },
        removeError(formRequiredItem) {
            formRequiredItem.classList.remove("_form-error");
            formRequiredItem.parentElement.classList.remove("_form-error");
            if (formRequiredItem.parentElement.querySelector(".form__error")) formRequiredItem.parentElement.removeChild(formRequiredItem.parentElement.querySelector(".form__error"));
        },
        formClean(form) {
            form.reset();
            setTimeout((() => {
                let inputs = form.querySelectorAll("input,textarea");
                for (let index = 0; index < inputs.length; index++) {
                    const el = inputs[index];
                    el.parentElement.classList.remove("_form-focus");
                    el.classList.remove("_form-focus");
                    formValidate.removeError(el);
                }
                let checkboxes = form.querySelectorAll(".checkbox__input");
                if (checkboxes.length > 0) for (let index = 0; index < checkboxes.length; index++) {
                    const checkbox = checkboxes[index];
                    checkbox.checked = false;
                }
                if (modules_flsModules.select) {
                    let selects = form.querySelectorAll(".select");
                    if (selects.length) for (let index = 0; index < selects.length; index++) {
                        const select = selects[index].querySelector("select");
                        modules_flsModules.select.selectBuild(select);
                    }
                }
            }), 0);
        },
        emailTest(formRequiredItem) {
            return !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,8})+$/.test(formRequiredItem.value);
        }
    };
    class FullPage {
        constructor(element, options) {
            let config = {
                noEventSelector: "[data-no-event]",
                сlassInit: "fp-init",
                wrapperAnimatedClass: "fp-switching",
                selectorSection: "[data-fp-section]",
                activeClass: "active-section",
                previousClass: "previous-section",
                nextClass: "next-section",
                idActiveSection: 0,
                mode: element.dataset.fpEffect ? element.dataset.fpEffect : "slider",
                bullets: element.hasAttribute("data-fp-bullets") ? true : false,
                bulletsClass: "fp-bullets",
                bulletClass: "fp-bullet",
                bulletActiveClass: "fp-bullet-active",
                onInit: function() {},
                onSwitching: function() {},
                onDestroy: function() {}
            };
            this.options = Object.assign(config, options);
            this.wrapper = element;
            this.sections = this.wrapper.querySelectorAll(this.options.selectorSection);
            this.activeSection = false;
            this.activeSectionId = false;
            this.previousSection = false;
            this.previousSectionId = false;
            this.nextSection = false;
            this.nextSectionId = false;
            this.bulletsWrapper = false;
            this.stopEvent = false;
            if (this.sections.length) this.init();
        }
        init() {
            if (this.options.idActiveSection > this.sections.length - 1) return;
            this.setId();
            this.activeSectionId = this.options.idActiveSection;
            this.setEffectsClasses();
            this.setClasses();
            this.setStyle();
            if (this.options.bullets) {
                this.setBullets();
                this.setActiveBullet(this.activeSectionId);
            }
            this.events();
            setTimeout((() => {
                document.documentElement.classList.add(this.options.сlassInit);
                this.options.onInit(this);
                document.dispatchEvent(new CustomEvent("fpinit", {
                    detail: {
                        fp: this
                    }
                }));
            }), 0);
        }
        destroy() {
            this.removeEvents();
            this.removeClasses();
            document.documentElement.classList.remove(this.options.сlassInit);
            this.wrapper.classList.remove(this.options.wrapperAnimatedClass);
            this.removeEffectsClasses();
            this.removeZIndex();
            this.removeStyle();
            this.removeId();
            this.options.onDestroy(this);
            document.dispatchEvent(new CustomEvent("fpdestroy", {
                detail: {
                    fp: this
                }
            }));
        }
        setId() {
            for (let index = 0; index < this.sections.length; index++) {
                const section = this.sections[index];
                section.setAttribute("data-fp-id", index);
            }
        }
        removeId() {
            for (let index = 0; index < this.sections.length; index++) {
                const section = this.sections[index];
                section.removeAttribute("data-fp-id");
            }
        }
        setClasses() {
            this.previousSectionId = this.activeSectionId - 1 >= 0 ? this.activeSectionId - 1 : false;
            this.nextSectionId = this.activeSectionId + 1 < this.sections.length ? this.activeSectionId + 1 : false;
            this.activeSection = this.sections[this.activeSectionId];
            this.activeSection.classList.add(this.options.activeClass);
            if (false !== this.previousSectionId) {
                this.previousSection = this.sections[this.previousSectionId];
                this.previousSection.classList.add(this.options.previousClass);
            } else this.previousSection = false;
            if (false !== this.nextSectionId) {
                this.nextSection = this.sections[this.nextSectionId];
                this.nextSection.classList.add(this.options.nextClass);
            } else this.nextSection = false;
        }
        removeEffectsClasses() {
            switch (this.options.mode) {
              case "slider":
                this.wrapper.classList.remove("slider-mode");
                break;

              case "cards":
                this.wrapper.classList.remove("cards-mode");
                this.setZIndex();
                break;

              case "fade":
                this.wrapper.classList.remove("fade-mode");
                this.setZIndex();
                break;

              default:
                break;
            }
        }
        setEffectsClasses() {
            switch (this.options.mode) {
              case "slider":
                this.wrapper.classList.add("slider-mode");
                break;

              case "cards":
                this.wrapper.classList.add("cards-mode");
                this.setZIndex();
                break;

              case "fade":
                this.wrapper.classList.add("fade-mode");
                this.setZIndex();
                break;

              default:
                break;
            }
        }
        setStyle() {
            switch (this.options.mode) {
              case "slider":
                this.styleSlider();
                break;

              case "cards":
                this.styleCards();
                break;

              case "fade":
                this.styleFade();
                break;

              default:
                break;
            }
        }
        styleSlider() {
            for (let index = 0; index < this.sections.length; index++) {
                const section = this.sections[index];
                if (index === this.activeSectionId) section.style.transform = "translate3D(0,0,0)"; else if (index < this.activeSectionId) section.style.transform = "translate3D(0,-100%,0)"; else if (index > this.activeSectionId) section.style.transform = "translate3D(0,100%,0)";
            }
        }
        styleCards() {
            for (let index = 0; index < this.sections.length; index++) {
                const section = this.sections[index];
                if (index >= this.activeSectionId) section.style.transform = "translate3D(0,0,0)"; else if (index < this.activeSectionId) section.style.transform = "translate3D(0,-100%,0)";
            }
        }
        styleFade() {
            for (let index = 0; index < this.sections.length; index++) {
                const section = this.sections[index];
                if (index === this.activeSectionId) {
                    section.style.opacity = "1";
                    section.style.visibility = "visible";
                } else {
                    section.style.opacity = "0";
                    section.style.visibility = "hidden";
                }
            }
        }
        removeStyle() {
            for (let index = 0; index < this.sections.length; index++) {
                const section = this.sections[index];
                section.style.opacity = "";
                section.style.visibility = "";
                section.style.transform = "";
            }
        }
        checkScroll(yCoord, element) {
            this.goScroll = false;
            if (!this.stopEvent && element) {
                this.goScroll = true;
                if (this.haveScroll(element)) {
                    this.goScroll = false;
                    const position = Math.round(element.scrollHeight - element.scrollTop);
                    if (Math.abs(position - element.scrollHeight) < 2 && yCoord <= 0 || Math.abs(position - element.clientHeight) < 2 && yCoord >= 0) this.goScroll = true;
                }
            }
        }
        haveScroll(element) {
            return element.scrollHeight !== window.innerHeight;
        }
        removeClasses() {
            for (let index = 0; index < this.sections.length; index++) {
                const section = this.sections[index];
                section.classList.remove(this.options.activeClass);
                section.classList.remove(this.options.previousClass);
                section.classList.remove(this.options.nextClass);
            }
        }
        events() {
            this.events = {
                wheel: this.wheel.bind(this),
                touchdown: this.touchDown.bind(this),
                touchup: this.touchUp.bind(this),
                touchmove: this.touchMove.bind(this),
                touchcancel: this.touchUp.bind(this),
                transitionEnd: this.transitionend.bind(this),
                click: this.clickBullets.bind(this)
            };
            if (isMobile.iOS()) document.addEventListener("touchmove", (e => {
                e.preventDefault();
            }));
            this.setEvents();
        }
        setEvents() {
            this.wrapper.addEventListener("wheel", this.events.wheel);
            this.wrapper.addEventListener("touchstart", this.events.touchdown);
            if (this.options.bullets && this.bulletsWrapper) this.bulletsWrapper.addEventListener("click", this.events.click);
        }
        removeEvents() {
            this.wrapper.removeEventListener("wheel", this.events.wheel);
            this.wrapper.removeEventListener("touchdown", this.events.touchdown);
            this.wrapper.removeEventListener("touchup", this.events.touchup);
            this.wrapper.removeEventListener("touchcancel", this.events.touchup);
            this.wrapper.removeEventListener("touchmove", this.events.touchmove);
            if (this.bulletsWrapper) this.bulletsWrapper.removeEventListener("click", this.events.click);
        }
        clickBullets(e) {
            const bullet = e.target.closest(`.${this.options.bulletClass}`);
            if (bullet) {
                const arrayChildren = Array.from(this.bulletsWrapper.children);
                const idClickBullet = arrayChildren.indexOf(bullet);
                this.switchingSection(idClickBullet);
            }
        }
        setActiveBullet(idButton) {
            if (!this.bulletsWrapper) return;
            const bullets = this.bulletsWrapper.children;
            for (let index = 0; index < bullets.length; index++) {
                const bullet = bullets[index];
                if (idButton === index) bullet.classList.add(this.options.bulletActiveClass); else bullet.classList.remove(this.options.bulletActiveClass);
            }
        }
        touchDown(e) {
            this._yP = e.changedTouches[0].pageY;
            this._eventElement = e.target.closest(`.${this.options.activeClass}`);
            if (this._eventElement) {
                this._eventElement.addEventListener("touchend", this.events.touchup);
                this._eventElement.addEventListener("touchcancel", this.events.touchup);
                this._eventElement.addEventListener("touchmove", this.events.touchmove);
                this.clickOrTouch = true;
                if (isMobile.iOS()) {
                    if (this._eventElement.scrollHeight !== this._eventElement.clientHeight) {
                        if (0 === this._eventElement.scrollTop) this._eventElement.scrollTop = 1;
                        if (this._eventElement.scrollTop === this._eventElement.scrollHeight - this._eventElement.clientHeight) this._eventElement.scrollTop = this._eventElement.scrollHeight - this._eventElement.clientHeight - 1;
                    }
                    this.allowUp = this._eventElement.scrollTop > 0;
                    this.allowDown = this._eventElement.scrollTop < this._eventElement.scrollHeight - this._eventElement.clientHeight;
                    this.lastY = e.changedTouches[0].pageY;
                }
            }
        }
        touchMove(e) {
            const targetElement = e.target.closest(`.${this.options.activeClass}`);
            if (isMobile.iOS()) {
                let up = e.changedTouches[0].pageY > this.lastY;
                let down = !up;
                this.lastY = e.changedTouches[0].pageY;
                if (targetElement) if (up && this.allowUp || down && this.allowDown) e.stopPropagation(); else if (e.cancelable) e.preventDefault();
            }
            if (!this.clickOrTouch || e.target.closest(this.options.noEventSelector)) return;
            let yCoord = this._yP - e.changedTouches[0].pageY;
            this.checkScroll(yCoord, targetElement);
            if (this.goScroll && Math.abs(yCoord) > 20) this.choiceOfDirection(yCoord);
        }
        touchUp(e) {
            this._eventElement.removeEventListener("touchend", this.events.touchup);
            this._eventElement.removeEventListener("touchcancel", this.events.touchup);
            this._eventElement.removeEventListener("touchmove", this.events.touchmove);
            return this.clickOrTouch = false;
        }
        transitionend(e) {
            if (e.target.closest(this.options.selectorSection)) {
                this.stopEvent = false;
                this.wrapper.classList.remove(this.options.wrapperAnimatedClass);
            }
        }
        wheel(e) {
            if (e.target.closest(this.options.noEventSelector)) return;
            const yCoord = e.deltaY;
            const targetElement = e.target.closest(`.${this.options.activeClass}`);
            this.checkScroll(yCoord, targetElement);
            if (this.goScroll) this.choiceOfDirection(yCoord);
        }
        choiceOfDirection(direction) {
            this.stopEvent = true;
            if (0 === this.activeSectionId && direction < 0 || this.activeSectionId === this.sections.length - 1 && direction > 0) this.stopEvent = false;
            if (direction > 0 && false !== this.nextSection) this.activeSectionId = this.activeSectionId + 1 < this.sections.length ? ++this.activeSectionId : this.activeSectionId; else if (direction < 0 && false !== this.previousSection) this.activeSectionId = this.activeSectionId - 1 >= 0 ? --this.activeSectionId : this.activeSectionId;
            if (this.stopEvent) this.switchingSection();
        }
        switchingSection(idSection = this.activeSectionId) {
            this.activeSectionId = idSection;
            this.wrapper.classList.add(this.options.wrapperAnimatedClass);
            this.wrapper.addEventListener("transitionend", this.events.transitionEnd);
            this.removeClasses();
            this.setClasses();
            this.setStyle();
            if (this.options.bullets) this.setActiveBullet(this.activeSectionId);
            this.options.onSwitching(this);
            document.dispatchEvent(new CustomEvent("fpswitching", {
                detail: {
                    fp: this
                }
            }));
        }
        setBullets() {
            this.bulletsWrapper = document.querySelector(`.${this.options.bulletsClass}`);
            if (!this.bulletsWrapper) {
                const bullets = document.createElement("div");
                bullets.classList.add(this.options.bulletsClass);
                this.wrapper.append(bullets);
                this.bulletsWrapper = bullets;
            }
            if (this.bulletsWrapper) for (let index = 0; index < this.sections.length; index++) {
                const span = document.createElement("span");
                span.classList.add(this.options.bulletClass);
                this.bulletsWrapper.append(span);
            }
        }
        setZIndex() {
            let zIndex = this.sections.length;
            for (let index = 0; index < this.sections.length; index++) {
                const section = this.sections[index];
                section.style.zIndex = zIndex;
                --zIndex;
            }
        }
        removeZIndex() {
            for (let index = 0; index < this.sections.length; index++) {
                const section = this.sections[index];
                section.style.zIndex = "";
            }
        }
    }
    if (document.querySelector("[data-fp]")) modules_flsModules.fullpage = new FullPage(document.querySelector("[data-fp]"), "");
    let addWindowScrollEvent = false;
    setTimeout((() => {
        if (addWindowScrollEvent) {
            let windowScroll = new Event("windowScroll");
            window.addEventListener("scroll", (function(e) {
                document.dispatchEvent(windowScroll);
            }));
        }
    }), 0);
    function DynamicAdapt(type) {
        this.type = type;
    }
    DynamicAdapt.prototype.init = function() {
        const _this = this;
        this.оbjects = [];
        this.daClassname = "_dynamic_adapt_";
        this.nodes = document.querySelectorAll("[data-da]");
        for (let i = 0; i < this.nodes.length; i++) {
            const node = this.nodes[i];
            const data = node.dataset.da.trim();
            const dataArray = data.split(",");
            const оbject = {};
            оbject.element = node;
            оbject.parent = node.parentNode;
            оbject.destination = document.querySelector(dataArray[0].trim());
            оbject.breakpoint = dataArray[1] ? dataArray[1].trim() : "767";
            оbject.place = dataArray[2] ? dataArray[2].trim() : "last";
            оbject.index = this.indexInParent(оbject.parent, оbject.element);
            this.оbjects.push(оbject);
        }
        this.arraySort(this.оbjects);
        this.mediaQueries = Array.prototype.map.call(this.оbjects, (function(item) {
            return "(" + this.type + "-width: " + item.breakpoint + "px)," + item.breakpoint;
        }), this);
        this.mediaQueries = Array.prototype.filter.call(this.mediaQueries, (function(item, index, self) {
            return Array.prototype.indexOf.call(self, item) === index;
        }));
        for (let i = 0; i < this.mediaQueries.length; i++) {
            const media = this.mediaQueries[i];
            const mediaSplit = String.prototype.split.call(media, ",");
            const matchMedia = window.matchMedia(mediaSplit[0]);
            const mediaBreakpoint = mediaSplit[1];
            const оbjectsFilter = Array.prototype.filter.call(this.оbjects, (function(item) {
                return item.breakpoint === mediaBreakpoint;
            }));
            matchMedia.addListener((function() {
                _this.mediaHandler(matchMedia, оbjectsFilter);
            }));
            this.mediaHandler(matchMedia, оbjectsFilter);
        }
    };
    DynamicAdapt.prototype.mediaHandler = function(matchMedia, оbjects) {
        if (matchMedia.matches) for (let i = 0; i < оbjects.length; i++) {
            const оbject = оbjects[i];
            оbject.index = this.indexInParent(оbject.parent, оbject.element);
            this.moveTo(оbject.place, оbject.element, оbject.destination);
        } else for (let i = оbjects.length - 1; i >= 0; i--) {
            const оbject = оbjects[i];
            if (оbject.element.classList.contains(this.daClassname)) this.moveBack(оbject.parent, оbject.element, оbject.index);
        }
    };
    DynamicAdapt.prototype.moveTo = function(place, element, destination) {
        element.classList.add(this.daClassname);
        if ("last" === place || place >= destination.children.length) {
            destination.insertAdjacentElement("beforeend", element);
            return;
        }
        if ("first" === place) {
            destination.insertAdjacentElement("afterbegin", element);
            return;
        }
        destination.children[place].insertAdjacentElement("beforebegin", element);
    };
    DynamicAdapt.prototype.moveBack = function(parent, element, index) {
        element.classList.remove(this.daClassname);
        if (void 0 !== parent.children[index]) parent.children[index].insertAdjacentElement("beforebegin", element); else parent.insertAdjacentElement("beforeend", element);
    };
    DynamicAdapt.prototype.indexInParent = function(parent, element) {
        const array = Array.prototype.slice.call(parent.children);
        return Array.prototype.indexOf.call(array, element);
    };
    DynamicAdapt.prototype.arraySort = function(arr) {
        if ("min" === this.type) Array.prototype.sort.call(arr, (function(a, b) {
            if (a.breakpoint === b.breakpoint) {
                if (a.place === b.place) return 0;
                if ("first" === a.place || "last" === b.place) return -1;
                if ("last" === a.place || "first" === b.place) return 1;
                return a.place - b.place;
            }
            return a.breakpoint - b.breakpoint;
        })); else {
            Array.prototype.sort.call(arr, (function(a, b) {
                if (a.breakpoint === b.breakpoint) {
                    if (a.place === b.place) return 0;
                    if ("first" === a.place || "last" === b.place) return 1;
                    if ("last" === a.place || "first" === b.place) return -1;
                    return b.place - a.place;
                }
                return b.breakpoint - a.breakpoint;
            }));
            return;
        }
    };
    const da = new DynamicAdapt("max");
    da.init();
    let apiUrl = `https://my-json-server.typicode.com/talinya222/Delivery-App/db`;
    axios.get(apiUrl).then(showDatabase);
    let resulObj = {};
    console.log(resulObj);
    function showDatabase(response) {
        document.addEventListener("click", documentActions);
        function documentActions(e) {
            const targetElement = e.target;
            if (targetElement.classList.contains("item-card__cart-button")) {
                let productId = targetElement.closest(".item-card").dataset.pid;
                addToCart(targetElement, productId);
                e.preventDefault();
            }
            if (targetElement.classList.contains("menu__link_cart") || targetElement.closest(".menu__link_cart")) {
                if (document.querySelector(".cart-list").children.length > 0) {
                    document.querySelector(".cards-catalog__tbs-body").classList.remove("_grid");
                    document.querySelector(".cards-catalog__tbs-body").innerHTML = "";
                    document.querySelector(".cards-catalog__tbs-body").innerHTML = document.querySelector(".submenu").innerHTML;
                }
                e.preventDefault();
            } else if (!targetElement.closest(".menu") && !targetElement.classList.contains("item-card__cart-button")) document.querySelector(".menu").classList.remove("_active");
            if (targetElement.classList.contains("cart-list__delete")) {
                const productId = targetElement.closest(".cart-list__item").dataset.cartPid;
                updateCart(targetElement, productId, false);
                e.preventDefault();
            }
            if (targetElement.classList.contains("cart-header__close")) {
                document.querySelector(".cards-catalog__tbs-body").classList.add("_grid");
                if (document.querySelector(".cards-catalog__tbs-body").classList.contains("_grid")) {
                    clearPage();
                    showShopGridContent();
                }
                e.preventDefault();
            }
            if (targetElement.classList.contains("cart-header__order-button")) {
                let productIdOld = document.querySelectorAll(".cart-list__item");
                let productIdAll = [ ...productIdOld ].map((item => item.dataset.cartPid));
                function onlyUnique(value, index, self) {
                    return self.indexOf(value) === index;
                }
                let productId = productIdAll.filter(onlyUnique);
                getNewJson(productId);
                e.preventDefault();
            }
        }
        const data = response.data;
        let shop = Object.values(data);
        let shopIndex = 0;
        let shopListElement = document.querySelector(".shops-catalog");
        let shopName = document.querySelector(".main-title__title");
        function displayShopsList() {
            let shopListeHTML = `\n\t\t<ul class="shops-catalog__list">`;
            for (let i = 0; i < shop.length; i++) {
                const element = shop[i];
                let shopTitle = element[0]["title"];
                shopListeHTML += `\n\t\t\t<li class="shops-catalog__item"><a href="#" data-shop="${i}" class="shops-catalog__link">${shopTitle}</a></li>\n\t\t\t\t`;
            }
            shopListeHTML += `</ul>`;
            shopListElement.innerHTML = shopListeHTML;
        }
        displayShopsList();
        let shopListLinks = document.querySelectorAll(".shops-catalog__link");
        let backLink = document.querySelector(".top-catalog__button");
        shopListLinks.forEach((link => {
            backLink.addEventListener("click", (function(event) {
                event.preventDefault();
                let targetElement = event.target;
                if (targetElement.closest(".top-catalog__button")) {
                    link.classList.remove("_selected-store");
                    shopListElement.classList.remove("_active");
                    cardItemsBody.classList.remove("_grid");
                    cardItemsBody.classList.add("_line");
                }
            }));
            link.addEventListener("click", (function(e) {
                let dataAttr = parseInt(link.dataset.shop);
                e.preventDefault();
                let targetElement = e.target;
                if (targetElement.closest(".shops-catalog__link")) {
                    targetElement.classList.toggle("_selected-store");
                    shopListElement.classList.toggle("_active");
                }
                if (targetElement.classList.contains("_selected-store")) {
                    shopName.innerHTML = targetElement.innerHTML;
                    shopIndex = dataAttr;
                    clearPage();
                    if (gridLink.classList.contains("_tab-active")) showShopGridContent(); else if (lineLink.classList.contains("_tab-active")) showShopLineContent();
                    getWorkingLikes();
                }
            }));
        }));
        let catalogNavigation = document.querySelector(".cards-catalog__navigation");
        let gridLink = document.querySelector(".cards-catalog__title_view-grid");
        let lineLink = document.querySelector(".cards-catalog__title_view-line");
        catalogNavigation.addEventListener("click", chosenContent);
        let cardItemsBody = document.querySelector(".cards-catalog__tbs-body");
        function clearPage() {
            cardItemsBody.innerHTML = "";
        }
        if (document.documentElement.classList.contains("loaded")) {
            shopListLinks[0].classList.add("_selected-store");
            shopListElement.classList.add("_active");
            cardItemsBody.classList.add("_grid");
            shopName.innerHTML = shopListLinks[0].innerHTML;
        }
        if (cardItemsBody.classList.contains("_grid")) {
            clearPage();
            showShopGridContent();
            getWorkingLikes();
        }
        function chosenContent(e) {
            e.preventDefault();
            let targetElement = e.target;
            if (targetElement.closest(".cards-catalog__title_view-grid")) {
                cardItemsBody.classList.add("_grid");
                targetElement.classList.add("_tab-active");
                lineLink.classList.remove("_tab-active");
                clearPage();
                showShopGridContent();
                getWorkingLikes();
            } else if (targetElement.closest(".cards-catalog__title_view-line")) {
                cardItemsBody.classList.remove("_grid");
                gridLink.classList.remove("_tab-active");
                targetElement.classList.add("_tab-active");
                clearPage();
                showShopLineContent();
                getWorkingLikes();
            }
        }
        function showShopGridContent() {
            shop[shopIndex].forEach((shop => {
                let cardHTML = `\n\t\t<div class="cards-catalog__items">\n\t\t`;
                shop.products.forEach((item => {
                    const productId = item.id;
                    item.url;
                    const productImage = item.image;
                    const productTitle = item.title;
                    const productContent = item.content;
                    item.text;
                    const productPrice = item.price;
                    const productPriceOld = item.priceOld;
                    item.shareUrl;
                    const productLikeUrl = item.likeUrl;
                    let productLabels = item.labels;
                    productLabels = [ ...productLabels ];
                    cardHTML += `\n\t\t\t<div data-pid="${productId}" class="cards-catalog__item item-card">\n\t\t\t\t<div class="item-card__labels">`;
                    productLabels.forEach((label => {
                        cardHTML += `\n\t\t\t\t\t\t<div class="item-card__label item-card__label_${label.type}">${label.value}</div>\n\t\t\t\t\t\t\t`;
                    }));
                    cardHTML += `</div>\n\n\t\t\t<a href="#" class="item-card__image-ibg item-card__image-ibg_contain">\n\t\t\t\t<img class="item-card__img" src="img/${Object.keys(data)[shopIndex]}/${productImage}" alt="${productTitle}">\n\t\t\t</a>\n\n\t\t\t<div class="item-card__body">\n\n\t\t\t\t<div class="item-card__likes likes">\n\t\t\t\t\t<div class="likes__reviews _icon-heart">Likes (${productLikeUrl})</div>\n\t\t\t\t</div>\n\n\t\t\t\t<div class="item-card__title">${productTitle}</div>\n\t\t\t\t<div class="item-card__text">${productContent}</div>`;
                    let productPrices = "";
                    let productPricesStart = `<div class="item-card__cost">`;
                    let productPricesOld = `<div class="item-card__old-price">${productPriceOld}&nbsp;&euro;</div>`;
                    let productPricesCurrent = `<div class="item-card__price">${productPrice}&nbsp;&euro;</div>`;
                    let productPricesEnd = `</div>`;
                    productPrices = productPricesStart;
                    if (productPriceOld) productPrices += productPricesOld;
                    productPrices += productPricesCurrent;
                    cardHTML = cardHTML + productPrices + productPricesEnd + `\n\t\t\t<a href="#" class="item-card__cart-button _icon-cart">Add To Cart</a>\n\t\t\t</div>`;
                    cardHTML += `</div>`;
                }));
                cardHTML += `</div>`;
                cardItemsBody.innerHTML = cardHTML;
            }));
        }
        function showShopLineContent() {
            shop[shopIndex].forEach((shop => {
                let cardHTML = `\n\t\t\t<div class="cards-catalog__items cards-catalog__items_line">\n\t\t`;
                shop.products.forEach((item => {
                    const productId = item.id;
                    item.url;
                    const productImage = item.image;
                    const productTitle = item.title;
                    const productContent = item.content;
                    let productText = item.text;
                    const productPrice = item.price;
                    const productPriceOld = item.priceOld;
                    item.shareUrl;
                    const productLikeUrl = item.likeUrl;
                    let productLabels = item.labels;
                    productLabels = [ ...productLabels ];
                    productText = [ ...productText ];
                    cardHTML += `\n\t\t\t\t<div data-pid="${productId}" class="cards-catalog__item item-card item-card_line">\n\t\t\t\t\t<a href="#" class="item-card__image-ibg item-card__image-ibg_contain">\n\t\t\t\t\t\t<img class="item-card__img" src="img/${Object.keys(data)[shopIndex]}/${productImage}" alt="${productTitle}">\n\t\t\t\t\t</a>\n\n\t\t\t\t\t<div class="item-card__body">\n\t\t\t\t\t\t<div class="item-card__title">${productTitle}</div>\n\t\t\t\t\t\t<div class="item-card__line-content">\n\t\t\t\t\t\t\t<div class="item-card__text">${productContent}</div>\n\t\t\t\t\t\t\t<ul class="item-card__list">`;
                    productText.forEach((text => {
                        cardHTML += `\n\t\t\t\t\t\t\t\t\t<li class="item-card__info-item">${text.key}</li>`;
                    }));
                    cardHTML += `</ul>\n\t\t\t\t\t\t\t<ul class="item-card__list">`;
                    productText.forEach((text => {
                        cardHTML += `\n\t\t\t\t\t\t\t\t\t<li class="item-card__info-item">${text.value}</li>`;
                    }));
                    cardHTML += `</ul> </div>`;
                    let productPrices = "";
                    let productPricesStart = `<div class="item-card__cost">`;
                    let productPricesOld = `<div class="item-card__old-price">${productPriceOld}&nbsp;&euro;</div>`;
                    let productPricesCurrent = `<div class="item-card__price">${productPrice}&nbsp;&euro;</div>`;
                    let productPricesEnd = `</div>`;
                    productPrices = productPricesStart;
                    if (productPriceOld) productPrices += productPricesOld;
                    productPrices += productPricesCurrent;
                    cardHTML = cardHTML + productPrices + productPricesEnd + `</div>\n\n\n\t\t\t\t<div class="item-card__labels">`;
                    productLabels.forEach((label => {
                        cardHTML += `\n\t\t\t\t\t\t<div class="item-card__label item-card__label_${label.type}">${label.value}</div>\n\t\t\t\t\t\t\t`;
                    }));
                    cardHTML += `</div>\n\n\t\t\t\t<div class="item-card__likes likes">\n\t\t\t\t\t<div class="likes__reviews _icon-heart">Likes (${productLikeUrl})</div>\n\t\t\t\t</div>\n\n\t\t\t\t<a href="#" class="item-card__cart-button _icon-cart">Add To Cart</a>`;
                    cardHTML += `</div>`;
                }));
                cardHTML += `</div>`;
                cardItemsBody.innerHTML = cardHTML;
            }));
        }
        function getWorkingLikes() {
            let likesLinks = document.getElementsByClassName("likes");
            likesLinks = [ ...likesLinks ];
            likesLinks.forEach((like => {
                let x = parseInt(like.innerHTML.replace(/[^\d]/g, ""));
                like.addEventListener("click", (function(event) {
                    event.preventDefault();
                    let targetElement = event.target;
                    if (targetElement.closest(".likes__reviews")) {
                        targetElement.classList.toggle("_like");
                        if (targetElement.classList.contains("_like")) targetElement.innerHTML = `Likes (${++x})`; else targetElement.innerHTML = `Likes (${--x})`;
                    }
                }));
            }));
        }
        function addToCart(productButton, productId) {
            if (!productButton.classList.contains("_hold")) {
                productButton.classList.add("_hold");
                productButton.classList.add("_fly");
                const cart = document.querySelector(".menu__product-cart");
                const product = document.querySelector(`[data-pid="${productId}"]`);
                const productImage = product.querySelector(".item-card__img");
                const productImageFly = productImage.cloneNode(true);
                const productImageFlyWidth = productImage.offsetWidth;
                const productImageFlyHeight = productImage.offsetHeight;
                const productImageFlyTop = productImage.getBoundingClientRect().top;
                const productImageFlyLeft = productImage.getBoundingClientRect().left;
                productImageFly.setAttribute("class", "_flyImage _ibg");
                productImageFly.style.cssText = `\n\t\tleft: ${productImageFlyLeft}px;\n\t\ttop: ${productImageFlyTop}px;\n\t\twidth: ${productImageFlyWidth}px;\n\t\theight: ${productImageFlyHeight}px;\n\t`;
                document.body.append(productImageFly);
                const cartFlyLeft = cart.getBoundingClientRect().left;
                const cartFlyTop = cart.getBoundingClientRect().top;
                productImageFly.style.cssText = `\n\t\tleft: ${cartFlyLeft}px;\n\t\ttop: ${cartFlyTop}px;\n\t\twidth: 0px;\n\t\theight: 0px;\n\t\topacity:0;\n\t`;
                productImageFly.addEventListener("transitionend", (function() {
                    if (productButton.classList.contains("_fly")) {
                        productImageFly.remove();
                        updateCart(productButton, productId);
                        productButton.classList.remove("_fly");
                    }
                }));
            }
        }
        function updateCart(productButton, productId, productAdd = true) {
            const cart = document.querySelector(".menu__link_cart");
            const cartIcon = cart.querySelector(".menu__product-cart");
            let cartQuantity = cartIcon.querySelector("span");
            const cartProduct = document.querySelector(`[data-cart-pid="${productId}"]`);
            const cartList = document.querySelector(".cart-list");
            if (productAdd) {
                if (cartQuantity) cartQuantity.innerHTML = ++cartQuantity.innerHTML; else cartIcon.insertAdjacentHTML("beforeend", `<span class="menu__count-product">1</span>`);
                if (!cartProduct) {
                    const product = document.querySelector(`[data-pid="${productId}"]`);
                    let cartProductImage = product.querySelector(".item-card__image-ibg").innerHTML;
                    const cartProductTitle = product.querySelector(".item-card__title").innerHTML;
                    const cartProductPrice = product.querySelector(".item-card__price").innerHTML;
                    parseInt(cartProductPrice.replace(/[^\d]/g, ""));
                    const cartProductContent = `\n\t\t\t<div class="cart-list__body">\n\t\t\t\t<div class="cart-list__image-ibg">${cartProductImage}</div>\n\t\t\t\t<div class="cart-list__cupcake-about">\n\t\t\t\t\t<div class="cart-list__name">${cartProductTitle}</div>\n\t\t\t\t</div>\t\n\t\t\t\t<div data-quantity class="quantity">\n\t\t\t\t\t<div data-quantity-plus class="quantity__button quantity__button_plus _icon-plus"></div>\n\n\t\t\t\t\t<div class="cart-list__quantity quantity__input"><span data-quantity-value>1</span></div>\n\t\n\t\t\t\t\t<div data-quantity-minus class="quantity__button quantity__button_minus _icon-minus"></div>\n\t\t\t\t</div>\n\n\t\t\t\t<div class="cart-list__price">${cartProductPrice}</div>\n\t\t\t\t<a href="#" class="cart-list__delete"></a>\n\t\t\t</div>\n\t\t`;
                    cartList.insertAdjacentHTML("beforeend", `\n\n\t\t\t\t<li data-cart-pid="${productId}" class="cart-list__item">${cartProductContent}</li>\n\n\t\t\t`);
                } else {
                    let cartProductQuantity = cartProduct.querySelector(".cart-list__quantity span");
                    cartProductQuantity.innerHTML = ++cartProductQuantity.innerHTML;
                }
                productButton.classList.remove("_hold");
            } else {
                let cartProductQuantity = cartProduct.querySelector(".cart-list__quantity span");
                cartProductQuantity.innerHTML = --cartProductQuantity.innerHTML;
                if (!parseInt(cartProductQuantity.innerHTML)) cartProduct.remove();
                const cartQuantityValue = --cartQuantity.innerHTML;
                if (cartQuantityValue) cartQuantity.innerHTML = cartQuantityValue; else {
                    cartQuantity.remove();
                    cart.classList.remove("_active");
                }
            }
        }
        function formQuantity() {
            document.addEventListener("click", (function(e) {
                let targetElement = e.target;
                if (targetElement.closest("[data-quantity-plus]") || targetElement.closest("[data-quantity-minus]")) {
                    const valueElement = targetElement.closest("[data-quantity]").querySelector("[data-quantity-value]");
                    let value = parseInt(valueElement.innerHTML);
                    if (targetElement.hasAttribute("data-quantity-plus")) {
                        value++;
                        if (+valueElement.dataset.quantityMax && +valueElement.dataset.quantityMax < value) value = valueElement.dataset.quantityMax;
                    } else {
                        --value;
                        if (+valueElement.dataset.quantityMin) {
                            if (+valueElement.dataset.quantityMin > value) value = valueElement.dataset.quantityMin;
                        } else if (value < 1) value = 1;
                    }
                    targetElement.closest("[data-quantity]").querySelector("[data-quantity-value]").innerHTML = value;
                }
            }));
        }
        formQuantity();
    }
    window["FLS"] = true;
    isWebp();
    addLoadedClass();
    menuInit();
    formFieldsInit({
        viewPass: false,
        autoHeight: false
    });
})();