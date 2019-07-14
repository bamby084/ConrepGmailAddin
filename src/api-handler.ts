import { Settings } from "./setting";
import {ApiInvokeMode, RequestMethod} from "./enum";
import {SettingService} from "./setting-service";
import { MailItemInfo } from "./mail-item-info";

export class ApiHandler{

	public getConrepSettings(settings: Settings): Settings
	{
        var url:string = this.ensureHttps(settings.host) 
        + "/conrep/outlook/web/email_requests.php?RequestMethod=ValidateUserEmail"
         + "&UserName=" + encodeURIComponent(settings.user)
         + "&Password=" + encodeURIComponent(settings.password) 
         + "&CompanyId=" + settings.companyId 
         + "&Mode=" + ApiInvokeMode.Settings;

        var content = UrlFetchApp.fetch(url).getContentText();
		return this.parseXmlSettings(content);
    }

	public validateEmail(mail: GoogleAppsScript.Gmail.GmailMessage, requestMethod: RequestMethod, apiMode: ApiInvokeMode)
	{
		var settingService = new SettingService();
		var settings = settingService.getSettings();
		var userEmailAddress = Session.getEffectiveUser().getEmail();
		settings.host = "https://enjnkzdxygkmi.x.pipedream.net/";
		var url: string = this.ensureHttps(settings.host)
			+ "/conrep/outlook/web/email_requests.php?RequestMethod=ValidateUserEmail"
			+ "&UserName=" + encodeURIComponent(settings.user)
			+ "&Password=" + encodeURIComponent(settings.password)
			+ "&CompanyId=" + settings.companyId
			+ "&Mode=" + apiMode
			+ "&EmailType=" + requestMethod
			+ "&From=" + encodeURIComponent(mail.getFrom())
			+ "&MailId=" + encodeURIComponent(mail.getHeader("Message-ID").replace("<","").replace(">",""))
			+ "&OutlookAccount=" + encodeURIComponent(userEmailAddress)
			+ "&MAC=" + this.getMACAddress();

		var payload = {
			MailItems: Array<MailItemInfo>()
		};

		var mailInfo = new MailItemInfo();
		mailInfo.From = mail.getFrom();
		mailInfo.To = mail.getTo();
		mailInfo.CC = mail.getCc();
		mailInfo.BCC = mail.getBcc();
		mailInfo.Subject = mail.getSubject();
		mailInfo.Headers = this.parseMailHeaders(mail.getRawContent());
		payload.MailItems.push(mailInfo);

		var options = {
		 	method: "POST",
		 	contentType: "application/json",
		 	payload: JSON.stringify(payload)
		 };
		
		var content = UrlFetchApp.fetch(url, options).getContentText();
		var settings = this.parseXmlSettings(content);
		Logger.log(settings);
	}

    private ensureHttps(url: string): string
    {
        if(url.indexOf("http://") == 0 || url.indexOf("https://") == 0)
            return url;

        return "https://" + url;
    }

	private parseXmlSettings(xml: string): Settings 
	{   
		try
		{ 
			var settings = new Settings();
			var xmlDoc = XmlService.parse(xml);
			var root = xmlDoc.getRootElement();

			if(root.getName() == "Message")
				return null;

			settings.user = root.getChildText("UserDisplayName");
			settings.transToken = root.getChildText("TransToken");
			settings.sendData = this.parseBool(root.getChildText("SendData"));
			settings.sendAttachments = this.parseBool(root.getChildText("SendAttachments"));
			settings.maxAttachmentSize = parseInt(root.getChildText("MaxAttachmentSize"));
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

			return settings;
		}
		catch{
			return null;
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

	private parseMailHeaders(content: string)
	{
		var headersPart: string = content.split(/(\r\n){2,}/g)[0];
	}
}