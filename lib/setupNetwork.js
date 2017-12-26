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
       //add adjuster participants
       .then(function() { 
        return getParticipantRegistry(NS + '.Adjuster')
     })
     .then(function (participantRegistry) {
        console.log('**rlb - in add Adjuster');
        var p1 = factory.newResource(NS, 'Adjuster', '00001');
        p1.name = 'IcI';
        p1.email = 'ICIprodsupport@email.com';
        p1.phone = '888-888-8888';
        var p2 = factory.newResource(NS, 'Adjuster', '00002');
        p2.name = 'Stlouis';
        p2.email = 'FinOpsprodsupport@email.com';
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