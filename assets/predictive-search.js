class PredictiveSearch extends HTMLElement {
    constructor() {
        super();

        this.predictiveSearchForm = this.querySelector('form');
        this.input = this.querySelector('input[type="search"]');
        this.predictiveSearchResults = this.querySelector('#predictive-search-results');

        this.recommendationProducts = this.querySelector('.search-dropdown-recommendations');

        this.input.addEventListener('input', this.debounce((event) => {
            this.onChange(event);
        }, 300).bind(this));
    }

    onChange() {
        const searchTerm = this.input.value.trim();

        if (!searchTerm.length) {
            this.close();
            return;
        }
        let searchTerms = {};

        const formElements = Array.from(this.predictiveSearchForm);

        formElements.forEach(element => {
            if (element.name.length) {
                searchTerms[element.name] = element.value;
            }
        });

        const stringifySearchTerms = JSON.stringify(searchTerms);
        const paramsSearchTerms = stringifySearchTerms.slice(1, -1).replace(/","/g, '"&"').replace(/:/g, '=').replace(/"/g, '');

        this.getSearchResults(paramsSearchTerms);
    }

    getSearchResults(searchTerms) {
        // console.log("search terms", searchTerms, window.Shopify.routes);

        // fetch(window.Shopify.routes.root + 'search/suggest?' + searchTerms)
        fetch(`${window.Shopify.routes.root}search/suggest?${searchTerms}&section_id=predictive-search`)
            .then((response) => {
                // console.log("res", response)

                if (!response.ok) {
                    var error = new Error(response.status);
                    this.close();
                    throw error;
                }

                return response.text();
            })
            .then((res) => {
                // console.log("res", res);
                const resultsMarkup = new DOMParser().parseFromString(res, 'text/html').querySelector('#shopify-section-predictive-search').innerHTML;
                this.predictiveSearchResults.innerHTML = resultsMarkup;
                // this.appendChild(resultsMarkup)
                this.open();

                // for(recommendedProducts of this.recommendationProducts){
                    this.recommendationProducts.remove();
                // }
            })
            .catch((error) => {
                this.close();
                throw error;
            });
    }

    open() {
        this.predictiveSearchResults.style.display = 'block';
    }

    close() {
        this.predictiveSearchResults.style.display = 'none';
    }

    debounce(fn, wait) {
        let t;
        return (...args) => {
            clearTimeout(t);
            t = setTimeout(() => fn.apply(this, args), wait);
        };
    }
}

customElements.define('predictive-search', PredictiveSearch);
