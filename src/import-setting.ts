
export class ImportSetting
{
    public mailItem: GoogleAppsScript.Gmail.GmailMessage;
    public sendAttachments: boolean;
    public maxAttachmentSize: number;
    public sendHeaderOnly: boolean;
}