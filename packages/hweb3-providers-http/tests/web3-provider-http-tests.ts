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
 * @file web3-provider-http-tests.ts
 * @author Josh Stevens <joshstevens19@hotmail.co.uk> , Samuel Furter <samuel@ethereum.org>
 * @date 2018
 */

import { HttpProvider } from '../src';
import { Client, Transaction } from '@hashgraph/sdk';
import { proto } from '@hashgraph/proto/lib/proto';

require("dotenv").config();

const accountId = process.env.MY_ACCOUNT_ID;
const privateKey = process.env.MY_PRIVATE_KEY;

const client = Client.forTestnet();
client.setOperator(accountId, privateKey);

const httpProvider = new HttpProvider(client);

// $ExpectType boolean
httpProvider.disconnect();

// $ExpectType LedgerId
httpProvider.getLedgerId();

// $ExpectType {[key: string]: string | AccountId}
httpProvider.getNetwork();

// $ExpectType {[key: string]: string | AccountId}
httpProvider.getMirrorNetwork();

// $ExpectType Promise<AccountBalance>
httpProvider.getAccountBalance(accountId).then(r => r);

// $ExpectType Promise<AccountInfo>
httpProvider.getAccountInfo(accountId).then(r => r);
