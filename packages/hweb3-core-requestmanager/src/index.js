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
import {
    Transaction, TransactionResponse,
    Executable, ContractCreateFlow,
} from '@hashgraph/sdk';
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
    if (!provider || typeof provider !== "object") {
        throw new Error('Can\'t set provider for "' + provider + '"');
    }

    this.provider = provider || null;
};

/**
 * Asynchronously send request to provider.
 * Prefers to use the `request` method available on the provider as specified in [EIP-1193](https://eips.ethereum.org/EIPS/eip-1193).
 * If `request` is not available, falls back to `sendAsync` and `send` respectively.
 * @method send
 * @param {Executable | ContractCreateFlow} tx
 * @param {Function} callback
 */
RequestManager.prototype.send = async function (tx, callback) {
    callback = callback || function () { };

    if (!this.provider) {
        return callback(errors.InvalidProvider());
    }

    try {
        const response = await this.provider.sendRequest(tx);

        return callback(null, response);
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
    return callback('Not supported');
};

export const Manager = RequestManager;
