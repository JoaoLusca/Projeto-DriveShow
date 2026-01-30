const prevButtom = document.getElementById('prev')
const nextButtom = document.getElementById('next')
const items = document.querySelectorAll('.item')
const dots = document.querySelectorAll('.dot')
const numberIndicator = document.querySelector('.number')
const list = document.querySelector('.list')

let active = 0;
const total = items.length
let timer;


//timer para rodar o carrosel sozinho
function startTimer() {
    clearInterval(timer); // Limpa o timer anterior se ele existir
    timer = setInterval(() => {
        update(1);
    }, 10000);
}

//sistema do carrosel
function update(direction) {

    // remove classes ativas
    document.querySelector('.item.active').classList.remove('active')
    document.querySelector('.dot.active').classList.remove('active')
    // limpa transforms de todas as product-img (evita ficar deslocada ao trocar)
    document.querySelectorAll('.product-img').forEach(el => el.style.transform = '')

    if (direction > 0) {
        active = active + 1;


        if (active === total) {
            active = 0;
        }
    }
    else if (direction < 0) {
        active = active - 1

        if(active < 0){
            active = total - 1
        }
    }

    items[active].classList.add('active')
    dots[active].classList.add('active')

    numberIndicator.textContent = String(active + 1).padStart(2, '0')
}

//Chamamos a função ao carregar a página pela primeira vez
startTimer();

//Nos eventos de clique, chamamos o startTimer() após o update
prevButtom.addEventListener('click', function () {
    update(-1);
    startTimer(); // Resetamos o relógio aqui
})

nextButtom.addEventListener('click', function () {
    update(1);
    startTimer(); // Resetamos o relógio aqui
})