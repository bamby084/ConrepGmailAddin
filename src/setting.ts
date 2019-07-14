export class Settings
{
    public host: string = ''
    public companyId: string = ''
    public user: string = ''
    public password: string = ''
    public calendarSynchronizationInterval: number = 30
    public emails: Array<string> = []
    public logIncomingEmails: boolean = false
    public logOutgoingEmails: boolean = false
    public panelHeaderMessage: string = ''
    public panelFooterMessage: string = ''
    public postUrl: string = ''
    public rightPanelName: string = 'Conrep'
    public successMessage: string = ''
    public transToken: string = ''
    public sendData: boolean = false
    public sendAttachments: boolean = false
    public maxAttachmentSize: number = 5
}