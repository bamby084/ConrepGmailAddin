import { Settings } from "./setting";
import {ApiInvokeMode, RequestMethod} from "./enum";
import {SettingService} from "./setting-service";
import { MailItemInfo } from "./mail-item-info";
import {MailHeader} from "./mail-header";
import {ApiResult} from "./api-result";
import {ImportSetting} from "./import-setting";
import {HttpStatusCode} from "./enum";

export class ApiHandler{
	
	public getConrepSettings(settings: Settings): ApiResult
	{
        var url:string = this.ensureHttps(settings.host) 
        + "/conrep/outlook/web/email_requests.php?RequestMethod=ValidateUserEmail"
         + "&UserName=" + encodeURIComponent(settings.user)
         + "&Password=" + encodeURIComponent(settings.password) 
         + "&CompanyId=" + settings.companyId 
         + "&Mode=" + ApiInvokeMode.Settings;

        var content = UrlFetchApp.fetch(url).getContentText();
		return this.parseResult(content);
    }

	public validateEmail(mail: GoogleAppsScript.Gmail.GmailMessage, 
		requestMethod: RequestMethod, apiMode: ApiInvokeMode): ApiResult
	{
		try
		{
			var settingService = new SettingService();
			var settings = settingService.getSettings();
			var userEmailAddress = Session.getEffectiveUser().getEmail();

			var url: string = this.ensureHttps(settings.host)
				+ "/conrep/outlook/web/email_requests.php?RequestMethod=ValidateUserEmail"
				+ "&UserName=" + encodeURIComponent(settings.user)
				+ "&Password=" + encodeURIComponent(settings.password)
				+ "&CompanyId=" + settings.companyId
				+ "&Mode=" + apiMode
				+ "&EmailType=" + requestMethod
				+ "&From=" + encodeURIComponent(mail.getFrom())
				+ "&MailId=" + encodeURIComponent(this.getMailId(mail))
				+ "&OutlookAccount=" + encodeURIComponent(userEmailAddress)
				+ "&MAC=" + this.getMACAddress();

			var payload = {
				MailItems: Array<MailItemInfo>()
			};

			var mailInfo = new MailItemInfo();
			mailInfo.from = mail.getFrom();
			mailInfo.to = mail.getTo();
			mailInfo.cc = mail.getCc();
			mailInfo.bcc = mail.getBcc();
			mailInfo.subject = mail.getSubject();
			mailInfo.headers = this.getMailHeaders(mail);

			payload.MailItems.push(mailInfo);

			var options = {
				method: "POST",
				contentType: "application/json",
				payload: JSON.stringify(payload)
			};
			
			var content = UrlFetchApp.fetch(url, options).getContentText();
			return this.parseResult(content);
		}
		catch(exception)
		{
			return ApiResult.failure(exception);
		}
	}

	public importEmails(importSettings: Array<ImportSetting>, token: string,
		  requestMethod: RequestMethod, apiMode: ApiInvokeMode): boolean
	{
		var settingService = new SettingService();
		var settings = settingService.getSettings();

		var url: string = this.ensureHttps(settings.host) +
			"/conrep/outlook/web/email_requests.php?" +
            `RequestMethod=${requestMethod}` +
            `&TransToken=${encodeURIComponent(token)}` +
			`&Mode=${apiMode}`;
		
		var emails: Array<MailItemInfo> = new Array<MailItemInfo>();
		var formData: any = {};		

		importSettings.forEach(function(importSetting: ImportSetting){
			var mailItemInfo = new MailItemInfo();
			mailItemInfo.mailItemId = this.getMailId(importSetting.mailItem);
			mailItemInfo.headers = this.getMailHeaders(importSetting.mailItem);

			if(importSetting.sendHeaderOnly == false)
			{
				mailItemInfo.htmlBody = importSetting.mailItem.getBody();
				if(importSetting.sendAttachments)
				{
					var attachments = importSetting.mailItem.getAttachments();
					attachments.forEach( attachment => {
						var name = attachment.getName();
						var fileName = `${name}::${mailItemInfo.mailItemId}`;
						
						if(attachment.getSize() < importSetting.maxAttachmentSize)
						{
							formData[name] = Utilities.newBlob(attachment.getBytes(), 
								attachment.getContentType(), fileName);
						}
					});
				}
			}

			emails.push(mailItemInfo);
		}.bind(this));
		
		var emailsBlob = Utilities.newBlob(JSON.stringify({ mailItems: emails}), "application/json");
		formData.emails = emailsBlob;
		
		var options = {
			method: "POST",
			payload: formData
		};

		var statusCode = UrlFetchApp.fetch(url, options).getResponseCode();
		return statusCode == HttpStatusCode.Ok;
	}

    public ensureHttps(url: string): string
    {
        if(url.indexOf("http://") == 0 || url.indexOf("https://") == 0)
            return url;

        return "https://" + url;
    }

	private parseResult(xml: string): ApiResult 
	{   
		try
		{ 
			var settings = new Settings();
			var xmlDoc = XmlService.parse(xml);
			var root = xmlDoc.getRootElement();

			if(root.getName() == "Message")
			{
				var errorMessage = root.getText();
				return ApiResult.failure(errorMessage);
			}

			settings.user = root.getChildText("UserDisplayName");
			settings.transToken = root.getChildText("TransToken");
			settings.sendData = this.parseBool(root.getChildText("SendData"));
			settings.sendAttachments = this.parseBool(root.getChildText("SendAttachments"));
			settings.maxAttachmentSize = parseInt(root.getChildText("MaxAttachmentSize"))*1024*1024;
			settings.postUrl = root.getChildText("PostUrl");
			settings.calendarSynchronizationInterval = parseInt(root.getChildText("CalendarSyncInterval"));
			settings.logIncomingEmails = this.parseBool(root.getChildText("LogIncomingEmails"));
			settings.logOutgoingEmails = this.parseBool(root.getChildText("LogOutgoingEmails"));
			settings.panelHeaderMessage = root.getChildText("PaneHeaderMessage");
			settings.panelFooterMessage = root.getChildText("PaneFooterMessage");
			settings.rightPanelName = root.getChildText("RightPaneName");
			settings.successMessage = root.getChildText("SuccessMessage");
			
			var emails = root.getChildText("EmailsAccounts");
			if(emails)
			{
				settings.emails = emails.split(";");
			}

			return ApiResult.success(settings);
		}
		catch(exception){
			return ApiResult.failure(exception);
		}
	}

	private parseBool(value: string): boolean
	{
		if(!value)
			return false;

		return value.toLowerCase() == "true";
	}

	private getMACAddress(): string
	{
		return '';
	}

	private parseMailHeaders(content: string): Array<MailHeader>
	{
		var regex = /^([-A-Za-z0-9]+)(:[ \t]*)(.*)/;
		var headersPart: string = content.split(/(\r\n){2,}/g)[0];
		
		var lines = headersPart.split(/\r\n/);
		var header: MailHeader;
		var headers: Array<MailHeader> = [];

		lines.forEach(function(line){
			var match = line.match(regex);
			if(match)
			{
				header = new MailHeader();
				header.key = match[1];
				header.value = match[3];

				headers.push(header);
			}
			else
			{
				if(header)
				{
					header.value += '\r\n' + line;
				}
			}
		});

		return headers;
	}

	public getMailId(mail: GoogleAppsScript.Gmail.GmailMessage)
	{
		return mail.getHeader("Message-ID").replace("<","").replace(">","");
	}

	private getMailHeaders(mail: GoogleAppsScript.Gmail.GmailMessage): Array<any>
	{
		var headers = this.parseMailHeaders(mail.getRawContent());
		var jsonHeaders = headers.map(header => {
			var result = {};
			result[header.key] = header.value;
		
			return result;
		});

		return jsonHeaders;
	}
}