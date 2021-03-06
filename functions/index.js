'use strict';

const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser')

const functions = require('firebase-functions')
const admin = require('firebase-admin')

admin.initializeApp(functions.config().firebase);

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

const paypal = require('paypal-rest-sdk');

const stripe = require('stripe')(functions.config().stripe.testkey)

// paypal.configure({
//   'mode': 'sandbox', //sandbox or live
//   'client_id': 'AX_ac3tIQ-Mm_3y3WT400FOtKTehvYcSlpe3bvgXUyzwmvtbfaKB3-qMhl7LY0YJ7uXKHmdqiiiD9phn',
//   'client_secret': 'EBZCrebfkicALaKdNYxxcD8cGYfzWIZyYy5vD7Eq_4xxbImO-fl7thcpQrc72_tgvTxdXHHUGUG--1qQ'
// });

paypal.configure({
  'mode': 'live', //sandbox or live
  'client_id': 'AcNyOAAwZWq6zHNZs79IAggaJ__fakKbBkjPdmpdqJJrcVN1SgPUkcXasyQ9IY9RYtoNCpYtu8WGLsj5',
  'client_secret': 'EJ_r71J9yTKIFnoeZlOKAnVq3W-oC8odV0j8DwseiSadgP0ThGFDn3egfcz7i-4wJOp67OHISBJmxEq-'
});

//Con el routing de Express defino la función
app.post('/createPayment', function(req, res){

  //Se crea el objeto de pago de paypal
  var create_payment_json = {
    "intent": "sale",
    "payer": {
        "payment_method": "paypal"
    },
    "redirect_urls": {
      "return_url": `${req.protocol}://${req.get('host')}/process/executePayment`,
      "cancel_url": `${req.protocol}://${req.get('host')}/cancel`
    },
    "transactions": [{
        "item_list": {
            "items": [{
                "name": "item",
                "sku": "item",
                "price": req.body.amount,
                "currency": "MXN",
                "quantity": 1
            }]
        },
        "amount": {
            "currency": "MXN",
            "total": req.body.amount
        },
        "description": "Tiene que jalar ptm pf u.u"
    }]
};

//Se hace el cargo a paypal
paypal.payment.create(create_payment_json, function (error, payment) {
    if (error) {
        res.send(error);
    } else {

        //Se guarda en la bd la cantidad, usuario y transaccion actual
        let aux = {
          'amount': req.body.amount,
          'userID': req.body.uid,
          'transactionID': req.body.t_id
        };
        admin.database().ref(`/paypal/current`).set(aux);
        console.log("Create Payment Response");
        console.log(payment);
        res.send(payment);
    }
});
});

//Funcion cloud que ejecuta las acciones
exports.pay = functions.https.onRequest(app);

//SEGUNDO PASO PARA HACER EL PAGO
app.get('/executePayment/', function(req, res){
  var payment_Id = req.query.paymentId;
  var payer_id = req.query.PayerID;

   //Obtener los datos del actual
    return admin.database()
                .ref(`/paypal/current`)
                .once('value')
                .then(snapshot => {
                    return snapshot.val();
                 })
                 .then(customer => {
                   var execute_payment_json = {
                     "payer_id": payer_id,
                     "transactions": [{
                         "amount": {
                             "currency": "MXN",
                             "total": parseInt(customer.amount)
                         }
                     }]
                 };

                 var paymentId = payment_Id;

                 //Hacer el cargo a la persona y si todo salio bien redirigirlo
                 paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
                     if(payment.state === 'approved'){
                       res.redirect('https://www.cardpaymentoptions.com/wp-content/uploads/2015/10/Payment-Approved-Logo.png');
                       const date = Date.now();
                       //Guardar en la base de datos que si se pudo la operación
                       const ref = admin.database().ref('Fundings/currentProcess');
                       ref.push({
                         'paid': true,
                         'user': customer.userID,
                         'amount': customer.amount,
                         'date': date
                       });
                     }
                     else{
                       res.send(error);
                       throw error;
                     }
                 });

                 return true;

                 });
});

//Función cloud que ejecuta el proceso
exports.process = functions.https.onRequest(app);


exports.stripeCharge = functions.database
                                .ref('/Payments/{userId}/{paymentId}')
                                .onWrite((change,context) => {



  const payment = change.after.val();
  const userId = context.params.userId;
  const paymentId = context.params.paymentId;


  // checks if payment exists or if it has already been charged
  if (!payment || payment.charge) return;

  return admin.database()
              .ref(`/Users/${userId}`)
              .once('value')
              .then(snapshot => {
                  return snapshot.val();
               })
               .then(customer => {

                 const amount = payment.amount;
                 const idempotency_key = paymentId;  // prevent duplicate charges
                 const source = payment.token.id;
                 const currency = 'usd';
                 const charge = {amount, currency, source};


                 return stripe.charges.create(charge, { idempotency_key });

               })

               .then(charge => {

                   admin.database()
                        .ref(`/Payments/${userId}/${paymentId}/charge`)
                        .set(charge);

                        return true;
                  })


});
