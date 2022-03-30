/*
    This file is part of web3.js.
    web3.js is free software: you can redistribute it and/or modify
    it under the terms of the GNU Lesser General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.
    web3.js is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Lesser General Public License for more details.
    You should have received a copy of the GNU Lesser General Public License
    along with web3.js.  If not, see <http://www.gnu.org/licenses/>.
*/
/**
 * @file index.js
 * @author Fabian Vogelsteller <fabian@ethereum.org>
 * @date 2017
 */

"use strict";


var errors = require('@arianelabs/hweb3-core-helpers').errors;
import givenProvider from './givenProvider.js';
import { Transaction, Client, TransactionResponse } from '@hashgraph/sdk';
import { HttpProviderBase } from '@arianelabs/hweb3-core-helpers';
import { HttpProvider } from '@arianelabs/hweb3-providers-http';

export { default as BatchManager } from './batch.js';

/**
 * It's responsible for passing messages to providers
 * It's also responsible for polling the ethereum node for incoming messages
 * Default poll timeout is 1 second
 * Singleton
 *
 * @param {HttpProviderBase} provider
 *
 * @constructor
 */
var RequestManager = function RequestManager(provider) {
    this.provider = null;
    this.providers = RequestManager.providers;

    this.setProvider(provider);
    this.subscriptions = new Map();
};


RequestManager.givenProvider = givenProvider;

RequestManager.providers = {
    HttpProvider: HttpProvider,
};


/**
 * Should be used to set provider of request manager
 *
 * @method setProvider
 *
 * @param {HttpProviderBase} provider
 *
 * @returns void
 */
RequestManager.prototype.setProvider = function (provider) {
    if (!provider && typeof provider !== 'object') {
        throw new Error('Can\'t set provider for "' + provider + '"');
    }


    // reset the old one before changing, if still connected
    if (this.provider && this.provider.connected)
        this.clearSubscriptions();

    this.provider = provider || null;

    // listen to incoming notifications
    /*
        TODO: implement subscription
    if (this.provider && this.provider.on) {
        if (typeof provider.sendRequest === 'function') { // EIP-1193 provider
            this.provider.on('message', function (payload) {
                if (payload && payload.type === 'eth_subscription' && payload.data) {
                    const data = payload.data
                    if (data.subscription && _this.subscriptions.has(data.subscription)) {
                        _this.subscriptions.get(data.subscription).callback(null, data.result);
                    }
                }
            });
        } else { // legacy provider subscription event
            this.provider.on('data', function data(result, deprecatedResult) {
                result = result || deprecatedResult; // this is for possible old providers, which may had the error first handler

                // if result is a subscription, call callback for that subscription
                if (result.method && result.params && result.params.subscription && _this.subscriptions.has(result.params.subscription)) {
                    _this.subscriptions.get(result.params.subscription).callback(null, result.params.result);
                }
            });
        }

        // resubscribe if the provider has reconnected
        this.provider.on('connect', function connect() {
            _this.subscriptions.forEach(function (subscription) {
                subscription.subscription.resubscribe();
            });
        });

        // notify all subscriptions about the error condition
        this.provider.on('error', function error(error) {
            _this.subscriptions.forEach(function (subscription) {
                subscription.callback(error);
            });
        });

        // notify all subscriptions about bad close conditions
        const disconnect = function disconnect(event) {
            if (!_this._isCleanCloseEvent(event) || _this._isIpcCloseError(event)) {
                _this.subscriptions.forEach(function (subscription) {
                    subscription.callback(errors.ConnectionCloseError(event));
                    _this.subscriptions.delete(subscription.subscription.id);
                });

                if (_this.provider && _this.provider.emit) {
                    _this.provider.emit('error', errors.ConnectionCloseError(event));
                }
            }
            if (_this.provider && _this.provider.emit) {
                _this.provider.emit('end', event);
            }
        };
        // TODO: Remove close once the standard allows it
        this.provider.on('close', disconnect);
        this.provider.on('disconnect', disconnect);

        // TODO add end, timeout??
    }
     */
};

/**
 * Asynchronously send request to provider.
 * Prefers to use the `request` method available on the provider as specified in [EIP-1193](https://eips.ethereum.org/EIPS/eip-1193).
 * If `request` is not available, falls back to `sendAsync` and `send` respectively.
 * @method send
 * @param {Transaction} tx
 * @param {Function} callback
 */
RequestManager.prototype.send = async function (tx, callback) {
    callback = callback || function () { };

    if (!this.provider) {
        return callback(errors.InvalidProvider());
    }

    try {
        const repsponse = await this.provider.sendRequest(tx);

        return callback(null, repsponse);
    } catch (e) {
        return callback(e);
    }
};

/**
 * Should be used to take transaction receipt
 *
 * @method getReceipt
 * @param {TransactionResponse} txResponse
 * @param {Function} callback triggered on end with (err, result)
 */
RequestManager.prototype.getReceipt = async function (txResponse, callback) {
    callback = callback || function () { };

    if (!this.provider) {
        return callback(errors.InvalidProvider());
    }

    try {
        const receipt = await this.provider.waitForReceipt(txResponse);

        return callback(null, receipt);
    } catch (e) {
        return callback(e);
    }
};
/**
 * Asynchronously send batch request.
 * Only works if provider supports batch methods through `sendAsync` or `send`.
 * @method sendBatch
 * @param {Array.<Transaction>} txs - array of payload objects
 * @param {Function} callback
 */
RequestManager.prototype.sendBatch = function (txs, callback) {
    //
    // if (!this.provider) {
    //     return callback(errors.InvalidProvider());
    // }
    //
    // var payload = Jsonrpc.toBatchPayload(data);
    // this.provider[this.provider.sendAsync ? 'sendAsync' : 'send'](payload, function (err, results) {
    //     if (err) {
    //         return callback(err);
    //     }
    //
    //     if (!Array.isArray(results)) {
    //         return callback(errors.InvalidResponse(results));
    //     }
    //
    //     callback(null, results);
    // });

    return callback('Not supported');
};


/**
 * Waits for notifications
 *
 * @method addSubscription
 * @param {Subscription} subscription         the subscription
 * @param {String} type         the subscription namespace (eth, personal, etc)
 * @param {Function} callback   the callback to call for incoming notifications
 */
RequestManager.prototype.addSubscription = function (subscription, callback) {
    if (this.provider.on) {
        this.subscriptions.set(
            subscription.id,
            {
                callback: callback,
                subscription: subscription
            }
        );
    } else {
        throw new Error('The provider doesn\'t support subscriptions: ' + this.provider.constructor.name);
    }
};

/**
 * Waits for notifications
 *
 * @method removeSubscription
 * @param {String} id           the subscription id
 * @param {Function} callback   fired once the subscription is removed
 */
RequestManager.prototype.removeSubscription = function (id, callback) {
    if (this.subscriptions.has(id)) {
        var type = this.subscriptions.get(id).subscription.options.type;

        // remove subscription first to avoid reentry
        this.subscriptions.delete(id);

        // then, try to actually unsubscribe
        this.send({
            method: type + '_unsubscribe',
            params: [id]
        }, callback);

        return;
    }

    if (typeof callback === 'function') {
        // call the callback if the subscription was already removed
        callback(null);
    }
};

/**
 * Should be called to reset the subscriptions
 *
 * @method reset
 *
 * @returns {boolean}
 */
RequestManager.prototype.clearSubscriptions = function (keepIsSyncing) {
    try {
        var _this = this;

        // uninstall all subscriptions
        if (this.subscriptions.size > 0) {
            this.subscriptions.forEach(function (value, id) {
                if (!keepIsSyncing || value.name !== 'syncing')
                    _this.removeSubscription(id);
            });
        }

        //  reset notification callbacks etc.
        if (this.provider.reset)
            this.provider.reset();

        return true;
    } catch (e) {
        throw new Error(`Error while clearing subscriptions: ${e}`)
    }
};

/**
 * Evaluates WS close event
 *
 * @method _isCleanClose
 *
 * @param {CloseEvent | boolean} event WS close event or exception flag
 *
 * @returns {boolean}
 */
RequestManager.prototype._isCleanCloseEvent = function (event) {
    return typeof event === 'object' && ([1000].includes(event.code) || event.wasClean === true);
};

/**
 * Detects Ipc close error. The node.net module emits ('close', isException)
 *
 * @method _isIpcCloseError
 *
 * @param {CloseEvent | boolean} event WS close event or exception flag
 *
 * @returns {boolean}
 */
RequestManager.prototype._isIpcCloseError = function (event) {
    return typeof event === 'boolean' && event;
};

export const Manager = RequestManager;
