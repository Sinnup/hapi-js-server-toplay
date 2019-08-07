'use strict';

const Hapi = require('@hapi/hapi');
const Joi = require('@hapi/joi');
var braintree = require("braintree");
var credentials = require('./credentials');

const init = async () => {

    const server = Hapi.server({
        port: 3000,
        host: 'localhost'
    });

    server.route({
        method: 'GET',
        path: '/',

        handler: (request, h) => {

            return `Hey, let's try the endpoint 
                    '/my-testing-endpoint/<$your_country>
                    &name=<$your_name>
                    &location=<$any_location>'`
        }
    });

    server.route({
        method: 'GET',
        path:'/my-testing-endpoint/{country}',
        
        handler: (request, h) => {

            return `<h2>
                        <b>I'm testing my endpoint of: ${request.params.country}
                        with these query params My Name: ${request.query.name}
                        and location: ${request.query.location}
                        </b>
                    </h2>`;
        },
        options: {
            validate: {
                params: {
                    country: Joi.string().length(2)
                },
                query: {
                    name: Joi.string().required(),
                    location: Joi.string().required()
                }
            }
        }
    });

    server.route({
        method: 'GET',
        path:'/client_token',
        
        handler: (request, h) => {
            return generateToken();
        }
    });

    server.route({
        method: 'POST',
        path:'/checkout',
        
        handler: (request, h) => {
            var nonceFromTheClient = request.payload.payment_method_nonce;
            // Use payment method nonce here

            return new Promise((resolve, reject) => {
                gateway.transaction.sale({
                    amount: request.payload.ammount,
                    paymentMethodNonce: nonceFromTheClient,
                    options: {
                      submitForSettlement: true
                    }
                  }, function (err, result) {
                      resolve (result);
                  });
                });
        }
    });

    await server.start();
    console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {

    console.log(err);
    process.exit(1);
});

init();

//Include credentials of Braintree of sandbox environment
var gateway = braintree.connect( credentials );

  async function generateToken(){
      return new Promise((resolve, reject) => {
        gateway.clientToken.generate({
    
        }, function (err, response) {
            if(err){
                reject(err);
            }
            var clientToken = response.clientToken
            resolve(clientToken);
        });
        }).then( token =>{
            console.log(`Length of token: ${token.length}`);
            return token;
        });
  }
    
  