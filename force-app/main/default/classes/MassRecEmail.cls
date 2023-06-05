public class MassRecEmail {
    @AuraEnabled
    public static string sendEmail( List<Id> recordIds, String UserId){
        String FinalResult;
        User Usr=[SELECT Id,Name, Email FROM User WHERE Id =:UserId];
        List<String> emailAddress = new List<String>();
		emailAddress.add(usr.Email);
        String ReciptentName=usr.Name;
        List<Account> Acc =[SELECT Id,Name,Type FROM Account WHERE Id =:recordIds];
		String subject='List Of Account Records';
        String HTMLbody='<table style="width: 100%;border-collapse: collapse;"><thead><tr>';
        HTMLbody+='<th style=" background-color: rgb(3, 179, 0);"><strong><span style="color: rgb(255, 255, 255);">Account Id</span></strong></th>';
        HTMLbody+='<th style=" background-color: rgb(3, 179, 0);"><strong><span style="color: rgb(255, 255, 255);">Account Name</span></strong></th>';
        HTMLbody+='<th style=" background-color: rgb(3, 179, 0);"><strong><span style="color: rgb(255, 255, 255);">Account Type</span></strong></th></tr></thead><tbody>';
        for(Account AccRec:Acc){
           String accid=AccRec.Id;
           String accName=AccRec.Name;
           String accType=AccRec.Type;
        HTMLbody+='<tr><td style="width: 33.3333%;"><div style="text-align: center;">'+accid+'</div></td>';
        HTMLbody+='<td style="width: 33.3333%;"><div style="text-align: center;">'+accName+'</div></td>';
        HTMLbody+='<td style="width: 33.3333%;"><div style="text-align: center;">'+accType+'</div></td></tr>';
        }
         HTMLbody+='</tbody></table>'; 
        Messaging.SingleEmailMessage msg= new Messaging.SingleEmailMessage();
        msg.setHtmlBody(HTMLbody);
        msg.setSubject(subject);
        msg.setToAddresses(emailAddress);
        try{
       
        Messaging.SendEmailResult[] results = Messaging.sendEmail(new Messaging.SingleEmailMessage[] { msg });
        FinalResult='Success';
        }
        catch(Exception ex){
            FinalResult=ex.getLineNumber()+'\n'+ex.getCause()+'\n'+ex.getMessage()+'\n'+ex.getStackTraceString();
        }
        return FinalResult;
    }
        
}