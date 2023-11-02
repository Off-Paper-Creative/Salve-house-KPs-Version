
// Shopify editor functions on selecting any section
document.addEventListener('shopify:section:select', (event) => {
    const shopifyData = JSON.parse(event.target.dataset.shopifyEditorSection);

    let popupElementSectionId = '';

    document.querySelectorAll('.shopify-section-group-footer-group').forEach(footerBlock => {
        const shopifyFooterBlockData = JSON.parse(footerBlock.dataset.shopifyEditorSection);
        
        if( shopifyFooterBlockData.type == 'popup' ){
            popupElementSectionId = shopifyFooterBlockData.id;
        }
    })

    if( shopifyData.type !== 'popup' ){
        var popup = document.getElementById('shopify-section-' + popupElementSectionId);
        if( popup ){
            popup.classList.add('designMode-inactive');
        }
    }
    else{
        var popup = document.getElementById('shopify-section-' + popupElementSectionId);
        if( popup ){
            popup.classList.remove('designMode-inactive');
        }
    }

})

// Shopify editor functions after re-rendering
document.addEventListener('shopify:section:load', (event) => {
    // console.log("reloaded");

    // Carousel
    const carouselElements = document.querySelectorAll('.has-carousel');

    carouselElements.forEach(carouselElement => {
        // if (carouselElement.classList.contains('splide') && !carouselElement.classList.contains('product-gallery-images')) {
            // console.log("carousel element", carouselElement);
            let carouselOptions = null;
        
            if (carouselElement.dataset.options) {
                carouselOptions = JSON.parse(carouselElement.dataset.options);
            }

            carouselOptions['classes'] = {
                // Add classes for arrows.
                arrows: 'splide__arrows',
                arrow : 'splide__arrow',
                prev  : 'splide__arrow--prev',
                next  : 'splide__arrow--next',
        
                // // Add classes for pagination.
                // pagination: 'splide__pagination your-class-pagination', // container
                // page      : 'splide__pagination__page your-class-page', // each button
            };
            
            const splide = new Splide(carouselElement, {
                destroy: true
            });

            const newSplide = new Splide(carouselElement, carouselOptions);
            splide.mount();
            newSplide.mount();
        // }
    });


})