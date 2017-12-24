# Subledger Business Network  --DEMO

> This demonstrates the core functionality of Hyperledger Composer and how receivable subledger can be managed by blockchain.

This business network defines:

**Participant**
`Billing`
`OrderEntry`
`Remitter`

**Asset**
`Account`
`Invoice`
`LineItem`

**Transaction**
`postInvoice`
`postPayment`
`setupNetwork`

**Event**
 N/A


OrderEntry is the owner of an Account, Billing is the owner of an Invoice, Remitter is the owner of a LineItem (payment)

an Account may have 0 to many Invoices, an Invoice may have 1 to many LineItem

setupNetwork will establish 2 of each Participant types (Billing, OrderEntry, Remitter) and setup for Account Assets
postInvoice can be used to create an invoice/account/billing system relationship
postPayment can be used to associate payments to an Invoice/Remitter


To test this Business Network Definition in the **Test** tab:


Submit a `postInvoice` transaction:

{
  "$class": "org.acme.receivables.postInvoice",
  "invNo": "00000001",
  "invDt": "2017-10-05",
  "amount": 475.05,
  "invDueDt": "2017-11-05",
  "tranDt": "2017-10-03",
  "termsCd": "01",
  "account": "resource:org.acme.receivables.Account#accountId:Y0000001",
  "biller": "resource:org.acme.receivables.Billing#billingId:00001"
}
```
After submitting this transaction, you should now see the transaction in the Transaction Registry and that an Invouce and associated LineItem Asset have been created for the account/billing system entered


Submit a `postPayment` transaction:

{
  "$class": "org.acme.receivables.postPayment",
  "invNo": "00000001",
  "amount": -475.05,
  "tranDt": "2017-10-20",
  "reasonCd": "118",
  "invoice": "resource:org.acme.receivables.Invoice#invoiceId:00000001",
  "remiter": "resource:org.acme.receivables.Remiter#remitId:00001"
}
```
After submitting this transaction, you should now see the transaction in the Transaction Registry and that the Invoice now has a new associated LineItem Asset and that the Invoice asset has been paid (amount = 0)

Congratulations!

