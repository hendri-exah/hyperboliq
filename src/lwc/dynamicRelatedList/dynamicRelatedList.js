/**
 * Created by hendri on 2024/08/10.
 */

import { LightningElement, wire, api } from 'lwc';
import { getRelatedListRecords } from "lightning/uiRelatedListApi";
import { updateRecord } from 'lightning/uiRecordApi';
import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

const columns = [
    { label: 'First Name', fieldName: 'FirstName', editable: true },
    { label: 'Last Name', fieldName: 'LastName', editable: true },
    { label: 'Mobile', fieldName: 'MobilePhone', type: 'phone', editable: true }
];

export default class DynamicRelatedList extends LightningElement {
    @api recordId;
    columns = columns;
    draftValues = [];
    error;
    records;

    @wire(getRelatedListRecords, {
        parentRecordId: '$recordId',
        relatedListId: 'Contacts__r',
        fields: ['Contact.Id', 'Contact.FirstName', 'Contact.LastName', 'Contact.MobilePhone'],
        sortBy: ['Contact.Name']
    })
    listInfo({error, data}) {
        if (data) {
            // Convert related list record collection into datatable records
            this.records = [];
            data.records.forEach(recordInfo => {
                let record = {};
                Object.entries(recordInfo.fields).forEach(([fieldName, fieldInfo]) => {
                    record[fieldName] = fieldInfo.value;
                });
                this.records.push(record);
            });
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.records = undefined;
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error while fetching records',
                    message: error.body.message,
                    variant: 'error'
                })
            );
        }
    }
    async handleSave(event) {
        // Convert datatable draft values into record objects
        const records = event.detail.draftValues.slice().map((draftValue) => {
            const fields = Object.assign({}, draftValue);
            return { fields };
        });

        // Clear all datatable draft values
        this.draftValues = [];

        try {
            // Update all records in parallel thanks to the UI API
            const recordUpdatePromises = records.map((record) =>
                updateRecord(record)
            );
            await Promise.all(recordUpdatePromises);

            // Report success with a toast
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Contacts updated',
                    variant: 'success'
                })
            );

            // Display fresh data in the datatable
            await refreshApex(this.records);
        } catch (error) {
            this.error = error;
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error while updating or refreshing records',
                    message: error.body.message,
                    variant: 'error'
                })
            );
        }
    }
}