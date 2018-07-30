var mh84 = mh84 || {};
mh84.utils = mh84.utils || {};
mh84.utils.autocomplete = {};

mh84.utils.autocomplete.changeState = function (rootElem, state) {
    var searchIconElement = rootElem.find(".autocomplete_icon_search");
    var loadingIconElement = rootElem.find(".autocomplete_icon_loading");

    if (state === 'SEARCH_STARTED') {
        searchIconElement.hide();
        loadingIconElement.show();
    } else if (state === 'SEARCH_ENDED') {
        searchIconElement.show();
        loadingIconElement.hide();
    }
};

mh84.utils.autocomplete.defaultRetrieveSourceFn = function (endpoint) {
    return function (request, response) {
        var promise =
            $.post(endpoint, { term: request.term }, 'json')
                .fail(function () {
                    console.error('Error retriving the autocomplete source.');
                });
        return promise;
    };
}

mh84.utils.autocomplete.defaultParseSourceFn = function (data) {
    return $.map(data, function (val) {
        return Object.assign({},
            val,
            {
                id: val.value,
                value: val.label ? val.label : val.value
        });
    });
}

mh84.utils.autocomplete.retrieveSource = function (rootElem, sourceFn, options) {
    var fnSource;
    if (typeof sourceFn === "function") {
        fnSource = sourceFn;
    } else {
        fnSource = mh84.utils.autocomplete.defaultRetrieveSourceFn(sourceFn);
    }

    var fnParse;
    if (options.fnParseSource) {
        fnParse = options.fnParseSource;
    } else {
        fnParse = mh84.utils.autocomplete.defaultParseSourceFn;
    }

    return function (request, response) {
        mh84.utils.autocomplete.changeState(rootElem, 'SEARCH_STARTED');
        var promise = fnSource(request, response);
        promise.done(function (data) {
            mh84.utils.autocomplete.changeState(rootElem, 'SEARCH_ENDED');
            data = fnParse(data);
            response(data);
        });
    };
};

mh84.utils.autocomplete.defaultOnSelectItemFn = function (rootElem, options) {
    var valueElement = rootElem.find(".autocomplete_hdn_value");
    return function (event, ui) {
        if (options.externalSelectFn) {
            options.externalSelectFn(ui.item);
        } else {
            console.log('Item Selected', ui.item);
        }

        //set tagids to save
        valueElement.val(ui.item.id);

        //Tags for display
        this.value = ui.item.label;
        return false;
    }
}

mh84.utils.autocomplete.onItemSelected = function (rootElem, options) {
    var fnSelect;
    if (typeof options.selectFn === "function") {
        fnSelect = options.selectFn;
    } else {
        fnSelect = mh84.utils.autocomplete.defaultOnSelectItemFn(rootElem, options);
    }

    return fnSelect;
};

mh84.utils.autocomplete.defaultOptions = {
    minLength: 3,
    delay: 500
};

mh84.utils.autocomplete.openList = function () {
    $(this).autocomplete("widget").show();
}

mh84.utils.autocomplete.init = function (elementId, sourceFn, uiOptions, options) {
    var rootElem = $(elementId);
    var labelElement = rootElem.find(".autocomplete_txt_label");
    var searchBtnElement = rootElem.find(".autocomplete_icon_search");

    options = options || {};
    uiOptions = uiOptions || {};

    var autocompleteOptions = Object.assign(
        {},
        mh84.utils.autocomplete.defaultOptions,
        {
            source: mh84.utils.autocomplete.retrieveSource(rootElem, sourceFn, options),
            select: mh84.utils.autocomplete.onItemSelected(rootElem, options)
        },
        uiOptions
    );

    labelElement.autocomplete(autocompleteOptions)
        .focus(mh84.utils.autocomplete.openList);

    searchBtnElement.click(function () { labelElement.focus() });
};