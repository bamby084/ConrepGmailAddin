import { EmailImporter } from "./email-importer";

function importEmailManually(e)
{
    var param = e.parameters;
    var accessToken = e.messageMetadata.accessToken;
    GmailApp.setCurrentMessageAccessToken(accessToken);
    var message = GmailApp.getMessageById(e.messageMetadata.messageId);

    var emailImporter = new EmailImporter();
    return emailImporter.ImportEmail(message, param.requestMethod, param.apiMode);
}