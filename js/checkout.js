var cart = JSON.parse(localStorage.getItem('brava_cart') || '[]')
var promoApplied = false
var promoDiscount = 0

function saveCart() {
    localStorage.setItem('brava_cart', JSON.stringify(cart))
}

function updateQty(index, delta) {
    cart[index].qty = Math.max(1, (cart[index].qty || 1) + delta)
    saveCart()
    renderCart()
}

function removeItem(index) {
    cart.splice(index, 1)
    saveCart()
    renderCart()
}

function renderCart() {
    var $items = $('#cartItems')
    var $btn = $('#checkoutBtn')

    if (cart.length === 0) {
        $('#itemCount').text('(0 termék)')
        $items.html(`
            <div class="empty-cart">
                <i class="bi bi-cart-x fs-1"></i>
                <p class="fw-bold mb-1">A kosarad üres</p>
                <p class="text-secondary mb-3">Folytasd a vásárlást!</p>
                <a href="webshop.html" class="btn i-web">
                    <i class="bi bi-shop-window me-2"></i>Vásárlás folytatása
                </a>
            </div>`)
        $('#subtotal, #total').text('0 Ft')
        $('#discount').text('- 0 Ft')
        $btn.prop('disabled', true)
        return
    }

    var subtotal = 0
    var html = ''
    cart.forEach(function(item, i) {
        var qty = item.qty || 1
        subtotal += item.price * qty
        html += `
            <div class="cart-item">
                <img class="cart-item-img" src="${item.image || 'assets/img/BraVa.png'}" alt="${item.name}">
                <div class="cart-item-body">
                    <div class="cart-item-name fw-bold">${item.name}</div>
                    <div class="cart-item-brand small text-secondary mb-2">${item.brand || ''}</div>
                    <div class="d-flex align-items-center gap-3">
                        <div class="qty-control">
                            <button class="qty-btn" onclick="updateQty(${i}, -1)"><i class="bi bi-dash"></i></button>
                            <span class="qty-val fw-bold">${qty}</span>
                            <button class="qty-btn" onclick="updateQty(${i}, 1)"><i class="bi bi-plus"></i></button>
                        </div>
                        <span class="cart-item-price fw-bold">${formatPrice(item.price * qty)}</span>
                    </div>
                </div>
                <button class="remove-btn fs-5" onclick="removeItem(${i})" title="Eltávolítás">
                    <i class="bi bi-trash3"></i>
                </button>
            </div>`
    })

    $('#itemCount').text(`(${cart.length} termék)`)
    $items.html(html)
    $('#subtotal').text(formatPrice(subtotal))
    $('#discount').text(`- ${formatPrice(promoDiscount)}`)
    $('#total').text(formatPrice(Math.max(0, subtotal - promoDiscount)))
    $btn.prop('disabled', false)
}

function applyPromo() {
    var code = $('#promoInput').val().trim().toUpperCase()
    var $msg = $('#promoMsg')
    if (code === 'BRAVA10') {
        var subtotal = cart.reduce(function(s, item) { return s + item.price * (item.qty || 1) }, 0)
        promoDiscount = Math.round(subtotal * 0.1)
        promoApplied = true
        $msg.css('color', '#28a745').text('Kupon alkalmazva: 10% kedvezmény!')
        renderCart()
    } else {
        $msg.css('color', '#dc3545').text('Érvénytelen kuponkód.')
    }
}

$(document).ready(function() {
    renderCart()
    $('#promoToggle').on('click', function() {
        $('#promoBody').toggleClass('open')
        $('#promoChevron').toggleClass('bi-chevron-down bi-chevron-up')
    })
})
