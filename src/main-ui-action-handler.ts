import { MailImporter } from "./mail-importer";
import { AddOnBuilder } from "./main-ui";
import {RequestMethod} from "./enum";
import {SettingService} from "./setting-service";
import {ApiHandler} from "./api-handler";
import ActionResponse = GoogleAppsScript.Card_Service.ActionResponse;

function importEmailManually(e): ActionResponse {
    var param = e.parameters;
    var accessToken = e.messageMetadata.accessToken;
    GmailApp.setCurrentMessageAccessToken(accessToken);
    var mail = GmailApp.getMessageById(e.messageMetadata.messageId);

    var mailImporter = new MailImporter();
    var result = mailImporter.importEmail(mail, param.requestMethod, param.apiMode);
    var resultMessage: string = result.success ? "Import completed." : `Import failed: ${result.message}.`;
    
    var addOnBuilder = new AddOnBuilder();
    var card = addOnBuilder.buildImportResultCard(resultMessage);
    var navigation = CardService.newNavigation().pushCard(card);

    var responseBuilder = CardService.newActionResponseBuilder()
        .setNavigation(navigation)
        .setNotification(CardService.newNotification()
            .setText(resultMessage))
        .setStateChanged(true);
    
    if(result.success)
    {
        var emailDetailsUrl = generateEmailDetailsUrl(mail, result.data.transToken, 
            param.requestMethod, result.data.postUrl);
        
        responseBuilder.setOpenLink(CardService.newOpenLink()
            .setUrl(emailDetailsUrl)
            .setOpenAs(CardService.OpenAs.OVERLAY)
            .setOnClose(CardService.OnClose.NOTHING));
    }

    return responseBuilder.build();
}

function openConrepMailDetails(e): ActionResponse{
    var param = e.parameters;
    var accessToken = e.messageMetadata.accessToken;
    GmailApp.setCurrentMessageAccessToken(accessToken);
    var mail = GmailApp.getMessageById(e.messageMetadata.messageId);

    var url = generateEmailDetailsUrl(mail, param.token, param.requestMethod, param.url);
    var response = CardService.newActionResponseBuilder()
        .setOpenLink(CardService.newOpenLink()
            .setUrl(url)
            .setOnClose(CardService.OnClose.NOTHING)
            .setOpenAs(CardService.OpenAs.OVERLAY)
        ).build();
    
    return response;    
}

function generateEmailDetailsUrl(mail: GoogleAppsScript.Gmail.GmailMessage,
    token: string, requestMethod: RequestMethod, postUrl: string) {

    var settingService = new SettingService();
    var settings = settingService.getSettings();
    
    var baseUrl: string = settings.host
    if(postUrl)
        baseUrl = postUrl;
    
    var apiHandler = new ApiHandler();    
    var url: string = apiHandler.ensureHttps(baseUrl)
        + "/conrep/outlook/web/email_details.php?"
        + `MessageId=${encodeURIComponent(apiHandler.getMailId(mail))}`
        + `"&TransToken=${encodeURIComponent(token)}`
        + `&EmailType=${requestMethod}`;

    return url;    
}

