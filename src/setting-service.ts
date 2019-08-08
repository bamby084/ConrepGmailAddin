import {Settings} from './setting';

export class SettingService
{
    private readonly SETTING_KEY: string = "ConrepSettings";
        
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