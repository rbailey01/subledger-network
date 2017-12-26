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
        // format the invoice 
        var invoice = factory.newResource(NS, 'Invoice', tx.invNo);
        invoice.invoiceAmount = tx.amount;
        invoice.currentBalance = tx.amount;
        invoice.termsCd = tx.termsCd;
        //invoice.crtDt = '2017-01-08';
        invoice.invDt = tx.invDt;
        invoice.invDueDt = tx.invDueDt;
        switch (invoice.termsCd) {
          case '01':
            //console.log('rlb** termsCd = 01');
            //add 30 days to invoice date to get invDueDt
        	  invoice.invDueDt = new Date(tx.invDt +30); //does not work
            break;
          default: 
            //console.log('rlb** default terms code');
            invoice.termsCd = '01';
            //add invDt + 30
            break;
        }    
        invoice.createdBy = tx.biller.name
        invoice.adjustmentLog = [];
 
        return getAssetRegistry(NS + '.Account')
          .then(function(accountAssetRegistry) {
             //console.log('**rlb -account = ', tx.accountId)
          	 return accountAssetRegistry.exists(tx.accountId) 
          })
          .then(function(exists) {  
             // Process the the boolean result.
             //console.log('**rlb - Account found', exists); 
             if (exists) {  
               return getAssetRegistry(NS + '.Invoice')
               .then(function(invoiceRegistry) {
                  // add the invoice
                 invoice.account = factory.newRelationship(NS, 'Account', tx.accountId);
                 return invoiceRegistry.add(invoice);
               });
             }
            else {
              console.log('**rlb - Account NOT found', tx.accountNo)
              //don't want to error but save transaction details so a new asset type??
              return (error)
            }
          }) 
          .catch(function (error) {
            // Add optional error handling here.
            //don't want to error but save xaction, 
            //for example duplicate invoice situation
            console.log('**rlb - ERROR - postInvoice', error);
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
      
        if (tx.accountId == tx.invoice.account.accountId) {
          	console.log('**rlb accounts MATCH', tx.accountId) 

           // format the lineItem  
           var tmpLidId = tx.invoice.invoiceId + Math.floor(Date.now());
           var lineItem = factory.newResource(NS, 'Adjustment', tmpLidId);
           lineItem.recType = 'PAYMENT',
           lineItem.tranDt = tx.tranDt;  
           lineItem.postDt = new Date();
           lineItem.amount = tx.amount;
           lineItem.reasonCd = tx.reasonCd;
           lineItem.createdBy = tx.remiter.name;
    
           return getAssetRegistry(NS + '.Adjustment')
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
                invoice.currentBalance += lineItem.amount;
                if (invoice.currentBalance == 0) {
                    invoice.paidDt = new Date();
                }  
                invoice.adjustmentLog.push( lineItem); 
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
     * Post Adjustment transaction processor function.
     * @param {org.subledger.transactions.postAdjustment} tx The adjustment transaction.
     * @transaction
     */
    function postAdjustment(tx) {
      
        var factory = getFactory();
        var NS = 'org.subledger.assets';
        console.log('**rlb - postAdjustment NS = ', NS);
      
        if (tx.accountId == tx.invoice.account.accountId) {
          	console.log('**rlb accounts MATCH', tx.accountId) 

           // format the lineItem  
           var tmpLidId = tx.invoice.invoiceId + Math.floor(Date.now());
           var lineItem = factory.newResource(NS, 'Adjustment', tmpLidId);
           lineItem.recType = 'ADJUSTMENT',
           lineItem.tranDt = tx.tranDt;  
           lineItem.postDt = new Date();
           lineItem.amount = tx.amount;
           lineItem.reasonCd = tx.reasonCd;
           lineItem.createdBy = tx.adjuster.name;
    
           return getAssetRegistry(NS + '.Adjustment')
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
                invoice.currentBalance += lineItem.amount;
                if (invoice.currentBalance == 0) {
                    invoice.paidDt = new Date();
                }  
                invoice.adjustmentLog.push( lineItem); 
                return invoiceRegistry.update(invoice);
             });
        } 
        else {
          console.log('**rlb accounts DONT match', tx.accountId,  tx.invoice.accountId)
          var adjErrorEvent = factory.newEvent('org.subledger.transactions', 'AdjNotPostedEvent');
          adjErrorEvent.transaction = tx.accountId;
          adjErrorEvent.message = 'Account on tx does not = account on invoice being adjusted';
          console.log('**rlb emit event ', adjErrorEvent);
          emit(adjErrorEvent);
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