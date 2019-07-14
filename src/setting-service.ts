import CardSection = GoogleAppsScript.Card_Service.CardSection;
import Card = GoogleAppsScript.Card_Service.Card;
import {Settings} from './setting';

export class SettingService
{
    private readonly TITLE: string = "Settings";
    private readonly IMAGE_URL: string = "https://gbl.conrep.com/office365/Images/conrep-settings.png";
    private readonly SETTING_KEY: string = "ConrepSettings";

    public buildCard(settings: Settings): Card
    {
        var cardHeader = CardService.newCardHeader();
        cardHeader.setTitle(this.TITLE);
        cardHeader.setImageUrl(this.IMAGE_URL);

        var loginSection = CardService.newCardSection();
        this.addInput(loginSection,"host", "Host/Login Url", settings.host);
        this.addInput(loginSection,"companyId","Company Id", settings.companyId);
        this.addInput(loginSection,"user", "User Name", settings.user);
        this.addInput(loginSection, "password", "Passwork Key", settings.password);
        this.addKeyValue(loginSection, "Auto sync calendar in", settings.calendarSynchronizationInterval + " minutes");

        var loggingSection = CardService.newCardSection();
        var emailGroup = CardService.newSelectionInput()
            .setType(CardService.SelectionInputType.DROPDOWN)
            .setTitle("Enable Auto-logging for following accounts")
            .setFieldName("emails")
        
        if(settings.emails.length == 0)
        {
            emailGroup.addItem("","", false);
        }
        else
        {
            settings.emails.forEach((email,index) => {
                emailGroup.addItem(email, email, index == 0);
            });
        }

        var loggingGroup = CardService.newSelectionInput()
            .setType(CardService.SelectionInputType.CHECK_BOX)
            .setFieldName("loggingOptions")
            .addItem("Automatically log incoming emails", "logIncoming", settings.logIncomingEmails)
            .addItem("Automatically log outgoing emails", "logOutgoing", settings.logOutgoingEmails);
    
        loggingSection.addWidget(emailGroup);
        loggingSection.addWidget(loggingGroup);

        var validateAction = CardService.newAction().setFunctionName('onUpdateSettings');
        var validateButton = CardService.newTextButton()
            .setText("Update Settings")
            .setOnClickAction(validateAction);
    
        var cancelAction = CardService.newAction().setFunctionName('onCancel');
        var cancelButton = CardService.newTextButton()
            .setText("Cancel")
            .setOnClickAction(cancelAction);
    
        var saveAction = CardService.newAction().setFunctionName('onSaveSettings');
        var okButton = CardService.newTextButton()
            .setText("Save")
            .setOnClickAction(saveAction);
    
        var buttonSet = CardService.newButtonSet()
            .addButton(validateButton)
            .addButton(cancelButton)
            .addButton(okButton);
    
        var buttonSection = CardService.newCardSection();
        buttonSection.addWidget(buttonSet);

        var card = CardService.newCardBuilder()
        .setHeader(cardHeader)
        .addSection(loginSection)
        .addSection(loggingSection)
        .addSection(buttonSection)
        .build();
        
        return card;
        
    }

    private addInput(section: CardSection, fieldName: string, title: string, defaultValue: string = ''): CardSection
    {
        var input = CardService.newTextInput()
        .setFieldName(fieldName)
        .setTitle(title)
        .setValue(defaultValue);
        
        return section.addWidget(input);
    }

    private addKeyValue(section: CardSection, key: string, value: string): CardSection
    {
        var input = CardService.newKeyValue()
            .setTopLabel(key)
            .setContent(value);
    
        return section.addWidget(input);
    }
        
    public saveSettings(settings: Settings){
        UserProperties.setProperty(this.SETTING_KEY, JSON.stringify(settings));
    }

    public getSettings(): Settings{
        var settings = UserProperties.getProperty(this.SETTING_KEY);
        if(settings)
        {
            return JSON.parse(settings);
        }
        else
        {
            return new Settings();
        }
    }

    public setCachedSettings(settings: Settings){
        var cache = CacheService.getUserCache();
        cache.put(this.SETTING_KEY, JSON.stringify(settings));
    }

    public getCachedSettings(): Settings
    {
        var cache = CacheService.getUserCache();
        var settings = cache.get(this.SETTING_KEY);

        if(settings)
        {
            return JSON.parse(settings);
        }
        else
        {
            return new Settings();
        }
    }
}