$(document).ready(function() {
    var savedTheme = localStorage.getItem('theme') || 'light'
    $('html').attr('data-theme', savedTheme)
    if (savedTheme === 'dark') {
        $('.theme-toggle i').removeClass('bi-brightness-high-fill').addClass('bi-moon-stars-fill')
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

$(document).ready(function() {
    if ($(window).width() >= 992) return

    var $originalLogo = $('header img').first()
    if ($originalLogo.length) {
        var $logoContainer = $('<div class="mobile-logo-container">').append(
            $('<div class="mobile-logo">').append(
                $('<img>').attr({ src: $originalLogo.attr('src'), alt: $originalLogo.attr('alt') })
                    .css({ maxHeight: '40px', width: 'auto' })
            )
        )
        $('body').prepend($logoContainer)
    }

    var lastScrollTop = 0
    $(window).on('scroll', function() {
        var scrollTop = $(this).scrollTop()
        if (scrollTop > 100 && scrollTop > lastScrollTop) {
            $('header').css('transform', 'translateY(-100%)')
            $('.mobile-logo-container').addClass('active')
        } else if (scrollTop < lastScrollTop) {
            $('header').css('transform', 'translateY(0)')
            if (scrollTop <= 100) {
                $('.mobile-logo-container').removeClass('active')
            }
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
})
