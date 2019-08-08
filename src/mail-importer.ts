
import {SettingService} from './setting-service';
import { RequestMethod, ApiInvokeMode } from './enum';
import { ApiHandler } from './api-handler';
import { ApiResult } from './api-result';
import { ImportSetting } from './import-setting';

export class MailImporter
{
    public importEmail(mail: GoogleAppsScript.Gmail.GmailMessage, 
        requestMethod: RequestMethod,
        apiMode: ApiInvokeMode): ApiResult
    {
        var settingService = new SettingService();
        var settings = settingService.getSettings();

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
            var baseUrl: string = settings.host;
            if(validateResult.data.postUrl)
                baseUrl = validateResult.data.postUrl;
            
            apiHandler.showEmailDetails(mail, validateResult.data.transToken, requestMethod, baseUrl);
        }

        return ApiResult.success();
    } 
}