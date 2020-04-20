import Basil from 'basil.js';

/**
 * Utilities for saving and retrieving data from local/session storage as well as a cookie backup.
 * @module StorageUtils
 */
const StorageUtils = {
    /**
     * Sets a value in the selected storage type.
     * @static
     * @function set
     * @param {String} key - The key to save the value as.
     * @param {*} value - The value to set. Values will be run through `JSON.stringify()`.
     * @param {String} [type='local'] - The type of storage to use. Available types include 'local', 'session', and 'cookie'.
     * @param {Number} [cookieExpires=1] - Days when a cookie will expire if the type is set to 'cookie'.
     * @example
     * StorageUtils.set('foo', 'bar');
     * @returns {void}
     */
    set(key, value, type = 'local', cookieExpires = 1) {
        const val = JSON.stringify(value);

        switch (type) {
            case 'local':
                Basil.localStorage.set(key, val);
                break;

            case 'session':
                Basil.sessionStorage.set(key, val);
                break;

            case 'cookie':
                Basil.cookie.set(key, val, {
                    expireDays: cookieExpires,
                });
                break;
        }
    },

    /**
     * Retrieves a value from the selected storage type.
     * @static
     * @function get
     * @param {String} key - The key to retrieve the value of. Values will be parsed using `JSON.parse()`.
     * @param {String} [type='local'] - The type of storage to retrieve from. Available types include 'local', 'session', and 'cookie'.
     * @example
     * StorageUtils.get('foo');
     * @returns {String} - The value at the specified key.
     */
    get(key, type = 'local') {
        let storageType;

        switch (type) {
            case 'local':
                storageType = 'localStorage';
                break;

            case 'session':
                storageType = 'sessionStorage';
                break;

            case 'cookie':
                storageType = 'cookie';
                break;
        }

        // wrap in a try/catch in case an already saved or old value is not JSON parseable
        try {
            return JSON.parse(Basil[storageType].get(key));
        } catch (err) {
            return Basil[storageType].get(key);
        }
    },

    /**
     * Removes a stored value from the specified storage type.
     * @static
     * @function remove
     * @param {String} key - The key of the value to remove.
     * @param {String} [type='local'] - The type of storage to remove from. Available types include 'local', 'session', and 'cookie'.
     * @example
     * StorageUtils.remove('foo');
     * @returns {void}
     */
    remove(key, type = 'local') {
        let storageType;

        switch (type) {
            case 'local':
                storageType = 'localStorage';
                break;

            case 'session':
                storageType = 'sessionStorage';
                break;

            case 'cookie':
                storageType = 'cookie';
                break;
        }

        Basil[storageType].remove(key);
    },
};

export default StorageUtils;
