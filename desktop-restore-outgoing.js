/********************************************************
 * 
 * Macro Author:      	William Mills
 *                    	Technical Solutions Specialist 
 *                    	wimills@cisco.com
 *                    	Cisco Systems
 * 
 * Version: 1-0-3
 * Released: 11/01/22
 * 
 * This is a simple Webex Devices Macro which shows your local desktop 
 * after an answered call has closed it.
 * 
 * Full Readme, source code and license agreement available on Github:
 * https://github.com/wxsd-sales/desktop-restore-macro
 * 
 ********************************************************/
import xapi from 'xapi';

/*********************************************************
 * Configure the settings below
**********************************************************/

const config = {
  showAlerts: true,         // true = show alert when the preview has been restored
  name: 'Preview Restore',   // The title text shown on the alert
  layout: 'Prominent'       
}

/*********************************************************
 * Below contains all the call event listeners
**********************************************************/

let callEvent = {}

// Once the call has been answered check if we should restore presentation
xapi.Event.CallSuccessful.on(async () => {
  const defaultSource = await xapi.Config.Video.Presentation.DefaultSource.get()
  alert('Restoring Pres Preview from default source: ' + defaultSource);
  xapi.Command.Presentation.Start({ 
      ConnectorId: defaultSource, 
      SendingMode: 'LocalOnly'
    });
});


function alert(message){
  console.log('Alert: ' + message);
  if(!config.showAlerts){return}
    xapi.Command.UserInterface.Message.Alert.Display(
    { Duration: 5, Text: message, Title: config.name });
}
