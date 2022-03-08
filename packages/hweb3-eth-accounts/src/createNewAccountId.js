const { AccountCreateTransaction } = require("@hashgraph/sdk");

const createNewAccountId = function(newAccountPrivateKey, cb) {
    var _this = this;

    const newAccountPublicKey = newAccountPrivateKey.publicKey;

    // Create the transaction
    const tx = new AccountCreateTransaction()
        .setKey(newAccountPublicKey);

    _this.currentProvider.send(tx, (error, response) => {
        if (error) {
            throw error;
        }

        _this.currentProvider.getReceipt(response, (error, response) => {
            if (error) {
                throw error;
            }

            const resp = Object.assign({}, response);
            resp.privateKey = newAccountPrivateKey;
            resp.publicKey = newAccountPublicKey;

            cb(resp);
        });
    });
};

module.exports = createNewAccountId;
