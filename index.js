'use strict';
 
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const {WebhookClient} = require('dialogflow-fulfillment');
const {Card, Suggestion} = require('dialogflow-fulfillment');

admin.initializeApp({
	credential: admin.credential.applicationDefault(),
  	databaseURL: '<your firebase database URL>'
});

process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements
 
exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });
  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
 
  function welcome(agent) {
    agent.add(`Welcome to YOYO's Pizza!\nwhat pizza you would like to order?\nveg or non-veg?`);
  }
 
  function fallback(agent) {
    agent.add(`I didn't understand`);
    agent.add(`I'm sorry, can you try again?`);
  }

  function findMyOrder(agent) {
    console.log("inside findMyOrder ........ ");
    var orderId = agent.parameters.orderId;
    const now = new Date().valueOf();
    console.log("##### "+ orderId);
    console.log("##### "+ ((now - orderId)/ 60000));
    if (((now - orderId)/ 60000) > 30){
        agent.add(`your order is delivered`);
    } 
    else{
        agent.add(`your order is on your way`);
    } 
  }
    function addorder(agent){
    const pizzatype = agent.parameters.type;
    const pizzasize = agent.parameters.size;
    const pizzacount = agent.parameters.count;
    const customername = agent.parameters.name;
    const customerphone = agent.parameters.phonenumber;
    const customeraddress = agent.parameters.address;
    const orderId = new Date().valueOf();
    agent.add(`thanks ` + customername + `! your order ` + orderId + ` has been placed`);
    return admin.database().ref('/PizzaOrder').set({
      	pizzatype: pizzatype,
      	pizzasize: pizzasize,
      	pizzacount: pizzacount,
      customername: customername,
      customerphone: customerphone,
      customeraddress: customeraddress,
      orderId: orderId
    });
  }

  let intentMap = new Map();
  intentMap.set('Default Fallback Intent', fallback);
  intentMap.set('Order', addorder);
  intentMap.set('welcome', welcome);
  intentMap.set('findMyOrder', findMyOrder);
  agent.handleRequest(intentMap);
});
