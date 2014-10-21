

(function (root) {

    /* Utils */

    function isDefined(obj) {
        return typeof obj !== "undefined";
    }

    function isFunction(obj) {
        return typeof obj == "function";
    }

    function isNumber(obj) {
        return typeof obj == "number";
    }


    root.lql = function (array) {

        if (!isDefined(array) || array == null)
            throw "array should be defined and not null";

        var iface = {
            source: array
        };

        iface.where = function (condition) {
            iface.source = internal_where(iface.source, condition);
            return iface;
        };

        iface.select = function (projection) {
            iface.source = internal_select(iface.source, projection);
            return iface;
        };

        iface.skip = function (count) {
            iface.source = internal_skip(iface.source, count);
            return iface;
        };

        iface.take = function (count) {
            iface.source = internal_take(iface.source, count);
            return iface;
        };

        iface.groupBy = function (keyFn) {
            iface.source = internal_groupBy(iface.source, keyFn);
            return iface;
        };

        iface.orderBy = function (compareFn) {
            iface.source = internal_orderBy(iface.source, compareFn);
            return iface;
        };

        iface.reverse = function () {
            iface.source = internal_reverse(iface.source);
            return iface;
        };

        iface.defaultIfEmpty = function (defaultValue) {
            iface.source = internal_defaultIfEmpty(iface.source, defaultValue);
            return iface;
        };

        iface.union = function (arr) {
            iface.source = internal_union(iface.source, arr);
            return iface;
        };

        iface.distinct = function () {
            iface.source = internal_distinct(iface.source);
            return iface;
        };

        /* Final functions */
        iface.firstOrDefault = function (condition) {
            return internal_firstOrDefault(iface.source, condition);
        };

        iface.sum = function (projection) {
            return internal_sum(iface.source, projection);
        };

        iface.min = function (projection) {
            return internal_min(iface.source, projection);
        };

        iface.max = function (projection) {
            return internal_max(iface.source, projection);
        };

        iface.count = function (projection) {
            return internal_count(iface.source, projection);
        };

        iface.average = function (projection) {
            return internal_average(iface.source, projection);
        };

        iface.any = function (condition) {
            return internal_any(iface.source, condition);
        };

        iface.all = function (condition) {
            return internal_all(iface.source, condition);
        };

        iface.toArray = function () {
            return iface.source;
        };

        return iface;

    };

    root.lql.sequence = function (start, end) {
        var array = [];

        for (var n = start; n <= end; n++) {
            array.push(n);
        }

        return array;
    };

    function internal_where(array, condition) {

        if (!isDefined(condition) || condition == null || !isFunction(condition))
            throw "Undefined condition or it's not a function";

        var temp = [];

        for (var n = 0; n < array.length; n++) {
            if (condition(array[n])) temp.push(array[n]);
        }

        return temp;

    }

    function internal_select(array, projection) {

        if (!isDefined(projection) || projection == null)
            return array;

        if (!isFunction(projection))
            throw "projection is not a function";

        var temp = [];

        for (var n = 0; n < array.length; n++) {
            temp.push(projection(array[n]));
        }

        return temp;
    }

    function internal_firstOrDefault(array, condition) {

        if (!isDefined(condition) || condition == null)
            return isDefined(array[0]) ? array[0] : null;

        if (!isFunction(condition))
            throw "condition is not a function";

        for (var i = 0; i < array.length; i++) {
            if (condition(array[i])) return array[i];
        }

        return null;

    }

    function internal_skip(array, count) {

        if (!isDefined(count) || count == null || !isNumber(count))
            throw "count is not defined or it is not a number";

        if (count > array.length || count < 0)
            throw "'count' (" + count + ") should be less than array length (" + array.length + ") and greater than zero";

        var temp = [];

        for (var i = count; i < array.length; i++) {
            temp.push(array[i]);
        }

        return temp;
    }

    function internal_take(array, count) {

        if (count > array.length || count < 0)
            throw "'count' (" + count + ") should be less than array length (" + array.length + ") and greater than zero";

        var temp = [];

        for (var i = 0; i < count; i++) {
            temp.push(array[i]);
        }

        return temp;
    }

    function internal_groupBy(array, keyFn) {

        var result = [];
        var mapper = {};

        for (var i = 0; i < array.length; i++) {

            var objKey = keyFn(array[i]);

            var index = mapper[objKey];

            if (!isDefined(index)) {
                mapper[objKey] = result.length;
            }

            var item = result[index];

            if (isDefined(item)) {
                item.items.push(array[i]);
            } else {
                result.push({
                    key: objKey,
                    items: [
                        array[i]
                    ]
                });
            }

        }
        return result;

    }

    function internal_clone(array) {

        var temp = [];

        for (var n = 0; n < array.length; n++) {
            temp.push(array);
        }

        return array.slice(0);

    }

    function internal_orderBy(array, projection) {

        if (!isDefined(projection) || projection == null)
            return array;

        if (!isFunction(projection))
            throw "projection is not a function";


        var temp = internal_clone(array);

        temp.sort(function (a, b) {
            return projection(a) - projection(b);
        });

        return temp;
    }

    function internal_reverse(array) {

        var temp = internal_clone(array);

        temp.reverse();

        return temp;
    }

    function internal_sum(array, projection) {

        if (array.length == 0)
            throw "Array is empty";

        var parr = array;

        if (isDefined(projection) && projection != null) {

            if (!isFunction(projection))
                throw "projection is not a function";

            parr = internal_select(array, projection);
        }

        var temp = 0;

        for (var n = 0; n < parr.length; n++) {

            temp += parr[n];
        }

        return temp;

    }

    function internal_count(array, condition) {

        if (!isDefined(condition) || condition == null)
            return array.length;

        if (!isFunction(condition))
            throw "condition is not a function";

        var cnt = 0;

        for (var n = 0; n < array.length; n++) {
            if (condition(array[n])) cnt++;
        }

        return cnt;
    }

    function internal_average(array, projection) {

        if (array.length == 0)
            throw "Array is empty";

        var parr = array;

        if (isDefined(projection) && projection != null) {

            if (!isFunction(projection))
                throw "projection is not a function";

            parr = internal_select(array, projection);
        }

        return internal_sum(parr) / parr.length;
    }

    function internal_min(array, projection) {

        if (array.length == 0)
            throw "Array is empty";

        var parr = array;

        if (isDefined(projection) && projection != null) {

            if (!isFunction(projection))
                throw "projection is not a function";

            parr = internal_select(array, projection);
        }

        var mn = Number.MAX_VALUE;

        for (var n = 0; n < parr.length; n++) {
            if (parr[n] < mn) mn = parr[n];
        }

        return mn;
    }

    function internal_max(array, projection) {

        if (array.length == 0)
            throw "Array is empty";

        var parr = array;

        if (isDefined(projection) && projection != null) {

            if (!isFunction(projection))
                throw "projection is not a function";

            parr = internal_select(array, projection);
        }

        var mx = Number.MIN_VALUE;

        for (var n = 0; n < parr.length; n++) {
            if (parr[n] > mx) mx = parr[n];
        }

        return mx;
    }

    function internal_any(array, condition) {

        if (!isDefined(condition) || condition == null || !isFunction(condition))
            throw "Undefined condition or it's not a function";

        return internal_firstOrDefault(array, condition) != null;
    };

    function internal_all(array, condition) {

        if (!isDefined(condition) || condition == null || !isFunction(condition))
            throw "Undefined condition or it's not a function";


        for (var n = 0; n < array.length; n++) {
            if (!condition(array[n])) return false;
        }

        return true;
    }

    function internal_defaultIfEmpty(array, defaultValue) {

        if (!isDefined(defaultValue))
            throw "defaultValue is not defined";

        return array.length == 0 ? [defaultValue] : array;
    }

    function internal_union(array1, array2) {

        var temp = [];
        var n;

        for (n = 0; n < array1.length; n++) {
            temp.push(array1[n]);
        }

        for (n = 0; n < array2.length; n++) {
            temp.push(array2[n]);
        }

        return temp;
    }

    function internal_distinct(array) {

        var grouped = internal_groupBy(array, function (item) { return item; });

        return internal_select(grouped, function (item) { return item.key; });

    }

})(this);

