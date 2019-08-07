import {SettingService} from './setting-service';
import { RequestMethod, ApiInvokeMode } from './enum';
import { ApiHandler } from './api-handler';
import { ApiResult } from './api-result';
import { ImportSetting } from './import-setting';

export class EmailImporter
{
    private readonly PANEL_HEADER: string = "Email account associated with this email is not listed in your settings, to import email contents. Click button below to process the email contents." 
    private readonly PANEL_FOOTER: string = "You can close this pane if you do not want to see this message.";

    public checkAndImportEmail(mail: GoogleAppsScript.Gmail.GmailMessage)
    {
        var userEmailAddress = Session.getEffectiveUser().getEmail();
        var settingService = new SettingService();
        var settings = settingService.getSettings();
        var received = mail.getHeader("Received");
        var requestMethod = received? RequestMethod.ReceiveEmail: RequestMethod.SendEmail;

        if(settings.emails.indexOf(userEmailAddress) > -1)
        {
            this.importEmail(mail, requestMethod, ApiInvokeMode.RightPane);
        }
        else
        {
            var cardBuilder = CardService.newCardBuilder();
            var cardSection = CardService.newCardSection();
            var header = CardService.newTextParagraph()
                .setText(settings.panelHeaderMessage?settings.panelHeaderMessage:this.PANEL_HEADER);
            var footer = CardService.newTextParagraph()
                .setText(settings.panelFooterMessage?settings.panelFooterMessage:this.PANEL_FOOTER);
            
            var importAction = CardService.newAction()
                .setParameters({requestMethod: requestMethod, apiMode: ApiInvokeMode.RightPane})
                .setFunctionName("importEmailManually");
            var importButton = CardService.newTextButton()
                .setText("Process Email Contents")
                .setOnClickAction(importAction);
            
            cardSection.addWidget(header);
            cardSection.addWidget(importButton);
            cardSection.addWidget(footer);
            cardBuilder.addSection(cardSection);
            
            return cardBuilder.build();
        }
    }

    public importEmail(mail: GoogleAppsScript.Gmail.GmailMessage, 
        requestMethod: RequestMethod,
        apiMode: ApiInvokeMode): ApiResult
    {
        var apiHandler = new ApiHandler();
        var validateResult = apiHandler.validateEmail(mail, requestMethod, apiMode);
        
        if(validateResult.success == false)
            return ApiResult.failure(validateResult.message);

        if(validateResult.data.sendData)
        {
            var importSetting = new ImportSetting();
            importSetting.mailItem = mail;
            importSetting.sendHeaderOnly = false;
            importSetting.sendAttachments = validateResult.data.sendAttachments;
            importSetting.maxAttachmentSize = validateResult.data.maxAttachmentSize;

            var importSettings = new Array<ImportSetting>();
            importSettings.push(importSetting);

            apiHandler.importEmails(importSettings, validateResult.data.transToken, requestMethod, apiMode);
        }

        if(apiMode == ApiInvokeMode.RightPane)
        {
            this.showEmailDetails();
        }

        return ApiResult.success();
    }

    public showEmailDetails(){

    }
}