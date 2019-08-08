import { SettingService } from './setting-service';
import { RequestMethod, ApiInvokeMode } from './enum';
import { MailImporter } from "./mail-importer";

export class AddOnBuilder {
    private readonly PANEL_HEADER: string = "Email account associated with this email is not listed in your settings, to import email contents. Click button below to process the email contents."
    private readonly PANEL_FOOTER: string = "You can close this pane if you do not want to see this message.";

    public buildUI(mail: GoogleAppsScript.Gmail.GmailMessage) 
        :GoogleAppsScript.Card_Service.Card{

        var userEmailAddress = Session.getEffectiveUser().getEmail();
        var settingService = new SettingService();
        var settings = settingService.getSettings();
        var received = mail.getHeader("Received");
        var requestMethod = received ? RequestMethod.ReceiveEmail : RequestMethod.SendEmail;

        settings.emails.push("bamby084@gmail.com");

        if (settings.emails.indexOf(userEmailAddress) > -1) {
            var mailImporter = new MailImporter();
            var result = mailImporter.importEmail(mail, requestMethod, ApiInvokeMode.RightPane);
            var resultMessage: string = result.success ? "Import completed." : `Import failed: ${result.message}.`;

            if(result.success)
            {
                return this.buildImportResultCard(resultMessage, true, 
                    result.data.transToken, requestMethod, result.data.postUrl);
            }else
            {
                return this.buildImportResultCard(resultMessage);
            }
        }
        else {
            return this.buildProcessManuallyCard(requestMethod);
        }
    }

    public buildProcessManuallyCard(requestMethod: RequestMethod)
        : GoogleAppsScript.Card_Service.Card {

        var settingService = new SettingService();
        var settings = settingService.getSettings();

        var cardBuilder = CardService.newCardBuilder();
        var cardSection = CardService.newCardSection();
        var header = CardService.newTextParagraph()
            .setText(settings.panelHeaderMessage ? settings.panelHeaderMessage : this.PANEL_HEADER);
        var footer = CardService.newTextParagraph()
            .setText(settings.panelFooterMessage ? settings.panelFooterMessage : this.PANEL_FOOTER);

        var importAction = CardService.newAction()
            .setParameters({ requestMethod: requestMethod, apiMode: ApiInvokeMode.RightPane })
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

    public buildImportResultCard(message: string, hasOpenLinkButton: boolean = false, 
            token: string = null, requestMethod: RequestMethod = null, postUrl: string = null)
        :GoogleAppsScript.Card_Service.Card {

        var cardBuilder = CardService.newCardBuilder();
        var mainSection = CardService.newCardSection();

        var header = CardService.newTextParagraph().setText(message);
        mainSection.addWidget(header);
        
        if(hasOpenLinkButton)
        {
            var openLinkAction = CardService.newAction()
                .setParameters({token: token, requestMethod: requestMethod, url: postUrl})
                .setFunctionName("openConrepMailDetails");

            var openLinkButton = CardService.newTextButton()
                .setText("view details")
                .setOnClickAction(openLinkAction);
            mainSection.addWidget(openLinkButton);
        }
        
        cardBuilder.addSection(mainSection);
        return cardBuilder.build();
    }
}