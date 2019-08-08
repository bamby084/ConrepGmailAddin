import {SettingService} from './setting-service';
import { RequestMethod, ApiInvokeMode } from './enum';
import {MailImporter} from "./mail-importer";

export class AddOnBuilder
{
    private readonly PANEL_HEADER: string = "Email account associated with this email is not listed in your settings, to import email contents. Click button below to process the email contents." 
    private readonly PANEL_FOOTER: string = "You can close this pane if you do not want to see this message.";

    public buildUI(mail: GoogleAppsScript.Gmail.GmailMessage)
    {
        var userEmailAddress = Session.getEffectiveUser().getEmail();
        var settingService = new SettingService();
        var settings = settingService.getSettings();
        var received = mail.getHeader("Received");
        var requestMethod = received? RequestMethod.ReceiveEmail: RequestMethod.SendEmail;
        
        if(settings.emails.indexOf(userEmailAddress) > -1)
        {
            var mailImporter = new MailImporter();
            mailImporter.importEmail(mail, requestMethod, ApiInvokeMode.RightPane);
        }
        else
        {
            return this.buildProcessManuallyCard(requestMethod);
        }
    }

    private buildProcessManuallyCard(requestMethod: RequestMethod)
        :GoogleAppsScript.Card_Service.Card
    {
        var settingService = new SettingService();
        var settings = settingService.getSettings();

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