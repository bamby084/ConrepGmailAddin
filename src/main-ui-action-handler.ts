import {NotificationService} from './notification-service';
import {MailImporter} from "./mail-importer";

function importEmailManually(e)
{
    var param = e.parameters;
    var accessToken = e.messageMetadata.accessToken;
    GmailApp.setCurrentMessageAccessToken(accessToken);
    var message = GmailApp.getMessageById(e.messageMetadata.messageId);

    var mailImporter = new MailImporter();
    var result = mailImporter.importEmail(message, param.requestMethod, param.apiMode);

    if(result.success == false)
    {
        return NotificationService.notify(`Import failed: ${result.message}`);
    }
    else
    {
        return NotificationService.notify("Import completed.");
    }
}