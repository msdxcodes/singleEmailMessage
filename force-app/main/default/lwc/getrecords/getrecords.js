import { LightningElement,api,track } from 'lwc';
import getResults from '@salesforce/apex/lwcApexController.getResults';
import insertjnRecord from '@salesforce/apex/lwcApexController.insertjnRecord';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
export default class PillContainer extends LightningElement {
 @api objectName = '';
    @api fieldName = '';
    @api Label='';
    @api txtclassname=''
    @api junctionObject=''
    @api parentIdApi=''
    @api childIdApi=''
    @track searchRecords = [];
    @track selectedRecords = [];
    @api required = false;
    @api iconName = 'standard:account'
    @api LoadingText = false;
    @api titleName=''
    @track txtclassname = 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click';
    @track messageFlag = false;

     @api recordId 
 

     @api myAttribute = 'Hello World';
 
    searchField(event) {

        var currentText = event.target.value;
        var selectRecId = [];
        for(let i = 0; i < this.selectedRecords.length; i++){
            selectRecId.push(this.selectedRecords[i].recId);
        }
        this.LoadingText = true;
        
        getResults({ ObjectName: this.objectName, fieldName: this.fieldName, value: currentText, selectedRecId : selectRecId })
        .then(result => {
            this.searchRecords= result;
            this.LoadingText = false;
            //console.log('result',result)
            this.txtclassname =  result.length > 0 ? 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click slds-is-open' : 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click';
            if(currentText.length > 0 && result.length == 0) {
                this.messageFlag = true;
            }
            else {
                this.messageFlag = false;
            }

            if(this.selectRecordId != null && this.selectRecordId.length > 0) {
                
                this.iconFlag = false;
                this.clearIconFlag = true;
            }
            else {
                this.iconFlag = true;
                this.clearIconFlag = false;
            }
        })
        .catch(error => {
            console.log('-------error-------------'+error);
            console.log(error);
             this.dispatchEvent(
        new ShowToastEvent({
        title: 'Error',
        message: error.body.message,
        variant: 'error'
      })
    );
        });
        
    }
    
    selectedRecordsList=[]
   setSelectedRecord(event) {
        var recId = event.currentTarget.dataset.id;
        this.selectedRecordsList.push(recId);
       console.log(JSON.stringify(this.selectedRecordsList))
        var selectName = event.currentTarget.dataset.name;
        let newsObject = { 'recId' : recId ,'recName' : selectName };
        this.selectedRecords.push(newsObject);
        this.txtclassname =  'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click';
        console.log('this.selectRecordId',this.selectedRecords)
        let selRecords = this.selectedRecords;
		this.template.querySelectorAll('lightning-input').forEach(each => {
            each.value = '';
        });
        const selectedEvent = new CustomEvent('selected', { detail: {selRecords}, });
        // Dispatches the event.
        this.dispatchEvent(selectedEvent);
    }

    removeRecord (event){
         console.log('removeId', event.target.name)
        let selectRecId2 = this.selectedRecordsList.filter((value)=>value !==event.target.name);
         console.log('selectRecId2', JSON.stringify(selectRecId2))
         this.selectedRecordsList=selectRecId2
        let selectRecId = [];
        for(let i = 0; i < this.selectedRecords.length; i++){
            if(event.detail.name !== this.selectedRecords[i].recId)
                selectRecId.push(this.selectedRecords[i]);
        }
        this.selectedRecords = [...selectRecId];
        let selRecords = this.selectedRecords;
        const selectedEvent = new CustomEvent('selected', { detail: {selRecords}, });
        // Dispatches the event.
        this.dispatchEvent(selectedEvent);
    }

    handleClick(){
    console.log('Account Id...:',this.recordId)
    console.log('contact Id...:',JSON.stringify(this.selectedRecords))
    insertjnRecord({junctionName:this.junctionObject, AccId:this.recordId, ParentName:this.parentIdApi, ChildName :this.childIdApi,selectedRecIds :this.selectedRecordsList})
    .then((result)=>{
         console.log('success'+JSON.stringify(result))
        console.log('Record created successfully')
        this.selectedRecords=[]
        this.selectedRecordsList=[]
        if(result.status==='Success')
        {
            this.dispatchEvent(
        new ShowToastEvent({
        title: 'Success',
        message: result.message+' Record(s) Created successfully',
        variant: 'success'
      })
    );
        }
        else{
             this.dispatchEvent(
        new ShowToastEvent({
        title: 'Info',
        message: result.message,
        variant: 'info'
      })
    );
            
        }
    })
    .catch(error=>{
        console.error('error'+JSON.stringify(error))
        var message
        if(error.body){
            if(error.body.message){
                message=error.body.message
            }else if(error.body.pageErrors){
               message= error.body.pageErrors[0].message
            }
        }     
        const event = new ShowToastEvent({
        title: 'Error',
        message: message,
        variant: 'error'
      })
    this.dispatchEvent(event);
    })
    
}

}