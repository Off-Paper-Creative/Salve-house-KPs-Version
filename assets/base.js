// console.log('base js')

var Shopify = Shopify || {};
// ---------------------------------------------------------------------------
// Money format handler
// ---------------------------------------------------------------------------
Shopify.money_format = "${{amount}}";
Shopify.formatMoney = function(cents, format) {
  if (typeof cents == 'string') { cents = cents.replace('.',''); }
  var value = '';
  var placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
  var formatString = (format || this.money_format);

  function defaultOption(opt, def) {
     return (typeof opt == 'undefined' ? def : opt);
  }

  function formatWithDelimiters(number, precision, thousands, decimal) {
    precision = defaultOption(precision, 2);
    thousands = defaultOption(thousands, ',');
    decimal   = defaultOption(decimal, '.');

    if (isNaN(number) || number == null) { return 0; }

    number = (number/100.0).toFixed(precision);

    var parts   = number.split('.'),
        dollars = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1' + thousands),
        cents   = parts[1] ? (decimal + parts[1]) : '';

    return dollars + cents;
  }

  switch(formatString.match(placeholderRegex)[1]) {
    case 'amount':
      value = formatWithDelimiters(cents, 2);
      break;
    case 'amount_no_decimals':
      value = formatWithDelimiters(cents, 0);
      break;
    case 'amount_with_comma_separator':
      value = formatWithDelimiters(cents, 2, '.', ',');
      break;
    case 'amount_no_decimals_with_comma_separator':
      value = formatWithDelimiters(cents, 0, '.', ',');
      break;
    case 'amount_with_apostrophe_separator':
      value = formatWithDelimiters(cents, 0, '\'', '.');
    break;
  }

  return formatString.replace(placeholderRegex, value);
};


// Product quantity picker
class ProductQuantityPicker extends HTMLElement{
    constructor(){
        super();

        var productQualityPickerSpan = this.querySelectorAll('span');

        for(let qualityCounter of productQualityPickerSpan){
            qualityCounter.addEventListener('click', (event) => this.onClick(event, qualityCounter))
            qualityCounter.addEventListener('keypress', (event) => this.onClick(event, qualityCounter))
            
        }

    }

    onClick = (event, qualityCounter) => {

        var isKeypressValid = event.type == 'keypress' && event.key === 'Enter'

        if( !(event.type == 'click' || isKeypressValid) ){
            return false;
        }

        var qtyInput = this.querySelector('input');
        var qtyInputValue = qtyInput.value //qtyInput.getAttribute('value');
        var qtyInputMin = parseInt(qtyInput.getAttribute('min'));
        var qtyInputMax = parseInt(qtyInput.getAttribute('max'));

        if( qualityCounter.classList.contains('qty-minus') ){
            if( isNaN(qtyInputMin) || qtyInputMin < qtyInputValue ){
                qtyInputValue--
            }
        }
        if( qualityCounter.classList.contains('qty-plus') ){
            if( isNaN(qtyInputMax) || qtyInputMax > qtyInputValue ){
                qtyInputValue++
            }
        }

        qtyInput.value = qtyInputValue;
        qtyInput.dispatchEvent(new Event('change', { bubbles: true }));


        // console.log("quantity", qtyInput.getAttribute('value'), qtyInputValue)
    }
}

customElements.define( 'product-quantity-picker', ProductQuantityPicker );


// Search Dropdown
class SearchDropdown extends HTMLElement {
    constructor() {
        super();

        this.dropdownToggle = this.querySelector('.search-dropdown-toggle');
        this.dropdownContents = this.querySelector('.search-dropdown-container');
        this.searchField = this.querySelector('input[type="search"]');
        this.dropdownClose = this.querySelector('.search-dropdown-close');
        // console.log("search dropdown called");

        this.dropdownToggle.addEventListener('click', (e) => {
            e.preventDefault();

            this.onClick(e)
        });

        this.dropdownClose.addEventListener('click', () => this.close())
        // this.dropdownToggle.addEventListener('click', () => { this.searchField.focus() });

        document.addEventListener('click', (event) => {
            if (event.target !== this && !this.contains(event.target)) {
                this.close()
            }
        })
    }

    onClick(e) {
        // e.stopPropagation();

        // console.log("dropdown", e.target)

        if( !this.classList.contains('active') ){
            this.open();

            setTimeout(() => {
                this.searchField.focus()
            }, 100);
        }
        else{
            this.close();
        }
    }

    open() {
        this.classList.add('active');
    }

    close() {
        this.classList.remove('active');
    }
}

customElements.define('search-dropdown', SearchDropdown);


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
        
        const splide = new Splide(carouselElement, carouselOptions);
        splide.mount();
    // }
});


// Popup modal
class PopupModal extends HTMLElement{
    constructor(){
        super();

        this.popupCloseButton = this.querySelector('.popup-modal__close');
        this.popupOverlay = this.querySelector('.popup-modal__overlay');


        this.popupCloseButton.addEventListener('click', () => {
            this.onClose();
        })

        this.popupOverlay.addEventListener('click', () => {
            this.onClose();
        })


        if( this.dataset.popupType == 'onload' ){
            this.handleOnLoadPopup();

            this.sectionPopupClose = this.querySelector('.section-popup-button-close');

            if( this.sectionPopupClose ){
                this.sectionPopupClose.addEventListener('click', (e) => {
                    e.preventDefault();
                    
                    this.onClose();
                })
            }
            
        }


    }

    onClose(){
        // this.remove();
        this.classList.add('inactive');
        this.classList.remove('quickview-modal');
        
        this.querySelector('.popup-modal__content').innerHTML = '';
    }


    handleOnLoadPopup = () => {
        // console.log("its newsletter popup");

        this.style.display = null;

        var expireOn = parseInt(this.dataset.popupExpiry);
        var delay = this.dataset.popupDelay;
        var cookieName = this.dataset.popupCookieName;
        var frequency = 1;
        
        var visits = 0;
        if( Cookies.get(cookieName) ){
            visits = Cookies.get(cookieName);
        }
        visits++;

        Cookies.set(cookieName, visits, { expires: expireOn, path: '/' });

        if (Cookies.get(cookieName) > frequency) {

            this.onClose();
        }
        else {
            window.onload = setTimeout( () => {
                this.classList.remove('inactive');
            }, delay )
        }


    }
}

customElements.define('popup-modal', PopupModal)

// Quickview
document.addEventListener('click', (e) => {
    if( e.target.classList.contains('product-quickview') ){
        var productQuickview = e.target; 

        var handle = productQuickview.dataset.handle


        productQuickview.classList.add('loading');


        var popupModal = document.querySelector('.popup-modal');

        if( !popupModal ){
            var quickviewModalString = `<popup-modal class="popup-modal">
            <div class="popup-modal__overlay"></div>
            <div class="popup-modal__inner">
                <div class="popup-modal__content">
                </div>
                <button class="popup-modal__close">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <line x1="1.11092" y1="0.610962" x2="8.88909" y2="8.38914" stroke="#171813" stroke-linecap="round"/>
                        <line x1="1.11096" y1="8.38915" x2="8.88914" y2="0.610971" stroke="#171813" stroke-linecap="round"/>
                    </svg>
                </button>
            </div>
            </popup-modal>
                          `
            var quickviewModal = new DOMParser().parseFromString(quickviewModalString, 'text/html').querySelector('popup-modal')

            document.body.append(quickviewModal);
        }
        else{
            popupModal.classList.remove('inactive');
            popupModal.classList.remove('section-popup');
            popupModal.classList.add('quickview-modal');
        }



        fetch(`${window.Shopify.routes.root}products/${handle}?view=quickview`)
        // fetch(`${window.Shopify.routes.root}products/${handle}?view=quickview&section_id=quickview`)
            .then((response) => {
                // console.log("res", response)
                if (!response.ok) {
                    var error = new Error(response.status);
                    throw error;
                }

                return response.text();
            })
            .then((res) => {
                // console.log("res", res);

                productQuickview.classList.remove('loading');

                // var html = new DOMParser().parseFromString(res, 'text/html').querySelector('.shopify-section');
                var html = new DOMParser().parseFromString(res, 'text/html').querySelector('.main-product');
                
                // console.log("html", html)


                html.classList.add('quickview-product')
                html.classList.remove('main-product');


                var productInfoButtons = html.querySelectorAll('.product-info-popup__button');
                for( let productInfoButton of productInfoButtons ){
                    productInfoButton.setAttribute('target', '_blank');
                }

                var popupModalContent = document.querySelector('.popup-modal__content');
                popupModalContent.append(html);

                if (window.Shopify && Shopify.PaymentButton) {
                    Shopify.PaymentButton.init();
                }
                



            })
            .catch((error) => {
                throw error;
            });

    }
})


// Shoppable Pins 

class ShoppablePins extends HTMLElement {
    constructor(){
        super();


        this.product = this.querySelector('.section-image-pins-list-item-product');

        var pin = this.querySelector('.section-image-pins-list-item-pin');
        
        pin.addEventListener('click', (event) => {
            // var this = pin.parentNode
            // console.log("pin parent", this);
            // console.log("pin clicked", this.classList.contains('active'));
            this.classList.contains('active') ? this.close() : this.open(event)
        })
    
    
        document.addEventListener('click', (event) => {

            if (event.target !== this && !this.contains(event.target)) {
                this.close()
            }
        })
    }


    // open() {
    //     this.product.style.display = 'block';

    //     setTimeout(() => {
    //         this.classList.add('active')
    //     }, 50);
    // }
    // close() {
    //     this.classList.remove('active')

    //     setTimeout(() => {
    //         this.product.style.display = 'none';
    //     }, 300);
    // }

    open(event) {

        this.product.style.display = 'block';

        var panelHeight = this.product.offsetHeight;
        var panelWidth = this.product.offsetWidth;
        var x = event.clientX, 
        y = event.clientY;

        
        if( (window.innerHeight - y) > panelHeight ){
            this.product.classList.add('place-below');
        }
        else if( y > panelHeight ){
            this.product.classList.add('place-above');
        }
        else{
            this.product.classList.add('place-center');
        }


        if( (window.innerHeight - x) > panelWidth ){
            this.product.classList.add('place-right');
        }
        else if( y > panelWidth ){
            this.product.classList.add('place-left');
        }
        else{
            this.product.classList.add('place-center');
        }

        setTimeout(() => {
            this.classList.add('active')
        }, 50);
        // this.classList.add('active');

    }

    close() {
        this.classList.remove('active');


        setTimeout(() => {
            this.product.classList.remove('place-above', 'place-below', 'place-center', 'place-left', 'place-right');
            this.product.style.display = 'none';
        }, 300);
    }

}
customElements.define('shoppable-pin', ShoppablePins)



function AjaxProductUpdate(product, data){

    var cartCountElements = document.querySelectorAll('.cart-count');
    var cartDrawerSelector = '.cart-drawer-inner';

    // Count update
    for(let cart_count of cartCountElements){
        var totalCount = parseInt(data['quantity']);
        
        if(cart_count.textContent){
            totalCount = parseInt(cart_count.textContent) + parseInt(data['quantity'])
        }
        
        cart_count.textContent = totalCount
        // cart_count.textContent = product.item_count
    }

    // Drawer update
    var cartDrawer = product.sections['cart-drawer'];
    var cartDrawerInnerDOM = new DOMParser().parseFromString(cartDrawer, 'text/html').querySelector(cartDrawerSelector);

    var cartDrawerInner = document.querySelector('.cart-drawer-inner');
    if( cartDrawerInner ){
        cartDrawerInner.replaceWith(cartDrawerInnerDOM);
    }

}


// Product add to cart Ajax
document.body.addEventListener('click', event => {

    let productAddToCartSelector = '.product-add-to-cart';
    let productAddToCart = event.target.closest(productAddToCartSelector);

    if( productAddToCart && !productAddToCart.hasAttribute('disabled') ){
        event.preventDefault();

        let cartDrawerSelector = 'cart-drawer';
        let addToCartForm = event.target.closest('form[action$="/cart/add"]');

        let productSummary = productAddToCart.closest('.product-summary');
        let productSummaryTitle = productSummary.querySelector('.product-summary__title');
        let productSummaryAction = productSummary.querySelector('.product-summary__action');
        let productQty = productSummary.querySelector('input[name="quantity"]');

        let formData = new FormData(addToCartForm);
        let data = Object.fromEntries(formData.entries());

        // data['sections'] = [
        //     cartDrawerSelector
        // ];
        formData.append(
            'sections',
            cartDrawerSelector
        );

        if( parseInt(data['quantity']) > parseInt(productQty.getAttribute('max')) ){

            let productSelect = addToCartForm.querySelector('select');
            
            if( productSummaryAction.firstElementChild.classList.contains('error') ){
                let errorParagraph = productSummaryAction.firstElementChild;
                errorParagraph.innerHTML = productAddToCart.dataset.textQtyError.replace('%qty', productQty.getAttribute('max') + ' ' + productSummaryTitle.innerText + ' - ' + productSelect.options[productSelect.selectedIndex].textContent.trim());
            }
            else{
                let errorParagraph = document.createElement('p');
                errorParagraph.classList.add('error');
                errorParagraph.innerHTML = productAddToCart.dataset.textQtyError.replace('%qty', productQty.getAttribute('max') + ' ' + productSummaryTitle.innerText + ' - ' + productSelect.options[productSelect.selectedIndex].textContent.trim());
                productSummaryAction.prepend( errorParagraph )
            }

            return false;
        }

        // console.log("data", data);

        // Recipient Form 
        var recipientForm = productSummary.querySelector('.recipient-form');
        if( recipientForm ){
            var recipientFormErrors = recipientForm.querySelector('.recipient-form-errors');
            var isRecipientFormEnabled = productSummary.querySelector('.recipient-form-toggle input:checked') ? true : false;
            var recipientFormInputs = recipientForm.querySelectorAll('.recipient-form-fields--field');

            // console.log("checked togggle", isRecipientFormEnabled);

            if( isRecipientFormEnabled ){
                var errors = [];
                recipientFormInputs.forEach(formInput => {
                    // console.log("form input", formInput);
                    if( formInput.classList.contains('required') ) {
                        // console.log("form input", formInput);

                        if( formInput.getAttribute('type') == 'email' ){
                            var pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                            var formInputValue = formInput.value;
                            // console.log( "Email validation", pattern.test(formInputValue) );

                            if( !pattern.test(formInputValue) ){
                                errors.push('Enter a valid email address');

                            }
                        }
                    }
                    if( formInput.getAttribute('type') == 'date' ){
                        // console.log("difference", new Date().toString(), new Date(Date.parse(formInput.value)))
                        
                        var timeDiff = new Date(Date.parse(formInput.value)).getTime() - new Date().getTime();
                        var daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

                        if( daysDiff < 0 || daysDiff > 90 ){
                            errors.push('Enter a valid date (not longer than 90 days from now)');
                        }
                        
                    }
                });
                // console.log("errors", errors);
                if( errors.length > 0 ){
                    var errorElements = errors.map(function(element) {
                        return `<li>${element}</li>`;
                    });

                    recipientFormErrors.innerHTML = errorElements.join("");

                    return false;

                }
            }
        }


        fetch(`${window.Shopify.routes.root}cart/add`, {
            method: 'POST',
            headers: { 'X-Requested-With': 'XMLHttpRequest', 'Accept': 'application/javascript' },
            // body: JSON.stringify(data)
            body: formData
        })
        .then(response => {
            // console.log("response errors", response.text());
            
            return response.json();
        })
        .then(res => {
            // console.log("res", res);
            if (res.status == 422) {
                if( productSummaryAction.firstElementChild.classList.contains('error') ){
                    let errorParagraph = productSummaryAction.firstElementChild;
                    errorParagraph.innerHTML = res.description;
                }
                else{
                    let errorParagraph = document.createElement('p');
                    errorParagraph.classList.add('error');
                    errorParagraph.innerHTML = res.description;
                    productSummaryAction.prepend( errorParagraph )
                }

                return false;
            }


            AjaxProductUpdate(res, data);

            // Drawer show
            let cartDrawer = document.querySelector('cart-drawer');
            if( cartDrawer ){
                cartDrawer.classList.add('active');
            }

            // Popup (Quickview) hide
            let popupModal = document.querySelector('popup-modal');
            if( popupModal ){
                popupModal.classList.add('inactive');
                popupModal.querySelector('.popup-modal__content').innerHTML = '';
            }
        })
        .catch((error) => {
            console.error(error);
        });


    }

});

class ProductVariantsSelectors extends HTMLElement{
    constructor(){
        super();

        const url = window.location.search;
        const urlParams = new URLSearchParams(url);
        const currentVariant = urlParams.get('variant');


        this.productVariantSelectors = this.querySelectorAll('select');

        this.productVariantSelectors.forEach(variant => { 

            if( currentVariant && currentVariant != '' ){
                const variantId = variant.options[variant.selectedIndex].value;

                if( variantId == currentVariant ){

                    this.onVariantChange(variant);
                }
            }
            
            variant.addEventListener('change', (event) => {
                this.onVariantChange(variant);
            })
        })
        
    }

    onVariantChange = (productVariantSelector) => {

        const variantId = productVariantSelector.options[productVariantSelector.selectedIndex].value;
        const summarySelector = '.product'

        // console.log("variant change triggered", variantId);


        var productAddtocartElement = productVariantSelector.closest(summarySelector).querySelector('.product-add-to-cart');
        var productQtyElement = productVariantSelector.closest(summarySelector).querySelector('.product-inventory-qty');
        var productPriceElement = productVariantSelector.closest(summarySelector).querySelector('.product-price')

        if( variantId == 'none' ){

            productAddtocartHtml = '<span>' + productAddtocartElement.dataset.textUnavailable + '</span>'
            productAddtocartElement.disabled = true

            productAddtocartElement.innerHTML = productAddtocartHtml;
            productQtyElement.innerHTML = '';
            productPriceElement.classList.add('hide');
            // productQtyElement.classList.add('hide');

            return false;
        }
        else{
            // productQtyElement.classList.remove('hide');
            productPriceElement.classList.remove('hide');
        }

        
        // fetch(`${window.Shopify.routes.root}variants/${variantId}?section_id=product-variant-image`)
        // .then(response => response.text())
        // .then(res => {
        //     console.log("res", res)
        // })
        // .catch(error => {
        //     console.error(error);
        // })


        fetch(`/variants/${variantId}.json`)
        .then(response => response.json())
        .then(res => {
            // console.log("res", res)
            const productVariant = res.product_variant
            
            const comparePriceValue = productVariant.compare_at_price;
            const priceValue = productVariant.price;
            const unitPriceValue = productVariant.unit_price;

            const comparePrice = Shopify.formatMoney(comparePriceValue, moneyFormat);
            const price = Shopify.formatMoney(priceValue, moneyFormat);
            const unitPrice = Shopify.formatMoney(unitPriceValue, moneyFormat);


            var productPriceElement = productVariantSelector.closest(summarySelector).querySelector('.product-price')
            var priceElement = productVariantSelector.closest(summarySelector).querySelector('[data-price]');
            var comparePriceElement = productVariantSelector.closest(summarySelector).querySelector('[data-price-compare]');
            var unitPriceWrapperElement = productVariantSelector.closest(summarySelector).querySelector('.product-price-unit')
            
            var saleBadgeElement = productVariantSelector.closest(summarySelector).querySelector('.product-sale-badge');

            var productPriceText = productPriceElement.dataset.textSale

            // Change price
            priceElement.innerText = price;

            if( comparePriceValue ){

                // Add Sale badge if not exist
                if( !saleBadgeElement ){
                    var newSaleBadgeElement = document.createElement('span');
                    newSaleBadgeElement.classList.add('product-sale-badge');
                    newSaleBadgeElement.innerHTML = productPriceText
                    productPriceElement.prepend(newSaleBadgeElement)
                }

                // Change compare price
                comparePriceElement.innerText = comparePrice;
            }
            else{
                // Remove sale badge if exist
                if( saleBadgeElement ){
                    saleBadgeElement.remove();
                }

                // Remove compare price
                if( comparePriceElement ){
                    comparePriceElement.innerText = '';
                }
            }


            // Change unit price
            if( unitPriceValue ){

                const refValue = productVariant.unit_price_measurement.reference_value
                const refUnit = productVariant.unit_price_measurement.reference_unit

                var unitPriceSelector = 'data-price-unit-price';
                var unitBaseSelector = 'data-price-unit-base';

                var unitPriceElement = productVariantSelector.closest(summarySelector).querySelector('[' + unitPriceSelector + ']');
                var unitBaseElement = productVariantSelector.closest(summarySelector).querySelector('[' + unitBaseSelector + ']');

                // newSaleBadgeElement.innerHTML = productPriceText
                // productPriceElement.prepend(newSaleBadgeElement)

                if( unitPriceWrapperElement ){

                    unitPriceElement.innerHTML = unitPrice

                    // Change unit ref
                    unitBaseElement.innerHTML = ( refValue > 1 ) ? refValue + refUnit : refUnit
                }
                else{
                    var newUnitPriceWrapperElement = document.createElement('span');
                    var newUnitPriceElement = document.createElement('span');
                    var newUnitBaseElement = document.createElement('span');

                    newUnitPriceElement.setAttribute(unitPriceSelector, '')
                    newUnitBaseElement.setAttribute(unitBaseSelector, '')

                    newUnitPriceElement.innerHTML = unitPrice

                    // Change unit ref
                    newUnitBaseElement.innerHTML = ( refValue > 1 ) ? refValue + refUnit : refUnit

                    newUnitPriceWrapperElement.classList.add('product-price-unit');
                    newUnitPriceWrapperElement.append(newUnitPriceElement);
                    newUnitPriceWrapperElement.append('/');
                    newUnitPriceWrapperElement.append(newUnitBaseElement);
                    productPriceElement.append(newUnitPriceWrapperElement)

                }
            }
            else{
                // Remove unit price wrapper
                if( unitPriceWrapperElement ){
                    unitPriceWrapperElement.remove();
                }
            }

        })
        .catch(e => {
            console.error(e);
        });


        // var selectedIndex = productVariantSelector.selectedIndex;
        // var variantId = productVariantSelector[selectedIndex].getAttribute('value');

        var select = productVariantSelector.closest(summarySelector).querySelector('.product-variants-selector > select');
        var productQtyInput = productVariantSelector.closest(summarySelector).querySelector('.product-quantity-picker-input');
        var productQtyElement = productVariantSelector.closest(summarySelector).querySelector('.product-inventory-qty');
        var productAddtocartElement = productVariantSelector.closest(summarySelector).querySelector('.product-add-to-cart');
        var moneyFormat = document.body.dataset.moneyFormat;

        var productStockHtml = '';
        var productAddtocartHtml = '';

        var productStockQty = select[select.selectedIndex].dataset.inventoryQuantity
        var productStockManagement = select[select.selectedIndex].dataset.inventoryManagement
        var productStockPolicy = select[select.selectedIndex].dataset.inventoryPolicy
        





        if( productStockQty != 0 && productStockManagement != '' ){
            productQtyInput.setAttribute('max', productStockQty );
        }
        else if( productStockManagement == '' ){
            productQtyInput.removeAttribute('max');
        }
        

        if( productStockQty != 0 ){
            var lowStockThreshold = productQtyElement.dataset.lowStockThreshold;

            if( lowStockThreshold >= productStockQty ){
                productStockHtml = '<p class="low">' + productQtyElement.dataset.textLowStock.replace('%s', productStockQty) + '</p>'
            }
            else if (productStockManagement != '' && productStockPolicy != 'continue'){
                productStockHtml = '<p class="normal">' + productQtyElement.dataset.textInStock.replace('%s', productStockQty) + '</p>'
            }
            else{
                productStockHtml = '<p class="normal">' + productQtyElement.dataset.textInStockNoTrack + '</p>'
            }

        }
        else if( productStockQty == 0 && productStockManagement == '' ){
            productStockHtml = '<p class="normal">' + productQtyElement.dataset.textInStockNoTrack + '</p>'
        }
        else{
            productStockHtml = '<p class="sold">' + productQtyElement.dataset.textSold.replace('%s', productStockQty) + '</p>'
        }

        if( productStockQty != 0 || productStockManagement == '' ){
            productAddtocartHtml = '<span>' + productAddtocartElement.dataset.textAddToCart + '</span>';
            productAddtocartElement.disabled = false
        }
        else{
            productAddtocartHtml = '<span>' + productAddtocartElement.dataset.textSoldOut + '</span>'
            productAddtocartElement.disabled = true
        }
        // console.log("stock html", productStockHtml, "add to cart html", productAddtocartHtml);

        productQtyElement.innerHTML = productStockHtml
        productAddtocartElement.innerHTML = productAddtocartHtml




        // Changing image
        var productThumbails = productVariantSelector.closest(summarySelector).querySelectorAll('.product-image-has-variant-ids')

        for (let thumbnail of productThumbails){
            const imageVariantIds = thumbnail.dataset.variantIds
            // console.log("image variant ids", imageVariantIds);
            if( imageVariantIds.includes(variantId) ){
                // console.log("missing")
                thumbnail.dispatchEvent(new Event('click'));
            }
        }

    }
}
customElements.define('product-variants-selector', ProductVariantsSelectors)

// var productVariantSelectors = document.querySelectorAll('.product-variants-selector > select')
// if( productVariantSelectors ){
//     productVariantSelectors.forEach(variant => { 
//         variant.addEventListener('change', (event) => {
//             onVariantChange(variant);
//         })
//     })
// }



// var collectionTitles = document.querySelectorAll('.section-collections-links-collection__title');

// for(var title of collectionTitles){
//     title.addEventListener('mousemove', function(){
//         console.log("title", title.nextElementSibling)
//     })
// }

document.addEventListener("mousemove", function(event){
    if( event.target.classList.contains('collection-title') ){
        var collectionImage = event.target.nextElementSibling;
        if( collectionImage ){
            
            // setTimeout(()=> {
                event.target.nextElementSibling.style.left = event.offsetX + "px";
                event.target.nextElementSibling.style.top = event.offsetY + "px";
            // }, 20)
        }
    } 
});

// Video player controls
var videoPlay = document.querySelectorAll('.video-play');

videoPlay.forEach(button => {
    button.addEventListener('click', function(e){
        var player = button.closest('.video-player');
        var playerVideo = player.querySelector('video');
        var playerIframe = player.querySelector('iframe');

        if( playerVideo ){
            playerVideo.play();
        }

        if( playerIframe ){
            playerIframe.setAttribute('src', playerIframe.getAttribute('src') + '?autoplay=1')
        }

        player.classList.add('playing');

    })
})



// Collapsible row
class CollapsibleRow extends HTMLElement{
    constructor(){
        super();

        this.detectDefaultTab();

        this.querySelector('.collapsible-row__title').addEventListener('click', () => {
            this.onClick();
        })

        
    }

    detectDefaultTab = () => {
        if( this.classList.contains('active_by_default') ){
            var collapsibleContent = this.querySelector('.collapsible-row__content');
            var collapsibleContentHeight = collapsibleContent.offsetHeight;
            collapsibleContent.style.height = collapsibleContentHeight + 'px';
            this.classList.remove('active_by_default');
        }   
    }

    onClick = () => {

        // var productCollapsibleRow = event.target.closest('collapsible-row');
        var productCollapsibleRow = this.closest('collapsible-row');
        var collapsibleContent = productCollapsibleRow.querySelector('.collapsible-row__content');
        var collapsibleContentHeight = collapsibleContent.offsetHeight;

        if( productCollapsibleRow.classList.contains('active') ){
            collapsibleContent.style.removeProperty('height');
            setTimeout(function(){
                productCollapsibleRow.classList.remove('active');
            }, 200)
        }
        else{
            productCollapsibleRow.classList.add('active');
            setTimeout(function(){
                collapsibleContent.style.height = collapsibleContentHeight + 'px';
            }, 10)
        }
    }

}
customElements.define('collapsible-row', CollapsibleRow)





// document.querySelectorAll('img').forEach(

//   (el) => {
//     // el.wrap('div');
//     var newParentNode = document.createElement('div');
//     var newNode = document.createElement('div');
//     newNode.classList.add('dummy-placeholder');
//     newNode.style.backgroundColor = '#d0d0d0';
//     newNode.style.position = 'absolute';
//     newNode.style.inset = 0;
//     // newParentNode.innerHTML = newNode;
//     newParentNode.appendChild(newNode);
//     newParentNode.style.position = 'relative';
//     newParentNode.style.width = '100%';
//     newParentNode.style.height = '100%';
//     newParentNode.style.aspectRatio = 1;
//     el.replaceWith(newParentNode);
//   }
// );