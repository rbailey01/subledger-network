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
        invoice.accountId = tx.accountId;
        invoice.balance = tx.amount;
        invoice.termsCd = tx.termsCd;
        invoice.invDt = tx.invDt;
        invoice.invDueDt = tx.invDueDt;
        invoice.paidDt = '0001-01-01';
  
        return getAssetRegistry(NS + '.Account')
          .then(function(accountAssetRegistry) {
             console.log('**rlb -account = ', tx.accountId)
          	 return accountAssetRegistry.exists(tx.accountId) 
          })
          .then(function(exists) {  
             // Process the the boolean result.
             console.log('**rlb - Account found', exists); 
             if (exists) {  
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
                  return invoiceRegistry.add(invoice);
               });
             }
            else {
              console.log('**rlb - Account NOT found', tx.accountNo)
            }
        }) 
          .catch(function (error) {
            // Add optional error handling here.
            console.log('**rlb - postInvoice', error);
          });  
     } 
    
    /**
     * Post Payment transaction processor function.
     * @param {org.subledger.transactions.postPayment} tx The payment transaction.
     * @transaction
     */
    /**
     * Post Payment transaction processor function.
     * @param {org.subledger.transactions.postPayment} tx The payment transaction.
     * @transaction
     */
    function postPayment(tx) {
      
        var factory = getFactory();
        var NS = 'org.subledger.assets';
        console.log('**rlb - postPayment NS = ', NS);
      
        if (tx.accountId == tx.invoice.accountId) {
          	console.log('**rlb accounts MATCH', tx.accountId) 

           // format the lineItem  
           var tmpLidId = tx.invoice.invoiceId + Math.floor(Date.now());
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
        else {
          console.log('**rlb accounts DONT match', tx.accountId,  tx.invoice.accountId)
          var paymentErrorEvent = factory.newEvent('org.subledger.transactions', 'PaymentNotPostedEvent');
          paymentErrorEvent.transaction = tx.accountId;
          paymentErrorEvent.message = 'Account on tx does not = account on invoice being paid';
          console.log('**rlb emit event ', paymentErrorEvent);
          emit(paymentErrorEvent);
        }
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
            return accountAssetRegistry.get(tx.accountId);
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