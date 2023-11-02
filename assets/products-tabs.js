
class ProductsTabs extends HTMLElement {

    constructor() {
        super();

        this.productsTabsList = this.querySelectorAll( '.section-featured-products-tabs-header__list li' );
        this.productsTabsContent = this.querySelectorAll( '.section-featured-products-tabs-products-list' );

        for (let tabTitle of this.productsTabsList) {
            tabTitle.addEventListener('click', (event) => {
                this.onClick(tabTitle);
            })
        }

    }

    onClick(tab) {
        console.log("target", tab);
        var dataCollection = tab.dataset.collection;

        for (let title of this.productsTabsList) {
            title.dataset.collection == dataCollection ? title.classList.add("active") : title.classList.remove("active");
        }

        for (let collection of this.productsTabsContent) {
            collection.dataset.collection == dataCollection ? collection.classList.add("active") : collection.classList.remove("active");
        }
    }


}

customElements.define('products-tab', ProductsTabs)