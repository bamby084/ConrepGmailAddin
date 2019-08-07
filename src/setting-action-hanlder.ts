import {SettingService} from './setting-service';
import {Settings} from './setting';
import {ApiHandler} from './api-handler';
import {NotificationService} from "./notification-service";

function showSettings(event){
    return CardService.newUniversalActionResponseBuilder()
         .displayAddOnCards([createSettingCard()])
         .build();
}

function onSaveSettings(e){    
    var settingService = new SettingService();
    var settings = settingService.getCachedSettings();
    var userSettings = getInputSettings(e.formInput);

    settings.host = userSettings.host;
    settings.companyId = userSettings.companyId;
    settings.user = userSettings.user;
    settings.password = userSettings.password;
            
    var settingService = new SettingService();
    settingService.saveSettings(settings);

    var navigation = CardService.newNavigation().popToRoot();
    var notification = CardService.newNotification()
        .setText("Settings saved successfully!");

    return CardService.newActionResponseBuilder()
        .setNavigation(navigation)
        .setNotification(notification)
        .build();
}

function onCancel(e)
{
    var navigation = CardService.newNavigation().popToRoot();

    return CardService.newActionResponseBuilder()
        .setNavigation(navigation)
        .build();
}

function onUpdateSettings(e){
    var userSettings = getInputSettings(e.formInput);
    var apiHanler = new ApiHandler();
    
    var result = apiHanler.getConrepSettings(userSettings);
    if(!result.success)
    {
        return NotificationService.notify(result.message);
    }

    var settings  = result.data;
    settings.user = userSettings.user;
    settings.host = userSettings.host;
    settings.companyId = userSettings.companyId;
    settings.password = userSettings.password;

    var settingService = new SettingService();
    settingService.setCachedSettings(settings);
    
    var card = settingService.buildCard(settings);
    var navigation = CardService.newNavigation().updateCard(card);
    var notification = CardService.newNotification()
        .setText(settings.successMessage?settings.successMessage:"Settings updated successfully!");

    return CardService.newActionResponseBuilder()
        .setNavigation(navigation)
        .setNotification(notification)
        .build();
}

function createSettingCard(){
    var settingService = new SettingService();
    var settings = settingService.getSettings();
    settingService.setCachedSettings(settings);

    return settingService.buildCard(settings);
}

function getInputSettings(formData): Settings
{
    var settings = new Settings();
    
    settings.host = formData.host;
    settings.companyId = formData.companyId;
    settings.user = formData.user;
    settings.password = formData.password;

    return settings;
}