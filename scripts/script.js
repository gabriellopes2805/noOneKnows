const gift = document.querySelector("#gift");
const giftImage = document.querySelector("#giftImage");

let giftAnimating = false;

gift.addEventListener("click", async () => {
    if (giftAnimating) return;

    giftAnimating = true;
    gift.style.pointerEvents = "none";

    console.log("Animação começou");

    await giftImpulse();

    const result = await giftJumpAndFall();

    console.log("Animação terminou!");
    console.log(`Duração da queda: ${result.duration.toFixed(0)}ms`);

    await afterGiftAnimation();
});

async function giftImpulse() {
    const animation = giftImage.animate(
        [
            {
                transform: "translateY(0) scale(1)",
            },

            {
                transform: "translateY(3px) scale(1.02, 0.98)",
            },

            {
                transform: "translateY(0) scale(1)",
            },
        ],
        {
            duration: 80,
            easing: "ease-out",
        },
    );

    await animation.finished;

    animation.cancel();

    giftImage.style.transform = "translate(0px, 0px) rotate(0deg)";
}

function giftJumpAndFall() {
    return new Promise((resolve) => {
        let x = 0;
        let y = 0;
        let velocityY = -650;

        let velocityX = 55;

        const gravity = 2600;

        let rotation = 0;

        const rotationSpeed = 55;
        const startRect = giftImage.getBoundingClientRect();
        const animationStart = performance.now();

        let lastTime = null;

        function physics(currentTime) {
            if (lastTime === null) {
                lastTime = currentTime;
            }

            const delta = Math.min((currentTime - lastTime) / 1000, 0.032);

            lastTime = currentTime;

            // ==============================
            // GRAVIDADE
            // ==============================

            velocityY += gravity * delta;

            // ==============================
            // POSIÇÃO
            // ==============================

            y += velocityY * delta;
            x += velocityX * delta;

            // ==============================
            // ROTAÇÃO
            // ==============================

            rotation += rotationSpeed * delta;

            giftImage.style.transform = `
                translate(${x}px, ${y}px)
                rotate(${rotation}deg)
            `;

            // Posição atual do presente
            const currentTop = startRect.top + y;

            if (currentTop < getViewportHeight() + 200) {
                requestAnimationFrame(physics);
            } else {
                giftImage.style.display = "none";
                gift.innerHTML = ``;

                const duration = performance.now() - animationStart;

                resolve({
                    duration,
                });
            }
        }

        requestAnimationFrame(physics);
    });
}

async function showBalloons() {
    const balloonLayer = createBalloonLayer();

    const BALLOON_COUNT = 60;
    const animations = [];

    for (let i = 0; i < BALLOON_COUNT; i++) {
        const animation = createBalloon(balloonLayer);

        animations.push(animation);

        const spawnDelay = 80 + Math.random() * 140;

        await sleep(spawnDelay);
    }

    await Promise.all(animations);

    // Remove a camada inteira
    // depois que todos terminarem
    balloonLayer.remove();
}

function createBalloonLayer() {
    const existing = document.querySelector("#balloonLayer");

    if (existing) {
        existing.remove();
    }

    const layer = document.createElement("div");

    layer.id = "balloonLayer";

    document.body.appendChild(layer);

    return layer;
}

function createBalloon(balloonLayer) {
    const balloonType = Math.floor(Math.random() * 6) + 1;

    const balloon = document.createElement("img");

    balloon.src = `./images/balao${balloonType}.png`;

    balloon.alt = "";
    balloon.draggable = false;

    balloon.classList.add("floatingBalloon");

    // =========================
    // VIEWPORT REAL DA CAMADA
    // =========================

    const viewportWidth = balloonLayer.clientWidth;

    const viewportHeight = balloonLayer.clientHeight;

    // =========================
    // TAMANHO RESPONSIVO
    // =========================

    const scale = Math.min(Math.max(viewportWidth / 900, 0.72), 1);

    const MIN_SIZE = 45 * scale;

    const MAX_SIZE = 125 * scale;

    const MAX_BLUR = 3;

    const size = MIN_SIZE + Math.random() * (MAX_SIZE - MIN_SIZE);

    balloon.style.width = `${size}px`;

    // =========================
    // BLUR
    // =========================

    const blur = ((MAX_SIZE - size) / (MAX_SIZE - MIN_SIZE)) * MAX_BLUR;

    balloon.style.setProperty("--balloon-blur", `${blur}px`);

    // =========================
    // POSIÇÃO
    // =========================

    const margin = 10;

    const availableWidth = Math.max(0, viewportWidth - size - margin * 2);

    const startX = margin + Math.random() * availableWidth;

    balloon.style.left = `${startX}px`;

    /*
        Ele realmente começa
        FORA da tela agora.
    */
    balloon.style.bottom = `-${size + 10}px`;

    balloonLayer.appendChild(balloon);

    // =========================
    // MOVIMENTO
    // =========================

    const duration = 6000 + Math.random() * 3500;

    const distance = viewportHeight + size + 120;

    const animation = balloon.animate(
        [
            /*
                    IMPORTANTE:

                    opacity já começa em 1.

                    Como o elemento está fisicamente
                    abaixo da tela, ele vai realmente
                    atravessar a borda inferior.
                */
            {
                transform: "translateY(0px)",

                opacity: 1,
                offset: 0,
            },

            {
                transform: `translateY(${-distance * 0.08}px)`,

                opacity: 1,
                offset: 0.15,
            },

            {
                transform: `translateY(${-distance * 0.25}px)`,

                opacity: 1,
                offset: 0.35,
            },

            {
                transform: `translateY(${-distance * 0.55}px)`,

                opacity: 1,
                offset: 0.65,
            },

            {
                transform: `translateY(${-distance * 0.82}px)`,

                opacity: 1,
                offset: 0.85,
            },

            /*
                    Só desaparece quando
                    estiver saindo pelo topo.
                */
            {
                transform: `translateY(${-distance}px)`,

                opacity: 0,
                offset: 1,
            },
        ],
        {
            duration,

            easing: "cubic-bezier(.42, 0, .75, 1)",

            fill: "forwards",
        },
    );

    return animation.finished
        .catch(() => {})
        .then(() => {
            balloon.remove();
        });
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function afterGiftAnimation() {
    console.log("O presente já caiu no vazio.");

    await showBalloons();
    await showMessage();

    await sleep(3000);

    await showFinalFigmaScene();
}

async function showMessage() {
    // =========================
    // TEXTO DA CARTA
    // =========================

    const messages = [
        "Feliz aniversário, Alice! 🥳",
        "Eu sei que faz pouquíssimo tempo que nos conhecemos, mas mesmo assim, você se tornou alguém tão especial na minha vida. 💖",
        "",
        "Eu realmente me tornei alguém melhor desde que te conheci, e eu só tenho a agradecer por isso. Eu pude expressar o melhor de mim com a sua ajuda, e sou muito feliz por isso!",
        "Você sempre foi uma mulher alegre, divertida, brincalhona e que me faz rir muito, sempre alegrando não apenas o meu dia, como o de todos ao seu redor.",
        "Sei o quanto você merece tudo de melhor nesse mundo, Alice! Saiba que sempre estarei aqui para te apoiar, te ouvir e te fazer sorrir, assim como você faz comigo.",
        "",
        "Eu desejo um dia incrível, cheio de amor, alegria e momentos inesquecíveis. Que todos os seus sonhos se realizem e que você continue sendo essa pessoa maravilhosa que ilumina a vida de todos ao seu redor! 🥰",
        "Estarei aqui por você, até que o oceano de estrelas se apague! Aproveite o seu dia, e saiba que você é muito especial para mim. 💕",
        "",
        "Com todo o amor, Gabriel. ❤️",
    ];

    // =========================
    // CRIA O CONTAINER
    // =========================

    const letterScene = document.createElement("div");

    letterScene.classList.add("letterScene");

    document.body.appendChild(letterScene);

    // =========================
    // CRIA A CARTA
    // =========================

    const letter = document.createElement("div");

    letter.classList.add("letter");

    letterScene.appendChild(letter);
    setupLetterScroll(letter);

    // =========================
    // ENTRADA DA CARTA
    // =========================

    const entrance = letter.animate(
        [
            {
                opacity: 0,
                transform: "translateY(25px) scale(0.96)",
            },
            {
                opacity: 1,
                transform: "translateY(0px) scale(1)",
            },
        ],
        {
            duration: 700,
            easing: "cubic-bezier(.22, 1, .36, 1)",
            fill: "forwards",
        },
    );

    await entrance.finished;

    // =========================
    // ESCREVE CADA PARÁGRAFO
    // =========================

    for (let i = 0; i < messages.length; i++) {
        const paragraph = document.createElement("p");

        paragraph.classList.add("letterParagraph");

        letter.appendChild(paragraph);

        // cursor
        const cursor = document.createElement("span");

        cursor.classList.add("typingCursor");

        paragraph.appendChild(cursor);

        await typeText(paragraph, cursor, messages[i]);

        // pequena pausa entre frases
        await sleep(500);

        // tira o cursor desse parágrafo
        cursor.remove();
    }

    // =========================
    // CURSOR FINAL
    // =========================

    const finalCursor = document.createElement("span");

    finalCursor.classList.add("typingCursor");

    letter.appendChild(finalCursor);

    // deixa piscando um pouco
    await sleep(1800);

    finalCursor.remove();
}

async function typeText(element, cursor, text) {
    for (const char of text) {
        const textNode = document.createTextNode(char);

        element.insertBefore(textNode, cursor);

        let delay = 35 + Math.random() * 45;

        if (char === ",") {
            delay += 120;
        }

        if (char === "." || char === "!" || char === "?") {
            delay += 250;
        }

        if (char === "…") {
            delay += 300;
        }

        // ========================
        // AUTO SCROLL INTELIGENTE
        // ========================

        const letter = element.closest(".letter");

        if (letter) {
            scrollLetterWithTyping(letter);
        }

        await sleep(delay);
    }
}

const letterScrollStates = new WeakMap();

function setupLetterScroll(letter) {
    const state = {
        followTyping: true,
        programmaticScroll: false,
    };

    letterScrollStates.set(letter, state);

    // Usuário começou a mexer
    letter.addEventListener(
        "wheel",
        () => {
            state.followTyping = false;
        },
        {
            passive: true,
        },
    );

    letter.addEventListener(
        "touchstart",
        () => {
            state.followTyping = false;
        },
        {
            passive: true,
        },
    );

    letter.addEventListener(
        "scroll",
        () => {
            if (state.programmaticScroll) {
                return;
            }

            const distanceFromBottom =
                letter.scrollHeight - letter.scrollTop - letter.clientHeight;

            /*
                Se o usuário voltou próximo
                do fim da carta, volta a
                acompanhar a digitação.
            */
            state.followTyping = distanceFromBottom < 50;
        },
        {
            passive: true,
        },
    );
}

function scrollLetterWithTyping(letter) {
    const state = letterScrollStates.get(letter);

    if (!state || !state.followTyping) {
        return;
    }

    state.programmaticScroll = true;

    letter.scrollTop = letter.scrollHeight;

    requestAnimationFrame(() => {
        state.programmaticScroll = false;
    });
}

async function showFinalFigmaScene() {
    // =========================
    // FADE OUT DA CARTA
    // =========================

    const existingLetterScene = document.querySelector(".letterScene");

    if (existingLetterScene) {
        const fadeOut = existingLetterScene.animate(
            [
                {
                    opacity: 1,
                    transform: "translateY(0px) scale(1)",
                },
                {
                    opacity: 0,
                    transform: "translateY(10px) scale(0.98)",
                },
            ],
            {
                duration: 700,
                easing: "ease",
                fill: "forwards",
            },
        );

        await fadeOut.finished;
        existingLetterScene.remove();
    }

    // =========================
    // CRIA A CENA FINAL
    // =========================

    const finalScene = document.createElement("div");
    finalScene.classList.add("finalScene");

    const finalContent = document.createElement("div");
    finalContent.classList.add("finalSceneContent");

    const glow = document.createElement("div");
    glow.classList.add("finalGlow");

    const heart = document.createElement("img");
    heart.src = "./images/coracao.png";
    heart.alt = "Coração";
    heart.draggable = false;
    heart.classList.add("finalHeart");

    const anniversary = document.createElement("img");
    anniversary.src = "./images/aniversario.png";
    anniversary.alt = "Mensagem de aniversário";
    anniversary.draggable = false;
    anniversary.classList.add("finalAniversario");

    finalContent.appendChild(glow);
    finalContent.appendChild(heart);
    finalContent.appendChild(anniversary);
    finalScene.appendChild(finalContent);

    document.body.appendChild(finalScene);

    // =========================
    // ESPERA AS IMAGENS CARREGAREM
    // =========================

    await Promise.all([waitForImageLoad(heart), waitForImageLoad(anniversary)]);

    // =========================
    // ENTRADA DA CENA
    // =========================

    const sceneIntro = finalScene.animate(
        [
            {
                opacity: 0,
            },
            {
                opacity: 1,
            },
        ],
        {
            duration: 500,
            easing: "ease",
            fill: "forwards",
        },
    );

    await sceneIntro.finished;

    // =========================
    // CORAÇÃO ENTRA PRIMEIRO
    // =========================

    const heartIntro = heart.animate(
        [
            {
                opacity: 0,
                transform: "translateY(20px) scale(0.85)",
                filter: "blur(10px) drop-shadow(0 0 0 rgba(255, 170, 220, 0))",
            },
            {
                opacity: 1,
                transform: "translateY(0px) scale(1.03)",
                filter: "blur(0px) drop-shadow(0 0 30px rgba(255, 160, 220, 0.55))",
            },
            {
                opacity: 1,
                transform: "translateY(0px) scale(1)",
                filter: "blur(0px) drop-shadow(0 0 22px rgba(255, 160, 220, 0.4))",
            },
        ],
        {
            duration: 1100,
            easing: "cubic-bezier(.22, 1, .36, 1)",
            fill: "forwards",
        },
    );

    const glowIntro = glow.animate(
        [
            {
                opacity: 0,
                transform: "scale(0.7)",
            },
            {
                opacity: 1,
                transform: "scale(1)",
            },
        ],
        {
            duration: 1200,
            easing: "ease-out",
            fill: "forwards",
        },
    );

    await Promise.all([heartIntro.finished, glowIntro.finished]);

    // =========================
    // PEQUENA PAUSA
    // =========================

    await sleep(250);

    // =========================
    // REVELA O TEXTO / IMAGEM
    // =========================

    const textReveal = anniversary.animate(
        [
            {
                opacity: 0,
                clipPath: "inset(0 100% 0 0)",
                transform: "translateY(6px) scale(0.98)",
                filter: "blur(4px)",
            },
            {
                opacity: 1,
                clipPath: "inset(0 0% 0 0)",
                transform: "translateY(0px) scale(1)",
                filter: "blur(0px)",
            },
        ],
        {
            duration: 1400,
            easing: "cubic-bezier(.22, 1, .36, 1)",
            fill: "forwards",
        },
    );

    await textReveal.finished;

    // =========================
    // PULSO LEVE CONTÍNUO
    // =========================

    heart.classList.add("finalHeartPulse");
}

function waitForImageLoad(img) {
    return new Promise((resolve) => {
        if (img.complete) {
            resolve();
            return;
        }

        img.addEventListener("load", resolve, { once: true });
        img.addEventListener("error", resolve, { once: true });
    });
}

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

function getViewportWidth() {
    return window.visualViewport?.width ?? window.innerWidth;
}

function getViewportHeight() {
    return window.visualViewport?.height ?? window.innerHeight;
}
