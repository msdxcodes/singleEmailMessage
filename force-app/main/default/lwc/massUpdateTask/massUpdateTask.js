import { LightningElement, wire, track, api } from 'lwc';
import searchTasks from '@salesforce/apex/searchrtask.searchTasks';
import updateTasks from '@salesforce/apex/getAllTasks.updateTasks';
import getUsers from '@salesforce/apex/getusers.getAllUsers';
import callTaskBasedOnAction from '@salesforce/apex/getAllTasks.callTaskBasedOnAction';
//import callTaskBasedOnActionnn from '@salesforce/apex/getAllTasks.callTaskBasedOnActionnn';
import { refreshApex } from '@salesforce/apex';
import { NavigationMixin } from 'lightning/navigation';


import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { getPicklistValues } from 'lightning/uiObjectInfoApi';
import PRIORITY_FIELD from '@salesforce/schema/Task.Priority';
import STATUS_FIELD from '@salesforce/schema/Task.Status';
// import DUEDATE_FIELD from '@salesforce/schema/Task.ActivityDate';
// import SUBJECT_FIELD from '@salesforce/schema/Task.Subject';
// import ASSIGNEDTO_FIELD from '@salesforce/schema/Task.OwnerId';


let i = 0;
export default class MassUpdateTask extends NavigationMixin (LightningElement) {
  @track USERS =[]
  @track items2=[];
  @track COLUMNS = [
  // { label: 'Task No', fieldName: 'MTA14__Task_Number__c', hideDefaultActions: true, sortable: true },

{ label: 'Task No', fieldName: 'MTA14__Task_Number__c', hideDefaultActions: true, sortable: true,type:'button',
    typeAttributes: {label: { fieldName: "MTA14__Task_Number__c" },
 name: "gotoTask", variant: "base"}
    },

{ label: 'Assigned To', fieldName: 'AssignedTo', hideDefaultActions:true, actions: this.USERS },  
 { label: 'Subject', fieldName: 'Subject', hideDefaultActions: true, sortable: true },
 {
    label: 'Priority', fieldName: 'Priority', hideDefaultActions: true, actions: [
      { label: 'High', checked: false, name: 'High' },
      { label: 'Normal', checked: false, name: 'Normal' },
      { label: 'Low', checked: false, name: 'Low' },]
  },
  {
    label: 'Status', fieldName: 'Status', hideDefaultActions: true, actions: [
      { label: 'Not Started', checked: false, name: 'Not Started' },
      { label: 'In Progress', checked: false, name: 'In Progress' },
      { label: 'Completed', checked: false, name: 'Completed' },
      { label: 'Deferred', checked: false, name: 'Deferred'}, ]
        },

  // { label: 'Description', fieldName: 'Description', sortable: true },
  { label: 'Due Date', fieldName: 'ActivityDate', hideDefaultActions: true, sortable: true, type: 'date', typeAttributes: { day: 'numeric', month: 'short', year: 'numeric' } },
  // { label: 'Name', fieldName: 'Whoname',type:'text', hideDefaultActions:true, sortable: true }
];
 notFound=false;
  connectedCallback() {
            
     getUsers()
      .then(result => {
                  this.items2=[];

        for (i = 0; i < result.length; i++) {
         this.items2 = [...this.items2, { label: result[i].Name,name: result[i].Name, checked: false}];
      }
      
      this.USERS.push(...this.items2);
        console.log('this.COLUMNS...'+JSON.stringify(this.USERS))
      //this.USERS.push(this.items2);
      console.log('this.items2...'+JSON.stringify(this.items2))
      })
        console.log('Hi This is Render' )
      }

  //Field Values
  subjectValue;
  priorityvalue;
  duedateValue;
  statusValue;
  assignedTovalue;
  // Get Picklist Values (Status, Priority,AssignedTo)
  statusPicklistValue = [];
  priorityPicklistValue = [];
  assigntoPicklistValue = [];
  @wire(getPicklistValues, {
    recordTypeId: '012000000000000AAA',
    fieldApiName: STATUS_FIELD
  })
  wiredstatusPicklistValue({ data, error }) {
    if (data) {
      console.log('DATA', data)

      this.statusPicklistValue = data.values;
    }
    if (error) {
      console.log('ERROR', error)
    }
  }
  @wire(getPicklistValues, {
    recordTypeId: '012000000000000AAA',
    fieldApiName: PRIORITY_FIELD
  })
  wiredpriorityPicklistValue({ data, error }) {
    if (data) {
      console.log('DATA', data)
      this.priorityPicklistValue = data.values;
    }
    if (error) {
      console.log('ERROR', error)
    }
  }
  // @wire (getPicklistValues,{
  //   recordTypeId:'012000000000000AAA',
  //   fieldApiName: ASSIGNEDTO_FIELD
  // })
  // wiredassigntoPicklistValue({data,error}){
  //   if(data){
  //     console.log('DATA',data)
  //     this.assigntoPicklistValue=data.values;
  //     console.log('assigntoPicklistValue',this.assigntoPicklistValue)
  //   }
  //   if(error){
  //     console.log('ERROR',message.error)
  //   }
  // }




  @track fields = [];
  // @track value;
  //  fields=[
  //   {label:'Subject',value:'Subject'},
  //   {label:'Priority',value:'Priority'},
  //   {label:'Due Date',value:'DueDate' },
  //   {label:'Status',value:'Status'},
  //   {label:'Assigned To',value:'AssignedTo'}
  // ]
  containSubject = false;
  containPriority = false;
  containActivityDate = false;
  containAssignedTo = false;
  containStatus = false;
  @track selectLabels = [];
  @track selectedLabels2 = [];
  value = [''];
  selectValue = '';
  @track selectValuecount;
  get options() {
    return [
      { label: 'Subject', value: 'Subject' },
      { label: 'Priority', value: 'Priority' },
      { label: 'Due Date', value: 'Due Date' },
      { label: 'Status', value: 'Status' },
      { label: 'Assigned To', value: 'Assigned To' }
    ];
  }
  get selectedValues() {
    return this.value.join(',');
  }
  //   selectedvalues=[];
  //  @track  value=[];
  @track tasks;
  @track selectedRows;
  @track error;
  @track searchTerm = '';

  //columns = COLUMNS;
  selectedRecs;
  selectedRecIds;
  selectedRecsCount;
  selectFieldsPopup = false;
  fillInfoPopup = false;


  wiredTaskList = []
  @wire(searchTasks, { searchTerm: '$searchTerm' })
  wiredTasks(result) {
    this.wiredTaskList = result;
    if (result.data) {
      console.log('dataresult.data.length', result.data.length)
        if(result.data.length==0){
          this.notFound=true;
        }
        else if(result.data.length>=1){
                    this.notFound=false;
        }
        if(this.searchTerm!=''){
          this.dataFiltered = true;
        }
      this.tasks = result.data.map(item => {

        return {
          ...item, AssignedTo: item.Owner.Name, 'Whoname': item.Who?.Name
        }



      });

      this.error = null;
    } 
    else if (result.error) {
      this.tasks = null;
      this.error = 'Error retrieving tasks.';
    }
  }
  /*getOwnerName(item)
  {
    return item.Who?.Name
  }*/
  // handleRowSelection(event) {
  //   this.selectedRows = event.detail.selectedRows;
  //   console.log('this.selectedRows ',this.selectedRows )
  // }

  handleSearchTermChange(event) {
    this.searchTerm = event.target.value;
  }
  onselectfields() {
    this.selectedRecs = this.template.querySelector('lightning-datatable').getSelectedRows();
    console.log('this.selectedRecs', JSON.stringify(this.selectedRecs))
    this.selectedRecsCount = this.selectedRecs.length;
    console.log('selectedRecsCount' + this.selectedRecsCount)
    if (this.selectedRecsCount >= 1) {
      const getIds = this.selectedRecs.map(records => records.Id);
      this.selectedRecIds = getIds
      this.selectFieldsPopup = true;

    }
    else if (this.selectedRecsCount < 1) {
      console.log('selectedRecsCount is 0')
      const showerr = new ShowToastEvent({
        title: '',
        message: 'Please Select the records',
        variant: 'error'

      });
      this.dispatchEvent(showerr);
    }

  }
  closeselecetFieldsPopup() {
    // this.selectedRecs=[];
    this.selectFieldsPopup = false;
    // this.template.querySelector('lightning-datatable').getSelectedRows=[];
    this.selectLabels = '';
    this.selectValuecount = '';
    console.log('selectLabels', this.selectLabels);
    this.subjectValue;
    this.priorityvalue;
    this.duedateValue;
    this.statusValue;
    this.assignedTovalue;

  }
  closesfillInfoPopup() {
    this.fillInfoPopup = false;
    this.selectValuecount;
    this.subjectValue;
    this.priorityvalue;
    this.duedateValue;
    this.statusValue;
    this.assignedTovalue;
    this.selectLabels = '';

  }


  handleChange(e) {
    this.selectValue = e.target.value;
    console.log('SelectedValues', JSON.stringify(this.selectValue));
    this.selectLabels = this.selectValue.map(option => this.options.find(o => o.value === option).label);
    console.log('selected labels.label => ' + this.selectLabels);
    this.selectValuecount = this.selectLabels.length;

  }
  onnext() {
    if (this.selectLabels.length == 0) {
      const showerr = new ShowToastEvent({
        title: '',
        message: 'Please select the fields',
        variant: 'error'

      });
      this.dispatchEvent(showerr);
    }
    else {
      this.selectedLabels2 = this.selectLabels;
      if (this.selectedLabels2.includes('Priority')) {
        this.containPriority = true;
        console.log('containPriority', this.containPriority)
      }
      if (this.selectedLabels2.includes('Due Date')) {
        this.containActivityDate = true;
        console.log('containActivityDate', this.containActivityDate)
      }
      if (this.selectedLabels2.includes('Subject')) {
        this.containSubject = true;
        console.log('containSubject', this.containSubject)

      }
      if (this.selectedLabels2.includes('Status')) {
        this.containStatus = true;
        console.log('containStatus', this.containStatus)

      }
      if (this.selectedLabels2.includes('Assigned To')) {
        this.containAssignedTo = true;
        console.log('containAssignedTo', this.containAssignedTo)

      }
      this.selectFieldsPopup = false;
      this.fillInfoPopup = true;
    }
  }
  backtoselectFieldsPopup() {
    this.selectFieldsPopup = true;
    this.fillInfoPopup = false;
    this.selectLabels = '';
    this.selectValuecount = '';
    this.containSubject = false;
    this.containPriority = false;
    this.containActivityDate = false;
    this.containAssignedTo = false;
    this.containStatus = false;
    this.subjectValue = null;
    this.priorityvalue = null;
    this.duedateValue = null;
    this.statusValue = null;
    this.assignedTovalue = null;

  }
  handlechangeSubject(event) {
    this.subjectValue = event.target.value;
    console.log('sub', this.subjectValue);
  }
  handleChangepriority(event) {
    this.priorityvalue = event.target.value;
    console.log('sub', this.priorityvalue);
  }

  handlechangeDuedate(event) {
    this.duedateValue = event.target.value
    //Date().toLocaleDateString
    console.log('this.dudateValue SS' + this.dudateValue)
    let checkDate = this.template.querySelector(".DateField");
    let dtValue = new Date(checkDate.value);
    var ToDate = new Date();
    let selectedDate1 = dtValue.setHours(0, 0, 0, 0)
    let currentDate = ToDate.setHours(0, 0, 0, 0);
    console.log('todayToDate.getDate()', ToDate.getDate())
    if (selectedDate1 < currentDate) {
      checkDate.setCustomValidity("You Can't Select Previous Date");
    } else {
      //if(new Date(dtValue).getDate() >= ToDate.getDate()) {
      checkDate.setCustomValidity("");
    }
    checkDate.reportValidity();

  }






  handleChangestatus(event) {
    this.statusValue = event.target.value;
    console.log('sub', this.statusValue);
  }
  lookupRecord(event) {
    this.assignedTovalue = event.detail.selectedRecord.Id;
    console.log('Selected Record Value on Parent Component is ' + JSON.stringify(event.detail.selectedRecord));
  }


  handleupdate() {
    if( this.subjectValue!=null || 
       this.duedateValue!=null || 
       this.statusValue!=null || 
       this.priorityvalue!=null || 
       this.assignedTovalue!=null){
        console.log('updtae');
        updateTasks({
          taskids: this.selectedRecIds,
          sub: this.subjectValue,
          duedate: this.duedateValue,
          status: this.statusValue,
          priority: this.priorityvalue,
          assignedTo: this.assignedTovalue
        })
          .then(result => {
            refreshApex(this.wiredTaskList);
            this.template.querySelector('lightning-datatable').selectedRows = [];
            this.fillInfoPopup = false;
            this.selectedRecIds = '';
            this.selectLabels = '';
            this.selectValuecount = '';
            this.containSubject = false;
            this.containPriority = false;
            this.containActivityDate = false;
            this.containAssignedTo = false;
            this.containStatus = false;
            this.subjectValue = null;
            this.priorityvalue = null;
            this.duedateValue = null;
            this.statusValue = null;
            this.assignedTovalue = null;
            const showerr = new ShowToastEvent({
              title: this.selectedRecsCount + ' Tasks',
              message: 'Updated Successfully',
              variant: 'success'
    
            });
            this.dispatchEvent(showerr);
            console.log('result' + JSON.stringify(result))
            //JSON.stringify();
    
          }).catch(error => {
            console.log('error' + JSON.stringify(error))
          })
    }
    else if (this.subjectValue==null && 
      this.duedateValue==null && 
      this.statusValue==null && 
      this.priorityvalue==null &&
      this.assignedTovalue==null){
        const showerr = new ShowToastEvent({
          title: 'Please',
          message: 'Fill the Value To Update',
          variant: 'error'

        });
        this.dispatchEvent(showerr);

    }
    


  }

  handleHeaderAction(event) {

    const actionName = event.detail.action.name;

    console.log('actionName ==')

    console.log('actionName ======>>>' + actionName)

    callTaskBasedOnAction({
      statusId: actionName
    })
      .then(result => {
        console.log('ressss' + result)
        // this.tasks=result;
        let tempRecords = result;
        if(tempRecords.length==0){
          this.notFound=true;
        }
        else if (tempRecords.length>=1){
          this.notFound=false;
    tempRecords = tempRecords.map(row => {
          return {
            ...row, AssignedTo: row.Owner.Name, 'Whoname': row.Who?.Name
          }
        })
        }

        
        this.tasks = tempRecords;
        this.dataFiltered = true;

      })

  }
  // clearfilter
  clearfilter() {
    const clearfilter = '';
    searchTasks({
      searchTerm: clearfilter
    })
      .then(result => {
        console.log('ressss' + result)
        // this.tasks=result;
        let tempRecords = result;
        tempRecords = tempRecords.map(row => {
          return {
            ...row, AssignedTo: row.Owner.Name, 'Whoname': row.Who?.Name
          }
        })
        this.tasks = tempRecords;
        this.dataFiltered = false;
        this.searchTerm='';
      })
  }

handleRowAction(event) {

        if (event.detail.action.name === "gotoTask") {

            this[NavigationMixin.Navigate]({

                type: "standard__recordPage",

                attributes: {

                    recordId: event.detail.row.Id,

                    actionName: "view"

                }

            })

        }

     }
}