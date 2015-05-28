(function ($) {
    'use strict';

    // useful page objects
    var $tableObj, $synopsisObj, $infoObj, $backObj, $formObj;

    // themoviedb.org api parameters
    // API documentation can be found at: http://docs.themoviedb.apiary.io
    var apiKey = 'YOUR_API_KEY';
    var apiUrl = 'http://api.themoviedb.org/3';
    var imgSize = 'w154'; // ['w92','w154','w185','w342','w500','original'];
    var imgUrl = 'http://image.tmdb.org/t/p/' + imgSize;
    var urls = {
        search: apiUrl + '/search/tv',
        popular:  apiUrl + '/tv/popular',
        tvShow: apiUrl + '/tv/'
    };

    // control the current page displayed and the total pages available
    var pagination = {
        currentPage: 1,
        totalPages: 1
    };

    // object used to cache TvShowSynopsis elements
    var showsCache = {};

    // html templates
    var synopsisHtml = '' +
        '<dl class="tvshow-content">' +
            '<dt>Title</dt><dd><%title%></dd>' +
            '<dt>Created by</dt><dd><%creator%></dd>' +
            '<dt>Genres</dt><dd><%genres%></dd>' +
            '<dt>Synopsis</dt><dd><%synopsis%></dd>' +
        '</dl>';
    var imageHtml = '<img class="tvshow-img" src="<%imgurl%>" alt="<%alt%> poster">';
    var errorMessageHtml = 'Error encountered while processing the response';
    var loadingHtml = 'Loading...';

    // default options for table ajax requests
    var requestOptions = {
        url: urls.popular,
        data: {api_key: apiKey},
        beforeSend: showLoading,
        success: displayShows,
        error: requestError,
        dataType: 'jsonp',
        cache: true,
        timeout: 5000 // workaround for cross-domain request errors
    };

    /**************************************************************************
     * Class for load and display the synopsis of a TV Show
     *
     * @param {number} id   tv show identifier
     * @param {jQueryObject} $obj the parent element to append the synopsis
     *
     *************************************************************************/
    var TvShowSynopsis = function (id, $obj) {
        this.id = id;
        this.$obj = $obj;
        this.detached = null;
        this._request();
    };

    TvShowSynopsis.prototype = {
        constructor: TvShowSynopsis,
        /**
         * Display the data received via ajax to the user
         *
         * @param  {object} data ajax response or undefined if previous call
         */
        display: function (data) {
            var createdBy, genres, image;
            var html = '';

            // load detached if we have it
            if (this.detached !== null) {
                return this.$obj.html(this.detached);
            }

            // validate received data
            if (data === undefined || !(data.created_by instanceof Array) ||
                    !(data.genres instanceof Array)) {
                return;
            }

            // map the arrays
            createdBy = $.map(data.created_by, function (author) {
                return author.name;
            });
            genres = $.map(data.genres, function (genre) {
                return genre.name;
            });

            // generate html from the template
            if (typeof data.poster_path === 'string') {
                image = imgUrl + data.poster_path;
                html = imageHtml.replace(/<%imgurl%>/, image);
            }

            html += synopsisHtml
                .replace(/<%alt%>/, data.name)
                .replace(/<%title%>/, data.name)
                .replace(/<%creator%>/, createdBy.join(', '))
                .replace(/<%genres%>/, genres.join(', '))
                .replace(/<%synopsis%>/, data.overview);

            this.$obj.html(html).data('id', this.id).show();
        },
        /**
         * Detach the current loaded synopsis. Useful if we want to show it
         * again in the future
         */
        detach: function () {
            this.detached = this.$obj.contents().detach();
        },
        /**
         * Display loading information to the user while performing the request
         */
        _showLoading: function () {
            this.$obj.html(loadingHtml);
        },
        /**
         * Show an error message when request fails
         */
        _displayError: function () {
            this.$obj.html(errorMessageHtml);
        },
        /**
         * Server request for this tv show
         */
        _request: function () {
            $.ajax({
                url: urls.tvShow + this.id,
                data: {api_key: apiKey},
                beforeSend: this._showLoading,
                success: this.display,
                error: this._displayError,
                context: this,
                dataType: 'jsonp',
                cache: true,
                timeout: 5000 // workaround for cross-domain request errors
            });
        }
    };

    /**************************************************************************
     * TABLE FUNCTIONALITIES
     *************************************************************************/

    /**
     * Shows a loading text to the user while a request is ongoing
     */
    function showLoading() {
        $infoObj.html(loadingHtml);
    }

    /**
     * Show the table and hide the synopsis
     */
    function showList() {
        $synopsisObj.hide();
        $backObj.hide();
        $tableObj.show();
        $formObj.show();
    }

    /**
     * Show synopsis and hide the table
     */
    function showSynopsis() {
        $tableObj.hide();
        $formObj.hide();
        $synopsisObj.show();
        $backObj.show();
    }

    /**
     * Display information about the loaded items on the table
     *
     * @param  {number} offset the total items returned on the last request
     * @param  {number} page   current page viewing
     * @param  {number} total  total number of items
     */
    function showInfo(offset, page, total) {
        var from = 20 * (page - 1);
        var to = from + offset;

        $infoObj.html('Showing ' + (from + 1) + ' to ' + to + ' of ' + total);
    }

    /**
     * Load TV Shows sorted by popularity. This is used at loading and when the
     * search get empty
     */
    function loadPopular() {
        requestOptions.url = urls.popular;
        requestOptions.data = {api_key: apiKey};
        $.ajax(requestOptions);
    }

    /**
     * Fired when the request does not return what expected or when the timeout
     * is reached
     *
     * @param  {jqXHR} jqXHR
     * @param  {string} textStatus
     * @param  {string} errorThrown
     */
    function requestError(jqXHR, textStatus, errorThrown) {
        var html = typeof jqXHR === 'string' ? jqXHR : errorMessageHtml;

        $tableObj.find('tbody').html('<tr><td>' + html + '</td></tr>');
        $tableObj.find('thead, tfoot').hide();
        $infoObj.html('');
    }

    /**
     * Handle the ajax response. Reloads the table with the result given
     *
     * @param  {object} data docs at http://docs.themoviedb.apiary.io
     * @return {[type]}      [description]
     */
    function displayShows(data) {
        var html = '', totalResultsReceived = 0;

        // detect failures
        if (data === undefined || !(data.results instanceof Array)) {
            return requestError('Invalid response received');
        }

        totalResultsReceived = data.results.length;

        if (totalResultsReceived === 0)
            return requestError('No elements found');

        $tableObj.find('thead, tfoot').show();
        $.map(data.results, function (item) {
            html += '<tr><td><a href="#item" data-id="' + item.id + '">' +
                    item.name + '</a></td><td>' +
                    item.vote_average.toFixed(1) + '</td><td>' +
                    item.popularity.toFixed(1) + '</td></tr>';
        });
        $tableObj.find('tbody').html(html);

        pagination.currentPage = data.page;
        pagination.totalPages = data.total_pages;

        showInfo(totalResultsReceived, data.page, data.total_results);
    }

    /**************************************************************************
     * HANDLE PAGE EVENTS
     *************************************************************************/

    /**
     * Handle search input
     */
    function onInputSearch() {
        /*jshint validthis:true */
        var q = $(this).val();

        // load popular list if the input search get blank
        if (q === '') {
            return loadPopular();
        }

        requestOptions.url = urls.search;
        requestOptions.data = {api_key: apiKey, query: q, search_type: 'ngram'};
        $.ajax(requestOptions);
    }

    /**
     * Handle paging event. Load previous or next page of the current list
     *
     * @param  {jQEvent} e
     */
    function onClickChangePage(e) {
        /*jshint validthis:true */
        var dir = $(this).data('direction');
        var destinationPage = pagination.currentPage;

        destinationPage += dir === 'prev' ? -1 : +1;

        if (destinationPage >= 1 && destinationPage <= pagination.totalPages) {
            requestOptions.data.page = destinationPage;
            // remove property page if equals one, it's the same request
            if(destinationPage === 1) {
                delete requestOptions.data.page;
            }
            $.ajax(requestOptions);
        }

        e.preventDefault();
    }

    /**
     * Request and show synopsis information for the clicked tv show
     *
     * @param  {jQEvent} e
     */
    function onClickItem(e) {
        /*jshint validthis:true */
        var id = $(this).data('id');

        showSynopsis();

        if (showsCache[id] !== undefined) {
            showsCache[id].display();
        } else {
            showsCache[id] = new TvShowSynopsis(id, $synopsisObj);
        }

        e.preventDefault();
    }

    /**
     * Return to the table view page
     *
     * @param  {jQEvent} e
     */
    function onClickBack(e) {
        var id = $synopsisObj.data('id');

        if (id !== undefined) {
            showsCache[id].detach();
        }

        showList();
        e.preventDefault();
    }

    /**************************************************************************
     * INITIALIZATION
     *************************************************************************/

    $(function () {
        // set the most used object
        $tableObj = $('#elements');
        $formObj = $('form');
        $synopsisObj = $('#synopsis');
        $infoObj = $tableObj.find('tfoot').find('td:first');
        $backObj = $('#back');

        // request popular shows
        loadPopular();

        // add event listeners
        $tableObj.find('tbody').on('click', 'a', onClickItem);
        $backObj.on('click', onClickBack);
        $('#search').submit(function (e) { e.preventDefault(); });

        // we use a debounce function to control the server requests. We have
        // a limit of 30 request for every 10 seconds

        /**
         * This function is extracted from underscorejs.org.
         *
         * Returns a function, that, as long as it continues to be invoked,
         * will not be triggered. The function will be called after it stops
         * being called for N milliseconds. If immediate is passed, trigger
         * the function on the leading edge, instead of the trailing.
         *
         * @param  {function} func
         * @param  {number} wait
         * @param  {boolean} immediate
         * @return {funciton}
         */
        var debounce = function (func, wait, immediate) {
            var timeout, args, context, timestamp, result;

            return function () {
                context = this;
                args = arguments;
                timestamp = new Date();
                var later = function() {
                    var last = (new Date()) - timestamp;
                    if (last < wait) {
                      timeout = setTimeout(later, wait - last);
                    } else {
                      timeout = null;
                      if (!immediate) result = func.apply(context, args);
                    }
                };
                var callNow = immediate && !timeout;
                if (!timeout) {
                    timeout = setTimeout(later, wait);
                }
                if (callNow) result = func.apply(context, args);
                return result;
            };
        };

        $('input[name=q]').on('keyup', debounce(onInputSearch, 350));
        $('.paging').on('click',  debounce(onClickChangePage, 350));
    });
})(jQuery);
