var currentProduct = null
var currentImageIndex = 0

$(document).ready(function() {
    var productId = parseInt(new URLSearchParams(window.location.search).get('id'))
    currentProduct = products.find(function(p) { return p.id === productId })
    if (currentProduct) {
        renderProductDetail()
        setupScrollToTop()
    } else {
        window.location.href = 'webshop.html'
    }
    $('#addToCartBtn').on('click', function() {
        if (!currentProduct.stock) {
            showCartToast(currentProduct.name, false)
            return
        }
        addToCart(currentProduct)
    })
})

function renderProductDetail() {
    $('#productName').text(currentProduct.name)
    $('#productBrand').text(currentProduct.brand)
    $('#productPrice').text(formatPrice(currentProduct.price))
    $('#productShortDesc').text(currentProduct.shortDesc)
    $('#productLongDesc').text(currentProduct.longDesc)
    $('#breadcrumbProduct').text(currentProduct.name)
    $('#mainImage').attr('src', currentProduct.images[0])
    $('#stockStatus').html(currentProduct.stock
        ? '<span class="badge bg-success"><i class="bi bi-check-circle me-1"></i>Raktáron</span>'
        : '<span class="badge bg-danger"><i class="bi bi-x-circle me-1"></i>Nincs raktáron</span>'
    )
    renderThumbnails()
    renderSpecs()
}

function renderThumbnails() {
    var $container = $('#thumbnails').empty()
    $.each(currentProduct.images, function(index, img) {
        $container.append(
            $('<p class="bg-white">').append(
                $('<img>').attr({
                    src: img,
                    alt: 'Termék kép ' + (index + 1),
                    class: 'thumbnail' + (index === 0 ? ' active' : '')
                }).on('click', function() { changeMainImage(index) })
            )
        )
    })
}

function renderSpecs() {
    var $tbody = $('#specsTable tbody').empty()
    $.each(currentProduct.specs, function(key, value) {
        $tbody.append(
            $('<tr>').append(
                $('<td class="fw-bold" style="width:40%">').text(key),
                $('<td>').text(value)
            )
        )
    })
}

function changeMainImage(index) {
    currentImageIndex = index
    $('#mainImage').attr('src', currentProduct.images[index])
    $('.thumbnail').removeClass('active').eq(index).addClass('active')
}

function openLightbox(index) {
    currentImageIndex = index
    $('#lightboxImage').attr('src', currentProduct.images[index])
    updateImageCounter()
    $('#lightboxModal').modal('show')
}

function changeLightboxImage(direction) {
    currentImageIndex = (currentImageIndex + direction + currentProduct.images.length) % currentProduct.images.length
    $('#lightboxImage').attr('src', currentProduct.images[currentImageIndex])
    updateImageCounter()
}

function updateImageCounter() {
    $('#imageCounter').text(`${currentImageIndex + 1} / ${currentProduct.images.length}`)
}
