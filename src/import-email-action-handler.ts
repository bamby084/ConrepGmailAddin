import { EmailImporter } from "./email-importer";
import {NotificationService} from './notification-service';

function importEmailManually(e)
{
    var param = e.parameters;
    var accessToken = e.messageMetadata.accessToken;
    GmailApp.setCurrentMessageAccessToken(accessToken);
    var message = GmailApp.getMessageById(e.messageMetadata.messageId);

    var emailImporter = new EmailImporter();
    var result = emailImporter.importEmail(message, param.requestMethod, param.apiMode);

    if(result.success == false)
    {
        return NotificationService.notify(`Import failed: ${result.message}`);
    }
    else
    {
        return NotificationService.notify("Import completed.");
    }
}