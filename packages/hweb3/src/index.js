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
 * @authors:
 *   Fabian Vogelsteller <fabian@ethereum.org>
 *   Gav Wood <gav@parity.io>
 *   Jeffrey Wilcke <jeffrey.wilcke@ethereum.org>
 *   Marek Kotewicz <marek@parity.io>
 *   Marian Oancea <marian@ethereum.org>
 * @date 2017
 */

"use strict";


import Eth from '@micdeb-ariane/hweb3-eth';
import { packageInit, addProviders } from '@micdeb-ariane/hweb3-core';
import Personal from '@micdeb-ariane/hweb3-eth-personal';

var version = require('../package.json').version;
// var Net = require('@micdeb-ariane/hweb3-net');
// var Shh = require('@micdeb-ariane/hweb3-shh');
// var utils = require('@micdeb-ariane/hweb3-utils');

var Web3 = function Web3() {
    var _this = this;

    // sets _requestmanager etc
    packageInit(this, arguments);

    this.version = version;
    // this.utils = utils;

    this.eth = new Eth(this);
    // this.shh = new Shh(this);

    // overwrite package setProvider
    var setProvider = this.setProvider;
    this.setProvider = function (provider, net) {
        /*jshint unused: false */
        setProvider.apply(_this, arguments);

        _this.eth.setRequestManager(_this._requestManager);
        _this.shh.setRequestManager(_this._requestManager);
        _this.bzz.setProvider(provider);

        return true;
    };
};

Web3.version = version;
// Web3.utils = utils;
Web3.modules = {
    Eth: Eth,
    // Net: Net,
    Personal: Personal,
    // Shh: Shh,
};

addProviders(Web3);

export default Web3;

