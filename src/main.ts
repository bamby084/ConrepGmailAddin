
import {AddOnBuilder} from './main-ui';
import {SettingPageBuilder} from "./setting-page";
import {SettingService} from "./setting-service";

//entry point
function buildAddOn(event){   
    var accessToken = event.messageMetadata.accessToken;
    GmailApp.setCurrentMessageAccessToken(accessToken);
    var messageId = event.messageMetadata.messageId;
    var message = GmailApp.getMessageById(messageId);

    var addOnBuilder = new AddOnBuilder();
    var resultCard = addOnBuilder.buildUI(message);
    
    return [resultCard];
}

function showSettings(event){
    var settingService = new SettingService();
    var settings = settingService.getSettings();
    settingService.setCachedSettings(settings);

    var settingPageBuilder = new SettingPageBuilder();
    var uiCard = settingPageBuilder.buildCard(settings);

    return CardService.newUniversalActionResponseBuilder()
         .displayAddOnCards([uiCard])
         .build();
}



