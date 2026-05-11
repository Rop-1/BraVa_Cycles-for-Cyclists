$(document).ready(function() {
    var savedTheme = localStorage.getItem('theme') || 'light'
    $('html').attr('data-theme', savedTheme)
    if (savedTheme === 'dark') {
        $('.theme-toggle i').removeClass('bi-brightness-high-fill').addClass('bi-moon-stars-fill')
    }
    updateCartBadge()

    if (!$('#cartToastContainer').length) {
        $('body').append('<div id="cartToastContainer" class="toast-container position-fixed bottom-0 end-0 p-3" style="z-index:9999"></div>')
    }

    if ($(window).width() < 992) {
        var $originalLogo = $('header img').first()
        if ($originalLogo.length) {
            $('body').prepend(
                $('<div class="mobile-logo-container">').append(
                    $('<div class="mobile-logo">').append(
                        $('<img>').attr({ src: $originalLogo.attr('src'), alt: $originalLogo.attr('alt') })
                            .css({ maxHeight: '40px', width: 'auto' })
                    )
                )
            )
        }
        var lastScrollTop = 0
        $(window).on('scroll', function() {
            var scrollTop = $(this).scrollTop()
            if (scrollTop > 100 && scrollTop > lastScrollTop) {
                $('header').css('transform', 'translateY(-100%)')
                $('.mobile-logo-container').addClass('active')
            } else if (scrollTop < lastScrollTop) {
                $('header').css('transform', 'translateY(0)')
                if (scrollTop <= 100) $('.mobile-logo-container').removeClass('active')
            }
            lastScrollTop = scrollTop
        })
        $(document).on('touchstart', '.mobile-dropdown', function(e) {
            e.preventDefault()
            var $menu = $(this).find('.mobile-dropdown-menu')
            var isOpen = $menu.is(':visible')
            $('.mobile-dropdown-menu').hide()
            clearTimeout($(this).data('tapTimeout'))
            if (!isOpen) {
                $menu.show()
                $(this).data('tapTimeout', setTimeout(function() { $menu.hide() }, 3000))
            }
        })
        $(document).on('mouseleave', '.mobile-dropdown', function() {
            var $menu = $(this).find('.mobile-dropdown-menu')
            setTimeout(function() { $menu.hide() }, 300)
        })
        $(document).on('click', function(e) {
            if (!$(e.target).closest('.mobile-dropdown').length) {
                $('.mobile-dropdown-menu').hide()
            }
        })
    }
})

function toggleTheme() {
    var newTheme = $('html').attr('data-theme') === 'dark' ? 'light' : 'dark'
    $('html').attr('data-theme', newTheme)
    localStorage.setItem('theme', newTheme)
    $('.theme-toggle i')
        .toggleClass('bi-brightness-high-fill', newTheme === 'light')
        .toggleClass('bi-moon-stars-fill', newTheme === 'dark')
}

function scrollCarousel(irany) {
    var $scroll = $('.carousel-scroll')
    $scroll.scrollLeft($scroll.scrollLeft() + irany * 300)
}

function goToProduct(id) {
    window.location.href = 'product.html?id=' + id
}

function setupScrollToTop() {
    var $btn = $('#scrollToTop')
    $(window).on('scroll', function() {
        $btn.toggleClass('show', $(this).scrollTop() > 300)
    })
    $btn.on('click', function() {
        $('html, body').animate({ scrollTop: 0 }, 600)
    })
}

function formatPrice(price) {
    return new Intl.NumberFormat('hu-HU', {
        style: 'currency',
        currency: 'HUF',
        minimumFractionDigits: 0
    }).format(price)
}

function getCart() {
    return JSON.parse(localStorage.getItem('brava_cart') || '[]')
}

function saveCart(cart) {
    localStorage.setItem('brava_cart', JSON.stringify(cart))
    updateCartBadge()
}

function addToCart(product) {
    var cart = getCart()
    var existing = cart.find(function(item) { return item.id === product.id })
    if (existing) {
        existing.qty = (existing.qty || 1) + 1
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            brand: product.brand,
            price: product.price,
            image: product.images ? product.images[0] : '',
            qty: 1
        })
    }
    saveCart(cart)
    showCartToast(product.name)
}

function updateCartBadge() {
    var count = getCart().reduce(function(s, item) { return s + (item.qty || 1) }, 0)
    $('.cart-badge').remove()
    if (count > 0) {
        $('a[href="checkout.html"] .bi-cart').after(`<span class="cart-badge">${count}</span>`)
    }
}

function showCartToast(name, success) {
    if (success === undefined) success = true
    var $toast = $(`
        <div class="toast align-items-center border-0 text-white" role="alert" aria-live="assertive" aria-atomic="true"
             style="background-color: ${success ? 'var(--success)' : 'var(--error)'}">
            <div class="d-flex">
                <div class="toast-body">
                    <i class="bi ${success ? 'bi-check-circle-fill' : 'bi-x-circle-fill'} me-2"></i>
                    <strong>${name}</strong> ${success ? 'kosárba került!' : 'nincs raktáron!'}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        </div>`)
    $('#cartToastContainer').append($toast)
    var toast = new bootstrap.Toast($toast[0], { delay: 2500 })
    toast.show()
    $toast[0].addEventListener('hidden.bs.toast', function() { $toast.remove() })
}
