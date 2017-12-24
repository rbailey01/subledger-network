'use strict';
/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Post Invoice transaction processor function.
 * @param {org.subledger.transactions.postInvoice} tx The Invoice transaction instance.
 * @transaction
 */
function postInvoice(tx) {
    
        var factory = getFactory();
        var NS = 'org.subledger.assets';
      
        console.log('**rlb - postInvoice NS = ', NS);
    
        // format the lineItem
        var tmpLidId = tx.invNo + Math.floor(Date.now());
        var lineItem = factory.newResource(NS, 'LineItem', tmpLidId);
        lineItem.recType = 'INVOICE',
        lineItem.lidDt = tx.tranDt; 
        lineItem.postDt = new Date().toISOString();
        lineItem.amount = tx.amount;
        lineItem.reasonCd = '';                             //not populated for INVOICE type
        lineItem.createdBy = tx.biller.name;
    
        // format the invoice 
        var invoice = factory.newResource(NS, 'Invoice', tx.invNo);
        invoice.balance = tx.amount;
        invoice.termsCd = tx.termsCd;
        invoice.invDt = tx.invDt;
        invoice.invDueDt = tx.invDueDt;
        invoice.paidDt = '0001-01-01';

        return getAssetRegistry(NS + '.LineItem')
          .then(function (lineItemRegistry) {
             // add the lineItem
             return lineItemRegistry.add(lineItem);
          })
          .then(function() {
             return getAssetRegistry(NS + '.Invoice');
          })
          .then(function(invoiceRegistry) {
             // add the invoice
             invoice.lineItems = [ factory.newRelationship(NS, 'LineItem', tmpLidId) ]; 
             invoice.account = factory.newRelationship(NS, 'Account', tx.account.accountId);
             return invoiceRegistry.add(invoice);
          }); 
     } 
    
    /**
     * Post Payment transaction processor function.
     * @param {org.subledger.transactions.postPayment} tx The payment transaction.
     * @transaction
     */
    function postPayment(tx) {
    
        var factory = getFactory();
        var NS = 'org.subledger.assets';
      
        console.log('**rlb - postPayment NS = ', NS);
      
        // format the lineItem  
        var tmpLidId = tx.invNo + Math.floor(Date.now());
        var lineItem = factory.newResource(NS, 'LineItem', tmpLidId);
        lineItem.recType = 'PAYMENT',
        lineItem.lidDt = tx.tranDt;  
        lineItem.postDt = new Date().toISOString();
        lineItem.amount = tx.amount;
        lineItem.reasonCd = tx.reasonCd;
        lineItem.createdBy = tx.remiter.name;
    
        return getAssetRegistry(NS + '.LineItem')
          .then(function (lineItemRegistry) {
             // add the lineItem
             return lineItemRegistry.add(lineItem);
          })
          .then(function() {
             return getAssetRegistry(NS + '.Invoice');
          })
          .then(function(invoiceRegistry) {
             // update the invoice
             var invoice = tx.invoice;
             invoice.balance += lineItem.amount;
             if (invoice.balance == 0) {
                 invoice.paidDt = new Date().toISOString();
             }  
             invoice.lineItems.push( factory.newRelationship(NS, 'LineItem', tmpLidId )); 
             return invoiceRegistry.update(invoice);
          });
    } 
    /**
     * get Account transaction processor function.
     * @param {org.subledger.transactions.getAccount} tx The Account transaction instance.
     * @transaction
    */
    function getAccount(tx) {
  
        var factory = getFactory();
        var NS = 'org.subledger.assets';
    
        console.log('**rlb - getAccount NS = ', NS);
        console.log('**rlb participant = ', getCurrentParticipant());
        // Get the Account asset registry.
        console.log('**rlb - verify account is found', tx.accountId);
        return getAssetRegistry(NS +'.Account')
          .then(function (accountAssetRegistry) {
            // Determine if the specific account exists in the account asset registry.
            return assetRegistry.get(tx.accountId);
          })
          .then(function (account) {
            // Process the the boolean result.
            console.log('**rlb - Account found', account);
          })    
          .catch(function (error) {
            // Add optional error handling here.
            console.log('**rlb - Account not found', error);
          });  
            
    }
    /**
     * Setup network function.
     * @param {org.subledger.transactions.setupNetwork} tx setup the network transaction instance.
     * @transaction
     */
    function setupNetwork(tx) {
      
        var factory = getFactory();
        var NS = 'org.subledger.participants';
        var NS1 = 'org.subledger.assets';

        console.log('**rlb - setupNetwork NS = ', NS);
        console.log('** rlb - setupNetwork NS1 = ', NS1);
      
        //add billing participants
        return getParticipantRegistry(NS + '.Billing')
          .then(function (participantRegistry) {
             console.log('**rlb - before var p1'); 
             var p1 = factory.newResource(NS, 'Billing', '00001');
             console.log('**rlb - after var p1');
             p1.name = 'ibrs';
             p1.email = 'ibrsprodsupport@email.com';
             p1.phone = '888-888-8888';
             console.log('before var p2');
             var p2 = factory.newResource(NS, 'Billing', '00002');
             console.log('**rlb - after var p2');
             p2.name = 'pb';
             p2.email = 'pbprodsupport@email.com';
             p2.phone = '888-888-8888'; 
             console.log('**rlb - before addAll', p1);     
             return participantRegistry.addAll([p1, p2]);
          })
          //add order entry participants
          .then(function() {
             return getParticipantRegistry(NS + '.OrderEntry')
          })
          .then(function (participantRegistry) {
             console.log('**rlb - in add OrderEntry'); 
             var p1 = factory.newResource(NS, 'OrderEntry', '00001');
             p1.name = 'cms';
             p1.email = 'cmsprodsupport@email.com';
             p1.phone = '888-888-8888';
             var p2 = factory.newResource(NS, 'OrderEntry', '00002');
             p2.name = 'pb';
             p2.email = 'pbprodsupport@email.com';
             p2.phone = '888-888-8888';      
             return participantRegistry.addAll([p1, p2]);
          })
           //add remiter participants
          .then(function() { 
             return getParticipantRegistry(NS + '.Remiter')
          })
          .then(function (participantRegistry) {
            console.log('**rlb - in add Remiter');
             var p1 = factory.newResource(NS, 'Remiter', '00001');
             p1.name = 'eMittance';
             p1.email = 'emitprodsupport@email.com';
             p1.phone = '888-888-8888';
             var p2 = factory.newResource(NS, 'Remiter', '00002');
             p2.name = 'ePay';
             p2.email = 'epayprodsupport@email.com';
             p2.phone = '888-888-8888';      
             return participantRegistry.addAll([p1, p2]);
          })
         //add account assets
          .then(function() {
               return getAssetRegistry(NS1 + '.Account')
          })     
          .then(function (assetRegistry) {
            console.log('**rlb - in add Account');
             var a1 = factory.newResource(NS1, 'Account', 'Y0000001');
             a1.firstName = 'joe';
             a1.lastName = 'smith';
             var a2 = factory.newResource(NS1, 'Account', 'Y0000002');
             a2.firstName = 'cindy';
             a2.lastName = 'jones';
             var a3 = factory.newResource(NS1, 'Account', 'U0000001');
             a3.firstName = 'US';
             a3.lastName = 'Storage';
             var a4 = factory.newResource(NS1, 'Account', 'U0000002');
             a4.firstName = 'Ian';
             a4.lastName = 'Franks';
             return assetRegistry.addAll([a1, a2, a3, a4]);
          });
    }