import { LightningElement , wire, track} from 'lwc';
import searchTasks from '@salesforce/apex/searchrtask.searchTasks';
import createTask from '@salesforce/apex/TaskController.createTask';
import getContacts from '@salesforce/apex/TaskController.getContacts';
import getAccounts from '@salesforce/apex/TaskController.getAccounts';
import getUsers from '@salesforce/apex/getusers.getAllUsers';
import callTaskBasedOnAction from '@salesforce/apex/getAllTasks.callTaskBasedOnAction';
import { refreshApex } from '@salesforce/apex';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent'


let i = 0;
export default class NewTaskForm extends NavigationMixin (LightningElement) {


  @track USERS =[]
  @track items2=[];
  @track COLUMNS = [
    { label: 'Task No', fieldName: 'MTA14__Task_Number__c', hideDefaultActions: true, sortable: true, type:'button',
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
      { label: 'Deferred', checked: false, name: 'Deferred'},
     ]
  },

  { label: 'Due Date', fieldName: 'ActivityDate', hideDefaultActions: true, sortable: true, type: 'date', typeAttributes: { day: 'numeric', month: 'short', year: 'numeric' } },
];
 
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
handleClick(event) {
  // Retrieve the task number from the clicked row
  const taskNumber = event.target.dataset.tasknumber;

  // Navigate to the record page using the task number
  this[NavigationMixin.Navigate]({
    type: 'standard__recordPage',
    attributes: {
      recordId: taskNumber,
      objectApiName: 'Task',
      actionName: 'view'
    }
  });
  
    console.log('Working..');
}
 taskName;
     name;
     relatedTo;
     status='Not Started';
     priority;
     taskDescription;
     dueDate;
     subject;
     @track searchTerm='';
     isShowModal = false;
    selectedContactId;
    selectedAccountId;
    @track assignedTovalue;
    tasksresult=[];
    @track tasks;
    dataFiltered=false;
    @track shownewcreategif=true;
        accountOptions = [];
        contactOptions = [];

              @wire(getContacts)
        wiredContacts({ error, data }) {
            if (data) {
                this.contactOptions = data.map(contact => ({
                    label: contact.Name,
                    value: contact.Id
                }));
            } else if (error) {
                console.error(error);
            }
        }

         @wire(getAccounts)
        wiredAccounts({ error, data }) {
            if (data) {
                this.accountOptions = data.map(account => ({
                    label: account.Name,
                    value: account.Id
                }));
            } else if (error) {
                console.error(error);
            }
        }

wiredTaskList = []
    @wire(searchTasks, { searchTerm: '$searchTerm' })
    wiredTasks(result) {
      this.wiredTaskList = result;
      if (result.data) {
        console.log('data',result.data)
        
        if(this.searchTerm!=''){
          this.dataFiltered = true;
        }
        this.tasks=result.data.map(item => {
         
         return {
           ...item,AssignedTo:item.Owner.Name,'Whoname':item.Who?.Name
           }
           
         
        });
        if(this.tasks.length==0){
          this.shownewcreategif=true;
        }
        else if(this.tasks.length!=0){
          this.shownewcreategif=false;
        }
        this.error = null;
      } else if (result.error) {
        this.tasks = null;
        this.error = 'Error retrieving tasks.';
      }
    }

    // picklist values for status and priority fields
    statusList = [
        { label: 'Not Started', value: 'Not Started' },
        { label: 'In Progress', value: 'In Progress' },
        { label: 'Completed', value: 'Completed' },
    ];
    priorityList = [
        { label: 'Low', value: 'Low' },
        { label: 'Normal', value: 'Normal' },
        { label: 'High', value: 'High' },
    ];
   handleContactChange(event) {
            this.selectedContactId = event.detail.value;
            console.log('Contactid',this.selectedContactId);
        }

    handleRelatedToChange(event) {
        this.selectedAccountId = event.detail.value;
        console.log('Account id',this.selectedAccountId);
    }

    handleStatusChange(event) {
        this.status = event.target.value;
        console.log('status',this.status);
    }

    handlePriorityChange(event) {
        this.priority = event.target.value;
        console.log('priority',this.priority);
    }

    handleTaskDescriptionChange(event) {
        this.taskDescription = event.target.value;
        console.log('taskDescription',this.taskDescription);
    }
handleTaskSubjectChange(event) {
        this.subject = event.target.value;
    }
    handleDueDateChange(event) {
        this.dueDate = event.target.value;
        
        let checkDate=this.template.querySelector(".DateField");
      
        var dtValue = new Date(checkDate.value);
        var date = new Date();
        let selectedDate= dtValue.setHours(0,0,0,0)
        let currentDate=date.setHours(0,0,0,0);
        console.log('currentDate',currentDate); 
         console.log('selectedDate',selectedDate)
            
        if (selectedDate<currentDate){
            console.log('true')
            checkDate.setCustomValidity("You Can't Select Previous Date");
            
        } else{
            checkDate.setCustomValidity("");
            console.log('false')
        }
        checkDate.reportValidity();
    }

     
        
    
      lookupRecord(event) {
       this.assignedTovalue=event.detail.selectedRecord.Id;
        console.log('Selected Record Value on Parent Component is ' +  JSON.stringify(event.detail.selectedRecord));
    }

   save2()
    {
             createTask({
            name: this.selectedContactId,
            subject: this.subject,
            relatedTo: this.selectedAccountId,
            status: this.status,
            priority: this.priority,
            taskDescription: this.taskDescription,
            dueDate: this.dueDate,
            assignedTovalue : this.assignedTovalue
            
            
        })
            .then((result) => {
                console.log('result creating task: ', result);
                refreshApex(this.wiredTaskList);
                
                this.ToastMessageMethod('Success!','Task created successfully','success')
                
    
            // Hide the modal popup
        this.hideModalBox();
            console.log('result creating task: ', result);
             // Clear form values
            this.resetFormFields();

            })
            .catch(error => {
        
        console.log('error',error)
              console.log('subject',this.subject)
              if(this.subject===undefined||this.subject===null||this.status===undefined||this.status===null||this.priority===undefined||this.priority===null||this.dueDate===undefined||this.dueDate===null || this.assignedTovalue===null || this.assignedTovalue===undefined)
               {
                 this.ToastMessageMethod('Error!','Please Enter Required Fields' ,'error')
               }
               
             
                 
            });

           
    }

    
    savenew()
    {
             createTask({
            name: this.selectedContactId,
            subject: this.subject,
            relatedTo: this.selectedAccountId,
            status: this.status,
            priority: this.priority,
            taskDescription: this.taskDescription,
            dueDate: this.dueDate,
            assignedTovalue : this.assignedTovalue
            
            
        })
            .then((result) => {
                console.log('result creating task: ', result);
                refreshApex(this.wiredTaskList);
                 
                
                this.ToastMessageMethod('Success!','Task created successfully','success')
                
            // Hide the modal popup
        // this.hideModalBox();
            console.log('result creating task: ', result);
             this.resetFormFields();
            this.template.querySelector("c-custom-look-up").refreshlookupdata()
            //this.resetFormFields();
           // this.lookupRecord();


            })
            .catch(error => {
        
        console.log('error',error)
              console.log('subject',this.subject)
              if(this.subject===undefined||this.subject===null||this.status===undefined||this.status===null||this.priority===undefined||this.priority===null||this.dueDate===undefined||this.dueDate===null || this.assignedTovalue===null || this.assignedTovalue===undefined)
               {
                 this.ToastMessageMethod('Error!','Please Enter Required Fields' ,'error')
               }
               
               var ToDate = new Date();
               console.log('today',ToDate)

                console.log('this.dueDate',this.dueDate)
                 
            });

           
    }
    ToastMessageMethod(title,message,variant)
    {
         const event = new ShowToastEvent({
        title:title,
        message: message,
        variant: variant
       
    });
    this.dispatchEvent(event);
    }

showModalBox() {  
        this.isShowModal = true;
    }

    hideModalBox() {  
        this.isShowModal = false;
    }
     resetFormFields() {
                this.selectedContactId = null;
                this.subject = null;
                this.selectedAccountId = null;
                this.priority = null;
                this.taskDescription = null;
                this.dueDate = null;
               this.assignedTovalue= null;
}
  handleSearchTermChange(event){
        this.searchTerm=event.target.value;

        
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

        tempRecords = tempRecords.map(row => {
          return {
            ...row, AssignedTo: row.Owner.Name, 'Whoname': row.Who?.Name
          }
        })
        this.tasks = tempRecords;
        if(this.tasks.length==0){
          this.shownewcreategif=true;
        }
        this.dataFiltered = true;

      })

  }
refershtask(){
         const clearfilter='';
    searchTasks({
      searchTerm:  clearfilter
    })
    .then(result=>{
      console.log('ressss'+result)
   // this.tasks=result;
     let tempRecords =  result;
            tempRecords = tempRecords.map( row => {
               return {
           ...row,AssignedTo: row.Owner.Name,'Whoname': row.Who?.Name
           }
            })
            this.tasks= tempRecords;
    if(this.tasks.length==0){
          this.shownewcreategif=true;
        }
            this.dataFiltered=false;
              refreshApex(this.wiredTaskList);
             this.ToastMessageMethod('Tasks!','Refreshed successfully','success')

    })
    this.searchTerm=''
    }
  clearfilter() {
    const clearfilter = '';
    searchTasks({
      searchTerm: clearfilter
    })
      .then(result => {
        console.log('ressss' + result)
        let tempRecords = result;
        tempRecords = tempRecords.map(row => {
          return {
            ...row, AssignedTo: row.Owner.Name, 'Whoname': row.Who?.Name
          }
        })
        this.tasks = tempRecords;
        this.searchTerm=''
        this.dataFiltered = false;
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