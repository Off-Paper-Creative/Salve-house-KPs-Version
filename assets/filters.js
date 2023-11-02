

function updateURLState(searchParams) {
    history.pushState({ searchParams }, '', `${window.location.pathname}${searchParams && '?'.concat(searchParams)}`);
}

function updatePagination(searchParams){
    // console.log("updating pagination", searchParams);

    var paginationLinks = document.querySelectorAll('.products-pagination a');

    var existingSearchParams = new URLSearchParams(searchParams);

    for( let link of paginationLinks ){

        var searchParamsArray = {};
        var urlBase = link.getAttribute('href').split('?')[0];
        var url = link.getAttribute('href').split('?')[1];
        var urlParams = new URLSearchParams(url);
       
        for(const entry of urlParams.entries()) {
            searchParamsArray[entry[0]] = entry[1];
        }

        for(const existingEntry of existingSearchParams.entries()){
            searchParamsArray[decodeURIComponent(existingEntry[0])] = decodeURIComponent(existingEntry[1]);
        }

        var newUrlParams = new URLSearchParams(searchParamsArray).toString();
        var newUrl = urlBase + '?' + newUrlParams;

        link.setAttribute('href', newUrl)
    }


}


// Filters & Sorting
class ProductFilters extends HTMLElement{
    constructor(){
        super();


        // To check is element added
        // if (!customElements.get('quick-add-modal')) {

        // }

        this.form = this.querySelector('form');
        this.details = this.getElementsByTagName('details');
        this.submitButtons = this.querySelectorAll('button[type="submit"]')

        this.filterDrawerTitle = this.querySelector('.facet-filters-title');
        this.filterDrawerClose = this.querySelector('.facet-filters-list-close');

        // Mobile filter Drawer
        this.mobileFilterClick();

        // Close filter dropdown when out of range
        this.filterClose();

        // Ajax Filter
        this.ajaxFilter();

        // Price Range filter
        this.priceRangeSlider();
    }

    mobileFilterClick = () => {
        this.filterDrawerTitle.addEventListener('click', (e) => {
            e.preventDefault();
            
            if( this.form.classList.contains('active') ){
                this.form.classList.remove('active');
            }
            else{
                this.form.classList.add('active');
            }
        })

        document.addEventListener('click', (event) => {
            // this.details = this.getElementsByTagName('details');
            // for(let detail of this.details){
            var filterDrawerClose = document.querySelector('.facet-filters-list-close');
            if (event.target == filterDrawerClose || filterDrawerClose.contains(event.target)) {
                this.form.classList.remove('active');
            }
            // }
        })

        // this.filterDrawerClose.addEventListener('click', (e) => {
        //     e.preventDefault();
        //     console.log("clicked close")
        //     this.form.classList.remove('active');
            
        // })
    }

    


    filterClose = () => {
        document.addEventListener('click', (event) => {
            this.details = this.getElementsByTagName('details');
            for(let detail of this.details){
                if (event.target !== detail && !detail.contains(event.target)) {
                    detail.removeAttribute('open');
                }
            }
        })
    }

    ajaxFilter = () => {
        for(let button of this.submitButtons){
            button.addEventListener('click', (event) => {
                event.preventDefault();

                this.ajaxFiltering(event);

            })
        }
    }


    getParams(){

        const formData = new FormData(this.form);
        return new URLSearchParams(formData).toString();
        
    }


    getUrlParams = () => {
        Shopify.queryParams = [];
        var queryParams = [];
        if(window.location.search.length) {
            
          for(var aKeyValue, i = 0, aCouples = window.location.search.substring(1).split('&'); i < aCouples.length; i++) {
            aKeyValue = aCouples[i].split('=');
            if (aKeyValue.length > 1) {
                if( aKeyValue[1].length > 0 ){

                    if( aKeyValue[0] != 'page' ){
                        queryParams.push({ key: decodeURIComponent(aKeyValue[0]), value: decodeURIComponent(aKeyValue[1])});
                    }
                }
            }
          }
        }

        var formParams = this.getParams();

        if(formParams.length) {
            for(var aKeyValue, i = 0, aCouples = formParams.split('&'); i < aCouples.length; i++) {
                aKeyValue = aCouples[i].split('=');
                if (aKeyValue.length > 1) {
                    Shopify.queryParams.push({ key: decodeURIComponent(aKeyValue[0]), value: decodeURIComponent(aKeyValue[1])});
                }
            }
        }

        var combinedQueryParams = [...queryParams, ...Shopify.queryParams];
        var params = '';

        combinedQueryParams.forEach((param, index) => {
            params += `${param['key']}=${param['value']}`; 

            if( (index + 1) != combinedQueryParams.length ){
                params += `&`;
            }
        })

        // console.log("params", params)

        return params;
    }

    ajaxFiltering = (event) => {


        var searchParams = this.getUrlParams();

        var productsSelector = '.products';
        var filtersSelector = '.facet-filters';
        var productsSection = document.querySelector(productsSelector);
        var filtersSection = document.querySelector(filtersSelector);

        var productsSectionId = productsSection.dataset.id
        var filtersSectionId = filtersSection.dataset.id

        // var productsCountSelector = '.facet-filters-count'
        // var productsCount = document.querySelector(productsCountSelector + '> span');


        fetch(`${window.location.pathname}?section_id=${filtersSectionId}&${searchParams}`)
            .then(response => {
                // console.log("response", response)
                return response.text()
            })
            .then((text) => {

                // Insert products
                this.insertFilteredFacets(text);

            });
        fetch(`${window.location.pathname}?section_id=${productsSectionId}&${searchParams}`)
            .then(response => {
                // console.log("response", response)
                return response.text()
            })
            .then((text) => {

                // Insert products
                this.insertFilteredProducts(text);

                // Update Addressbar URL
                updateURLState(searchParams)
        
                // Closing dropdown
                this.closeDropdown(event);

                // Closing Drawer
                this.form.classList.remove('active');

            });
    }

    closeDropdown = (event) => {
        var detail = event.target.closest('details')
        if( detail ){
            detail.removeAttribute('open');
        }
    }

    insertFilteredFacets = (text) => {

        // console.log("response", text);

        var filtersSelector = '.facet-filters';
        var filtersSection = document.querySelector(filtersSelector + ' .filter-form');
        var filtersCountSection = document.querySelector(filtersSelector + ' .facet-filters-count');

        const html = document.createElement('div');
        html.innerHTML = text;
        const newFiltersSection = html.querySelector(filtersSelector + ' .filter-form');
        const newFiltersCountSection = html.querySelector(filtersSelector + ' .facet-filters-count');

        // console.log("products length", productsSection.childElementCount);
        
        filtersSection.innerHTML = newFiltersSection.innerHTML;
        filtersCountSection.innerHTML = newFiltersCountSection.innerHTML;
    }

    insertFilteredProducts = (text) => {

        // console.log("response", text);

        var productsSelector = '.products';
        var productsSection = document.querySelector(productsSelector);

        const html = document.createElement('div');
        html.innerHTML = text;
        const newProductsSection = html.querySelector(productsSelector);

        // console.log("products length", productsSection.childElementCount);
        
        productsSection.innerHTML = newProductsSection.innerHTML;
    }


    priceRangeSlider = () => {

        this.isDraggingMin = false,
        this.isDraggingMax = false,
        this.isOutofRange = false;

        this.handle = this.querySelector('.filter-group-display__price-range-slider');
        this.handleMin = this.querySelector('.filter-group-display__price-range-slider-handle--min');
        this.handleMax = this.querySelector('.filter-group-display__price-range-slider-handle--max');

        this.minPriceElement = this.querySelector('.filter-group-display__price-range-from input[type="number"]');
        this.maxPriceElement = this.querySelector('.filter-group-display__price-range-to input[type="number"]');

        this.minPrice = this.minPriceElement.getAttribute('min');
        this.maxPrice = this.maxPriceElement.getAttribute('max');


        this.minWidth = this.handleMin.offsetWidth;
        this.maxWidth = this.handleMax.offsetWidth;
        this.handleWidth = this.handle.offsetWidth;

        this.priceRange = this.maxPrice - this.minPrice;
        
        this.sliderPosition = {
            top: this.handle.getBoundingClientRect().top + window.scrollY, 
            left: this.handle.getBoundingClientRect().left + window.scrollX, 
        };

        this.handleMin.addEventListener('mouseup', () => { this.isDraggingMin = false });
        this.handleMin.addEventListener('mousedown', () => { this.isDraggingMin = true });
        this.handleMax.addEventListener('mouseup', () => { this.isDraggingMax = false });
        this.handleMax.addEventListener('mousedown', () => { this.isDraggingMax = true });

        this.handleMin.addEventListener('touchend', () => { this.isDraggingMin = false });
        this.handleMin.addEventListener('touchstart', () => { this.isDraggingMin = true });
        this.handleMax.addEventListener('touchend', () => { this.isDraggingMax = false });
        this.handleMax.addEventListener('touchstart', () => { this.isDraggingMax = true });


        document.addEventListener('mousemove', (e) => this.onMove(e));
        document.addEventListener('touchmove', (e) => this.onMove(e));

        document.addEventListener('mouseup', (e) => { this.onMouseUp(); })
        document.addEventListener('touchend', (e) => { this.onMouseUp(); })
        document.addEventListener('mousedown', (e) => { e.keyCode == 3 && this.onMouseUp(); });

    }

    onMove = (e) => {


        if( !(this.isDraggingMax == true || this.isDraggingMin == true) ){
            return false;
        }
        // console.log("on move triggered correctly", e);

        var type = e.type;
        var offsetX = e.offsetX;
        var pageX = e.pageX;

        if (type === "touchmove") {
            var touch = e.touches[0] || e.changedTouches[0];
            var touchOffset = 34;
            offsetX = touch.pageX - touchOffset;

            this.minWidth = this.handleMin.offsetWidth;
            this.maxWidth = this.handleMax.offsetWidth;
            this.handleWidth = this.handle.offsetWidth;

            this.priceRange = this.maxPrice - this.minPrice;

            this.sliderPosition = {
                top: this.handle.getBoundingClientRect().top + window.scrollY, 
                left: this.handle.getBoundingClientRect().left + window.scrollX, 
            };
        }

        this.isOutofRange = (this.sliderPosition.left > pageX || (this.handleWidth + this.sliderPosition.left) <= pageX) ? true : false;

        var width = Math.floor((this.priceRange * offsetX) / this.handleWidth) + parseFloat(this.minPrice);

        if (this.isDraggingMax == true && this.minWidth < offsetX && this.isOutofRange == false) {
            this.handleMax.style.width = offsetX * 100 / this.handleWidth + '%';
            this.maxPriceElement.setAttribute('val', width);
            this.maxPriceElement.value = width;
        }

        if (this.isDraggingMin == true && this.maxWidth > offsetX && this.isOutofRange == false) {
            this.handleMin.style.width = offsetX * 100 / this.handleWidth + '%';
            this.minPriceElement.setAttribute('val', width);
            this.minPriceElement.value = width;
        }

        this.minWidth = this.handleMin.offsetWidth;
        this.maxWidth = this.handleMax.offsetWidth;

    }

    onMouseUp = () => {
        this.isDraggingMin = false;
        this.isDraggingMax = false;

    }
}
customElements.define('facet-filters', ProductFilters)



class SortingDropdown extends HTMLElement{
    constructor(){
        super();

        this.dropdownToggle = this.querySelector('.facet-filters-sorting-default');
        this.sortOptions = this.querySelectorAll('li');

        this.dropdownToggle.addEventListener('click', (e)=> {
            this.onClick();
        })

        document.addEventListener('click', (event) => {
            if (event.target !== this && !this.contains(event.target)) {
                this.close()
            }
        })
        
        for( let option of this.sortOptions ){
            option.addEventListener('click', (e) => {
                this.onOptionClick(option);
            });
        }
    }

    onClick = () => {
        if( this.classList.contains('active') ){
            this.close();
        }
        else{
            this.open();
        }
    }

    open = () => {
        this.classList.add('active');
    }

    close = () => {
        this.classList.remove('active');
    }

    onOptionClick = (option) => {
        var value = option.dataset.value;
        // console.log("changed", value);

        var queryParams = {};
        if(window.location.search.length) {
            
          for(var aKeyValue, i = 0, aCouples = window.location.search.substring(1).split('&'); i < aCouples.length; i++) {
            aKeyValue = aCouples[i].split('=');
            if (aKeyValue.length > 1) {
                queryParams[decodeURIComponent(aKeyValue[0])] = decodeURIComponent(aKeyValue[1]);
            }
          }
        }

        queryParams.sort_by = value;

        this.ajaxSorting(queryParams);
    }

    ajaxSorting = (queryParams) => {

        var productsSelector = '.products'
        var productsSection = document.querySelector(productsSelector);
        var productsSectionId = productsSection.dataset.id

        var searchParams = new URLSearchParams(queryParams).toString();
        
        fetch(`${window.location.pathname}?section_id=${productsSectionId}&${searchParams}`)
        .then(response => {
            return response.text()
        })
        .then((text) => {

            for( let option of this.sortOptions ){
              if( option.dataset.value == queryParams.sort_by ){
                this.dropdownToggle.innerHTML = option.innerHTML
              }
            }

            const html = document.createElement('div');
            html.innerHTML = text;
            const newProductsSection = html.querySelector(productsSelector);
            
            productsSection.innerHTML = newProductsSection.innerHTML;

            updateURLState(searchParams)

            updatePagination(searchParams);


            this.close();

        });
    }

}

customElements.define('sorting-dropdown', SortingDropdown)


class ProductsPagination extends HTMLElement {
    constructor(){
        super();

        // Ajax Pagination
        this.ajaxPagination();
    }


    ajaxPagination = () => {
        
        var paginationLinks = document.querySelectorAll('.products-pagination a');

        var productsSelector = '.products'
        var section = document.querySelector(productsSelector);

        for( let link of paginationLinks ){
            link.addEventListener('click', (e) => {
                e.preventDefault();

                var href = link.getAttribute('href');
                var searchParams = href.replace(window.location.pathname + '?', '');
                
                fetch(`${window.location.pathname}?${searchParams}`)
                    .then(response => {
                        return response.text()
                    })
                    .then((text) => {

                        const html = document.createElement('div');
                        html.innerHTML = text;
                        const productsSection = html.querySelector(productsSelector);
                        
                        section.innerHTML = productsSection.innerHTML;

                        updateURLState(searchParams)

                    });

            })
        }

    }
}

customElements.define( 'products-pagination', ProductsPagination )