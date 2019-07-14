
import CardSection = GoogleAppsScript.Card_Service.CardSection;
import {SettingService} from './setting-service';
import {EmailImporter} from './email-importer';

function buildAddOn(event){   
    var accessToken = event.messageMetadata.accessToken;
    GmailApp.setCurrentMessageAccessToken(accessToken);
    var messageId = event.messageMetadata.messageId;
    var message = GmailApp.getMessageById(messageId);

    var mailImporter = new EmailImporter();
    var resultCard = mailImporter.CheckAndImportEmail(message);
    
    return [resultCard];
}



