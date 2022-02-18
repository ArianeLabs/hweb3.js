/*
    This file is part of hweb3.js.

    hweb3.js is free software: you can redistribute it and/or modify
    it under the terms of the GNU Lesser General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    hweb3.js is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Lesser General Public License for more details.

    You should have received a copy of the GNU Lesser General Public License
    along with hweb3.js.  If not, see <http://www.gnu.org/licenses/>.
*/
/** @file index.js
 * @authors: Mat Sas <mateusz.sas@arianelabs.com>
 * @date 2022
 */

"use strict";

var errors = require('web3-core-helpers').errors;
var oboe = require('oboe');
const { Client } = require('@hashgraph/sdk');

/**
 * `TestnetProvider` connects to Hedera's testnet network using  
 * @param {String} accountId 
 * @param {String} privateKey 
 */
const TestnetProvider = function TestnetProvider(accountId, privateKey) {
    const _this = this;
    this.connected = false;

    const client = Client.forTestnet()
    client.setOperator(accountId, privateKey)

    this.addDefaultEvents();
}

TestnetProvider.prototype.addDefaultEvents = function(){
    var _this = this;

    this.connection.on('connect', function(){
        _this.connected = true;
    });

    this.connection.on('close', function(){
        _this.connected = false;
    });

    this.connection.on('error', function(){
        _this._timeout();
    });

    this.connection.on('end', function(){
        _this._timeout();
    });

    this.connection.on('timeout', function(){
        _this._timeout();
    });
};
