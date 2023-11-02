// console.log("cart goes here");


document.body.addEventListener('change', event => {
    // console.log("input changed", event);

    const productQty = event.target;

    var cartProductSelector = '.cart-product';

    if(productQty.closest(cartProductSelector)){
        // console.log("input is under cart ")

        let formData = {
            'id': productQty.closest(cartProductSelector).dataset.itemKey,
            'quantity': productQty.value
        };


        if( parseInt(formData['quantity']) > parseInt(productQty.getAttribute('max')) ){

            const product = productQty.closest('.cart-product');
            const productQtyPicker = productQty.closest('product-quantity-picker');
            const productTitle = product.querySelector('.cart-product-title').innerText;
            const textQtyError = productQty.dataset.textQtyError;

            const errorParagraph = productQtyPicker.nextElementSibling;
            const isErrorExist = errorParagraph.classList.contains('error')
            const newErrorHTML = '<p class="error">' + textQtyError.replace('%qty', productQty.getAttribute('max') + ' ' + productTitle + ' - ' + productQty.dataset.textVariant) + '</p>';

            if( isErrorExist ){
                errorParagraph.innerHTML = newErrorHTML;
            }
            else{
                productQtyPicker.insertAdjacentHTML('afterend', newErrorHTML)
            }

            return false;
        }


        
        fetchCartJson(formData);

    }
});

document.body.addEventListener('click', event => {

    var cartProductSelector = '.cart-product';
    var cartRemoveProductSelector = '.cart-product-remove';

    if(event.target.closest(cartRemoveProductSelector)){
        event.preventDefault();

        let formData = {
            'id': event.target.closest(cartProductSelector).dataset.itemKey,
            'quantity': 0
        };
        
        fetchCartJson(formData);

    }
});


function fetchCartJson(data){

    fetch(window.Shopify.routes.root + 'cart/change.js', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        return response.json();
    })
    .then(res => {
        // console.log("res", res);

        AjaxCartUpdate(res, data);


    })
    .catch((error) => {
        console.error('Error:', error);
    });

}


function AjaxCartUpdate(cart, data){

    var cart_count_elements = document.querySelectorAll('.cart-count');
    var cart_total_elements = document.querySelectorAll('.cart-total');
    var cart_discount_elements = document.querySelectorAll('.cart-discount');
    var cart_products = document.querySelectorAll('.cart-product');

    var qty_input = '.product-quantity-picker-input';
    var line_total_selector = '.cart-product-line-price';
    var original_line_total_selector = '.cart-product-original-line-price';


    // Count update
    for(let cart_count of cart_count_elements){
        cart_count.textContent = cart.item_count
    }

    // Total update
    for(let cart_total of cart_total_elements){
        var moneyFormat = document.body.dataset.moneyFormat;
        cart_total.textContent = Shopify.formatMoney(cart.total_price, moneyFormat)
    }

    // Discount update
    for(let cart_discount of cart_discount_elements){
        var moneyFormat = document.body.dataset.moneyFormat;
        cart_discount.textContent = Shopify.formatMoney(cart.total_discount, moneyFormat)
    }


    for( let cart_product of cart_products){
        var cart_product_qty = cart_product.querySelector(qty_input)
        var cart_product_line_total = cart_product.querySelector(line_total_selector)
        var cart_product_original_line_total = cart_product.querySelector(original_line_total_selector)

        cart.items.forEach(item=>{
            if( data.id === item.key && cart_product.dataset.itemKey === item.key ){

                // Qty update
                cart_product_qty.setAttribute('value', item.quantity);

                // Price update
                if( cart_product_line_total ){
                    cart_product_line_total.textContent = Shopify.formatMoney(item.line_price, moneyFormat)
                }
                if( cart_product_original_line_total ){
                    cart_product_original_line_total.textContent = Shopify.formatMoney(item.original_line_price, moneyFormat)
                }
            }
        })

        // Remove product
        if( data.quantity == 0 && data.id === cart_product.dataset.itemKey ){
            cart_product.remove()
        }
    }

}
