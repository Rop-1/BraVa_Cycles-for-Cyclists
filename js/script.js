$(document).ready(function() {
    var tema = localStorage.getItem('theme') || 'light'
    $('html').attr('data-theme', tema)
    if (tema === 'dark') $('.theme-toggle i').removeClass('bi-brightness-high-fill').addClass('bi-moon-stars-fill')
    updateCartBadge()

    if (!$('#cartToastContainer').length)
        $('body').append('<div id="cartToastContainer" class="toast-container position-fixed bottom-0 end-0 p-3" style="z-index:9999"></div>')

    if ($(window).width() < 992) {
        var $logo = $('header img').first()
        if ($logo.length)
            $('body').prepend('<div class="mobile-logo-container"><div class="mobile-logo"><img src="' + $logo.attr('src') + '" alt="' + $logo.attr('alt') + '" style="max-height:40px;width:auto"></div></div>')

        var utolsoScroll = 0
        $(window).on('scroll', function() {
            var s = $(this).scrollTop()
            if (s > 100 && s > utolsoScroll) {
                $('header').css('transform', 'translateY(-100%)')
                $('.mobile-logo-container').addClass('active')
            } else if (s < utolsoScroll) {
                $('header').css('transform', 'translateY(0)')
                if (s <= 100) $('.mobile-logo-container').removeClass('active')
            }
            utolsoScroll = s
        })

        $(document).on('touchstart', '.mobile-dropdown', function(e) {
            e.preventDefault()
            var $menu = $(this).find('.mobile-dropdown-menu')
            var nyitva = $menu.is(':visible')
            $('.mobile-dropdown-menu').hide()
            clearTimeout($(this).data('tapTimeout'))
            if (!nyitva) {
                $menu.show()
                $(this).data('tapTimeout', setTimeout(function() { $menu.hide() }, 3000))
            }
        })
        $(document).on('mouseleave', '.mobile-dropdown', function() {
            var $menu = $(this).find('.mobile-dropdown-menu')
            setTimeout(function() { $menu.hide() }, 300)
        })
        $(document).on('click', function(e) {
            if (!$(e.target).closest('.mobile-dropdown').length) $('.mobile-dropdown-menu').hide()
        })
    }

    var $btn = $('#scrollToTop')
    $(window).on('scroll', function() { $btn.toggleClass('show', $(this).scrollTop() > 300) })
    $btn.on('click', function() { $('html, body').animate({ scrollTop: 0 }, 600) })
})

function toggleTheme() {
    var uj = $('html').attr('data-theme') === 'dark' ? 'light' : 'dark'
    $('html').attr('data-theme', uj)
    localStorage.setItem('theme', uj)
    $('.theme-toggle i').toggleClass('bi-brightness-high-fill', uj === 'light').toggleClass('bi-moon-stars-fill', uj === 'dark')
}

function scrollCarousel(irany) {
    var $s = $('.carousel-scroll')
    $s.scrollLeft($s.scrollLeft() + irany * 300)
}

function goToProduct(id) { window.location.href = 'product.html?id=' + id }

function formatPrice(ar) {
    return new Intl.NumberFormat('hu-HU', { style: 'currency', currency: 'HUF', minimumFractionDigits: 0 }).format(ar)
}

function getCart() { return JSON.parse(localStorage.getItem('brava_cart') || '[]') }

function saveCart(cart) { localStorage.setItem('brava_cart', JSON.stringify(cart)); updateCartBadge() }

function addToCart(termek) {
    var cart = getCart()
    var meglevo = cart.find(function(i) { return i.id === termek.id })
    if (meglevo) {
        meglevo.qty = (meglevo.qty || 1) + 1
    } else {
        cart.push({ id: termek.id, name: termek.name, brand: termek.brand, price: termek.price, image: termek.images ? termek.images[0] : '', qty: 1 })
    }
    saveCart(cart)
    showCartToast(termek.name)
}

function updateCartBadge() {
    var db = getCart().reduce(function(s, i) { return s + (i.qty || 1) }, 0)
    $('.cart-badge').remove()
    if (db > 0)
        $('a[href="checkout.html"] .bi-cart').after('<span class="cart-badge align-items-center justify-content-center d-flex fw-bold rounded-circle">' + db + '</span>')
}

function showCartToast(nev, siker) {
    if (siker === undefined) siker = true
    var $t = $('<div class="toast align-items-center border-0 text-white" role="alert" aria-live="assertive" aria-atomic="true" style="background-color:' + (siker ? 'var(--success)' : 'var(--error)') + '">' +
        '<div class="d-flex"><div class="toast-body"><i class="bi ' + (siker ? 'bi-check-circle-fill' : 'bi-x-circle-fill') + ' me-2"></i><strong>' + nev + '</strong> ' + (siker ? 'kosárba került!' : 'nincs raktáron!') + '</div>' +
        '<button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button></div></div>')
    $('#cartToastContainer').append($t)
    var toast = new bootstrap.Toast($t[0], { delay: 2500 })
    toast.show()
    $t[0].addEventListener('hidden.bs.toast', function() { $t.remove() })
}