var mh84 = mh84 || {};
mh84.utils = mh84.utils || {};
mh84.utils.autocomplete = {};


mh84.utils.autocomplete.getValueElement = function (rootElem) {
    return rootElem.find(".autocomplete_hdn_value");
};

mh84.utils.autocomplete.getLabelElement = function (rootElem) {
    return rootElem.find(".autocomplete_txt_label");
};

mh84.utils.autocomplete.getRemoveIconElement = function (rootElem) {
    return rootElem.find(".autocomplete_icon_remove");
};

mh84.utils.autocomplete.getSearchIconElement = function (rootElem) {
    return rootElem.find(".autocomplete_icon_search");
};

mh84.utils.autocomplete.getLoadingIconElement = function (rootElem) {
    return rootElem.find(".autocomplete_icon_loading");
};

mh84.utils.autocomplete.changeState = function (rootElem, state) {
    var removeIconElement = mh84.utils.autocomplete.getRemoveIconElement(rootElem);
    var searchIconElement = mh84.utils.autocomplete.getSearchIconElement(rootElem);
    var loadingIconElement = mh84.utils.autocomplete.getLoadingIconElement(rootElem);
    var labelElement = mh84.utils.autocomplete.getLabelElement(rootElem);
    var valueElement = mh84.utils.autocomplete.getValueElement(rootElem);

    if (state === 'SEARCH_STARTED') {
        searchIconElement.hide();
        loadingIconElement.show();
    }
    else if (state === 'SEARCH_ENDED') {
        searchIconElement.show();
        loadingIconElement.hide();
    }
    else if (state === 'ITEM_SELECTED') {
        labelElement.attr('readonly', 'readonly');
        searchIconElement.hide();
        removeIconElement.show();
        removeIconElement.click(function() { rootElem.clear() });
    }
    else if (state === 'ITEM_REMOVED') {
        if (rootElem.externalClearFn) {
            rootElem.externalClearFn(labelElement.val(), valueElement.val());
        }
        valueElement.val('');
        labelElement.val('');
        labelElement.removeAttr('readonly');
        searchIconElement.show();
        removeIconElement.hide();
    }
};

mh84.utils.autocomplete.defaultRetrieveSourceFn = function (endpoint, rootElem) {
    return function (request, response) {
        var promise =
            $.post(endpoint, { term: request.term }, 'json')
                .success(function() {
                    rootElem.searchedValue = request.term;
                })
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
        fnSource = mh84.utils.autocomplete.defaultRetrieveSourceFn(sourceFn, rootElem);
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
    var valueElement = mh84.utils.autocomplete.getValueElement(rootElem);
    return function (event, ui) {
        if (options.externalSelectFn) {
            options.externalSelectFn(ui.item);
        } else {
            console.log('Item Selected', ui.item);
        }

        //set tag ids to save
        valueElement.val(ui.item.id);

        //Tags for display
        this.value = ui.item.value;

        mh84.utils.autocomplete.changeState(rootElem, 'ITEM_SELECTED');

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

mh84.utils.autocomplete.openList = function (rootElem, autocompleteElem ) {
    if ((rootElem.searchedValue || '').includes(autocompleteElem.val())) {
        autocompleteElem.autocomplete("widget").show();
    }
}

mh84.utils.autocomplete.init = function (elementId, sourceFn, uiOptions, options) {
    var rootElem = $(elementId);
    var labelElement = mh84.utils.autocomplete.getLabelElement(rootElem);
    var searchBtnElement = mh84.utils.autocomplete.getSearchIconElement(rootElem);
    var valueElement = mh84.utils.autocomplete.getValueElement(rootElem);

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

    var autocompleteElem = labelElement.autocomplete(autocompleteOptions);
    autocompleteElem.focus(function () {
        mh84.utils.autocomplete.openList(rootElem, $(this));
    });

    rootElem.clear = function() {
        mh84.utils.autocomplete.changeState(rootElem, 'ITEM_REMOVED');
    };

    rootElem.externalClearFn = options.externalClearFn;

    searchBtnElement.click(function () { labelElement.focus() });

    if (valueElement.val()) {
        mh84.utils.autocomplete.changeState(rootElem, 'ITEM_SELECTED');
    }

    return rootElem;
};