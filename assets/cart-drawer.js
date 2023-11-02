// console.log('Cart drawer contents goes here');



class CartDrawer extends HTMLElement {
    constructor() {
        super();

        this.cartDrawerToggle = document.querySelector('.section-header-cart-drawer-toggle');
        this.cartDrawer = this;
        this.cartDrawerClose = this.querySelector('.cart-drawer-close');
        this.cartDrawerOverlay = this.querySelector('.cart-drawer-overlay');
        this.cartDrawerEmptyRedirect = this.querySelector('.cart-drawer-empty-footer');

        this.cartDrawerToggle.addEventListener('click', (event) => this.onClick(event))

        this.cartDrawerClose.addEventListener('click', () => this.close())
        this.cartDrawerOverlay.addEventListener('click', () => this.close())

        if( this.cartDrawerEmptyRedirect ){
            this.cartDrawerEmptyRedirect.addEventListener('click', () => this.close())
        }

    }

    onClick(event) {
        event.preventDefault();

        this.open()
    }

    open() {
        this.cartDrawer.classList.add('active')
    }
    close() {
        this.cartDrawer.classList.remove('active')
    }

}

customElements.define('cart-drawer', CartDrawer);