/**
 * Created by hendri on 2024/08/10.
 */

public with sharing class ContactTriggerHandler {
    public static void updateMedicalInfo(List<Contact> contacts) {
        List<Id> medicalInfoIds = new List<Id>();
        Map<Contact, Medical_Info__c> contact2medicalInfo = new Map<Contact, Medical_Info__c>();
        for (Contact c : contacts) {
            if (String.isBlank(c.Medical_Info__c)) {
                contact2medicalInfo.put(
                        c,
                        new Medical_Info__c(
                                Name = c.FirstName + ' ' + c.LastName
                        )
                );
            }
            else {
                medicalInfoIds.add(c.Medical_Info__c);
            }
        }
        Map<Id, Medical_Info__c> id2medicalInfo = new Map<Id, Medical_Info__c>([
                SELECT Id, Name
                FROM Medical_Info__c
                WHERE Id IN :medicalInfoIds
        ]);
        for (Contact c : contacts) {
            if (String.isBlank(c.Medical_Info__c)) continue;
            Medical_Info__c medicalInfo = id2medicalInfo.get(c.Medical_Info__c);
            String contactName = c.FirstName + ' ' + c.LastName;
            if (contactName != medicalInfo.Name) {
                medicalInfo.Name = contactName;
                contact2medicalInfo.put(c, medicalInfo);
            }
        }
        upsert contact2medicalInfo.values();
        for (Contact c : contact2medicalInfo.keySet()) {
            if (String.isBlank(c.Medical_Info__c)) {
                c.Medical_Info__c = contact2medicalInfo.get(c).Id;
            }
        }
    }
    public static void deleteMedicalInfo(List<Contact> contacts) {
        List<Medical_Info__c> medicalInfoList = new List<Medical_Info__c>();
        for (Contact c : contacts) {
            if (String.isNotBlank(c.Medical_Info__c)) {
                medicalInfoList.add(new Medical_Info__c(Id = c.Medical_Info__c));
            }
        }
        delete medicalInfoList;
    }
}