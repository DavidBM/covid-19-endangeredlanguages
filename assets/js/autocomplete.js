(function ($) {
    var defaults = {
        treshold: 4,
        maximumItems: 5,
        highlightTyped: true,
        highlightClass: 'text-primary'
    };
    function createItem(lookup, item, opts) {
        var label;
        if (opts.highlightTyped) {
            var idx = item.label.toLowerCase().indexOf(lookup.toLowerCase());
            label = item.label.substring(0, idx)
                + '<span class="' + opts.highlightClass + '">' + item.label.substring(idx, idx + lookup.length) + '</span>'
                + item.label.substring(idx + lookup.length, item.label.length);
        }
        else {
            label = item.label;
        }

        if(typeof opts.buttonRenderer === "function") {
            return opts.buttonRenderer(item.value, label, item.label, opts);
        } else {
            return '<button type="button" class="dropdown-item" data-value="' + item.value + '">' + label + '</button>';
        }
    }
    function createItems(field, opts) {
        var lookup = field.val();
        if (lookup.length < opts.treshold) {
            field.dropdown('hide');
            return 0;
        }
        var items = field.next();
        items.html('');
        var count = 0;

        var itemsToAppend = [];

        var keys = Object.keys(opts.source);
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            var object = opts.source[key];
            var item = {
                label: opts.label ? object[opts.label] : key,
                value: opts.value ? object[opts.value] : object
            };
            var matchPosition = item.label.toLowerCase().indexOf(lookup.toLowerCase());
            if (matchPosition >= 0) {
                itemsToAppend.push([matchPosition, createItem(lookup, item, opts)])
                if (++count >= opts.maximumItems) {
                    break;
                }
            }
        }

        itemsToAppend
        .sort(function (a, b) {
            return a[0] > b[0]
        })
        .forEach(function (value) {
            items.append(value[1]);
        });

        // option action
        field.next().find('.dropdown-item').click(function () {
            field.val($(this).data("selected-label") || $(this).text());
            if (opts.onSelectItem) {
                opts.onSelectItem({
                    value: $(this).data('value'),
                    label: $(this).text(),
                    element: this,
                }, field[0]);
            }
        });
        return items.children().length;
    }
    $.fn.autocomplete = function (options) {
        // merge options with default
        var opts = {};
        $.extend(opts, defaults, options);
        var _field = $(this);
        // clear previously set autocomplete
        _field.parent().removeClass('dropdown');
        _field.removeAttr('data-toggle');
        _field.removeClass('dropdown-toggle');
        _field.parent().find('.dropdown-menu').remove();
        _field.dropdown('dispose');
        // attach dropdown
        _field.parent().addClass('dropdown');
        _field.attr('data-toggle', 'dropdown');
        _field.addClass('dropdown-toggle');
        _field.after('<div class="dropdown-menu"></div>');
        _field.dropdown(opts.dropdownOptions);
        this.off('click.autocomplete').click('click.autocomplete', function (e) {
            if (createItems(_field, opts) == 0) {
                // prevent show empty
                e.stopPropagation();
                _field.dropdown('hide');
            }
            ;
        });
        // show options
        this.off('keyup.autocomplete').keyup('keyup.autocomplete', function () {
            if (createItems(_field, opts) > 0) {
                _field.dropdown('show');
            }
            else {
                // sets up positioning
                _field.click();
            }
        });
        return this;
    };
}(jQuery));
