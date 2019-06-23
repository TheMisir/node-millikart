/*************************************************
 * MILLIKART.JS - Accept credit/debit card
 *                payments online
 * 
 * @author Misir Jafarov <misir.xyz>
 * 
 *************************************************/

const crypto = require('crypto');
const fxp = require('fast-xml-parser');

const MILLIKART = {
    origin: {
        test: 'http://test.millikart.az:8513',
        prod: 'https://pay.millikart.az'
    },
    action: '/gateway/payment/'
};

class MKRequestBuilder {
    constructor(action) {
        this.action = action;
        switch (action) {
            case 'register':
                this.options = {
                    mid: '',
                    currency: '944',
                    language: 'az',
                    description: '',
                    amount: 0,
                    reference: ''
                };
                break;

            case 'status':
                this.options = {
                    mid: '',
                    reference: ''
                };
                break;

            default:
                this.options = {};
                break;
        }
    }

    auth(mid, secret) {
        this.set('mid', mid);
        this.secret = secret;
        return this;
    }

    set(name, value) {
        this.options[name] = value;
        return this;
    }

    setCurrency(currency = '944') {
        return this.set('currency', currency);
    }
    
    setLanguage(language = 'az') {
        return this.set('language', language);
    }

    testMode(enabled = true) {
        this.testMode = enabled;
        return this;
    }

    setDescription(description) {
        return this.set('description', description);
    }

    setAmount(amount, currency) {
        if (currency && currency !== false) {
            this.setCurrency(currency);
        }
        if (currency !== false) {
            amount *= 100;
        }
        return this.set('amount', amount);
    }

    setReference(reference) {
        return this.set('reference', reference);
    }

    async execute() {
        if (this.action == 'register' && !this.options.signature) {
            this.sign();
        }

        var url = MILLIKART.origin[this.testMode ? 'test' : 'prod'];
            + MILLIKART.action
            + this.action;
            + '?'
            + urlencode(this.options);

        var response = await fetch({ url });
        var xml = fxp.parse(await response.text());
        return xml && xml.response;
    }

    sign() {
        var data = '';
        ['mid', 'amount', 'currency', 'description', 'reference', 'language'].forEach(key => {
            var value = (this.options[key] || '').toString();
            data += value.length;
            data += value;
        });
        data += this.secret;

        data = crypto.createHash('md5').update(data).digest('hex');
        data = data.toUpperCase();

        return this.set('signature', data);
    }
}

function urlencode(params) {
    var result = '';
    Object.keys(params).forEach(key => {
        result += `&${key}=${encodeURIComponent(params[key])}`;
    });
    return result.substr(1);
}

class MilliKart {
    constructor(mid, secret) {
        this.mid = mid;
        this.secret = secret;
    }

    /**
     * Create new RequestBuilder instance
     * @param {string} action Request action
     * @param {boolean} auth Use authorization keys
     */
    create(action, auth = true) {
        var builder = new MKRequestBuilder(action);
        if (auth) {
            builder.auth(this.mid, this.secret);
        }
        return builder;
    }

    /**
     * Initialize new transaction
     * @returns {MKRequestBuilder}
     */
    register() {
        return this.create('register');
    }

    /**
     * Fetch information about transaction status
     * @param {string} ref Transaction reference (unique transaction value set by merchant)
     * @returns {MKRequestBuilder}
     */
    status(ref = '') {
        var builder = this.create('status');
        if (ref) {
            builder.setReference(ref);
        }
        return builder;
    }

    /**
     * Callback handler for Express
     * @param {(status, data, req, res, next) => {}} handler Called when response is available
     */
    callback(handler) {
        return async (req, res, next) => {
            try {
                const { reference } = req.query;
                if (reference) {
                    var response = await this.status(reference).execute();
                    handler(response.RC == '000', response, req, res, next);
                } else {
                    handler(false, null, req, res, next);
                }
            } catch (e) {
                handler(false, null, req, res, next);
            }
        }
    }
}

exports = (mid, secret) => new MilliKart(mid, secret);
exports.MilliKart = MilliKart;