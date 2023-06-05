import { LightningElement,wire,track } from 'lwc';
import TASKS from '@salesforce/apex/getAllTasks.getAllTaskRecs'
import { refreshApex } from '@salesforce/apex';
const COLUMNS =[
    {label:'Subject', fieldName:'Subject',type:'text'},
    {label:'Priority', fieldName:'Priority',type:'text'},
    {label:'Due Date', fieldName:'ActivityDate', type:"Date",
    typeAttributes: {
    day: "numeric",
    month: "numeric",
    year: "numeric"
}},
    {label:'Status', fieldName:'Status',type:'text'},
     {label:'Assigned To', fieldName:'Owner.Name',type:'text'}



]
export default class ActivityTab extends LightningElement {
    @track tasks;
    error;
    newTask=false;
    columns=COLUMNS;
     
    @wire (TASKS)
    
    gettasks({data,error}){
        if(data){
            this.tasks=data;
            console.log('this.tasks'+JSON.stringify(this.tasks))
            
        }
        else if (error){
             this.error=error;
        }
    }
    createNewTask(){
        this.newTask=true;
    }
}