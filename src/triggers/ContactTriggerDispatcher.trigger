/**
 * Created by hendri on 2024/08/10.
 */

trigger ContactTriggerDispatcher on Contact (before insert, before update, before delete) {
    if (Trigger.isInsert || Trigger.isUpdate) {
        ContactTriggerHandler.updateMedicalInfo(Trigger.new);
    } else if (Trigger.isDelete) {
        ContactTriggerHandler.deleteMedicalInfo(Trigger.old);
    }
}