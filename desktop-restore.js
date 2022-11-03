import xapi from 'xapi';

const config = {
  showAlerts: true,         // true = show alert when the preview has been restored
  name: 'Preview Restore',   // The title text shown on the alert
  layout: 'Prominent'       
}

let callEvent = {}

// Monitor/record incoming calls
xapi.Event.IncomingCallIndication.on(event => {
  console.log('Incoming call, callId: ' +event.CallId)
  callEvent.callId = event.CallId;
})

// If Presentation is stopped while there is an incoming call, store the source
xapi.Event.PresentationPreviewStopped.on(event => {
  // Ignore events with no causes
  if(!event.hasOwnProperty('Cause'))
    return;
  if(event.Cause == 'userRequested' && callEvent.hasOwnProperty('callId')) {
    console.log('Pres. Preview Stopped while receiving call, storing local source: ' +event.LocalSource);
    callEvent.restore = event.LocalSource;
  }
})

// Once the call has been answered check if we should restore presentation
xapi.Event.CallSuccessful.on(event => {
  if(event.CallId == callEvent.callId && callEvent.hasOwnProperty('restore')){
    alert('Presentation stopped due to answering incoming call, restoring preview');
    xapi.Command.Presentation.Start(
    { ConnectorId: callEvent.restore, SendingMode: 'LocalOnly' });
    console.log('Restoring Pres Preview from source: ' + callEvent.restore)
    delete callEvent.restore;
    delete callEvent.callId;
  }
});

xapi.Event.CallDisconnect.on(() => {
  if(callEvent.hasOwnProperty('callId'))
    delete callEvent.callId;
});

function alert(message){
  console.log('Alert: ' + message);
  if(!config.showAlerts){return}
    xapi.Command.UserInterface.Message.Alert.Display(
    { Duration: 5, Text: message, Title: config.name });
}
